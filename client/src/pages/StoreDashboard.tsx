import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { DataTable } from "@/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Package,
  Truck,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  Warehouse,
  ArrowLeft,
  MapPin,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Download,
  Trash2,
  Edit,
  PauseCircle,
  Users,
  Eye,
} from "lucide-react";
import { inventoryData } from "@/lib/dummy-data";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import AddVehicleModal from "@/components/modals/AddVehicleModal";
import MaintenanceModal from "@/components/modals/MaintenanceModal";
import VehicleMovementLogsTable from "@/components/VehicleMovementLogsTable";
import ActiveVehiclesView from "@/components/ActiveVehiclesView";
import IdleVehiclesView from "@/components/IdleVehiclesView";
import MaintenanceVehiclesView from "@/components/MaintenanceVehiclesView";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useUserFilter } from "@/contexts/UserFilterContext";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import { Textarea } from "@/components/ui/textarea";

const toast2 = toast;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Dynamic transfer data will be calculated from actual transfers

type User = {
  id: string;
  name: string;
  role: string;
  email?: string;
};

type InventoryItem = (typeof inventoryData)[0];

const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: "Item Name",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return <Badge variant="outline">{category}</Badge>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      const unit = row.original.unit;
      return `${quantity} ${unit}`;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
];

const transferColumns = [
  {
    accessorKey: "id",
    header: "Transfer ID",
  },
  {
    accessorKey: "items",
    header: "Items",
  },
  {
    accessorKey: "from",
    header: "From",
  },
  {
    accessorKey: "to",
    header: "To",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "Completed"
          ? "default"
          : status === "In Transit"
          ? "secondary"
          : status === "Cancelled"
          ? "destructive"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

const topVehicles = [
  { vehicle: "Truck 1", utilization: 92, site: "Site A" },
  { vehicle: "Excavator 1", utilization: 88, site: "Site B" },
  { vehicle: "Truck 2", utilization: 85, site: "Site C" },
  { vehicle: "Crane 1", utilization: 80, site: "Site A" },
  { vehicle: "Truck 3", utilization: 78, site: "Site B" },
];

const costlyMaintenance = [
  {
    vehicle: "Truck 2",
    date: "2024-05-10",
    cost: 12000,
    desc: "Engine Overhaul",
  },
  {
    vehicle: "Crane 1",
    date: "2024-05-15",
    cost: 9500,
    desc: "Hydraulics Repair",
  },
  {
    vehicle: "Excavator 1",
    date: "2024-05-20",
    cost: 8000,
    desc: "Track Replacement",
  },
];

// Comment out or remove static arrays
// const transfersData = [...];
// const vehicleKpis = [...];
// const vehicleMovementLogs = [...];
// const fuelTrendData = [...];
// const utilizationByProject = [...];
// const purchaseRequests = [...];
// const maintenanceSchedules = [...];

const vehicleTypes = ["All", "Truck", "Excavator", "Crane"];
const projectSites = ["All", "Site A", "Site B", "Site C", "Depot"];
const statusOptions = ["All", "Active", "Idle", "Maintenance"];

type MaintenanceSchedule = {
  vehicle: string;
  last: string;
  next: string;
  status: string; // allow any string for compatibility
  vendor?: string;
  notes?: string;
};

const StoreDashboardContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [isTransferStockModalOpen, setIsTransferStockModalOpen] =
    useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemForIssue, setSelectedItemForIssue] =
    useState<InventoryItem | null>(null);
  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>(inventoryData);
  const [vehicleType, setVehicleType] = useState("all");
  const [vehicleSite, setVehicleSite] = useState("all");
  const [vehicleStatus, setVehicleStatus] = useState("all");
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceModalMode, setMaintenanceModalMode] = useState<
    "create" | "edit"
  >("create");
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [selectedVehicleForMaintenance, setSelectedVehicleForMaintenance] =
    useState<string>("");
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [selectedAsset, setSelectedAsset] =
    useState<MaintenanceSchedule | null>(null);
  const [overviewSubview, setOverviewSubview] = useState<
    "main" | "inventoryValue" | "lowStock" | "activeTransfers" | "totalItems"
  >("main");
  const [inventorySubview, setInventorySubview] = useState<
    "main" | "lowStock" | "totalItems" | "value"
  >("main");
  const [transferSubview, setTransferSubview] = useState<
    "main" | "active" | "completed" | "pending"
  >("main");
  const [analyticsSubview, setAnalyticsSubview] = useState<
    | "main"
    | "spend"
    | "turnover"
    | "deadStock"
    | "leadTime"
    | "suppliers"
    | "requests"
  >("main");
  const [vehicleSubview, setVehicleSubview] = useState<
    "main" | "active" | "onSite" | "maintenance" | "idle"
  >("main");

  // Add backend state
  const [transfers, setTransfers] = useState([]);
  const [vehicleKpis, setVehicleKpis] = useState<any>({});
  const [vehicleMovementLogs, setVehicleMovementLogs] = useState([]);
  const [fuelTrendData, setFuelTrendData] = useState([]);
  const [utilizationByProject, setUtilizationByProject] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [storageUtilization, setStorageUtilization] = useState([]);

  const { toast } = useToast();
  const { user } = useUser();

  // Use UserFilter Context
  const { targetUserId, selectedUser, currentUser, setSelectedUserId } =
    useUserFilter();
  const userID = targetUserId || user?.id || "";

  // Admin user selection state

  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/overview")) return "overview";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/vehicle-tracking")) return "vehicle-tracking";
    if (path.includes("/store-staffs")) return "store-staffs";
    return "overview"; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      overview: "/store-manager/overview",
      analytics: "/store-manager/analytics",
      "vehicle-tracking": "/store-manager/vehicle-tracking",
      "store-staffs": "/store-manager/store-staffs",
    };
    navigate(tabRoutes[value]);
  };

  const [inventory, setInventory] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [topVehicles, setTopVehicles] = useState<any[]>([]);
  const [costlyMaintenance, setCostlyMaintenance] = useState<any[]>([]);

  // Store analytics data
  const [storeOverview, setStoreOverview] = useState<any>({});
  const [inventoryTurnover, setInventoryTurnover] = useState<any>({});
  const [consumptionTrends, setConsumptionTrends] = useState<any>({});
  const [supplierPerformance, setSupplierPerformance] = useState<any>({});
  const [costAnalysis, setCostAnalysis] = useState<any>({});

  // Vendors and Material Requests data
  const [vendors, setVendors] = useState<any[]>([]);
  const [materialRequests, setMaterialRequests] = useState<any[]>([]);
  //store staff data
  const [storeStaff, setStoreStaff] = useState<any[]>([]);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isDeleteStaffAlertOpen, setIsDeleteStaffAlertOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);
  const [isViewStaffModalOpen, setIsViewStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editStaffData, setEditStaffData] = useState<any>({});
  const [staffFormData, setStaffFormData] = useState({
    fullName: "",
    contactNumber: "",
    email: "",
    emergencyContact: "",
    address: "",
    role: "",
    experience: "",
    availability: "",
    shiftPreference: "",
    joiningDate: "",
    certifications: "",
    specialization: "",
    notes: "",
  });

  const handleStaffFormChange = (field: string, value: string) => {
    setStaffFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetStaffForm = () => {
    setStaffFormData({
      fullName: "",
      contactNumber: "",
      email: "",
      emergencyContact: "",
      address: "",
      role: "",
      experience: "",
      availability: "",
      shiftPreference: "",
      joiningDate: "",
      certifications: "",
      specialization: "",
      notes: "",
    });
  };

  // Auto-reset on page change
  useEffect(() => {
    // Reset to current user on page load/change
    setSelectedUserId(null);
  }, []); // Empty dependency - runs once on mount

  const fetchAllUsers = async () => {
    if (!user) return;

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_URL}/users`, { headers });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      } else {
        console.error("Failed to fetch all users:", response.status);
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
      setAllUsers([]);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      await axios.delete(
        `${API_URL}/staff/store-staff/${staffToDelete.id}?userId=${userID}`,
        { headers }
      );

      toast2.success("Staff member deleted successfully", {
        description: `${staffToDelete.fullName} has been removed from the staff list`,
      });

      // Refresh staff data
      fetchStoreStaffData();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    } finally {
      setIsDeleteStaffAlertOpen(false);
      setStaffToDelete(null);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Prepare enum mappings
    const roleEnumMap: Record<string, string> = {
      "store-manager": "STORE_MANAGER",
      "assistant-manager": "ASSISTANT_MANAGER",
      "inventory-clerk": "INVENTORY_CLERK",
      "logistics-coordinator": "LOGISTICS_COORDINATOR",
      "warehouse-staff": "WAREHOUSE_STAFF",
      "material-specialist": "MATERIAL_SPECIALIST",
      "inventory-analyst": "INVENTORY_ANALYST",
      "quality-inspector": "QUALITY_INSPECTOR",
    };

    const availabilityEnumMap: Record<string, string> = {
      "full-time": "FULL_TIME",
      "part-time": "PART_TIME",
      contract: "CONTRACT",
      seasonal: "SEASONAL",
      "on-call": "ON_CALL",
    };

    const shiftEnumMap: Record<string, string> = {
      morning: "MORNING",
      day: "DAY",
      evening: "EVENING",
      night: "NIGHT",
      flexible: "FLEXIBLE",
    };

    try {
      const updateData = {
        fullName: editStaffData.fullName,
        email: editStaffData.email,
        contactNumber: editStaffData.contactNumber,
        emergencyContact: editStaffData.emergencyContact || null,
        address: editStaffData.address,
        position: roleEnumMap[editStaffData.role] || editStaffData.position,
        experienceYears:
          parseInt(editStaffData.experience) || editStaffData.experienceYears,
        availabilityStatus:
          availabilityEnumMap[editStaffData.availability] ||
          editStaffData.availabilityStatus,
        shiftTiming:
          shiftEnumMap[editStaffData.shiftPreference] ||
          editStaffData.shiftTiming,
        joiningDate: editStaffData.joiningDate || selectedStaff.joiningDate,
        certifications: editStaffData.certifications || null,
        areaOfSpecialization: editStaffData.specialization || null,
        notes: editStaffData.notes || null,
      };

      await axios.put(
        `${API_URL}/staff/store-staff/${selectedStaff.id}?userId=${userID}`,
        updateData,
        { headers }
      );

      toast2.success("Staff member updated successfully", {
        description: `${
          editStaffData.fullName || selectedStaff.fullName
        } has been updated`,
      });

      // Refresh staff data
      fetchStoreStaffData();

      // Close modal and reset edit mode
      setIsEditingStaff(false);
      setIsViewStaffModalOpen(false);
      setSelectedStaff(null);
      setEditStaffData({});
    } catch (error) {
      console.error("Error updating staff:", error);
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    }
  };

  const handleEditStaffFormChange = (field: string, value: string) => {
    setEditStaffData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate Staff KPIs
  const getStaffKPIs = () => {
    const totalStaff = storeStaff.length;
    const onDutyStaff = storeStaff.filter(
      (staff) => staff.status === "ON_DUTY"
    ).length;
    const offDutyStaff = storeStaff.filter(
      (staff) => staff.status === "OFF_DUTY"
    ).length;

    // Group by availability status
    const availabilityStats = storeStaff.reduce((acc, staff) => {
      const availability = staff.availabilityStatus || "UNKNOWN";
      acc[availability] = (acc[availability] || 0) + 1;
      return acc;
    }, {});

    // Group by position
    const positionStats = storeStaff.reduce((acc, staff) => {
      const position = staff.position || "UNKNOWN";
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});

    return {
      totalStaff,
      onDutyStaff,
      offDutyStaff,
      availabilityStats,
      positionStats,
      fullTimeStaff: availabilityStats["FULL_TIME"] || 0,
      partTimeStaff: availabilityStats["PART_TIME"] || 0,
      contractStaff: availabilityStats["CONTRACT"] || 0,
      onCallStaff: availabilityStats["ON_CALL"] || 0,
    };
  };

  const fetchStoreStaffData = async () => {
    if (!user?.id) return;

    // Use selectedUserId if admin has selected a user, otherwise use current user's ID

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
          ? `${API_URL}/staff/store-staff`
          : `${API_URL}/staff/store-staff/${userID}`;
      const response = await axios.get(
        endpoint,
        {
          headers,
        }
      );
      setStoreStaff(response.data);
    } catch (error) {
      console.error("Error fetching store staff:", error);
      toast({
        title: "Error",
        description: "Failed to fetch store staff data",
        variant: "destructive",
      });
    }
  };

  const fetchVendorsData = async () => {
    if (!user?.id) return;

    // Use selectedUserId if admin has selected a user, otherwise use current user's ID

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
          ? `${API_URL}/vendors`
          : `${API_URL}/vendors/user/${userID}`;
      const response = await axios.get(endpoint, {
        headers,
      });
      setVendors(response.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor data",
        variant: "destructive",
      });
    }
  };

  const fetchTransfersData = async () => {
    if (!user?.id) return;

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
          ? `${API_URL}/store/transfers`
          : `${API_URL}/store/transfers?userId=${userID}`;
          console.log("Fetching schedule maintenances from:", endpoint);
      const response = await axios.get(
        endpoint,
        { headers }
      );
      setTransfers(response.data || []);
    } catch (error) {
      console.error("Error fetching transfers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transfer data",
        variant: "destructive",
      });
    }
  };

  // Calculate transfer statistics from actual data
  const getTransferStats = () => {
    if (!transfers.length) return [];

    const statuses = ["DELIVERED", "IN_TRANSIT", "PENDING", "CANCELLED"];
    const colors = {
      DELIVERED: "#10b981",
      IN_TRANSIT: "#3b82f6",
      PENDING: "#f59e0b",
      CANCELLED: "#ef4444",
    };
    const labels = {
      DELIVERED: "Completed",
      IN_TRANSIT: "In Transit",
      PENDING: "Pending",
      CANCELLED: "Cancelled",
    };

    return statuses.map((status) => ({
      name: labels[status],
      value: transfers.filter((t: any) => t.status === status).length,
      fill: colors[status],
    }));
  };

  // Calculate material request statistics
  const getMaterialRequestStats = () => {
    const statuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];
    return statuses.map((status) => ({
      status,
      label: status.charAt(0) + status.slice(1).toLowerCase(),
      count: materialRequests.filter((req: any) => req.status === status)
        .length,
      color:
        status === "APPROVED" || status === "COMPLETED"
          ? "bg-green-500"
          : status === "PENDING"
          ? "bg-yellow-500"
          : status === "REJECTED"
          ? "bg-red-500"
          : "bg-blue-500",
    }));
  };

  // Calculate category-wise inventory analysis from real data
  const getCategoryWiseAnalysis = () => {
    if (!inventory.length) return [];

    const categoryColors = {
      CONSTRUCTION_MATERIALS: "#14b8a6", // Teal
      TOOLS_AND_EQUIPMENT: "#f59e0b", // Yellow
      SAFETY_EQUIPMENT: "#ef4444", // Red
      ELECTRICAL_COMPONENTS: "#8b5cf6", // Purple
      PLUMBING_MATERIALS: "#3b82f6", // Blue
      HVAC_EQUIPMENT: "#84cc16", // Lime
      FINISHING_MATERIALS: "#22c55e", // Green (lighter)
      HARDWARE_AND_FASTENERS: "#f97316", // Orange
      OTHERS: "#6b7280",
    };

    // Group inventory by category and sum quantities
    const categoryData = inventory.reduce((acc: any, item: any) => {
      const category = item.category || "Others";
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          quantity: 0,
          fill: categoryColors[category] || categoryColors["Others"],
        };
      }
      // Sum quantities for pie chart display
      acc[category].value += item.quantity || 0;
      acc[category].quantity += item.quantity || 0;
      return acc;
    }, {});

    return Object.values(categoryData);
  };

  // Format category data for display
  const formatCategoryData = () => {
    const data = getCategoryWiseAnalysis();
    return data.map((item: any) => ({
      ...item,
      displayValue: `${item.quantity} items`,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "bg-green-500";
      case "Low":
        return "bg-yellow-500";
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStockLevel = (quantity: number, minStock: number) => {
    return Math.min(100, (quantity / minStock) * 100);
  };

  const handleLogGRN = () => {
    toast({
      title: "GRN logged successfully!",
    });
    setIsGRNModalOpen(false);
  };

  const handleRaiseRequest = () => {
    toast({
      title: "Purchase request raised successfully!",
    });
    setIsRequestModalOpen(false);
  };

  const handleTransferApproval = () => {
    toast({
      title: "Transfer request approved!",
    });
    setIsTransferModalOpen(false);
  };

  const handleIssueToSite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const siteTeam = formData.get("siteTeam") as string;
    const reason = formData.get("reason") as string;
    const quantity = Number(formData.get("quantity"));
    const selectedItems = formData.getAll("selectedItems") as string[];

    if (quantity > 0) {
      // Update the inventory items with the reduced quantity
      setInventoryItems((currentItems) =>
        currentItems.map((item) => {
          if (selectedItems.includes(item.name)) {
            return {
              ...item,
              quantity: Math.max(0, item.quantity - quantity),
              lastUpdated: new Date().toLocaleDateString(),
            };
          }
          return item;
        })
      );

      toast({
        title: `Issued ${quantity} items to ${siteTeam} for ${reason}`,
      });
      setIsIssueModalOpen(false);
      setSelectedItemForIssue(null);
    }
  };

  const handleUpdateStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuantity = Number(formData.get("quantity"));

    if (selectedItem && newQuantity >= 0) {
      // Update the inventory items with the new quantity
      setInventoryItems((currentItems) =>
        currentItems.map((item) =>
          item.name === selectedItem.name
            ? {
                ...item,
                quantity: newQuantity,
                lastUpdated: new Date().toLocaleDateString(),
              }
            : item
        )
      );

      toast({
        title: `Updated ${selectedItem.name} stock to ${newQuantity} ${selectedItem.unit}`,
      });
      setIsUpdateStockModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleTransferStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toLocation = formData.get("toLocation") as string;
    const quantity = Number(formData.get("quantity"));

    if (selectedItem && quantity > 0) {
      // Update the inventory items with the new quantity after transfer
      setInventoryItems((currentItems) =>
        currentItems.map((item) =>
          item.name === selectedItem.name
            ? {
                ...item,
                quantity: item.quantity - quantity,
                lastUpdated: new Date().toLocaleDateString(),
              }
            : item
        )
      );

      toast({
        title: `Transferred ${quantity} ${selectedItem.unit} of ${selectedItem.name} to ${toLocation}`,
      });
      setIsTransferStockModalOpen(false);
      setSelectedItem(null);
    }
  };

  function handleAddVehicle(vehicle: any) {
    toast({
      title: "Vehicle Added",
      description: `${vehicle.vehicleName} was added successfully.`,
      duration: 3000,
    });
    // Refresh vehicle data after adding
    fetchVehicleData();
  }

  const fetchVehicleData = async (filters?: {
    vehicleType?: string;
    assignedSite?: string;
    status?: string;
  }) => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      // Build query parameters for filtering
      const params = new URLSearchParams();
      if (filters?.vehicleType && filters.vehicleType !== "all") {
        params.append("vehicleType", filters.vehicleType);
      }
      if (filters?.assignedSite && filters.assignedSite !== "all") {
        params.append("assignedSite", filters.assignedSite);
      }
      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      // Always include userId for scoped vehicle queries
      if (userID) {
        params.append("userId", userID);
      }

      // Fetch updated vehicle analytics
      const analyticsResponse = await axios.get(
        `${API_URL}/vehicles/analytics?userId=${userID}`,
        { headers }
      );
      setVehicleKpis(analyticsResponse.data);
      setTopVehicles(analyticsResponse.data.allVehiclesBySite || []);

      // Fetch filtered movements (scoped by user)
      const movementsQuery = params.toString();
      const movementsUrl = `${API_URL}/vehicles/movements/list${
        movementsQuery ? `?${movementsQuery}` : ""
      }`;
      const movementsResponse = await axios.get(movementsUrl, { headers });
      setVehicleMovementLogs(movementsResponse.data);

      // Fetch filtered maintenance (scoped by user)
      const maintenanceQuery = params.toString();
      const maintenanceUrl = `${API_URL}/vehicles/maintenance/list${
        maintenanceQuery ? `?${maintenanceQuery}` : ""
      }`;
      const maintenanceResponse = await axios.get(maintenanceUrl, { headers });
      setMaintenanceSchedules(maintenanceResponse.data);
      const costly = maintenanceResponse.data
        .filter((item: any) => item.cost && item.cost > 5000)
        .sort((a: any, b: any) => (b.cost || 0) - (a.cost || 0))
        .slice(0, 5);
      setCostlyMaintenance(costly);
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

  // Update vehicle data when filters change
  useEffect(() => {
    fetchVehicleData({
      vehicleType,
      assignedSite: vehicleSite,
      status: vehicleStatus,
    });
  }, [vehicleType, vehicleSite, vehicleStatus]);

  // Maintenance CRUD Functions
  const handleAddMaintenance = (vehicleId: string) => {
    setSelectedVehicleForMaintenance(vehicleId);
    setMaintenanceModalMode("create");
    setSelectedMaintenance(null);
    setShowMaintenanceModal(true);
  };

  const handleEditMaintenance = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setMaintenanceModalMode("edit");
    setShowMaintenanceModal(true);
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/vehicles/maintenance/${maintenanceId}`, {
        headers,
      });

      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });

      fetchVehicleData();
    } catch (error: any) {
      console.error("Error deleting maintenance:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to delete maintenance record",
      });
    }
  };

  const handleReorder = (item: any) => {
    // Create a purchase request for the item
    const reorderQuantity = item.minStock * 2 - item.quantity; // Order enough to get back to 2x min stock

    toast({
      title: "Reorder initiated",
      description: `Ordered ${reorderQuantity} ${item.unit} of ${item.item}`,
    });

    // Update the item's status to show it's been reordered
    const updatedInventory = inventory.map((invItem) => {
      if (invItem.id === item.id) {
        return {
          ...invItem,
          status: "Reordered",
        };
      }
      return invItem;
    });

    // In a real application, you would make an API call here to:
    // 1. Create a purchase order
    // 2. Update the item status
    // 3. Notify relevant stakeholders
  };

  const handleApproveRequest = (request: any) => {
    // Update the status of the request
    setPurchaseRequests((currentRequests) =>
      currentRequests.map((req) =>
        req.id === request.id ? { ...req, status: "Approved" } : req
      )
    );

    // Show success notification
    toast({
      title: "Purchase request approved",
      description: `Request for ${request.item} has been approved`,
    });

    // In a real application, you would:
    // 1. Make an API call to update the request status
    // 2. Create a purchase order
    // 3. Notify relevant stakeholders
    // 4. Update inventory tracking system
  };

  const handleGetQuote = (request: any) => {
    // Show processing notification
    toast({
      title: "Requesting quotes",
      description: `Sending quote requests to vendors for ${request.item}`,
    });

    // In a real application, you would:
    // 1. Send quote requests to relevant vendors
    // 2. Track quote request status
    // 3. Update the request status
    // 4. Notify procurement team
  };

  const handleScheduleMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const maintenanceDate = formData.get("maintenanceDate") as string;
    const vendor = formData.get("vendor") as string;
    const notes = formData.get("notes") as string;

    if (selectedAsset && maintenanceDate) {
      // Update the maintenance schedule
      setMaintenanceSchedules((current) =>
        current.map((schedule) =>
          schedule.vehicle === selectedAsset.vehicle
            ? {
                ...schedule,
                next: maintenanceDate,
                status: "Scheduled",
                vendor,
                notes,
              }
            : schedule
        )
      );

      toast({
        title: "Maintenance Scheduled",
        description: `Maintenance for ${selectedAsset.vehicle} scheduled for ${maintenanceDate}`,
      });

      // Close the modal and reset selection
      setIsMaintenanceModalOpen(false);
      setSelectedAsset(null);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!user?.id) return;

    // Use selectedUserId if admin has selected a user, otherwise use current user's ID

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      // Fetch inventory turnover data
      const turnoverRes = await axios.get(
        `${API_URL}/store/analytics/turnover?userId=${userID}`,
        { headers }
      );
      setInventoryTurnover(turnoverRes.data);

      // Fetch consumption trends
      const consumptionRes = await axios.get(
        `${API_URL}/store/analytics/consumption?userId=${userID}`,
        { headers }
      );
      setConsumptionTrends(consumptionRes.data);

      // Fetch supplier performance
      const supplierRes = await axios.get(
        `${API_URL}/store/analytics/supplier-performance?userId=${userID}`,
        { headers }
      );
      setSupplierPerformance(supplierRes.data);
