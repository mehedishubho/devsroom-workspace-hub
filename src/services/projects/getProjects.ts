import { Project, OtherAccess, Payment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ensureValidProjectStatus } from "@/utils/dataMappers";

/**
 * Get all projects
 */
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
