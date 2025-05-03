
import { Project } from "@/types";
import ProjectCard from "@/components/ui-custom/ProjectCard";
import EmptyState from "@/components/ui-custom/EmptyState";
import { ListFilter, PlusCircle } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
  hasFilters: boolean;
  onAddProject: () => void;
}

export const ProjectList = ({ projects, hasFilters, onAddProject }: ProjectListProps) => {
  if (projects.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? "No matching projects" : "No projects yet"}
        description={
          hasFilters
            ? "Try adjusting your search query or filters."
            : "Create your first project to get started."
        }
        icon={hasFilters ? <ListFilter className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
        action={
          {
            label: hasFilters ? "Clear filters" : "Add Project",
            onClick: onAddProject,
          }
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
        />
      ))}
    </div>
  );
};
