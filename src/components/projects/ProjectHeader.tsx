
import { AddProjectButton } from "@/components/ui-custom/AddProjectButton";

interface ProjectHeaderProps {
  onAddProject: () => void;
}

export const ProjectHeader = ({ onAddProject }: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your freelance projects
        </p>
      </div>
      <AddProjectButton onClick={onAddProject} />
    </div>
  );
};
