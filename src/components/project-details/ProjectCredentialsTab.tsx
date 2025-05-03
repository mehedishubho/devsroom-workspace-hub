
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/types";

interface ProjectCredentialsTabProps {
  project: Project;
}

const ProjectCredentialsTab = ({ project }: ProjectCredentialsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access & Credentials</CardTitle>
        <CardDescription>Project access information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Project Credentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-md">
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Username</h4>
              <div className="font-mono text-sm bg-background p-2 rounded border">
                {project.credentials?.username || "No username provided"}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
              <div className="font-mono text-sm bg-background p-2 rounded border">
                {project.credentials?.password || "No password provided"}
              </div>
            </div>
            {project.credentials?.notes && (
              <div className="sm:col-span-2">
                <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                <div className="text-sm">{project.credentials.notes}</div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Hosting Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-md">
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Provider</h4>
              <div className="text-sm">{project.hosting?.provider || "No provider specified"}</div>
            </div>
            {project.hosting?.url && (
              <div>
                <h4 className="text-xs text-muted-foreground mb-1">URL</h4>
                <a 
                  href={project.hosting.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {project.hosting.url}
                </a>
              </div>
            )}
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Username</h4>
              <div className="font-mono text-sm bg-background p-2 rounded border">
                {project.hosting?.credentials?.username || "No username provided"}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
              <div className="font-mono text-sm bg-background p-2 rounded border">
                {project.hosting?.credentials?.password || "No password provided"}
              </div>
            </div>
            {project.hosting?.notes && (
              <div className="sm:col-span-2">
                <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                <div className="text-sm">{project.hosting.notes}</div>
              </div>
            )}
          </div>
        </div>

        {project.otherAccess && project.otherAccess.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Other Access</h3>
              {project.otherAccess.map((access) => (
                <div 
                  key={access.id} 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-md"
                >
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{access.name}</h4>
                      <span className="text-xs uppercase text-muted-foreground">{access.type}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-1">Username</h4>
                    <div className="font-mono text-sm bg-background p-2 rounded border">
                      {access.credentials?.username || "No username provided"}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-1">Password</h4>
                    <div className="font-mono text-sm bg-background p-2 rounded border">
                      {access.credentials?.password || "No password provided"}
                    </div>
                  </div>
                  {access.notes && (
                    <div className="sm:col-span-2">
                      <h4 className="text-xs text-muted-foreground mb-1">Notes</h4>
                      <div className="text-sm">{access.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCredentialsTab;
