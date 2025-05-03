
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ProjectCategory } from "@/types";

interface CategorySelectorProps {
  categories: ProjectCategory[];
  selectedTypeId: string;
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onAddCategoryClick: () => void;
}

const CategorySelector = ({ 
  categories, 
  selectedTypeId, 
  selectedCategoryId, 
  onCategoryChange,
  onAddCategoryClick 
}: CategorySelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={onAddCategoryClick}
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
  );
};

export default CategorySelector;
