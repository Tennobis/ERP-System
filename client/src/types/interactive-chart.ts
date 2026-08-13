// InteractiveChartProps type for use throughout the client
export interface InteractiveChartProps {
  title: string;
  description?: string;
  data: any[];
  type: 'line' | 'bar' | 'area' | 'pie';
  dataKey: string;
  xAxisKey?: string;
  secondaryDataKey?: string;
  colors?: string[];
  timeRanges?: string[];
  filters?: Array<{ key: string; label: string; options: string[] }>;
  onDrillDown?: (data: any) => void;
  showComparison?: boolean;
  showExport?: boolean;
} 