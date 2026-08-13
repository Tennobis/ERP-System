import React, { useState, useEffect } from "react";
import { X, Calculator, FileText, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { updateProjectSpent } from "@/utils/project-utils";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface InvoiceBuilderModalProps {
  onClose: () => void;
  showRetentionOptions?: boolean;
  showWorkCompleted?: boolean;
}

interface LineItem {
  id: number;
  serialNumber: string;
  description: string;
  item: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
  startDate: string;
  endDate: string;
  status: string;
}

const CONSTRUCTION_ITEMS = [
  { value: "concrete", label: "Concrete" },
  { value: "steel", label: "Steel" },
  { value: "cement", label: "Cement" },
  { value: "bricks", label: "Bricks" },
  { value: "sand", label: "Sand" },
  { value: "gravel", label: "Gravel" },
  { value: "tiles", label: "Tiles" },
  { value: "paint", label: "Paint" },
  { value: "wood", label: "Wood" },
  { value: "glass", label: "Glass" },
  { value: "aluminum", label: "Aluminum" },
  { value: "electrical", label: "Electrical Items" },
  { value: "plumbing", label: "Plumbing Items" },
  { value: "labor", label: "Labor" },
  { value: "machinery", label: "Machinery" },
  { value: "other", label: "Other" },
];

const UNITS = [
  { value: "SQUARE_METRE", label: "Square Meter" },
  { value: "CUBIC_FEET", label: "Cubic Feet" },
  { value: "M_CUBE", label: "Metre Cube" },
  { value: "SQUARE_FEET", label: "Square Feet" },
  { value: "TONNE", label: "Tonne" },
  { value: "KILOGRAM", label: "Kilogram" },
  { value: "PIECE", label: "Piece" },
  { value: "LITRE", label: "Litre" },
  { value: "BOX", label: "Box" },
  { value: "ROLL", label: "Roll" },
  { value: "SHEET", label: "Sheet" },
  { value: "HOURS", label: "Hours" },
  { value: "DAYS", label: "Days" },
  { value: "LUMPSUM", label: "Lump Sum" },
];

const InvoiceBuilderModal: React.FC<InvoiceBuilderModalProps> = ({
  onClose,
  showRetentionOptions = false,
  showWorkCompleted = true,
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<User[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    projectId: "",
    clientId: "",
    workCompletedPercent: 0,
    termsAndConditions:
      "Payment due within 30 days of invoice date. 1.5% monthly interest on overdue amounts.",
    internalNotes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 1,
      serialNumber: "001",
      description: "Foundation Work - Phase 1",
      item: "concrete",
      unit: "CUBIC_FEET",
      quantity: 1,
      rate: 500000,
      amount: 500000,
    },
    {
      id: 2,
      serialNumber: "002",
      description: "Material Supply - Cement & Steel",
      item: "steel",
      unit: "TONNE",
      quantity: 1,
      rate: 300000,
      amount: 300000,
    },
  ]);

  // State to control whether GST should be applied
  const [applyGst, setApplyGst] = useState<boolean>(true);

  // State to control retention (5% deduction)
  const [applyRetention, setApplyRetention] = useState<boolean>(false);
  // If retention options are hidden, force retention off
  useEffect(() => {
    if (!showRetentionOptions) {
      setApplyRetention(false);
    }
  }, [showRetentionOptions]);

  // Fetch users and projects on component mount
  useEffect(() => {
    fetchUsers();
    getClients();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_URL}/users`, { headers });
      if (response.ok) {
        const allUsers = await response.json();
        setUsers(allUsers);
        // Filter clients
        const clientUsers = allUsers.filter(
          (user: User) => user.role === "client"
        );
        setClients(clientUsers);
      } else {
        console.error("Failed to fetch users:", response.status);
        // Use fallback data
        const fallbackUsers: User[] = [
          {
            id: "1",
            name: "Green Valley Developers",
            email: "contact@greenvalley.com",
            role: "client",
          },
          {
            id: "2",
            name: "Metropolitan Holdings",
            email: "info@metropolitan.com",
            role: "client",
          },
          {
            id: "3",
            name: "City Center Corp",
            email: "hello@citycenter.com",
            role: "client",
          },
        ];
        setUsers(fallbackUsers);
        setClients(fallbackUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Use fallback data
      const fallbackUsers: User[] = [
        {
          id: "1",
          name: "Green Valley Developers",
          email: "contact@greenvalley.com",
          role: "client",
        },
        {
          id: "2",
          name: "Metropolitan Holdings",
          email: "info@metropolitan.com",
          role: "client",
        },
        {
          id: "3",
          name: "City Center Corp",
          email: "hello@citycenter.com",
          role: "client",
        },
      ];
      setUsers(fallbackUsers);
      setClients(fallbackUsers);
    }
  };

  const getClients = async () => {
            try {
              const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`${API_URL}/clients`, { headers });
                if (response.data) {
                    setClients(response.data);
                }
            } catch (error) {
                console.error('Error fetching clients:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch clients",
                    variant: "destructive",
                });
            }
        };
  const fetchProjects = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_URL}/projects`, { headers });
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
      } else {
        console.error("Failed to fetch projects:", response.status);
        // Use fallback data
        const fallbackProjects: Project[] = [
          {
            id: "1",
            name: "Residential Complex A",
            clientId: "1",
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            status: "active",
          },
          {
            id: "2",
            name: "Office Tower B",
            clientId: "2",
            startDate: "2024-02-01",
            endDate: "2024-11-30",
            status: "active",
          },
          {
            id: "3",
            name: "Shopping Mall C",
            clientId: "3",
            startDate: "2024-03-01",
            endDate: "2024-10-31",
            status: "active",
          },
        ];
        setProjects(fallbackProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Use fallback data
      const fallbackProjects: Project[] = [
        {
          id: "1",
          name: "Residential Complex A",
          clientId: "1",
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          status: "active",
        },
        {
          id: "2",
          name: "Office Tower B",
          clientId: "2",
          startDate: "2024-02-01",
          endDate: "2024-11-30",
          status: "active",
        },
        {
          id: "3",
          name: "Shopping Mall C",
          clientId: "3",
          startDate: "2024-03-01",
          endDate: "2024-10-31",
          status: "active",
        },
      ];
      setProjects(fallbackProjects);
    }
  };

  const addLineItem = () => {
    const newId =
      lineItems.length > 0
        ? Math.max(...lineItems.map((item) => item.id)) + 1
        : 1;
    setLineItems([
      ...lineItems,
      {
        id: newId,
        serialNumber: String(newId).padStart(3, "0"),
        description: "",
        item: "",
        unit: "PIECE",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (id: number) => {
    setLineItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (
    id: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount =
              Number(updatedItem.quantity) * Number(updatedItem.rate);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const retentionRate = 0.05; // 5% retention
  const retentionAmount = applyRetention ? subtotal * retentionRate : 0;
  const baseAfterRetention = subtotal - retentionAmount;
  const taxRate = 0.18; // 18% GST
  const taxAmount = applyGst ? baseAfterRetention * taxRate : 0;
  const total = baseAfterRetention + taxAmount;

  // Function to update project spent after invoice creation
  const handleSubmit = async () => {
    if (!formData.projectId || !formData.clientId) {
      toast({
        title: "Validation Error",
        description: "Please select both project and client",
        variant: "destructive",
      });
      return;
    }

    if (lineItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one line item",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create invoice data according to schema
      const invoiceData = {
        userId: user?.id || "current-user-id", // Use authenticated user's ID
        projectId: formData.projectId,
        clientId: formData.clientId,
        invoiceNumber: formData.invoiceNumber || `INV-${Date.now()}`,
        date: new Date(formData.invoiceDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        status: "DRAFT",
        type: "STANDARD",
        applyGst: applyGst,
        applyRetention: applyRetention,
        subtotal: subtotal,
        retentionAmount: retentionAmount,
        baseAfterRetention: baseAfterRetention,
        taxAmount: taxAmount,
        total: total,
        workCompletedPercent: formData.workCompletedPercent,
        termsAndConditions: formData.termsAndConditions,
        internalNotes: formData.internalNotes,
        items: lineItems.map((item) => ({
          serialNumber: item.serialNumber,
          description: item.description,
          item: item.item,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      };

      const response = await fetch(`${API_URL}/billing/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionStorage.getItem("jwt_token") ||
          localStorage.getItem("jwt_token_backup")
            ? {
                Authorization: `Bearer ${
                  sessionStorage.getItem("jwt_token") ||
                  localStorage.getItem("jwt_token_backup")
                }`,
              }
            : {}),
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const createdInvoice = await response.json();
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
        onClose();
        // Update project spent after successful invoice creation
        // if (formData.projectId) {
        //   await updateProjectSpent(formData.projectId, total);
        // }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create invoice",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Calculator className="h-6 w-6 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Invoice Builder
              </h2>
              <p className="text-sm text-gray-600">
                Create progress-based invoices
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* First Row: Invoice Information + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Invoice Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Number
                      </label>
                      <Input
                        value={formData.invoiceNumber}
                        onChange={(e) =>
                          handleFormChange("invoiceNumber", e.target.value)
                        }
                        placeholder="INV-2024-004"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date
                      </label>
                      <Input
                        type="date"
                        value={formData.invoiceDate}
                        onChange={(e) =>
                          handleFormChange("invoiceDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project
                      </label>
                      <Select
                        value={formData.projectId}
                        onValueChange={(value) =>
                          handleFormChange("projectId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date
                      </label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          handleFormChange("dueDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client
                    </label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) =>
                        handleFormChange("clientId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Options
                    </label>
                    <RadioGroup
                      defaultValue={applyGst ? "with-gst" : "without-gst"}
                      className="flex space-x-4"
                      onValueChange={(value) =>
                        setApplyGst(value === "with-gst")
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="with-gst" id="with-gst" />
                        <Label htmlFor="with-gst">With GST (18%)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="without-gst" id="without-gst" />
                        <Label htmlFor="without-gst">Without GST</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {showRetentionOptions && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retention Options
                      </label>
                      <RadioGroup
                        defaultValue={
                          applyRetention ? "with-retention" : "without-retention"
                        }
                        className="flex space-x-4"
                        onValueChange={(value) =>
                          setApplyRetention(value === "with-retention")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="with-retention"
                            id="with-retention"
                          />
                          <Label htmlFor="with-retention">
                            With Retention (5%)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="without-retention"
                            id="without-retention"
                          />
                          <Label htmlFor="without-retention">
                            Without Retention
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Invoice Preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900">
                        Your Company Name
                      </h3>
                      <p className="text-sm text-gray-600">
                        Construction Services
                      </p>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span>Invoice #:</span>
                        <span>{formData.invoiceNumber || "INV-2024-004"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Date:</span>
                        <span>{formData.invoiceDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Due:</span>
                        <span>{formData.dueDate}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm font-medium">Bill To:</p>
                      <p className="text-sm text-gray-600">
                        {clients.find((c) => c.id === formData.clientId)
                          ?.name || "Client Name"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {projects.find((p) => p.id === formData.projectId)
                          ?.name || "Project Name"}
                      </p>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      {applyRetention && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Retention (5%):</span>
                          <span>
                            -₹{retentionAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Base Amount:</span>
                        <span>
                          ₹{baseAfterRetention.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {applyGst && (
                        <div className="flex justify-between text-sm">
                          <span>GST (18%):</span>
                          <span>₹{taxAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t">
                        <span>Total Amount:</span>
                        <span>₹{total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Width: Invoice Items */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Invoice Items</CardTitle>
                    <Button onClick={addLineItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                      <div className="col-span-1">S.No</div>
                      <div className="col-span-3">Description</div>
                      <div className="col-span-1">Item</div>
                      <div className="col-span-1">Unit</div>
                      <div className="col-span-2">Qty</div>
                      <div className="col-span-2">Rate</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-1">Action</div>
                    </div>

                    {lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg"
                      >
                        <div className="col-span-1">
                          <Input
                            placeholder="001"
                            value={item.serialNumber}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "serialNumber",
                                e.target.value
                              )
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-1">
                          <Select
                            value={item.item}
                            onValueChange={(value) =>
                              updateLineItem(item.id, "item", value)
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {CONSTRUCTION_ITEMS.map((constructionItem) => (
                                <SelectItem
                                  key={constructionItem.value}
                                  value={constructionItem.value}
                                >
                                  {constructionItem.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Select
                            value={item.unit}
                            onValueChange={(value) =>
                              updateLineItem(item.id, "unit", value)
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {UNITS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                "rate",
                                Number(e.target.value)
                              )
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={`₹${item.amount.toLocaleString("en-IN")}`}
                            readOnly
                            className="bg-gray-50 h-9"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-500 hover:text-red-700 px-2 py-2"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {applyRetention && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Retention (5%):</span>
                        <span>-₹{retentionAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Base Amount:</span>
                      <span>₹{baseAfterRetention.toLocaleString("en-IN")}</span>
                    </div>
                    {applyGst && (
                      <div className="flex justify-between text-sm">
                        <span>GST (18%):</span>
                        <span>₹{taxAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

          {/* Third Row: Additional Information + Progress Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Left Column - Additional Information */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showWorkCompleted && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Completed (%)
                      </label>
                      <Input
                        type="number"
                        placeholder="65"
                        min="0"
                        max="100"
                        value={formData.workCompletedPercent}
                        onChange={(e) =>
                          handleFormChange(
                            "workCompletedPercent",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <Textarea
                      placeholder="Payment terms, conditions, and notes..."
                      rows={3}
                      value={formData.termsAndConditions}
                      onChange={(e) =>
                        handleFormChange("termsAndConditions", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internal Notes
                    </label>
                    <Textarea
                      placeholder="Internal notes (not visible to client)..."
                      rows={2}
                      value={formData.internalNotes}
                      onChange={(e) =>
                        handleFormChange("internalNotes", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Progress Tracking */}
            <div>
              {/* <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Work Completed:</span>
                      <span>{formData.workCompletedPercent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Previously Billed:</span>
                      <span>60%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>This Invoice:</span>
                      <span>5%</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                      <span>Total Billed:</span>
                      <span>65%</span>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-1" />
              Auto-saved 1 minute ago
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-[#1e9df1] hover:bg-[#1e9df1]"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilderModal;
