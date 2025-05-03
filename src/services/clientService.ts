
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

// Get client by ID
export const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
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
    console.error('Error fetching client:', error);
    toast({
      title: "Error",
      description: "Failed to fetch client details. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Create a new client
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        city: clientData.city,
        state: clientData.state,
        zip_code: clientData.zipCode,
        country: clientData.country,
        company_id: clientData.companyId
      })
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
    console.error('Error creating client:', error);
    toast({
      title: "Error",
      description: "Failed to create client. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// For backward compatibility
export const addClient = createClient;

// Update client
export const updateClient = async (clientId: string, clientData: Partial<Client>): Promise<Client | null> => {
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
      .eq('id', clientId)
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

// Delete client
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

// Get clients by company
export const getClientsByCompanyId = async (companyId: string): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
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
    console.error('Error fetching clients by company:', error);
    toast({
      title: "Error",
      description: "Failed to fetch company clients. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};
