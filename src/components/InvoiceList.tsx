
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Invoice, Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, FileText, Trash, RefreshCw } from "lucide-react";
import { generateInvoice, getProjectInvoices, updateInvoiceStatus, deleteInvoice } from "@/services/invoiceService";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InvoiceListProps {
  project: Project;
}

const InvoiceList = ({ project }: InvoiceListProps) => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Loading invoices for project ${project.id}`);
      const data = await getProjectInvoices(project.id);
      setInvoices(data);
      setDataFetched(true);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError("Could not load invoices. Please try again.");
      toast({
        title: "Error",
        description: "Could not load invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load invoices when component mounts
  useEffect(() => {
    if (!dataFetched && !isLoading) {
      loadInvoices();
    }
  }, [project.id, dataFetched, isLoading]);

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const invoice = await generateInvoice(project.id);
      if (invoice) {
        setInvoices(prev => [invoice, ...prev]);
        toast({
          title: "Success",
          description: `Invoice ${invoice.invoiceNumber} generated successfully.`,
        });
      }
    } catch (err) {
      console.error("Error generating invoice:", err);
      setError("Could not generate invoice. Please try again.");
      toast({
        title: "Error",
        description: "Could not generate invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    setIsSending({ ...isSending, [invoice.id]: true });
    setError(null);
    
    try {
      // Call the Edge Function to send the invoice
      const { error } = await supabase.functions.invoke("send-invoice", {
        body: {
          invoiceId: invoice.id,
          clientEmail: project.clientName,
          clientName: project.clientName,
          projectName: project.name
        }
      });

      if (error) throw error;

      // Update invoice status
      await updateInvoiceStatus(invoice.id, 'sent');

      // Update local state
      setInvoices(invoices.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, status: 'sent', sentDate: new Date() } 
          : inv
      ));

      toast({
        title: "Invoice Sent",
        description: `Invoice ${invoice.invoiceNumber} has been sent to ${project.clientName}.`,
      });
    } catch (err) {
      console.error("Error sending invoice:", err);
      setError("Failed to send invoice. Please try again.");
      toast({
        title: "Error",
        description: "Failed to send invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending({ ...isSending, [invoice.id]: false });
    }
  };

  const confirmDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    
    setIsDeleting({ ...isDeleting, [invoiceToDelete.id]: true });
    setError(null);
    
    try {
      await deleteInvoice(invoiceToDelete.id);
      setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${invoiceToDelete.invoiceNumber} has been deleted.`,
      });
    } catch (err) {
      console.error("Error deleting invoice:", err);
      setError("Failed to delete invoice. Please try again.");
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting({ ...isDeleting, [invoiceToDelete.id]: false });
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleRetry = () => {
    setDataFetched(false);
    loadInvoices();
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoices</CardTitle>
        <div className="flex gap-2">
          {error && (
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="icon"
              className="h-9 w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button 
            onClick={handleGenerateInvoice} 
            disabled={isGenerating}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> 
            {isGenerating ? "Generating..." : "Generate Invoice"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-muted-foreground">No invoices generated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{format(new Date(invoice.issueDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invoice.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice)}
                            disabled={isSending[invoice.id]}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {isSending[invoice.id] ? "Sending..." : "Send"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => confirmDeleteInvoice(invoice)}
                          disabled={isDeleting[invoice.id]}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete invoice {invoiceToDelete?.invoiceNumber}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteInvoice}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
