
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types";
import { toast } from "@/hooks/use-toast";

export async function getCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    return data.map(company => ({
      id: company.id,
      name: company.name,
      createdAt: new Date(company.created_at),
      updatedAt: new Date(company.updated_at)
    }));
  } catch (error) {
    console.error('Error in getCompanies:', error);
    toast({
      title: "Error fetching companies",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in getCompanyById:', error);
    toast({
      title: "Error fetching company",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function createCompany(name: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in createCompany:', error);
    toast({
      title: "Error creating company",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateCompany(id: string, name: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in updateCompany:', error);
    toast({
      title: "Error updating company",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function deleteCompany(id: string): Promise<boolean> {
  try {
    // Check if there are associated clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', id);

    if (clientsError) {
      console.error('Error checking company clients:', clientsError);
      throw clientsError;
    }

    if (clients && clients.length > 0) {
      toast({
        title: "Cannot delete company",
        description: "This company has associated clients. Please reassign or delete them first.",
        variant: "destructive"
      });
      return false;
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCompany:', error);
    toast({
      title: "Error deleting company",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}
