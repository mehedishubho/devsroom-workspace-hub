
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Mail, Phone, Search, Save } from "lucide-react";
import { Client } from "@/types";
import { sampleClients, addClient, getClientByName } from "@/data/clients";

const Clients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  useEffect(() => {
    // Load clients
    setClients(sampleClients);
    setFilteredClients(sampleClients);
  }, []);

  useEffect(() => {
    // Filter clients when search query changes
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(
        client => 
          client.name.toLowerCase().includes(query) || 
          client.email.toLowerCase().includes(query) ||
          (client.phone && client.phone.includes(query))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleAddClient = () => {
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setIsAddDialogOpen(true);
  };

  const handleSaveClient = () => {
    if (!newClientName.trim() || !newClientEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Name and email are required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Check if client with the same name already exists
    const existingClient = getClientByName(newClientName);
    if (existingClient) {
      toast({
        title: "Client already exists",
        description: "A client with this name already exists",
        variant: "destructive"
      });
      return;
    }
    
    const newClient = addClient({
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || undefined
    });
    
    setClients([...sampleClients]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Client added",
      description: "New client has been created successfully"
    });
    
    // Navigate to the new client's page
    navigate(`/clients/${newClient.id}`);
  };

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
              <p className="text-muted-foreground">
                Manage your clients and their projects
              </p>
            </div>
            <Button onClick={handleAddClient} className="gap-1">
              <Plus className="h-4 w-4" /> Add Client
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card 
                key={client.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewClient(client.id)}
              >
                <CardHeader>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>
                    Client since {new Date(client.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" onClick={() => handleViewClient(client.id)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-lg">
              {searchQuery ? (
                <p className="text-muted-foreground">No clients match your search</p>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No clients yet. Add your first client!</p>
                  <Button onClick={handleAddClient}>Add Client</Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Add Client Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client to manage their projects
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="clientName" className="text-sm font-medium">
                  Client Name
                </label>
                <Input
                  id="clientName"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientEmail" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="e.g., contact@acme.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientPhone" className="text-sm font-medium">
                  Phone Number (Optional)
                </label>
                <Input
                  id="clientPhone"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="e.g., 123-456-7890"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveClient} className="gap-1">
                <Save className="h-4 w-4" />
                Save Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </Dashboard>
  );
};

export default Clients;
