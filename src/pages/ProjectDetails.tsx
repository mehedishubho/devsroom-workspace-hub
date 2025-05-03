
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Dashboard from "@/components/layout/Dashboard";
import ProjectForm from "@/components/ProjectForm";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, Calendar, DollarSign, Tag, FileText } from "lucide-react";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Project, ensureValidStatus } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PaymentItemWithCurrency from "@/components/ui-custom/PaymentItemWithCurrency";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { updateProject } from "@/services/projects";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'on-hold':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'in-progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getDisplayStatus = (status: string, originalStatus?: string) => {
    if (status === 'active' && originalStatus === 'in-progress') {
      return 'In Progress';
    }
    
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                size="icon" 
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">Client: {project.clientName}</p>
              </div>
            </div>
            <Button onClick={handleEdit} className="gap-2">
              <Pencil className="h-4 w-4" /> Edit Project
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="col-span-1 lg:col-span-3 space-y-6">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Project Name</h3>
                          <p className="font-semibold">{project.name}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
                          <p>{project.clientName}</p>
                        </div>

                        {project.projectType && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Project Type</h3>
                            <p>{project.projectType}</p>
                          </div>
                        )}
                        
                        {project.projectCategory && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                            <p>{project.projectCategory}</p>
                          </div>
                        )}
                      </div>

                      <Separator className="my-2" />
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                        <p>{project.description || "No description provided."}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Project URL</h3>
                        {project.url ? (
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            {project.url}
                          </a>
                        ) : (
                          <p className="text-muted-foreground italic">No URL provided.</p>
                        )}
                      </div>

                      {project.notes && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                          <p>{project.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payments</CardTitle>
                      <CardDescription>Payment history and schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!project.payments || project.payments.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No payments added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {project.payments.map((payment, index) => (
                            <PaymentItemWithCurrency 
                              key={payment.id || index} 
                              payment={payment}
                              onUpdate={() => {}} 
                              onDelete={() => {}}
                              editable={false}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Access & Credentials</CardTitle>
                      <CardDescription>Project access information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Project Credentials</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-md">
                          <div>
                            <h4 className="text-xs text-muted-foreground mb-1">Username</h4>
                            <div className="font-mono text-sm bg-background p-2 rounded border">
                              {project.credentials?.username || "No username provided"}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
                            <div className="font-mono text-sm bg-background p-2 rounded border">
                              {project.credentials?.password || "No password provided"}
                            </div>
                          </div>
                          {project.credentials?.notes && (
                            <div className="sm:col-span-2">
                              <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                              <div className="text-sm">{project.credentials.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Hosting Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-md">
                          <div>
                            <h4 className="text-xs text-muted-foreground mb-1">Provider</h4>
                            <div className="text-sm">{project.hosting?.provider || "No provider specified"}</div>
                          </div>
                          {project.hosting?.url && (
                            <div>
                              <h4 className="text-xs text-muted-foreground mb-1">URL</h4>
                              <a 
                                href={project.hosting.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm break-all"
                              >
                                {project.hosting.url}
                              </a>
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs text-muted-foreground mb-1">Username</h4>
                            <div className="font-mono text-sm bg-background p-2 rounded border">
                              {project.hosting?.credentials?.username || "No username provided"}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
                            <div className="font-mono text-sm bg-background p-2 rounded border">
                              {project.hosting?.credentials?.password || "No password provided"}
                            </div>
                          </div>
                          {project.hosting?.notes && (
                            <div className="sm:col-span-2">
                              <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                              <div className="text-sm">{project.hosting.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {project.otherAccess && project.otherAccess.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Other Access</h3>
                            {project.otherAccess.map((access) => (
                              <div 
                                key={access.id} 
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-md"
                              >
                                <div className="sm:col-span-2 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{access.name}</h4>
                                    <span className="text-xs uppercase text-muted-foreground">{access.type}</span>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs text-muted-foreground mb-1">Username</h4>
                                  <div className="font-mono text-sm bg-background p-2 rounded border">
                                    {access.credentials?.username || "No username provided"}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
                                  <div className="font-mono text-sm bg-background p-2 rounded border">
                                    {access.credentials?.password || "No password provided"}
                                  </div>
                                </div>
                                {access.notes && (
                                  <div className="sm:col-span-2">
                                    <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                                    <div className="text-sm">{access.notes}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Start Date</span>
                    </div>
                    <span className="text-sm font-medium">
                      {format(new Date(project.startDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  
                  {project.endDate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">End Date</span>
                      </div>
                      <span className="text-sm font-medium">
                        {format(new Date(project.endDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Project Price</span>
                    </div>
                    <span className="text-sm font-medium">
                      ${project.price ? project.price.toLocaleString() : '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Status</span>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {getDisplayStatus(project.status, project.originalStatus)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Created</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(project.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Updated</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(project.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {project.payments && project.payments.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="pt-2">
                        <h3 className="text-sm font-medium mb-3">Payment Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Payments</span>
                            <span className="font-medium">{project.payments.length}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Amount Paid</span>
                            <span className="font-medium">
                              ${project.payments.reduce((acc, payment) => 
                                payment.status === 'completed' ? acc + Number(payment.amount) : acc, 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Amount Pending</span>
                            <span className="font-medium">
                              ${project.payments.reduce((acc, payment) => 
                                payment.status === 'pending' ? acc + Number(payment.amount) : acc, 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Make changes to the project information</DialogDescription>
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
