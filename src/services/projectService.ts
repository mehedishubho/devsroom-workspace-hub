import { Project, OtherAccess, Payment, ProjectFormData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Add a new project
export const addProject = async (projectData: Partial<Project>): Promise<Project> => {
  try {
    // First, create the project in the database
    const { data: projectRecord, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        client_id: projectData.clientId,
        description: projectData.description || '',
        start_date: projectData.startDate,
        deadline_date: projectData.endDate,
        budget: projectData.price || 0,
        status: projectData.status || 'active',
        project_type_id: projectData.projectTypeId,
        project_category_id: projectData.projectCategoryId
      })
      .select()
      .single();

    if (projectError) throw projectError;
    
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

    // Create payments
    if (projectData.payments && projectData.payments.length > 0) {
      const payments = projectData.payments.map(payment => ({
        project_id: projectRecord.id,
        amount: payment.amount,
        payment_date: payment.date,
        description: payment.description,
        payment_method: payment.status,
        currency: payment.currency || 'USD'
      }));

      await supabase
        .from('payments')
        .insert(payments);
    }

    // Fetch the client name
    const { data: clientData } = await supabase
      .from('clients')
      .select('name')
      .eq('id', projectData.clientId)
      .single();

    // Construct and return the full project object
    const newProject: Project = {
      id: projectRecord.id,
      name: projectRecord.name,
      clientId: projectRecord.client_id,
      clientName: clientData?.name || 'Unknown Client',
      description: projectRecord.description || '',
      startDate: new Date(projectRecord.start_date),
      endDate: projectRecord.deadline_date ? new Date(projectRecord.deadline_date) : undefined,
      price: projectRecord.budget || 0,
      status: projectRecord.status,
      projectTypeId: projectRecord.project_type_id,
      projectCategoryId: projectRecord.project_category_id,
      url: projectData.url || '',
      credentials: projectData.credentials || { username: '', password: '' },
      hosting: projectData.hosting || { 
        provider: '', 
        credentials: { username: '', password: '' } 
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
      description: "Failed to create project. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

// Update an existing project
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
  try {
    // Update the main project record
    const { data: projectRecord, error: projectError } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        client_id: updates.clientId,
        description: updates.description,
        start_date: updates.startDate,
        deadline_date: updates.endDate,
        budget: updates.price,
        status: updates.status,
        project_type_id: updates.projectTypeId,
        project_category_id: updates.projectCategoryId
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
        const payments = updates.payments.map(payment => ({
          project_id: id,
          amount: payment.amount,
          payment_date: payment.date,
          description: payment.description,
          payment_method: payment.status,
          currency: payment.currency || 'USD'
        }));

        await supabase
          .from('payments')
          .insert(payments);
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
      status: projectRecord.status,
      projectTypeId: projectRecord.project_type_id,
      projectCategoryId: projectRecord.project_category_id,
      url: updates.url || '',
      credentials: updates.credentials || { username: '', password: '' },
      hosting: updates.hosting || { 
        provider: '', 
        credentials: { username: '', password: '' } 
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
      description: "Failed to update project. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};
