import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Calculator,
  FileText,
  Building2,
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  ServiceInvoice,
  ServiceInvoiceFormData,
  ServiceInvoiceLineItem,
  SERVICE_INVOICE_UNITS,
  SERVICE_INVOICE_CATEGORIES,
  INDIAN_STATES,
} from "@/types/service-invoice";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Switch } from "@/components/ui/switch";

// Helper functions
const generateTempId = () => Math.random().toString(36).slice(2, 10);

const API_BASE_URL = import.meta.env.VITE_API_URL;

const createBlankLineItem = (slNo = 1): BillLineItemRecord => ({
  id: generateTempId(),
  categoryId: "",
  slNo,
  description: "",
  sacHsnCode: "",
  unit: "",
  unitRate: 0,
  previousQuantity: 0,
  presentQuantity: 0,
  cumulativeQuantity: 0,
  previousAmount: 0,
  presentAmount: 0,
  cumulativeAmount: 0,
  isDeduction: false,
  isRevisedRate: false,
});

const createBlankCategory = (sequence = 1): BillCategoryRecord => ({
  id: generateTempId(),
  clientBillId: "",
  categoryCode: "",
  categoryName: "",
  tower: "",
  description: "",
  sequence,
  lineItems: [createBlankLineItem()],
});

// Client Bill Form Types
interface BillLineItemRecord {
  id: string;
  categoryId: string;
  slNo: number;
  description: string;
  sacHsnCode?: string;
  unit: string;
  unitRate: number;
  previousQuantity: number;
  presentQuantity: number;
  cumulativeQuantity: number;
  previousAmount: number;
  presentAmount: number;
  cumulativeAmount: number;
  isDeduction?: boolean;
  isRevisedRate?: boolean;
}

interface BillCategoryRecord {
  id: string;
  clientBillId: string;
  categoryCode: string;
  categoryName: string;
  tower?: string;
  description?: string;
  sequence: number;
  lineItems: BillLineItemRecord[];
}

interface ClientBillFormData {
  invoiceNo: string;
  invoiceDate: string;
  raBillNo: string;
  workOrderNo: string;
  workOrderDate: string;
  reverseCharges: boolean;
  billingPartyName: string;
  billingPartyAddress: string;
  billingPartyGSTIN: string;
  billingPartyState: string;
  billingPartyStateCode: string;
  providerName: string;
  providerAddress: string;
  providerGSTIN: string;
  providerState: string;
  providerStateCode: string;
  projectName: string;
  projectLocation: string;
  contractorName: string;
  contractorPAN: string;
  contractorVillage: string;
  contractorPost: string;
  contractorDistrict: string;
  contractorPin: string;
  totalAmount: number | null;
  tdsPercentage: number | null;
  debitAdjustValue: number | null;
  bankName: string;
  bankBranch: string;
  accountNo: string;
  ifscCode: string;
  categories: BillCategoryRecord[];
}

interface ServiceInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: ServiceInvoice) => void;
  projectId?: string;
  clientId?: string;
  initialData?: Partial<ServiceInvoice>;
}

