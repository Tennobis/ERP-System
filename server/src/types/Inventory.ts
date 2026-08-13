import { InventoryCategory, Unit } from '@prisma/client';

export interface InventoryItem {
  id: string;
  itemName: string;
  category: InventoryCategory;
  quantity: number;
  unit: Unit;
  location: string;
  maximumStock: number;
  safetyStock: number;
  primarySupplierName: string;
  unitCost: number;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  requests?: MaterialRequestReference[];
}

export interface MaterialRequestReference {
  id: string;
  requestNumber: string;
  status: string;
  requestedBy: string;
  createdAt: Date;
}

export interface CreateInventoryItemData {
  itemName: string;
  category: InventoryCategory;
  quantity: number;
  unit: Unit;
  location: string;
  maximumStock: number;
  safetyStock: number;
  primarySupplierName: string;
  unitCost: number;
  createdById: string;
}

export interface UpdateInventoryItemData {
  itemName?: string;
  category?: InventoryCategory;
  quantity?: number;
  unit?: Unit;
  location?: string;
  maximumStock?: number;
  safetyStock?: number;
  primarySupplierName?: string;
  unitCost?: number;
}

export interface InventorySearchFilter {
  category?: InventoryCategory;
  location?: string;
  lowStock?: boolean;
  search?: string;
}

// Enums re-exported for convenience
export { InventoryCategory, Unit } from '@prisma/client';
