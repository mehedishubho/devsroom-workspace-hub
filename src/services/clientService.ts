
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types";
import { toast } from "@/hooks/use-toast";

// Get all clients
export const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(client => ({
      id: client.id,
      companyId: client.company_id || undefined,
      name: client.name,
      email: client.email,
      phone: client.phone || undefined,
      address: client.address || undefined,
      city: client.city || undefined,
      state: client.state || undefined,
      zipCode: client.zip_code || undefined,
      country: client.country || undefined,
      createdAt: new Date(client.created_at),
      updatedAt: client.updated_at ? new Date(client.updated_at) : undefined
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast({
      title: "Error",
      description: "Failed to fetch clients. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Add the updateClient function
export const updateClient = async (clientData: Client): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        city: clientData.city,
        state: clientData.state,
        zip_code: clientData.zipCode,
        country: clientData.country,
        company_id: clientData.companyId,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientData.id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id || undefined,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zip_code || undefined,
      country: data.country || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  } catch (error) {
    console.error('Error updating client:', error);
    toast({
      title: "Error",
      description: "Failed to update client. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Add any other missing client service functions here
export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    toast({
      title: "Error",
      description: "Failed to delete client. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
