import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { EmployeeSalaryFormData, Employee } from "@/types/dummy-data-types";
import axios from "axios";
import React from "react"; // Added missing import

interface AddEmployeeSalaryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (salaryData: EmployeeSalaryFormData) => void;
  onEdit?: (salaryData: EmployeeSalaryFormData) => void;
  employees?: Employee[];
  editMode?: boolean;
  editData?: {
    employee: any;
    salary?: any;
  } | null;
}

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

export function AddEmployeeSalaryModal({ 
  open, 
  onClose, 
  onAdd, 
  onEdit, 
  employees, 
  editMode = false, 
  editData = null 
}: AddEmployeeSalaryModalProps) {
  const [formData, setFormData] = useState<EmployeeSalaryFormData>({
    employeeName: "",
    position: "",
    department: "",
    joinedAt: "",
    netSalary: 0,
    remarks: "",
    earnings: {
      basic: 0,
      da: 0,
      hra: 0,
      conveyance: 0,
      allowance: 0,
      medicalAllowance: 0,
      others: 0,
    },
    deductions: {
      tds: 0,
      esi: 0,
      pf: 0,
      leave: 0,
      profTax: 0,
      labourWelfare: 0,
      others: 0,
    },
  });

  // Populate form data when editing
  React.useEffect(() => {
    if (editMode && editData) {
      setFormData({
        employeeName: editData.employee.name || "",
        position: editData.employee.position || "",
        department: editData.employee.department || "",
        joinedAt: editData.employee.joinedAt ? new Date(editData.employee.joinedAt).toISOString().split('T')[0] : "",
        netSalary: editData.salary?.netSalary || 0,
        remarks: editData.salary?.remarks || "",
        earnings: {
          basic: editData.salary?.earnings?.basic || 0,
          da: editData.salary?.earnings?.da || 0,
          hra: editData.salary?.earnings?.hra || 0,
          conveyance: editData.salary?.earnings?.conveyance || 0,
          allowance: editData.salary?.earnings?.allowance || 0,
          medicalAllowance: editData.salary?.earnings?.medicalAllowance || 0,
          others: editData.salary?.earnings?.others || 0,
        },
        deductions: {
          tds: editData.salary?.deductions?.tds || 0,
          esi: editData.salary?.deductions?.esi || 0,
          pf: editData.salary?.deductions?.pf || 0,
          leave: editData.salary?.deductions?.leave || 0,
          profTax: editData.salary?.deductions?.profTax || 0,
          labourWelfare: editData.salary?.deductions?.labourWelfare || 0,
          others: editData.salary?.deductions?.others || 0,
        },
      });
    } else {
      // Reset form when not editing
      setFormData({
        employeeName: "",
        position: "",
        department: "",
        joinedAt: "",
        netSalary: 0,
        remarks: "",
        earnings: {
          basic: 0,
          da: 0,
          hra: 0,
          conveyance: 0,
          allowance: 0,
          medicalAllowance: 0,
          others: 0,
        },
        deductions: {
          tds: 0,
          esi: 0,
          pf: 0,
          leave: 0,
          profTax: 0,
          labourWelfare: 0,
          others: 0,
        },
      });
    }
  }, [editMode, editData, open]);

  // Remove unused state variables and effects

  const handleEarningsChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      earnings: {
        ...formData.earnings,
        [field]: value,
      },
    });
  };

  const handleDeductionsChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      deductions: {
        ...formData.deductions,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
      
      if (editMode && editData) {
        // Update existing employee and salary
        const employeePayload = {
          name: formData.employeeName,
          position: formData.position,
          department: formData.department,
          joinedAt: formData.joinedAt ? new Date(formData.joinedAt) : new Date(),
        };

        // Update employee
        await axios.put(`${API_URL}/hr/employees/${editData.employee.id}`, employeePayload, { headers });

        // Update salary if it exists
        if (editData.salary) {
          const salaryPayload = {
            netSalary: formData.netSalary,
            paymentDate: editData.salary.paymentDate,
            remarks: formData.remarks,
            earnings: formData.earnings,
            deductions: formData.deductions
          };

          await axios.put(`${API_URL}/hr-salary/employee-salaries/${editData.salary.id}`, salaryPayload, { headers });
        } else {
          // Create new salary record if it doesn't exist
          const salaryPayload = {
            employeeId: editData.employee.id,
            netSalary: formData.netSalary,
            paymentDate: null,
            remarks: formData.remarks,
            earnings: formData.earnings,
            deductions: formData.deductions
          };

          await axios.post(`${API_URL}/hr-salary/employee-salaries`, salaryPayload, { headers });
        }

        if (onEdit) {
          onEdit(formData);
        }
      } else {
        // Create new employee and salary
        const employeePayload = {
          name: formData.employeeName,
          position: formData.position,
          department: formData.department,
          joinedAt: formData.joinedAt ? new Date(formData.joinedAt) : new Date(),
        };

        const employeeResponse = await axios.post(`${API_URL}/hr/employees`, employeePayload, { headers });
        const employeeId = employeeResponse.data.id;

        // Then create the salary record
        const salaryPayload = {
          employeeId: employeeId,
          netSalary: formData.netSalary,
          paymentDate: null,
          remarks: formData.remarks,
          earnings: formData.earnings,
          deductions: formData.deductions
        };

        await axios.post(`${API_URL}/hr-salary/employee-salaries`, salaryPayload, { headers });
        
        onAdd(formData);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating/updating employee and salary:', error);
      alert(`Failed to ${editMode ? 'update' : 'create'} employee and salary record. Please try again.`);
    }
  };

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData({
      employeeName: "",
      position: "",
      department: "",
      joinedAt: "",
      netSalary: 0,
      remarks: "",
      earnings: {
        basic: 0,
        da: 0,
        hra: 0,
        conveyance: 0,
        allowance: 0,
        medicalAllowance: 0,
        others: 0,
      },
      deductions: {
        tds: 0,
        esi: 0,
        pf: 0,
        leave: 0,
        profTax: 0,
        labourWelfare: 0,
        others: 0,
      },
    });
    onClose();
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {editMode ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                placeholder="Enter employee name"
                disabled={editMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Enter position"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinedAt">Joined At</Label>
              <Input
                id="joinedAt"
                type="date"
                value={formData.joinedAt}
                onChange={(e) => setFormData({ ...formData, joinedAt: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="netSalary">Net Salary</Label>
              <Input
                id="netSalary"
                type="number"
                value={formData.netSalary}
                onChange={(e) => setFormData({ ...formData, netSalary: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={formData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Enter remarks"
              />
            </div>
          </div>






          {/* Earnings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Earnings</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basic">Basic</Label>
                <Input
                  id="basic"
                  type="number"
                  value={formData.earnings.basic}
                  onChange={(e) => handleEarningsChange("basic", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="da">DA(40%)</Label>
                <Input
                  id="da"
                  type="number"
                  value={formData.earnings.da}
                  onChange={(e) => handleEarningsChange("da", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hra">HRA(15%)</Label>
                <Input
                  id="hra"
                  type="number"
                  value={formData.earnings.hra}
                  onChange={(e) => handleEarningsChange("hra", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conveyance">Conveyance</Label>
                <Input
                  id="conveyance"
                  type="number"
                  value={formData.earnings.conveyance}
                  onChange={(e) => handleEarningsChange("conveyance", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowance">Allowance</Label>
                <Input
                  id="allowance"
                  type="number"
                  value={formData.earnings.allowance}
                  onChange={(e) => handleEarningsChange("allowance", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                <Input
                  id="medicalAllowance"
                  type="number"
                  value={formData.earnings.medicalAllowance}
                  onChange={(e) => handleEarningsChange("medicalAllowance", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="earningsOthers">Others</Label>
                <Input
                  id="earningsOthers"
                  type="number"
                  value={formData.earnings.others}
                  onChange={(e) => handleEarningsChange("others", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Deductions</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tds">TDS</Label>
                <Input
                  id="tds"
                  type="number"
                  value={formData.deductions.tds}
                  onChange={(e) => handleDeductionsChange("tds", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="esi">ESI</Label>
                <Input
                  id="esi"
                  type="number"
                  value={formData.deductions.esi}
                  onChange={(e) => handleDeductionsChange("esi", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pf">PF</Label>
                <Input
                  id="pf"
                  type="number"
                  value={formData.deductions.pf}
                  onChange={(e) => handleDeductionsChange("pf", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leave">Leave</Label>
                <Input
                  id="leave"
                  type="number"
                  value={formData.deductions.leave}
                  onChange={(e) => handleDeductionsChange("leave", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profTax">Prof.Tax</Label>
                <Input
                  id="profTax"
                  type="number"
                  value={formData.deductions.profTax}
                  onChange={(e) => handleDeductionsChange("profTax", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="labourWelfare">Labour Welfare</Label>
                <Input
                  id="labourWelfare"
                  type="number"
                  value={formData.deductions.labourWelfare}
                  onChange={(e) => handleDeductionsChange("labourWelfare", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deductionsOthers">Others</Label>
                <Input
                  id="deductionsOthers"
                  type="number"
                  value={formData.deductions.others}
                  onChange={(e) => handleDeductionsChange("others", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Input
              id="remarks"
              value={formData.remarks || ""}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Enter any additional remarks"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black">
              {editMode ? "Update Employee" : "Add Employee Salary"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
