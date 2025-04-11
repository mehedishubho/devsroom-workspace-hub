
import { Project, OtherAccess, Payment, ProjectFormData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { mapDbClientToClient, mapPaymentToDbPayment, ensureValidProjectStatus } from "@/utils/dataMappers";
import { format } from "date-fns";

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        clients(*)
      `);

    if (projectsError) throw projectsError;

    const projects: Project[] = await Promise.all((projectsData || []).map(async (project: any) => {
      // Fetch payments for the project
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('project_id', project.id);

      // Map payments to the correct format
      const payments: Payment[] = (paymentsData || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        date: new Date(payment.payment_date),
        description: payment.description,
        status: payment.payment_method as 'pending' | 'completed',
        currency: payment.currency || 'USD'
      }));

      // Fetch credentials for the project
      const { data: credentialsData } = await supabase
        .from('project_credentials')
        .select('*')
        .eq('project_id', project.id);

      // Organize credentials
      let mainCredentials = { username: '', password: '', notes: '' };
      let hostingCredentials = { provider: '', credentials: { username: '', password: '' }, notes: '' };
      const otherAccess: OtherAccess[] = [];

      (credentialsData || []).forEach((cred: any) => {
        if (cred.platform === 'main') {
          mainCredentials = {
            username: cred.username,
            password: cred.password,
            notes: cred.notes
          };
        } else if (cred.platform.startsWith('hosting-')) {
          const provider = cred.platform.replace('hosting-', '');
          hostingCredentials = {
            provider,
            credentials: {
              username: cred.username,
              password: cred.password
            },
            notes: cred.notes
          };
        } else {
          // Other access types
          const [type, name] = cred.platform.split('-');
          
          if (type && name) {
            otherAccess.push({
              id: cred.id,
              type: type as 'email' | 'ftp' | 'ssh' | 'cms' | 'other',
              name,
              credentials: {
                username: cred.username,
                password: cred.password
              },
              notes: cred.notes
            });
          }
        }
      });

      return {
        id: project.id,
        name: project.name,
        clientId: project.client_id,
        clientName: project.clients?.name || 'Unknown Client',
        description: project.description || '',
        url: '',
        startDate: new Date(project.start_date),
        endDate: project.deadline_date ? new Date(project.deadline_date) : undefined,
        price: project.budget || 0,
        status: ensureValidProjectStatus(project.status),
        projectTypeId: project.project_type_id,
        projectCategoryId: project.project_category_id,
        credentials: mainCredentials,
        hosting: hostingCredentials,
        otherAccess,
        payments,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at)
      };
    }));

    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast({
      title: "Error",
      description: "Failed to fetch projects. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Add a new project
export const addProject = async (projectData: Partial<Project>): Promise<Project> => {
  try {
    // Validate the required fields first
    if (!projectData.name) {
      throw new Error("Project name is required");
    }
    
    if (!projectData.clientId) {
      throw new Error("Client is required");
    }
    
    // Validate project type and category IDs (ensure they're valid UUIDs)
    if (projectData.projectTypeId && !isValidUUID(projectData.projectTypeId)) {
      console.warn("Invalid project type ID format, will be set to null");
      projectData.projectTypeId = null;
    }
    
    if (projectData.projectCategoryId && !isValidUUID(projectData.projectCategoryId)) {
      console.warn("Invalid project category ID format, will be set to null");
      projectData.projectCategoryId = null;
    }

    // First, create the project in the database
    const { data: projectRecord, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        client_id: projectData.clientId,
        description: projectData.description || '',
        start_date: projectData.startDate instanceof Date 
          ? format(projectData.startDate, 'yyyy-MM-dd') 
          : projectData.startDate ? String(projectData.startDate) : '',
        deadline_date: projectData.endDate instanceof Date 
          ? format(projectData.endDate, 'yyyy-MM-dd') 
          : projectData.endDate ? String(projectData.endDate) : null,
        budget: projectData.price || 0,
        status: ensureValidProjectStatus(projectData.status || 'active'),
        project_type_id: projectData.projectTypeId || null,
        project_category_id: projectData.projectCategoryId || null
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
      const dbPayments = projectData.payments.map(payment => 
        mapPaymentToDbPayment(payment, projectRecord.id)
      );

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
      status: ensureValidProjectStatus(projectRecord.status),
      projectTypeId: projectRecord.project_type_id,
      projectCategoryId: projectRecord.project_category_id,
      url: projectData.url || '',
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

// Helper function to check if a string is a valid UUID
function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

// Update an existing project
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
