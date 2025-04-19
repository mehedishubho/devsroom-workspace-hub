import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Dashboard from "@/components/layout/Dashboard";
import ProjectForm from "@/components/ProjectForm";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/services/projects";
import { getProjectTypes, getProjectCategories } from "@/services/projectTypeService";
import { getCompanies } from "@/services/companyService";
import { getClients } from "@/services/clientService";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { ProjectList } from "@/components/projects/ProjectList";

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

  const { 
    data: projects = [], 
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  });

  const {
    data: projectTypes = [],
    isLoading: isLoadingTypes
  } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: getProjectTypes
  });

  const {
    data: projectCategories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['projectCategories'],
    queryFn: getProjectCategories
  });

  const {
    data: companies = [],
    isLoading: isLoadingCompanies
  } = useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies
  });

  const {
    data: clients = [],
    isLoading: isLoadingClients
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedCompany) params.set("company", selectedCompany);
    if (selectedClient) params.set("client", selectedClient);
    setSearchParams(params);
  }, [selectedType, selectedCategory, selectedCompany, selectedClient, setSearchParams]);

  const filteredProjects = projects.filter(project => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        project.name.toLowerCase().includes(query) ||
        project.clientName.toLowerCase().includes(query) ||
        (project.url && project.url.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }
    
    if (selectedType && project.projectTypeId !== selectedType) {
      return false;
    }
    
    if (selectedCategory && project.projectCategoryId !== selectedCategory) {
      return false;
    }
    
    if (selectedClient && project.clientId !== selectedClient) {
      return false;
    }
    
    if (selectedCompany) {
      const client = clients.find(c => c.id === project.clientId);
      if (!client || client.companyId !== selectedCompany) {
        return false;
      }
    }
    
    return true;
  });

  useEffect(() => {
    if (selectedType) {
      const categories = projectCategories.filter(
        category => category.projectTypeId === selectedType
      );
      setAvailableCategories(categories);
      
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

  useEffect(() => {
    if (selectedCompany) {
      const filteredClients = clients.filter(
        client => client.companyId === selectedCompany
      );
      setAvailableClients(filteredClients);
      
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

  const hasFilters = !!(searchQuery || selectedType || selectedCategory || selectedCompany || selectedClient);

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-8">
          <ProjectHeader onAddProject={() => setIsFormOpen(true)} />
          
          <ProjectFilters
            isFilterOpen={isFilterOpen}
            onFilterToggle={toggleFilter}
            onSearch={handleSearch}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            companies={companies}
            availableClients={availableClients}
            projectTypes={projectTypes}
            availableCategories={availableCategories}
            onClearFilters={clearFilters}
          />

          <ProjectList
            projects={filteredProjects}
            hasFilters={hasFilters}
            onAddProject={() => setIsFormOpen(true)}
          />
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
