import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Mail, Phone, Search, Save, Building, MapPin } from "lucide-react";
import { Client } from "@/types";
import { getClients, createClient } from "@/services/clientService";
import { getCompanies } from "@/services/companyService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Clients = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string | undefined>(
    searchParams.get("company") || undefined
  );
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientCity, setNewClientCity] = useState("");
  const [newClientState, setNewClientState] = useState("");
  const [newClientZipCode, setNewClientZipCode] = useState("");
  const [newClientCountry, setNewClientCountry] = useState("");
  const [newClientCompanyId, setNewClientCompanyId] = useState("");
  
  // Fetch clients
  const { data: fetchedClients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  // Fetch companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => createClient(clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Client added",
        description: "New client has been created successfully"
      });
    }
  });

  // Set clients when data is loaded
  useEffect(() => {
    setClients(fetchedClients);
    
    // Apply company filter
    const filtered = companyFilter 
      ? fetchedClients.filter(client => client.companyId === companyFilter)
      : fetchedClients;
    
    setFilteredClients(filtered);
  }, [fetchedClients, companyFilter]);

  // Filter clients when search query changes
  useEffect(() => {
    // First apply company filter
    let filtered = companyFilter 
      ? clients.filter(client => client.companyId === companyFilter)
      : clients;
    
    // Then apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        client => 
          client.name.toLowerCase().includes(query) || 
          client.email.toLowerCase().includes(query) ||
          (client.phone && client.phone.includes(query)) ||
          (client.address && client.address.toLowerCase().includes(query)) ||
          (client.city && client.city.toLowerCase().includes(query))
      );
    }
    
    setFilteredClients(filtered);
  }, [searchQuery, clients, companyFilter]);

  // Update URL when company filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (companyFilter) {
      params.set("company", companyFilter);
    }
    setSearchParams(params);
  }, [companyFilter, setSearchParams]);

  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleAddClient = () => {
    resetForm();
    // Set company ID from filter if present
    if (companyFilter) {
      setNewClientCompanyId(companyFilter);
    }
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");
    setNewClientCity("");
    setNewClientState("");
    setNewClientZipCode("");
    setNewClientCountry("");
    setNewClientCompanyId("");
  };

  const handleSaveClient = () => {
    if (!newClientName.trim() || !newClientEmail.trim() || !newClientCompanyId) {
      toast({
        title: "Missing information",
        description: "Name, email, and company are required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Check if client with the same name already exists in the same company
    const existingClient = clients.find(c => 
      c.name.toLowerCase() === newClientName.toLowerCase() && 
      c.companyId === newClientCompanyId
    );
    
    if (existingClient) {
      toast({
        title: "Client already exists",
        description: "A client with this name already exists in the selected company",
        variant: "destructive"
      });
      return;
    }
    
    createClientMutation.mutate({
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || undefined,
      address: newClientAddress || undefined,
      city: newClientCity || undefined,
      state: newClientState || undefined,
      zipCode: newClientZipCode || undefined,
      country: newClientCountry || undefined,
      companyId: newClientCompanyId
    });
  };

  const handleCompanyFilterChange = (companyId: string) => {
    setCompanyFilter(companyId);
  };

  const clearCompanyFilter = () => {
    setCompanyFilter(undefined);
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return "No Company";
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : "Unknown Company";
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

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="sm:max-w-[280px]">
              <Select value={companyFilter} onValueChange={handleCompanyFilterChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" onClick={clearCompanyFilter}>All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                    <span className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {getCompanyName(client.companyId)}
                    </span>
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
                  {(client.city || client.state || client.country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {[client.city, client.state, client.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
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
              {searchQuery || companyFilter ? (
                <p className="text-muted-foreground">No clients match your search criteria</p>
              ) : isLoadingClients || isLoadingCompanies ? (
                <p className="text-muted-foreground">Loading clients...</p>
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client to manage their projects
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="clientCompany" className="text-sm font-medium">
                  Company <span className="text-destructive">*</span>
                </label>
                <Select 
                  value={newClientCompanyId} 
                  onValueChange={setNewClientCompanyId}
                >
                  <SelectTrigger id="clientCompany">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientName" className="text-sm font-medium">
                  Client Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="clientName"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientEmail" className="text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="e.g., john@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientPhone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="clientPhone"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="e.g., 123-456-7890"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientAddress" className="text-sm font-medium">
                  Street Address
                </label>
                <Input
                  id="clientAddress"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="e.g., 123 Main St, Apt 4B"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="clientCity" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="clientCity"
                    value={newClientCity}
                    onChange={(e) => setNewClientCity(e.target.value)}
                    placeholder="e.g., New York"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="clientState" className="text-sm font-medium">
                    State/Province
                  </label>
                  <Input
                    id="clientState"
                    value={newClientState}
                    onChange={(e) => setNewClientState(e.target.value)}
                    placeholder="e.g., NY"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="clientZipCode" className="text-sm font-medium">
                    Zip/Postal Code
                  </label>
                  <Input
                    id="clientZipCode"
                    value={newClientZipCode}
                    onChange={(e) => setNewClientZipCode(e.target.value)}
                    placeholder="e.g., 10001"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="clientCountry" className="text-sm font-medium">
                    Country
                  </label>
                  <Input
                    id="clientCountry"
                    value={newClientCountry}
                    onChange={(e) => setNewClientCountry(e.target.value)}
                    placeholder="e.g., USA"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveClient} 
                className="gap-1"
                disabled={createClientMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {createClientMutation.isPending ? "Saving..." : "Save Client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </Dashboard>
  );
};

export default Clients;
