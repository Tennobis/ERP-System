import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Building2, User } from "lucide-react";
import { useState } from "react";

interface PayslipModalProps {
  open: boolean;
  onClose: () => void;
  salaryData: any;
}

export function PayslipModal({ open, onClose, salaryData }: PayslipModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!salaryData) return null;

  const { employee, earnings, deductions, netSalary, paymentDate } = salaryData;

  // Calculate total earnings and deductions
  const totalEarnings = earnings?.total || 
    (earnings?.basic || 0) + 
    (earnings?.da || 0) + 
    (earnings?.hra || 0) + 
    (earnings?.conveyance || 0) + 
    (earnings?.allowance || 0) + 
    (earnings?.medicalAllowance || 0) + 
    (earnings?.others || 0);

  const totalDeductions = deductions?.total || 
    (deductions?.tds || 0) + 
    (deductions?.esi || 0) + 
    (deductions?.pf || 0) + 
    (deductions?.leave || 0) + 
    (deductions?.profTax || 0) + 
    (deductions?.labourWelfare || 0) + 
    (deductions?.others || 0);

  const handleDownloadPayslip = async () => {
    setIsGenerating(true);
    
    try {
      // Create HTML content for the payslip
      const payslipHTML = generatePayslipHTML();
      
      // Create a temporary window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(payslipHTML);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      alert('Failed to generate payslip. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const generatePayslipHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const payPeriod = paymentDate ? new Date(paymentDate).toLocaleDateString() : 'N/A';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${employee?.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; }
          .payslip-container { max-width: 800px; margin: 20px auto; background: white; border: 1px solid #ddd; }
          .header { background: #f8f9fa; padding: 20px; border-bottom: 2px solid #dee2e6; }
          .company-info, .employee-info { margin-bottom: 15px; }
          .section-title { font-size: 16px; font-weight: bold; color: #495057; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f3f4; }
          .info-label { font-weight: 600; color: #6c757d; }
          .info-value { font-weight: 500; }
          .content { padding: 20px; }
          .salary-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0; }
          .earnings, .deductions { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .earnings h3 { color: #28a745; }
          .deductions h3 { color: #dc3545; }
          .salary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
          .salary-total { display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 16px; border-top: 2px solid #495057; margin-top: 10px; }
          .net-salary { background: #d4edda; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; border: 1px solid #c3e6cb; }
          .net-salary-amount { font-size: 24px; font-weight: bold; color: #155724; }
          .footer { background: #f8f9fa; padding: 15px 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px; }
          @media print {
            body { background: white; }
            .payslip-container { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="payslip-container">
          <div class="header">
            <div class="info-grid">
              <div class="company-info">
                <div class="section-title">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 2.5a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1H4.5v1h1.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1H4.5v1h1.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-2zm8-4a.5.5 0 0 1-.5.5H10v1h1.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5H12a.5.5 0 0 1 0 1zm0 4a.5.5 0 0 1-.5.5H10v1h1.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5H12a.5.5 0 0 1 0 1z"/>
                  </svg>
                  FROM
                </div>
                <div class="info-item">
                  <span class="info-label">Company Name:</span>
                  <span class="info-value">Talant Cubicle.</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Address:</span>
                  <span class="info-value">123 Business Street, City, State 12345</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">info@testboard.com</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">+91 9876543210</span>
                </div>
              </div>
              
              <div class="employee-info">
                <div class="section-title">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  TO
                </div>
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${employee?.name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Position:</span>
                  <span class="info-value">${employee?.position || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Department:</span>
                  <span class="info-value">${employee?.department || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Joining Date:</span>
                  <span class="info-value">${employee?.joinedAt ? new Date(employee.joinedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
              <h2 style="color: #495057; margin-bottom: 5px;">SALARY SLIP</h2>
              <p style="color: #6c757d;">Pay Period: ${payPeriod} | Generated: ${currentDate}</p>
            </div>
          </div>
          
          <div class="content">
            <div class="salary-details">
              <div class="earnings">
                <h3>EARNINGS</h3>
                <div class="salary-item">
                  <span>Basic Salary</span>
                  <span>₹${(earnings?.basic || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>DA (40%)</span>
                  <span>₹${(earnings?.da || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>HRA (15%)</span>
                  <span>₹${(earnings?.hra || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Conveyance</span>
                  <span>₹${(earnings?.conveyance || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Allowance</span>
                  <span>₹${(earnings?.allowance || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Medical Allowance</span>
                  <span>₹${(earnings?.medicalAllowance || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Others</span>
                  <span>₹${(earnings?.others || 0).toLocaleString()}</span>
                </div>
                <div class="salary-total">
                  <span>TOTAL EARNINGS</span>
                  <span>₹${totalEarnings.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="deductions">
                <h3>DEDUCTIONS</h3>
                <div class="salary-item">
                  <span>TDS</span>
                  <span>₹${(deductions?.tds || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>ESI</span>
                  <span>₹${(deductions?.esi || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>PF</span>
                  <span>₹${(deductions?.pf || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Leave</span>
                  <span>₹${(deductions?.leave || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Prof. Tax</span>
                  <span>₹${(deductions?.profTax || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Labour Welfare</span>
                  <span>₹${(deductions?.labourWelfare || 0).toLocaleString()}</span>
                </div>
                <div class="salary-item">
                  <span>Others</span>
                  <span>₹${(deductions?.others || 0).toLocaleString()}</span>
                </div>
                <div class="salary-total">
                  <span>TOTAL DEDUCTIONS</span>
                  <span>₹${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="net-salary">
              <div style="margin-bottom: 10px; font-size: 18px; font-weight: 600;">NET SALARY</div>
              <div class="net-salary-amount">₹${(netSalary || 0).toLocaleString()}</div>
              <div style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                (Total Earnings: ₹${totalEarnings.toLocaleString()} - Total Deductions: ₹${totalDeductions.toLocaleString()})
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>© ${new Date().getFullYear()} TestBoard Construction Ltd. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Generate Payslip - {employee?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Company and Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From - Company */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                FROM
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Name:</span>
                  <span className="font-medium">Talant Cubicle.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium">123 Business Street, City</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">info@testboard.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">+91 9876543210</span>
                </div>
              </div>
            </div>

            {/* To - Employee */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                TO
              </div>
              <div className="space-y-2 text-sm">
                {/* <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-medium">{employee?.id}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{employee?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-medium">{employee?.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{employee?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="font-medium">
                    {employee?.joinedAt ? new Date(employee.joinedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payslip Details Header */}
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <h2 className="text-2xl font-bold">SALARY SLIP</h2>
            <p className="text-muted-foreground mt-1">
              {/* Pay Period: {paymentDate ? new Date(paymentDate).toLocaleDateString() : 'N/A'} |  */}
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Earnings and Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-green-600 border-b pb-2">EARNINGS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span>₹{(earnings?.basic || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>DA (40%)</span>
                  <span>₹{(earnings?.da || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>HRA (15%)</span>
                  <span>₹{(earnings?.hra || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conveyance</span>
                  <span>₹{(earnings?.conveyance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowance</span>
                  <span>₹{(earnings?.allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Allowance</span>
                  <span>₹{(earnings?.medicalAllowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Others</span>
                  <span>₹{(earnings?.others || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2 mt-3">
                  <span>TOTAL EARNINGS</span>
                  <span>₹{totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-red-600 border-b pb-2">DEDUCTIONS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>TDS</span>
                  <span>₹{(deductions?.tds || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ESI</span>
                  <span>₹{(deductions?.esi || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PF</span>
                  <span>₹{(deductions?.pf || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Leave</span>
                  <span>₹{(deductions?.leave || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prof. Tax</span>
                  <span>₹{(deductions?.profTax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labour Welfare</span>
                  <span>₹{(deductions?.labourWelfare || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Others</span>
                  <span>₹{(deductions?.others || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2 mt-3">
                  <span>TOTAL DEDUCTIONS</span>
                  <span>₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="text-center p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="text-lg font-semibold text-green-800 mb-2">NET SALARY</div>
            <div className="text-3xl font-bold text-green-900">₹{(netSalary || 0).toLocaleString()}</div>
            <div className="text-sm text-green-600 mt-2">
              (Total Earnings: ₹{totalEarnings.toLocaleString()} - Total Deductions: ₹{totalDeductions.toLocaleString()})
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={handleDownloadPayslip}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Payslip'}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>© {new Date().getFullYear()} TestBoard Construction Ltd. All rights reserved.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
