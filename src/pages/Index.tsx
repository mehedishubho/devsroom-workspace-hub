import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Project } from "@/types";
import { getProjects, addProject as addProjectToDb } from "@/services/projectService";
import { getProjectTypes, getProjectCategories } from "@/services/projectTypeService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleAddProject = () => {
    window.location.href = "/projects/new";
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveProject = async (data: Project) => {
    try {
      const result = await addProjectToDb(data);
      
      if (result) {
        toast({
          title: "Project added",
          description: `${data.name} has been added successfully.`,
        });
        setIsFormOpen(false);
        refetchProjects();
      }
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
  };

  if (isLoadingProjects || isLoadingTypes || isLoadingCategories) {
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

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all your freelance projects
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              title={searchQuery || selectedType || selectedCategory ? "No matching projects" : "No projects yet"}
              description={
                searchQuery || selectedType || selectedCategory
                  ? "Try adjusting your search query or filters."
                  : "Create your first project to get started."
              }
              icon={searchQuery || selectedType || selectedCategory ? <ListFilter className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
              action={
                searchQuery || selectedType || selectedCategory
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
      </PageTransition>
    </Dashboard>
  );
};

export default Index;
