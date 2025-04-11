import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addProject, updateProject } from "@/services/projectService";
import { Client, Project, Payment, OtherAccess } from "@/types";
import ProjectTypeSelector from "@/components/ui-custom/ProjectTypeSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from 'uuid';
import CurrencySelector from "@/components/ui-custom/CurrencySelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapDbClientToClient } from "@/utils/dataMappers";

type ProjectStatus = "active" | "completed" | "on-hold" | "cancelled" | "under-revision" | "planning" | "in-progress" | "review";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientId: z.string().min(1, "Client is required"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  deadlineDate: z.date().optional(),
  projectStatus: z.string().min(1, "Status is required"),
  budget: z.string().optional(),
  url: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  credentialNotes: z.string().optional(),
  hostingProvider: z.string().optional(),
  hostingUsername: z.string().optional(),
  hostingPassword: z.string().optional(),
  hostingUrl: z.string().optional(),
  hostingNotes: z.string().optional(),
});

export interface ProjectFormProps {
  initialData?: Project;
  onSubmit?: (project: Project) => void;
  onCancel?: () => void;
}

const ProjectForm = ({ initialData, onSubmit, onCancel }: ProjectFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState("");
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(initialData?.projectTypeId || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.projectCategoryId || "");
  const [payments, setPayments] = useState<Payment[]>(initialData?.payments || []);
  const [otherAccess, setOtherAccess] = useState<OtherAccess[]>(initialData?.otherAccess || []);
  const [activeTab, setActiveTab] = useState("details");

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (clientsData) {
      const mappedClients = clientsData.map(client => mapDbClientToClient(client));
      setClients(mappedClients);
    }
  }, [clientsData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientId: initialData?.clientId || state?.clientId || "",
      description: initialData?.description || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      deadlineDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      projectStatus: initialData?.status || "planning",
      budget: initialData?.price ? String(initialData.price) : "",
      url: initialData?.url || "",
      username: initialData?.credentials?.username || "",
      password: initialData?.credentials?.password || "",
      credentialNotes: initialData?.credentials?.notes || "",
      hostingProvider: initialData?.hosting?.provider || "",
      hostingUsername: initialData?.hosting?.credentials?.username || "",
      hostingPassword: initialData?.hosting?.credentials?.password || "",
      hostingUrl: initialData?.hosting?.url || "",
      hostingNotes: initialData?.hosting?.notes || "",
    },
  });

  useEffect(() => {
    if (state?.clientId) {
      form.setValue("clientId", state.clientId);
    }
  }, [state, form]);

  const handleSubmitForm = async (values: z.infer<typeof formSchema>) => {
    try {
      let clientId = values.clientId;
      
      if (clientId === "new" && newClient) {
        const { data: newClientData, error } = await supabase
          .from('clients')
          .insert({
            name: newClient,
            email: `contact@${newClient.toLowerCase().replace(/\s+/g, "")}.com`,
          })
          .select()
          .single();

        if (error) throw error;
        
        if (newClientData) {
          clientId = newClientData.id;
          const mappedNewClient = mapDbClientToClient(newClientData);
          setClients([...clients, mappedNewClient]);
        }
      }

      const projectStatus = mapFormStatusToProjectStatus(values.projectStatus);

      const projectData = {
        ...(initialData || {}),
        name: values.name,
        clientId,
        clientName: clients.find(c => c.id === clientId)?.name || newClient,
        description: values.description || "",
        url: values.url || "",
        startDate: values.startDate,
        endDate: values.deadlineDate,
        status: projectStatus,
        price: values.budget ? parseFloat(values.budget) : 0,
        projectTypeId: selectedTypeId,
        projectCategoryId: selectedCategoryId,
        updatedAt: new Date(),
        credentials: {
          username: values.username || "",
          password: values.password || "",
          notes: values.credentialNotes
        },
        hosting: {
          provider: values.hostingProvider || "",
          url: values.hostingUrl,
          credentials: {
            username: values.hostingUsername || "",
            password: values.hostingPassword || "",
          },
          notes: values.hostingNotes
        },
        payments: payments,
        otherAccess: otherAccess
      };

      if (initialData) {
        const updatedProject = await updateProject(initialData.id, projectData);
        if (onSubmit && updatedProject) {
          onSubmit(updatedProject);
        }
      } else {
        const newProject = await addProject(projectData);
        
        if (onSubmit) {
          onSubmit(newProject);
        } else {
          toast.success("Project created successfully!");
          navigate(`/project/${newProject.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Please try again.");
    }
  };

  const mapFormStatusToProjectStatus = (formStatus: string): Project['status'] => {
    switch (formStatus) {
      case "completed":
        return "completed";
      case "on-hold":
        return "on-hold";
      case "cancelled":
        return "cancelled";
      case "under-revision":
        return "under-revision";
      case "planning":
      case "in-progress":
      case "review":
      default:
        return "active";
    }
  };

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClient(e.target.value);
  };

  const handleClientChange = (value: string) => {
    form.setValue("clientId", value);
    if (value === "new") {
      setShowNewClientInput(true);
      setNewClient("");
    } else {
      setShowNewClientInput(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const addPayment = () => {
    const newPayment: Payment = {
      id: uuidv4(),
      amount: 0,
      date: new Date(),
      description: "",
      status: "pending"
    };
    setPayments([...payments, newPayment]);
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter(payment => payment.id !== id));
  };

  const updatePayment = (id: string, field: keyof Payment, value: any) => {
    setPayments(payments.map(payment => {
      if (payment.id === id) {
        return { ...payment, [field]: value };
      }
      return payment;
    }));
  };

  const addOtherAccess = () => {
    const newAccess: OtherAccess = {
      id: uuidv4(),
      type: "other",
      name: "",
      credentials: {
        username: "",
        password: ""
      }
    };
    setOtherAccess([...otherAccess, newAccess]);
  };

  const removeOtherAccess = (id: string) => {
    setOtherAccess(otherAccess.filter(access => access.id !== id));
  };

  const updateOtherAccess = (id: string, field: string, value: any) => {
    setOtherAccess(otherAccess.map(access => {
      if (access.id === id) {
        if (field === "username" || field === "password") {
          return { 
            ...access, 
            credentials: { 
              ...access.credentials, 
              [field]: value 
            } 
          };
        }
        return { ...access, [field]: value };
      }
      return access;
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-8 w-full max-w-4xl">
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="access">Access & Credentials</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={handleClientChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientsLoading ? (
                        <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                      ) : clients.length > 0 ? (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients" disabled>No clients found</SelectItem>
                      )}
                      <SelectItem value="new">+ Add new client</SelectItem>
                    </SelectContent>
                  </Select>
                  {showNewClientInput && (
                    <Input
                      placeholder="Enter new client name"
                      value={newClient}
                      onChange={handleNewClientChange}
                      className="mt-2"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <ProjectTypeSelector
              selectedTypeId={selectedTypeId}
              selectedCategoryId={selectedCategoryId}
              onTypeChange={setSelectedTypeId}
              onCategoryChange={setSelectedCategoryId}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
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
                    <Textarea
                      placeholder="Enter project description"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
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
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadlineDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
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
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="projectStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="under-revision">Under Revision</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter budget amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="access" className="space-y-6 pt-4">
            <div className="space-y-6">
              <div className="bg-muted/40 p-4 rounded-md space-y-4">
                <h3 className="text-lg font-medium">Project Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="credentialNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="bg-muted/40 p-4 rounded-md space-y-4">
                <h3 className="text-lg font-medium">Hosting Information</h3>
                <FormField
                  control={form.control}
                  name="hostingProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hosting Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="AWS, DigitalOcean, etc." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hostingUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hosting URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/admin" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hostingUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Hosting username" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hostingPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Hosting password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="hostingNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Additional Access</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addOtherAccess}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Access
                  </Button>
                </div>
                
                {otherAccess.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No additional access added</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {otherAccess.map((access, index) => (
                      <div key={access.id} className="bg-muted/40 p-4 rounded-md space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Access #{index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeOtherAccess(access.id)}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input 
                              placeholder="Name (e.g. Email Account)"
                              value={access.name}
                              onChange={(e) => updateOtherAccess(access.id, "name", e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Type</label>
                            <Select 
                              value={access.type}
                              onValueChange={(value) => updateOtherAccess(access.id, "type", value)}
                            >
                              <SelectTrigger>
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
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Username</label>
                            <Input 
                              placeholder="Username"
                              value={access.credentials.username}
                              onChange={(e) => updateOtherAccess(access.id, "username", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Password</label>
                            <Input 
                              placeholder="Password"
                              value={access.credentials.password}
                              onChange={(e) => updateOtherAccess(access.id, "password", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea 
                            placeholder="Additional notes"
                            value={access.notes || ""}
                            onChange={(e) => updateOtherAccess(access.id, "notes", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Payment Schedule</h3>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addPayment}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Payment
              </Button>
            </div>
            
            {payments.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No payments scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <div key={payment.id} className="bg-muted/40 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Payment #{index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removePayment(payment.id)}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Amount</label>
                        <Input 
                          type="number"
                          placeholder="Payment amount"
                          value={payment.amount}
                          onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">Currency</label>
                        <CurrencySelector
                          value={payment.currency || 'USD'}
                          onChange={(value) => updatePayment(payment.id, 'currency', value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-2">Status</label>
                        <Select
                          value={payment.status || 'pending'}
                          onValueChange={(value) => updatePayment(payment.id, 'status', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Description</label>
                        <Input 
                          placeholder="Payment description"
                          value={payment.description || ''}
                          onChange={(e) => updatePayment(payment.id, 'description', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium block mb-2">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !payment.date && "text-muted-foreground"
                              )}
                            >
                              {payment.date ? (
                                format(payment.date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={payment.date}
                              onSelect={(date) => date && updatePayment(payment.id, 'date', date)}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-8 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
