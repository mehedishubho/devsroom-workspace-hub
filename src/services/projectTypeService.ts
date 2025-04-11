
import { supabase } from "@/integrations/supabase/client";
import { ProjectType, ProjectCategory } from "@/types";
import { simplifiedToast } from "@/hooks/use-toast";

export const getProjectTypes = async (): Promise<ProjectType[]> => {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(type => ({
      id: type.id,
      name: type.name,
      createdAt: new Date(type.created_at),
      updatedAt: type.updated_at ? new Date(type.updated_at) : undefined
    }));
  } catch (error) {
    console.error('Error fetching project types:', error);
    simplifiedToast.error("Failed to fetch project types. Please try again.");
    return [];
  }
};

export const getProjectCategories = async (): Promise<ProjectCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(category => ({
      id: category.id,
      name: category.name,
      projectTypeId: category.project_type_id,
      createdAt: new Date(category.created_at),
      updatedAt: category.updated_at ? new Date(category.updated_at) : undefined
    }));
  } catch (error) {
    console.error('Error fetching project categories:', error);
    simplifiedToast.error("Failed to fetch project categories. Please try again.");
    return [];
  }
};
