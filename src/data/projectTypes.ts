
import { ProjectType, ProjectCategory } from "@/types";

export const sampleProjectTypes: ProjectType[] = [
  {
    id: "type-1",
    name: "WordPress",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  {
    id: "type-2",
    name: "Shopify",
    createdAt: new Date("2023-01-02"),
    updatedAt: new Date("2023-01-02")
  },
  {
    id: "type-3",
    name: "Custom Development",
    createdAt: new Date("2023-01-03"),
    updatedAt: new Date("2023-01-03")
  }
];

export const sampleProjectCategories: ProjectCategory[] = [
  {
    id: "cat-1",
    name: "E-commerce",
    projectTypeId: "type-1",
    createdAt: new Date("2023-01-05"),
    updatedAt: new Date("2023-01-05")
  },
  {
    id: "cat-2",
    name: "Blog",
    projectTypeId: "type-1",
    createdAt: new Date("2023-01-06"),
    updatedAt: new Date("2023-01-06")
  },
  {
    id: "cat-3",
    name: "Landing Page",
    projectTypeId: "type-1",
    createdAt: new Date("2023-01-07"),
    updatedAt: new Date("2023-01-07")
  },
  {
    id: "cat-4",
    name: "E-commerce Store",
    projectTypeId: "type-2",
    createdAt: new Date("2023-01-08"),
    updatedAt: new Date("2023-01-08")
  },
  {
    id: "cat-5",
    name: "Dropshipping",
    projectTypeId: "type-2",
    createdAt: new Date("2023-01-09"),
    updatedAt: new Date("2023-01-09")
  },
  {
    id: "cat-6",
    name: "Web Application",
    projectTypeId: "type-3",
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-10")
  },
  {
    id: "cat-7",
    name: "Mobile App",
    projectTypeId: "type-3",
    createdAt: new Date("2023-01-11"),
    updatedAt: new Date("2023-01-11")
  }
];

// Function to find a project type by ID
export const getProjectTypeById = (id: string): ProjectType | undefined => {
  return sampleProjectTypes.find(type => type.id === id);
};

// Function to find a project category by ID
export const getProjectCategoryById = (id: string): ProjectCategory | undefined => {
  return sampleProjectCategories.find(category => category.id === id);
};

// Function to get all categories for a specific project type
export const getCategoriesByTypeId = (typeId: string): ProjectCategory[] => {
  return sampleProjectCategories.filter(category => category.projectTypeId === typeId);
};

// Generate a unique ID for new items
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Add new project type
export const addProjectType = (name: string): ProjectType => {
  const newType: ProjectType = {
    id: generateId(),
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sampleProjectTypes.push(newType);
  return newType;
};

// Update existing project type
export const updateProjectType = (id: string, name: string): ProjectType | undefined => {
  const typeIndex = sampleProjectTypes.findIndex(type => type.id === id);
  if (typeIndex === -1) return undefined;
  
  sampleProjectTypes[typeIndex] = {
    ...sampleProjectTypes[typeIndex],
    name,
    updatedAt: new Date()
  };
  
  return sampleProjectTypes[typeIndex];
};

// Delete project type (and its categories)
export const deleteProjectType = (id: string): boolean => {
  const initialLength = sampleProjectTypes.length;
  const filteredTypes = sampleProjectTypes.filter(type => type.id !== id);
  
  if (filteredTypes.length === initialLength) return false;
  
  // Remove associated categories
  const filteredCategories = sampleProjectCategories.filter(category => category.projectTypeId !== id);
  
  // Update the arrays
  sampleProjectTypes.length = 0;
  sampleProjectTypes.push(...filteredTypes);
  
  sampleProjectCategories.length = 0;
  sampleProjectCategories.push(...filteredCategories);
  
  return true;
};

// Add new project category
export const addProjectCategory = (name: string, projectTypeId: string): ProjectCategory => {
  const newCategory: ProjectCategory = {
    id: generateId(),
    name,
    projectTypeId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sampleProjectCategories.push(newCategory);
  return newCategory;
};

// Update existing project category
export const updateProjectCategory = (id: string, name: string, projectTypeId: string): ProjectCategory | undefined => {
  const categoryIndex = sampleProjectCategories.findIndex(category => category.id === id);
  if (categoryIndex === -1) return undefined;
  
  sampleProjectCategories[categoryIndex] = {
    ...sampleProjectCategories[categoryIndex],
    name,
    projectTypeId,
    updatedAt: new Date()
  };
  
  return sampleProjectCategories[categoryIndex];
};

// Delete project category
export const deleteProjectCategory = (id: string): boolean => {
  const initialLength = sampleProjectCategories.length;
  const filteredCategories = sampleProjectCategories.filter(category => category.id !== id);
  
  if (filteredCategories.length === initialLength) return false;
  
  sampleProjectCategories.length = 0;
  sampleProjectCategories.push(...filteredCategories);
  
  return true;
};
