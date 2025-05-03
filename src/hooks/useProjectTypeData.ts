
import { useState, useEffect } from "react";
import { ProjectType, ProjectCategory } from "@/types";
import { 
  getProjectTypes, 
  getCategoriesByType 
} from "@/services/projectTypeService";

export function useProjectTypeData(
  initialTypeId: string, 
  initialCategoryId: string,
  onCategoryChange: (categoryId: string) => void
) {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  
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
      if (initialTypeId) {
        try {
          const typeCategories = await getCategoriesByType(initialTypeId);
          setCategories(typeCategories || []);
          
          // If the current category doesn't belong to the selected type
          // either select the first available or clear selection
          const categoryBelongsToType = (typeCategories || []).some(
            cat => cat && cat.id === initialCategoryId
          );
          
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
  }, [initialTypeId, initialCategoryId, onCategoryChange]);

  // For debugging
  useEffect(() => {
    console.log("ProjectTypeSelector - Current selections:", { 
      typeId: initialTypeId, 
      categoryId: initialCategoryId,
      typeFound: projectTypes.some(t => t && t.id === initialTypeId),
      categoryFound: categories.some(c => c && c.id === initialCategoryId),
      projectTypesLength: projectTypes.length,
      categoriesLength: categories.length
    });
  }, [initialTypeId, initialCategoryId, projectTypes, categories]);

  return {
    projectTypes,
    categories,
    setProjectTypes,
    setCategories
  };
}
