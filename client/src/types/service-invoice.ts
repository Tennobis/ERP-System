// Service Invoice Types based on the invoice images provided

export interface ServiceInvoiceHeader {
  invoiceNumber: string;
  invoiceDate: string;
  state: string;
  stateCode: string;
  workOrderDate?: string;
  raBillNumber: string;
  uniqueIdentifier: string;
}

export interface ServiceInvoiceReceiver {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
}

export interface ServiceInvoiceProject {
  serviceRenderedAt: string;
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
}

export interface ServiceInvoiceLineItem {
  siNo: string;
  description: string;
  sacHsnCode?: string;
  unit: string;
  rate: number;
  quantityPrevious: number;
  quantityPresent: number;
  quantityCumulative: number;
  amountPrevious: number;
  amountPresent: number;
  amountCumulative: number;
  category?: string; // For grouping like "Work done in Daily Basis", "NIGHT", "FARE"
}

export interface ServiceInvoiceSummary {
  taxableValuePrevious: number;
  taxableValuePresent: number;
  taxableValueCumulative: number;
  deductionRate: number; // e.g., 0.01 for 1%
  deductionAmountPrevious: number;
  deductionAmountPresent: number;
  deductionAmountCumulative: number;
  totalAmountPrevious: number;
  totalAmountPresent: number;
  totalAmountCumulative: number;
  payableAmountRoundedPrevious: number;
  payableAmountRoundedPresent: number;
  payableAmountRoundedCumulative: number;
}

export interface ServiceInvoice {
  id: string;
  header: ServiceInvoiceHeader;
  receiver: ServiceInvoiceReceiver;
  project: ServiceInvoiceProject;
  lineItems: ServiceInvoiceLineItem[];
  summary: ServiceInvoiceSummary;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'pending';
  projectId?: string;
  clientId?: string;
}

// Form data interfaces for creating/editing service invoices
export interface ServiceInvoiceFormData {
  header: Partial<ServiceInvoiceHeader>;
  receiver: Partial<ServiceInvoiceReceiver>;
  project: Partial<ServiceInvoiceProject>;
  lineItems: Partial<ServiceInvoiceLineItem>[];
  summary: Partial<ServiceInvoiceSummary>;
}

// Common units for service invoices
export const SERVICE_INVOICE_UNITS = [
  'Nos.',
  'Hour',
  'Sqm',
  'M.T',
  'Cum',
  'Pcs',
  'Heads',
  'Kg',
  'Ltr',
  'Meter'
] as const;

// Common categories for service invoices
export const SERVICE_INVOICE_CATEGORIES = [
  'Work done in Daily Basis',
  'NIGHT',
  'FARE',
  'TOWER',
  'Reinforcement Work',
  'Shuttering Board Making',
  'Scaffolding',
  'Daily Labour'
] as const;

// States in India for GST purposes
export const INDIAN_STATES = [
  { name: 'Andhra Pradesh', code: '37' },
  { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' },
  { name: 'Bihar', code: '10' },
  { name: 'Chhattisgarh', code: '22' },
  { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' },
  { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' },
  { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' },
  { name: 'Madhya Pradesh', code: '23' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' },
  { name: 'Meghalaya', code: '17' },
  { name: 'Mizoram', code: '15' },
  { name: 'Nagaland', code: '13' },
  { name: 'Odisha', code: '21' },
  { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '05' },
  { name: 'Sikkim', code: '11' },
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Telangana', code: '36' },
  { name: 'Tripura', code: '16' },
  { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' },
  { name: 'West Bengal', code: '19' },
  { name: 'Andaman and Nicobar Islands', code: '35' },
  { name: 'Chandigarh', code: '04' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: '26' },
  { name: 'Delhi', code: '07' },
  { name: 'Jammu and Kashmir', code: '01' },
  { name: 'Ladakh', code: '38' },
  { name: 'Lakshadweep', code: '31' },
  { name: 'Puducherry', code: '34' }
] as const;
