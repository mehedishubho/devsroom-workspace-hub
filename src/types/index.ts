export interface Payment {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  status?: 'pending' | 'completed';
  currency?: string;
}

export interface Credential {
  username: string;
  password: string;
  notes?: string;
}

export interface Hosting {
  provider: string;
  credentials: Credential;
  url?: string;
  notes?: string;
}

export interface OtherAccess {
  id: string;
  type: 'email' | 'ftp' | 'ssh' | 'cms' | 'other';
  name: string;
  credentials: Credential;
  notes?: string;
}

export interface ProjectType {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProjectCategory {
  id: string;
  name: string;
  projectTypeId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Company {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyId?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientId: string;
  description?: string;
  url: string;
  credentials: Credential;
  hosting: Hosting;
  otherAccess: OtherAccess[];
  startDate: Date;
  endDate?: Date;
  price: number;
  payments: Payment[];
  status: 'active' | 'completed' | 'on-hold' | 'cancelled' | 'under-revision';
  originalStatus?: string; // Added to store the UI display status
  projectTypeId?: string;
  projectCategoryId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  issueDate: Date;
  dueDate: Date;
  sentDate?: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface PaymentWithCurrency extends Payment {
  currency: string;
  convertedAmount?: number; // Amount converted to base currency for calculation
}

// Add this function to help with type validation
export function ensureValidStatus(status: string): "active" | "completed" | "on-hold" | "cancelled" | "under-revision" {
  const validStatuses = ["active", "completed", "on-hold", "cancelled", "under-revision"];
  
  if (validStatuses.includes(status)) {
    return status as "active" | "completed" | "on-hold" | "cancelled" | "under-revision";
  }
  
  // Default to active if not valid
  return "active";
}
