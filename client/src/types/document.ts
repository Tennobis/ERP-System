// Document type for use throughout the client
export interface Document {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'Invoice' | 'Contract' | 'Receipt' | 'Tax' | 'Audit';
  size?: string;
  modifiedDate?: string;
  uploadedBy?: string;
  date?: string;
  status?: 'Verified' | 'Pending Review';
  project?: string;
  amount?: string;
  client?: string;
  method?: string;
  sharedWith?: any[];
  sharedBy?: any;
  parentFolderId?: string | null;
  category?: 'all' | 'my' | 'shared';
} 