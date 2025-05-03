
import { supabase } from "@/integrations/supabase/client";
import { ProjectType, ProjectCategory } from "@/types";
import { toast } from "@/hooks/use-toast";
import { isValidUUID } from "@/services/projects/utils";

/**
 * Fetch all project types
 */
export const getProjectTypes = async (): Promise<ProjectType[]> => {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      createdAt: new Date(item.created_at),
      updatedAt: item.updated_at ? new Date(item.updated_at) : undefined
    }));
  } catch (error) {
    console.error('Error fetching project types:', error);
    toast({
      title: "Error",
      description: "Failed to fetch project types. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Add a new project type
 */
export const addProjectType = async (name: string): Promise<ProjectType | null> => {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .insert({
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error adding project type:', error);
    toast({
      title: "Error",
      description: "Failed to add project type. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Update an existing project type
 */
export const updateProjectType = async (id: string, name: string): Promise<ProjectType | null> => {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error updating project type:', error);
    toast({
      title: "Error",
      description: "Failed to update project type. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Delete a project type
 */
export const deleteProjectType = async (id: string): Promise<boolean> => {
  try {
    // First check if there are any projects using this type
    const { data: projects, error: checkError } = await supabase
      .from('projects')
      .select('id')
      .eq('project_type_id', id);
    
    if (checkError) throw checkError;
    
    if (projects && projects.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This project type is being used by one or more projects.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if any categories are using this type
    const { data: categories, error: categoryCheckError } = await supabase
      .from('project_categories')
      .select('id')
      .eq('project_type_id', id);
    
    if (categoryCheckError) throw categoryCheckError;
    
    if (categories && categories.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This project type has categories associated with it. Delete the categories first.",
        variant: "destructive"
      });
      return false;
    }
    
    // If validation passes, delete the type
    const { error } = await supabase
      .from('project_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting project type:', error);
    toast({
      title: "Error",
      description: "Failed to delete project type. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Get categories by project type ID
 */
export const getCategoriesByType = async (projectTypeId: string): Promise<ProjectCategory[]> => {
  try {
    if (!isValidUUID(projectTypeId)) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('project_type_id', projectTypeId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      projectTypeId: item.project_type_id,
      createdAt: new Date(item.created_at),
      updatedAt: item.updated_at ? new Date(item.updated_at) : undefined
    }));
  } catch (error) {
    console.error('Error fetching project categories:', error);
    toast({
      title: "Error",
      description: "Failed to fetch project categories. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Get all project categories
 */
export const getAllProjectCategories = async (): Promise<ProjectCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      projectTypeId: item.project_type_id,
      createdAt: new Date(item.created_at),
      updatedAt: item.updated_at ? new Date(item.updated_at) : undefined
    }));
  } catch (error) {
    console.error('Error fetching project categories:', error);
    toast({
      title: "Error",
      description: "Failed to fetch project categories. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Add a new project category
 */
export const addProjectCategory = async (name: string, projectTypeId: string): Promise<ProjectCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .insert({
        name,
        project_type_id: projectTypeId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      projectTypeId: data.project_type_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error adding project category:', error);
    toast({
      title: "Error",
      description: "Failed to add project category. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Update an existing project category
 */
export const updateProjectCategory = async (id: string, name: string, projectTypeId: string): Promise<ProjectCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .update({
        name,
        project_type_id: projectTypeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      projectTypeId: data.project_type_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error updating project category:', error);
    toast({
      title: "Error",
      description: "Failed to update project category. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Delete a project category
 */
export const deleteProjectCategory = async (id: string): Promise<boolean> => {
  try {
    // First check if there are any projects using this category
    const { data: projects, error: checkError } = await supabase
      .from('projects')
      .select('id')
      .eq('project_category_id', id);
    
    if (checkError) throw checkError;
    
    if (projects && projects.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This category is being used by one or more projects.",
        variant: "destructive"
      });
      return false;
    }
    
    // If validation passes, delete the category
    const { error } = await supabase
      .from('project_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting project category:', error);
    toast({
      title: "Error",
      description: "Failed to delete project category. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
