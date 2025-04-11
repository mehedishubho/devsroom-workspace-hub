
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types";
import { toast } from "@/hooks/use-toast";

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
    toast.error("Failed to fetch companies. Please try again.");
    return [];
  }
};
