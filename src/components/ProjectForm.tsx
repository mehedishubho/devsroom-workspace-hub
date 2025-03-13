
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sampleClients, addClient } from "@/data/clients";
import { addProject } from "@/data/projects";
import { Client, Project } from "@/types";
import ProjectTypeSelector from "@/components/ui-custom/ProjectTypeSelector";

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
});

// Define the props interface for the ProjectForm component
interface ProjectFormProps {
  initialData?: Project;
  onSubmit?: (project: Project) => void;
  onCancel?: () => void;
}

const ProjectForm = ({ initialData, onSubmit, onCancel }: ProjectFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [newClient, setNewClient] = useState("");
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(initialData?.projectTypeId || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.projectCategoryId || "");

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
    },
  });

  useEffect(() => {
    // If client ID was passed in state, set it
    if (state?.clientId) {
      form.setValue("clientId", state.clientId);
    }
  }, [state, form]);

  const handleSubmitForm = (values: z.infer<typeof formSchema>) => {
    try {
      // If new client was entered, create it
      let clientId = values.clientId;
      if (clientId === "new" && newClient) {
        const client = addClient({
          name: newClient,
          email: `contact@${newClient.toLowerCase().replace(/\s+/g, "")}.com`, // Generate placeholder email
        });
        clientId = client.id;
        setClients([...sampleClients]); // Refresh clients list
      }

      const projectData = {
        ...(initialData || {}),
        name: values.name,
        clientId,
        clientName: clients.find(c => c.id === clientId)?.name || newClient,
        description: values.description || "",
        startDate: values.startDate,
        endDate: values.deadlineDate,
        status: values.projectStatus,
        price: values.budget ? parseFloat(values.budget) : 0,
        projectTypeId: selectedTypeId,
        projectCategoryId: selectedCategoryId,
        updatedAt: new Date()
      };

      if (initialData) {
        // Update existing project
        if (onSubmit) {
          onSubmit(projectData as Project);
        }
      } else {
        // Create new project
        const project = addProject(projectData);
        
        if (onSubmit) {
          onSubmit(project);
        } else {
          toast.success("Project created successfully!");
          navigate(`/project/${project.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Please try again.");
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-8 w-full max-w-4xl">
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
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
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

        <div className="flex gap-4 pt-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit">{initialData ? 'Update Project' : 'Create Project'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;
