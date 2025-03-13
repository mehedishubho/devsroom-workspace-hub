
import { Client, Project } from "@/types";
import { sampleProjects } from "./projects";

export const sampleClients: Client[] = [
  {
    id: "1",
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "123-456-7890",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  {
    id: "2",
    name: "Globex Industries",
    email: "info@globex.com",
    phone: "987-654-3210",
    createdAt: new Date("2023-01-02"),
    updatedAt: new Date("2023-01-02")
  },
  {
    id: "3",
    name: "Initech Solutions",
    email: "support@initech.com",
    phone: "555-123-4567",
    createdAt: new Date("2023-01-03"),
    updatedAt: new Date("2023-01-03")
  }
];

// Update sample projects with client IDs
export const clientProjects = sampleProjects.map(project => {
  let clientId = "1";
  
  if (project.clientName === "Tech Solutions Ltd.") {
    clientId = "2";
  } else if (project.clientName === "Health Tracker Inc.") {
    clientId = "3";
  }
  
  return {
    ...project,
    clientId,
    projectTypeId: "type-1",
    projectCategoryId: "cat-1"
  };
});

// Helper functions for client management
export const getClientById = (id: string): Client | undefined => {
  return sampleClients.find(client => client.id === id);
};

export const getClientByName = (name: string): Client | undefined => {
  return sampleClients.find(client => client.name.toLowerCase() === name.toLowerCase());
};

export const getProjectsByClientId = (clientId: string): Project[] => {
  return clientProjects.filter(project => project.clientId === clientId);
};

export const generateClientId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
  const newClient: Client = {
    id: generateClientId(),
    ...client,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sampleClients.push(newClient);
  return newClient;
};

export const updateClient = (
  id: string, 
  updates: Pick<Client, 'name' | 'email' | 'phone'>
): Client | undefined => {
  const clientIndex = sampleClients.findIndex(client => client.id === id);
  
  if (clientIndex === -1) return undefined;
  
  const updatedClient = {
    ...sampleClients[clientIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  sampleClients[clientIndex] = updatedClient;
  return updatedClient;
};

export const deleteClient = (id: string): boolean => {
  const initialLength = sampleClients.length;
  const filteredClients = sampleClients.filter(client => client.id !== id);
  
  if (filteredClients.length === initialLength) return false;
  
  sampleClients.length = 0;
  sampleClients.push(...filteredClients);
  
  // Update projects associated with this client
  clientProjects.forEach(project => {
    if (project.clientId === id) {
      project.clientId = "";
    }
  });
  
  return true;
};
