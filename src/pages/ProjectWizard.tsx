
import { useNavigate, useParams } from "react-router-dom";
import ProjectForm from "@/components/ProjectForm";
import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";

const ProjectWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // For editing, you may fetch initialData here if needed (you can extend this later)
  // For now, this is used only for "Add New Project"
  return (
    <Dashboard>
      <PageTransition>
        <div className="w-full flex flex-col items-center justify-center px-0 sm:px-4 py-8 min-h-[70vh] bg-background">
          <div className="w-full max-w-4xl">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              {id ? "Edit Project" : "Add New Project"}
            </h2>
            <ProjectForm 
              onCancel={() => navigate("/projects")}
              // You can pass initialData for editing later
            />
          </div>
        </div>
      </PageTransition>
    </Dashboard>
  );
};

export default ProjectWizard;
