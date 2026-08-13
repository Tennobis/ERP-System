// InventoryItem type for use throughout the client
export interface InventoryItem {
  id: string;
  name: string;
  category: string[];
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
  maxStock?: number;
  safetyStock?: number;
  isFlagged: boolean;
  primarySupplier?: string;
  unitCost?: number;
  description?: string;
  lastOrderDate?: string;
  nextOrderDate?: string;
  qualityScore?: number;
  photos?: string[];
  notes?: string;
  imageUrl?: string;
}