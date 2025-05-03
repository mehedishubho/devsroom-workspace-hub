import { supabase } from "@/integrations/supabase/client";
import { ProjectType, ProjectCategory } from "@/types";
import { sampleProjectTypes, sampleProjectCategories } from "@/data/projectTypes";
import { isValidUUID } from "@/services/projects/utils";

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

/**
 * Get a project type by ID
 */
export const getProjectTypeById = async (id: string): Promise<ProjectType | null> => {
  try {
    if (!id) return null;
    
    // For sample data IDs that start with "type-", use the local data
    if (id.startsWith('type-')) {
      const type = sampleProjectTypes.find(t => t.id === id);
      return type || null;
    }
    
    // Otherwise query the database
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching project type by ID from Supabase:', error);
      console.log('Falling back to sample project types');
      const type = sampleProjectTypes.find(t => t.id === id);
      return type || null;
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
    const type = sampleProjectTypes.find(t => t.id === id);
    return type || null;
  }
};

/**
 * Get a project category by ID
 */
export const getProjectCategoryById = async (id: string): Promise<ProjectCategory | null> => {
  try {
    if (!id) return null;
    
    // For sample data IDs that start with "cat-", use the local data
    if (id.startsWith('cat-')) {
      const category = sampleProjectCategories.find(c => c.id === id);
      return category || null;
    }
    
    // Otherwise query the database
    const { data, error } = await supabase
      .from('project_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching project category by ID from Supabase:', error);
      console.log('Falling back to sample project categories');
      const category = sampleProjectCategories.find(c => c.id === id);
      return category || null;
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
    const category = sampleProjectCategories.find(c => c.id === id);
    return category || null;
  }
};

/**
 * Add a new project type
 */
export const addProjectType = async (name: string): Promise<ProjectType> => {
  try {
    const { data, error } = await supabase
      .from('project_types')
      .insert({ name })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding project type to Supabase:', error);
      // Fall back to adding in memory
      const newType = {
        id: `type-${Date.now()}`,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      sampleProjectTypes.push(newType);
      return newType;
    }
    
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in addProjectType:', error);
    // Fall back to adding in memory
    const newType = {
      id: `type-${Date.now()}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    sampleProjectTypes.push(newType);
    return newType;
  }
};

/**
 * Add a new project category
 */
export const addProjectCategory = async (name: string, projectTypeId: string): Promise<ProjectCategory> => {
  try {
    // If using a sample project type ID, keep using sample data
    if (projectTypeId.startsWith('type-')) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        projectTypeId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      sampleProjectCategories.push(newCategory);
      return newCategory;
    }
    
    // Otherwise insert to database
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
      // Fall back to adding in memory
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        projectTypeId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      sampleProjectCategories.push(newCategory);
      return newCategory;
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
    // Fall back to adding in memory
    const newCategory = {
      id: `cat-${Date.now()}`,
      name,
      projectTypeId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    sampleProjectCategories.push(newCategory);
    return newCategory;
  }
};
