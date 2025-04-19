
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { Tag } from "lucide-react";

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

  const getDisplayStatus = (status: string, originalStatus?: string) => {
    if (status === 'active' && originalStatus === 'in-progress') {
      return 'In Progress';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
  };

  // Calculate payment statistics
  const payments = project.payments || [];
  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  const percentPaid = project.price > 0 ? (totalPaid / project.price) * 100 : 0;

  return (
    <Link to={`/project/${project.id}`} className="block h-full">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 bg-white/70 dark:bg-black/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-medium text-lg leading-tight mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.clientName}</p>
              </div>
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {getDisplayStatus(project.status, project.originalStatus)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || "No description available."}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.projectType && (
                <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  <Tag className="h-3 w-3" />
                  <span>{project.projectType}</span>
                </div>
              )}
              {project.projectCategory && (
                <div className="flex items-center gap-1.5 text-xs bg-secondary/10 text-secondary-foreground px-2.5 py-1 rounded-full">
                  <Tag className="h-3 w-3" />
                  <span>{project.projectCategory}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price:</span>
                <span className="font-medium">${project.price.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Paid:</span>
                <span className="font-medium">${totalPaid.toLocaleString()} ({percentPaid.toFixed(0)}%)</span>
              </div>
              
              <div className="h-1.5 w-full bg-secondary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>

            {payments.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Recent Payment:</p>
                <div className="text-xs">
                  ${payments[0].amount.toLocaleString()} - {format(new Date(payments[0].date), "MMM d, yyyy")}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 border-t bg-muted/40">
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
