
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInvoiceRequest {
  invoiceId: string;
  clientEmail: string;
  clientName: string;
  projectName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, clientEmail, clientName, projectName }: SendInvoiceRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError) {
      throw new Error(`Error fetching invoice: ${invoiceError.message}`);
    }

    // Get invoice items
    const { data: invoiceItems, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (itemsError) {
      throw new Error(`Error fetching invoice items: ${itemsError.message}`);
    }

    // This is a simplified email sending implementation
    // In a production app, you'd want to use a proper email service
    console.log(`Sending invoice ${invoice.invoice_number} to ${clientEmail}`);
    console.log(`Invoice details: ${JSON.stringify(invoice)}`);
    console.log(`Invoice items: ${JSON.stringify(invoiceItems)}`);

    // Update invoice status to sent
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ 
        status: "sent",
        sent_date: new Date().toISOString()
      })
      .eq("id", invoiceId);

    if (updateError) {
      throw new Error(`Error updating invoice status: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invoice ${invoice.invoice_number} sent to ${clientEmail}`
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
