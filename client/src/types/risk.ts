// Risk type for use throughout the client
export interface Risk {
  id?: string;
  project: string;
  riskLevel: string;
  probability: number;
  impact: string;
  mitigation: string;
  category?: string;
  lastAssessment?: string;
  nextReview?: string;
  owner?: string;
  mitigationActions?: string[];
  isFlagged?: boolean;
} 