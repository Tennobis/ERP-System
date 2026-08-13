// Project type for use throughout the client
export interface Project {
  id: string;
  name: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  managers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  }>;
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  }>;
  tasks?: Array<{
    id: string;
    name: string;
    description?: string;
    assignedTo?: string;
    status: string;
    dueDate?: string;
  }>;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    total: number;
    status: string;
  }>;
  materialRequests?: Array<{
    id: string;
    status: string;
    purpose: string;
  }>;
  createdAt: string;
  updatedAt: string;
  Tender?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  Payment?: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
} 