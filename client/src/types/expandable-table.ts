// ExpandableTableProps type for use throughout the client
export interface ExpandableTableProps {
  title: string;
  description?: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'badge' | 'progress' | 'actions';
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    multiple?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  expandableContent?: (row: any) => React.ReactNode;
  searchKey?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: string[];
    multiple?: boolean;
  }>;
  onRowAction?: (action: string, row: any, updatedData?: any) => void;
  showExport?: boolean;
} 