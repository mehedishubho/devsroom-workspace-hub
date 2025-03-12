
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ExternalLink, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

const ProjectCard = ({ project, className }: ProjectCardProps) => {
  const { 
    id, name, clientName, url, startDate, endDate, 
    price, payments, status 
  } = project;

  const totalPaid = payments.reduce((sum, payment) => {
    return payment.status === "completed" ? sum + payment.amount : sum;
  }, 0);

  const percentPaid = Math.round((totalPaid / price) * 100);

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "on-hold":
        return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/project/${id}`} className="block">
        <Card className={cn(
          "overflow-hidden border backdrop-blur-sm bg-white/50 dark:bg-black/20 hover:shadow-md transition-all duration-300",
          className
        )}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-lg line-clamp-1">{name}</h3>
                <p className="text-muted-foreground text-sm">{clientName}</p>
              </div>
              <Badge className={cn("ml-auto", getStatusColor(status))}>
                {status.replace("-", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ExternalLink className="h-4 w-4" />
              <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{format(startDate, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{endDate ? format(endDate, "MMM d, yyyy") : "Ongoing"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-2 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">${price.toLocaleString()}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {percentPaid}% paid
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
