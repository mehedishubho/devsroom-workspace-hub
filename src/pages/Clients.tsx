
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, UserRound, Mail, Phone, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import SearchBar from "@/components/ui-custom/SearchBar";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sampleClients } from "@/data/clients";
import { clientProjects } from "@/data/clients";
import { Client, Project } from "@/types";
import ProjectCard from "@/components/ui-custom/ProjectCard";

// Form schema for client
const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const ClientDetails = ({ client, projects, onClose, onEdit, onDelete }: { 
  client: Client; 
  projects: Project[];
  onClose: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <div className="flex items-center space-x-2 mt-1 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center space-x-2 mt-1 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(client)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(client.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Client Projects</h3>
        {projects.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No projects for this client yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ClientForm = ({ 
  client, 
  onSubmit, 
  onCancel 
}: { 
  client?: Client; 
  onSubmit: (data: ClientFormValues) => void; 
  onCancel: () => void; 
}) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {client ? "Update Client" : "Add Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [projects, setProjects] = useState<Project[]>(clientProjects);
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter clients based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          (client.phone && client.phone.includes(query))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleAddClient = () => {
    setIsEditMode(false);
    setIsClientFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditMode(true);
    setIsClientFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsClientFormOpen(false);
    setSelectedClient(null);
  };

  const handleDeletePrompt = (clientId: string) => {
    setClientToDelete(clientId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClient = () => {
    if (clientToDelete) {
      setClients(clients.filter(client => client.id !== clientToDelete));
      
      // If deleted client was selected, close the details view
      if (selectedClient && selectedClient.id === clientToDelete) {
        setSelectedClient(null);
      }
      
      toast({
        title: "Client deleted",
        description: "Client has been deleted successfully.",
      });
      
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleSubmitClient = (data: ClientFormValues) => {
    if (isEditMode && selectedClient) {
      // Update client
      const updatedClients = clients.map(client => 
        client.id === selectedClient.id 
          ? { 
              ...client, 
              name: data.name, 
              email: data.email, 
              phone: data.phone || "",
              updatedAt: new Date()
            } 
          : client
      );
      
      setClients(updatedClients);
      
      // Update client name in projects
      const updatedProjects = projects.map(project => 
        project.clientId === selectedClient.id 
          ? { ...project, clientName: data.name } 
          : project
      );
      
      setProjects(updatedProjects);
      
      toast({
        title: "Client updated",
        description: "Client information has been updated successfully.",
      });
      
      // Update selected client with new data
      setSelectedClient({
        ...selectedClient,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        updatedAt: new Date()
      });
    } else {
      // Add new client
      const newClient: Client = {
        id: Math.random().toString(36).substring(2, 11),
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setClients([newClient, ...clients]);
      
      toast({
        title: "Client added",
        description: "New client has been added successfully.",
      });
    }
    
    setIsClientFormOpen(false);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleCloseDetails = () => {
    setSelectedClient(null);
  };

  // Get client's projects
  const getClientProjects = (clientId: string) => {
    return projects.filter(project => project.clientId === clientId);
  };

  return (
    <Dashboard>
      <PageTransition>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Manage your client information</p>
          </div>
          <Button onClick={handleAddClient} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add Client
          </Button>
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} placeholder="Search clients..." />
        </div>

        <div className="grid gap-6">
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No clients yet</h3>
                <p className="text-muted-foreground mb-4">Add your first client to get started</p>
                <Button onClick={handleAddClient} className="gap-2">
                  <PlusCircle className="h-4 w-4" /> Add Client
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Client List</CardTitle>
                <CardDescription>Manage your clients and their projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredClients.map((client, index) => (
                    <div key={client.id}>
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{client.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            <span>{client.email}</span>
                            {client.phone && <span> • {client.phone}</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeletePrompt(client.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Client Form Dialog */}
        <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Client" : "Add New Client"}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Update the client's information" 
                  : "Enter the details for the new client"}
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
              client={isEditMode ? selectedClient || undefined : undefined} 
              onSubmit={handleSubmitClient} 
              onCancel={handleCloseForm} 
            />
          </DialogContent>
        </Dialog>

        {/* Client Details Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <ClientDetails 
                client={selectedClient} 
                projects={getClientProjects(selectedClient.id)}
                onClose={handleCloseDetails}
                onEdit={handleEditClient}
                onDelete={handleDeletePrompt}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this client? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteClient}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </Dashboard>
  );
};

export default Clients;
