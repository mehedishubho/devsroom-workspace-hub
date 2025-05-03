
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentItemWithCurrency from "../ui-custom/PaymentItemWithCurrency";
import { Payment } from "@/types";

interface ProjectPaymentsTabProps {
  payments: Payment[];
}

const ProjectPaymentsTab = ({ payments }: ProjectPaymentsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Payment history and schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {!payments || payments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No payments added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <PaymentItemWithCurrency 
                key={payment.id || index} 
                payment={payment}
                onUpdate={() => {}} 
                onDelete={() => {}}
                editable={false}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectPaymentsTab;
