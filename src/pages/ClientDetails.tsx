import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  getClientById, 
  getProjectsByClientId, 
  updateClient, 
  deleteClient 
} from "@/data/clients";
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
    if (!clientId) return;
    
    const fetchedClient = getClientById(clientId);
    if (fetchedClient) {
      setClient(fetchedClient);
      setName(fetchedClient.name);
      setEmail(fetchedClient.email);
      setPhone(fetchedClient.phone || "");
      
      const clientProjects = getProjectsByClientId(clientId);
      setProjects(clientProjects);
    } else {
      toast({
        title: "Client not found",
        description: "Could not find the requested client",
        variant: "destructive",
      });
      navigate("/clients");
    }
    
    setIsLoading(false);
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

  const handleSaveEdit = () => {
    if (!client || !clientId) return;
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing information",
        description: "Name and email are required fields",
        variant: "destructive"
      });
      return;
    }
    
    const updatedClient = updateClient(clientId, {
      name,
      email,
      phone
    });
    
    if (updatedClient) {
      setClient(updatedClient);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Client updated",
        description: "Client information has been saved successfully"
      });
    } else {
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

  const confirmDelete = () => {
    if (!clientId) return;
    
    const success = deleteClient(clientId);
    
    if (success) {
      toast({
        title: "Client deleted",
        description: "The client has been removed successfully"
      });
      navigate("/clients");
    } else {
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
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
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
                    <span>{client.email}</span>
                  </div>
                  
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Client since {new Date(client.createdAt).toLocaleDateString()}
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
                    onClick={() => navigate("/projects/new", { state: { clientId: client.id } })}
                    size="sm"
                  >
                    Add Project
                  </Button>
                </div>

                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      onClick={() => navigate("/projects/new", { state: { clientId: client.id } })}
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
