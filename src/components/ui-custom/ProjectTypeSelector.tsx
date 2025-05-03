
import { useState } from "react";
import TypeSelector from "./project-type/TypeSelector";
import CategorySelector from "./project-type/CategorySelector";
import AddTypeDialog from "./project-type/AddTypeDialog";
import AddCategoryDialog from "./project-type/AddCategoryDialog";
import { useProjectTypeData } from "@/hooks/useProjectTypeData";
import { ProjectType, ProjectCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

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
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  const {
    projectTypes,
    categories,
    setProjectTypes,
    setCategories
  } = useProjectTypeData(selectedTypeId, selectedCategoryId, onCategoryChange);

  const handleAddType = () => {
    setIsAddTypeOpen(true);
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
    setIsAddCategoryOpen(true);
  };

  const handleTypeAdded = (newType: ProjectType) => {
    setProjectTypes(prev => [...prev, newType]);
    onTypeChange(newType.id);
  };

  const handleCategoryAdded = (newCategory: ProjectCategory) => {
    setCategories(prev => [...prev, newCategory]);
    onCategoryChange(newCategory.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TypeSelector 
        projectTypes={projectTypes}
        selectedTypeId={selectedTypeId}
        onTypeChange={onTypeChange}
        onAddTypeClick={handleAddType}
      />

      <CategorySelector 
        categories={categories}
        selectedTypeId={selectedTypeId}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
        onAddCategoryClick={handleAddCategory}
      />

      <AddTypeDialog 
        open={isAddTypeOpen} 
        onOpenChange={setIsAddTypeOpen}
        onTypeAdded={handleTypeAdded}
      />

      <AddCategoryDialog 
        open={isAddCategoryOpen} 
        onOpenChange={setIsAddCategoryOpen}
        onCategoryAdded={handleCategoryAdded}
        selectedTypeId={selectedTypeId}
      />
    </div>
  );
};

export default ProjectTypeSelector;
