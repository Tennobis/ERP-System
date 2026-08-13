// AddEventModalProps type for use throughout the client
export interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (event: {
    name: string;
    type: string;
    date: string;
    time: string;
    description: string;
  }) => void;
} 