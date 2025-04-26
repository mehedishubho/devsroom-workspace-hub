
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getProjectTypeById, 
  getCategoriesByTypeId, 
  addProjectType, 
  addProjectCategory,
  sampleProjectTypes,
  sampleProjectCategories 
} from "@/data/projectTypes";
import { ProjectType, ProjectCategory } from "@/types";

interface ProjectTypeSelectorProps {
  selectedTypeId: string;
  selectedCategoryId: string;
  onTypeChange: (typeId: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

const ProjectTypeSelector = ({ 
  selectedTypeId, 
  selectedCategoryId, 
  onTypeChange, 
  onCategoryChange 
}: ProjectTypeSelectorProps) => {
  const { toast } = useToast();
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  
  // New type/category dialog state
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // Load project types
  useEffect(() => {
    import("@/data/projectTypes").then(({ sampleProjectTypes }) => {
      setProjectTypes([...sampleProjectTypes]);
      
      // If we have a selectedTypeId but no categories loaded, load them now
      if (selectedTypeId) {
        const typeCategories = getCategoriesByTypeId(selectedTypeId);
        setCategories(typeCategories);
      }
    });
  }, [selectedTypeId]);

  // Load categories when type changes
  useEffect(() => {
    if (selectedTypeId) {
      const typeCategories = getCategoriesByTypeId(selectedTypeId);
      setCategories(typeCategories);
      
      // If current category doesn't belong to the new type, reset it
      const categoryBelongsToType = typeCategories.some(cat => cat.id === selectedCategoryId);
      if (!categoryBelongsToType && typeCategories.length > 0) {
        onCategoryChange(typeCategories[0].id);
      } else if (!categoryBelongsToType) {
        onCategoryChange("");
      }
    } else {
      setCategories([]);
      onCategoryChange("");
    }
  }, [selectedTypeId, selectedCategoryId, onCategoryChange]);

  const handleAddType = () => {
    setNewTypeName("");
    setIsAddTypeOpen(true);
  };

  const handleSaveNewType = () => {
    if (!newTypeName.trim()) {
      toast({
        title: "Error",
        description: "Type name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const newType = addProjectType(newTypeName);
    setProjectTypes(prev => [...prev, newType]);
    onTypeChange(newType.id);
    setIsAddTypeOpen(false);
    
    toast({
      title: "Success",
      description: "New project type added"
    });
  };

  const handleAddCategory = () => {
    if (!selectedTypeId) {
      toast({
        title: "Error",
        description: "Please select a project type first",
        variant: "destructive"
      });
      return;
    }
    
    setNewCategoryName("");
    setIsAddCategoryOpen(true);
  };

  const handleSaveNewCategory = () => {
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

    const newCategory = addProjectCategory(newCategoryName, selectedTypeId);
    setCategories(prev => [...prev, newCategory]);
    onCategoryChange(newCategory.id);
    setIsAddCategoryOpen(false);
    
    toast({
      title: "Success",
      description: "New category added"
    });
  };

  // Log selections for debugging
  useEffect(() => {
    console.log("ProjectTypeSelector - Current selections:", { 
      selectedTypeId, 
      selectedCategoryId,
      typeFound: projectTypes.some(t => t.id === selectedTypeId),
      categoryFound: categories.some(c => c.id === selectedCategoryId)
    });
  }, [selectedTypeId, selectedCategoryId, projectTypes, categories]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="projectType" className="text-sm font-medium">
            Project Type
          </label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={handleAddType}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
        <Select
          value={selectedTypeId || ""}
          onValueChange={onTypeChange}
        >
          <SelectTrigger id="projectType">
            <SelectValue placeholder="Select project type" />
          </SelectTrigger>
          <SelectContent>
            {projectTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={handleAddCategory}
            disabled={!selectedTypeId}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
        <Select
          value={selectedCategoryId || ""}
          onValueChange={onCategoryChange}
          disabled={!selectedTypeId || categories.length === 0}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder={!selectedTypeId ? "Select type first" : "Select category"} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Type Dialog */}
      <Dialog open={isAddTypeOpen} onOpenChange={setIsAddTypeOpen}>
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
              onClick={() => setIsAddTypeOpen(false)}
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

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for project type: {getProjectTypeById(selectedTypeId)?.name}
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
              onClick={() => setIsAddCategoryOpen(false)}
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
    </div>
  );
};

export default ProjectTypeSelector;
