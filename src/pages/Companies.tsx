
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, Plus, Edit, Trash2, Users, Search } from "lucide-react";

import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { getCompanies, createCompany, updateCompany, deleteCompany } from "@/services/companyService";
import { getClientsByCompanyId } from "@/services/clientService";
import { Company } from "@/types";

const Companies = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsAddDialogOpen(false);
      setCompanyName("");
      toast({
        title: "Company created",
        description: "Company has been created successfully"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, name: string }) => 
      updateCompany(data.id, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      toast({
        title: "Company updated",
        description: "Company has been updated successfully"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['companies'] });
        setIsDeleteDialogOpen(false);
        setSelectedCompany(null);
        toast({
          title: "Company deleted",
          description: "Company has been deleted successfully"
        });
      }
    }
  });

  // Filter companies based on search
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCompany = () => {
    setCompanyName("");
    setIsAddDialogOpen(true);
  };

  const handleEditCompany = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompany(company);
    setCompanyName(company.name);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCompany = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCompany = () => {
    if (!companyName.trim()) {
      toast({
        title: "Missing information",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }
    
    createMutation.mutate(companyName);
  };

  const handleUpdateCompany = () => {
    if (!companyName.trim() || !selectedCompany) {
      toast({
        title: "Missing information",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }
    
    updateMutation.mutate({ id: selectedCompany.id, name: companyName });
  };

  const handleConfirmDelete = () => {
    if (!selectedCompany) return;
    deleteMutation.mutate(selectedCompany.id);
  };

  const handleViewCompanyClients = (companyId: string) => {
    navigate(`/clients?company=${companyId}`);
  };

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
              <p className="text-muted-foreground">
                Manage your companies and their clients
              </p>
            </div>
            <Button onClick={handleAddCompany} className="gap-1">
              <Plus className="h-4 w-4" /> Add Company
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewCompanyClients(company.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{company.name}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleEditCompany(company, e)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDeleteCompany(company, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 py-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Company since {new Date(company.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleViewCompanyClients(company.id)}
                  >
                    <Users className="h-4 w-4" />
                    View Clients
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-lg">
              {searchQuery ? (
                <p className="text-muted-foreground">No companies match your search</p>
              ) : isLoading ? (
                <p className="text-muted-foreground">Loading companies...</p>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No companies yet. Add your first company!</p>
                  <Button onClick={handleAddCompany}>Add Company</Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Add Company Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Create a new company to organize your clients
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
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
              <Button 
                onClick={handleSaveCompany}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save Company"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Company Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <DialogDescription>
                Update company information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="editCompanyName" className="text-sm font-medium">
                  Company Name
                </label>
                <Input
                  id="editCompanyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
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
              <Button 
                onClick={handleUpdateCompany}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Company"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Company Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                company {selectedCompany?.name}.
                <br /><br />
                <span className="font-medium text-destructive">Note:</span> You cannot delete a company that has clients.
                Please reassign or delete the clients first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageTransition>
    </Dashboard>
  );
};

export default Companies;
