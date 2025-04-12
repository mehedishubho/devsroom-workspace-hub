
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, ListFilter, X } from "lucide-react";
import Dashboard from "@/components/layout/Dashboard";
import SearchBar from "@/components/ui-custom/SearchBar";
import ProjectCard from "@/components/ui-custom/ProjectCard";
import EmptyState from "@/components/ui-custom/EmptyState";
import AddProjectButton from "@/components/ui-custom/AddProjectButton";
import ProjectForm from "@/components/ProjectForm";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Project, Company, Client } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/services/projects";
import { getProjectTypes, getProjectCategories } from "@/services/projectTypeService";
import { getCompanies } from "@/services/companyService";
import { getClients } from "@/services/clientService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Projects = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(
    searchParams.get("type") || undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get("category") || undefined
  );
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>(
    searchParams.get("company") || undefined
  );
  const [selectedClient, setSelectedClient] = useState<string | undefined>(
    searchParams.get("client") || undefined
  );
  
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableClients, setAvailableClients] = useState<any[]>([]);

  // Fetch projects using React Query
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  // Fetch project types using React Query
  const {
    data: projectTypes = [],
    isLoading: isLoadingTypes
  } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: getProjectTypes
  });

  // Fetch project categories using React Query
  const {
    data: projectCategories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['projectCategories'],
    queryFn: getProjectCategories
  });

  // Fetch companies
  const {
    data: companies = [],
    isLoading: isLoadingCompanies
  } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  // Fetch clients
  const {
    data: clients = [],
    isLoading: isLoadingClients
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedCompany) params.set("company", selectedCompany);
    if (selectedClient) params.set("client", selectedClient);
    setSearchParams(params);
  }, [selectedType, selectedCategory, selectedCompany, selectedClient, setSearchParams]);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        project.name.toLowerCase().includes(query) ||
        project.clientName.toLowerCase().includes(query) ||
        (project.url && project.url.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }
    
    // Filter by project type
    if (selectedType && project.projectTypeId !== selectedType) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && project.projectCategoryId !== selectedCategory) {
      return false;
    }
    
    // Filter by client
    if (selectedClient && project.clientId !== selectedClient) {
      return false;
    }
    
    // Filter by company (needs to find associated client's company)
    if (selectedCompany) {
      const client = clients.find(c => c.id === project.clientId);
      if (!client || client.companyId !== selectedCompany) {
        return false;
      }
    }
    
    return true;
  });

  // Update available categories when selected type changes
  useEffect(() => {
    if (selectedType) {
      const categories = projectCategories.filter(
        category => category.projectTypeId === selectedType
      );
      setAvailableCategories(categories);
      
      // Reset the selected category if it's no longer available
      if (selectedCategory) {
        const categoryExists = categories.some(c => c.id === selectedCategory);
        if (!categoryExists) {
          setSelectedCategory(undefined);
        }
      }
    } else {
      setAvailableCategories(projectCategories);
    }
  }, [selectedType, selectedCategory, projectCategories]);

  // Update available clients when selected company changes
  useEffect(() => {
    if (selectedCompany) {
      const filteredClients = clients.filter(
        client => client.companyId === selectedCompany
      );
      setAvailableClients(filteredClients);
      
      // Reset the selected client if it's no longer available
      if (selectedClient) {
        const clientExists = filteredClients.some(c => c.id === selectedClient);
        if (!clientExists) {
          setSelectedClient(undefined);
        }
      }
    } else {
      setAvailableClients(clients);
    }
  }, [selectedCompany, selectedClient, clients]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleAddProject = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveProject = async (data: Project) => {
    try {
      // Note: Implementation in ProjectForm component
      setIsFormOpen(false);
      refetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error saving project",
        description: "An unexpected error occurred while saving the project.",
        variant: "destructive"
      });
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const clearFilters = () => {
    setSelectedType(undefined);
    setSelectedCategory(undefined);
    setSelectedCompany(undefined);
    setSelectedClient(undefined);
    setSearchParams({});
  };

  // Show loading state
  if (isLoadingProjects || isLoadingTypes || isLoadingCategories || isLoadingCompanies || isLoadingClients) {
    return (
      <Dashboard>
        <PageTransition>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Loading projects...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your data.</p>
            </div>
          </div>
        </PageTransition>
      </Dashboard>
    );
  }

  // Show error state
  if (isProjectsError) {
    return (
      <Dashboard>
        <PageTransition>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-destructive">Error loading projects</h3>
              <p className="text-muted-foreground">There was an error fetching your projects.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => refetchProjects()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </PageTransition>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
              <p className="text-muted-foreground mt-1">
                View and manage all your freelance projects
              </p>
            </div>
            <AddProjectButton onClick={handleAddProject} />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} placeholder="Search by project name, client, or URL..." />
              </div>
              <Button
                variant={isFilterOpen ? "default" : "outline"}
                onClick={toggleFilter}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>

            {isFilterOpen && (
              <div className="bg-secondary/10 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filter Projects</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger>
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
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Client</label>
                    <Select 
                      value={selectedClient} 
                      onValueChange={setSelectedClient}
                      disabled={availableClients.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                      disabled={availableCategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <EmptyState
              title={searchQuery || selectedType || selectedCategory || selectedCompany || selectedClient ? "No matching projects" : "No projects yet"}
              description={
                searchQuery || selectedType || selectedCategory || selectedCompany || selectedClient
                  ? "Try adjusting your search query or filters."
                  : "Create your first project to get started."
              }
              icon={searchQuery || selectedType || selectedCategory || selectedCompany || selectedClient ? <ListFilter className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
              action={
                searchQuery || selectedType || selectedCategory || selectedCompany || selectedClient
                  ? undefined
                  : {
                      label: "Add Project",
                      onClick: handleAddProject,
                    }
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                />
              ))}
            </div>
          )}
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="py-4">
              <h2 className="text-xl font-semibold mb-6">Add New Project</h2>
              <ProjectForm 
                onSubmit={handleSaveProject} 
                onCancel={handleCloseForm} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </Dashboard>
  );
};

export default Projects;
