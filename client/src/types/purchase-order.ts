// PurchaseOrder type for use throughout the client
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  items: string;
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  status: "draft" | "sent" | "acknowledged" | "delivered" | "invoiced" | "paid";
  priority: "low" | "medium" | "high" | "urgent";
  project: string;
} 