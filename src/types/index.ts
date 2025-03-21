export interface Payment {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  status: 'pending' | 'completed';
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

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  projectTypeId?: string;
  projectCategoryId?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issueDate: Date;
  dueDate?: Date;
  sentDate?: Date;
  paidDate?: Date;
  notes?: string;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
