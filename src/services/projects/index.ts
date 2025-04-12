
// Export all project-related services from a single entry point
export { getProjects } from './getProjects';
export { addProject } from './addProject';
export { updateProject } from './updateProject';
export { checkAndUpdateProjectsSchema } from './migrations';

// Run schema check on module import
import { checkAndUpdateProjectsSchema } from './migrations';
checkAndUpdateProjectsSchema()
  .then(success => {
    if (success) {
      console.log("Project schema is up to date");
    } else {
      console.error("Could not verify project schema");
    }
  })
  .catch(err => {
    console.error("Schema check failed:", err);
  });
