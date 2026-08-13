import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  DollarSign,
  Truck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Package,
  Search,
  X,
  Edit,
  Trash2,
  Star,
  ChevronDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PurchaseOrderForm } from "./purchase-order-form";
import axios from "axios";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
// import { toast } from "sonner";
import { toast } from "@/components/ui/use-toast";
import { AddVendorModal } from "@/components/modals/AddVendorModal";
import { NewMaterialRequestModal } from "@/components/modals/NewMaterialRequestModal";
import { EditMaterialRequestModal } from "@/components/modals/EditMaterialRequestModal";
import { VendorManagement } from "@/components/vendor-management/VendorManagement";
import { MaterialRequest, MaterialRequestItem } from "@/types/material-request";
import { useLocation, useNavigate } from "react-router-dom";
const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface PurchaseOrder {
  paymentSchedule: any[];
  taxesAndCharges: any[];
  userId: string;
  roundingAdjustment: number;
  terms: string;
  paymentTermsTemplate: string;
  placeOfSupply: string;
  companyBillingAddress: string;
  dispatchAddress: string;
  shippingAddress: string;
  vendorContact: string;
  vendorAddress: any;
  setTargetWarehouse: string;
  id: string;
  poNumber: string;
  date: string;
  vendorId: string;
  Vendor?: {
    location: any;
    id: string;
    name: string;
    email?: string;
    contact?: string;
  };
  requiredBy: string;
  items: any[];
  totalQuantity: number;
  total: number;
  grandTotal: number;
  roundedTotal: number;
  advancePaid: number;
  taxesAndChargesTotal: number;
  createdAt: string;
  updatedAt: string;
}

