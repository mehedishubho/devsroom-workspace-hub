
import { supabase } from "@/integrations/supabase/client";
import { Project, ensureValidStatus } from "@/types";
import { isValidUUID } from "./utils";

/**
 * Fetch projects from the database
 */
export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      clients (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  if (!data || !Array.isArray(data)) {
    console.warn("No projects data returned or data is not an array");
    return [];
  }

  // Map the database data to our Project type
  return data.map((item) => {
    // Handle project type and category IDs
    const projectTypeId = isValidUUID(item.project_type_id) ? item.project_type_id : null;
    if (!projectTypeId) {
      console.warn("Invalid project type ID format, will be set to null");
    }

    const projectCategoryId = isValidUUID(item.project_category_id) ? item.project_category_id : null;
    if (!projectCategoryId) {
      console.warn("Invalid project category ID format, will be set to null");
    }

    return {
      id: item.id,
      name: item.name,
      clientId: item.client_id,
      clientName: item.clients?.name || "Unknown Client",
      description: item.description || "",
      url: "",
      startDate: new Date(item.start_date),
      endDate: item.deadline_date ? new Date(item.deadline_date) : undefined,
      price: item.budget || 0,
      status: ensureValidStatus(item.status || "active"),
      projectTypeId,
      projectCategoryId,
      credentials: {
        username: "",
        password: "",
      },
      hosting: {
        provider: "",
        credentials: {
          username: "",
          password: "",
        },
      },
      otherAccess: [],
      payments: [],
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    };
  });
};
