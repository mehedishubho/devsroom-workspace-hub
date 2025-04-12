
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Function to check if the required columns exist in the projects table
 * and add them if they don't
 */
export const checkAndUpdateProjectsSchema = async (): Promise<boolean> => {
  try {
    // First, directly check if the url column exists in the database
    const { data: urlColumnCheck, error: urlCheckError } = await supabase
      .rpc('column_exists', { 
        table_name: 'projects',
        column_name: 'url'
      });

    if (urlCheckError) {
      console.error("Error checking url column:", urlCheckError);
      return false;
    }

    const urlColumnExists = !!urlColumnCheck;
    
    // Check if the original_status column exists
    const { data: statusColumnCheck, error: statusCheckError } = await supabase
      .rpc('column_exists', { 
        table_name: 'projects',
        column_name: 'original_status'
      });
    
    if (statusCheckError) {
      console.error("Error checking original_status column:", statusCheckError);
      return false;
    }
    
    const statusColumnExists = !!statusColumnCheck;
    
    // If both columns already exist, we're good
    if (urlColumnExists && statusColumnExists) {
      console.log("Schema is up to date, all columns exist");
      return true;
    }
    
    // Add missing columns
    if (!urlColumnExists) {
      const { error: addUrlError } = await supabase
        .rpc('add_column', { 
          table_name: 'projects', 
          column_name: 'url', 
          column_type: 'text', 
          default_value: "''" 
        });
      
      if (addUrlError) {
        console.error("Error adding url column:", addUrlError);
        return false;
      }
    }
    
    if (!statusColumnExists) {
      const { error: addStatusError } = await supabase
        .rpc('add_column', { 
          table_name: 'projects', 
          column_name: 'original_status', 
          column_type: 'text', 
          default_value: "''" 
        });
      
      if (addStatusError) {
        console.error("Error adding original_status column:", addStatusError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Schema update error:", error);
    toast({
      title: "Database Schema Error",
      description: "Could not update the database schema. Please contact support.",
      variant: "destructive"
    });
    return false;
  }
};