const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
            ? `${API_URL}/store/analytics/cost-analysis`
            : `${API_URL}/store/analytics/cost-analysis?userId=${userID}`;
            console.log("Fetching inventory data from:", endpoint);
      // Fetch cost analysis
      const costRes = await axios.get(
        endpoint,
        { headers }
      );
      setCostAnalysis(costRes.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const fetchInventoryData = async () => {
    try{
      const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
            ? `${API_URL}/store/inventory-data`
            : `${API_URL}/store/inventory-data?userId=${userID}`;
            console.log("Fetching inventory data from:", endpoint);
      const response = await axios.get(endpoint, { headers })
setInventory(response.data);
    } catch (error) {   
      console.error("Error fetching inventory data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      });
    }
  }
  // Fetch all users if current user is admin
  useEffect(() => {
    if (user?.role === "admin" || user?.role === "md") {
      fetchAllUsers();
      // setSelectedUserId(allUsers[0].id)
    }
  }, [user]);

  // Reset selectedUserId when user is not admin
  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "md") {
      setSelectedUserId("");
    }
  }, [user]);

  // Use effect to fetch data when targetUserId changes
  useEffect(() => {
    if (!userID) return; // Don't fetch if no user ID

    console.log("Fetching store data for user:", userID);

    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
            ? `${API_URL}/store/overview`
            : `${API_URL}/store/overview?userId=${userID}`;
            console.log("Fetching inventory data from:", endpoint);
    // Store Overview Data
    axios
      .get(endpoint, { headers })
      .then((res) => {
        setStoreOverview(res.data);
        setRecentTransactions(res.data.recentTransactions || []);
      })
      .catch((error) => console.error("Error fetching store overview:", error));

    // Store Inventory Data
     fetchInventoryData();

    // Store Stock Levels
    axios
      .get(`${API_URL}/store/stock-levels?userId=${userID}`, { headers })
      .then((res) => setStockData(res.data.stockData || []))
      .catch((error) => console.error("Error fetching stock levels:", error));

    // Store Transfers
    fetchTransfersData();

    // Vehicle data - using new vehicle APIs
    axios
      .get(`${API_URL}/vehicles/analytics?userId=${userID}`, { headers })
      .then((res) => {
        setVehicleKpis(res.data);
        setTopVehicles(res.data.allVehiclesBySite || []);
      })
      .catch(() => {});

    axios
      .get(`${API_URL}/vehicles/movements/list?userId=${userID}`, { headers })
      .then((res) => setVehicleMovementLogs(res.data))
      .catch(() => {});

    axios
      .get(`${API_URL}/vehicles/maintenance/list?userId=${userID}`, { headers })
      .then((res) => {
        setMaintenanceSchedules(res.data);
        // Filter costly maintenance from the data
        const costly = res.data
          .filter((item) => item.cost && item.cost > 5000)
          .sort((a, b) => (b.cost || 0) - (a.cost || 0))
          .slice(0, 5);
        setCostlyMaintenance(costly);
      })
      .catch(() => {});

    // Temporary mock data for fuel trends and utilization until endpoints are implemented
    setFuelTrendData([
      { name: "Week 1", Truck1: 120, Truck2: 110 },
      { name: "Week 2", Truck1: 115, Truck2: 105 },
      { name: "Week 3", Truck1: 125, Truck2: 115 },
      { name: "Week 4", Truck1: 118, Truck2: 108 },
    ]);

    setUtilizationByProject([
      { project: "Site A", utilization: 85 },
      { project: "Site B", utilization: 72 },
      { project: "Site C", utilization: 90 },
      { project: "Depot", utilization: 45 },
    ]);

    // Purchase requests
    axios
      .get(`${API_URL}/purchase-requests`, { headers })
      .then((res) => setPurchaseRequests(res.data))
      .catch(() => {});

    // Fetch analytics data with targetUserId
    fetchAnalyticsData();

    // Fetch vendors data
    fetchVendorsData();

    // Fetch store staff data
    fetchStoreStaffData();

    // Fetch material requests data
    const endpoint2 = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
            ? `${API_URL}/material/material-requests`
            : `${API_URL}/material/material-requests/user/${userID}`;
            console.log("Fetching inventory data from:", endpoint);
    axios
      .get(endpoint2, {
        headers,
      })
      .then((res) => setMaterialRequests(res.data || []))
      .catch((error) =>
        console.error("Error fetching material requests:", error)
      );
  }, [userID]); // Refetch when target user changes

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        {/* User Filter Component */}
        <UserFilterComponent />

        <div className="flex flex-col gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight break-words">
              Store Manager Dashboard
              {selectedUser && selectedUser.id !== currentUser?.id && (
                <span className="text-sm sm:text-lg text-muted-foreground ml-2 block sm:inline">
                  - {selectedUser.name}
                </span>
              )}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              SiteStock management and logistics
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* <Button onClick={() => setIsGRNModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Log GRN
              </Button> */}
            {/* <Button
              onClick={() => setIsRequestModalOpen(true)}
              variant="outline"
              className="gap-2 w-full sm:w-auto"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Raise Request</span>
              <span className="sm:hidden">Request</span>
            </Button> */}
          </div>
        </div>

        {/* Admin User Selection */}

        <Tabs
          value={getCurrentTab()}
          onValueChange={handleTabChange}
          className="space-y-2 sm:space-y-6 w-full overflow-x-auto"
        >
          {/* Desktop tabs - visible only on desktop */}
          <TabsList className="hidden md:grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {/* <TabsTrigger value="warehouse">Warehouse</TabsTrigger> */}
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="vehicle-tracking">Vehicle Tracking</TabsTrigger>
            <TabsTrigger value="store-staffs">Store Staff</TabsTrigger>
          </TabsList>

          {/* Mobile-specific section header */}
          <div className="md:hidden mb-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                {getCurrentTab() === "overview" ? (
                  <BarChart3 className="h-5 w-5 text-primary" />
                ) : getCurrentTab() === "analytics" ? (
                  <TrendingUp className="h-5 w-5 text-primary" />
                ) : getCurrentTab() === "vehicle-tracking" ? (
                  <MapPin className="h-5 w-5 text-primary" />
                ) : (
                  <Users className="h-5 w-5 text-primary" />
                )}
                <div>
                  <h2 className="text-lg font-semibold">
                    {getCurrentTab() === "overview"
                      ? "Overview"
                      : getCurrentTab() === "analytics"
                      ? "Analytics"
                      : getCurrentTab() === "vehicle-tracking"
                      ? "Vehicle Tracking"
                      : "Store Staff"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Store ›{" "}
                    {getCurrentTab() === "overview"
                      ? "Overview"
                      : getCurrentTab() === "analytics"
                      ? "Analytics"
                      : getCurrentTab() === "vehicle-tracking"
                      ? "Vehicle Tracking"
                      : "Store Staff"}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {getCurrentTab() === "overview"
                  ? `${storeOverview?.kpis?.totalItems || 0} items`
                  : getCurrentTab() === "analytics"
                  ? `${inventory.length} items`
                  : getCurrentTab() === "vehicle-tracking"
                  ? `${vehicleMovementLogs.length} vehicles`
                  : `${storeStaff.length} staff`}
              </div>
            </div>
          </div>

          <TabsContent value="overview">
            {overviewSubview === "main" && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  <StatCard
                    title="Total Items"
                    value={`${storeOverview?.kpis?.totalItems || 0}`}
                    icon={Package}
                    description="All inventory items"
                    onClick={() => setOverviewSubview("totalItems")}
                  />
                  <StatCard
                    title="Low Stock Items"
                    value={`${storeOverview?.kpis?.lowStockItems || 0}`}
                    icon={AlertTriangle}
                    description="Need immediate attention"
                    onClick={() => setOverviewSubview("lowStock")}
                  />
                  <StatCard
                    title="Active Transfers"
                    value={`${storeOverview?.kpis?.activeTransfers || 0}`}
                    icon={Truck}
                    description="In transit"
                    onClick={() => setOverviewSubview("activeTransfers")}
                  />
                  {/* <StatCard
                  title="Total Inventory Value"
                  value={`₹${(
                    storeOverview?.kpis?.totalValue || 0
                  ).toLocaleString()}`}
                  icon={TrendingDown}
                  description="Across all locations"
                  onClick={() => setOverviewSubview("inventoryValue")}
                /> */}
                </div>

                {/* Critical Alerts */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                      Critical Stock Alerts
                    </CardTitle>
                    <CardDescription>
                      Items below safety stock that need immediate attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {inventory
                        .filter((item) => item.quantity <= item.safetyStock)
                        .map((item) => {
                          const stockStatus =
                            item.quantity <= item.safetyStock * 0.5
                              ? "Critical"
                              : "Low";
                          const bgColor =
                            stockStatus === "Critical"
                              ? "bg-red-100 border-red-300"
                              : "bg-yellow-50 border-yellow-200";
                          const textColor =
                            stockStatus === "Critical"
                              ? "text-red-600"
                              : "text-yellow-600";

                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-3 ${bgColor} border rounded-lg`}
                            >
                              <div className="flex items-center">
                                <AlertTriangle
                                  className={`h-4 w-4 mr-3 ${textColor}`}
                                />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.itemName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Current: {item.quantity} {item.unit} |
                                    Safety Stock: {item.safetyStock}{" "}
                                    {item.unit}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Location: {item.location} | Supplier:{" "}
                                    {item.primarySupplier?.name || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Badge
                                  variant={
                                    stockStatus === "Critical"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className={
                                    stockStatus === "Critical"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                  }
                                >
                                  {stockStatus}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      {inventory.filter(
                        (item) => item.quantity <= item.safetyStock
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                          <p className="text-lg font-medium">
                            All Stock Levels Good
                          </p>
                          <p className="text-sm">
                            No items are below reorder level
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Recent Material Transfers
                        {/* <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Navigate to transfers tab
                          const tabsList = document.querySelector('[role="tablist"]');
                          const transfersTab = tabsList?.querySelector('[value="analytics"]');
                          (transfersTab as HTMLElement)?.click();
                        }}
                      >
                        View All
                      </Button> */}
                      </CardTitle>
                      <CardDescription>
                        Latest material movements between locations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transfers.slice(0, 5).map((transfer, index) => (
                          <div
                            key={transfer.id || index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  transfer.status === "DELIVERED"
                                    ? "bg-green-500"
                                    : transfer.status === "IN_TRANSIT"
                                    ? "bg-blue-500"
                                    : transfer.status === "PENDING"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-gray-900">
                                    {transfer.items && transfer.items.length > 0
                                      ? transfer.items
                                          .slice(0, 2)
                                          .map((item: any) => item.description)
                                          .join(", ") +
                                        (transfer.items.length > 2
                                          ? ` +${
                                              transfer.items.length - 2
                                            } more`
                                          : "")
                                      : "No items"}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {transfer.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-600">
                                    {transfer.items?.length || 0} item(s)
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {transfer.fromLocation} ��{" "}
                                    {transfer.toLocation}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">
                                    Transfer ID:
                                  </span>{" "}
                                  {transfer.transferID}
                                  {transfer.items &&
                                    transfer.items.length > 0 && (
                                      <span className="ml-3">
                                        <span className="font-medium">
                                          Quantities:
                                        </span>{" "}
                                        {transfer.items
                                          .slice(0, 2)
                                          .map(
                                            (item: any) =>
                                              `${item.quantity} ${
                                                item.unit || "units"
                                              }`
                                          )
                                          .join(", ")}
                                        {transfer.items.length > 2 &&
                                          ` +${transfer.items.length - 2} more`}
                                      </span>
                                    )}
                                </p>
                                {transfer.vehicle && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    <span className="font-medium">
                                      Vehicle:
                                    </span>{" "}
                                    {transfer.vehicle.vehicleName}
                                    {transfer.driverName &&
                                      ` • Driver: ${transfer.driverName}`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  transfer.createdAt
                                ).toLocaleDateString()}
                              </span>
                              <p className="text-xs text-gray-400">
                                {new Date(
                                  transfer.createdAt
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {transfers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">
                              No Recent Transfers
                            </p>
                            <p className="text-sm">
                              No material transfers found
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* <Card>
                  <CardHeader>
                    <CardTitle>Storage Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {storageUtilization.map((storage, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">
                              {storage.location}
                            </span>
                            <span>
                              {storage.utilization}% ({storage.capacity})
                            </span>
                          </div>
                          <Progress
                            value={storage.utilization}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}
                </div>
              </>
            )}
            {overviewSubview === "inventoryValue" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Total Inventory Value</h2>
                  <Button
                    variant="outline"
                    onClick={() => setOverviewSubview("main")}
                  >
                    Back to Overview
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="text-2xl font-bold mb-1">₹45,00,000</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Total value of all inventory across all locations as of
                        today.
                      </div>
                      <div className="mb-4 overflow-x-auto">
                        <table className="min-w-full text-sm border rounded-lg">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Category</th>
                              <th className="p-2 text-left">Value</th>
                              <th className="p-2 text-left">% of Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                name: "Raw Materials",
                                value: 2000000,
                                fill: "#3b82f6",
                              },
                              {
                                name: "Consumables",
                                value: 1200000,
                                fill: "#10b981",
                              },
                              {
                                name: "Tools & Equipment",
                                value: 800000,
                                fill: "#f59e0b",
                              },
                              {
                                name: "Safety Items",
                                value: 500000,
                                fill: "#ef4444",
                              },
                            ].map((cat, idx, arr) => {
                              const total = arr.reduce(
                                (sum, c) => sum + c.value,
                                0
                              );
                              return (
                                <tr key={cat.name}>
                                  <td className="p-2 flex items-center gap-2">
                                    <span
                                      className="inline-block w-3 h-3 rounded-full"
                                      style={{ backgroundColor: cat.fill }}
                                    ></span>
                                    {cat.name}
                                  </td>
                                  <td className="p-2">
                                    ₹{cat.value.toLocaleString()}
                                  </td>
                                  <td className="p-2">
                                    {((cat.value / total) * 100).toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Raw Materials",
                              value: 2000000,
                              fill: "#3b82f6",
                            },
                            {
                              name: "Consumables",
                              value: 1200000,
                              fill: "#10b981",
                            },
                            {
                              name: "Tools & Equipment",
                              value: 800000,
                              fill: "#f59e0b",
                            },
                            {
                              name: "Safety Items",
                              value: 500000,
                              fill: "#ef4444",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: "Raw Materials", fill: "#3b82f6" },
                            { name: "Consumables", fill: "#10b981" },
                            { name: "Tools & Equipment", fill: "#f59e0b" },
                            { name: "Safety Items", fill: "#ef4444" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
            {overviewSubview === "lowStock" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Low Stock Items</h2>
                  <Button
                    variant="outline"
                    onClick={() => setOverviewSubview("main")}
                  >
                    Back to Overview
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {inventory
                        .filter((item) => item.quantity <= item.safetyStock)
                        .map((item) => {
                          const stockStatus =
                            item.quantity <= item.safetyStock * 0.5
                              ? "Critical"
                              : "Low";
                          const bgColor =
                            stockStatus === "Critical"
                              ? "bg-red-100 border-red-300"
                              : "bg-yellow-50 border-yellow-200";
                          const textColor =
                            stockStatus === "Critical"
                              ? "text-red-600"
                              : "text-yellow-600";

                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-3 ${bgColor} border rounded-lg`}
                            >
                              <div className="flex items-center">
                                <AlertTriangle
                                  className={`h-4 w-4 mr-3 ${textColor}`}
                                />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.itemName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Current: {item.quantity} {item.unit} |
                                    Safety Stock: {item.safetyStock}{" "}
                                    {item.unit}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Location: {item.location} | Supplier:{" "}
                                    {item.primarySupplier?.name || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Badge
                                  variant={
                                    stockStatus === "Critical"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className={
                                    stockStatus === "Critical"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                  }
                                >
                                  {stockStatus}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      {inventory.filter(
                        (item) => item.quantity <= item.safetyStock
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                          <p className="text-lg font-medium">
                            All Stock Levels Good
                          </p>
                          <p className="text-sm">
                            No items are below reorder level
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {overviewSubview === "activeTransfers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Active Transfers</h2>
                  <Button
                    variant="outline"
                    onClick={() => setOverviewSubview("main")}
                  >
                    Back to Overview
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {transfers.slice(0, 5).map((transfer, index) => (
                        <div
                          key={transfer.id || index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                transfer.status === "DELIVERED"
                                  ? "bg-green-500"
                                  : transfer.status === "IN_TRANSIT"
                                  ? "bg-blue-500"
                                  : transfer.status === "PENDING"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {transfer.items && transfer.items.length > 0
                                    ? transfer.items
                                        .slice(0, 2)
                                        .map((item: any) => item.description)
                                        .join(", ") +
                                      (transfer.items.length > 2
                                        ? ` +${transfer.items.length - 2} more`
                                        : "")
                                    : "No items"}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {transfer.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  {transfer.items?.length || 0} item(s)
                                </span>
                                <span className="text-sm text-gray-500">
                                  {transfer.fromLocation} →{" "}
                                  {transfer.toLocation}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">
                                  Transfer ID:
                                </span>{" "}
                                {transfer.transferID}
                                {transfer.items &&
                                  transfer.items.length > 0 && (
                                    <span className="ml-3">
                                      <span className="font-medium">
                                        Quantities:
                                      </span>{" "}
                                      {transfer.items
                                        .slice(0, 2)
                                        .map(
                                          (item: any) =>
                                            `${item.quantity} ${
                                              item.unit || "units"
                                            }`
                                        )
                                        .join(", ")}
                                      {transfer.items.length > 2 &&
                                        ` +${transfer.items.length - 2} more`}
                                    </span>
                                  )}
                              </p>
                              {transfer.vehicle && (
                                <p className="text-xs text-gray-400 mt-1">
                                  <span className="font-medium">Vehicle:</span>{" "}
                                  {transfer.vehicle.vehicleName}
                                  {transfer.driverName &&
                                    ` • Driver: ${transfer.driverName}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">
                              {new Date(
                                transfer.createdAt
                              ).toLocaleDateString()}
                            </span>
                            <p className="text-xs text-gray-400">
                              {new Date(
                                transfer.createdAt
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {transfers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">
                            No Recent Transfers
                          </p>
                          <p className="text-sm">No material transfers found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {overviewSubview === "totalItems" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">All Inventory Items</h2>
                  <Button
                    variant="outline"
                    onClick={() => setOverviewSubview("main")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Overview
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {inventory.length > 0 ? (
                        inventory.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-3 text-blue-500" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.itemName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity} {item.unit} |
                                  Location: {item.location}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Category: {item.category} | Reorder Level:{" "}
                                  {item.safetyStock} {item.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge
                                variant={
                                  item.quantity <= item.safetyStock
                                    ? "destructive"
                                    : "default"
                                }
                                className={
                                  item.quantity <= item.safetyStock
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }
                              >
                                {item.quantity <= item.safetyStock
                                  ? "Low Stock"
                                  : "In Stock"}
                              </Badge>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  ₹
                                  {(
                                    Number(item.unitCost) * item.quantity
                                  ).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Total Value
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">
                            No Inventory Items
                          </p>
                          <p className="text-sm">No items found in inventory</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory">
            {inventorySubview === "main" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <StatCard
                    title="Low Stock Items"
                    value="24"
                    icon={AlertTriangle}
                    description="Below reorder level"
                    onClick={() => setInventorySubview("lowStock")}
                  />
                  <StatCard
                    title="Total Items"
                    value="1,247"
                    icon={Package}
                    description="In inventory"
                    onClick={() => setInventorySubview("totalItems")}
                  />
                  <StatCard
                    title="Value"
                    value="₹12.5M"
                    icon={Package}
                    description="Total inventory value"
                    onClick={() => setInventorySubview("value")}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Stock Category Overview</CardTitle>
                    <CardDescription>
                      Inventory status by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="inStock" fill="#10b981" />
                        <Bar dataKey="lowStock" fill="#f59e0b" />
                        <Bar dataKey="outOfStock" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Alerts</CardTitle>
                    <CardDescription>Items requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          item: "Steel TMT Bars",
                          category: "Raw Material",
                          issue: "Low Stock",
                          level: "High",
                          action: "Reorder",
                        },
                        {
                          item: "Safety Helmets",
                          category: "Safety",
                          issue: "Expiring Soon",
                          level: "Medium",
                          action: "Use First",
                        },
                        {
                          item: "Electrical Wire",
                          category: "Electrical",
                          issue: "High Usage",
                          level: "Low",
                          action: "Monitor",
                        },
                      ].map((alert, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">{alert.item}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.category} • {alert.issue}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                alert.level === "High"
                                  ? "destructive"
                                  : alert.level === "Medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {alert.level}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() =>
                                toast({
                                  title: `${alert.action} action for ${alert.item}`,
                                })
                              }
                            >
                              {alert.action}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Site Inventory</CardTitle>
                      <CardDescription>
                        Current stock levels across locations
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsIssueModalOpen(true)}
                      className="gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      Issue to Site
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={[
                        ...inventoryColumns,
                        {
                          id: "actions",
                          header: "Actions",
                          cell: ({ row }) => (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(row.original);
                                  setIsTransferStockModalOpen(true);
                                }}
                              >
                                Transfer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(row.original);
                                  setIsUpdateStockModalOpen(true);
                                }}
                              >
                                Update Stock
                              </Button>
                            </div>
                          ),
                        },
                      ]}
                      data={inventoryItems}
                      searchKey="name"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            {inventorySubview === "lowStock" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Low Stock Items</h2>
                  <Button
                    variant="outline"
                    onClick={() => setInventorySubview("main")}
                  >
                    Back to Inventory
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {inventory
                        .filter(
                          (item) =>
                            item.status === "Critical" || item.status === "Low"
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.item}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Current: {item.quantity} {item.unit} | Min:{" "}
                                  {item.minStock} {item.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReorder(item)}
                                disabled={item.status === "Reordered"}
                              >
                                {item.status === "Reordered"
                                  ? "Reordered"
                                  : "Reorder"}
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {inventorySubview === "totalItems" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Total Items</h2>
                  <Button
                    variant="outline"
                    onClick={() => setInventorySubview("main")}
                  >
                    Back to Inventory
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="mb-4 text-lg">
                      Total number of unique inventory items:{" "}
                      <span className="font-bold">1,247</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      This includes all SKUs and item types across all
                      warehouses and sites. Below is a breakdown by category and
                      by site.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">By Category</h3>
                        <ul className="list-disc pl-6">
                          <li>Raw Materials: 520 items</li>
                          <li>Consumables: 320 items</li>
                          <li>Tools & Equipment: 210 items</li>
                          <li>Safety Items: 197 items</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">By Site</h3>
                        <ul className="list-disc pl-6">
                          <li>Warehouse A: 420 items</li>
                          <li>Warehouse B: 310 items</li>
                          <li>Yard 1: 280 items</li>
                          <li>Yard 2: 237 items</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Card className="shadow-none border border-muted-foreground/10">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between px-6 pt-6 pb-2">
                            <div>
                              <h3 className="font-semibold text-base">
                                Site Inventory
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Current stock levels across locations
                              </p>
                            </div>
                            <Button
                              onClick={() => setIsIssueModalOpen(true)}
                              className="gap-2"
                              size="sm"
                            >
                              <Truck className="h-4 w-4" />
                              Issue to Site
                            </Button>
                          </div>
                          <div className="px-6 pb-6">
                            <DataTable
                              columns={[
                                ...inventoryColumns,
                                {
                                  id: "actions",
                                  header: "Actions",
                                  cell: ({ row }) => (
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedItem(row.original);
                                          setIsTransferStockModalOpen(true);
                                        }}
                                      >
                                        Transfer
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedItem(row.original);
                                          setIsUpdateStockModalOpen(true);
                                        }}
                                      >
                                        Update Stock
                                      </Button>
                                    </div>
                                  ),
                                },
                              ]}
                              data={inventoryItems}
                              searchKey="name"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {inventorySubview === "value" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Inventory Value</h2>
                  <Button
                    variant="outline"
                    onClick={() => setInventorySubview("main")}
                  >
                    Back to Inventory
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="text-2xl font-bold mb-1">₹12,50,000</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Total value of all inventory as of today.
                      </div>
                      <div className="mb-4 overflow-x-auto">
                        <table className="min-w-full text-sm border rounded-lg">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Category</th>
                              <th className="p-2 text-left">Value</th>
                              <th className="p-2 text-left">% of Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                name: "Raw Materials",
                                value: 500000,
                                fill: "#3b82f6",
                              },
                              {
                                name: "Consumables",
                                value: 350000,
                                fill: "#10b981",
                              },
                              {
                                name: "Tools & Equipment",
                                value: 250000,
                                fill: "#f59e0b",
                              },
                              {
                                name: "Safety Items",
                                value: 150000,
                                fill: "#ef4444",
                              },
                            ].map((cat, idx, arr) => {
                              const total = arr.reduce(
                                (sum, c) => sum + c.value,
                                0
                              );
                              return (
                                <tr key={cat.name}>
                                  <td className="p-2 flex items-center gap-2">
                                    <span
                                      className="inline-block w-3 h-3 rounded-full"
                                      style={{ backgroundColor: cat.fill }}
                                    ></span>
                                    {cat.name}
                                  </td>
                                  <td className="p-2">
                                    ₹{cat.value.toLocaleString()}
                                  </td>
                                  <td className="p-2">
                                    {((cat.value / total) * 100).toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Raw Materials",
                              value: 500000,
                              fill: "#3b82f6",
                            },
                            {
                              name: "Consumables",
                              value: 350000,
                              fill: "#10b981",
                            },
                            {
                              name: "Tools & Equipment",
                              value: 250000,
                              fill: "#f59e0b",
                            },
                            {
                              name: "Safety Items",
                              value: 150000,
                              fill: "#ef4444",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: "Raw Materials", fill: "#3b82f6" },
                            { name: "Consumables", fill: "#10b981" },
                            { name: "Tools & Equipment", fill: "#f59e0b" },
                            { name: "Safety Items", fill: "#ef4444" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transfers">
            {transferSubview === "main" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <StatCard
                    title="Active Transfers"
                    value={transfers
                      .filter((t: any) => t.status === "IN_TRANSIT")
                      .length.toString()}
                    icon={Truck}
                    description="Currently in transit"
                    onClick={() => setTransferSubview("active")}
                  />
                  <StatCard
                    title="Completed Today"
                    value={transfers
                      .filter(
                        (t: any) =>
                          t.status === "DELIVERED" &&
                          new Date(t.createdAt).toDateString() ===
                            new Date().toDateString()
                      )
                      .length.toString()}
                    icon={CheckCircle}
                    description="Successfully delivered"
                    onClick={() => setTransferSubview("completed")}
                  />
                  <StatCard
                    title="Pending Approval"
                    value={transfers
                      .filter((t: any) => t.status === "PENDING")
                      .length.toString()}
                    icon={Clock}
                    description="Awaiting authorization"
                    onClick={() => setTransferSubview("pending")}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Transfer Status Distribution</CardTitle>
                    <CardDescription>
                      Current transfer status overview
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getTransferStats()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getTransferStats().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center mt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {getTransferStats().map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            ></div>
                            <span>
                              {item.name}: {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transfer Timeline</CardTitle>
                    <CardDescription>
                      Recent transfer activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          id: "TR001",
                          status: "Delivered",
                          time: "2 hours ago",
                          from: "Warehouse A",
                          to: "Site 1",
                        },
                        {
                          id: "TR002",
                          status: "In Transit",
                          time: "4 hours ago",
                          from: "Site 2",
                          to: "Central",
                        },
                        {
                          id: "TR003",
                          status: "Packed",
                          time: "6 hours ago",
                          from: "Warehouse B",
                          to: "Site 3",
                        },
                        {
                          id: "TR004",
                          status: "Requested",
                          time: "8 hours ago",
                          from: "Site 1",
                          to: "Warehouse A",
                        },
                      ].map((transfer) => (
                        <div
                          key={transfer.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">{transfer.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {transfer.from} → {transfer.to}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{transfer.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {transfer.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Material Transfers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={transferColumns}
                      data={transfers}
                      searchKey="items"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            {transferSubview === "active" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Active Transfers</h2>
                  <Button
                    variant="outline"
                    onClick={() => setTransferSubview("main")}
                  >
                    Back to Transfers
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {transfers
                        .filter((t) => t.status === "In Transit")
                        .map((transfer) => (
                          <div
                            key={transfer.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium">{transfer.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {transfer.items} | {transfer.from} →{" "}
                                {transfer.to}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">
                                {transfer.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {transferSubview === "completed" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Completed Transfers</h2>
                  <Button
                    variant="outline"
                    onClick={() => setTransferSubview("main")}
                  >
                    Back to Transfers
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {transfers
                        .filter((t) => t.status === "Completed")
                        .map((transfer) => (
                          <div
                            key={transfer.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium">{transfer.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {transfer.items} | {transfer.from} →{" "}
                                {transfer.to}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="default">{transfer.status}</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {transferSubview === "pending" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Pending Transfers</h2>
                  <Button
                    variant="outline"
                    onClick={() => setTransferSubview("main")}
                  >
                    Back to Transfers
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {transfers
                        .filter((t) => t.status === "Pending")
                        .map((transfer) => (
                          <div
                            key={transfer.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium">{transfer.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {transfer.items} | {transfer.from} →{" "}
                                {transfer.to}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{transfer.status}</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="procurement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {purchaseRequests.map((request) => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">
                            {request.item}
                          </h4>
                          <Badge
                            variant={
                              request.urgency === "High"
                                ? "destructive"
                                : request.urgency === "Medium"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {request.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Project: {request.project}
                        </p>
                        <p className="text-sm text-gray-600">
                          Requested by: {request.requestedBy}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          {request.status === "Pending" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveRequest(request)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGetQuote(request)}
                              >
                                Get Quote
                              </Button>
                            </>
                          ) : (
                            <Badge variant="default">{request.status}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendor Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        vendor: "ABC Materials",
                        rating: 4.8,
                        deliveries: 24,
                        onTime: 96,
                      },
                      {
                        vendor: "XYZ Suppliers",
                        rating: 4.6,
                        deliveries: 18,
                        onTime: 89,
                      },
                      {
                        vendor: "BuildCorp",
                        rating: 4.2,
                        deliveries: 32,
                        onTime: 78,
                      },
                    ].map((vendor, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">
                            {vendor.vendor}
                          </h4>
                          <div className="flex items-center">
                            <span className="text-sm font-semibold text-yellow-600 mr-1">
                              ★
                            </span>
                            <span className="text-sm font-semibold">
                              {vendor.rating}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Deliveries</p>
                            <p className="font-medium">{vendor.deliveries}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">On-time %</p>
                            <p className="font-medium">{vendor.onTime}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="warehouse">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <StatCard
                  title="Total Capacity"
                  value="85%"
                  icon={Warehouse}
                  description="Warehouse utilization"
                  onClick={() =>
                    toast({
                      title: "Viewing capacity details",
                    })
                  }
                />
                <StatCard
                  title="AMC Due Items"
                  value="12"
                  icon={AlertTriangle}
                  description="Maintenance required"
                  onClick={() =>
                    toast({
                      title: "Viewing AMC schedule",
                    })
                  }
                />
                <StatCard
                  title="Asset Value"
                  value="₹45M"
                  icon={Package}
                  description="Total asset value"
                  onClick={() =>
                    toast({
                      title: "Viewing asset register",
                    })
                  }
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Central Warehouse Management</CardTitle>
                  <CardDescription>
                    Asset and inventory oversight
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h3 className="font-medium mb-4">
                        Stock by Site Distribution
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            site: "Site 1 - Villa Complex",
                            percentage: 35,
                            value: "₹4.2M",
                          },
                          {
                            site: "Site 2 - Commercial Tower",
                            percentage: 28,
                            value: "₹3.5M",
                          },
                          {
                            site: "Site 3 - Apartments",
                            percentage: 22,
                            value: "₹2.8M",
                          },
                          {
                            site: "Central Warehouse",
                            percentage: 15,
                            value: "₹1.8M",
                          },
                        ].map((site) => (
                          <div
                            key={site.site}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {site.site}
                              </h4>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${site.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-semibold">
                                {site.value}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {site.percentage}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">
                        Asset Maintenance Schedule
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            vehicle: "Excavator JCB-001",
                            last: "2024-01-15",
                            next: "2024-04-15",
                            status: "Scheduled",
                            vendor: "Mech Services",
                          },
                          {
                            vehicle: "Crane CR-002",
                            last: "2024-01-10",
                            next: "2024-04-10",
                            status: "Overdue",
                            vendor: "Crane Care",
                          },
                          {
                            vehicle: "Mixer MX-003",
                            last: "2024-01-08",
                            next: "2024-04-08",
                            status: "Scheduled",
                            vendor: "Equipment Pro",
                          },
                        ].map((asset) => (
                          <div
                            key={asset.vehicle}
                            className="p-3 border rounded-lg"
                          >
                            <h4 className="font-medium text-sm">
                              {asset.vehicle}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Vendor: {asset.vendor}
                            </p>
                            <div className="flex justify-between mt-2 text-xs">
                              <span>Last: {asset.last}</span>
                              <span>Next: {asset.next}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => {
                                setSelectedAsset(asset as MaintenanceSchedule);
                                setIsMaintenanceModalOpen(true);
                              }}
                            >
                              Schedule Maintenance
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {analyticsSubview === "main" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <StatCard
                    title="Total Purchase Orders"
                    value={`₹${(
                      costAnalysis?.avgMonthlySpend || 0
                    ).toLocaleString()}`}
                    icon={BarChart3}
                    description="Total spending"
                    onClick={() => setAnalyticsSubview("spend")}
                  />
                  {/* <StatCard
                  title="Total Consumption"
                  value={`${inventoryTurnover?.totalConsumption || 0}`}
                  icon={TrendingDown}
                  description="Last 6 months"
                  onClick={() => setAnalyticsSubview("turnover")}
                /> */}
                  <StatCard
                    title="Total Suppliers"
                    value={`${vendors.length}`}
                    icon={Truck}
                    description="Active vendors"
                    onClick={() => setAnalyticsSubview("suppliers")}
                  />
                  <StatCard
                    title="Total Requests"
                    value={`${materialRequests.length}`}
                    icon={Clock}
                    description="Material requests"
                    onClick={() => setAnalyticsSubview("requests")}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  {/* <Card>
                  <CardHeader>
                    <CardTitle>Monthly Consumption Trend</CardTitle>
                    <CardDescription>
                      Value of materials consumed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { month: "Sep", value: 2800000 },
                          { month: "Oct", value: 3200000 },
                          { month: "Nov", value: 2900000 },
                          { month: "Dec", value: 3500000 },
                          { month: "Jan", value: 3100000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card> */}

                  <Card>
                    <CardHeader>
                      <CardTitle>Category-wise Analysis</CardTitle>
                      <CardDescription>
                        Inventory quantities by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        // Get dynamic category data
                        const categoryData = getCategoryWiseAnalysis();

                        // If no real data, use sample data
                        const defaultData = [
                          {
                            name: "Raw Materials",
                            value: 150,
                            fill: "#3b82f6",
                          },
                          { name: "Consumables", value: 120, fill: "#10b981" },
                          {
                            name: "Tools & Equipment",
                            value: 80,
                            fill: "#f59e0b",
                          },
                          { name: "Safety Items", value: 45, fill: "#ef4444" },
                          { name: "Electrical", value: 35, fill: "#8b5cf6" },
                        ];

                        const displayData = categoryData;
                        const isRealData = categoryData.length > 0;

                        return (
                          <div className="space-y-4">
                            {/* Data status */}
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={displayData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {displayData.map((entry: any, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.fill}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value: any) => [
                                    `${value} items`,
                                    "Quantity",
                                  ]}
                                />
                              </PieChart>
                            </ResponsiveContainer>

                            <div className="grid grid-cols-2 gap-4">
                              {displayData.map((item: any) => (
                                <div
                                  key={item.name}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className="w-4 h-4 rounded-full flex-shrink-0 border border-gray-200"
                                    style={{ backgroundColor: item.fill }}
                                  ></div>
                                  <span className="text-sm font-medium">
                                    {item.name
                                      .replace(/_/g, " ")
                                      .toLowerCase()
                                      .replace(/\b\w/g, (char) =>
                                        char.toUpperCase()
                                      )}
                                    :{" "}
                                    <span className="font-normal">
                                      {item.value} items
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* <Card>
                <CardHeader>
                  <CardTitle>Inventory KPI Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        metric: "Stock Accuracy",
                        value: "98.5%",
                        trend: "+0.5%",
                        status: "positive",
                      },
                      {
                        metric: "Order Fill Rate",
                        value: "94.2%",
                        trend: "-1.2%",
                        status: "negative",
                      },
                      {
                        metric: "Inventory to Sales",
                        value: "2.4x",
                        trend: "0.0",
                        status: "neutral",
                      },
                      {
                        metric: "Storage Utilization",
                        value: "82%",
                        trend: "+5%",
                        status: "positive",
                      },
                    ].map((kpi) => (
                      <div key={kpi.metric} className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600">{kpi.metric}</p>
                        <div className="flex items-end gap-2 mt-1">
                          <span className="text-2xl font-semibold">
                            {kpi.value}
                          </span>
                          <span
                            className={`text-sm ${
                              kpi.status === "positive"
                                ? "text-green-600"
                                : kpi.status === "negative"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {kpi.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
              </div>
            )}
            {analyticsSubview === "spend" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Monthly Spend</h2>
                  <Button
                    variant="outline"
                    onClick={() => setAnalyticsSubview("main")}
                  >
                    Back to Analytics
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 text-lg">
                      Total spend this month:{" "}
                      <span className="font-bold">₹32,50,000</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      This is a 12% increase compared to last month. The chart
                      below shows the monthly spend trend.
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          { month: "Sep", value: 2800000 },
                          { month: "Oct", value: 3200000 },
                          { month: "Nov", value: 2900000 },
                          { month: "Dec", value: 3500000 },
                          { month: "Jan", value: 3100000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
            {analyticsSubview === "turnover" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Stock Turnover</h2>
                  <Button
                    variant="outline"
                    onClick={() => setAnalyticsSubview("main")}
                  >
                    Back to Analytics
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 text-lg">
                      Current stock turnover ratio:{" "}
                      <span className="font-bold">4.2x</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      This ratio represents how many times inventory is sold and
                      replaced over the last 30 days.
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={[
                          { month: "Sep", turnover: 3.8 },
                          { month: "Oct", turnover: 4.1 },
                          { month: "Nov", turnover: 4.0 },
                          { month: "Dec", turnover: 4.3 },
                          { month: "Jan", turnover: 4.2 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="turnover"
                          stroke="#6366f1"
                          name="Turnover Ratio"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
            {analyticsSubview === "deadStock" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Dead Stock</h2>
                  <Button
                    variant="outline"
                    onClick={() => setAnalyticsSubview("main")}
                  >
                    Back to Analytics
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6 space-y-8">
                    <div className="mb-2">
                      <div className="text-2xl font-bold mb-1">₹8,20,000</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Total value of dead stock (no movement {">"} 90 days)
                        across all locations.
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-semibold mb-2">
                          Breakdown by Item
                        </h3>
                        <table className="min-w-full text-sm border rounded-lg overflow-hidden mb-4">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Item</th>
                              <th className="p-2 text-left">Location</th>
                              <th className="p-2 text-left">Qty</th>
                              <th className="p-2 text-left">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                item: "Cement Bags",
                                location: "Warehouse B",
                                qty: 120,
                                value: 120000,
                                fill: "#3b82f6",
                              },
                              {
                                item: "Old Paint Stock",
                                location: "Yard 2",
                                qty: 40,
                                value: 40000,
                                fill: "#10b981",
                              },
                              {
                                item: "Obsolete Tools",
                                location: "Warehouse A",
                                qty: 15,
                                value: 15000,
                                fill: "#f59e0b",
                              },
                              {
                                item: "Expired Safety Helmets",
                                location: "Warehouse B",
                                qty: 30,
                                value: 30000,
                                fill: "#ef4444",
                              },
                              {
                                item: "Unused Steel Rods",
                                location: "Yard 1",
                                qty: 10,
                                value: 20000,
                                fill: "#6366f1",
                              },
                            ].map((row) => (
                              <tr key={row.item + row.location}>
                                <td className="p-2 flex items-center gap-2">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: row.fill }}
                                  ></span>
                                  {row.item}
                                </td>
                                <td className="p-2">{row.location}</td>
                                <td className="p-2">{row.qty}</td>
                                <td className="p-2">
                                  ₹{row.value.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Dead Stock Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Cement Bags",
                                  value: 120000,
                                  fill: "#3b82f6",
                                },
                                {
                                  name: "Old Paint Stock",
                                  value: 40000,
                                  fill: "#10b981",
                                },
                                {
                                  name: "Obsolete Tools",
                                  value: 15000,
                                  fill: "#f59e0b",
                                },
                                {
                                  name: "Expired Safety Helmets",
                                  value: 30000,
                                  fill: "#ef4444",
                                },
                                {
                                  name: "Unused Steel Rods",
                                  value: 20000,
                                  fill: "#6366f1",
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {[
                                { name: "Cement Bags", fill: "#3b82f6" },
                                { name: "Old Paint Stock", fill: "#10b981" },
                                { name: "Obsolete Tools", fill: "#f59e0b" },
                                {
                                  name: "Expired Safety Helmets",
                                  fill: "#ef4444",
                                },
                                { name: "Unused Steel Rods", fill: "#6366f1" },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {[
                            {
                              name: "Cement Bags",
                              value: "₹1.2L",
                              fill: "#3b82f6",
                            },
                            {
                              name: "Old Paint Stock",
                              value: "₹0.4L",
                              fill: "#10b981",
                            },
                            {
                              name: "Obsolete Tools",
                              value: "₹0.15L",
                              fill: "#f59e0b",
                            },
                            {
                              name: "Expired Safety Helmets",
                              value: "₹0.3L",
                              fill: "#ef4444",
                            },
                            {
                              name: "Unused Steel Rods",
                              value: "₹0.2L",
                              fill: "#6366f1",
                            },
                          ].map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.fill }}
                              ></div>
                              <span className="text-sm">
                                {item.name}: {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {analyticsSubview === "leadTime" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Average Lead Time</h2>
                  <Button
                    variant="outline"
                    onClick={() => setAnalyticsSubview("main")}
                  >
                    Back to Analytics
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 text-lg">
                      Current average lead time:{" "}
                      <span className="font-bold">12 days</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Lead time is the average duration from order placement to
                      delivery. The chart below shows the trend over recent
                      months.
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={[
                          { month: "Sep", lead: 14 },
                          { month: "Oct", lead: 13 },
                          { month: "Nov", lead: 12 },
                          { month: "Dec", lead: 11 },
                          { month: "Jan", lead: 12 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="lead"
                          stroke="#0ea5e9"
                          name="Lead Time (days)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
            {analyticsSubview === "suppliers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Total Suppliers</h2>
                  <Button
                    variant="outline"
                    onClick={() => setAnalyticsSubview("main")}
                  >
                    Back to Analytics
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Total active vendors/suppliers in the system.
                      </div>
                    </div>

                    {vendors.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold mb-2">Vendor Details</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-muted">
                                <th className="p-3 text-left">Vendor Name</th>
                                <th className="p-3 text-left">GSTIN</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Phone</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Location</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vendors.map((vendor, idx) => (
                                <tr
                                  key={vendor.id || idx}
                                  className="border-b hover:bg-muted/50"
                                >
                                  <td className="p-3 font-medium">
                                    {vendor.name || "N/A"}
                                  </td>
                                  <td className="p-3">
                                    {vendor.gstin ? (
                                      <span className="text-xs font-mono">
                                        {vendor.gstin}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        Not provided
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline">
                                      {vendor.vendorType || "COMPANY"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    {vendor.mobile || "N/A"}
                                  </td>
                                  <td className="p-3">
                                    {vendor.email || "N/A"}
                                  </td>
                                  <td className="p-3">
                                    {vendor.location ||
                                      (vendor.city && vendor.state
                                        ? `${vendor.city}, ${vendor.state}`
                                        : vendor.addressLine1
                                        ? vendor.addressLine1
                                        : "N/A")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No vendors found. Add vendors to see them here.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {analyticsSubview === "requests" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    Material Transfers & Requests
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setAnalyticsSubview("main")}
                  >
                    Back to Analytics
                  </Button>
                </div>

                {/* Material Requests Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Material Requests</CardTitle>
                    <CardDescription>
                      Recent material requests from sites
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {materialRequests.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold mb-2">Request Details</h3>

                        {/* Status Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"></div>
                        {materialRequests.slice(0, 10).map((request: any) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium">
                                {request.itemName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {request.quantity} | Site:{" "}
                                {request.siteName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant={
                                request.status === "Approved"
                                  ? "default"
                                  : request.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No material requests found.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          <TabsContent value="vehicle-tracking" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 justify-between items-center mr-4">
              {/* <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem
                    key={type.toLowerCase()}
                    value={type.toLowerCase()}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vehicleSite} onValueChange={setVehicleSite}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Project Site" />
              </SelectTrigger>
              <SelectContent>
                {projectSites.map((site) => (
                  <SelectItem
                    key={site.toLowerCase()}
                    value={site.toLowerCase()}
                  >
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vehicleStatus} onValueChange={setVehicleStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem
                    key={status.toLowerCase()}
                    value={status.toLowerCase()}
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
              <h1 className="text-2xl font-semibold ml-4">Vehicle Status</h1>
              <Button onClick={() => setShowAddVehicleModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Vehicle
              </Button>
              {/* <div className="ml-auto">
              <Badge variant="outline">
                RFID/GPS Sync:{" "}
                <span className="text-green-600 ml-1">Active</span>
              </Badge>
            </div> */}
            </div>
            {vehicleSubview === "main" && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard
                    title="Total Active Vehicles"
                    value={(
                      vehicleKpis?.vehiclesByStatus?.find(
                        (status: any) => status.status === "ACTIVE"
                      )?._count?._all || "0"
                    ).toString()}
                    icon={Truck}
                    description="Currently operational"
                    onClick={() => setVehicleSubview("active")}
                  />
                  <StatCard
                    title="Idle Vehicles"
                    value={
                      (vehicleKpis as any)?.vehiclesByStatus
                        ?.find((status: any) => status.status === "IDLE")
                        ?._count._all?.toString() || "0"
                    }
                    icon={PauseCircle}
                    description="Currently not in use"
                    onClick={() => setVehicleSubview("idle")}
                  />
                  <StatCard
                    title="Under Maintenance"
                    value={
                      (vehicleKpis as any)?.vehiclesByStatus
                        ?.find((status: any) => status.status === "MAINTENANCE")
                        ?._count._all?.toString() || "0"
                    }
                    icon={AlertTriangle}
                    description="Currently in workshop"
                    onClick={() => setVehicleSubview("maintenance")}
                  />
                </div>
                {/* All original vehicle tracking tab content below */}
                {/* Vehicle Movement Logs Table */}
                <VehicleMovementLogsTable
                  vehicleMovementLogs={vehicleMovementLogs}
                  userID={userID}
                  onRefresh={() =>
                    fetchVehicleData({
                      vehicleType,
                      assignedSite: vehicleSite,
                      status: vehicleStatus,
                    })
                  }
                />
                {/* Maintenance Schedule & History Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Maintenance Schedule & History</CardTitle>
                    </div>
                    {/* <Button
                    onClick={() => handleAddMaintenance('')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Maintenance
                  </Button> */}
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-2 text-left">Vehicle</th>
                            <th className="p-2 text-left">Last Serviced</th>
                            <th className="p-2 text-left">Next Due</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {maintenanceSchedules.map((row, idx) => (
                            <tr key={row.id || idx} className="border-b">
                              <td className="p-2">
                                {row.Vehicle?.vehicleName || "N/A"}
                              </td>
                              <td className="p-2">
                                {new Date(
                                  row.lastServiced
                                ).toLocaleDateString()}
                              </td>
                              <td className="p-2">
                                {new Date(row.nextDue).toLocaleDateString()}
                              </td>
                              <td className="p-2">
                                <Badge
                                  variant={
                                    row.status === "MAINTENANCE"
                                      ? "destructive"
                                      : row.status === "ACTIVE"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {row.status}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditMaintenance(row)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteMaintenance(row.id)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {maintenanceSchedules.length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                className="p-4 text-center text-muted-foreground"
                              >
                                No maintenance schedules found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {vehicleSubview === "active" && (
              <ActiveVehiclesView
                onBack={() => setVehicleSubview("main")}
                totalActiveCount={(vehicleKpis as any)?.totalVehicles || 0}
                userId={userID}
              />
            )}
            {vehicleSubview === "idle" && (
              <IdleVehiclesView
                onBack={() => setVehicleSubview("main")}
                totalIdleCount={
                  (vehicleKpis as any)?.vehiclesByStatus?.find(
                    (status: any) => status.status === "IDLE"
                  )?._count._all || 0
                }
                userId={userID}
              />
            )}
            {vehicleSubview === "maintenance" && (
              <MaintenanceVehiclesView
                onBack={() => setVehicleSubview("main")}
                totalMaintenanceCount={
                  (vehicleKpis as any)?.vehiclesByStatus?.find(
                    (status: any) => status.status === "MAINTENANCE"
                  )?._count._all || 0
                }
                userId={userID}
              />
            )}
            {vehicleSubview === "onSite" && (
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <CardTitle className="text-xl">Vehicles on Site</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setVehicleSubview("main")}
                  >
                    Back to Vehicle Tracking
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 pl-4">
                  <div className="mb-4 text-lg">
                    There are <span className="font-bold">12</span> vehicles
                    currently deployed at project sites.
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    See the list of vehicles and their assigned sites below.
                  </div>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2 pt-2">
                      <CardTitle className="text-base">
                        Site-wise Vehicle Deployment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0 pl-2 pr-2">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-2 text-left">Vehicle</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Site</th>
                            <th className="px-4 py-2 text-left">Utilization</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topVehicles.map((v, idx) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="px-4 py-2 font-medium">
                                {v.vehicle}
                              </td>
                              <td className="px-4 py-2">
                                <Badge variant="outline">
                                  {v.vehicle.includes("Truck")
                                    ? "Truck"
                                    : v.vehicle.includes("Excavator")
                                    ? "Excavator"
                                    : v.vehicle.includes("Crane")
                                    ? "Crane"
                                    : "Other"}
                                </Badge>
                              </td>
                              <td className="px-4 py-2">{v.site}</td>
                              <td className="px-4 py-2">
                                <Badge
                                  variant={
                                    v.utilization > 85
                                      ? "default"
                                      : v.utilization > 80
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {v.utilization}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
            {vehicleSubview === "maintenance" && (
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <CardTitle className="text-xl">Under Maintenance</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setVehicleSubview("main")}
                  >
                    Back to Vehicle Tracking
                  </Button>
                </CardHeader>
                <CardContent className="space-y-8 pl-4">
                  <div className="mb-4 text-lg">
                    There are <span className="font-bold">3</span> vehicles
                    currently under maintenance.
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    See the maintenance schedule and costliest recent repairs
                    below.
                  </div>
                  <Card className="bg-muted/50 mb-6">
                    <CardHeader className="pb-2 pt-2">
                      <CardTitle className="text-base">
                        Maintenance Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0 pl-2 pr-2">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-2 text-left">Vehicle</th>
                            <th className="px-4 py-2 text-left">
                              Last Serviced
                            </th>
                            <th className="px-4 py-2 text-left">Next Due</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {maintenanceSchedules.map((row, idx) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="px-4 py-2 font-medium">
                                {row.vehicle}
                              </td>
                              <td className="px-4 py-2">{row.last}</td>
                              <td className="px-4 py-2">{row.next}</td>
                              <td className="px-4 py-2">
                                <Badge
                                  variant={
                                    row.status === "Overdue"
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {row.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2 pt-2">
                      <CardTitle className="text-base">
                        Most Costly Recent Maintenance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0 pl-2 pr-2">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-2 text-left">Vehicle</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Cost</th>
                            <th className="px-4 py-2 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {costlyMaintenance.map((m, idx) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="px-4 py-2 font-medium">
                                {m.vehicle}
                              </td>
                              <td className="px-4 py-2">{m.date}</td>
                              <td className="px-4 py-2">
                                ₹{m.cost.toLocaleString()}
                              </td>
                              <td className="px-4 py-2">{m.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="store-staffs" className="space-y-6">
            <Card className="w-full">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 space-y-3 sm:space-y-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    Store Staff Management
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    Manage store personnel and responsibilities
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="w-full sm:w-auto sm:ml-auto"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="text-xs sm:text-sm">Add New Staff</span>
                </Button>
              </CardHeader>
              <CardContent>
                {/* Staff KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Total Staff"
                    value={getStaffKPIs().totalStaff}
                    icon={Users}
                    trend={null}
                    description={`${getStaffKPIs().onDutyStaff} on duty`}
                  />
                  <StatCard
                    title="On Duty"
                    value={getStaffKPIs().onDutyStaff}
                    icon={CheckCircle}
                    trend={null}
                    description={`${getStaffKPIs().offDutyStaff} off duty`}
                  />
                  <StatCard
                    title="Full-Time Staff"
                    value={getStaffKPIs().fullTimeStaff}
                    icon={Clock}
                    trend={null}
                    description={`${getStaffKPIs().partTimeStaff} part-time`}
                  />
                  <StatCard
                    title="Contract Staff"
                    value={getStaffKPIs().contractStaff}
                    icon={Users}
                    trend={null}
                    description={`${getStaffKPIs().onCallStaff} on-call`}
                  />
                </div>

                <div className="space-y-4">
                  {storeStaff.map((staff, index) => {
                    // Format certifications from backend string
                    const certifications = staff.certifications
                      ? staff.certifications
                          .split(", ")
                          .filter((cert) => cert.trim())
                      : [];

                    return (
                      <div
                        key={staff.id || index}
                        className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 w-full"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm sm:text-base">
                              {staff.fullName}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {staff.position
                                ?.replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                              {certifications.map((cert, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant={
                                staff.status === "ON_DUTY"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {staff.status === "ON_DUTY"
                                ? "On Duty"
                                : "Off Duty"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStaff(staff);
                                setIsViewStaffModalOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStaffToDelete(staff);
                                setIsDeleteStaffAlertOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                          <div>
                            Availability:{" "}
                            {staff.availabilityStatus
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <div>Experience: {staff.experienceYears} years</div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant={
                              staff.status === "ON_DUTY"
                                ? "destructive"
                                : "outline"
                            }
                            size="sm"
                            className="w-full"
                            onClick={async () => {
                              const token =
                                sessionStorage.getItem("jwt_token") ||
                                localStorage.getItem("jwt_token_backup");
                              const headers = token
                                ? { Authorization: `Bearer ${token}` }
                                : {};

                              try {
                                await axios.put(
                                  `${API_URL}/staff/store-staff/${staff.id}/activity-status`,
                                  {},
                                  { headers }
                                );

                                const newStatus =
                                  staff.status === "ON_DUTY"
                                    ? "Off Duty"
                                    : "On Duty";
                                toast2.success(`Status Updated`, {
                                  description: `${
                                    staff.fullName
                                  } is now ${newStatus.toLowerCase()}`,
                                });

                                // Refresh staff data to get updated status
                                fetchStoreStaffData();
                              } catch (error) {
                                console.error(
                                  "Error updating staff status:",
                                  error
                                );
                                toast({
                                  title: "Error",
                                  description: "Failed to update staff status",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            {staff.status === "ON_DUTY" ? "Relief" : "Schedule"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* All modals are already defined earlier in the file */}
        {/* Add Vehicle Modal */}
        {showAddVehicleModal && (
          <AddVehicleModal
            onClose={() => setShowAddVehicleModal(false)}
            onAdd={handleAddVehicle}
            onSuccess={fetchVehicleData}
          />
        )}

        {/* Maintenance Modal */}
        {showMaintenanceModal && (
          <MaintenanceModal
            onClose={() => setShowMaintenanceModal(false)}
            onSuccess={fetchVehicleData}
            maintenance={selectedMaintenance}
            mode={maintenanceModalMode}
            vehicleId={selectedVehicleForMaintenance}
          />
        )}

        {/* Schedule Maintenance Modal */}
        <Dialog
          open={isMaintenanceModalOpen}
          onOpenChange={setIsMaintenanceModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>
                Schedule maintenance for {selectedAsset?.vehicle}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleMaintenance} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceDate">Maintenance Date</Label>
                <Input
                  id="maintenanceDate"
                  name="maintenanceDate"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Maintenance Vendor</Label>
                <Select name="vendor" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mech-services">Mech Services</SelectItem>
                    <SelectItem value="crane-care">Crane Care</SelectItem>
                    <SelectItem value="equipment-pro">Equipment Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Maintenance Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Add any specific maintenance instructions or notes"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsMaintenanceModalOpen(false);
                    setSelectedAsset(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isAddStaffModalOpen}
          onOpenChange={setIsAddStaffModalOpen}
        >
          <DialogContent className="max-w-xl sm:max-w-2xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add New Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enter staff details to register a new store team member
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const token =
                  sessionStorage.getItem("jwt_token") ||
                  localStorage.getItem("jwt_token_backup");
                const headers = token
                  ? { Authorization: `Bearer ${token}` }
                  : {};

                // Get role value from state (backend expects enum values)
                const roleEnumMap: Record<string, string> = {
                  "store-manager": "STORE_MANAGER",
                  "assistant-manager": "ASSISTANT_MANAGER",
                  "inventory-clerk": "INVENTORY_CLERK",
                  "logistics-coordinator": "LOGISTICS_COORDINATOR",
                  "warehouse-staff": "WAREHOUSE_STAFF",
                  "material-specialist": "MATERIAL_SPECIALIST",
                  "inventory-analyst": "INVENTORY_ANALYST",
                  "quality-inspector": "QUALITY_INSPECTOR",
                };

                // Get availability value (backend expects enum values)
                const availabilityEnumMap: Record<string, string> = {
                  "full-time": "FULL_TIME",
                  "part-time": "PART_TIME",
                  contract: "CONTRACT",
                  seasonal: "SEASONAL",
                  "on-call": "ON_CALL",
                };

                // Get shift timing enum value
                const shiftEnumMap: Record<string, string> = {
                  morning: "MORNING",
                  day: "DAY",
                  evening: "EVENING",
                  night: "NIGHT",
                  flexible: "FLEXIBLE",
                };

                // Parse certifications
                const certifications = staffFormData.certifications
                  ? staffFormData.certifications
                      .split(",")
                      .map((cert) => cert.trim())
                  : [];

                // Create staff data for backend
                const staffData = {
                  fullName: staffFormData.fullName,
                  email: staffFormData.email,
                  contactNumber: staffFormData.contactNumber,
                  emergencyContact: staffFormData.emergencyContact || null,
                  address: staffFormData.address || "",
                  position:
                    roleEnumMap[staffFormData.role] || "WAREHOUSE_STAFF",
                  experienceYears: parseInt(staffFormData.experience) || 0,
                  availabilityStatus:
                    availabilityEnumMap[staffFormData.availability] ||
                    "FULL_TIME",
                  shiftTiming:
                    shiftEnumMap[staffFormData.shiftPreference] || "DAY",
                  joiningDate:
                    staffFormData.joiningDate ||
                    new Date().toISOString().split("T")[0],
                  status: "OFF_DUTY", // Initially off duty
                  certifications:
                    certifications.length > 0
                      ? certifications.join(", ")
                      : null,
                  areaOfSpecialization: staffFormData.specialization || null,
                  notes: staffFormData.notes || null,
                  createdById: userID,
                };

                try {
                  // Call backend API to create staff
                  await axios.post(`${API_URL}/staff/store-staff`, staffData, {
                    headers,
                  });

                  // Show success message
                  toast2.success("Staff Member Added Successfully", {
                    description: `${staffData.fullName} has been added to the staff`,
                  });

                  // Refresh staff data
                  fetchStoreStaffData();

                  // Reset form and close modal
                  resetStaffForm();
                  setIsAddStaffModalOpen(false);
                } catch (error) {
                  console.error("Error adding staff:", error);
                  toast({
                    title: "Error",
                    description: "Failed to add staff member",
                    variant: "destructive",
                  });
                }
              }}
              className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
            >
              {/* Staff Information Tab Panel */}
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="qualifications">
                    Qualifications
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-3 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="fullName"
                        className="text-xs flex items-center gap-1"
                      >
                        Full Name{" "}
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        required
                        className="h-8 text-sm"
                        value={staffFormData.fullName}
                        onChange={(e) =>
                          handleStaffFormChange("fullName", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="contactNumber"
                        className="text-xs flex items-center gap-1"
                      >
                        Contact <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        placeholder="+91 98765 43210"
                        required
                        className="h-8 text-sm"
                        value={staffFormData.contactNumber}
                        onChange={(e) =>
                          handleStaffFormChange("contactNumber", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="email"
                        className="text-xs flex items-center gap-1"
                      >
                        Email <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        required
                        className="h-8 text-sm"
                        value={staffFormData.email}
                        onChange={(e) =>
                          handleStaffFormChange("email", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="emergencyContact" className="text-xs">
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        placeholder="+91 98765 43210"
                        className="h-8 text-sm"
                        value={staffFormData.emergencyContact}
                        onChange={(e) =>
                          handleStaffFormChange(
                            "emergencyContact",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-xs">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Full address"
                      className="resize-none text-sm"
                      rows={2}
                      value={staffFormData.address}
                      onChange={(e) =>
                        handleStaffFormChange("address", e.target.value)
                      }
                    />
                  </div>
                </TabsContent>

                {/* Professional Information Tab */}
                <TabsContent value="professional" className="space-y-3 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="role"
                        className="text-xs flex items-center gap-1"
                      >
                        Position/Role{" "}
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Select
                        name="role"
                        required
                        value={staffFormData.role}
                        onValueChange={(value) =>
                          handleStaffFormChange("role", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="store-manager">
                            Store Manager
                          </SelectItem>
                          <SelectItem value="assistant-manager">
                            Assistant Manager
                          </SelectItem>
                          <SelectItem value="inventory-clerk">
                            Inventory Clerk
                          </SelectItem>
                          <SelectItem value="logistics-coordinator">
                            Logistics Coordinator
                          </SelectItem>
                          <SelectItem value="warehouse-staff">
                            Warehouse Staff
                          </SelectItem>
                          <SelectItem value="material-specialist">
                            Material Specialist
                          </SelectItem>
                          <SelectItem value="inventory-analyst">
                            Inventory Analyst
                          </SelectItem>
                          <SelectItem value="quality-inspector">
                            Quality Inspector
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="experience"
                        className="text-xs flex items-center gap-1"
                      >
                        Experience (Years){" "}
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="2"
                        required
                        className="h-8 text-sm"
                        value={staffFormData.experience}
                        onChange={(e) =>
                          handleStaffFormChange("experience", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="availability"
                        className="text-xs flex items-center gap-1"
                      >
                        Availability{" "}
                        <span className="text-red-500 text-xs">*</span>
                      </Label>
                      <Select
                        name="availability"
                        required
                        value={staffFormData.availability}
                        onValueChange={(value) =>
                          handleStaffFormChange("availability", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                          <SelectItem value="on-call">On-Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="shiftPreference" className="text-xs">
                        Shift Preference
                      </Label>
                      <Select
                        name="shiftPreference"
                        value={staffFormData.shiftPreference}
                        onValueChange={(value) =>
                          handleStaffFormChange("shiftPreference", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            Morning (6AM-2PM)
                          </SelectItem>
                          <SelectItem value="day">Day (9AM-5PM)</SelectItem>
                          <SelectItem value="evening">
                            Evening (2PM-10PM)
                          </SelectItem>
                          <SelectItem value="night">
                            Night (10PM-6AM)
                          </SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="joiningDate" className="text-xs">
                      Joining Date
                    </Label>
                    <Input
                      id="joiningDate"
                      name="joiningDate"
                      type="date"
                      className="h-8 text-sm"
                      value={staffFormData.joiningDate}
                      onChange={(e) =>
                        handleStaffFormChange("joiningDate", e.target.value)
                      }
                    />
                  </div>
                </TabsContent>

                {/* Qualifications Tab */}
                <TabsContent value="qualifications" className="space-y-3 mt-0">
                  <div className="space-y-1">
                    <Label htmlFor="certifications" className="text-xs">
                      Certifications & Licenses
                    </Label>
                    <Input
                      id="certifications"
                      name="certifications"
                      placeholder="SiteStock Management, Supply Chain, etc."
                      className="h-8 text-sm"
                      value={staffFormData.certifications}
                      onChange={(e) =>
                        handleStaffFormChange("certifications", e.target.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple certifications with commas
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="specialization" className="text-xs">
                      Area of Specialization
                    </Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      placeholder="Procurement, Inventory Control, etc."
                      className="h-8 text-sm"
                      value={staffFormData.specialization}
                      onChange={(e) =>
                        handleStaffFormChange("specialization", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notes" className="text-xs">
                      Notes & Special Considerations
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Additional information, special skills, etc."
                      rows={3}
                      className="resize-none text-sm"
                      value={staffFormData.notes}
                      onChange={(e) =>
                        handleStaffFormChange("notes", e.target.value)
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center pt-2 border-t">
                <p className="text-xs text-muted-foreground mr-auto">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetStaffForm();
                      setIsAddStaffModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Add Staff
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View/Edit Staff Modal */}
        <Dialog
          open={isViewStaffModalOpen}
          onOpenChange={setIsViewStaffModalOpen}
        >
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            hideCloseButton
          >
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {isEditingStaff
                    ? "Edit Staff Member"
                    : "Staff Member Details"}
                </div>
                <div className="flex gap-2">
                  {!isEditingStaff && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingStaff(true);
                        setEditStaffData({
                          fullName: selectedStaff?.fullName || "",
                          email: selectedStaff?.email || "",
                          contactNumber: selectedStaff?.contactNumber || "",
                          emergencyContact:
                            selectedStaff?.emergencyContact || "",
                          address: selectedStaff?.address || "",
                          role:
                            selectedStaff?.position
                              ?.toLowerCase()
                              .replace(/_/g, "-") || "",
                          experience:
                            selectedStaff?.experienceYears?.toString() || "",
                          availability:
                            selectedStaff?.availabilityStatus
                              ?.toLowerCase()
                              .replace(/_/g, "-") || "",
                          shiftPreference:
                            selectedStaff?.shiftTiming?.toLowerCase() || "",
                          joiningDate: selectedStaff?.joiningDate
                            ? new Date(selectedStaff.joiningDate)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          certifications: selectedStaff?.certifications || "",
                          specialization:
                            selectedStaff?.areaOfSpecialization || "",
                          notes: selectedStaff?.notes || "",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </DialogTitle>
              <DialogDescription>
                {isEditingStaff
                  ? "Modify staff member information"
                  : "View detailed information about the staff member"}
              </DialogDescription>
            </DialogHeader>

            {selectedStaff && (
              <div className="space-y-6">
                {!isEditingStaff ? (
                  // View Mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Personal Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Full Name
                          </Label>
                          <p className="text-sm">{selectedStaff.fullName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Email
                          </Label>
                          <p className="text-sm">{selectedStaff.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Contact Number
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.contactNumber}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Emergency Contact
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.emergencyContact || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Address
                          </Label>
                          <p className="text-sm">{selectedStaff.address}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Professional Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Position
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.position
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Experience
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.experienceYears} years
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Availability Status
                          </Label>
                          <Badge variant="outline">
                            {selectedStaff.availabilityStatus
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Shift Timing
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.shiftTiming?.replace(/\b\w/g, (l) =>
                              l.toUpperCase()
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Joining Date
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.joiningDate
                              ? new Date(
                                  selectedStaff.joiningDate
                                ).toLocaleDateString()
                              : "Not provided"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Current Status
                          </Label>
                          <Badge
                            variant={
                              selectedStaff.status === "ON_DUTY"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {selectedStaff.status === "ON_DUTY"
                              ? "On Duty"
                              : "Off Duty"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Qualifications & Additional Info */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Qualifications & Additional Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Certifications
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.certifications ||
                              "No certifications listed"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Area of Specialization
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.areaOfSpecialization ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Notes
                          </Label>
                          <p className="text-sm">
                            {selectedStaff.notes || "No additional notes"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Added On
                          </Label>
                          <p className="text-sm">
                            {new Date(
                              selectedStaff.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // Edit Mode
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditStaff();
                    }}
                    className="space-y-4"
                  >
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="professional">
                          Professional
                        </TabsTrigger>
                        <TabsTrigger value="qualifications">
                          Qualifications
                        </TabsTrigger>
                      </TabsList>

                      {/* Personal Information Tab */}
                      <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editFullName">Full Name *</Label>
                            <Input
                              id="editFullName"
                              value={editStaffData.fullName || ""}
                              onChange={(e) =>
                                handleEditStaffFormChange(
                                  "fullName",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editContactNumber">
                              Contact Number *
                            </Label>
                            <Input
                              id="editContactNumber"
                              value={editStaffData.contactNumber || ""}
                              onChange={(e) =>
                                handleEditStaffFormChange(
                                  "contactNumber",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editEmail">Email *</Label>
                            <Input
                              id="editEmail"
                              type="email"
                              value={editStaffData.email || ""}
                              onChange={(e) =>
                                handleEditStaffFormChange(
                                  "email",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editEmergencyContact">
                              Emergency Contact
                            </Label>
                            <Input
                              id="editEmergencyContact"
                              value={editStaffData.emergencyContact || ""}
                              onChange={(e) =>
                                handleEditStaffFormChange(
                                  "emergencyContact",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editAddress">Address</Label>
                          <Textarea
                            id="editAddress"
                            value={editStaffData.address || ""}
                            onChange={(e) =>
                              handleEditStaffFormChange(
                                "address",
                                e.target.value
                              )
                            }
                            rows={2}
                          />
                        </div>
                      </TabsContent>

                      {/* Professional Information Tab */}
                      <TabsContent value="professional" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editRole">Position/Role *</Label>
                            <Select
                              value={editStaffData.role || ""}
                              onValueChange={(value) =>
                                handleEditStaffFormChange("role", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="store-manager">
                                  Store Manager
                                </SelectItem>
                                <SelectItem value="assistant-manager">
                                  Assistant Manager
                                </SelectItem>
                                <SelectItem value="inventory-clerk">
                                  Inventory Clerk
                                </SelectItem>
                                <SelectItem value="logistics-coordinator">
                                  Logistics Coordinator
                                </SelectItem>
                                <SelectItem value="warehouse-staff">
                                  Warehouse Staff
                                </SelectItem>
                                <SelectItem value="material-specialist">
                                  Material Specialist
                                </SelectItem>
                                <SelectItem value="inventory-analyst">
                                  Inventory Analyst
                                </SelectItem>
                                <SelectItem value="quality-inspector">
                                  Quality Inspector
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editExperience">
                              Experience (Years) *
                            </Label>
                            <Input
                              id="editExperience"
                              type="number"
                              min="0"
                              step="0.5"
                              value={editStaffData.experience || ""}
                              onChange={(e) =>
                                handleEditStaffFormChange(
                                  "experience",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editAvailability">
                              Availability *
                            </Label>
                            <Select
                              value={editStaffData.availability || ""}
                              onValueChange={(value) =>
                                handleEditStaffFormChange("availability", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select availability" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-time">
                                  Full-time
                                </SelectItem>
                                <SelectItem value="part-time">
                                  Part-time
                                </SelectItem>
                                <SelectItem value="contract">
                                  Contract
                                </SelectItem>
                                <SelectItem value="seasonal">
                                  Seasonal
                                </SelectItem>
                                <SelectItem value="on-call">On-Call</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editShiftPreference">
                              Shift Preference
                            </Label>
                            <Select
                              value={editStaffData.shiftPreference || ""}
                              onValueChange={(value) =>
                                handleEditStaffFormChange(
                                  "shiftPreference",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select shift" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">
                                  Morning (6AM-2PM)
                                </SelectItem>
                                <SelectItem value="day">
                                  Day (9AM-5PM)
                                </SelectItem>
                                <SelectItem value="evening">
                                  Evening (2PM-10PM)
                                </SelectItem>
                                <SelectItem value="night">
                                  Night (10PM-6AM)
                                </SelectItem>
                                <SelectItem value="flexible">
                                  Flexible
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editJoiningDate">Joining Date</Label>
                          <Input
                            id="editJoiningDate"
                            type="date"
                            value={editStaffData.joiningDate || ""}
                            onChange={(e) =>
                              handleEditStaffFormChange(
                                "joiningDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </TabsContent>

                      {/* Qualifications Tab */}
                      <TabsContent value="qualifications" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="editCertifications">
                            Certifications & Licenses
                          </Label>
                          <Input
                            id="editCertifications"
                            value={editStaffData.certifications || ""}
                            onChange={(e) =>
                              handleEditStaffFormChange(
                                "certifications",
                                e.target.value
                              )
                            }
                            placeholder="Separate multiple certifications with commas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editSpecialization">
                            Area of Specialization
                          </Label>
                          <Input
                            id="editSpecialization"
                            value={editStaffData.specialization || ""}
                            onChange={(e) =>
                              handleEditStaffFormChange(
                                "specialization",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Procurement, Inventory Control"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editNotes">
                            Notes & Special Considerations
                          </Label>
                          <Textarea
                            id="editNotes"
                            value={editStaffData.notes || ""}
                            onChange={(e) =>
                              handleEditStaffFormChange("notes", e.target.value)
                            }
                            rows={3}
                            placeholder="Additional information, special skills, etc."
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingStaff(false);
                          setEditStaffData({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                )}

                {!isEditingStaff && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewStaffModalOpen(false);
                        setSelectedStaff(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Staff Confirmation Alert */}
        <AlertDialog
          open={isDeleteStaffAlertOpen}
          onOpenChange={setIsDeleteStaffAlertOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{staffToDelete?.fullName}</strong> from the staff list?
                This action cannot be undone and will permanently remove all
                their information.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteStaffAlertOpen(false);
                  setStaffToDelete(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStaff}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Staff
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
const StoreDashboard = () => {
  return (
    <PageUserFilterProvider allowedRoles={["store"]}>
      <StoreDashboardContent />
    </PageUserFilterProvider>
  );
};

export default StoreDashboard;
