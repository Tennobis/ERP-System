// Task type for use throughout the client
export interface Task {
  id: string;
  name: string;
  project: string;
  assignedTo: string;
  startDate: string;
  dueDate: string;
  status: string;
  progress: number;
  description?: string;
  progressHistory?: {
    progress: number;
    remarks: string;
    timestamp: string;
  }[];
  // For Gantt chart
  endDate?: string;
  duration?: number;
  dependencies?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
} 