export function PurchaseDashboard({ selectedUserId }: { selectedUserId?: string }) {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);
  const [materialRequestToDelete, setMaterialRequestToDelete] = useState<
    string | null
  >(null);
  const [isDeleteRequestDialogOpen, setIsDeleteRequestDialogOpen] =
    useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState({
    received: { count: 0, amount: "₹0" },
    pending: { count: 0, amount: "₹0" },
    overdue: { count: 0, amount: "₹0" },
  });
  const [vendorCount, setVendorCount] = useState(0)

  const fetchPurchaseOrders = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Use selectedUserId if admin has selected a user, otherwise use current user's ID
      const targetUserId = selectedUserId || user?.id;
      
      // Use user-specific route if role is not 'accounts'
      const endpoint =
        user?.role !== "accounts" && (user?.role==='admin' || user?.role==='md' ? targetUserId !== user?.id : targetUserId)
          ? `${API_URL}/purchase-orders/user/${targetUserId}`
          : `${API_URL}/purchase-orders`;

      const response = await axios.get(endpoint, {
        headers,
      });
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log(
        "Fetching payment summary from:",
        `${API_URL}/billing/payment-summary`
      );
      const response = await axios.get(`${API_URL}/billing/payment-summary`, {
        headers,
      });
      console.log("Payment summary response:", response.data);
      setPaymentSummary(
        response.data || {
          received: { count: 0, amount: "₹0" },
          pending: { count: 0, amount: "₹0" },
          overdue: { count: 0, amount: "₹0" },
        }
      );
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      console.error("API URL:", API_URL);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "emergency":
        return "destructive";
      case "high":
        return "default";
      case "medium":
      case "normal":
        return "secondary";
      case "low":
        return "outline";
    }
  };

  const totalOrderValue = purchaseOrders.reduce(
    (sum, po) => sum + po.grandTotal,
    0
  );
 

  // Filter purchase orders based on search query
  const filteredPurchaseOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.Vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(
        (item) =>
          item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesSearch;
  });

  const handleCreateNewOrder = () => {
    setShowComprehensiveForm(true);
  };

  const handleEditOrder = async (order: PurchaseOrder) => {
    setIsLoadingEditData(true);
    setShowEditForm(true);

    try {
      // Fetch complete purchase order details from API
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${API_URL}/purchase-orders/${order.id}`,
        { headers }
      );
      const fullOrderData = response.data;

      setEditingOrder(fullOrderData);
    } catch (error) {
      console.error("Error fetching purchase order details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase order details",
        variant: "destructive",
      });
      // Fallback to the order data we have
      setEditingOrder(order);
    } finally {
      setIsLoadingEditData(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMaterialRequest = (requestId: string) => {
    setMaterialRequestToDelete(requestId);
    setIsDeleteRequestDialogOpen(true);
  };

  const confirmDeleteMaterialRequest = async () => {
    if (materialRequestToDelete) {
      try {
        const token = sessionStorage.getItem("jwt_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.delete(
          `${API_URL}/material/material-requests/${materialRequestToDelete}`,
          {
            headers,
          }
        );
        await fetchMaterialRequests();
        toast({
          title: "Success",
          description: "Material request deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting material request:", error);
        toast({
          title: "Error",
          description: "Failed to delete material request",
          variant: "destructive",
        });
      }
    }
    setIsDeleteRequestDialogOpen(false);
    setMaterialRequestToDelete(null);
  };
  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        const token =
          sessionStorage.getItem("jwt_token") ||
          localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        await axios.delete(`${API_URL}/purchase-orders/${orderToDelete}`, {
          headers,
        });

        setPurchaseOrders(
          purchaseOrders.filter((order) => order.id !== orderToDelete)
        );

        toast({
          title: "Success",
          description: "Purchase order deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        toast({
          title: "Error",
          description: "Failed to delete purchase order",
          variant: "destructive",
        });
      }

      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(
    []
  );
   const completedRequests = materialRequests.filter(
    (mr) => mr.status === "COMPLETED"
  ).length;

  const fetchMaterialRequests = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Use selectedUserId if admin has selected a user, otherwise use current user's ID
      const targetUserId = selectedUserId || user?.id;

      // Use user-specific route if role is not 'accounts'
      const endpoint =
      user?.role !== "accounts" && (user?.role==='admin' || user?.role==='md' ? targetUserId !== user?.id : targetUserId)
          ? `${API_URL}/material/material-requests/user/${targetUserId}`
          : `${API_URL}/material/material-requests`;

      const response = await axios.get(endpoint, { headers });
      setMaterialRequests(response.data);
    } catch (error) {
      console.error("Error fetching material requests:", error);
    }
  };

  const fetchVendor = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Use selectedUserId if admin has selected a user, otherwise use current user's ID
      const targetUserId = selectedUserId || user?.id;

      // Use user-specific route if role is not 'accounts'
      const endpoint =
      user?.role !== "accounts" && (user?.role==='admin' || user?.role==='md' ? targetUserId !== user?.id : targetUserId)
          ? `${API_URL}/vendors/count/${targetUserId}`
          : `${API_URL}/vendors/count`;

      const response = await axios.get(endpoint, { headers });
      setVendorCount(response.data);
    } catch (error) {
      console.error("Error fetching material requests:", error);
    }
  };
  useEffect(() => {
    fetchPurchaseOrders();
    fetchMaterialRequests();
    fetchVendor()
  }, [user,selectedUserId]);

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isEditRequestDialogOpen, setIsEditRequestDialogOpen] = useState(false);
  const [currentEditRequest, setCurrentEditRequest] =
    useState<MaterialRequest | null>(null);

  // Update approve/reject/create/update/delete to use backend API
  const handleApproveRequest = async (requestId: string) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_URL}/material/material-requests/${requestId}/approve`,
        {},
        { headers }
      );
      await fetchMaterialRequests();
      toast({
        title: "Success",
        description: "Material request approved successfully",
      });
    } catch (error) {
      console.error("Error approving material request:", error);
      toast({
        title: "Error",
        description: "Failed to approve material request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_URL}/material/material-requests/${requestId}/reject`,
        {
          rejectionReason: "Rejected by admin",
        },
        { headers }
      );
      await fetchMaterialRequests();
      toast({
        title: "Success",
        description: "Material request rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting material request:", error);
      toast({
        title: "Error",
        description: "Failed to reject material request",
        variant: "destructive",
      });
    }
  };

  const handleCreatePOFromRequest = (request: MaterialRequest) => {
    // Create a new PO from the material request
    const newPOData = {
      poNumber: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1)
        .toString()
        .padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      vendorId: "",
      requiredBy: request.requiredBy
        ? new Date(request.requiredBy).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      items: request.items.map((item) => ({
        id: Date.now().toString() + Math.random(),
        itemCode: item.itemCode,
        description: item.itemCode,
        requiredBy: "",
        quantity: item.quantity,
        uom: item.uom,
        rate: 0,
        amount: 0,
      })),
      totalQuantity: request.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      total: 0,
      grandTotal: 0,
      roundedTotal: 0,
      advancePaid: 0,
      taxesAndChargesTotal: 0,
      setTargetWarehouse: "",
      vendorAddress: "",
      vendorContact: "",
      shippingAddress: "",
      dispatchAddress: "",
      companyBillingAddress: "",
      placeOfSupply: "",
      paymentTermsTemplate: "",
      terms: "",
      roundingAdjustment: 0,
      userId: "",
      taxesAndCharges: [],
      paymentSchedule: [],
    };

    setEditingOrder(newPOData as any);
    setShowEditForm(true);
  };

  // Remove handleCreateNewRequest and saveRequest for the old modal

  // Add handler for new modal save
  const handleNewMaterialRequestSave = async (data: any) => {
    // The modal already makes the API call, so we just need to refresh the list
    await fetchMaterialRequests();
  };

  // Add handler for edit modal
  const handleEditRequest = (request: MaterialRequest) => {
    setCurrentEditRequest(request);
    setIsEditRequestDialogOpen(true);
  };

  const handleEditRequestSave = async () => {
    await fetchMaterialRequests();
  };

  console.log("Current paymentSummary state:", paymentSummary);

  // Sync active tab with URL on mount and when path changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/purchase-management/material-requests")) {
      setActiveTab("requests");
    } else if (path.includes("/purchase-management/purchase-orders")) {
      setActiveTab("orders");
    } else if (path.includes("/purchase-management/vendors")) {
      setActiveTab("vendors");
    } else {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  return (
    <div>
      {/* <CardHeader></CardHeader> */}
      {/* <CardContent className="mt-6"> */}
      <Tabs
        value={activeTab}
        className="space-y-4"
        onValueChange={(val) => {
          setActiveTab(val);
          const routes: Record<string, string> = {
            overview: "/purchase-management/overview",
            requests: "/purchase-management/material-requests",
            orders: "/purchase-management/purchase-orders",
            vendors: "/purchase-management/vendors",
          };
          navigate(routes[val] || "/purchase-management/overview");
        }}
      >
        <TabsList className={`grid w-full ${(user.role === "project" || user.role === "store") ? "grid-cols-3" : "grid-cols-4"}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Material Requests</TabsTrigger>
          {(user.role === "project" || user.role === "store" )? null : (
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>            
          )}
          {/* <TabsTrigger value="vendors">Vendors</TabsTrigger> */}
          {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className={`grid grid-cols-1 ${user?.role==="admin" || user?.role==="md" || user?.role==="accounts" ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
            {(user?.role==="admin" || user?.role==="md" || user?.role==="accounts") && (


            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{(totalOrderValue / 100000).toFixed(2)}L
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Requests</p>
                    <p className="text-2xl font-bold">{completedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                   <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Vendors
                    </p>
                    <p className="text-2xl font-bold">
                      {vendorCount}
                    </p>
                    {/* <p className="text-xs text-muted-foreground">
                      {vendorCount} vendors
                    </p> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Requests
                    </p>
                    <p className="text-2xl font-bold">
                      {materialRequests.filter((req) => req.status === "PENDING").length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchase Orders</CardTitle>
                <CardDescription>
                  Track and manage purchase orders with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseOrders.slice(0, 10).map((po) => (
                    <div key={po.id} className="border rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const expanded = document.getElementById(
                                `po-${po.id}`
                              );
                              if (expanded) {
                                expanded.style.display =
                                  expanded.style.display === "none"
                                    ? "block"
                                    : "none";
                              }
                            }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <div>
                            <div className="font-medium">{po.poNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {po.Vendor?.name || "N/A"} •{" "}
                              {po.items?.length || 0} item(s)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              ₹{((po.grandTotal || 0) / 100000).toFixed(1)}L
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Due:{" "}
                              {new Date(po.requiredBy).toLocaleDateString(
                                "en-IN"
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              po.advancePaid > 0 ? "default" : "secondary"
                            }
                          >
                            {po.advancePaid > 0 ? "PAID" : "PENDING"}
                          </Badge>
                        </div>
                      </div>

                      <div
                        id={`po-${po.id}`}
                        style={{ display: "none" }}
                        className="border-t bg-muted/50 p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-medium mb-2 text-sm">
                              Purchase Order Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>
                                Order Date:{" "}
                                {new Date(po.date).toLocaleDateString("en-IN")}
                              </div>
                              <div>Vendor: {po.Vendor?.name || "N/A"}</div>
                              <div>Contact: {po.Vendor?.contact || "N/A"}</div>
                              <div>Email: {po.Vendor?.email || "N/A"}</div>
                              <div>Total Quantity: {po.totalQuantity || 0}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-sm">
                              Amount Breakdown
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>
                                Subtotal: ₹
                                {((po.total || 0) / 100000).toFixed(1)}L
                              </div>
                              <div>
                                Tax Amount: ₹
                                {(
                                  (po.taxesAndChargesTotal || 0) / 1000
                                ).toFixed(0)}
                                K
                              </div>
                              {po.advancePaid > 0 && (
                                <div>
                                  Advance Paid: ₹
                                  {((po.advancePaid || 0) / 1000).toFixed(0)}K
                                </div>
                              )}
                              <div className="font-medium border-t pt-1">
                                Total: ₹
                                {((po.grandTotal || 0) / 100000).toFixed(1)}L
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-sm">
                              Purchase Order Items
                            </h4>
                            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                              {(po.items || []).length > 0 ? (
                                (po.items || []).map(
                                  (item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        •{" "}
                                        {item.itemCode ||
                                          item.description ||
                                          item.itemName}
                                      </span>
                                      <span>
                                        {item.quantity} {item.unit || "units"}
                                      </span>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="text-muted-foreground">
                                  No items listed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No purchase orders found</p>
                      <p className="text-sm">
                        Generated purchase orders will appear here
                      </p>
                    </div>
                  )}
                  {purchaseOrders.length > 10 && (
                    <Button variant="outline" className="w-full">
                      View All {purchaseOrders.length} Purchase Orders
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Material Requests</CardTitle>
                <CardDescription>
                  Review and approve material requests with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialRequests.filter(req=> req.status!=="COMPLETED").map((mr) => (

                    <div key={mr.id} className="border rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const expanded = document.getElementById(
                                `mr-${mr.id}`
                              );
                              if (expanded) {
                                expanded.style.display =
                                  expanded.style.display === "none"
                                    ? "block"
                                    : "none";
                              }
                            }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <div>
                            <div className="font-medium">
                              {mr.requestNumber || `REQ-${mr.id?.slice(0, 8)}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {mr.requester?.name || "Unknown"} •{" "}
                              {mr.purpose || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              ₹
                              {(
                                (Array.isArray(mr.items)
                                  ? mr.items.reduce(
                                      (sum, item) =>
                                        sum + (item.estimatedCost || 0),
                                      0
                                    )
                                  : 0) / 100000
                              ).toFixed(1)}
                              L
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Need:{" "}
                              {mr.requiredBy
                                ? new Date(mr.requiredBy).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "Not specified"}
                            </div>
                          </div>
                          <Badge
                            variant={
                              mr.status === "APPROVED"
                                ? "default"
                                : mr.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {mr.status}
                          </Badge>
                        </div>
                      </div>

                      <div
                        id={`mr-${mr.id}`}
                        style={{ display: "none" }}
                        className="border-t bg-muted/50 p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-medium mb-2 text-sm">
                              Material Request Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>
                                Request Date:{" "}
                                {new Date(
                                  mr.transactionDate
                                ).toLocaleDateString("en-IN")}
                              </div>
                              <div>Purpose: {mr.purpose || "N/A"}</div>
                              <div>Priority: {mr.priority || "Normal"}</div>
                              <div>Department: {mr.department || "N/A"}</div>
                              <div>
                                Items Count:{" "}
                                {Array.isArray(mr.items) ? mr.items.length : 0}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-sm">
                              Cost Breakdown
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>
                                Total Items:{" "}
                                {Array.isArray(mr.items) ? mr.items.length : 0}
                              </div>
                              <div>
                                Est. Amount: ₹
                                {(
                                  (Array.isArray(mr.items)
                                    ? mr.items.reduce(
                                        (sum, item) =>
                                          sum + (item.estimatedCost || 0),
                                        0
                                      )
                                    : 0) / 1000
                                ).toFixed(0)}
                                K
                              </div>
                              {Array.isArray(mr.items) &&
                                mr.items.length > 0 && (
                                  <div>
                                    Avg. Cost/Item: ₹
                                    {(
                                      mr.items.reduce(
                                        (sum, item) =>
                                          sum + (item.estimatedCost || 0),
                                        0
                                      ) / mr.items.length
                                    ).toFixed(0)}
                                  </div>
                                )}
                              <div className="font-medium border-t pt-1">
                                Total: ₹
                                {(
                                  (Array.isArray(mr.items)
                                    ? mr.items.reduce(
                                        (sum, item) =>
                                          sum + (item.estimatedCost || 0),
                                        0
                                      )
                                    : 0) / 100000
                                ).toFixed(1)}
                                L
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-sm">
                              Material Request Items
                            </h4>
                            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                              {Array.isArray(mr.items) &&
                              mr.items.length > 0 ? (
                                mr.items.map(
                                  (item: MaterialRequestItem, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        • {item.itemName || item.description}
                                      </span>
                                      <span>
                                        {item.quantity} {item.unit || "units"}
                                      </span>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="text-muted-foreground">
                                  No items listed
                                </div>
                              )}
                            </div>
                            {mr.status === "PENDING" && (
                              <div className="mt-3">
                                <h5 className="font-medium text-xs mb-1">
                                  Actions Available
                                </h5>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleApproveRequest(mr.id)
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleRejectRequest(mr.id)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {materialRequests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No material requests found</p>
                      <p className="text-sm">
                        Submitted requests will appear here
                      </p>
                    </div>
                  )}
                  {materialRequests.length > 10 && (
                    <Button variant="outline" className="w-full">
                      View All {materialRequests.length} Material Requests
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Material Requests</CardTitle>
                  <CardDescription>
                    Review and approve material requests from site teams
                  </CardDescription>
                </div>
                <Button onClick={() => setIsRequestDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request #</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Transaction Date</TableHead>
                      <TableHead>Required By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialRequests.length > 0 ? (
                      materialRequests.map((request) => (
                        <React.Fragment key={request.id}>
                          <TableRow>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const expanded = document.getElementById(
                                      `request-${request.id}`
                                    );
                                    if (expanded) {
                                      expanded.style.display =
                                        expanded.style.display === "none"
                                          ? "table-row"
                                          : "none";
                                    }
                                  }}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <span className="font-medium">
                                  {request.requestNumber}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.requester?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {request.purpose}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              {Array.isArray(request.items) &&
                              request.items.length > 0
                                ? `${request.items.length} items`
                                : "No items"}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                request.transactionDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {request.requiredBy
                                ? new Date(
                                    request.requiredBy
                                  ).toLocaleDateString()
                                : "Not specified"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusColor(
                                  request.status.toLowerCase()
                                )}
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {request.status === "PENDING" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleApproveRequest(request.id)
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleRejectRequest(request.id)
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status === "APPROVED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCreatePOFromRequest(request)
                                    }
                                  >
                                    Create PO
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditRequest(request)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteMaterialRequest(request.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            id={`request-${request.id}`}
                            style={{ display: "none" }}
                            className="bg-muted/50"
                          >
                            <TableCell colSpan={8}>
                              <div className="p-4">
                                <h4 className="font-medium mb-2 text-sm">
                                  Material Items
                                </h4>
                                <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                                  {(request.items || []).length > 0 ? (
                                    (request.items || []).map(
                                      (
                                        item: MaterialRequestItem,
                                        idx: number
                                      ) => (
                                        <div
                                          key={idx}
                                          className="border rounded p-3 bg-background"
                                        >
                                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase">
                                                Item Code
                                              </div>
                                              <div className="font-medium">
                                                {item.itemCode || "N/A"}
                                              </div>
                                            </div>
                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase">
                                                Quantity
                                              </div>
                                              <div>{item.quantity || 0}</div>
                                            </div>
                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase">
                                                UOM
                                              </div>
                                              <div>{item.uom || "N/A"}</div>
                                            </div>
                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase">
                                                Required By
                                              </div>
                                              <div>
                                                {request.requiredBy
                                                  ? new Date(
                                                      request.requiredBy
                                                    ).toLocaleDateString(
                                                      "en-IN"
                                                    )
                                                  : "N/A"}
                                              </div>
                                            </div>
                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase">
                                                Targeted Warehouse
                                              </div>
                                              <div>
                                                {item.targetedWarehouse ||
                                                  item.warehouse ||
                                                  "N/A"}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <div className="text-muted-foreground">
                                      No items listed
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No material requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <NewMaterialRequestModal
            open={isRequestDialogOpen}
            onOpenChange={setIsRequestDialogOpen}
            onSave={handleNewMaterialRequestSave}
          />{" "}
          <AlertDialog
            open={isDeleteRequestDialogOpen}
            onOpenChange={setIsDeleteRequestDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  material request{" "}
                  <span className="font-semibold text-black">
                    {
                      materialRequests.find(
                        (mr) => mr.id === materialRequestToDelete
                      )?.requestNumber
                    }
                  </span>{" "}
                  and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteMaterialRequest}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Vendor
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                <div>
                  <CardTitle>Purchase Orders</CardTitle>
                  <CardDescription>
                    View, filter, and manage all purchase orders in the system
                  </CardDescription>
                </div>
                <div className="flex flex-1 gap-4 items-center md:justify-end">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="invoiced">Invoiced</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  {/*
                    <Select
                      value={selectedPriority}
                      onValueChange={setSelectedPriority}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    */}
                  <Button onClick={() => setShowComprehensiveForm(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Purchase Order
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Required By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchaseOrders.length > 0 ? (
                      filteredPurchaseOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <TableRow>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const expanded = document.getElementById(
                                      `order-${order.id}`
                                    );
                                    if (expanded) {
                                      expanded.style.display =
                                        expanded.style.display === "none"
                                          ? "table-row"
                                          : "none";
                                    }
                                  }}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <span className="font-medium">
                                  {order.poNumber}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{order.Vendor?.name || "N/A"}</TableCell>
                            <TableCell className="max-w-[200px]">
                              {order.items && order.items.length > 0
                                ? `${order.items.length} items`
                                : "No items"}
                            </TableCell>
                            <TableCell>
                              ₹{order.grandTotal?.toLocaleString() || "0"}
                            </TableCell>
                            <TableCell>
                              {new Date(order.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(order.requiredBy).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditOrder(order)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteOrder(order.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow
                            id={`order-${order.id}`}
                            style={{ display: "none" }}
                            className="bg-muted/50"
                          >
                            <TableCell colSpan={7}>
                              <div className="p-6 space-y-6">
                                {/* Purchase Order Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-primary border-b pb-2">
                                      Order Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">PO Number:</span>
                                        <span className="font-medium">{order.poNumber}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order Date:</span>
                                        <span className="font-medium">
                                          {new Date(order.date).toLocaleDateString("en-IN")}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Required By:</span>
                                        <span className="font-medium">
                                          {new Date(order.requiredBy).toLocaleDateString("en-IN")}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Items:</span>
                                        <span className="font-medium">{order.items?.length || 0}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Quantity:</span>
                                        <span className="font-medium">{order.totalQuantity || 0}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-primary border-b pb-2">
                                      Vendor Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Vendor Name:</span>
                                        <span className="font-medium">{order.Vendor?.name || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contact:</span>
                                        <span className="font-medium">{order.vendorContact || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium text-xs">{order.Vendor?.email || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Address:</span>
                                        <span className="font-medium text-xs text-right max-w-[150px]">
                                          {order.vendorAddress || "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Target Warehouse:</span>
                                        <span className="font-medium">{order.setTargetWarehouse || "N/A"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-primary border-b pb-2">
                                      Financial Summary
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-medium">₹{(order.total || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax & Charges:</span>
                                        <span className="font-medium text-orange-600">
                                          ₹{(order.taxesAndChargesTotal || 0).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-t pt-2">
                                        <span className="text-muted-foreground font-medium">Grand Total:</span>
                                        <span className="font-bold text-green-600">
                                          ₹{(order.grandTotal || 0).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rounded Total:</span>
                                        <span className="font-medium">₹{(order.roundedTotal || 0).toLocaleString()}</span>
                                      </div>
                                      {order.advancePaid > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Advance Paid:</span>
                                          <span className="font-medium text-blue-600">
                                            ₹{(order.advancePaid || 0).toLocaleString()}
                                          </span>
                                        </div>
                                      )}
                                      {order.advancePaid > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Balance Due:</span>
                                          <span className="font-medium text-red-600">
                                            ₹{((order.grandTotal || 0) - (order.advancePaid || 0)).toLocaleString()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Items Details */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm text-primary border-b pb-2">
                                    Purchase Order Items ({order.items?.length || 0} items)
                                  </h4>
                                  <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {(order.items || []).length > 0 ? (
                                      (order.items || []).map((item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="border rounded-lg p-4 bg-background shadow-sm hover:shadow-md transition-shadow"
                                        >
                                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                            <div className="md:col-span-2">
                                              <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                                Item Details
                                              </div>
                                              <div className="space-y-1">
                                                <div className="font-semibold text-sm">
                                                  {item.itemCode || item.description || item.itemName || "N/A"}
                                                </div>
                                                {item.description && item.itemCode && (
                                                  <div className="text-xs text-muted-foreground">
                                                    {item.description}
                                                  </div>
                                                )}
                                                {item.brand && (
                                                  <div className="text-xs text-muted-foreground">
                                                    Brand: {item.brand}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                                Quantity
                                              </div>
                                              <div className="font-semibold text-sm">
                                                {item.quantity || 0}
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                {item.unit || item.uom || "units"}
                                              </div>
                                            </div>

                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                                Rate
                                              </div>
                                              <div className="font-semibold text-sm">
                                                ₹{(item.rate || item.unitPrice || 0).toLocaleString()}
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                per {item.unit || item.uom || "unit"}
                                              </div>
                                            </div>

                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                                Amount
                                              </div>
                                              <div className="font-semibold text-sm text-green-600">
                                                ₹{((item.quantity || 0) * (item.rate || item.unitPrice || 0)).toLocaleString()}
                                              </div>
                                              {item.discount && (
                                                <div className="text-xs text-red-500">
                                                  Disc: {item.discount}%
                                                </div>
                                              )}
                                            </div>

                                            <div>
                                              <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                                Warehouse
                                              </div>
                                              <div className="font-medium text-sm">
                                                {item.warehouse || item.targetedWarehouse || order.setTargetWarehouse || "N/A"}
                                              </div>
                                              {item.stockLevel && (
                                                <div className="text-xs text-muted-foreground">
                                                  Stock: {item.stockLevel}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Additional item details */}
                                          {(item.specifications || item.remarks || item.deliveryDate) && (
                                            <div className="mt-3 pt-3 border-t">
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                                {item.specifications && (
                                                  <div>
                                                    <span className="font-medium text-muted-foreground">Specifications:</span>
                                                    <div className="text-muted-foreground mt-1">{item.specifications}</div>
                                                  </div>
                                                )}
                                                {item.remarks && (
                                                  <div>
                                                    <span className="font-medium text-muted-foreground">Remarks:</span>
                                                    <div className="text-muted-foreground mt-1">{item.remarks}</div>
                                                  </div>
                                                )}
                                                {item.deliveryDate && (
                                                  <div>
                                                    <span className="font-medium text-muted-foreground">Delivery Date:</span>
                                                    <div className="text-muted-foreground mt-1">
                                                      {new Date(item.deliveryDate).toLocaleDateString("en-IN")}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-8 text-muted-foreground">
                                        <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                        <p>No items listed in this purchase order</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Tax and Charges Breakdown */}
                                {order.taxesAndChargesTotal > 0 && (
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-primary border-b pb-2">
                                      Tax & Charges Breakdown
                                    </h4>
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal (Before Tax):</span>
                                            <span className="font-medium">₹{(order.total || 0).toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax Rate:</span>
                                            <span className="font-medium">
                                              {order.total > 0 ? ((order.taxesAndChargesTotal / order.total) * 100).toFixed(2) : 0}%
                                            </span>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Tax & Charges:</span>
                                            <span className="font-semibold text-orange-600">
                                              ₹{(order.taxesAndChargesTotal || 0).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex justify-between border-t pt-2">
                                            <span className="font-medium">Final Amount:</span>
                                            <span className="font-bold text-green-600">
                                              ₹{(order.grandTotal || 0).toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Payment Status */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm text-primary border-b pb-2">
                                    Payment Status
                                  </h4>
                                  <div className={`rounded-lg p-4 ${order.advancePaid > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {order.advancePaid > 0 ? (
                                          <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                          <Clock className="h-5 w-5 text-yellow-600" />
                                        )}
                                        <span className={`font-semibold ${order.advancePaid > 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                                          {order.advancePaid > 0 ? 'Partially Paid' : 'Payment Pending'}
                                        </span>
                                      </div>
                                      <Badge variant={order.advancePaid > 0 ? "default" : "secondary"}>
                                        {order.advancePaid > 0 ? 
                                          `${((order.advancePaid / order.grandTotal) * 100).toFixed(1)}% Paid` : 
                                          'Unpaid'
                                        }
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No purchase orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <VendorManagement selectedUserId={selectedUserId}/>
        </TabsContent>
      </Tabs>
      {/* </CardContent> */}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this purchase order? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comprehensive Purchase Order Form Dialog */}
      <Dialog
        open={showComprehensiveForm}
        onOpenChange={setShowComprehensiveForm}
      >
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <PurchaseOrderForm
              onSuccess={() => {
                fetchPurchaseOrders();
                setShowComprehensiveForm(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Purchase Order Form Dialog */}
      <Dialog
        open={showEditForm}
        onOpenChange={(open) => {
          setShowEditForm(open);
          if (!open) {
            setEditingOrder(null);
            setIsLoadingEditData(false);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Edit Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {isLoadingEditData ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading purchase order details...</p>
                </div>
              </div>
            ) : editingOrder ? (
              <PurchaseOrderForm
                isEditing={true}
                initialData={{
                  id: editingOrder.id,
                  poNumber: editingOrder.poNumber,
                  date: editingOrder.date
                    ? new Date(editingOrder.date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  vendorId: editingOrder.vendorId,
                  requiredBy: editingOrder.requiredBy
                    ? new Date(editingOrder.requiredBy)
                        .toISOString()
                        .split("T")[0]
                    : "",
                  setTargetWarehouse: editingOrder.setTargetWarehouse || "",
                  vendorAddress:
                    editingOrder.vendorAddress ||
                    editingOrder.Vendor?.location ||
                    "",
                  vendorContact:
                    editingOrder.vendorContact ||
                    editingOrder.Vendor?.contact ||
                    editingOrder.Vendor?.email ||
                    "",
                  shippingAddress: editingOrder.shippingAddress || "",
                  dispatchAddress: editingOrder.dispatchAddress || "",
                  companyBillingAddress:
                    editingOrder.companyBillingAddress || "",
                  placeOfSupply: editingOrder.placeOfSupply || "",
                  paymentTermsTemplate: editingOrder.paymentTermsTemplate || "",
                  terms: editingOrder.terms || "",
                  totalQuantity: editingOrder.totalQuantity || 0,
                  total: editingOrder.total || 0,
                  grandTotal: editingOrder.grandTotal || 0,
                  roundingAdjustment: editingOrder.roundingAdjustment || 0,
                  roundedTotal: editingOrder.roundedTotal || 0,
                  advancePaid: editingOrder.advancePaid || 0,
                  taxesAndChargesTotal: editingOrder.taxesAndChargesTotal || 0,
                  userId: editingOrder.userId || "",
                  items: editingOrder.items || [],
                  taxesAndCharges: editingOrder.taxesAndCharges || [],
                  paymentSchedule: editingOrder.paymentSchedule || [],
                }}
                onSuccess={() => {
                  fetchPurchaseOrders();
                  setShowEditForm(false);
                  setEditingOrder(null);
                }}
              />
            ) : (
              <div className="flex items-center justify-center p-8">
                <p>No purchase order data available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Material Request Modal */}
      <NewMaterialRequestModal
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        onSave={handleNewMaterialRequestSave}
      />

      {/* Edit Material Request Modal */}
      <EditMaterialRequestModal
        open={isEditRequestDialogOpen}
        onOpenChange={setIsEditRequestDialogOpen}
        materialRequest={currentEditRequest}
        onSave={handleEditRequestSave}
      />

      {/* Add Vendor Modal */}
      <AddVendorModal
        open={showNewVendorModal}
        onOpenChange={setShowNewVendorModal}
      />
    </div>
  );
}

