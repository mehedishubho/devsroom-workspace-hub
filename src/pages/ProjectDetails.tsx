
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Dashboard from "@/components/layout/Dashboard";
import ProjectForm from "@/components/ProjectForm";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Project, ensureValidStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { updateProject } from "@/services/projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectHeader from "@/components/project-details/ProjectHeader";
import ProjectStatusCard from "@/components/project-details/ProjectStatusCard";
import ProjectOverviewTab from "@/components/project-details/ProjectOverviewTab";
import ProjectPaymentsTab from "@/components/project-details/ProjectPaymentsTab";
import ProjectCredentialsTab from "@/components/project-details/ProjectCredentialsTab";
import { getDisplayStatus, getStatusColor } from "@/components/project-details/utils";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        toast({
          title: "Project ID missing",
          description: "Could not find the project ID in the URL",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            clients(*)
          `)
          .eq('id', projectId)
          .single();

        if (projectError || !projectData) {
          throw new Error("Project not found");
        }

        let projectTypeName = '';
        let projectCategoryName = '';

        if (projectData.project_type_id) {
          const { data: typeData } = await supabase
            .from('project_types')
            .select('name')
            .eq('id', projectData.project_type_id)
            .maybeSingle();
          
          projectTypeName = typeData?.name || '';
        }

        if (projectData.project_category_id) {
          const { data: categoryData } = await supabase
            .from('project_categories')
            .select('name')
            .eq('id', projectData.project_category_id)
            .maybeSingle();
          
          projectCategoryName = categoryData?.name || '';
        }

        const url = typeof projectData.url === 'string' ? projectData.url : '';
        const originalStatus = typeof projectData.original_status === 'string' 
          ? projectData.original_status 
          : projectData.status ? String(projectData.status) : 'active';

        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('project_id', projectId);

        const { data: credentialsData } = await supabase
          .from('project_credentials')
          .select('*')
          .eq('project_id', projectId);

        let mainCredentials = { username: '', password: '', notes: '' };
        let hostingCredentials = { provider: '', credentials: { username: '', password: '' }, notes: '', url: '' };
        const otherAccess = [];

        if (credentialsData && Array.isArray(credentialsData)) {
          for (const cred of credentialsData) {
            if (cred.platform === 'main') {
              mainCredentials = {
                username: cred.username || '',
                password: cred.password || '',
                notes: cred.notes || ''
              };
            } else if (cred.platform && cred.platform.startsWith('hosting-')) {
              const provider = cred.platform.replace('hosting-', '');
              hostingCredentials = {
                provider,
                credentials: {
                  username: cred.username || '',
                  password: cred.password || ''
                },
                notes: cred.notes || '',
                url: ''
              };
            } else if (cred.platform) {
              const parts = cred.platform.split('-');
              const type = parts[0];
              const name = parts.slice(1).join('-');
              
              if (type && name) {
                otherAccess.push({
                  id: cred.id,
                  type: type as 'email' | 'ftp' | 'ssh' | 'cms' | 'other',
                  name,
                  credentials: {
                    username: cred.username || '',
                    password: cred.password || ''
                  },
                  notes: cred.notes || ''
                });
              }
            }
          }
        }

        const payments = Array.isArray(paymentsData) ? paymentsData.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: new Date(payment.payment_date),
          description: payment.description || '',
          status: payment.payment_method as 'pending' | 'completed',
          currency: payment.currency || 'USD'
        })) : [];

        payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const formattedProject: Project = {
          id: projectData.id,
          name: projectData.name,
          clientId: projectData.client_id,
          clientName: projectData.clients?.name || 'Unknown Client',
          description: projectData.description || '',
          url: url,
          startDate: new Date(projectData.start_date),
          endDate: projectData.deadline_date ? new Date(projectData.deadline_date) : undefined,
          price: projectData.budget || 0,
          status: ensureValidStatus(projectData.status || 'active'),
          originalStatus: originalStatus,
          projectTypeId: projectData.project_type_id,
          projectCategoryId: projectData.project_category_id,
          projectType: projectTypeName,
          projectCategory: projectCategoryName,
          credentials: mainCredentials,
          hosting: hostingCredentials,
          otherAccess,
          payments,
          createdAt: new Date(projectData.created_at),
          updatedAt: new Date(projectData.updated_at)
        };

        setProject(formattedProject);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Project not found",
          description: "Could not find the requested project",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate, toast]);

  const handleBack = () => {
    navigate("/");
  };

  const handleEdit = () => {
    setIsEditFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsEditFormOpen(false);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    if (project?.id) {
      try {
        const result = await updateProject(project.id, updatedProject);
        if (result) {
          setProject(result);
          setIsEditFormOpen(false);
          
          toast({
            title: "Project updated",
            description: "Your changes have been saved successfully",
          });
        } else {
          throw new Error("Failed to update project");
        }
      } catch (error) {
        console.error('Error updating project:', error);
        toast({
          title: "Update failed",
          description: "Could not update the project. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Dashboard>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading project details...</p>
        </div>
      </Dashboard>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-8">
          <ProjectHeader 
            name={project.name}
            clientName={project.clientName}
            onBack={handleBack}
            onEdit={handleEdit}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="col-span-1 lg:col-span-3 space-y-6">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <ProjectOverviewTab project={project} />
                </TabsContent>

                <TabsContent value="payments" className="space-y-6">
                  <ProjectPaymentsTab payments={project.payments} />
                </TabsContent>

                <TabsContent value="credentials" className="space-y-6">
                  <ProjectCredentialsTab project={project} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="col-span-1 space-y-6">
              <ProjectStatusCard 
                project={project} 
                getStatusColor={getStatusColor}
                getDisplayStatus={getDisplayStatus}
              />
            </div>
          </div>
        </div>

        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Edit Project</DialogTitle>
            <div className="py-4">
              <ProjectForm 
                initialData={project} 
                onSubmit={handleUpdateProject} 
                onCancel={handleCloseForm} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </Dashboard>
  );
};

export default ProjectDetails;
