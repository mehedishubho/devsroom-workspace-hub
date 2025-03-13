
import { Client } from "@/types";
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
