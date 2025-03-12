
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AddPaymentButtonProps {
  onClick: () => void;
}

const AddPaymentButton = ({ onClick }: AddPaymentButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button 
        onClick={onClick}
        variant="outline"
        className="w-full border-dashed gap-2 font-medium bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-300"
      >
        <Plus className="h-4 w-4" />
        <span>Add Payment</span>
      </Button>
    </motion.div>
  );
};

export default AddPaymentButton;
