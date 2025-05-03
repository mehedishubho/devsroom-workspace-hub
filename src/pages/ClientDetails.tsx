import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  getClientById,
  addClient,
  updateClient 
} from "@/services/clientService";
import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import ProjectCard from "@/components/ui-custom/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Mail, 
  Phone, 
  Calendar, 
  Save 
} from "lucide-react";
import { Client, Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }
    
    const fetchClientData = async () => {
      try {
        // First try to fetch from Supabase
        const { data: supabaseClient, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (supabaseClient) {
          // Convert Supabase client to our Client format
          const clientData: Client = {
            id: supabaseClient.id,
            name: supabaseClient.name,
            email: supabaseClient.email,
            phone: supabaseClient.phone || "",
            address: supabaseClient.address,
            city: supabaseClient.city,
            state: supabaseClient.state,
            zipCode: supabaseClient.zip_code,
            country: supabaseClient.country,
            companyId: supabaseClient.company_id,
            createdAt: new Date(supabaseClient.created_at),
            updatedAt: new Date(supabaseClient.updated_at)
          };
          
          setClient(clientData);
          setName(clientData.name);
          setEmail(clientData.email);
          setPhone(clientData.phone || "");
          
          // Fetch client's projects
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', clientId);
            
          if (projectsError) throw projectsError;
          
          if (projectsData && projectsData.length > 0) {
            // Fetch client name for each project
            const formattedProjects = projectsData.map(project => ({
              id: project.id,
              name: project.name,
              clientId: project.client_id,
              clientName: clientData.name,
              description: project.description || "",
              url: "",
              credentials: { username: "", password: "" },
              hosting: { provider: "", credentials: { username: "", password: "" } },
              otherAccess: [],
              startDate: new Date(project.start_date),
              endDate: project.deadline_date ? new Date(project.deadline_date) : undefined,
              price: project.budget || 0,
              payments: [],
              status: project.status as 'active' | 'completed' | 'on-hold' | 'cancelled' | 'under-revision',
              projectTypeId: project.project_type_id,
              projectCategoryId: project.project_category_id,
              notes: project.description,
              createdAt: new Date(project.created_at),
              updatedAt: new Date(project.updated_at)
            }));
            
            setProjects(formattedProjects);
          } else {
            setProjects([]);
          }
        } else {
          // If client not found in Supabase
          const clientFromService = await getClientById(clientId);
          if (clientFromService) {
            setClient(clientFromService);
            setName(clientFromService.name);
            setEmail(clientFromService.email);
            setPhone(clientFromService.phone || "");
            
            // For projects, fetch from Supabase
            const { data: projectsData } = await supabase
              .from('projects')
              .select('*')
              .eq('client_id', clientId);
            
            if (projectsData && projectsData.length > 0) {
              const formattedProjects = projectsData.map(project => ({
                id: project.id,
                name: project.name,
                clientId: project.client_id,
                clientName: clientFromService.name,
                description: project.description || "",
                url: "",
                credentials: { username: "", password: "" },
                hosting: { provider: "", credentials: { username: "", password: "" } },
                otherAccess: [],
                startDate: new Date(project.start_date),
                endDate: project.deadline_date ? new Date(project.deadline_date) : undefined,
                price: project.budget || 0,
                payments: [],
                status: project.status as 'active' | 'completed' | 'on-hold' | 'cancelled' | 'under-revision',
                projectTypeId: project.project_type_id,
                projectCategoryId: project.project_category_id,
                notes: project.description,
                createdAt: new Date(project.created_at),
                updatedAt: new Date(project.updated_at)
              }));
              
              setProjects(formattedProjects);
            } else {
              setProjects([]);
            }
          } else {
            toast({
              title: "Client not found",
              description: "Could not find the requested client",
              variant: "destructive",
            });
            navigate("/clients");
          }
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast({
          title: "Error loading client",
          description: "There was a problem loading the client details",
          variant: "destructive",
        });
        navigate("/clients");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId, navigate, toast]);

  const handleBack = () => {
    navigate("/clients");
  };

  const handleEdit = () => {
    if (!client) return;
    
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!client || !clientId) return;
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing information",
        description: "Name and email are required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Try to update in Supabase first
      const { data: updatedClient, error } = await supabase
        .from('clients')
        .update({ 
          name, 
          email, 
          phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      
      if (updatedClient) {
        // Convert to our Client format
        const clientData: Client = {
          id: updatedClient.id,
          name: updatedClient.name,
          email: updatedClient.email,
          phone: updatedClient.phone || "",
          address: updatedClient.address,
          city: updatedClient.city,
          state: updatedClient.state,
          zipCode: updatedClient.zip_code,
          country: updatedClient.country,
          companyId: updatedClient.company_id,
          createdAt: new Date(updatedClient.created_at),
          updatedAt: new Date(updatedClient.updated_at)
        };
        
        setClient(clientData);
        setIsEditDialogOpen(false);
        
        toast({
          title: "Client updated",
          description: "Client information has been saved successfully"
        });
      } else {
        // Fallback to service update
        const updatedClientData = await updateClient(clientId, {
          name,
          email,
          phone
        });
        
        if (updatedClientData) {
          setClient(updatedClientData);
          setIsEditDialogOpen(false);
          
          toast({
            title: "Client updated",
            description: "Client information has been saved successfully"
          });
        } else {
          throw new Error("Failed to update client");
        }
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Could not update client information",
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientId) return;
    
    try {
      // Try to delete from Supabase
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
        
      if (error) throw error;
      
      toast({
        title: "Client deleted",
        description: "The client has been removed successfully"
      });
      navigate("/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      
      toast({
        title: "Error",
        description: "Could not delete the client",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Dashboard>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading client details...</p>
        </div>
      </Dashboard>
    );
  }

  if (!client) {
    return (
      <Dashboard>
        <div className="flex flex-col items-center justify-center h-96">
          <h3 className="text-xl font-semibold text-destructive">Client not found</h3>
          <p className="mt-2 text-muted-foreground">The requested client could not be found</p>
          <Button 
            variant="outline" 
            onClick={handleBack} 
            className="mt-4"
          >
            Back to Clients
          </Button>
        </div>
      </Dashboard>
    );
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
              <h1 className="text-3xl font-bold tracking-tight">{client?.name}</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleEdit}
                className="gap-1"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="gap-1"
              >
                <Trash className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client?.email}</span>
                  </div>
                  
                  {client?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Client since {client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Client Projects</h2>
                  <Button 
                    onClick={() => navigate("/projects/new", { state: { clientId: client?.id } })}
                    size="sm"
                  >
                    Add Project
                  </Button>
                </div>

                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">
                      No projects found for this client
                    </p>
                    <Button 
                      onClick={() => navigate("/projects/new", { state: { clientId: client?.id } })}
                    >
                      Create First Project
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update the client information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Client Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="gap-1">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the client and remove the client association from all their projects.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageTransition>
    </Dashboard>
  );
};

export default ClientDetails;
