
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";

interface ProjectHeaderProps {
  name: string;
  clientName: string;
  onBack: () => void;
  onEdit: () => void;
}

const ProjectHeader = ({ name, clientName, onBack, onEdit }: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onBack} 
          size="icon" 
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          <p className="text-muted-foreground">Client: {clientName}</p>
        </div>
      </div>
      <Button onClick={onEdit} className="gap-2">
        <Pencil className="h-4 w-4" /> Edit Project
      </Button>
    </div>
  );
};

export default ProjectHeader;
