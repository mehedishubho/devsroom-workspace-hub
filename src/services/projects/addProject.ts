import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapPaymentToDbPayment, ensureValidProjectStatus } from "@/utils/dataMappers";
import { format } from "date-fns";
import { isValidUUID } from "./utils";

/**
 * Add a new project
 */
export const addProject = async (projectData: Partial<Project>): Promise<Project> => {
  try {
    // Validate the required fields first
    if (!projectData.name) {
      throw new Error("Project name is required");
    }
    
    if (!projectData.clientId) {
      throw new Error("Client is required");
    }
    
    console.log("Adding project with type/category:", {
      projectTypeId: projectData.projectTypeId,
      projectCategoryId: projectData.projectCategoryId,
      projectType: projectData.projectType,
      projectCategory: projectData.projectCategory
    });
    
    // Store original values for sample data handling
    const originalTypeId = projectData.projectTypeId;
    const originalCategoryId = projectData.projectCategoryId;
    const originalTypeName = projectData.projectType;
    const originalCategoryName = projectData.projectCategory;
    
    // Validate project type and category IDs (ensure they're valid UUIDs for database)
    let dbTypeId = null;
    let dbCategoryId = null;
    
    if (projectData.projectTypeId) {
      if (projectData.projectTypeId.startsWith('type-')) {
        // This is sample data, we'll store the name but not the ID in the database
        dbTypeId = null;
      } else if (isValidUUID(projectData.projectTypeId)) {
        dbTypeId = projectData.projectTypeId;
      } else {
        console.warn("Invalid project type ID format, will be set to null");
        dbTypeId = null;
      }
    }
    
    if (projectData.projectCategoryId) {
      if (projectData.projectCategoryId.startsWith('cat-')) {
        // This is sample data, we'll store the name but not the ID in the database
        dbCategoryId = null;
      } else if (isValidUUID(projectData.projectCategoryId)) {
        dbCategoryId = projectData.projectCategoryId;
      } else {
        console.warn("Invalid project category ID format, will be set to null");
        dbCategoryId = null;
      }
    }

    // Determine original status (for "In Progress" display)
    const originalStatus = projectData.originalStatus || projectData.status || 'active';

    // First, create the project in the database
    const { data: projectRecord, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        client_id: projectData.clientId,
        description: projectData.description || '',
        url: projectData.url || '',
        start_date: projectData.startDate instanceof Date 
          ? format(projectData.startDate, 'yyyy-MM-dd') 
          : projectData.startDate ? String(projectData.startDate) : '',
        deadline_date: projectData.endDate instanceof Date 
          ? format(projectData.endDate, 'yyyy-MM-dd') 
          : projectData.endDate ? String(projectData.endDate) : null,
        budget: projectData.price || 0,
        status: ensureValidProjectStatus(projectData.status || 'active'),
        original_status: originalStatus,
        project_type_id: dbTypeId,
        project_category_id: dbCategoryId
      })
      .select()
      .single();

    if (projectError) {
      // Check if the error is related to missing columns
      if (projectError.message.includes("column") && projectError.message.includes("does not exist")) {
        console.error("Database schema error:", projectError.message);
        throw new Error("The database schema needs to be updated. Missing required columns in projects table.");
      }
      throw projectError;
    }
    
    // Create project credentials
    if (projectData.credentials) {
      await supabase
        .from('project_credentials')
        .insert({
          project_id: projectRecord.id,
          platform: 'main',
          username: projectData.credentials.username,
          password: projectData.credentials.password,
          notes: projectData.credentials.notes
        });
    }

    // Create hosting credentials
    if (projectData.hosting && projectData.hosting.provider) {
      await supabase
        .from('project_credentials')
        .insert({
          project_id: projectRecord.id,
          platform: `hosting-${projectData.hosting.provider}`,
          username: projectData.hosting.credentials?.username || '',
          password: projectData.hosting.credentials?.password || '',
          notes: projectData.hosting.notes
        });
    }

    // Create other access credentials
    if (projectData.otherAccess && projectData.otherAccess.length > 0) {
      const otherAccessCredentials = projectData.otherAccess.map(access => ({
        project_id: projectRecord.id,
        platform: `${access.type}-${access.name}`,
        username: access.credentials.username,
        password: access.credentials.password,
        notes: access.notes
      }));

      await supabase
        .from('project_credentials')
        .insert(otherAccessCredentials);
    }

    // Create payments with currency support
    if (projectData.payments && projectData.payments.length > 0) {
      const dbPayments = projectData.payments.map(payment => ({
        project_id: projectRecord.id,
        amount: payment.amount || 0,
        payment_date: payment.date instanceof Date 
          ? format(payment.date, 'yyyy-MM-dd') 
          : payment.date ? String(payment.date) : format(new Date(), 'yyyy-MM-dd'),
        payment_method: payment.status || 'pending',
        description: payment.description || '',
        currency: payment.currency || 'USD'
      }));

      await supabase
        .from('payments')
        .insert(dbPayments);
    }

    // Fetch the client name
    const { data: clientData } = await supabase
      .from('clients')
      .select('name')
      .eq('id', projectData.clientId)
      .single();

    // Use original project type and category names if available (from sample data)
    // or fetch from database if available
    let projectTypeName = originalTypeName || '';
    let projectCategoryName = originalCategoryName || '';
    
    if (dbTypeId) {
      const { data: typeData } = await supabase
        .from('project_types')
        .select('name')
        .eq('id', dbTypeId)
        .maybeSingle();
      
      if (typeData?.name) {
        projectTypeName = typeData.name;
      }
    }
    
    if (dbCategoryId) {
      const { data: categoryData } = await supabase
        .from('project_categories')
        .select('name')
        .eq('id', dbCategoryId)
        .maybeSingle();
      
      if (categoryData?.name) {
        projectCategoryName = categoryData.name;
      }
    }

    console.log("Project created with type/category:", {
      projectTypeId: projectRecord.project_type_id || originalTypeId,
      projectCategoryId: projectRecord.project_category_id || originalCategoryId,
      projectType: projectTypeName,
      projectCategory: projectCategoryName
    });

    // Construct and return the full project object
    const newProject: Project = {
      id: projectRecord.id,
      name: projectRecord.name,
      clientId: projectRecord.client_id,
      clientName: clientData?.name || 'Unknown Client',
      description: projectRecord.description || '',
      url: typeof projectRecord.url === 'string' ? projectRecord.url : '',
      startDate: new Date(projectRecord.start_date),
      endDate: projectRecord.deadline_date ? new Date(projectRecord.deadline_date) : undefined,
      price: projectRecord.budget || 0,
      status: ensureValidProjectStatus(projectRecord.status),
      originalStatus: typeof projectRecord.original_status === 'string' 
        ? projectRecord.original_status 
        : projectRecord.status,
      // Keep the original IDs for sample data
      projectTypeId: originalTypeId || projectRecord.project_type_id || "",
      projectCategoryId: originalCategoryId || projectRecord.project_category_id || "",
      projectType: projectTypeName,
      projectCategory: projectCategoryName,
      credentials: projectData.credentials || { username: '', password: '', notes: '' },
      hosting: projectData.hosting || { 
        provider: '', 
        credentials: { username: '', password: '' },
        notes: '' 
      },
      otherAccess: projectData.otherAccess || [],
      payments: projectData.payments || [],
      createdAt: new Date(projectRecord.created_at),
      updatedAt: new Date(projectRecord.updated_at)
    };

    return newProject;
  } catch (error) {
    console.error('Error adding project:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create project. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
};
