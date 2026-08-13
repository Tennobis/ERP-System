// ProgressInvoice type for use throughout the client
export interface ProgressInvoice {
  projectId: string;
  project: string;
  completed: number;
  billed: number;
  nextBilling: string;
  invoiceDate: string;
  totalAmount: number;
  clientName: string;
  address: string;
} 