// Invoice type for use throughout the client
export interface Invoice {
  id: string;
  project: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string;
  sentDate: string;
  paymentMethod: string;
  // Optionals for billing dashboard
  invoice?: string;
  paidDate?: string | null;
  reminderCount?: number;
  lastReminderSent?: string | null;
} 