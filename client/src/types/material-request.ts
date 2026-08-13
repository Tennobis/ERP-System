// MaterialRequest types based on Prisma schema
export interface MaterialRequestItem {
  warehouse: any;
  targetedWarehouse: any;
  unit: string;
  description: any;
  itemName: any;
  estimatedCost: number;
  id: string;
  materialRequestId: string;
  hsnCode: string;
  rate?: number;
  value?: number;
  vehicleNo?: string;
  requiredBy?: string;
  quantity: number;
  targetWarehouse?: string;
  uom: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialRequest {
  department: string;
  priority: string;
  id: string;
  requestNumber: string;
  transactionDate: string;
  purpose: 'HO_PURCHASE' | 'SITE_PURCHASE';
  requiredBy?: string;
  priceList?: string;
  targetWarehouse?: string;
  terms?: string;
  moreInfo?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  requestedBy: string;
  projectId?: string;
  inventoryItemId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  requester?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  items: MaterialRequestItem[];
}

export interface CreateMaterialRequestData {
  requestNumber: string;
  transactionDate: string;
  purpose: 'HO_PURCHASE' | 'SITE_PURCHASE';
  requiredBy?: string;
  priceList?: string;
  targetWarehouse?: string;
  terms?: string;
  moreInfo?: string;
  projectId?: string;
  items: Omit<MaterialRequestItem, 'id' | 'materialRequestId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateMaterialRequestData {
  requestNumber?: string;
  transactionDate?: string;
  purpose?: 'HO_PURCHASE' | 'SITE_PURCHASE';
  requiredBy?: string;
  priceList?: string;
  targetWarehouse?: string;
  terms?: string;
  moreInfo?: string;
  projectId?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
} 