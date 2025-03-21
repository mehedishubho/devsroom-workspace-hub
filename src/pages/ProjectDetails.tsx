
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Dashboard from "@/components/layout/Dashboard";
import ProjectForm from "@/components/ProjectForm";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, Calendar, DollarSign, Tag, FileText } from "lucide-react";
import PageTransition from "@/components/ui-custom/PageTransition";
import { sampleProjects, updateProject } from "@/data/projects";
import { Project } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PaymentItem from "@/components/ui-custom/PaymentItem";
import { Separator } from "@/components/ui/separator";
import InvoiceList from "@/components/InvoiceList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch project details
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      const foundProject = sampleProjects.find(p => p.id === projectId);
      
      if (foundProject) {
        setProject(foundProject);
        setIsLoading(false);
      } else {
        toast({
          title: "Project not found",
          description: "Could not find the requested project",
          variant: "destructive",
        });
        navigate("/");
      }
    }, 300);
    
    return () => clearTimeout(timer);
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

  const handleUpdateProject = (updatedProject: Project) => {
    if (project?.id) {
      const result = updateProject(project.id, updatedProject);
      if (result) {
        setProject(result);
        setIsEditFormOpen(false);
        
        toast({
          title: "Project updated",
          description: "Your changes have been saved successfully",
        });
      } else {
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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="access">Access & Credentials</TabsTrigger>
              <TabsTrigger value="invoices">Invoices & Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="col-span-1 lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                        <p>{project.description || "No description provided."}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Project URL</h3>
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {project.url}
                        </a>
                      </div>

                      {project.notes && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                          <p>{project.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                          ${project.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">Status</span>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
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
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="access" className="space-y-6 pt-4">
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
                          {project.credentials.username}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
                        <div className="font-mono text-sm bg-background p-2 rounded border">
                          {project.credentials.password}
                        </div>
                      </div>
                      {project.credentials.notes && (
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
                        <div className="text-sm">{project.hosting.provider}</div>
                      </div>
                      {project.hosting.url && (
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
                          {project.hosting.credentials.username}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
                        <div className="font-mono text-sm bg-background p-2 rounded border">
                          {project.hosting.credentials.password}
                        </div>
                      </div>
                      {project.hosting.notes && (
                        <div className="sm:col-span-2">
                          <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                          <div className="text-sm">{project.hosting.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {project.otherAccess.length > 0 && (
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
                                {access.credentials.username}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
                              <div className="font-mono text-sm bg-background p-2 rounded border">
                                {access.credentials.password}
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
            
            <TabsContent value="invoices" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <InvoiceList project={project} />
                </div>
                
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payments</CardTitle>
                      <CardDescription>Payment history and schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {project.payments.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No payments added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {project.payments.map((payment) => (
                            <PaymentItem key={payment.id} payment={payment} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
