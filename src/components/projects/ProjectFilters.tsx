
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchBar from "@/components/ui-custom/SearchBar";
import { Company, Client, ProjectType, ProjectCategory } from "@/types";

interface ProjectFiltersProps {
  isFilterOpen: boolean;
  onFilterToggle: () => void;
  onSearch: (value: string) => void;
  selectedType: string | undefined;
  setSelectedType: (value: string | undefined) => void;
  selectedCategory: string | undefined;
  setSelectedCategory: (value: string | undefined) => void;
  selectedCompany: string | undefined;
  setSelectedCompany: (value: string | undefined) => void;
  selectedClient: string | undefined;
  setSelectedClient: (value: string | undefined) => void;
  companies: Company[];
  availableClients: Client[];
  projectTypes: ProjectType[];
  availableCategories: ProjectCategory[];
  onClearFilters: () => void;
}

export const ProjectFilters = ({
  isFilterOpen,
  onFilterToggle,
  onSearch,
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  selectedCompany,
  setSelectedCompany,
  selectedClient,
  setSelectedClient,
  companies,
  availableClients,
  projectTypes,
  availableCategories,
  onClearFilters,
}: ProjectFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar onSearch={onSearch} placeholder="Search by project name, client, or URL..." />
        </div>
        <Button
          variant={isFilterOpen ? "default" : "outline"}
          onClick={onFilterToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>

      {isFilterOpen && (
        <div className="bg-secondary/10 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filter Projects</h3>
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <Select 
                value={selectedClient} 
                onValueChange={setSelectedClient}
                disabled={availableClients.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Project Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
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
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={availableCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
