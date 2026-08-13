// Transaction type for use throughout the client
export interface Transaction {
  id: string;
  desc: string;
  amount: string;
  date: string;
  type: 'Credit' | 'Debit';
} 