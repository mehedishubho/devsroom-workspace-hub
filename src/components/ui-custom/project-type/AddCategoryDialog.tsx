
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
import { addProjectCategory } from "@/services/projectTypeService";
import { ProjectCategory } from "@/types";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded: (newCategory: ProjectCategory) => void;
  selectedTypeId: string;
}

const AddCategoryDialog = ({ 
  open, 
  onOpenChange, 
  onCategoryAdded, 
  selectedTypeId 
}: AddCategoryDialogProps) => {
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTypeId) {
      toast({
        title: "Error",
        description: "Please select a project type first",
        variant: "destructive"
      });
      return;
    }

    try {
      const newCategory = await addProjectCategory(newCategoryName, selectedTypeId);
      if (newCategory) {
        onCategoryAdded(newCategory);
        setNewCategoryName("");
        onOpenChange(false);
        
        toast({
          title: "Success",
          description: "New category added"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new category",
        variant: "destructive"
      });
      console.error("Error adding category:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category for the selected project type
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="newCategoryName" className="text-sm font-medium">
              Category Name
            </label>
            <Input
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., E-commerce, Blog, Portfolio"
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
          <Button onClick={handleSaveNewCategory} className="gap-1">
            <Save className="h-4 w-4" />
            Save Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
