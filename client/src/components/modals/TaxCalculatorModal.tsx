import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface TaxCalculatorModalProps {
  onClose: () => void;
  onTaxCreated?: (tax: any) => void;
}

const TaxCalculatorModal: React.FC<TaxCalculatorModalProps> = ({ onClose, onTaxCreated }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculator state
  const [taxType, setTaxType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('');

  // Tax creation state
  const [taxTitle, setTaxTitle] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [taxCategory, setTaxCategory] = useState<string>('');

  // Set default rates for each tax type
  const handleTaxTypeChange = (value: string) => {
    setTaxType(value);
    if (value === 'GST') setRate('18');
    else if (value === 'TDS') setRate('10');
    else if (value === 'TCS') setRate('1');
    else setRate('');
  };

  // Calculate tax and total
  const baseAmount = parseFloat(amount) || 0;
  const taxRate = parseFloat(rate) || 0;
  const taxAmount = baseAmount * (taxRate / 100);
  const totalAmount = baseAmount + taxAmount;

  const handleCreateTax = async () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    if (!taxTitle || !company || !taxType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const taxData = {
        title: taxTitle,
        company: company,
        taxCategory: taxCategory || taxType,
        userId: user.id
      };

      const response = await axios.post(`${API_URL}/tax/taxes`, taxData, { headers });
      
      toast.success("Tax created successfully!");
      
      // Call the callback if provided
      if (onTaxCreated) {
        onTaxCreated(response.data);
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error creating tax:", error);
      toast.error(error.response?.data?.error || "Failed to create tax");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tax Calculator & Creator</DialogTitle>
          <DialogDescription>Calculate tax and create tax records</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Tax Creation Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create Tax Record</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxTitle">Tax Title *</Label>
                <Input 
                  id="taxTitle" 
                  placeholder="e.g., GST Tax" 
                  value={taxTitle} 
                  onChange={e => setTaxTitle(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input 
                  id="company" 
                  placeholder="e.g., ABC Company" 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="taxCategory">Tax Category</Label>
              <Input 
                id="taxCategory" 
                placeholder="e.g., GST, TDS, TCS" 
                value={taxCategory} 
                onChange={e => setTaxCategory(e.target.value)} 
              />
            </div>
          </div>

          {/* Tax Calculator */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tax Calculator</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="calcTaxType">Tax Type</Label>
                <Select value={taxType} onValueChange={handleTaxTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="TDS">TDS</SelectItem>
                    <SelectItem value="TCS">TCS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Enter amount" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="rate">Tax Rate (%)</Label>
                <Input 
                  id="rate" 
                  type="number" 
                  placeholder="Enter tax rate" 
                  value={rate} 
                  onChange={e => setRate(e.target.value)} 
                />
              </div>
            </div>
            
            {/* Tax Summary */}
            <div className="p-4 border rounded-lg bg-muted">
              <h4 className="font-medium mb-3">Tax Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>₹{baseAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Rate:</span>
                  <span>{taxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateTax} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Tax"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaxCalculatorModal; 