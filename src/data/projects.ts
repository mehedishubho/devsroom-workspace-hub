
import { Project } from "@/types";

export const sampleProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Website Redesign",
    clientName: "Fashion Boutique Inc.",
    clientId: "1",
    description: "Complete redesign of the client's e-commerce platform with new product catalog and checkout flow.",
    url: "https://fashionboutique.com",
    credentials: {
      username: "admin",
      password: "securepass123"
    },
    hosting: {
      provider: "AWS",
      credentials: {
        username: "aws-admin",
        password: "aws-secure-password"
      },
      url: "https://aws.amazon.com/console"
    },
    otherAccess: [
      {
        id: "access-1",
        type: "email",
        name: "Marketing Email",
        credentials: {
          username: "marketing@fashionboutique.com",
          password: "emailpass123"
        }
      },
      {
        id: "access-2",
        type: "ftp",
        name: "Media Files FTP",
        credentials: {
          username: "ftpuser",
          password: "ftppass456"
        }
      }
    ],
    startDate: new Date("2023-03-15"),
    endDate: new Date("2023-06-30"),
    price: 12000,
    payments: [
      {
        id: "payment-1",
        amount: 4000,
        date: new Date("2023-03-15"),
        description: "Initial payment (30%)",
        status: "completed"
      },
      {
        id: "payment-2",
        amount: 4000,
        date: new Date("2023-05-01"),
        description: "Mid-project payment (30%)",
        status: "completed"
      },
      {
        id: "payment-3",
        amount: 4000,
        date: new Date("2023-06-30"),
        description: "Final payment (40%)",
        status: "pending"
      }
    ],
    projectTypeId: "type-1",
    projectCategoryId: "cat-1",
    projectType: "E-commerce",
    projectCategory: "Website Redesign",
    status: "active",
    notes: "Client requested additional animations on product pages.",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-06-25")
  },
  {
    id: "2",
    name: "Corporate Website",
    clientName: "Tech Solutions Ltd.",
    clientId: "2",
    description: "Development of a new corporate website with blog and case studies section.",
    url: "https://techsolutions.com",
    credentials: {
      username: "techadmin",
      password: "techpass789"
    },
    hosting: {
      provider: "Digital Ocean",
      credentials: {
        username: "do-admin",
        password: "do-secure-password"
      },
      url: "https://cloud.digitalocean.com"
    },
    otherAccess: [
      {
        id: "access-3",
        type: "cms",
        name: "WordPress Admin",
        credentials: {
          username: "wp-admin",
          password: "wp-password"
        }
      }
    ],
    startDate: new Date("2023-01-10"),
    endDate: new Date("2023-03-25"),
    price: 8500,
    payments: [
      {
        id: "payment-4",
        amount: 2125,
        date: new Date("2023-01-10"),
        description: "25% upfront",
        status: "completed"
      },
      {
        id: "payment-5",
        amount: 6375,
        date: new Date("2023-03-25"),
        description: "75% upon completion",
        status: "completed"
      }
    ],
    projectTypeId: "type-2",
    projectCategoryId: "cat-4",
    projectType: "Corporate",
    projectCategory: "Website Development",
    status: "completed",
    createdAt: new Date("2023-01-05"),
    updatedAt: new Date("2023-03-25")
  },
  {
    id: "3",
    name: "Mobile App Development",
    clientName: "Health Tracker Inc.",
    clientId: "3",
    description: "iOS and Android mobile application for health tracking and fitness.",
    url: "https://apps.apple.com/healthtracker",
    credentials: {
      username: "appadmin",
      password: "apppass321"
    },
    hosting: {
      provider: "Firebase",
      credentials: {
        username: "firebase-admin",
        password: "firebase-secure-password"
      },
      url: "https://console.firebase.google.com"
    },
    otherAccess: [
      {
        id: "access-4",
        type: "other",
        name: "App Store Connect",
        credentials: {
          username: "appstore@healthtracker.com",
          password: "appstore-password"
        }
      },
      {
        id: "access-5",
        type: "other",
        name: "Google Play Console",
        credentials: {
          username: "playstore@healthtracker.com",
          password: "playstore-password"
        }
      }
    ],
    startDate: new Date("2023-05-01"),
    price: 25000,
    payments: [
      {
        id: "payment-6",
        amount: 7500,
        date: new Date("2023-05-01"),
        description: "30% upfront",
        status: "completed"
      }
    ],
    projectTypeId: "type-3",
    projectCategoryId: "cat-6",
    projectType: "Mobile",
    projectCategory: "App Development",
    status: "active",
    createdAt: new Date("2023-04-25"),
    updatedAt: new Date("2023-06-28")
  }
];

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
    projectTypeId: projectData.projectTypeId,
    projectCategoryId: projectData.projectCategoryId,
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
