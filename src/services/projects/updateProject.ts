
import { Project, Payment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapPaymentToDbPayment, ensureValidProjectStatus } from "@/utils/dataMappers";
import { format } from "date-fns";
import { isValidUUID } from "./utils";

/**
 * Update an existing project
 */
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
  try {
    console.log("Updating project with type/category:", {
      projectTypeId: updates.projectTypeId,
      projectCategoryId: updates.projectCategoryId,
      projectType: updates.projectType,
      projectCategory: updates.projectCategory
    });
    
    // Store original values for type/category handling
    const originalTypeId = updates.projectTypeId;
    const originalCategoryId = updates.projectCategoryId;
    const originalTypeName = updates.projectType;
    const originalCategoryName = updates.projectCategory;
    
    // Update the main project record
    const { data: projectRecord, error: projectError } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        client_id: updates.clientId,
        description: updates.description,
        url: updates.url || '',
        start_date: updates.startDate instanceof Date 
          ? format(updates.startDate, 'yyyy-MM-dd') 
          : updates.startDate ? String(updates.startDate) : null,
        deadline_date: updates.endDate instanceof Date 
          ? format(updates.endDate, 'yyyy-MM-dd') 
          : updates.endDate ? String(updates.endDate) : null,
        budget: updates.price,
        status: ensureValidProjectStatus(updates.status || 'active'),
        original_status: updates.originalStatus || updates.status || 'active',
        project_type_id: isValidUUID(originalTypeId) ? originalTypeId : null,
        project_category_id: isValidUUID(originalCategoryId) ? originalCategoryId : null
      })
      .eq('id', id)
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

    // Update or create main credentials
    if (updates.credentials) {
      const { data: existingCreds } = await supabase
        .from('project_credentials')
        .select()
        .eq('project_id', id)
        .eq('platform', 'main')
        .maybeSingle();

      if (existingCreds) {
        await supabase
          .from('project_credentials')
          .update({
            username: updates.credentials.username,
            password: updates.credentials.password,
            notes: updates.credentials.notes
          })
          .eq('id', existingCreds.id);
      } else {
        await supabase
          .from('project_credentials')
          .insert({
            project_id: id,
            platform: 'main',
            username: updates.credentials.username,
            password: updates.credentials.password,
            notes: updates.credentials.notes
          });
      }
    }

    // Update or create hosting credentials
    if (updates.hosting && updates.hosting.provider) {
      const { data: existingHosting } = await supabase
        .from('project_credentials')
        .select()
        .eq('project_id', id)
        .like('platform', 'hosting-%')
        .maybeSingle();

      if (existingHosting) {
        await supabase
          .from('project_credentials')
          .update({
            platform: `hosting-${updates.hosting.provider}`,
            username: updates.hosting.credentials?.username || '',
            password: updates.hosting.credentials?.password || '',
            notes: updates.hosting.notes
          })
          .eq('id', existingHosting.id);
      } else {
        await supabase
          .from('project_credentials')
          .insert({
            project_id: id,
            platform: `hosting-${updates.hosting.provider}`,
            username: updates.hosting.credentials?.username || '',
            password: updates.hosting.credentials?.password || '',
            notes: updates.hosting.notes
          });
      }
    }

    // Handle payments with currency support
    if (updates.payments) {
      // Only delete existing payments if we're providing new ones
      await supabase
        .from('payments')
        .delete()
        .eq('project_id', id);

      if (updates.payments.length > 0) {
        const dbPayments = updates.payments.map(payment => ({
          project_id: id,
          amount: payment.amount || 0,
          payment_date: payment.date instanceof Date 
            ? format(payment.date, 'yyyy-MM-dd') 
            : payment.date ? String(payment.date) : format(new Date(), 'yyyy-MM-dd'),
          payment_method: payment.status || 'pending',
          description: payment.description || '',
          currency: payment.currency || 'USD'
        }));

        const { error: paymentError } = await supabase
          .from('payments')
          .insert(dbPayments);
          
        if (paymentError) {
          console.error("Error updating payments:", paymentError);
          // Continue with the project update even if payments fail
        }
      }
    }

    // Fetch the client name
    let clientName = "Unknown Client";
    if (updates.clientId || projectRecord.client_id) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('name')
        .eq('id', updates.clientId || projectRecord.client_id)
        .maybeSingle();
      
      if (clientData) {
        clientName = clientData.name;
      }
    }
    
    // Fetch payments for the project
    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .eq('project_id', id);

    // Map payments to the correct format with currency support
    const mappedPayments: Payment[] = paymentData ? paymentData.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      date: new Date(payment.payment_date),
      description: payment.description || '',
      status: payment.payment_method as 'pending' | 'completed',
      currency: payment.currency || 'USD'
    })) : [];

    // Sort payments by date
    mappedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fetch type and category names if they exist
    let typeName = originalTypeName || "";
    let categoryName = originalCategoryName || "";
    
    if (isValidUUID(originalTypeId)) {
      const { data: typeData } = await supabase
        .from('project_types')
        .select('name')
        .eq('id', originalTypeId)
        .maybeSingle();
      
      if (typeData) {
        typeName = typeData.name;
      }
    }
    
    if (isValidUUID(originalCategoryId)) {
      const { data: categoryData } = await supabase
        .from('project_categories')
        .select('name')
        .eq('id', originalCategoryId)
        .maybeSingle();
      
      if (categoryData) {
        categoryName = categoryData.name;
      }
    }

    // Construct and return the updated project object
    const updatedProject: Project = {
      id: projectRecord.id,
      name: projectRecord.name,
      clientId: projectRecord.client_id,
      clientName: clientName,
      description: projectRecord.description || '',
      startDate: new Date(projectRecord.start_date),
      endDate: projectRecord.deadline_date ? new Date(projectRecord.deadline_date) : undefined,
      price: projectRecord.budget || 0,
      status: ensureValidProjectStatus(projectRecord.status),
      originalStatus: typeof projectRecord.original_status === 'string' 
        ? projectRecord.original_status 
        : projectRecord.status,
      projectTypeId: isValidUUID(originalTypeId) ? originalTypeId : "",
      projectCategoryId: isValidUUID(originalCategoryId) ? originalCategoryId : "",
      projectType: typeName,
      projectCategory: categoryName,
      url: typeof projectRecord.url === 'string' ? projectRecord.url : '',
      credentials: updates.credentials || { username: '', password: '', notes: '' },
      hosting: updates.hosting || { 
        provider: '', 
        credentials: { username: '', password: '' },
        notes: '' 
      },
      otherAccess: updates.otherAccess || [],
      payments: mappedPayments,
      createdAt: new Date(projectRecord.created_at),
      updatedAt: new Date(projectRecord.updated_at)
    };

    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update project. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
