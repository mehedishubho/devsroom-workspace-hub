
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

export interface Project {
  id: string;
  name: string;
  clientName: string;
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
