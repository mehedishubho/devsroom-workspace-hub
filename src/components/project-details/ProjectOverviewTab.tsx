
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/types";

interface ProjectOverviewTabProps {
  project: Project;
}

const ProjectOverviewTab = ({ project }: ProjectOverviewTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Project Name</h3>
            <p className="font-semibold">{project.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
            <p>{project.clientName}</p>
          </div>

          {project.projectType && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Project Type</h3>
              <p>{project.projectType}</p>
            </div>
          )}
          
          {project.projectCategory && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
              <p>{project.projectCategory}</p>
            </div>
          )}
        </div>

        <Separator className="my-2" />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
          <p>{project.description || "No description provided."}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Project URL</h3>
          {project.url ? (
            <a 
              href={project.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {project.url}
            </a>
          ) : (
            <p className="text-muted-foreground italic">No URL provided.</p>
          )}
        </div>

        {project.notes && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
            <p>{project.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewTab;
