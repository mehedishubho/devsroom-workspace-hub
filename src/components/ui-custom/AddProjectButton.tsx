
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AddProjectButtonProps {
  onClick: () => void;
}

const AddProjectButton = ({ onClick }: AddProjectButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        onClick={onClick}
        size="lg"
        className="gap-2 font-medium rounded-full shadow-sm hover:shadow-md transition-all duration-300"
      >
        <Plus className="h-5 w-5" />
        <span>New Project</span>
      </Button>
    </motion.div>
  );
};

export default AddProjectButton;
