// Bill type for use throughout the client
export interface Bill {
  id: string;
  projectName: string;
  client: string;
  billNumber: string;
  amount: number;
  billDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'overdue' | 'disputed';
  type: 'progress' | 'milestone' | 'final' | 'retention';
  workProgress: number;
} 