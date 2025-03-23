
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  issueDate: Date;
  dueDate: Date;
  sentDate?: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export async function getInvoices(): Promise<Invoice[]> {
  try {
    // Get all invoices with their related projects and clients
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        projects:project_id (
          name,
          clients:client_id (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(invoice => ({
      id: invoice.id,
      projectId: invoice.project_id,
      projectName: invoice.projects?.name || 'Unknown Project',
      clientName: invoice.projects?.clients?.name || 'Unknown Client',
      invoiceNumber: invoice.invoice_number,
      amount: invoice.amount,
      status: invoice.status,
      issueDate: new Date(invoice.issue_date),
      dueDate: new Date(invoice.due_date),
      sentDate: invoice.sent_date ? new Date(invoice.sent_date) : undefined,
      paidDate: invoice.paid_date ? new Date(invoice.paid_date) : undefined,
      notes: invoice.notes,
      createdAt: new Date(invoice.created_at),
      updatedAt: new Date(invoice.updated_at)
    }));
  } catch (error) {
    console.error('Error in getInvoices:', error);
    toast({
      title: "Error fetching invoices",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export async function getInvoiceById(id: string): Promise<{invoice: Invoice, items: InvoiceItem[]} | null> {
  try {
    // Get the invoice with project and client data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        projects:project_id (
          name,
          clients:client_id (
            name
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoice) return null;

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);

    if (itemsError) throw itemsError;

    return {
      invoice: {
        id: invoice.id,
        projectId: invoice.project_id,
        projectName: invoice.projects?.name || 'Unknown Project',
        clientName: invoice.projects?.clients?.name || 'Unknown Client',
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        status: invoice.status,
        issueDate: new Date(invoice.issue_date),
        dueDate: new Date(invoice.due_date),
        sentDate: invoice.sent_date ? new Date(invoice.sent_date) : undefined,
        paidDate: invoice.paid_date ? new Date(invoice.paid_date) : undefined,
        notes: invoice.notes,
        createdAt: new Date(invoice.created_at),
        updatedAt: new Date(invoice.updated_at)
      },
      items: items.map(item => ({
        id: item.id,
        invoiceId: item.invoice_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        amount: item.amount
      }))
    };
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    toast({
      title: "Error fetching invoice",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function createInvoice(projectId: string): Promise<string | null> {
  try {
    // Call the create_invoice_for_project function
    const { data, error } = await supabase
      .rpc('create_invoice_for_project', {
        project_id_param: projectId
      });

    if (error) {
      console.error('Error in database function:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Invoice creation successful:', data);
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    toast({
      title: "Error creating invoice",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateInvoiceStatus(id: string, status: string): Promise<boolean> {
  try {
    const updates: any = { status };
    
    // Add relevant date fields based on status
    if (status === 'sent' && !await hasInvoiceSentDate(id)) {
      updates.sent_date = new Date().toISOString();
    } else if (status === 'paid' && !await hasInvoicePaidDate(id)) {
      updates.paid_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    toast({
      title: "Error updating invoice",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}

// Helper function to check if invoice already has sent_date
async function hasInvoiceSentDate(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('invoices')
    .select('sent_date')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking invoice sent date:', error);
    return false;
  }
  
  return data?.sent_date != null;
}

// Helper function to check if invoice already has paid_date
async function hasInvoicePaidDate(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('invoices')
    .select('paid_date')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking invoice paid date:', error);
    return false;
  }
  
  return data?.paid_date != null;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    toast({
      title: "Error deleting invoice",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}
