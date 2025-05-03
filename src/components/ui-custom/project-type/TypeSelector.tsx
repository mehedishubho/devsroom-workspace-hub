
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ProjectType } from "@/types";

interface TypeSelectorProps {
  projectTypes: ProjectType[];
  selectedTypeId: string;
  onTypeChange: (typeId: string) => void;
  onAddTypeClick: () => void;
}

const TypeSelector = ({ 
  projectTypes, 
  selectedTypeId, 
  onTypeChange,
  onAddTypeClick 
}: TypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="projectType" className="text-sm font-medium">
          Project Type
        </label>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={onAddTypeClick}
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
  );
};

export default TypeSelector;
