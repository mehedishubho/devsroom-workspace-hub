import { Project } from "@/types";

export const sampleProjects: Project[] = [];

// Helper function to add a new project
export const addProject = (projectData: Partial<Project>): Project => {
  const newProject: Project = {
    id: `${Date.now()}`, // Generate a unique ID
    name: projectData.name || "New Project",
    clientName: projectData.clientName || "Unknown Client",
    clientId: projectData.clientId || "unknown",
    description: projectData.description || "",
    url: projectData.url || "https://example.com",
    credentials: projectData.credentials || {
      username: "",
      password: ""
    },
    hosting: projectData.hosting || {
      provider: "",
      credentials: {
        username: "",
        password: ""
      }
    },
    otherAccess: projectData.otherAccess || [],
    startDate: projectData.startDate || new Date(),
    endDate: projectData.endDate,
    price: projectData.price || 0,
    payments: projectData.payments || [],
    status: projectData.status || "active",
    projectTypeId: projectData.projectTypeId || "",
    projectCategoryId: projectData.projectCategoryId || "",
    projectType: projectData.projectType || "",
    projectCategory: projectData.projectCategory || "",
    notes: projectData.notes,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Add to the sample projects
  sampleProjects.unshift(newProject);
  return newProject;
};

// Helper function to update an existing project
export const updateProject = (id: string, updates: Partial<Project>): Project | null => {
  const index = sampleProjects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const updatedProject = {
    ...sampleProjects[index],
    ...updates,
    updatedAt: new Date()
  };
  
  sampleProjects[index] = updatedProject;
  return updatedProject;
};
