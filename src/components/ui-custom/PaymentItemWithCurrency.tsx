
import { useState } from "react";
import { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import CurrencySelector from "./CurrencySelector";

interface PaymentItemProps {
  payment: Payment;
  onUpdate: (id: string, updatedPayment: Partial<Payment>) => void;
  onDelete: (id: string) => void;
  editable?: boolean;
}

const PaymentItemWithCurrency: React.FC<PaymentItemProps> = ({
  payment,
  onUpdate,
  onDelete,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(String(payment.amount));
  const [description, setDescription] = useState(payment.description || "");
  const [currency, setCurrency] = useState(payment.currency || "USD");

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    onUpdate(payment.id, {
      amount: numericAmount,
      description,
      currency,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(payment.id);
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  if (!editable) {
    return (
      <div className="flex items-center justify-between p-3 bg-background rounded-md border">
        <div>
          <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
          <div className="text-sm text-muted-foreground">
            {payment.description || "No description"}
          </div>
          <div className="text-xs text-muted-foreground">
            {payment.date.toLocaleDateString()}
          </div>
        </div>
        <div className="text-sm font-medium text-primary">
          {payment.status === "completed" ? "Completed" : "Pending"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-background rounded-md border">
      {isEditing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full"
            />
            <CurrencySelector
              value={currency}
              onChange={setCurrency}
              className="w-full"
            />
          </div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full"
          />
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
            <div className="text-sm text-muted-foreground">
              {payment.description || "No description"}
            </div>
            <div className="text-xs text-muted-foreground">
              {payment.date.toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleEdit}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentItemWithCurrency;
