
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
    // Validate project type and category IDs
    if (updates.projectTypeId && !isValidUUID(updates.projectTypeId)) {
      console.warn("Invalid project type ID format, will be set to null");
      updates.projectTypeId = null;
    }
    
    if (updates.projectCategoryId && !isValidUUID(updates.projectCategoryId)) {
      console.warn("Invalid project category ID format, will be set to null");
      updates.projectCategoryId = null;
    }
    
    // Update the main project record
    const { data: projectRecord, error: projectError } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        client_id: updates.clientId,
        description: updates.description,
        start_date: updates.startDate instanceof Date 
          ? format(updates.startDate, 'yyyy-MM-dd') 
          : updates.startDate ? String(updates.startDate) : null,
        deadline_date: updates.endDate instanceof Date 
          ? format(updates.endDate, 'yyyy-MM-dd') 
          : updates.endDate ? String(updates.endDate) : null,
        budget: updates.price,
        status: ensureValidProjectStatus(updates.status || 'active'),
        project_type_id: updates.projectTypeId || null,
        project_category_id: updates.projectCategoryId || null
      })
      .eq('id', id)
      .select()
      .single();

    if (projectError) throw projectError;

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

    // Handle payments - delete existing and add new ones
    if (updates.payments) {
      await supabase
        .from('payments')
        .delete()
        .eq('project_id', id);

      if (updates.payments.length > 0) {
        const dbPayments = updates.payments.map(payment => 
          mapPaymentToDbPayment(payment, id)
        );

        await supabase
          .from('payments')
          .insert(dbPayments);
      }
    }

    // Handle other access credentials
    // First, remove existing ones
    if (updates.otherAccess) {
      await supabase
        .from('project_credentials')
        .delete()
        .eq('project_id', id)
        .not('platform', 'like', 'hosting-%')
        .not('platform', 'eq', 'main');

      // Then add new ones
      if (updates.otherAccess.length > 0) {
        const otherAccessCredentials = updates.otherAccess.map(access => ({
          project_id: id,
          platform: `${access.type}-${access.name}`,
          username: access.credentials.username,
          password: access.credentials.password,
          notes: access.notes
        }));

        await supabase
          .from('project_credentials')
          .insert(otherAccessCredentials);
      }
    }

    // Fetch the client name
    const { data: clientData } = await supabase
      .from('clients')
      .select('name')
      .eq('id', updates.clientId || projectRecord.client_id)
      .single();

    // Fetch payments for the project
    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .eq('project_id', id);

    // Map payments to the correct format
    const mappedPayments: Payment[] = paymentData ? paymentData.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      date: new Date(payment.payment_date),
      description: payment.description,
      status: payment.payment_method as 'pending' | 'completed',
      currency: payment.currency || 'USD'
    })) : [];

    // Construct and return the updated project object
    const updatedProject: Project = {
      id: projectRecord.id,
      name: projectRecord.name,
      clientId: projectRecord.client_id,
      clientName: clientData?.name || 'Unknown Client',
      description: projectRecord.description || '',
      startDate: new Date(projectRecord.start_date),
      endDate: projectRecord.deadline_date ? new Date(projectRecord.deadline_date) : undefined,
      price: projectRecord.budget || 0,
      status: ensureValidProjectStatus(projectRecord.status),
      projectTypeId: projectRecord.project_type_id,
      projectCategoryId: projectRecord.project_category_id,
      url: updates.url || '',
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
