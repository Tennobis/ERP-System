export interface Payment {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  paymentType: 'RECEIVE' | 'PAY';
  postingDate: string;
  modeOfPayment?: string;
  partyType: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'BANK';
  party: string;
  partyName: string;
  accountPaidTo: string;
  amount: number;
  total: number;
  taxes: TaxCharge[];
  companyAddress?: string;
  customerAddress?: string;
  placeOfSupply?: string;
  projectId: string;
  project: {
    id: string;
    name: string;
  };
  costCenter?: string;
  createdAt: string;
  updatedAt: string;
  invoiceId: string;
  Invoice: {
    id: string;
    invoiceNumber: string;
    client: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface TaxCharge {
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
} 