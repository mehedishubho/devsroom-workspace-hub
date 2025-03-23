
import { supabase } from "@/integrations/supabase/client";
import { ProjectType, ProjectCategory } from "@/types";
import { toast } from "@/hooks/use-toast";

export async function getProjectTypes(): Promise<ProjectType[]> {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching project types:', error);
      throw error;
    }

    return data.map(type => ({
      id: type.id,
      name: type.name,
      createdAt: new Date(type.created_at),
      updatedAt: new Date(type.updated_at)
    }));
  } catch (error) {
    console.error('Error in getProjectTypes:', error);
    toast({
      title: "Error fetching project types",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export async function getProjectCategories(): Promise<ProjectCategory[]> {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching project categories:', error);
      throw error;
    }

    return data.map(category => ({
      id: category.id,
      name: category.name,
      projectTypeId: category.project_type_id,
      createdAt: new Date(category.created_at),
      updatedAt: new Date(category.updated_at)
    }));
  } catch (error) {
    console.error('Error in getProjectCategories:', error);
    toast({
      title: "Error fetching project categories",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export async function getCategoriesByTypeId(typeId: string): Promise<ProjectCategory[]> {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('project_type_id', typeId)
      .order('name');

    if (error) {
      console.error('Error fetching categories by type:', error);
      throw error;
    }

    return data.map(category => ({
      id: category.id,
      name: category.name,
      projectTypeId: category.project_type_id,
      createdAt: new Date(category.created_at),
      updatedAt: new Date(category.updated_at)
    }));
  } catch (error) {
    console.error('Error in getCategoriesByTypeId:', error);
    toast({
      title: "Error fetching categories",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export async function addProjectType(name: string): Promise<ProjectType | null> {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error adding project type:', error);
      throw error;
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
      title: "Error adding project type",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function addProjectCategory(name: string, projectTypeId: string): Promise<ProjectCategory | null> {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .insert({ 
        name,
        project_type_id: projectTypeId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding project category:', error);
      throw error;
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
      title: "Error adding project category",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateProjectType(id: string, name: string): Promise<ProjectType | null> {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project type:', error);
      throw error;
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
      title: "Error updating project type",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateProjectCategory(
  id: string, 
  name: string, 
  projectTypeId: string
): Promise<ProjectCategory | null> {
  try {
    const { data, error } = await supabase
      .from('project_categories')
      .update({ 
        name,
        project_type_id: projectTypeId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project category:', error);
      throw error;
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
      title: "Error updating project category",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function deleteProjectType(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('project_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project type:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProjectType:', error);
    toast({
      title: "Error deleting project type",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}

export async function deleteProjectCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('project_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project category:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProjectCategory:', error);
    toast({
      title: "Error deleting project category",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}
