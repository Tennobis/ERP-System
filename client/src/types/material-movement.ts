// MaterialMovement type for use throughout the client
export interface MaterialMovement {
  id: number;
  type: "Inbound" | "Outbound";
  material: string;
  quantity: string;
  time: string;
  site: string;
} 