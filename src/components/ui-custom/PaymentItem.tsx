
import { Payment } from "@/types";
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  CalendarIcon, 
  MessageSquare 
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface PaymentItemProps {
  payment: Payment;
  index?: number; // Make index optional
}

const PaymentItem = ({ payment, index = 0 }: PaymentItemProps) => {
  // Ensure payment exists before accessing its properties
  if (!payment) {
    return null;
  }

  // Ensure payment properties have fallback values
  const amount = payment?.amount ?? 0;
  const date = payment?.date instanceof Date ? payment.date : new Date();
  const description = payment?.description || '';
  const status = payment?.status || 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="border rounded-lg p-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">${amount.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(date, "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {status === "completed" ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Paid</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600">Pending</span>
            </>
          )}
        </div>
      </div>
      {description && (
        <div className="mt-2 text-sm text-muted-foreground flex items-start gap-1">
          <MessageSquare className="h-3 w-3 mt-0.5" />
          <span>{description}</span>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentItem;
