
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
  getProjectTypes, 
  getProjectCategories,
  getProjectTypeById, 
  getCategoriesByType, 
  addProjectType, 
  addProjectCategory
} from "@/services/projectTypeService";
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
  
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  
  // Load project types on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await getProjectTypes();
        setProjectTypes(types || []);
      } catch (error) {
        console.error("Error loading project types:", error);
        setProjectTypes([]);
      }
    };
    
    loadData();
  }, []);
  
  // Update categories when selected type changes
  useEffect(() => {
    const loadCategories = async () => {
      if (selectedTypeId) {
        try {
          const typeCategories = await getCategoriesByType(selectedTypeId);
          setCategories(typeCategories || []);
          
          // If the current category doesn't belong to the selected type
          // either select the first available or clear selection
          const categoryBelongsToType = (typeCategories || []).some(cat => cat && cat.id === selectedCategoryId);
          
          if (!categoryBelongsToType && typeCategories && typeCategories.length > 0) {
            onCategoryChange(typeCategories[0].id);
          } else if (!categoryBelongsToType) {
            onCategoryChange("");
          }
        } catch (error) {
          console.error("Error loading categories:", error);
          setCategories([]);
        }
      } else {
        setCategories([]);
        onCategoryChange("");
      }
    };
    
    loadCategories();
  }, [selectedTypeId, selectedCategoryId, onCategoryChange]);

  const handleAddType = () => {
    setNewTypeName("");
    setIsAddTypeOpen(true);
  };

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
        setProjectTypes(prev => [...prev, newType]);
        onTypeChange(newType.id);
        setIsAddTypeOpen(false);
        
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
        setCategories(prev => [...prev, newCategory]);
        onCategoryChange(newCategory.id);
        setIsAddCategoryOpen(false);
        
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

  // For debugging
  useEffect(() => {
    console.log("ProjectTypeSelector - Current selections:", { 
      selectedTypeId, 
      selectedCategoryId,
      typeFound: projectTypes.some(t => t && t.id === selectedTypeId),
      categoryFound: categories.some(c => c && c.id === selectedCategoryId),
      projectTypesLength: projectTypes.length,
      categoriesLength: categories.length
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
            {(projectTypes || []).filter(Boolean).map((type) => (
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
            {(categories || []).filter(Boolean).map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fix accessibility issues in dialogs */}
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

      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
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
