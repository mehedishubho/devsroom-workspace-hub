
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'on-hold':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const totalPaid = project.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const percentPaid = (totalPaid / project.price) * 100;

  return (
    <Link to={`/project/${project.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 bg-white/70 dark:bg-black/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.clientName}</p>
              </div>
              <Badge className={getStatusColor(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || "No description available."}
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price:</span>
                <span className="font-medium">${project.price.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Paid:</span>
                <span className="font-medium">${totalPaid.toLocaleString()} ({percentPaid.toFixed(0)}%)</span>
              </div>
              
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${percentPaid}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 border-t bg-gray-50/70 dark:bg-black/10">
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            <span>Start: {format(new Date(project.startDate), "MMM d, yyyy")}</span>
            {project.endDate && (
              <span>End: {format(new Date(project.endDate), "MMM d, yyyy")}</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
