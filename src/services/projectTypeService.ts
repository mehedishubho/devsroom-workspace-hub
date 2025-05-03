
import { supabase } from "@/integrations/supabase/client";
import { ProjectType, ProjectCategory } from "@/types";
import { isValidUUID } from "@/services/projects/utils";
import { toast } from "@/hooks/use-toast";

/**
 * Get all project types
 */
export const getProjectTypes = async (): Promise<ProjectType[]> => {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching project types from Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project types",
        variant: "destructive"
      });
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error in getProjectTypes:', error);
    toast({
      title: "Error",
      description: "Failed to fetch project types",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Get all project categories
 */
export const getProjectCategories = async (): Promise<ProjectCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching project categories from Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project categories",
        variant: "destructive"
      });
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        projectTypeId: item.project_type_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error in getProjectCategories:', error);
    toast({
      title: "Error",
      description: "Failed to fetch project categories",
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Get categories by project type
 */
export const getCategoriesByType = async (projectTypeId: string): Promise<ProjectCategory[]> => {
  try {
    if (!projectTypeId || typeof projectTypeId !== 'string') {
      console.error('Invalid projectTypeId provided:', projectTypeId);
      return [];
    }
    
    if (!isValidUUID(projectTypeId)) {
      console.error('Invalid UUID format for projectTypeId:', projectTypeId);
      return [];
    }
    
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('project_type_id', projectTypeId)
      .order('name');
    
    if (error) {
      console.error('Error fetching project categories by type from Supabase:', error);
      return [];
    }
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        projectTypeId: item.project_type_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error in getCategoriesByType:', error);
    return [];
  }
};

/**
 * Get a project type by ID
 */
export const getProjectTypeById = async (id: string): Promise<ProjectType | null> => {
  try {
    if (!id || !isValidUUID(id)) return null;
    
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching project type by ID from Supabase:', error);
      return null;
    }
    
    if (data) {
      return {
        id: data.id,
        name: data.name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getProjectTypeById:', error);
    return null;
  }
};

/**
 * Get a project category by ID
 */
export const getProjectCategoryById = async (id: string): Promise<ProjectCategory | null> => {
  try {
    if (!id || !isValidUUID(id)) return null;
    
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching project category by ID from Supabase:', error);
      return null;
    }
    
    if (data) {
      return {
        id: data.id,
        name: data.name,
        projectTypeId: data.project_type_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getProjectCategoryById:', error);
    return null;
  }
};

/**
 * Add a new project type
 */
export const addProjectType = async (name: string): Promise<ProjectType | null> => {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .insert({ name })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding project type to Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to add project type",
        variant: "destructive"
      });
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in addProjectType:', error);
    toast({
      title: "Error",
      description: "Failed to add project type",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Update existing project type
 */
export const updateProjectType = async (id: string, name: string): Promise<ProjectType | null> => {
  try {
    if (!isValidUUID(id)) {
      console.error('Invalid UUID format for project type ID:', id);
      toast({
        title: "Error",
        description: "Invalid project type ID",
        variant: "destructive"
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('project_types')
      .update({ name, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project type:', error);
      toast({
        title: "Error",
        description: "Failed to update project type",
        variant: "destructive"
      });
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in updateProjectType:', error);
    toast({
      title: "Error",
      description: "Failed to update project type",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Delete project type (and its categories)
 */
export const deleteProjectType = async (id: string): Promise<boolean> => {
  try {
    if (!isValidUUID(id)) {
      console.error('Invalid UUID format for project type ID:', id);
      toast({
        title: "Error",
        description: "Invalid project type ID",
        variant: "destructive"
      });
      return false;
    }
    
    // Delete associated categories first
    const { error: catError } = await supabase
      .from('project_categories')
      .delete()
      .eq('project_type_id', id);
    
    if (catError) {
      console.error('Error deleting associated categories:', catError);
      // Continue anyway to try deleting the project type
    }
    
    // Now delete the project type
    const { error } = await supabase
      .from('project_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project type:', error);
      toast({
        title: "Error",
        description: "Failed to delete project type",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProjectType:', error);
    toast({
      title: "Error",
      description: "Failed to delete project type",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Add a new project category
 */
export const addProjectCategory = async (name: string, projectTypeId: string): Promise<ProjectCategory | null> => {
  try {
    if (!isValidUUID(projectTypeId)) {
      console.error('Invalid UUID format for project type ID:', projectTypeId);
      toast({
        title: "Error",
        description: "Invalid project type ID",
        variant: "destructive"
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('project_categories')
      .insert({ 
        name,
        project_type_id: projectTypeId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding project category to Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to add project category",
        variant: "destructive"
      });
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      projectTypeId: data.project_type_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in addProjectCategory:', error);
    toast({
      title: "Error",
      description: "Failed to add project category",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Update existing project category
 */
export const updateProjectCategory = async (id: string, name: string, projectTypeId: string): Promise<ProjectCategory | null> => {
  try {
    if (!isValidUUID(id) || !isValidUUID(projectTypeId)) {
      console.error('Invalid UUID format:', { categoryId: id, projectTypeId });
      toast({
        title: "Error",
        description: "Invalid ID format",
        variant: "destructive"
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('project_categories')
      .update({ 
        name,
        project_type_id: projectTypeId,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project category:', error);
      toast({
        title: "Error",
        description: "Failed to update project category",
        variant: "destructive"
      });
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      projectTypeId: data.project_type_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in updateProjectCategory:', error);
    toast({
      title: "Error",
      description: "Failed to update project category",
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Delete project category
 */
export const deleteProjectCategory = async (id: string): Promise<boolean> => {
  try {
    if (!isValidUUID(id)) {
      console.error('Invalid UUID format for category ID:', id);
      toast({
        title: "Error",
        description: "Invalid category ID",
        variant: "destructive"
      });
      return false;
    }
    
    const { error } = await supabase
      .from('project_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project category:', error);
      toast({
        title: "Error",
        description: "Failed to delete project category",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProjectCategory:', error);
    toast({
      title: "Error",
        description: "Failed to delete project category",
        variant: "destructive"
      });
    return false;
  }
};
