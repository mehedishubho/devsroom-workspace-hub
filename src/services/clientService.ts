
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types";
import { toast } from "@/hooks/use-toast";

export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    return data.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone || undefined,
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    }));
  } catch (error) {
    console.error('Error in getClients:', error);
    toast({
      title: "Error fetching clients",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching client:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in getClientById:', error);
    toast({
      title: "Error fetching client",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in createClient:', error);
    toast({
      title: "Error creating client",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateClient(
  id: string, 
  updates: Pick<Client, 'name' | 'email' | 'phone'>
): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in updateClient:', error);
    toast({
      title: "Error updating client",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteClient:', error);
    toast({
      title: "Error deleting client",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}
