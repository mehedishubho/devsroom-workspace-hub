
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addProjectType } from "@/services/projectTypeService";
import { ProjectType } from "@/types";

interface AddTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTypeAdded: (newType: ProjectType) => void;
}

const AddTypeDialog = ({ open, onOpenChange, onTypeAdded }: AddTypeDialogProps) => {
  const { toast } = useToast();
  const [newTypeName, setNewTypeName] = useState("");

  const handleSaveNewType = async () => {
    if (!newTypeName.trim()) {
      toast({
        title: "Error",
        description: "Type name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      const newType = await addProjectType(newTypeName);
      if (newType) {
        onTypeAdded(newType);
        setNewTypeName("");
        onOpenChange(false);
        
        toast({
          title: "Success",
          description: "New project type added"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new project type",
        variant: "destructive"
      });
      console.error("Error adding project type:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project Type</DialogTitle>
          <DialogDescription>
            Create a new project type for your projects
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="newTypeName" className="text-sm font-medium">
              Type Name
            </label>
            <Input
              id="newTypeName"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g., WordPress, Shopify, Custom Development"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveNewType} className="gap-1">
            <Save className="h-4 w-4" />
            Save Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTypeDialog;
