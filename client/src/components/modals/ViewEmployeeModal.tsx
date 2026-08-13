import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ViewEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
    joinedAt: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function ViewEmployeeModal({ open, onClose, employee, onEdit, onDelete }: ViewEmployeeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}`} />
              <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {/* <div>
              <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
              <p>{employee.id}</p>
            </div> */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p>{employee.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Position</p>
              <p>{employee.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Joined At</p>
              <p>{new Date(employee.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onEdit}>
              Edit Details
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete Employee
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 