
import { useToast as useToastShadcn, toast as toastShadcn } from "@/components/ui/toast";

export const useToast = useToastShadcn;
export const toast = toastShadcn;

// Helper function for accessing toast outside of React components
export const getToastFunction = () => {
  return {
    toast: (args) => {
      console.log('Toast message:', args);
      // In non-React contexts, we'll log the message and avoid calling the actual toast
      // which requires React context
    }
  };
};
