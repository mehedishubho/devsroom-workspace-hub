
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/types";
import { format } from "date-fns";
import { Calendar, DollarSign, FileText, Tag } from "lucide-react";

interface ProjectStatusCardProps {
  project: Project;
  getStatusColor: (status: string) => string;
  getDisplayStatus: (status: string, originalStatus?: string) => string;
}

const ProjectStatusCard = ({ 
  project, 
  getStatusColor, 
  getDisplayStatus 
}: ProjectStatusCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Start Date</span>
          </div>
          <span className="text-sm font-medium">
            {format(new Date(project.startDate), "MMM d, yyyy")}
          </span>
        </div>
        
        {project.endDate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">End Date</span>
            </div>
            <span className="text-sm font-medium">
              {format(new Date(project.endDate), "MMM d, yyyy")}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Project Price</span>
          </div>
          <span className="text-sm font-medium">
            ${project.price ? project.price.toLocaleString() : '0'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Status</span>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {getDisplayStatus(project.status, project.originalStatus)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Created</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(project.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Updated</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(project.updatedAt), "MMM d, yyyy")}
          </span>
        </div>

        {project.payments && project.payments.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Payments</span>
                  <span className="font-medium">{project.payments.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">
                    ${project.payments.reduce((acc, payment) => 
                      payment.status === 'completed' ? acc + Number(payment.amount) : acc, 0
                    ).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount Pending</span>
                  <span className="font-medium">
                    ${project.payments.reduce((acc, payment) => 
                      payment.status === 'pending' ? acc + Number(payment.amount) : acc, 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectStatusCard;
