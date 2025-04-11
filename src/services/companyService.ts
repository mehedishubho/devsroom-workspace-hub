
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types";
import { simplifiedToast } from "@/hooks/use-toast";

export const getCompanies = async (): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(company => ({
      id: company.id,
      name: company.name,
      createdAt: new Date(company.created_at),
      updatedAt: new Date(company.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    simplifiedToast.error("Failed to fetch companies. Please try again.");
    return [];
  }
};

export const createCompany = async (name: string): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating company:', error);
    simplifiedToast.error("Failed to create company. Please try again.");
    return null;
  }
};

export const updateCompany = async (id: string, name: string): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error updating company:', error);
    simplifiedToast.error("Failed to update company. Please try again.");
    return null;
  }
};

export const deleteCompany = async (id: string): Promise<boolean> => {
  try {
    // First check if company has clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', id);
    
    if (clientsError) throw clientsError;
    
    if (clients && clients.length > 0) {
      simplifiedToast.error("Cannot delete company with existing clients. Please reassign or delete the clients first.");
      return false;
    }
    
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting company:', error);
    simplifiedToast.error("Failed to delete company. Please try again.");
    return false;
  }
};
