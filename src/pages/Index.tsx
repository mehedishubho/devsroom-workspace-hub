
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, ListFilter } from "lucide-react";
import Dashboard from "@/components/layout/Dashboard";
import SearchBar from "@/components/ui-custom/SearchBar";
import ProjectCard from "@/components/ui-custom/ProjectCard";
import EmptyState from "@/components/ui-custom/EmptyState";
import AddProjectButton from "@/components/ui-custom/AddProjectButton";
import ProjectForm from "@/components/ProjectForm";
import PageTransition from "@/components/ui-custom/PageTransition";
import { sampleProjects } from "@/data/projects";
import { Project } from "@/types";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter projects based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.clientName.toLowerCase().includes(query) ||
          project.url.toLowerCase().includes(query)
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleAddProject = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveProject = (data: Project) => {
    // Check if project already exists (update) or is new (add)
    const existingIndex = projects.findIndex((p) => p.id === data.id);
    
    if (existingIndex >= 0) {
      // Update existing project
      const updatedProjects = [...projects];
      updatedProjects[existingIndex] = data;
      setProjects(updatedProjects);
      toast({
        title: "Project updated",
        description: `${data.name} has been updated successfully.`,
      });
    } else {
      // Add new project
      setProjects([data, ...projects]);
      toast({
        title: "Project added",
        description: `${data.name} has been added successfully.`,
      });
    }
    
    setIsFormOpen(false);
  };

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

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} placeholder="Search by project name, client, or URL..." />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/30"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>

          {filteredProjects.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No matching projects" : "No projects yet"}
              description={
                searchQuery
                  ? "Try adjusting your search query or filters."
                  : "Create your first project to get started."
              }
              icon={searchQuery ? <ListFilter className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
              action={
                searchQuery
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

export default Index;
