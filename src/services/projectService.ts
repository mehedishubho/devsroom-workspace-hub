
import { supabase } from "@/integrations/supabase/client";
import { Project, Payment, Credential, Hosting, OtherAccess, ProjectFormData } from "@/types";
import { toast } from "@/hooks/use-toast";

// Helper function to convert database format to our application format
const mapProjectFromDb = (project, client, credentials): Project => {
  // Constructing the main project object
  const mappedProject: Project = {
    id: project.id,
    name: project.name,
    clientId: project.client_id,
    clientName: client?.name || "Unknown Client",
    description: project.description || "",
    url: credentials?.find(c => c.platform === 'website')?.notes || "",
    credentials: {
      username: credentials?.find(c => c.platform === 'website')?.username || "",
      password: credentials?.find(c => c.platform === 'website')?.password || "",
      notes: credentials?.find(c => c.platform === 'website')?.notes || ""
    },
    hosting: {
      provider: credentials?.find(c => c.platform === 'hosting')?.platform || "",
      credentials: {
        username: credentials?.find(c => c.platform === 'hosting')?.username || "",
        password: credentials?.find(c => c.platform === 'hosting')?.password || "",
      },
      url: credentials?.find(c => c.platform === 'hosting')?.notes || "",
      notes: credentials?.find(c => c.platform === 'hosting')?.notes || ""
    },
    otherAccess: credentials?.filter(c => !['website', 'hosting'].includes(c.platform)).map(c => ({
      id: c.id,
      type: mapCredentialTypeToAccessType(c.platform),
      name: c.platform,
      credentials: {
        username: c.username,
        password: c.password,
        notes: c.notes || ""
      },
      notes: c.notes || ""
    })) || [],
    startDate: new Date(project.start_date),
    endDate: project.deadline_date ? new Date(project.deadline_date) : undefined,
    price: project.budget || 0,
    payments: [], // To be filled by a separate query
    status: project.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
    projectTypeId: project.project_type_id,
    projectCategoryId: project.project_category_id,
    notes: project.description,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at)
  };

  return mappedProject;
};

// Helper function to map credential types to access types
const mapCredentialTypeToAccessType = (platform: string): 'email' | 'ftp' | 'ssh' | 'cms' | 'other' => {
  const mapping = {
    'email': 'email',
    'ftp': 'ftp',
    'ssh': 'ssh',
    'cms': 'cms'
  };
  
  return mapping[platform] || 'other';
};

