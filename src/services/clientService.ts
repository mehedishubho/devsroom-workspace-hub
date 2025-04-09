
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types";
import { toast } from "@/hooks/use-toast";

export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*, companies(name)')
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
      address: client.address || undefined,
      city: client.city || undefined,
      state: client.state || undefined,
      zipCode: client.zip_code || undefined,
      country: client.country || undefined,
      companyId: client.company_id || undefined,
      companyName: client.companies?.name || undefined,
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
      .select('*, companies(name)')
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
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zip_code || undefined,
      country: data.country || undefined,
      companyId: data.company_id || undefined,
      companyName: data.companies?.name || undefined,
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

export async function getClientsByCompanyId(companyId: string): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*, companies(name)')
      .eq('company_id', companyId)
      .order('name');

    if (error) {
      console.error('Error fetching clients by company:', error);
      throw error;
    }

    return data.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone || undefined,
      address: client.address || undefined,
      city: client.city || undefined,
      state: client.state || undefined,
      zipCode: client.zip_code || undefined,
      country: client.country || undefined,
      companyId: client.company_id || undefined,
      companyName: client.companies?.name || undefined,
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    }));
  } catch (error) {
    console.error('Error in getClientsByCompanyId:', error);
    toast({
      title: "Error fetching clients by company",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyId: string;
}

export async function createClient(clientData: CreateClientData): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone || null,
        address: clientData.address || null,
        city: clientData.city || null,
        state: clientData.state || null,
        zip_code: clientData.zipCode || null,
        country: clientData.country || null,
        company_id: clientData.companyId
      })
      .select('*, companies(name)')
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
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zip_code || undefined,
      country: data.country || undefined,
      companyId: data.company_id || undefined,
      companyName: data.companies?.name || undefined,
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
  updates: Partial<CreateClientData>
): Promise<Client | null> {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.zipCode !== undefined) updateData.zip_code = updates.zipCode;
    if (updates.country !== undefined) updateData.country = updates.country;
    if (updates.companyId !== undefined) updateData.company_id = updates.companyId;

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select('*, companies(name)')
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
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zipCode: data.zip_code || undefined,
      country: data.country || undefined,
      companyId: data.company_id || undefined,
      companyName: data.companies?.name || undefined,
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
