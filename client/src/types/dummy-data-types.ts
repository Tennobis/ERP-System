// Project type (merged backend and frontend fields)
export type Project = {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  deadline?: string;
  location?: string;
  manager?: string;
  designDate?: string;
  foundationDate?: string;
  structureDate?: string;
  interiorDate?: string;
  finalDate?: string;
  milestones?: Array<{
    name: string;
    date: string;
    completed: boolean;
  }>;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

// InventoryItem type (merged backend and frontend fields)
export type InventoryItem = {
  project: any;
  itemCode: string;
  itemName: string;
  type: string;
  id: string;
  name: string;
  category: string | string[];
  quantity: number;
  unit: string;
  location?: string;
  lastUpdated?: string;
  maxStock?: number;
  safetyStock?: number;
  isFlagged?: boolean;
  primarySupplier?: string;
  secondarySupplier?: string;
  unitCost?: number;
  description?: string;
  lastOrderDate?: string;
  nextOrderDate?: string;
  qualityScore?: number;
  photos?: string[];
  notes?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Invoice type (matched to database schema)
export type Invoice = {
  id: string;
  userId: string;
  projectId: string;
  clientId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  type: 'STANDARD' | 'MILESTONE' | 'FINAL';
  applyGst: boolean;
  applyRetention: boolean;
  subtotal: number;
  retentionAmount: number;
  baseAfterRetention: number;
  taxAmount: number;
  total: number;
  workCompletedPercent?: number;
  termsAndConditions?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  user?: { id: string; name: string };
  project?: { id: string; name: string };
  client?: { id: string; name: string };
  items?: InvoiceItem[];
  Payment?: Payment[];
  // Legacy fields for backward compatibility
  clientName?: string;
  amount?: number;
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  serialNumber: string;
  description: string;
  item: string;
  unit: 'METER' | 'SQUAREMETER' | 'CUBICMETER' | 'KILOGRAM' | 'TON' | 'PIECES' | 'HOURS' | 'DAYS';
  quantity: number;
  rate: number;
  amount: number;
};

export type Payment = {
  id: string;
  userId: string;
  paymentType: 'RECEIVE' | 'PAY';
  postingDate: string;
  modeOfPayment?: string;
  partyType: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'BANK';
  party: string;
  partyName: string;
  accountPaidTo: string;
  total: number;
  companyAddress?: string;
  customerAddress?: string;
  placeOfSupply?: string;
  projectId: string;
  costCenter?: string;
  invoiceId: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  user?: { id: string; name: string };
  project?: { id: string; name: string };
  Invoice?: Invoice;
  taxes?: TaxCharge[];
};

export type Tax = {
  id: string;
  title: string;
  company: string;
  taxCategory?: string;
  userId: string;
  taxCharges: TaxCharge[];
  createdAt?: string;
  updatedAt?: string;
  // Relations
  user?: { id: string; name: string };
};

export type TaxCharge = {
  id: string;
  serialNo: number;
  paymentId?: string;
  taxId?: string;
  type: 'TDS' | 'GST' | 'TCS';
  accountHead: string;
  taxRate: number;
  amount: number;
  total: number;
  purchaseOrderId?: string;
  // Relations
  payment?: Payment;
  tax?: Tax;
  PurchaseOrder?: any;
};

// Employee type (merged backend and frontend fields)
export type Employee = {
  id: string;
  name: string;
  role?: string;
  department?: string;
  salary?: number;
  status?: string;
  position?: string;
  joinedAt?: string;
  leftAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Employee Salary types - matching database schema
export type EmployeeSalaryEarnings = {
  id: string;
  basic: number;
  da: number; // Dearness Allowance
  hra: number; // House Rent Allowance
  conveyance: number;
  allowance: number;
  medicalAllowance: number;
  others: number;
  total: number; // Calculated field
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeeSalaryDeductions = {
  id: string;
  tds: number; // Tax Deducted at Source
  esi: number; // Employee State Insurance
  pf: number; // Provident Fund
  leave: number; // Leave deduction
  profTax: number; // Professional Tax
  labourWelfare: number; // Labour Welfare Fund
  others: number;
  total: number; // Calculated field
  createdAt?: string;
  updatedAt?: string;
};

// Form data type for AddEmployeeSalaryModal
export type EmployeeSalaryFormData = {
  employeeName: string;
  position: string;
  department: string;
  joinedAt: string;
  netSalary: number;
  remarks?: string;
  earnings: Omit<EmployeeSalaryEarnings, 'id' | 'total' | 'createdAt' | 'updatedAt'>;
  deductions: Omit<EmployeeSalaryDeductions, 'id' | 'total' | 'createdAt' | 'updatedAt'>;
};

// Full database entity type
export type EmployeeSalary = {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'DRAFT';
  grossSalary: number;
  netSalary: number;
  paymentDate?: string;
  remarks?: string;
  earningsId: string;
  deductionsId: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  employee?: Employee;
  earnings?: EmployeeSalaryEarnings;
  deductions?: EmployeeSalaryDeductions;
};

export type UserRole = {
  value: string;
  label: string;
};

// Task type (merged backend and frontend fields)
export type Task = {
  id: string;
  name: string;
  project: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  progress: number;
  startDate?: string;
  phase?: string;
  progressHistory?: Array<{
    progress: number;
    remarks: string;
    timestamp: string;
  }>;
};

// Issue type (merged backend and frontend fields)
export type Issue = {
  id: string;
  type?: string;
  description: string;
  reportedBy?: string;
  severity: string;
  status: string;
  dateLogged?: string;
  escalated?: boolean;
  location?: string;
  impact?: string;
  category?: string;
  responsibleParty?: string;
};

// Other types remain unchanged
export type Client = {
  id: string;
  name: string;
  totalProjects: number;
  activeProjects: number;
  totalValue: number;
  lastContact: string;
};

export type Design = {
  id: string;
  name: string;
  client: string;
  designer: string;
  status: string;
  revisions: number;
  uploadDate: string;
}; 