
import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Project, Credential, Hosting, OtherAccess, Payment } from "@/types";

interface ProjectFormProps {
  initialData?: Partial<Project>;
  onSubmit: (data: Project) => void;
  onCancel: () => void;
}

// Define schema for form validation
const projectFormSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL"),
  credentials: z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    notes: z.string().optional(),
  }),
  hosting: z.object({
    provider: z.string().min(1, "Provider name is required"),
    credentials: z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
      notes: z.string().optional(),
    }),
    url: z.string().url("Please enter a valid URL").optional(),
    notes: z.string().optional(),
  }),
  startDate: z.date(),
  endDate: z.date().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  status: z.enum(["active", "completed", "on-hold", "cancelled"]),
  notes: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const generateId = () => Math.random().toString(36).substring(2, 11);

const ProjectForm = ({ initialData, onSubmit, onCancel }: ProjectFormProps) => {
  const { toast } = useToast();
  const [otherAccess, setOtherAccess] = useState<OtherAccess[]>(
    initialData?.otherAccess || []
  );
  const [payments, setPayments] = useState<Payment[]>(
    initialData?.payments || []
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientName: initialData?.clientName || "",
      description: initialData?.description || "",
      url: initialData?.url || "https://",
      credentials: initialData?.credentials || {
        username: "",
        password: "",
        notes: "",
      },
      hosting: initialData?.hosting || {
        provider: "",
        credentials: {
          username: "",
          password: "",
          notes: "",
        },
        url: "https://",
        notes: "",
      },
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate,
      price: initialData?.price || 0,
      status: initialData?.status || "active",
      notes: initialData?.notes || "",
    },
  });

  const handleAddAccess = () => {
    const newAccess: OtherAccess = {
      id: generateId(),
      type: "email",
      name: "",
      credentials: {
        username: "",
        password: "",
        notes: "",
      },
      notes: "",
    };
    setOtherAccess([...otherAccess, newAccess]);
  };

  const handleRemoveAccess = (id: string) => {
    setOtherAccess(otherAccess.filter((access) => access.id !== id));
  };

  const handleAccessChange = (
    id: string,
    field: keyof OtherAccess,
    value: string
  ) => {
    setOtherAccess(
      otherAccess.map((access) => {
        if (access.id === id) {
          if (field === "type") {
            return { ...access, type: value as OtherAccess["type"] };
          } else if (field === "name") {
            return { ...access, name: value };
          } else if (field === "notes") {
            return { ...access, notes: value };
          }
        }
        return access;
      })
    );
  };

  const handleCredentialChange = (
    id: string,
    field: keyof Credential,
    value: string
  ) => {
    setOtherAccess(
      otherAccess.map((access) => {
        if (access.id === id) {
          return {
            ...access,
            credentials: {
              ...access.credentials,
              [field]: value,
            },
          };
        }
        return access;
      })
    );
  };

  const handleAddPayment = () => {
    const newPayment: Payment = {
      id: generateId(),
      amount: 0,
      date: new Date(),
      status: "pending",
    };
    setPayments([...payments, newPayment]);
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter((payment) => payment.id !== id));
  };

  const handlePaymentChange = (
    id: string,
    field: keyof Payment,
    value: any
  ) => {
    setPayments(
      payments.map((payment) => {
        if (payment.id === id) {
          if (field === "amount") {
            return { ...payment, amount: Number(value) };
          } else if (field === "date") {
            return { ...payment, date: value };
          } else if (field === "description") {
            return { ...payment, description: value };
          } else if (field === "status") {
            return { ...payment, status: value as Payment["status"] };
          }
        }
        return payment;
      })
    );
  };

  const handleSubmitForm = (values: ProjectFormValues) => {
    // Check form validity before submission
    if (otherAccess.some((access) => !access.name || !access.credentials.username || !access.credentials.password)) {
      toast({
        title: "Invalid other access details",
        description: "Please fill in all required fields for other access entries",
        variant: "destructive",
      });
      return;
    }

    if (payments.some((payment) => payment.amount <= 0)) {
      toast({
        title: "Invalid payment amount",
        description: "Payment amounts must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    // Create project data with all required fields
    const projectData: Project = {
      id: initialData?.id || generateId(),
      name: values.name,
      clientName: values.clientName,
      description: values.description,
      url: values.url,
      credentials: values.credentials,
      hosting: values.hosting,
      otherAccess,
      startDate: values.startDate,
      endDate: values.endDate,
      price: values.price,
      payments,
      status: values.status,
      notes: values.notes,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSubmit(projectData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Project Details</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Project Credentials</h4>
              
              <FormField
                control={form.control}
                name="credentials.username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credentials.password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credentials.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Hosting Details</h3>
            
            <FormField
              control={form.control}
              name="hosting.provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hosting.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Hosting Credentials</h4>
              
              <FormField
                control={form.control}
                name="hosting.credentials.username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hosting.credentials.password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hosting.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Other Access</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddAccess}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Access
            </Button>
          </div>

          {otherAccess.length === 0 ? (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No other access added yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {otherAccess.map((access, index) => (
                <div 
                  key={access.id} 
                  className="border rounded-lg p-4 relative bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveAccess(access.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FormLabel htmlFor={`access-type-${access.id}`}>
                        Type
                      </FormLabel>
                      <Select
                        value={access.type}
                        onValueChange={(value) =>
                          handleAccessChange(access.id, "type", value)
                        }
                      >
                        <SelectTrigger id={`access-type-${access.id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="ftp">FTP</SelectItem>
                          <SelectItem value="ssh">SSH</SelectItem>
                          <SelectItem value="cms">CMS</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <FormLabel htmlFor={`access-name-${access.id}`}>
                        Name
                      </FormLabel>
                      <Input
                        id={`access-name-${access.id}`}
                        value={access.name}
                        onChange={(e) =>
                          handleAccessChange(access.id, "name", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <FormLabel htmlFor={`access-username-${access.id}`}>
                        Username
                      </FormLabel>
                      <Input
                        id={`access-username-${access.id}`}
                        value={access.credentials.username}
                        onChange={(e) =>
                          handleCredentialChange(
                            access.id,
                            "username",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FormLabel htmlFor={`access-password-${access.id}`}>
                        Password
                      </FormLabel>
                      <Input
                        id={`access-password-${access.id}`}
                        type="password"
                        value={access.credentials.password}
                        onChange={(e) =>
                          handleCredentialChange(
                            access.id,
                            "password",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <FormLabel htmlFor={`access-notes-${access.id}`}>
                        Notes
                      </FormLabel>
                      <Textarea
                        id={`access-notes-${access.id}`}
                        value={access.notes || ""}
                        onChange={(e) =>
                          handleAccessChange(access.id, "notes", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Leave empty for ongoing projects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Payments</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddPayment}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No payments added yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {payments.map((payment, index) => (
                <div 
                  key={payment.id} 
                  className="border rounded-lg p-4 relative bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemovePayment(payment.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FormLabel htmlFor={`payment-amount-${payment.id}`}>
                        Amount
                      </FormLabel>
                      <Input
                        id={`payment-amount-${payment.id}`}
                        type="number"
                        value={payment.amount}
                        onChange={(e) =>
                          handlePaymentChange(
                            payment.id,
                            "amount",
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <FormLabel htmlFor={`payment-date-${payment.id}`}>
                        Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id={`payment-date-${payment.id}`}
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal"
                            )}
                          >
                            {format(payment.date, "PPP")}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={payment.date}
                            onSelect={(date) =>
                              handlePaymentChange(payment.id, "date", date!)
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <FormLabel htmlFor={`payment-description-${payment.id}`}>
                        Description
                      </FormLabel>
                      <Input
                        id={`payment-description-${payment.id}`}
                        value={payment.description || ""}
                        onChange={(e) =>
                          handlePaymentChange(
                            payment.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FormLabel htmlFor={`payment-status-${payment.id}`}>
                        Status
                      </FormLabel>
                      <Select
                        value={payment.status}
                        onValueChange={(value) =>
                          handlePaymentChange(
                            payment.id,
                            "status",
                            value as Payment["status"]
                          )
                        }
                      >
                        <SelectTrigger id={`payment-status-${payment.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Project</Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
