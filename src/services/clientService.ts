
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types";
import { mapDbClientToClient } from "@/utils/dataMappers";
import { toast } from "@/hooks/use-toast";

export const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Map database client records to Client type
    return data.map(client => mapDbClientToClient(client));
  } catch (error) {
    console.error('Error fetching clients:', error);
    toast.error("Failed to fetch clients. Please try again.");
    return [];
  }
};

export const getClientsByCompanyId = async (companyId: string): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Map database client records to Client type
    return data.map(client => mapDbClientToClient(client));
  } catch (error) {
    console.error(`Error fetching clients for company ${companyId}:`, error);
    toast.error("Failed to fetch company clients. Please try again.");
    return [];
  }
};

export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return mapDbClientToClient(data);
  } catch (error) {
    console.error(`Error fetching client with ID ${id}:`, error);
    toast.error("Failed to fetch client details. Please try again.");
    return null;
  }
};

export const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> => {
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
      .select()
      .single();
    
    if (error) throw error;
    
    return mapDbClientToClient(data);
  } catch (error) {
    console.error('Error adding client:', error);
    toast.error("Failed to add client. Please try again.");
    return null;
  }
};

// Alias for addClient to maintain compatibility with existing code
export const createClient = addClient;
