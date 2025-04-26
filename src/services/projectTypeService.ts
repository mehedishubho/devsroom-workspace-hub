import { supabase } from "@/integrations/supabase/client";
import { ProjectType, ProjectCategory } from "@/types";
import { sampleProjectTypes, sampleProjectCategories } from "@/data/projectTypes";

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
      console.log('Falling back to sample project types');
      return [...sampleProjectTypes];
    }
    
    // If we have data from the database, return it
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
    
    // Otherwise fall back to sample data
    return [...sampleProjectTypes];
  } catch (error) {
    console.error('Error in getProjectTypes:', error);
    return [...sampleProjectTypes];
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
      console.log('Falling back to sample project categories');
      return [...sampleProjectCategories];
    }
    
    // If we have data from the database, return it
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        projectTypeId: item.project_type_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
    
    // Otherwise fall back to sample data
    return [...sampleProjectCategories];
  } catch (error) {
    console.error('Error in getProjectCategories:', error);
    return [...sampleProjectCategories];
  }
};

/**
 * Get categories by project type
 */
export const getCategoriesByType = async (projectTypeId: string): Promise<ProjectCategory[]> => {
  try {
    // Add validation for the projectTypeId format
    if (!projectTypeId || typeof projectTypeId !== 'string') {
      console.error('Invalid projectTypeId provided:', projectTypeId);
      return [];
    }
    
    // For sample data IDs that start with "type-", use the local data
    if (projectTypeId.startsWith('type-')) {
      const filteredCategories = sampleProjectCategories.filter(
        cat => cat.projectTypeId === projectTypeId
      );
      return [...filteredCategories];
    }
    
    // Otherwise query the database
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('project_type_id', projectTypeId)
      .order('name');
    
    if (error) {
      console.error('Error fetching project categories by type from Supabase:', error);
      console.log('Falling back to sample categories');
      const filteredCategories = sampleProjectCategories.filter(
        cat => cat.projectTypeId === projectTypeId
      );
      return [...filteredCategories];
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
    
    // If no categories found for this type, return empty array
    return [];
  } catch (error) {
    console.error('Error in getCategoriesByType:', error);
    const filteredCategories = sampleProjectCategories.filter(
      cat => cat.projectTypeId === projectTypeId
    );
    return [...filteredCategories];
  }
};
