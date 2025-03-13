
import { ProjectType, ProjectCategory } from "@/types";

export const sampleProjectTypes: ProjectType[] = [
  {
    id: "type-1",
    name: "WordPress",
    createdAt: new Date("2023-01-01")
  },
  {
    id: "type-2",
    name: "Shopify",
    createdAt: new Date("2023-01-02")
  },
  {
    id: "type-3",
    name: "Custom Development",
    createdAt: new Date("2023-01-03")
  }
];

export const sampleProjectCategories: ProjectCategory[] = [
  {
    id: "cat-1",
    name: "E-commerce",
    projectTypeId: "type-1",
    createdAt: new Date("2023-01-05")
  },
  {
    id: "cat-2",
    name: "Blog",
    projectTypeId: "type-1",
    createdAt: new Date("2023-01-06")
  },
  {
    id: "cat-3",
    name: "Landing Page",
    projectTypeId: "type-1",
    createdAt: new Date("2023-01-07")
  },
  {
    id: "cat-4",
    name: "E-commerce Store",
    projectTypeId: "type-2",
    createdAt: new Date("2023-01-08")
  },
  {
    id: "cat-5",
    name: "Dropshipping",
    projectTypeId: "type-2",
    createdAt: new Date("2023-01-09")
  },
  {
    id: "cat-6",
    name: "Web Application",
    projectTypeId: "type-3",
    createdAt: new Date("2023-01-10")
  },
  {
    id: "cat-7",
    name: "Mobile App",
    projectTypeId: "type-3",
    createdAt: new Date("2023-01-11")
  }
];
