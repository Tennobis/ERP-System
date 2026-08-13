import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import type { Tax, TaxCharge } from "@/types/dummy-data-types";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface EditTaxModalProps {
  onClose: () => void;
  onTaxUpdated?: (tax: Tax) => void;
  tax: Tax;
}

interface LocalTaxCharge {
  id: number;
  type: string;
  accountHead: string;
  taxRate: number;
  amount: number;
  total: number;
}

const EditTaxModal = ({ onClose, onTaxUpdated, tax }: EditTaxModalProps) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(tax?.title || "");
  const [company, setCompany] = useState(tax?.company || "");
  const [taxCategory, setTaxCategory] = useState(tax?.taxCategory || "");
  const [isDefault, setIsDefault] = useState((tax as any)?.isDefault || false);
  const [isDisabled, setIsDisabled] = useState((tax as any)?.isDisabled || false);

  // Taxes and Charges logic
  const [taxCharges, setTaxCharges] = useState<LocalTaxCharge[]>(tax?.taxCharges?.map((charge: TaxCharge, idx: number) => ({
    id: Number(charge.id) || idx + 1,
    type: charge.type,
    accountHead: charge.accountHead,
    taxRate: charge.taxRate,
    amount: charge.amount,
    total: charge.total
  })) || []);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (tax) {
      setTitle(tax.title || "");
      setCompany(tax.company || "");
      setTaxCategory(tax.taxCategory || "");
      setIsDefault((tax as any)?.isDefault || false);
      setIsDisabled((tax as any)?.isDisabled || false);
      setTaxCharges(tax.taxCharges?.map((charge: TaxCharge, idx: number) => ({
        id: Number(charge.id) || idx + 1,
        type: charge.type,
        accountHead: charge.accountHead,
        taxRate: charge.taxRate,
        amount: charge.amount,
        total: charge.total
      })) || []);
    }
  }, [tax]);

  const addTaxCharge = () => {
    const newId = taxCharges.length > 0 ? Math.max(...taxCharges.map(item => item.id)) + 1 : 1;
    setTaxCharges([
      ...taxCharges,
      { id: newId, type: '', accountHead: '', taxRate: 0, amount: 0, total: 0 }
    ]);
  };

  const updateTaxCharge = (id: number, field: keyof LocalTaxCharge, value: string | number) => {
    setTaxCharges(taxCharges.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'taxRate' || field === 'amount') {
          updatedItem.total = Number(updatedItem.taxRate) * Number(updatedItem.amount) / 100;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const toggleRowSelection = (id: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.size === taxCharges.length && taxCharges.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(taxCharges.map(item => item.id));
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  };

  const deleteSelectedRows = () => {
    const newTaxCharges = taxCharges.filter(item => !selectedRows.has(item.id));
    setTaxCharges(newTaxCharges);
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Tax title is required");
      return false;
    }
    if (!company.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!user?.id) {
      toast.error("User not authenticated");
      return false;
    }
    if (taxCharges.length === 0) {
      toast.error("At least one tax charge is required");
      return false;
    }
    for (const charge of taxCharges) {
      if (!charge.type) {
        toast.error("Tax type is required for all charges");
        return false;
      }
      if (!charge.accountHead.trim()) {
        toast.error("Account head is required for all charges");
        return false;
      }
      if (charge.amount <= 0) {
        toast.error("Amount must be greater than 0 for all charges");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Update only the tax entity without taxCharges
      const taxData = {
        title: title.trim(),
        company: company.trim(),
        taxCategory: taxCategory.trim()
      };
      
      const response = await axios.put(`${API_URL}/tax/taxes/${tax.id}`, taxData, { headers });
      
      // Handle tax charges separately - delete existing ones and create new ones
      // First, get existing tax charges for this tax
      const existingCharges = await axios.get(`${API_URL}/tax/tax-charges?taxId=${tax.id}`, { headers });
      
      // Delete existing tax charges
      if (existingCharges.data && existingCharges.data.length > 0) {
        const deletePromises = existingCharges.data.map((charge: any) => 
          axios.delete(`${API_URL}/tax/tax-charges/${charge.id}`, { headers })
        );
        await Promise.all(deletePromises);
      }
      
      // Create new tax charges
      if (taxCharges.length > 0) {
        const createPromises = taxCharges.map((charge, index) => 
          axios.post(`${API_URL}/tax/tax-charges`, {
            serialNo: index + 1,
            type: charge.type as 'TDS' | 'GST' | 'TCS',
            accountHead: charge.accountHead.trim(),
            taxRate: charge.taxRate,
            amount: charge.amount,
            total: charge.total,
            taxId: tax.id
          }, { headers })
        );
        await Promise.all(createPromises);
      }
      
      toast.success("Tax updated successfully!");
      onTaxUpdated?.(response.data);
      onClose();
    } catch (error: any) {
      console.error("Error updating tax:", error);
      toast.error(error.response?.data?.message || "Failed to update tax");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Tax</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <Label htmlFor="tax-title">Title<span className="text-red-500"> *</span></Label>
            <Input id="tax-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
            <Label htmlFor="tax-category" className="mt-4">Tax Category</Label>
            <Input id="tax-category" value={taxCategory} onChange={e => setTaxCategory(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="tax-company">Company<span className="text-red-500"> *</span></Label>
            <Input id="tax-company" value={company} onChange={e => setCompany(e.target.value)} className="mt-1 font-semibold" />
          </div>
        </div>
        {/* Taxes and Charges Section */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
            <div className="flex items-center justify-between">
              <CardTitle>Taxes and Charges</CardTitle>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {expanded && (
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Advance Taxes and Charges</h4>
                {taxCharges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                    <p>No Data</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Table Headers */}
                    <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded">
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                        />
                      </div>
                      <div className="col-span-1">No.</div>
                      <div className="col-span-1">Type *</div>
                      <div className="col-span-2">Account Head *</div>
                      <div className="col-span-1">Tax Rate</div>
                      <div className="col-span-1">Amount</div>
                      <div className="col-span-1">Total</div>
                    </div>
                    {/* Table Rows */}
                    {taxCharges.map((charge, index) => (
                      <div key={charge.id} className="grid grid-cols-8 gap-2 items-center p-2 border rounded">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedRows.has(charge.id)}
                            onChange={() => toggleRowSelection(charge.id)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            value={index + 1}
                            readOnly
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <Select value={charge.type} onValueChange={value => updateTaxCharge(charge.id, 'type', value)}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TDS">TDS</SelectItem>
                              <SelectItem value="GST">GST</SelectItem>
                              <SelectItem value="TCS">TCS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={charge.accountHead}
                            onChange={e => updateTaxCharge(charge.id, 'accountHead', e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Enter account head"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            value={charge.taxRate}
                            onChange={e => updateTaxCharge(charge.id, 'taxRate', Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            value={charge.amount}
                            onChange={e => updateTaxCharge(charge.id, 'amount', Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            value={charge.total.toFixed(2)}
                            readOnly
                            className="h-8 text-sm bg-gray-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button onClick={addTaxCharge} variant="outline" size="sm">
                    Add Row
                  </Button>
                  {selectedRows.size > 0 && (
                    <Button onClick={deleteSelectedRows} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete Selected ({selectedRows.size})
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Tax"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaxModal; 