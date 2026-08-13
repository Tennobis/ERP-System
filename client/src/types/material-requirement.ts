// MaterialRequirement type for use throughout the client
export interface MaterialRequirement {
  id: string;
  material: string;
  category: string;
  requiredQuantity: number;
  unit: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  plannedDate: string;
  supplier: string;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order';
  leadTime: number;
} 