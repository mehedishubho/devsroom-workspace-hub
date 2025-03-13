
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash, Edit, Plus, Save } from "lucide-react";
import { 
  sampleProjectTypes, 
  sampleProjectCategories,
  addProjectType,
  updateProjectType,
  deleteProjectType,
  addProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
  getCategoriesByTypeId
} from "@/data/projectTypes";
import { ProjectType, ProjectCategory } from "@/types";

const ProjectSettings = () => {
  const { toast } = useToast();
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  
  // Type dialog state
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [currentType, setCurrentType] = useState<ProjectType | null>(null);
  const [typeName, setTypeName] = useState("");
  
  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ProjectCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");

  // Load data
  useEffect(() => {
    setProjectTypes([...sampleProjectTypes]);
    setCategories([...sampleProjectCategories]);
  }, []);

  // Type handlers
  const handleAddType = () => {
    setCurrentType(null);
    setTypeName("");
    setIsTypeDialogOpen(true);
  };

  const handleEditType = (type: ProjectType) => {
    setCurrentType(type);
    setTypeName(type.name);
    setIsTypeDialogOpen(true);
  };

  const handleDeleteType = (typeId: string) => {
    if (window.confirm("Are you sure you want to delete this project type? This will also delete all associated categories.")) {
      const success = deleteProjectType(typeId);
      
      if (success) {
        setProjectTypes([...sampleProjectTypes]);
        setCategories([...sampleProjectCategories]);
        
        toast({
          title: "Project type deleted",
          description: "The project type and its categories have been removed."
        });
      } else {
        toast({
          title: "Error",
          description: "Could not delete the project type.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveType = () => {
    if (!typeName.trim()) {
      toast({
        title: "Error",
        description: "Project type name cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    if (currentType) {
      // Update existing type
      const updatedType = updateProjectType(currentType.id, typeName);
      
      if (updatedType) {
        setProjectTypes([...sampleProjectTypes]);
        toast({
          title: "Project type updated",
          description: "Changes have been saved successfully."
        });
      }
    } else {
      // Add new type
      const newType = addProjectType(typeName);
      setProjectTypes([...sampleProjectTypes]);
      
      toast({
        title: "Project type added",
        description: "New project type has been created."
      });
    }
    
    setIsTypeDialogOpen(false);
  };

  // Category handlers
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryName("");
    setSelectedTypeId(projectTypes.length > 0 ? projectTypes[0].id : "");
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: ProjectCategory) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setSelectedTypeId(category.projectTypeId);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const success = deleteProjectCategory(categoryId);
      
      if (success) {
        setCategories([...sampleProjectCategories]);
        
        toast({
          title: "Category deleted",
          description: "The category has been removed."
        });
      } else {
        toast({
          title: "Error",
          description: "Could not delete the category.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTypeId) {
      toast({
        title: "Error",
        description: "Please select a project type.",
        variant: "destructive"
      });
      return;
    }

    if (currentCategory) {
      // Update existing category
      const updatedCategory = updateProjectCategory(
        currentCategory.id, 
        categoryName, 
        selectedTypeId
      );
      
      if (updatedCategory) {
        setCategories([...sampleProjectCategories]);
        toast({
          title: "Category updated",
          description: "Changes have been saved successfully."
        });
      }
    } else {
      // Add new category
      const newCategory = addProjectCategory(categoryName, selectedTypeId);
      setCategories([...sampleProjectCategories]);
      
      toast({
        title: "Category added",
        description: "New category has been created."
      });
    }
    
    setIsCategoryDialogOpen(false);
  };

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
            <p className="text-muted-foreground">
              Manage project types and categories for better organization
            </p>
          </div>

          <Tabs defaultValue="types" className="space-y-4">
            <TabsList>
              <TabsTrigger value="types">Project Types</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="types" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Project Types</h2>
                <Button onClick={handleAddType} className="gap-1">
                  <Plus className="h-4 w-4" /> Add Type
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectTypes.map((type) => (
                  <Card key={type.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{type.name}</CardTitle>
                      <CardDescription>
                        Created: {new Date(type.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          {getCategoriesByTypeId(type.id).length} categories
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleEditType(type)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteType(type.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {projectTypes.length === 0 && (
                  <div className="col-span-full text-center py-10 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No project types yet. Add your first one!</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Categories</h2>
                <Button 
                  onClick={handleAddCategory} 
                  className="gap-1"
                  disabled={projectTypes.length === 0}
                >
                  <Plus className="h-4 w-4" /> Add Category
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const parentType = projectTypes.find(t => t.id === category.projectTypeId);
                  
                  return (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>
                          Type: {parentType?.name || "Unknown"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between">
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {categories.length === 0 && (
                  <div className="col-span-full text-center py-10 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      {projectTypes.length === 0 
                        ? "Please create a project type first" 
                        : "No categories yet. Add your first one!"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Type Dialog */}
        <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentType ? "Edit Project Type" : "Add Project Type"}
              </DialogTitle>
              <DialogDescription>
                {currentType 
                  ? "Update the details of this project type" 
                  : "Create a new project type for your projects"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="typeName" className="text-sm font-medium">
                  Type Name
                </label>
                <Input
                  id="typeName"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="e.g., WordPress, Shopify, Laravel"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsTypeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveType} className="gap-1">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentCategory ? "Edit Category" : "Add Category"}
              </DialogTitle>
              <DialogDescription>
                {currentCategory 
                  ? "Update the details of this category" 
                  : "Create a new category for your projects"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="categoryName" className="text-sm font-medium">
                  Category Name
                </label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., E-commerce, Blog, Landing Page"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="projectType" className="text-sm font-medium">
                  Project Type
                </label>
                <Select
                  value={selectedTypeId}
                  onValueChange={setSelectedTypeId}
                >
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select a project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCategory} className="gap-1">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </Dashboard>
  );
};

export default ProjectSettings;
