
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Mock data for clients
const mockClients = [
  { id: "1", name: "Acme Corporation", email: "contact@acme.com", phone: "123-456-7890" },
  { id: "2", name: "Globex Industries", email: "info@globex.com", phone: "987-654-3210" },
  { id: "3", name: "Initech Solutions", email: "support@initech.com", phone: "555-123-4567" },
];

const Clients = () => {
  const [clients, setClients] = useState(mockClients);
  const { toast } = useToast();

  const handleAddClient = () => {
    toast({
      title: "Add Client",
      description: "This functionality is not implemented yet.",
    });
  };

  return (
    <Dashboard>
      <PageTransition>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">Manage your client information</p>
          </div>
          <Button onClick={handleAddClient} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add Client
          </Button>
        </div>

        <div className="grid gap-6">
          {clients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No clients yet</h3>
                <p className="text-muted-foreground mb-4">Add your first client to get started</p>
                <Button onClick={handleAddClient} className="gap-2">
                  <PlusCircle className="h-4 w-4" /> Add Client
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Client List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clients.map((client, index) => (
                    <div key={client.id}>
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{client.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            <span>{client.email}</span>
                            {client.phone && <span> • {client.phone}</span>}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageTransition>
    </Dashboard>
  );
};

export default Clients;
