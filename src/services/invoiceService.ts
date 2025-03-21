
import { supabase } from "@/integrations/supabase/client";
import { Invoice, InvoiceItem } from "@/types";

/**
 * Validates if a string is a valid UUID
 */
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Handles mock or sample projects which may use numeric IDs instead of UUIDs
 * Creates a consistent mock UUID to ensure referential integrity
 */
const handleMockProjectId = (projectId: string): string => {
  // Return the UUID as-is if it's already a valid UUID
  if (isValidUUID(projectId)) {
    return projectId;
  }
  
  // If we're using sample data with numeric IDs (like '1'), 
  // create a deterministic UUID based on that ID
  if (/^\d+$/.test(projectId)) {
    // Simple numeric ID to mock UUID conversion that's consistent
    const paddedId = projectId.padStart(3, '0');
    const mockUUID = `00000000-0000-4000-a000-000000${paddedId}`;
    
    console.log(`Converting numeric project ID to mock UUID: ${projectId} -> ${mockUUID}`);
    return mockUUID;
  }
  
  // If not a valid UUID and not a numeric ID, return as-is (though this should be rare)
  console.warn(`Invalid project ID format: ${projectId}`);
  return projectId;
};

/**
 * Generates an invoice for a project
 */
export const generateInvoice = async (projectId: string): Promise<Invoice | null> => {
  try {
    const safeProjectId = handleMockProjectId(projectId);
    console.log(`Generating invoice for project ID: ${projectId} (safe ID: ${safeProjectId})`);
    
    // First check if the project exists in the projects table
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, name, client_id')
      .eq('id', safeProjectId)
      .single();
    
    if (projectError) {
      console.error("Project not found:", projectError);
      
      // If it's a development environment, create a sample project
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        console.log("In development mode, creating sample project");
        const { data: insertData, error: insertError } = await supabase
          .from('projects')
          .insert({
            id: safeProjectId,
            name: `Sample Project ${projectId}`,
            client_id: null,
            status: 'active',
            start_date: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          console.error("Error creating sample project:", insertError);
          throw new Error(`Failed to create sample project: ${insertError.message}`);
        }
        
        console.log("Sample project created successfully:", insertData);
      } else {
        console.error("Project not found in production environment");
        throw new Error("Project not found");
      }
    }
    
    try {
      // Call the database function to generate the invoice
      console.log(`Calling create_invoice_for_project with project_id: ${safeProjectId}`);
      const { data, error } = await supabase.rpc('create_invoice_for_project', {
        project_id_param: safeProjectId,
        invoice_date: new Date().toISOString()
      });
  
      if (error) {
        console.error("Error generating invoice:", error);
        throw new Error(`Failed to generate invoice: ${error.message}`);
      }
  
      console.log("Invoice generated successfully, ID:", data);
      
      // Fetch the newly generated invoice with its items
      if (data) {
        return await getInvoiceById(data);
      }
    } catch (error: any) {
      console.error("Error calling create_invoice_for_project:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return null;
  } catch (error: any) {
    console.error("Error in generateInvoice:", error);
    throw error;
  }
};

export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
  try {
    // Fetch the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) {
      console.error("Error fetching invoice:", invoiceError);
      throw invoiceError;
    }

    // Fetch the invoice items
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
      throw itemsError;
    }

    // Format the invoice
    const invoice: Invoice = {
      id: invoiceData.id,
      projectId: invoiceData.project_id,
      invoiceNumber: invoiceData.invoice_number,
      amount: invoiceData.amount,
      status: invoiceData.status as Invoice['status'],
      issueDate: new Date(invoiceData.issue_date),
      dueDate: invoiceData.due_date ? new Date(invoiceData.due_date) : undefined,
      sentDate: invoiceData.sent_date ? new Date(invoiceData.sent_date) : undefined,
      paidDate: invoiceData.paid_date ? new Date(invoiceData.paid_date) : undefined,
      notes: invoiceData.notes,
      items: itemsData.map((item) => ({
        id: item.id,
        invoiceId: item.invoice_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        amount: item.amount,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })),
      createdAt: new Date(invoiceData.created_at),
      updatedAt: new Date(invoiceData.updated_at)
    };

    return invoice;
  } catch (error) {
    console.error("Error in getInvoiceById:", error);
    throw error;
  }
};

export const getProjectInvoices = async (projectId: string): Promise<Invoice[]> => {
  try {
    const safeProjectId = handleMockProjectId(projectId);
    console.log(`Fetching invoices for project ID: ${projectId} (safe ID: ${safeProjectId})`);
    
    // Fetch all invoices for the project
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('project_id', safeProjectId)
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error("Error fetching project invoices:", invoicesError);
      throw invoicesError;
    }

    // If there are no invoices, return an empty array
    if (!invoicesData || invoicesData.length === 0) {
      return [];
    }

    // Fetch all invoice items for these invoices
    const invoiceIds = invoicesData.map(invoice => invoice.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .in('invoice_id', invoiceIds);

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
      throw itemsError;
    }

    // Group items by invoice id
    const itemsByInvoiceId = itemsData.reduce<Record<string, InvoiceItem[]>>((acc, item) => {
      if (!acc[item.invoice_id]) {
        acc[item.invoice_id] = [];
      }
      acc[item.invoice_id].push({
        id: item.id,
        invoiceId: item.invoice_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        amount: item.amount,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      });
      return acc;
    }, {});

    // Format and return the invoices with their items
    return invoicesData.map(invoice => ({
      id: invoice.id,
      projectId: invoice.project_id,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.amount,
      status: invoice.status as Invoice['status'],
      issueDate: new Date(invoice.issue_date),
      dueDate: invoice.due_date ? new Date(invoice.due_date) : undefined,
      sentDate: invoice.sent_date ? new Date(invoice.sent_date) : undefined,
      paidDate: invoice.paid_date ? new Date(invoice.paid_date) : undefined,
      notes: invoice.notes,
      items: itemsByInvoiceId[invoice.id] || [],
      createdAt: new Date(invoice.created_at),
      updatedAt: new Date(invoice.updated_at)
    }));
  } catch (error) {
    console.error("Error in getProjectInvoices:", error);
    throw error;
  }
};

export const updateInvoiceStatus = async (
  invoiceId: string, 
  status: Invoice['status'], 
  notes?: string
): Promise<void> => {
  try {
    const updates: Record<string, any> = { status };
    
    // Add date fields based on status
    if (status === 'sent') {
      updates.sent_date = new Date().toISOString();
    } else if (status === 'paid') {
      updates.paid_date = new Date().toISOString();
    }
    
    if (notes !== undefined) {
      updates.notes = notes;
    }

    const { error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId);

    if (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateInvoiceStatus:", error);
    throw error;
  }
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteInvoice:", error);
    throw error;
  }
};
