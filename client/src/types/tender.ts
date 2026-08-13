// Tender type for use throughout the client
export interface Tender {
  id: string;
  projectName: string;
  client: string;
  estimatedValue: number;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'under-evaluation' | 'awarded' | 'rejected';
  completionPercentage: number;
  category: string;
  location: string;
} 