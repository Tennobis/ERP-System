// Issue type for use throughout the client
export interface Issue {
  id: string;
  title?: string;
  type: 'labor-shortage' | 'machinery-defect' | 'quality-issue' | 'safety-concern' | 'material-delay' | 'other' | string;
  priority: 'low' | 'medium' | 'high' | 'critical' | string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | string;
  reportedBy?: string;
  reportedAt?: string;
  assignedTo?: string;
  description?: string;
  location?: string;
  estimatedResolutionTime?: number;
  actualResolutionTime?: number;
  photos?: string[];
  escalated?: boolean;
  impact?: string;
} 