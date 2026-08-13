import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Invoice {
  id: string;
  project: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string;
  sentDate: string;
  paymentMethod: string;
}

interface EditInvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedInvoice: Invoice) => void;
}

const EditInvoiceModal = ({ invoice, isOpen, onClose, onSave }: EditInvoiceModalProps) => {
  const [editedInvoice, setEditedInvoice] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedInvoice(invoice);
  }, [invoice]);

  if (!editedInvoice) return null;

  const handleSave = async () => {
    if (!editedInvoice) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/billing/invoices/${editedInvoice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup")}`
        },
        body: JSON.stringify(editedInvoice)
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        onSave(updatedInvoice);
        toast({
          title: "Success",
          description: "Invoice updated successfully"
        });
        onClose();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update invoice",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Invoice {editedInvoice.id}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={editedInvoice.project}
                onChange={(e) =>
                  setEditedInvoice({ ...editedInvoice, project: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={editedInvoice.client}
                onChange={(e) =>
                  setEditedInvoice({ ...editedInvoice, client: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={editedInvoice.amount}
                onChange={(e) =>
                  setEditedInvoice({
                    ...editedInvoice,
                    amount: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editedInvoice.status}
                onValueChange={(value) =>
                  setEditedInvoice({ ...editedInvoice, status: value })
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={editedInvoice.dueDate}
                onChange={(e) =>
                  setEditedInvoice({ ...editedInvoice, dueDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={editedInvoice.paymentMethod}
                onValueChange={(value) =>
                  setEditedInvoice({ ...editedInvoice, paymentMethod: value })
                }
              >
                <SelectTrigger id="paymentMethod" className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="RTGS">RTGS</SelectItem>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceModal; 