export async function getProjects(): Promise<Project[]> {
  try {
    // First, get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) throw projectsError;

    // Get all clients 
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    if (clientsError) throw clientsError;

    // Get all credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('project_credentials')
      .select('*');

    if (credentialsError) throw credentialsError;

    // Get all payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*');

    if (paymentsError) throw paymentsError;

    // Map each project with its related data
    const mappedProjects = await Promise.all(
      projects.map(async (project) => {
        const client = clients.find(c => c.id === project.client_id);
        const projectCredentials = credentials.filter(c => c.project_id === project.id);
        const projectPayments = payments.filter(p => p.project_id === project.id);

        const mappedProject = mapProjectFromDb(project, client, projectCredentials);

        // Add payments - we should consider status as "completed" by default if not specified
        mappedProject.payments = projectPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: new Date(payment.payment_date),
          description: payment.description || '',
          status: 'completed' // Default to completed since status isn't in the database
        }));

        return mappedProject;
      })
    );

    return mappedProjects;
  } catch (error) {
    console.error('Error in getProjects:', error);
    toast({
      title: "Error fetching projects",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    // Get the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (projectError) throw projectError;
    if (!project) return null;

    // Get the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', project.client_id)
      .maybeSingle();

    if (clientError) throw clientError;

    // Get credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('project_credentials')
      .select('*')
      .eq('project_id', id);

    if (credentialsError) throw credentialsError;

    // Get payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('project_id', id);

    if (paymentsError) throw paymentsError;

    // Map the project with its related data
    const mappedProject = mapProjectFromDb(project, client, credentials);

    // Add payments - with default status of completed
    mappedProject.payments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      date: new Date(payment.payment_date),
      description: payment.description || '',
      status: 'completed' // Default to completed since there's no status in the database
    }));

    return mappedProject;
  } catch (error) {
    console.error('Error in getProjectById:', error);
    toast({
      title: "Error fetching project",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function addProject(projectData: ProjectFormData): Promise<Project | null> {
  try {
    // Start a transaction
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        client_id: projectData.clientId,
        description: projectData.description,
        start_date: projectData.startDate.toISOString(),
        deadline_date: projectData.endDate?.toISOString(),
        budget: projectData.price,
        status: projectData.status,
        project_type_id: projectData.projectTypeId,
        project_category_id: projectData.projectCategoryId
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Add website credentials
    const { error: websiteCredError } = await supabase
      .from('project_credentials')
      .insert({
        project_id: project.id,
        platform: 'website',
        username: projectData.credentials.username,
        password: projectData.credentials.password,
        notes: projectData.url
      });

    if (websiteCredError) throw websiteCredError;

    // Add hosting credentials
    const { error: hostingCredError } = await supabase
      .from('project_credentials')
      .insert({
        project_id: project.id,
        platform: 'hosting',
        username: projectData.hosting.credentials.username,
        password: projectData.hosting.credentials.password,
        notes: projectData.hosting.url
      });

    if (hostingCredError) throw hostingCredError;

    // Add other access credentials
    if (projectData.otherAccess && projectData.otherAccess.length > 0) {
      const otherAccessCredentials = projectData.otherAccess.map(access => ({
        project_id: project.id,
        platform: access.type,
        username: access.credentials.username,
        password: access.credentials.password,
        notes: access.notes
      }));

      const { error: otherCredError } = await supabase
        .from('project_credentials')
        .insert(otherAccessCredentials);

      if (otherCredError) throw otherCredError;
    }

    // Add payments
    if (projectData.payments && projectData.payments.length > 0) {
      const projectPayments = projectData.payments.map(payment => ({
        project_id: project.id,
        amount: payment.amount,
        payment_date: payment.date.toISOString(),
        description: payment.description,
        // Note: We're not sending the status to the database since it doesn't have a status field
      }));

      const { error: paymentsError } = await supabase
        .from('payments')
        .insert(projectPayments);

      if (paymentsError) throw paymentsError;
    }

    // Return the full project by fetching it
    return await getProjectById(project.id);
  } catch (error) {
    console.error('Error in addProject:', error);
    toast({
      title: "Error creating project",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<Project | null> {
  try {
    // Update the main project
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        name: projectData.name,
        client_id: projectData.clientId,
        description: projectData.description,
        start_date: projectData.startDate?.toISOString(),
        deadline_date: projectData.endDate?.toISOString(),
        budget: projectData.price,
        status: projectData.status,
        project_type_id: projectData.projectTypeId,
        project_category_id: projectData.projectCategoryId
      })
      .eq('id', id);

    if (projectError) throw projectError;

    // Handle credentials updates (we'll just replace them all)
    if (projectData.credentials) {
      // First, delete all existing credentials
      const { error: deleteCredError } = await supabase
        .from('project_credentials')
        .delete()
        .eq('project_id', id)
        .eq('platform', 'website');

      if (deleteCredError) throw deleteCredError;

      // Then, add new website credentials
      const { error: websiteCredError } = await supabase
        .from('project_credentials')
        .insert({
          project_id: id,
          platform: 'website',
          username: projectData.credentials.username,
          password: projectData.credentials.password,
          notes: projectData.url
        });

      if (websiteCredError) throw websiteCredError;
    }

    // Handle hosting updates
    if (projectData.hosting) {
      // First, delete all existing hosting credentials
      const { error: deleteHostError } = await supabase
        .from('project_credentials')
        .delete()
        .eq('project_id', id)
        .eq('platform', 'hosting');

      if (deleteHostError) throw deleteHostError;

      // Then, add new hosting credentials
      const { error: hostingCredError } = await supabase
        .from('project_credentials')
        .insert({
          project_id: id,
          platform: 'hosting',
          username: projectData.hosting.credentials.username,
          password: projectData.hosting.credentials.password,
          notes: projectData.hosting.url
        });

      if (hostingCredError) throw hostingCredError;
    }

    // Handle other access updates (more complex)
    if (projectData.otherAccess) {
      // First, delete all existing other access credentials
      const { error: deleteOtherError } = await supabase
        .from('project_credentials')
        .delete()
        .eq('project_id', id)
        .not('platform', 'in', '("website","hosting")');

      if (deleteOtherError) throw deleteOtherError;

      // Then, add new other access credentials if there are any
      if (projectData.otherAccess.length > 0) {
        const otherAccessCredentials = projectData.otherAccess.map(access => ({
          project_id: id,
          platform: access.type,
          username: access.credentials.username,
          password: access.credentials.password,
          notes: access.notes
        }));

        const { error: otherCredError } = await supabase
          .from('project_credentials')
          .insert(otherAccessCredentials);

        if (otherCredError) throw otherCredError;
      }
    }

    // Handle payments updates
    if (projectData.payments) {
      // Delete all existing payments and add new ones
      const { error: deletePaymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('project_id', id);

      if (deletePaymentsError) throw deletePaymentsError;

      // Then, add new payments if there are any
      if (projectData.payments.length > 0) {
        const projectPayments = projectData.payments.map(payment => ({
          project_id: id,
          amount: payment.amount,
          payment_date: payment.date.toISOString(),
          description: payment.description,
          // No status field in the database
        }));

        const { error: paymentsError } = await supabase
          .from('payments')
          .insert(projectPayments);

        if (paymentsError) throw paymentsError;
      }
    }

    // Return the updated project
    return await getProjectById(id);
  } catch (error) {
    console.error('Error in updateProject:', error);
    toast({
      title: "Error updating project",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    // Delete the project (cascading should handle related records)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    toast({
      title: "Error deleting project",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}

export async function addPayment(
  projectId: string, 
  payment: Omit<Payment, 'id'>
): Promise<Payment | null> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        project_id: projectId,
        amount: payment.amount,
        payment_date: payment.date.toISOString(),
        description: payment.description,
        // No status field in the database
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      amount: data.amount,
      date: new Date(data.payment_date),
      description: data.description || '',
      status: 'completed' // Default to completed
    };
  } catch (error) {
    console.error('Error in addPayment:', error);
    toast({
      title: "Error adding payment",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return null;
  }
}