export const ServiceInvoiceModal: React.FC<ServiceInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  clientId,
  initialData,
}) => {
  const { user } = useUser();
  const [formData, setFormData] = useState<ServiceInvoiceFormData>({
    header: {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      state: "West Bengal",
      stateCode: "19",
      raBillNumber: "",
      uniqueIdentifier: "",
    },
    receiver: {
      name: "",
      address: "",
      gstin: "",
      state: "West Bengal",
      stateCode: "19",
    },
    project: {
      serviceRenderedAt: "",
      name: "",
      address: "",
      gstin: "",
      state: "West Bengal",
      stateCode: "19",
    },
    lineItems: [],
    summary: {
      deductionRate: 0.01,
    },
  });

  const [currentCategory, setCurrentCategory] = useState<string>("");

  // Client Bill Form State
  // Client Bill Form State
  const [clientBillFormData, setClientBillFormData] =
    useState<ClientBillFormData>(() => {
      const initialCategory = createBlankCategory(1);
      // Ensure the initial line item has the correct categoryId
      if (initialCategory.lineItems.length > 0) {
        initialCategory.lineItems[0].categoryId = initialCategory.id;
      }

      return {
        invoiceNo: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        raBillNo: "",
        workOrderNo: "",
        workOrderDate: "",
        reverseCharges: false,
        billingPartyName: "",
        billingPartyAddress: "",
        billingPartyGSTIN: "",
        billingPartyState: "",
        billingPartyStateCode: "",
        providerName: "",
        providerAddress: "",
        providerGSTIN: "",
        providerState: "",
        providerStateCode: "",
        projectName: "",
        projectLocation: "",
        contractorName: "",
        contractorPAN: "",
        contractorVillage: "",
        contractorPost: "",
        contractorDistrict: "",
        contractorPin: "",
        totalAmount: null,
        tdsPercentage: null,
        debitAdjustValue: null,
        bankName: "",
        bankBranch: "",
        accountNo: "",
        ifscCode: "",
        categories: [initialCategory],
      };
    });

  const [isClientBillSaving, setIsClientBillSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        header: initialData.header || formData.header,
        receiver: initialData.receiver || formData.receiver,
        project: initialData.project || formData.project,
        lineItems: initialData.lineItems || [],
        summary: initialData.summary || formData.summary,
      });
    }
  }, [initialData]);

  const addLineItem = () => {
    const newItem: Partial<ServiceInvoiceLineItem> = {
      siNo: (formData.lineItems.length + 1).toString(),
      description: "",
      unit: "Nos.",
      rate: 0,
      quantityPrevious: 0,
      quantityPresent: 0,
      quantityCumulative: 0,
      amountPrevious: 0,
      amountPresent: 0,
      amountCumulative: 0,
      category: currentCategory,
    };
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (
    index: number,
    field: keyof ServiceInvoiceLineItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate cumulative quantity
          if (field === "quantityPrevious" || field === "quantityPresent") {
            const prevQty =
              field === "quantityPrevious" ? value : item.quantityPrevious || 0;
            const presQty =
              field === "quantityPresent" ? value : item.quantityPresent || 0;
            updatedItem.quantityCumulative = prevQty + presQty;
          }

          // Auto-calculate amounts
          if (
            field === "rate" ||
            field === "quantityPrevious" ||
            field === "quantityPresent"
          ) {
            const rate = field === "rate" ? value : item.rate || 0;
            const prevQty =
              field === "quantityPrevious" ? value : item.quantityPrevious || 0;
            const presQty =
              field === "quantityPresent" ? value : item.quantityPresent || 0;

            updatedItem.amountPrevious = rate * prevQty;
            updatedItem.amountPresent = rate * presQty;
            updatedItem.amountCumulative = rate * (prevQty + presQty);
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const calculateSummary = () => {
    const taxableValuePrevious = formData.lineItems.reduce(
      (sum, item) => sum + (item.amountPrevious || 0),
      0
    );
    const taxableValuePresent = formData.lineItems.reduce(
      (sum, item) => sum + (item.amountPresent || 0),
      0
    );
    const taxableValueCumulative = formData.lineItems.reduce(
      (sum, item) => sum + (item.amountCumulative || 0),
      0
    );

    const deductionRate = formData.summary.deductionRate || 0.01;
    const deductionAmountPrevious = taxableValuePrevious * deductionRate;
    const deductionAmountPresent = taxableValuePresent * deductionRate;
    const deductionAmountCumulative = taxableValueCumulative * deductionRate;

    const totalAmountPrevious = taxableValuePrevious - deductionAmountPrevious;
    const totalAmountPresent = taxableValuePresent - deductionAmountPresent;
    const totalAmountCumulative =
      taxableValueCumulative - deductionAmountCumulative;

    const payableAmountRoundedPrevious = Math.round(totalAmountPrevious);
    const payableAmountRoundedPresent = Math.round(totalAmountPresent);
    const payableAmountRoundedCumulative = Math.round(totalAmountCumulative);

    setFormData((prev) => ({
      ...prev,
      summary: {
        ...prev.summary,
        taxableValuePrevious,
        taxableValuePresent,
        taxableValueCumulative,
        deductionAmountPrevious,
        deductionAmountPresent,
        deductionAmountCumulative,
        totalAmountPrevious,
        totalAmountPresent,
        totalAmountCumulative,
        payableAmountRoundedPrevious,
        payableAmountRoundedPresent,
        payableAmountRoundedCumulative,
      },
    }));
  };

  useEffect(() => {
    calculateSummary();
  }, [formData.lineItems, formData.summary.deductionRate]);

  const handleSave = () => {
    if (
      !formData.header.invoiceNumber ||
      !formData.receiver.name ||
      !formData.project.name
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const serviceInvoice: ServiceInvoice = {
      id: initialData?.id || `SI-${Date.now()}`,
      header: formData.header as any,
      receiver: formData.receiver as any,
      project: formData.project as any,
      lineItems: formData.lineItems as any,
      summary: formData.summary as any,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: initialData?.status || "draft",
      projectId,
      clientId,
    };

    onSave(serviceInvoice);
    toast.success("Service invoice saved successfully!");
    onClose();
  };

  const groupedLineItems = formData.lineItems.reduce((acc, item, index) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...item, index });
    return acc;
  }, {} as Record<string, (Partial<ServiceInvoiceLineItem> & { index: number })[]>);

  // Client Bill Handler Functions
  const handleClientBillFieldChange = (
    field: keyof ClientBillFormData,
    value: any
  ) => {
    setClientBillFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addCategorySection = () => {
    setClientBillFormData((prev) => {
      const newCategory = createBlankCategory(prev.categories.length + 1);
      const seededCategory = {
        ...newCategory,
        lineItems: newCategory.lineItems.map((line, index) => ({
          ...line,
          categoryId: newCategory.id,
          slNo: index + 1,
        })),
      };
      return {
        ...prev,
        categories: [...prev.categories, seededCategory],
      };
    });
  };

  const removeCategorySection = (categoryIndex: number) => {
    setClientBillFormData((prev) => {
      if (prev.categories.length === 1) return prev;
      const updatedCategories = prev.categories.filter(
        (_, i) => i !== categoryIndex
      );
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleCategoryFieldChange = (
    categoryIndex: number,
    field: keyof BillCategoryRecord,
    value: any
  ) => {
    setClientBillFormData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === categoryIndex ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const addLineItemRow = (categoryIndex: number) => {
    setClientBillFormData((prev) => {
      const updatedCategories = prev.categories.map((category, idx) => {
        if (idx !== categoryIndex) return category;
        const newLine = {
          ...createBlankLineItem(category.lineItems.length + 1),
          categoryId: category.id,
        };
        return {
          ...category,
          lineItems: [...category.lineItems, newLine],
        };
      });
      return { ...prev, categories: updatedCategories };
    });
  };

  const removeLineItemRow = (categoryIndex: number, lineIndex: number) => {
    setClientBillFormData((prev) => {
      const updatedCategories = prev.categories.map((category, idx) => {
        if (idx !== categoryIndex) return category;
        if (category.lineItems.length === 1) return category;
        const remainingLines = category.lineItems.filter(
          (_, lIdx) => lIdx !== lineIndex
        );
        return { ...category, lineItems: remainingLines };
      });
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleLineItemFieldChange = (
    categoryIndex: number,
    lineIndex: number,
    field: keyof BillLineItemRecord,
    value: any
  ) => {
    setClientBillFormData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, ci) => {
        if (ci === categoryIndex) {
          return {
            ...cat,
            lineItems: cat.lineItems.map((line, li) => {
              if (li === lineIndex) {
                const updatedLine = { ...line, [field]: value };

                // Auto-calculate cumulative quantity
                if (
                  field === "previousQuantity" ||
                  field === "presentQuantity"
                ) {
                  updatedLine.cumulativeQuantity =
                    (field === "previousQuantity"
                      ? parseFloat(value) || 0
                      : line.previousQuantity) +
                    (field === "presentQuantity"
                      ? parseFloat(value) || 0
                      : line.presentQuantity);
                }

                // Auto-calculate amounts
                if (
                  field === "unitRate" ||
                  field === "previousQuantity" ||
                  field === "presentQuantity"
                ) {
                  const rate =
                    field === "unitRate"
                      ? parseFloat(value) || 0
                      : line.unitRate;
                  const prevQty =
                    field === "previousQuantity"
                      ? parseFloat(value) || 0
                      : line.previousQuantity;
                  const presQty =
                    field === "presentQuantity"
                      ? parseFloat(value) || 0
                      : line.presentQuantity;

                  updatedLine.previousAmount = rate * prevQty;
                  updatedLine.presentAmount = rate * presQty;
                  updatedLine.cumulativeAmount = rate * (prevQty + presQty);
                }

                return updatedLine;
              }
              return line;
            }),
          };
        }
        return cat;
      }),
    }));
  };

  // Calculate TDS and Net Bill Amount
  const calculatedTdsAmount = (
    ((clientBillFormData.totalAmount || 0) *
      (clientBillFormData.tdsPercentage || 0)) /
    100
  ).toFixed(2);

  const calculatedNetBillAmount = (
    (clientBillFormData.totalAmount || 0) -
    parseFloat(calculatedTdsAmount) -
    (clientBillFormData.debitAdjustValue || 0)
  ).toFixed(2);

  const handleClientBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsClientBillSaving(true);

    try {
      // Prepare data for backend - convert string values to numbers where needed
      const billPayload = {
        invoiceNo: clientBillFormData.invoiceNo,
        invoiceDate: new Date(clientBillFormData.invoiceDate),
        raBillNo: clientBillFormData.raBillNo,
        workOrderNo: clientBillFormData.workOrderNo,
        workOrderDate: clientBillFormData.workOrderDate ? new Date(clientBillFormData.workOrderDate) : null,
        reverseCharges: clientBillFormData.reverseCharges,
        billingPartyName: clientBillFormData.billingPartyName,
        billingPartyAddress: clientBillFormData.billingPartyAddress,
        billingPartyGSTIN: clientBillFormData.billingPartyGSTIN,
        billingPartyState: clientBillFormData.billingPartyState,
        billingPartyStateCode: clientBillFormData.billingPartyStateCode,
        providerName: clientBillFormData.providerName,
        providerAddress: clientBillFormData.providerAddress,
        providerGSTIN: clientBillFormData.providerGSTIN,
        providerState: clientBillFormData.providerState,
        providerStateCode: clientBillFormData.providerStateCode,
        projectName: clientBillFormData.projectName,
        projectLocation: clientBillFormData.projectLocation,
        contractorName: clientBillFormData.contractorName,
        contractorPAN: clientBillFormData.contractorPAN,
        contractorVillage: clientBillFormData.contractorVillage,
        contractorPost: clientBillFormData.contractorPost,
        contractorDistrict: clientBillFormData.contractorDistrict,
        contractorPin: clientBillFormData.contractorPin,
        totalAmount: clientBillFormData.totalAmount ? parseFloat(String(clientBillFormData.totalAmount)) : 0,
        tdsPercentage: clientBillFormData.tdsPercentage ? parseFloat(String(clientBillFormData.tdsPercentage)) : 0,
        tdsAmount: clientBillFormData.totalAmount && clientBillFormData.tdsPercentage
          ? (parseFloat(String(clientBillFormData.totalAmount)) * parseFloat(String(clientBillFormData.tdsPercentage))) / 100
          : 0,
        netBillAmount: clientBillFormData.totalAmount && clientBillFormData.tdsPercentage && clientBillFormData.debitAdjustValue
          ? parseFloat(String(clientBillFormData.totalAmount)) - ((parseFloat(String(clientBillFormData.totalAmount)) * parseFloat(String(clientBillFormData.tdsPercentage))) / 100) - parseFloat(String(clientBillFormData.debitAdjustValue))
          : clientBillFormData.totalAmount ? parseFloat(String(clientBillFormData.totalAmount)) : 0,
        debitAdjustValue: clientBillFormData.debitAdjustValue ? parseFloat(String(clientBillFormData.debitAdjustValue)) : 0,
        bankName: clientBillFormData.bankName,
        bankBranch: clientBillFormData.bankBranch,
        accountNo: clientBillFormData.accountNo,
        ifscCode: clientBillFormData.ifscCode,
        categories: clientBillFormData.categories.map((cat) => ({
          categoryCode: cat.categoryCode,
          categoryName: cat.categoryName,
          tower: cat.tower,
          description: cat.description,
          sequence: cat.sequence,
          lineItems: cat.lineItems.map((line) => ({
            slNo: line.slNo,
            description: line.description,
            sacHsnCode: line.sacHsnCode,
            unit: line.unit,
            unitRate: parseFloat(String(line.unitRate)) || 0,
            previousQuantity: parseFloat(String(line.previousQuantity)) || 0,
            presentQuantity: parseFloat(String(line.presentQuantity)) || 0,
            cumulativeQuantity: parseFloat(String(line.cumulativeQuantity)) || 0,
            previousAmount: parseFloat(String(line.previousAmount)) || 0,
            presentAmount: parseFloat(String(line.presentAmount)) || 0,
            cumulativeAmount: parseFloat(String(line.cumulativeAmount)) || 0,
            isDeduction: line.isDeduction || false,
            isRevisedRate: line.isRevisedRate || false,
          })),
        })),
      };

      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      const response = await fetch(`${API_BASE_URL}/client-bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save client bill");
      }

      toast.success("Service invoice saved successfully!");
      setIsClientBillSaving(false);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save service invoice");
      setIsClientBillSaving(false);
    }
  };

  const setIsClientBillFormOpen = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-[90vw] xl:max-w-[1400px] 2xl:max-w-[1600px] bg-white"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add Service Invoice</DialogTitle>
          <DialogDescription>
            Fill every section to match the service invoice layout.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto px-4 sm:px-6 pb-6">
          <form onSubmit={handleClientBillSubmit} className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-[#f7f8f8] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xl font-semibold">Invoice Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNo">Invoice No.</Label>
                  <Input
                    id="invoiceNo"
                    placeholder="#1234"
                    value={clientBillFormData.invoiceNo}
                    onChange={(e) =>
                      handleClientBillFieldChange("invoiceNo", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={clientBillFormData.invoiceDate}
                    onChange={(e) =>
                      handleClientBillFieldChange("invoiceDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="raBillNo">RA Bill No.</Label>
                  <Input
                    id="raBillNo"
                    placeholder="AB234"
                    value={clientBillFormData.raBillNo}
                    onChange={(e) =>
                      handleClientBillFieldChange("raBillNo", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="workOrderNo">Work Order No.</Label>
                  <Input
                    id="workOrderNo"
                    value={clientBillFormData.workOrderNo}
                    placeholder="001"
                    onChange={(e) =>
                      handleClientBillFieldChange("workOrderNo", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="workOrderDate">Work Order Date</Label>
                  <Input
                    id="workOrderDate"
                    type="date"
                    value={clientBillFormData.workOrderDate}
                    onChange={(e) =>
                      handleClientBillFieldChange(
                        "workOrderDate",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Reverse Charges</p>
                  <p className="text-xs text-muted-foreground">
                    Mark if reverse charges apply to this bill
                  </p>
                </div>
                <Switch
                  checked={clientBillFormData.reverseCharges}
                  onCheckedChange={(checked) =>
                    handleClientBillFieldChange("reverseCharges", checked)
                  }
                  className="data-[state=unchecked]:bg-black"
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#f7f8f8] p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Billing Party</h4>
                  <div>
                    <Label htmlFor="billingPartyName">Name</Label>
                    <Input
                      id="billingPartyName"
                      placeholder="Enter Billing Party Name"
                      value={clientBillFormData.billingPartyName}
                      onChange={(e) =>
                        handleClientBillFieldChange(
                          "billingPartyName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingPartyAddress">Address</Label>
                    <Textarea
                      id="billingPartyAddress"
                      placeholder="Enter Billing Party Address"
                      value={clientBillFormData.billingPartyAddress}
                      onChange={(e) =>
                        handleClientBillFieldChange(
                          "billingPartyAddress",
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingPartyGSTIN">GSTIN</Label>
                      <Input
                        id="billingPartyGSTIN"
                        placeholder="Enter Billing Party GSTIN"
                        value={clientBillFormData.billingPartyGSTIN}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "billingPartyGSTIN",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingPartyState">State</Label>
                      <Input
                        id="billingPartyState"
                        placeholder="Enter Billing Party State"
                        value={clientBillFormData.billingPartyState}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "billingPartyState",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingPartyStateCode">State Code</Label>
                      <Input
                        id="billingPartyStateCode"
                        placeholder="Enter Billing Party State Code"
                        value={clientBillFormData.billingPartyStateCode}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "billingPartyStateCode",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Service Provider</h4>
                  <div>
                    <Label htmlFor="providerName">Name</Label>
                    <Input
                      id="providerName"
                      value={clientBillFormData.providerName}
                      placeholder="Enter Provider Name"
                      onChange={(e) =>
                        handleClientBillFieldChange(
                          "providerName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="providerAddress">Address</Label>
                    <Textarea
                      id="providerAddress"
                      placeholder="Enter Provider Address"
                      value={clientBillFormData.providerAddress}
                      onChange={(e) =>
                        handleClientBillFieldChange(
                          "providerAddress",
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="providerGSTIN">GSTIN</Label>
                      <Input
                        id="providerGSTIN"
                        placeholder="Enter Provider GSTIN"
                        value={clientBillFormData.providerGSTIN}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "providerGSTIN",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="providerState">State</Label>
                      <Input
                        id="providerState"
                        placeholder="Enter Provider State"
                        value={clientBillFormData.providerState}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "providerState",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="providerStateCode">State Code</Label>
                      <Input
                        id="providerStateCode"
                        placeholder="Enter Provider State Code"
                        value={clientBillFormData.providerStateCode}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "providerStateCode",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#f7f8f8] p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Project</h4>
                  <div>
                    <Label htmlFor="projectName">Name</Label>
                    <Input
                      id="projectName"
                      placeholder="Enter Project Name"
                      value={clientBillFormData.projectName}
                      onChange={(e) =>
                        handleClientBillFieldChange(
                          "projectName",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectLocation">Location</Label>
                    <Input
                      id="projectLocation"
                      placeholder="Enter Project Location"
                      value={clientBillFormData.projectLocation}
                      onChange={(e) =>
                        handleClientBillFieldChange(
                          "projectLocation",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4 lg:col-span-2">
                  <h4 className="text-lg font-semibold">Contractor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contractorName">Name</Label>
                      <Input
                        id="contractorName"
                        placeholder="Enter Contractor Name"
                        value={clientBillFormData.contractorName}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "contractorName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractorPAN">PAN</Label>
                      <Input
                        id="contractorPAN"
                        placeholder="Enter Contractor PAN"
                        value={clientBillFormData.contractorPAN}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "contractorPAN",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractorVillage">Village</Label>
                      <Input
                        id="contractorVillage"
                        placeholder="Enter Contractor Village"
                        value={clientBillFormData.contractorVillage}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "contractorVillage",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractorPost">Post</Label>
                      <Input
                        id="contractorPost"
                        placeholder="Enter Contractor Post"
                        value={clientBillFormData.contractorPost}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "contractorPost",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractorDistrict">District</Label>
                      <Input
                        id="contractorDistrict"
                        placeholder="Enter Contractor District"
                        value={clientBillFormData.contractorDistrict}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "contractorDistrict",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractorPin">PIN</Label>
                      <Input
                        id="contractorPin"
                        placeholder="Enter Contractor PIN"
                        value={clientBillFormData.contractorPin}
                        onChange={(e) =>
                          handleClientBillFieldChange(
                            "contractorPin",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#f7f8f8] p-6 shadow-sm space-y-4">
              <h4 className="text-lg font-semibold">Financials</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={clientBillFormData.totalAmount ?? ""}
                    onChange={(e) =>
                      handleClientBillFieldChange("totalAmount", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tdsPercentage">TDS %</Label>
                  <Input
                    id="tdsPercentage"
                    type="number"
                    step="0.01"
                    value={clientBillFormData.tdsPercentage ?? ""}
                    onChange={(e) =>
                      handleClientBillFieldChange(
                        "tdsPercentage",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label>TDS Amount</Label>
                  <Input value={calculatedTdsAmount} readOnly />
                </div>
                <div>
                  <Label htmlFor="debitAdjustValue">Debit / Adjust</Label>
                  <Input
                    id="debitAdjustValue"
                    type="number"
                    step="0.01"
                    value={clientBillFormData.debitAdjustValue ?? ""}
                    onChange={(e) =>
                      handleClientBillFieldChange(
                        "debitAdjustValue",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Net Bill Amount</Label>
                  <Input value={calculatedNetBillAmount} readOnly />
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#f7f8f8] p-6 shadow-sm space-y-4">
              <h4 className="text-lg font-semibold">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank</Label>
                  <Input
                    id="bankName"
                    placeholder="Enter Bank Name"
                    value={clientBillFormData.bankName}
                    onChange={(e) =>
                      handleClientBillFieldChange("bankName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bankBranch">Branch</Label>
                  <Input
                    id="bankBranch"
                    placeholder="Enter Bank Branch"
                    value={clientBillFormData.bankBranch}
                    onChange={(e) =>
                      handleClientBillFieldChange("bankBranch", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="accountNo">Account No.</Label>
                  <Input
                    id="accountNo"
                    placeholder="Enter Account No."
                    value={clientBillFormData.accountNo}
                    onChange={(e) =>
                      handleClientBillFieldChange("accountNo", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC</Label>
                  <Input
                    id="ifscCode"
                    placeholder="Enter IFSC"
                    value={clientBillFormData.ifscCode}
                    onChange={(e) =>
                      handleClientBillFieldChange("ifscCode", e.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-[#f7f8f8] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h4 className="text-lg font-semibold">
                  Categories & Line Items
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCategorySection}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              <div className="space-y-6">
                {clientBillFormData.categories.map(
                  (category, categoryIndex) => (
                    <div
                      key={category.id}
                      className="rounded-xl border p-4 space-y-4 bg-muted/30"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                          <div>
                            <Label>Code</Label>
                            <Input
                              value={category.categoryCode}
                              placeholder="Enter Category Code"
                              onChange={(e) =>
                                handleCategoryFieldChange(
                                  categoryIndex,
                                  "categoryCode",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Name</Label>
                            <Input
                              value={category.categoryName}
                              placeholder="Enter Category Name"
                              onChange={(e) =>
                                handleCategoryFieldChange(
                                  categoryIndex,
                                  "categoryName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Tower</Label>
                            <Input
                              value={category.tower || ""}
                              placeholder="Enter Tower"
                              onChange={(e) =>
                                handleCategoryFieldChange(
                                  categoryIndex,
                                  "tower",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-3">
                            <Label>Description</Label>
                            <Input
                              value={category.description || ""}
                              placeholder="Enter Description"
                              onChange={(e) =>
                                handleCategoryFieldChange(
                                  categoryIndex,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Sequence</Label>
                            <Input
                              type="number"
                              value={category.sequence}
                              onChange={(e) =>
                                handleCategoryFieldChange(
                                  categoryIndex,
                                  "sequence",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive self-start md:self-auto"
                          disabled={clientBillFormData.categories.length === 1}
                          onClick={() => removeCategorySection(categoryIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-[#f7f8f8]">
                        <UITable>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="min-w-[60px] text-black">
                                Sl
                              </TableHead>
                              <TableHead className="text-black">
                                Description
                              </TableHead>
                              <TableHead className="min-w-[120px] text-black">
                                SAC/HSN
                              </TableHead>
                              <TableHead className="min-w-[80px] text-black">
                                Unit
                              </TableHead>
                              <TableHead className="min-w-[120px] text-black">
                                Unit Rate
                              </TableHead>
                              <TableHead className="min-w-[180px] text-black">
                                Quantity (Prev / Pres / Cum)
                              </TableHead>
                              <TableHead className="min-w-[200px] text-black">
                                Amount (Prev / Pres / Cum)
                              </TableHead>
                              <TableHead className="min-w-[140px] text-black">
                                Flags
                              </TableHead>
                              <TableHead className="min-w-[60px]" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.lineItems.map((line, lineIndex) => (
                              <TableRow key={line.id}>
                                <TableCell className="text-center font-medium">
                                  {lineIndex + 1}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={line.description}
                                    placeholder="Description"
                                    onChange={(e) =>
                                      handleLineItemFieldChange(
                                        categoryIndex,
                                        lineIndex,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={line.sacHsnCode || ""}
                                    placeholder="SAC/HSN"
                                    onChange={(e) =>
                                      handleLineItemFieldChange(
                                        categoryIndex,
                                        lineIndex,
                                        "sacHsnCode",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={line.unit}
                                    placeholder="Unit"
                                    onChange={(e) =>
                                      handleLineItemFieldChange(
                                        categoryIndex,
                                        lineIndex,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={line.unitRate}
                                    onChange={(e) =>
                                      handleLineItemFieldChange(
                                        categoryIndex,
                                        lineIndex,
                                        "unitRate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      "previousQuantity",
                                      "presentQuantity",
                                      "cumulativeQuantity",
                                    ].map((qtyKey) => (
                                      <Input
                                        key={qtyKey}
                                        type="number"
                                        step="0.001"
                                        value={
                                          line[
                                          qtyKey as keyof BillLineItemRecord
                                          ] as number
                                        }
                                        onChange={(e) =>
                                          handleLineItemFieldChange(
                                            categoryIndex,
                                            lineIndex,
                                            qtyKey as keyof BillLineItemRecord,
                                            e.target.value
                                          )
                                        }
                                      />
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      "previousAmount",
                                      "presentAmount",
                                      "cumulativeAmount",
                                    ].map((amtKey) => (
                                      <Input
                                        key={amtKey}
                                        type="number"
                                        step="0.01"
                                        value={
                                          line[
                                          amtKey as keyof BillLineItemRecord
                                          ] as number
                                        }
                                        onChange={(e) =>
                                          handleLineItemFieldChange(
                                            categoryIndex,
                                            lineIndex,
                                            amtKey as keyof BillLineItemRecord,
                                            e.target.value
                                          )
                                        }
                                      />
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        Deduction
                                      </span>
                                      <Switch
                                        checked={line.isDeduction || false}
                                        onCheckedChange={(checked) =>
                                          handleLineItemFieldChange(
                                            categoryIndex,
                                            lineIndex,
                                            "isDeduction",
                                            checked
                                          )
                                        }
                                        className="data-[state=unchecked]:bg-black"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        Revised
                                      </span>
                                      <Switch
                                        checked={line.isRevisedRate || false}
                                        onCheckedChange={(checked) =>
                                          handleLineItemFieldChange(
                                            categoryIndex,
                                            lineIndex,
                                            "isRevisedRate",
                                            checked
                                          )
                                        }
                                        className="data-[state=unchecked]:bg-black"
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-destructive"
                                    disabled={category.lineItems.length === 1}
                                    onClick={() =>
                                      removeLineItemRow(
                                        categoryIndex,
                                        lineIndex
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </UITable>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => addLineItemRow(categoryIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Line Item
                      </Button>
                    </div>
                  )
                )}
              </div>
            </section>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsClientBillFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2"
                disabled={isClientBillSaving}
              >
                <Check className="h-4 w-4" />
                {isClientBillSaving ? "Saving..." : "Save Service Invoice"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
