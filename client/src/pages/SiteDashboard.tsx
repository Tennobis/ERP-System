import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpandableDataTable } from "@/components/expandable-data-table";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import type { InventoryItem as InventoryItemType } from "@/types/dummy-data-types";
import { ServiceInvoiceList } from "@/components/service-invoice/ServiceInvoiceList";
import { ServiceInvoice } from "@/types/service-invoice";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import {
    HardHat,
    Calendar,
    Package,
    AlertTriangle,
    Upload,
    FileText,
    Plus,
    Edit,
    DollarSign,
    Warehouse,
    Clock,
    Users,
    Truck,
    CheckCircle2,
    Banknote,
    Receipt,
    Building2,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Trash2,
    Pencil,
    BarChart3,
    TrendingUp,
    Download,
} from "lucide-react";
import { issuesData } from "@/lib/dummy-data";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { useUserFilter } from "@/contexts/UserFilterContext";
import InvoiceBuilderModal from "@/components/modals/InvoiceBuilderModal";
import { downloadDPRPDF } from "@/utils/dpr-pdf-generator";
import { downloadWPRPDF } from "@/utils/wpr-pdf-generator";

const API_URL =
    import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface StockAlert {
    id: number;
    item: string;
    quantity: string;
    reorderPoint: string;
    status: string;
}

interface MaterialMovement {
    id: number;
    type: "Inbound" | "Outbound";
    material: string;
    quantity: string;
    time: string;
    site: string;
}

interface StorageSection {
    id: number;
    zone: string;
    occupancy: number;
    type: string;
}
interface StockAlert {
    id: number;
    item: string;
    quantity: string;
    reorderPoint: string;
    status: string;
}

interface MaterialMovement {
    id: number;
    type: "Inbound" | "Outbound";
    material: string;
    quantity: string;
    time: string;
    site: string;
}

interface InventoryItem {
    maximumStock: number;
    itemQuality: string;
    id: string;
    name: string;
    category: string | string[];
    quantity: number;
    unit: string;
    location: string;
    lastUpdated: string;
    safetyStock?: number;
    maxStock?: number;
    safetyStock?: number;
    unitCost?: number;
}
interface StorageSection {
    id: number;
    zone: string;
    occupancy: number;
    type: string;
}

// Add backend state
// const [progressData, setProgressData] = useState([]);
// const [materialUsageData, setMaterialUsageData] = useState([]);
// const [costData, setCostData] = useState([]);
// const [laborData, setLaborData] = useState([]);
// const [purchaseOrders, setPurchaseOrders] = useState([]);
// const [equipment, setEquipment] = useState([]);

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Project {
    clientId: any;
    id: string;
    name: string;
}

// Cost Data
// const costData = [
//   { category: "Productive Labor", planned: 175000, actual: 190000 },
//   { category: "Non-Productive Labor", planned: 75000, actual: 85000 },
//   { category: "Materials", planned: 450000, actual: 425000 },
//   { category: "Equipment", planned: 180000, actual: 195000 },
//   { category: "Overhead", planned: 120000, actual: 115000 },
// ];

// const laborData = [
//   // Productive Labor
//   { trade: "Electricians", planned: 450, actual: 420, type: "productive" },
//   { trade: "Plumbers", planned: 380, actual: 400, type: "productive" },
//   { trade: "Carpenters", planned: 520, actual: 480, type: "productive" },
//   { trade: "Masons", planned: 600, actual: 580, type: "productive" },
//   // Non-Productive Labor
//   { trade: "Site Supervision", planned: 200, actual: 210, type: "non-productive" },
//   { trade: "Safety Officers", planned: 160, actual: 170, type: "non-productive" },
//   { trade: "Material Handlers", planned: 240, actual: 250, type: "non-productive" },
//   { trade: "Quality Control", planned: 180, actual: 190, type: "non-productive" },
// ];

const purchaseOrdersData = [
    {
        id: "PO-2024-001",
        vendor: "Steel Corp Ltd",
        amount: 125000,
        status: "Pending",
        approver: "Bob Smith",
        timeInQueue: "48hrs",
    },
    {
        id: "PO-2024-002",
        vendor: "Cement Industries",
        amount: 85000,
        status: "Approved",
        approver: "Alice Johnson",
        timeInQueue: "24hrs",
    },
    {
        id: "PO-2024-003",
        vendor: "Hardware Solutions",
        amount: 35000,
        status: "In Review",
        approver: "Charlie Brown",
        timeInQueue: "12hrs",
    },
    {
        id: "PO-2024-004",
        vendor: "Equipment Rentals",
        amount: 75000,
        status: "Escalated",
        approver: "David Wilson",
        timeInQueue: "72hrs",
    },
];

const equipmentData = [
    {
        id: "EQ-001",
        name: "Generator Set",
        hours: 250,
        nextService: "50hrs",
        status: "Active",
    },
    {
        id: "EQ-002",
        name: "Scissor Lift",
        hours: 180,
        nextService: "20hrs",
        status: "Maintenance Due",
    },
    {
        id: "EQ-003",
        name: "Concrete Mixer",
        hours: 420,
        nextService: "Due Now",
        status: "Warning",
    },
    {
        id: "EQ-004",
        name: "Tower Crane",
        hours: 150,
        nextService: "100hrs",
        status: "Active",
    },
];

type PurchaseOrder = (typeof purchaseOrdersData)[0];
type Equipment = (typeof equipmentData)[0];

const purchaseOrderColumns: ColumnDef<PurchaseOrder>[] = [
    {
        accessorKey: "id",
        header: "PO Number",
    },
    {
        accessorKey: "vendor",
        header: "Vendor",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number;
            return `₹${amount.toLocaleString()}`;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variant =
                status === "Approved"
                    ? "default"
                    : status === "Pending"
                        ? "secondary"
                        : status === "Escalated"
                            ? "destructive"
                            : "outline";
            return <Badge variant={variant}>{status}</Badge>;
        },
    },
    {
        accessorKey: "approver",
        header: "Next Approver",
    },
    {
        accessorKey: "timeInQueue",
        header: "Time in Queue",
    },
];

const equipmentColumns: ColumnDef<Equipment>[] = [
    {
        accessorKey: "id",
        header: "Equipment ID",
    },
    {
        accessorKey: "name",
        header: "Equipment Name",
    },
    {
        accessorKey: "hours",
        header: "Hours Used",
    },
    {
        accessorKey: "nextService",
        header: "Next Service",
        cell: ({ row }) => {
            const nextService = row.getValue("nextService") as string;
            return (
                <Badge variant={nextService === "Due Now" ? "destructive" : "outline"}>
                    {nextService}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variant =
                status === "Active"
                    ? "default"
                    : status === "Warning"
                        ? "destructive"
                        : "secondary";
            return <Badge variant={variant}>{status}</Badge>;
        },
    },
];

type Task = {
    projectName: string;
    id: string;
    name: string;
    projectId: string;
    assignedToId?: string;
    assignedTo?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    status: string;
    project?: Project;
};

type Issue = (typeof issuesData)[0] & {
    escalated?: boolean;
    location?: string;
    impact?: string;
};

const taskColumns: ColumnDef<Task>[] = [
    {
        accessorKey: "name",
        header: "Task Name",
    },
    {
        accessorKey: "projectName",
        header: "Project",
    },
    {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => {
            const assignedTo = row.getValue("assignedTo") as string;
            return assignedTo || "Unassigned";
        },
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variant =
                status === "completed"
                    ? "default"
                    : status === "in_progress"
                        ? "secondary"
                        : "outline";

            // Format status for display
            const displayStatus =
                status === "in_progress"
                    ? "In Progress"
                    : status.charAt(0).toUpperCase() + status.slice(1);

            return <Badge variant={variant}>{displayStatus}</Badge>;
        },
    },
];

const issueColumns: ColumnDef<Issue>[] = [
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return <Badge variant="outline">{type}</Badge>;
        },
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "reportedBy",
        header: "Reported By",
    },
    {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => {
            const severity = row.getValue("severity") as string;
            const variant =
                severity === "High"
                    ? "destructive"
                    : severity === "Medium"
                        ? "default"
                        : "secondary";
            return <Badge variant={variant}>{severity}</Badge>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variant =
                status === "Resolved"
                    ? "default"
                    : status === "In Progress"
                        ? "secondary"
                        : "outline";
            return <Badge variant={variant}>{status}</Badge>;
        },
    },
];

// Add subview state and selected task state
const SiteDashboardContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Modal states
    const [isDPRModalOpen, setIsDPRModalOpen] = useState(false);
    const [isWPRModalOpen, setIsWPRModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isMaterialRequestModalOpen, setIsMaterialRequestModalOpen] =
        useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
    const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
    const [isLaborDetailsModalOpen, setIsLaborDetailsModalOpen] = useState(false);
    const [selectedLabor, setSelectedLabor] = useState<
        (typeof laborHours)[0] | null
    >(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isBudgetAdjustModalOpen, setIsBudgetAdjustModalOpen] = useState(false);
    const [selectedBudgetCategory, setSelectedBudgetCategory] = useState("");
    const [isPOViewModalOpen, setIsPOViewModalOpen] = useState(false);
    const [isPOApproveModalOpen, setIsPOApproveModalOpen] = useState(false);
    const [isPOExpediteModalOpen, setIsPOExpediteModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isEquipmentLogsModalOpen, setIsEquipmentLogsModalOpen] =
        useState(false);
    const [isEquipmentTrackingModalOpen, setIsEquipmentTrackingModalOpen] =
        useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<
        (typeof equipmentList)[0] | null
    >(null);
    const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<{
        type: string;
        date: string;
        weather?: string;
        photos?: number;
        // DPR fields
        workDone?: string;
        manpower?: string;
        manpowerRoles?: string;
        equipmentUsed?: string;
        safetyIncident?: string;
        qualityCheck?: string;
        delayIssue?: string;
        workSections?: string;
        materials?: string;
        subcontractor?: string;
        // Database DPR fields
        dprNo?: string;
        projectName?: string;
        developer?: string;
        contractor?: string;
        pmc?: string;
        majorHindrances?: string;
        actionTaken?: string;
        workItems?: any[];
        resources?: any[];
        remarks?: any[];
        // WPR fields
        weekStart?: string;
        weekEnding?: string;
        actualProgress?: string;
        plannedProgress?: string;
        milestones?: string;
        progressRemarks?: string;
        issues?: string;
        risks?: string;
        safetySummary?: string;
        qualitySummary?: string;
        equipment?: string;
        teamPerformance?: string;
        // Common
        notes?: string;
        createdAt?: string;
        id?: string;
    } | null>(null);
    const [isViewIssueModalOpen, setIsViewIssueModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [selectedEditTask, setSelectedEditTask] = useState<Task | null>(null);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);

    const [selectedDeleteTask, setSelectedDeleteTask] = useState<Task | null>(
        null
    );
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [serviceInvoices, setServiceInvoices] = useState<ServiceInvoice[]>([]);
    // const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const { user } = useUser();
    const {
        targetUserId,
        selectedUser,
        currentUser,
        selectedUserId,
        setSelectedUserId,
        isAdminUser,
    } = useUserFilter();
    const userID = targetUserId || user?.id || "";

    // Function to get current tab from URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes("/invoices")) return "invoices";
        if (path.includes("/timeline")) return "timeline";
        if (path.includes("/reports")) return "reports";
        if (path.includes('/central-warehouse')) return "central-warehouse";
        return "timeline"; // default tab
    };

    // Handle tab changes
    const handleTabChange = (value: string) => {
        const tabRoutes: Record<string, string> = {
            timeline: "/site-manager/timeline",
            reports: "/site-manager/reports",
            "central-warehouse": "/site-manager/central-warehouse",
            invoices: "/site-manager/invoices",
        };

        // Only navigate if the tab has a route, otherwise it's a local tab
        if (tabRoutes[value]) {
            navigate(tabRoutes[value]);
        }
    };

    // Service Invoice handlers
    const fetchServiceInvoices = async () => {
        try {
            const token = localStorage.getItem("jwt_token") || sessionStorage.getItem("jwt_token");
            const response = await axios.get(`${API_URL}/client-bills`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const mappedInvoices: ServiceInvoice[] = response.data.map((bill: any) => ({
                id: bill.id,
                header: {
                    invoiceNumber: bill.invoiceNo,
                    invoiceDate: bill.invoiceDate,
                    state: bill.billingPartyState,
                    stateCode: bill.billingPartyStateCode,
                    workOrderDate: bill.workOrderDate,
                    raBillNumber: bill.raBillNo,
                    uniqueIdentifier: bill.id
                },
                receiver: {
                    name: bill.billingPartyName,
                    address: bill.billingPartyAddress,
                    gstin: bill.billingPartyGSTIN,
                    state: bill.billingPartyState,
                    stateCode: bill.billingPartyStateCode
                },
                project: {
                    serviceRenderedAt: bill.projectLocation,
                    name: bill.projectName || "Unknown Project",
                    address: bill.providerAddress,
                    gstin: bill.providerGSTIN,
                    state: bill.providerState,
                    stateCode: bill.providerStateCode
                },
                lineItems: bill.categories.flatMap((cat: any) =>
                    cat.lineItems.map((item: any) => ({
                        siNo: item.slNo.toString(),
                        description: item.description,
                        sacHsnCode: item.sacHsnCode,
                        unit: item.unit,
                        rate: parseFloat(item.unitRate),
                        quantityPrevious: parseFloat(item.previousQuantity),
                        quantityPresent: parseFloat(item.presentQuantity),
                        quantityCumulative: parseFloat(item.cumulativeQuantity),
                        amountPrevious: parseFloat(item.previousAmount),
                        amountPresent: parseFloat(item.presentAmount),
                        amountCumulative: parseFloat(item.cumulativeAmount),
                        category: cat.categoryName
                    }))
                ),
                summary: {
                    taxableValuePrevious: 0,
                    taxableValuePresent: 0,
                    taxableValueCumulative: parseFloat(bill.totalAmount || 0),
                    deductionRate: parseFloat(bill.tdsPercentage || 0) / 100,
                    deductionAmountPrevious: 0,
                    deductionAmountPresent: 0,
                    deductionAmountCumulative: parseFloat(bill.tdsAmount || 0),
                    totalAmountPrevious: 0,
                    totalAmountPresent: 0,
                    totalAmountCumulative: parseFloat(bill.netBillAmount || 0),
                    payableAmountRoundedPrevious: 0,
                    payableAmountRoundedPresent: 0,
                    payableAmountRoundedCumulative: Math.round(parseFloat(bill.netBillAmount || 0))
                },
                status: bill.status === 'DRAFT' ? 'pending' : bill.status.toLowerCase(),
                createdAt: bill.createdAt,
                updatedAt: bill.updatedAt
            }));

            setServiceInvoices(mappedInvoices);
        } catch (error) {
            console.error("Error fetching service invoices:", error);
            toast.error("Failed to fetch service invoices");
        }
    };

    useEffect(() => {
        fetchServiceInvoices();
    }, []);

    const handleServiceInvoiceCreate = (invoice: ServiceInvoice) => {
        fetchServiceInvoices();
        toast.success("Service invoice created successfully");
    };

    const handleServiceInvoiceUpdate = (updatedInvoice: ServiceInvoice) => {
        fetchServiceInvoices();
        toast.success("Service invoice updated successfully");
    };

    // Progress Reports Data
    const [dprs, setDprs] = useState<any[]>([]);
    const [wprs, setWprs] = useState<any[]>([]);
    const [reportsStats, setReportsStats] = useState({
        dprsSubmitted: 0,
        wprsCompleted: 0,
        averageScore: "0/5",
    });

    const categoryOptions = useMemo(() => {
        const set = new Set<string>();
        for (const it of inventoryItems) {
            if (Array.isArray(it.category)) it.category.forEach((c) => set.add(String(c)));
            else if (it.category) set.add(String(it.category));
        }
        return Array.from(set);
    }, [inventoryItems]);

    const locationOptions = useMemo(() => {
        const set = new Set<string>();
        for (const it of inventoryItems) if (it.location) set.add(it.location);
        return Array.from(set);
    }, [inventoryItems]);

    // Fetch users and projects on component mount
    // useEffect(() => {
    //   fetchUsers();
    //   fetchProjects();
    //   if (user?.role === 'admin' || 'md') {
    //     fetchAllUsers();
    //   }
    // }, [user]);

    // Fetch data when user or selectedUserId changes
    useEffect(() => {
        if (userID) {
            fetchUsers();
            // fetchUsers();
            fetchProjects();
            fetchAllUsers();
            fetchProgressReports();
            fetchTasks();
            // fetchInventoryItems();
            fetchWarehouseItems();
        }
    }, [userID]);

    // Reset selectedUserId when user is not admin
    // useEffect(() => {
    //   if (user?.role !== "admin" || "md") {
    //     setSelectedUserId("");
    //   }
    // }, [user]);

    const fetchUsers = async () => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await fetch(`${API_URL}/users`, { headers });
            if (response.ok) {
                const allUsers = await response.json();
                // Filter users except ones whose roles are "user"
                const filteredUsers = allUsers.filter(
                    (user: User) => user.role !== "user"
                );
                setUsers(allUsers);
                console.log(allUsers);
            } else {
                console.error("Failed to fetch users:", response.status);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
    };

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
                // console.log(data)
            } else {
                console.error("Failed to fetch all users:", response.status);
                setAllUsers([]);
            }
        } catch (error) {
            console.error("Error fetching all users:", error);
            setAllUsers([]);
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
                // console.log(projectsData)
            } else {
                console.error("Failed to fetch projects:", response.status);
                setProjects([]);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            setProjects([]);
        }
    };

    const fetchWarehouseItems = async () => {
        try {
            setIsLoading(true);
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(
                `${API_URL}/warehouse`,
                { headers }
            );
            setInventoryItems(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching inventory items:", error);
            setInventoryItems([]);
        } finally {
            setIsLoading(false);
        }
    };
    // const fetchInventoryItems = async () => {
    //   try {
    //     setIsInventoryLoading(true);
    //     const token =
    //       sessionStorage.getItem("jwt_token") ||
    //       localStorage.getItem("jwt_token_backup");
    //     const headers = token ? { Authorization: `Bearer ${token}` } : {};

    //     const response = await axios.get(
    //       `${API_URL}/inventory/items?userId=${userID}`,
    //       { headers }
    //     );
    //     setAllInventoryItems(Array.isArray(response.data) ? response.data : []);
    //   } catch (error) {
    //     console.error("Error fetching inventory items:", error);
    //     setAllInventoryItems([]);
    //   } finally {
    //     setIsInventoryLoading(false);
    //   }
    // };


    const [storeStaff, setStoreStaff] = useState([
        {
            name: "John Doe",
            role: "Store Manager",
            status: "On Duty",
            availability: "Full-time",
            experience: "5 years",
            certifications: ["SiteStock Management", "Supply Chain"],
        },
        {
            name: "Jane Smith",
            role: "Assistant Manager",
            status: "On Duty",
            availability: "Full-time",
            experience: "3 years",
            certifications: ["Material Handling", "RFID Systems"],
        },
        {
            name: "Mike Johnson",
            role: "Inventory Clerk",
            status: "Off Duty",
            availability: "Part-time",
            experience: "2 years",
            certifications: ["Basic Inventory"],
        },
    ]);
    const [issues, setIssues] = useState(
        issuesData.map((issue, index) => ({
            ...issue,
            location:
                index === 0
                    ? "North Block, Level 2"
                    : index === 1
                        ? "South Tower Foundation"
                        : "Main Building, East Wing",
            impact:
                index === 0
                    ? "High - Work Stoppage"
                    : index === 1
                        ? "Medium - Quality Concern"
                        : "Low - Schedule Impact",
        }))
    );
    const [equipmentLogs, setEquipmentLogs] = useState([
        {
            date: "2024-01-20",
            type: "Maintenance",
            hours: 8,
            operator: "John Smith",
            notes: "Routine service completed",
        },
        {
            date: "2024-01-18",
            type: "Operation",
            hours: 12,
            operator: "Mike Johnson",
            notes: "Used for foundation work",
        },
        {
            date: "2024-01-15",
            type: "Repair",
            hours: 4,
            operator: "Tech Team",
            notes: "Fixed hydraulic leak",
        },
        {
            date: "2024-01-12",
            type: "Operation",
            hours: 10,
            operator: "Mike Johnson",
            notes: "Site clearing work",
        },
    ]);
    const [equipmentLocations, setEquipmentLocations] = useState([
        {
            timestamp: "09:00 AM",
            area: "North Block",
            status: "Active",
            operator: "John Smith",
        },
        {
            timestamp: "10:30 AM",
            area: "Storage Yard",
            status: "Maintenance",
            operator: "Tech Team",
        },
        {
            timestamp: "12:00 PM",
            area: "South Block",
            status: "Active",
            operator: "Mike Johnson",
        },
        {
            timestamp: "02:30 PM",
            area: "Material Yard",
            status: "Idle",
            operator: "John Smith",
        },
    ]);
    const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([
        {
            id: 1,
            item: "Cement",
            quantity: "50 bags",
            reorderPoint: "100 bags",
            status: "Low Stock",
        },
        {
            id: 2,
            item: "Steel Bars (12mm)",
            quantity: "2.5 tons",
            reorderPoint: "5 tons",
            status: "Low Stock",
        },
        {
            id: 3,
            item: "Bricks",
            quantity: "850 pcs",
            reorderPoint: "1000 pcs",
            status: "Reorder",
        },
    ]);

    const [materialMovements, setMaterialMovements] = useState<
        MaterialMovement[]
    >([
        {
            id: 1,
            type: "Outbound",
            material: "Ready Mix Concrete",
            quantity: "18 mÂ³",
            time: "2 hours ago",
            site: "Block A",
        },
        {
            id: 2,
            type: "Inbound",
            material: "Steel Reinforcement",
            quantity: "5 tons",
            time: "5 hours ago",
            site: "Central Store",
        },
        {
            id: 3,
            type: "Outbound",
            material: "Shuttering Plates",
            quantity: "45 pcs",
            time: "8 hours ago",
            site: "Block B",
        },
    ]);

    const [storageSections, setStorageSections] = useState<StorageSection[]>([
        { id: 1, zone: "Zone A", occupancy: 85, type: "Heavy Materials" },
        { id: 2, zone: "Zone B", occupancy: 65, type: "Finishing Items" },
        { id: 3, zone: "Zone C", occupancy: 92, type: "Tools & Equipment" },
        { id: 4, zone: "Zone D", occupancy: 45, type: "Electrical & Plumbing" },
    ]);

    // Data states
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [laborHours, setLaborHours] = useState([]);
    const [budget, setBudget] = useState([]);
    const [costData, setCostData] = useState([]); // <-- Add this line
    const [tasks, setTasks] = useState<Task[]>([]);
    // Updated progress stats to track task counts
    const [progressStats, setProgressStats] = useState({
        pendingTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        onSchedule: 85,
        resourceUtilization: 92,
    });
    const [weeklyProgress, setWeeklyProgress] = useState([]);
    const [projectPhases, setProjectPhases] = useState([
        {
            phase: "Foundation",
            progress: 100,
            start: "2024-01-01",
            end: "2024-01-15",
        },
        {
            phase: "Structure",
            progress: 75,
            start: "2024-01-16",
            end: "2024-02-15",
        },
        { phase: "Roofing", progress: 45, start: "2024-02-01", end: "2024-02-28" },
        { phase: "Finishing", progress: 0, start: "2024-02-20", end: "2024-03-20" },
    ]);

    // Progress Update Modal state
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Add these new state variables after the other useState declarations
    const [materialRequests, setMaterialRequests] = useState([
        {
            id: "REQ001",
            item: "Steel TMT Bars",
            quantity: "500 kg",
            status: "Approved",
            requestDate: "2024-01-18",
            expectedDelivery: "2024-01-22",
        },
        {
            id: "REQ002",
            item: "Cement Bags",
            quantity: "100 bags",
            status: "Pending",
            requestDate: "2024-01-19",
            expectedDelivery: "2024-01-23",
        },
        {
            id: "REQ003",
            item: "Electrical Cables",
            quantity: "200 m",
            status: "In Transit",
            requestDate: "2024-01-17",
            expectedDelivery: "2024-01-21",
        },
    ]);
    const [materialStats, setMaterialStats] = useState({
        pendingRequests: 8,
        receivedToday: 12,
        utilizationRate: 94,
    });
    const [materialUsage, setMaterialUsage] = useState([]);

    // Inventory state for Central Warehouse
    const [allInventoryItems, setAllInventoryItems] = useState<any[]>([]);
    const [isInventoryLoading, setIsInventoryLoading] = useState(true);

    const [isTaskViewModalOpen, setIsTaskViewModalOpen] = useState(false);
    const [selectedTaskView, setSelectedTaskView] = useState<Task | null>(null);

    // Add subview state and selected task state
    const [timelineSubview, setTimelineSubview] = useState<
        | "main"
        | "activeTasks"
        | "taskDetail"
        | "completedTasks"
        | "onSchedule"
        | "resourceUtilization"
    >("main");
    const [selectedTimelineTask, setSelectedTimelineTask] = useState<Task | null>(
        null
    );

    // Reports tab subview state
    const [reportsSubview, setReportsSubview] = useState<
        "mainReports" | "dprList" | "wprList" | "reportQuality"
    >("mainReports");

    // Issue Tracker tab subview state
    const [issuesSubview, setIssuesSubview] = useState<
        "mainIssues" | "openIssues" | "highPriority" | "resolvedThisWeek"
    >("mainIssues");

    // Task Management Functions
    const handleViewGantt = (taskId: string) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            toast.info(`Viewing Gantt chart for: ${task.name}`, {
                description: `Start: ${task.startDate} - End: ${task.dueDate}`,
                duration: 3000,
            });
        }
    };

    const openTaskViewModal = (task: Task) => {
        setSelectedTaskView(task);
        setIsTaskViewModalOpen(true);
    };

    const handleUpdateTaskStatus = (formData: {
        taskId: string;
        status: string;
        notes: string;
    }) => {
        // Update task status
        const updatedTasks = tasks.map((task) => {
            if (task.id === formData.taskId) {
                return {
                    ...task,
                    status: formData.status,
                };
            }
            return task;
        });
        setTasks(updatedTasks);

        // Update progress stats
        const completedTasks = updatedTasks.filter(
            (t) => t.status === "completed"
        ).length;
        const activeTasks = updatedTasks.filter(
            (t) => t.status === "in_progress"
        ).length;
        setProgressStats((prev) => ({
            ...prev,
            activeTasks,
            completedThisWeek: completedTasks,
            onSchedule: Math.round((completedTasks / updatedTasks.length) * 100),
        }));

        toast.success("Task status updated successfully!");
        setIsProgressModalOpen(false);
    };

    // Status Update Modal
    const openStatusModal = (task: Task) => {
        setSelectedTask(task);
        setIsProgressModalOpen(true);
    };

    const handlePOView = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsPOViewModalOpen(true);
    };

    const handlePOApprove = (
        po: PurchaseOrder,
        formData: {
            comments: string;
            conditions?: string;
        }
    ) => {
        const updatedPOs = purchaseOrders.map((p) =>
            p.id === po.id
                ? {
                    ...p,
                    status: "Approved",
                    approver: "Finance Head",
                    timeInQueue: "0hrs",
                }
                : p
        );
        setPurchaseOrders(updatedPOs);
        toast.success(`Purchase Order ${po.id} approved with comments`);
        setIsPOApproveModalOpen(false);
    };

    const handlePOExpedite = (
        po: PurchaseOrder,
        formData: {
            priority: "high" | "urgent";
            reason: string;
            escalateTo: string;
        }
    ) => {
        const updatedPOs = purchaseOrders.map((p) =>
            p.id === po.id
                ? {
                    ...p,
                    status: "In Review",
                    approver: formData.escalateTo,
                    timeInQueue: "0hrs",
                }
                : p
        );
        setPurchaseOrders(updatedPOs);
        toast.success(
            `Purchase Order ${po.id} expedited to ${formData.escalateTo}`
        );
        setIsPOExpediteModalOpen(false);
    };

    const handleCreatePO = (formData: {
        vendor: string;
        amount: number;
        description: string;
        priority: string;
    }) => {
        const newPO = {
            id: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, "0")}`,
            vendor: formData.vendor,
            amount: formData.amount,
            status: "Pending",
            approver: "Bob Smith",
            timeInQueue: "0hrs",
        };
        setPurchaseOrders([...purchaseOrders, newPO]);
        toast.success("Purchase order created successfully!");
        setIsPOModalOpen(false);
    };

    const handleEquipmentMaintenance = (formData: {
        equipmentId: string;
        maintenanceType: string;
        notes: string;
        nextService: number;
    }) => {
        const updatedEquipment = equipmentList.map((eq) =>
            eq.id === formData.equipmentId
                ? {
                    ...eq,
                    status: "Active",
                    nextService: `${formData.nextService}hrs`,
                    hours: eq.hours,
                }
                : eq
        );
        setEquipmentList(updatedEquipment);
        toast.success("Equipment maintenance logged successfully!");
        setIsEquipmentModalOpen(false);
    };

    const handleLaborHours = (formData: {
        trade: string;
        workers: number;
        hours: number;
        overtime: number;
    }) => {
        const updatedLabor = laborHours.map((l) =>
            l.trade === formData.trade
                ? {
                    ...l,
                    actual: l.actual + formData.hours + formData.overtime,
                }
                : l
        );
        setLaborHours(updatedLabor);
        toast.success("Labor hours logged successfully!");
        setIsLaborModalOpen(false);
    };

    // Fetch Progress Reports
    const fetchProgressReports = async () => {
        try {
            // if (!user?.id) return;

            // Use selectedUserId if admin has selected a user, otherwise use current user's ID
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");

            // Fetch DPRs
            const endpoint = (
                user?.role === "admin" || user?.role === "md"
                    ? selectedUser?.id == currentUser?.id
                    : user?.role === "admin" || user?.role === "md"
            )
                ? `${API_URL}/progress-reports/dpr/all`
                : `${API_URL}/progress-reports/dpr/user/${userID}`;
            const dprResponse = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDprs(dprResponse.data);
            console.log("DPRs fetched:", dprResponse.data);

            // Fetch WPRs
            const endpoint2 = (
                user?.role === "admin" || user?.role === "md"
                    ? selectedUser?.id == currentUser?.id
                    : user?.role === "admin" || user?.role === "md"
            )
                ? `${API_URL}/progress-reports/wpr/all`
                : `${API_URL}/progress-reports/wpr/user/${userID}`;
            console.log("Fetching WPRs from:", endpoint2);
            const wprResponse = await axios.get(endpoint2, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWprs(wprResponse.data);
            console.log("WPRs fetched:", wprResponse.data);

            // Calculate stats
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const monthlyDprs = dprResponse.data.filter((dpr: any) => {
                const dprDate = new Date(dpr.createdAt);
                return (
                    dprDate.getMonth() === currentMonth &&
                    dprDate.getFullYear() === currentYear
                );
            });

            const monthlyWprs = wprResponse.data.filter((wpr: any) => {
                const wprDate = new Date(wpr.createdAt);
                return (
                    wprDate.getMonth() === currentMonth &&
                    wprDate.getFullYear() === currentYear
                );
            });

            setReportsStats({
                dprsSubmitted: monthlyDprs.length,
                wprsCompleted: monthlyWprs.length,
                averageScore: "4.2/5", // You can implement actual scoring logic here
            });

            // Update progress stats based on actual data
            const activeTasks = tasks.filter(
                (t) =>
                    t.status === "In Progress" ||
                    t.status === "in_progress" ||
                    t.status === "In progress"
            ).length;
            const completedThisWeek = getCompletedTasksThisWeek();

            setProgressStats((prev) => ({
                ...prev,
                // activeTasks: activeTasks,
                completedThisWeek: completedThisWeek,
                onSchedule: calculateOnSchedulePercentage(),
                resourceUtilization: Math.min(
                    95,
                    Math.max(60, 75 + monthlyDprs.length * 2)
                ),
            }));

            // Generate weekly progress data from WPRs
            const weeklyProgressData = generateWeeklyProgressData(wprResponse.data);
            setWeeklyProgress(weeklyProgressData);
        } catch (error) {
            console.error("Error fetching progress reports:", error);
        }
    };

    // Helper function to get completed tasks this week
    const getCompletedTasksThisWeek = () => {
        // For now, return a calculated value based on completed tasks
        return tasks.filter(
            (task) => task.status === "Completed" || task.status === "completed"
        ).length;
    };

    // Helper function to calculate on schedule percentage
    const calculateOnSchedulePercentage = () => {
        const totalTasks = tasks.length;
        if (totalTasks === 0) return 100;

        const onScheduleTasks = tasks.filter((task) => {
            const dueDate = new Date(task.dueDate);
            const now = new Date();

            if (task.status === "Completed" || task.status === "completed") {
                return true; // Completed tasks are considered on schedule
            }

            if (
                (task.status === "In Progress" ||
                    task.status === "in-progress" ||
                    task.status === "In progress") &&
                dueDate > now
            ) {
                return true; // In progress tasks not yet overdue
            }

            return false;
        }).length;

        return Math.round((onScheduleTasks / totalTasks) * 100);
    };

    // Generate weekly progress data for chart
    const generateWeeklyProgressData = (wprs: any[]) => {
        if (!wprs || wprs.length === 0) {
            return [
                { week: "Week 1", planned: 20, actual: 15 },
                { week: "Week 2", planned: 40, actual: 35 },
                { week: "Week 3", planned: 60, actual: 55 },
                { week: "Week 4", planned: 80, actual: 75 },
            ];
        }

        return wprs.slice(-4).map((wpr, index) => ({
            week: `Week ${index + 1}`,
            planned: parseInt(wpr.plannedProgress) || 0,
            actual: parseInt(wpr.actualProgress) || 0,
        }));
    };

    // Task Management Functions
    const fetchTasks = async () => {
        try {
            if (!user?.id) return;

            // Use selectedUserId if admin has selected a user, otherwise use current user's ID
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");

            // Fetch tasks for all projects the user has access to
            // const allTasks: Task[] = [];

            // const response = await axios.get(
            //   `${API_URL}/projects/${userID}/tasks`,
            //   {
            //     headers: { Authorization: `Bearer ${token}` },
            //   }
            // )
            const endpoint = (
                user?.role === "admin" || user?.role === "md"
                    ? selectedUser?.id == currentUser?.id
                    : user?.role === "admin" || user?.role === "md"
            )
                ? `${API_URL}/tasks`
                : `${API_URL}/projects/${userID}/tasks`;
            console.log("Fetching tasks from:", endpoint);
            if (user?.role !== "admin") {
                console.log("Admin");
            } else {
                console.log("Not Admin");
            }
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // console.log(response.data);
            // Add project name and assigned user name to each task for display
            await fetchUsers();
            const token2 =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token2 ? { Authorization: `Bearer ${token2}` } : {};
            const usersResponse = await fetch(`${API_URL}/users`, { headers });
            const latestUsers = usersResponse.ok ? await usersResponse.json() : [];

            const tasksWithNames = response.data.map((task: Task) => ({
                ...task,
                projectName: task.project?.name,
                // assignedTo: task.assignedToId,
                assignedTo: task.assignedToId
                    ? latestUsers.find((u: User) => u.id === task.assignedToId)?.name ||
                    "Unknown User"
                    : undefined,

                startDate: new Date(task.startDate).toISOString().split("T")[0],
                dueDate: new Date(task.dueDate).toISOString().split("T")[0],
            }));
            setTasks(tasksWithNames);
            console.log(tasksWithNames);

            // Update task statistics with correct status values
            const pendingCount = tasksWithNames.filter(
                (t) => t.status === "pending"
            ).length;

            const activeCount = tasksWithNames.filter(
                (t) => t.status === "in_progress"
            ).length;

            const completedCount = tasksWithNames.filter(
                (t) => t.status === "completed"
            ).length;

            setProgressStats((prev) => ({
                ...prev,
                pendingTasks: pendingCount,
                activeTasks: activeCount,
                completedTasks: completedCount,
                onSchedule: calculateOnSchedulePercentage(),
            }));
        } catch (error) {
            console.error(`Error fetching tasks for user ${user?.id}:`, error);
        }
    };

    // } catch (error) {
    //   console.error("Error fetching tasks:", error);
    // }
    const columns = [
        {
            key: "itemName",
            label: "Item Name",
            type: "text" as const,
            render: (value: any, row: InventoryItem) => (
                <div className="flex flex-col">
                    <span className="font-medium">{value}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(row.category) ? (
                            row.category.map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                    {cat}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="secondary" className="text-xs">{row.category}</Badge>
                        )}
                        <Badge
                            variant={(row.quantity || 0) > (row.safetyStock || 50) ? "default" : "destructive"}
                            className="text-xs"
                        >
                            {row.quantity} {row.unit}
                        </Badge>
                    </div>
                </div>
            ),
        },
        { key: "location", label: "Location", type: "text" as const, className: "hidden sm:table-cell" },
        { key: "itemQuality", label: "Status", type: "text" as const, className: "hidden md:table-cell" },
        // {
        //   key: "actions",
        //   label: "Actions",
        //   type: "custom" as const,
        //   // render: (_: any, row: any) => (
        //   //   <div className="flex items-center gap-2">
        //   //     <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Edit</Button>
        //   //     <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>Delete</Button>
        //   //   </div>
        //   // ),
        // },
    ];

    // Expandable row content (simplified)
    const expandableContent = (row: InventoryItem) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
                <div className="space-y-1">
                    <div>Safety Stock: {row.safetyStock || 50}</div>
                    <div>Max Stock: {row.maximumStock || 500}</div>
                </div>
            </div>
            <div>
                <div className="space-y-1">
                    <div>Safety Stock: {row.safetyStock || 20}</div>
                    <div>Unit Cost: ₹{row.unitCost || 0}</div>

                </div>
            </div>
            <div>
                <div className="space-y-1">
                    <div>
                        Total Value: ₹{(((row.unitCost || 0) * (row.quantity || 0)) || 0).toLocaleString()}
                    </div>
                    <div>Location: {row.location}</div>
                </div>
            </div>
        </div>
    );

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            const task = tasks.find((t) => t.id === taskId);
            if (!task) {
                toast.error("Task not found");
                return;
            }

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");

            const response = await axios.put(
                `${API_URL}/projects/${userID}/tasks/${taskId}`,
                updates,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Task updated successfully!");
                fetchTasks(); // Refresh task list
            }
        } catch (error: any) {
            console.error("Error updating task:", error);
            console.error("Error details:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                url: `${API_URL}/projects/${user?.id}/tasks/${taskId}`,
                userId: user?.id,
            });
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to update task. Please try again."
            );
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            const task = tasks.find((t) => t.id === taskId);
            if (!task) {
                toast.error("Task not found");
                return;
            }

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");

            const response = await axios.delete(
                `${API_URL}/projects/${task.projectId}/tasks/${taskId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 204 || response.status === 200) {
                toast.success("Task deleted successfully!");
                fetchTasks(); // Refresh task list
            }
        } catch (error: any) {
            console.error("Error deleting task:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete task. Please try again."
            );
        }
    };

    const handleBudgetAdjustment = (formData: {
        category: string;
        adjustmentType: "increase" | "decrease";
        amount: number;
        reason: string;
        effectiveDate: string;
        approver: string;
    }) => {
        const updatedBudget = budget.map((b) =>
            b.category === formData.category
                ? {
                    ...b,
                    planned:
                        formData.adjustmentType === "increase"
                            ? b.planned + formData.amount
                            : b.planned - formData.amount,
                }
                : b
        );
        setBudget(updatedBudget);
        toast.success(
            `Budget ${formData.adjustmentType
            }d by ₹${formData.amount.toLocaleString()} for ${formData.category}`
        );
        setIsBudgetAdjustModalOpen(false);
    };

    const handleUploadDPR = async (formData: any) => {
        try {
            if (!userID) {
                toast.error("User not authenticated");
                return;
            }

            if (!formData.projectId) {
                toast.error("Please select a project");
                return;
            }

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");

            // Generate a DPR number based on date and user ID
            const dprNo = `DPR-${formData.date.replace(/-/g, '')}-${userID.substring(0, 6)}`;

            // Transform hindrances to remarks
            const remarks = formData.hindranceItems
                ?.filter((item: any) => item.category)
                .map((item: any) => ({
                    category: item.category,
                    remarkText: `Action: ${item.actionTaken} | Remarks: ${item.remarks}`
                })) || [];

            // Transform work items to match backend schema
            const transformedWorkItems = formData.workItems
                ?.filter((item: any) => item.description)
                .map((item: any, index: number) => ({
                    slNo: index + 1,
                    category: item.category || "General",
                    description: item.description,
                    unit: item.unit || "Units",
                    boqQuantity: parseFloat(item.boqQuantity) || 0,
                    alreadyExecuted: parseFloat(item.alreadyExecuted) || 0,
                    todaysProgram: parseFloat(item.todaysProgress) || 0,
                    yesterdayAchievement: parseFloat(item.yesterdayAchievement) || 0,
                    cumulativeQuantity: parseFloat(item.cumulativeQuantity) || 0,
                    balanceQuantity: parseFloat(item.balanceQuantity) || 0,
                    remarks: item.remarks || ""
                })) || [];

            const response = await axios.post(
              `${API_URL}/progress-reports/dpr`,
              {
                dprNo,
                date: formData.date,
                projectName: formData.projectName,
                developer: formData.developer || "",
                contractor: formData.contractor || "",
                pmc: formData.pmc || "",
                weatherCondition: formData.weatherCondition,
                workItems: transformedWorkItems,
                resources: [], // Can be extended later
                remarks: remarks,
                majorHindrances: formData.hindranceItems
                  ?.map((item: any) => item.category)
                  .join(", ") || "",
                actionTaken: "",
                // Add manpower and staff data as additional fields
                manpowerItems: formData.manpowerItems || [],
                staffItems: formData.staffItems || [],
                hindranceItems: formData.hindranceItems || []
              },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                toast.success("DPR uploaded successfully!");
                setIsDPRModalOpen(false);
                // Refresh data
                fetchProgressReports();
            }
        } catch (error: any) {
            console.error("Error uploading DPR:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to upload DPR. Please try again."
            );
        }
    };

    const handleUploadWPR = async (formData: {
        weekStart: string;
        weekEnding: string;
        milestones: string;
        plannedProgress: string;
        actualProgress: string;
        progressRemarks: string;
        issues: string;
        risks: string;
        safetySummary: string;
        qualitySummary: string;
        manpower: { role: string; planned: string; actual: string; remarks: string }[];
        equipment: {
            equipment: string;
            uptime: string;
            downtime: string;
            remarks: string;
        }[];
        materials: {
            material: string;
            planned: string;
            actual: string;
            remarks: string;
        }[];
        teamPerformance: string;
        attachments: FileList;
        projectId: string;
    }) => {
        try {
            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            if (!formData.projectId) {
                toast.error("Please select a project");
                return;
            }

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");

            const response = await axios.post(
                `${API_URL}/progress-reports/wpr`,
                {
                    projectId: formData.projectId,
                    weekStart: formData.weekStart,
                    weekEnding: formData.weekEnding,
                    milestones: formData.milestones,
                    plannedProgress: formData.plannedProgress,
                    actualProgress: formData.actualProgress,
                    progressRemarks: formData.progressRemarks || "",
                    issues: formData.issues || "",
                    risks: formData.risks || "",
                    safetySummary: formData.safetySummary || "",
                    qualitySummary: formData.qualitySummary || "",
                    manpower: formData.manpower,
                    equipment: formData.equipment,
                    materials: formData.materials,
                    teamPerformance: formData.teamPerformance || "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                toast.success("WPR uploaded successfully!");
                setIsWPRModalOpen(false);
                // Refresh data
                fetchProgressReports();
            }
        } catch (error: any) {
            console.error("Error uploading WPR:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to upload WPR. Please try again."
            );
        }
    };

    const handleRaiseMaterialRequest = (formData: {
        materialItem: string;
        quantity: string;
        priority: string;
        useCase: string;
    }) => {
        const newRequest = {
            id: `REQ${String(materialRequests.length + 1).padStart(3, "0")}`,
            item: formData.materialItem,
            quantity: formData.quantity,
            status: "Pending",
            requestDate: new Date().toISOString().split("T")[0],
            expectedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
        };

        setMaterialRequests((prev) => [...prev, newRequest]);
        setMaterialStats((prev) => ({
            ...prev,
            pendingRequests: prev.pendingRequests + 1,
        }));

        toast.success("Material request raised successfully!");
        setIsMaterialRequestModalOpen(false);
    };

    const handleAddIssue = (formData: {
        category: string;
        description: string;
        severity: string;
        responsibleParty: string;
    }) => {
        toast.success("Issue logged successfully!");
        setIsIssueModalOpen(false);
    };

    const handleAddTask = async (formData: {
        name: string;
        projectId: string;
        assignedToId: string;
        description: string;
        startDate: string;
        dueDate: string;
    }) => {
        try {
            if (!user?.id) {
                toast.error("User not authenticated");
                return;
            }

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");

            // Format dates as ISO strings
            const formattedDueDate = formData.dueDate
                ? new Date(formData.dueDate).toISOString().split("T")[0]
                : null;
            const formattedStartDate = formData.startDate
                ? new Date(formData.startDate).toISOString().split("T")[0]
                : null;

            const taskData = {
                name: formData.name,
                description: formData.description || null,
                assignedToId: formData.assignedToId || null,
                startDate: formattedStartDate,
                dueDate: formattedDueDate,
                status: "pending",
                projectId: formData.projectId,
            };

            console.log("Sending task data:", taskData); // For debugging

            const response = await axios.post(
                `${API_URL}/projects/${userID}/tasks`,
                taskData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                toast.success("Task created successfully!");
                setIsAddTaskModalOpen(false);
                fetchTasks(); // Refresh task list
            }
        } catch (error: any) {
            console.error("Error creating task:", error);
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to create task. Please try again."
            );
        }
    };

    // Add new functions for material request actions
    const handleTrackRequest = (requestId: string) => {
        const request = materialRequests.find((r) => r.id === requestId);
        if (request) {
            toast.info(`Tracking ${requestId}`, {
                description: `Status: ${request.status}\nExpected Delivery: ${request.expectedDelivery}`,
                duration: 3000,
            });
        }
    };

    const handleRemindRequest = (requestId: string) => {
        const updatedRequests = materialRequests.map((r) =>
            r.id === requestId ? { ...r, status: "Expedited" } : r
        );
        setMaterialRequests(updatedRequests);
        toast.success(`Reminder sent for ${requestId}`);
    };

    const handleReceiveMaterial = (material: string) => {
        // Update material usage data
        const updatedUsage = materialUsage.map((m) =>
            m.material === material
                ? {
                    ...m,
                    used:
                        m.used +
                        (m.material === "Cement"
                            ? 10
                            : m.material === "Steel"
                                ? 100
                                : 20),
                }
                : m
        );
        setMaterialUsage(updatedUsage);

        // Update stats
        setMaterialStats((prev) => ({
            ...prev,
            receivedToday: prev.receivedToday + 1,
            utilizationRate: Math.min(100, prev.utilizationRate + 1),
        }));

        toast.success(`${material} received and logged`);
    };

    const handleViewLaborDetails = (trade: string) => {
        const laborDetails = laborHours.find((l) => l.trade === trade);
        if (laborDetails) {
            setSelectedLabor(laborDetails);
            setIsLaborDetailsModalOpen(true);
        }
    };

    const handleViewEquipmentLogs = (equipment: (typeof equipmentData)[0]) => {
        setSelectedEquipment(equipment);
        setIsEquipmentLogsModalOpen(true);
    };

    const handleTrackEquipment = (equipment: (typeof equipmentData)[0]) => {
        setSelectedEquipment(equipment);
        setIsEquipmentTrackingModalOpen(true);
    };

    // Active Tasks List component
    const ActiveTasksList = () => {
        const activeTasks = tasks.filter((t) => t.status === "in_progress");
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Active Tasks</h2>
                    <Button variant="outline" onClick={() => setTimelineSubview("main")}>
                        Back to Timeline
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="p-2 text-left">Task Name</th>
                                <th className="p-2 text-left">Assigned To</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTasks.length > 0 ? (
                                activeTasks.map((task) => (
                                    <tr key={task.id} className="border-t">
                                        <td className="p-2">{task.name}</td>
                                        <td className="p-2">{task.assignedTo}</td>
                                        <td className="p-2">{task.status}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedTimelineTask(task);
                                                        setTimelineSubview("taskDetail");
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedEditTask(task);
                                                        setIsEditTaskModalOpen(true);
                                                    }}
                                                >
                                                    Update
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        No active tasks found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Task Detail component
    const TaskDetailView = () => {
        const task = selectedTimelineTask;
        if (!task) return <div>Task not found</div>;

        const handleStatusUpdate = async (newStatus: string) => {
            await handleUpdateTask(task.id, { status: newStatus });
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Task Details</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setTimelineSubview("activeTasks")}
                        >
                            Back to Active Tasks
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this task?")) {
                                    handleDeleteTask(task.id);
                                    setTimelineSubview("activeTasks");
                                }
                            }}
                        >
                            Delete Task
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Task Name</Label>
                                <p className="font-medium">{task.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Project</Label>
                                <p className="font-medium">
                                    {task.projectName || task.projectId}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Assigned To</Label>
                                <p className="font-medium">{task.assignedTo}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Description</Label>
                                <p className="font-medium">
                                    {task.description || "No description provided"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Start Date</Label>
                                <p className="font-medium">
                                    {task.startDate
                                        ? new Date(task.startDate).toISOString().split("T")[0]
                                        : "Not set"}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Due Date</Label>
                                <p className="font-medium">
                                    {task.dueDate
                                        ? new Date(task.dueDate).toISOString().split("T")[0]
                                        : "Not set"}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Current Status</Label>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            task.status === "completed" || task.status === "Completed"
                                                ? "default"
                                                : task.status === "in-progress" ||
                                                    task.status === "In Progress"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                    >
                                        {task.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Update Status</Label>
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate("In Progress")}
                                        disabled={task.status === "In Progress"}
                                    >
                                        Start
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => handleStatusUpdate("Completed")}
                                        disabled={task.status === "Completed"}
                                    >
                                        Complete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // Completed Tasks List component
    const CompletedTasksList = () => {
        const completedTasks = tasks.filter((t) => t.status === "completed");
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Completed Tasks</h2>
                    <Button variant="outline" onClick={() => setTimelineSubview("main")}>
                        Back to Timeline
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="p-2 text-left">Task Name</th>
                                <th className="p-2 text-left">Assigned To</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedTasks.length > 0 ? (
                                completedTasks.map((task) => (
                                    <tr key={task.id} className="border-t">
                                        <td className="p-2">{task.name}</td>
                                        <td className="p-2">{task.assignedTo}</td>
                                        <td className="p-2">{task.status}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedTimelineTask(task);
                                                        setTimelineSubview("taskDetail");
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedEditTask(task);
                                                        setIsEditTaskModalOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        No completed tasks found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // On Schedule Tasks List component
    const OnScheduleTasksList = () => {
        const onScheduleTasks = tasks.filter(
            (t) =>
                new Date(t.dueDate || "") >= new Date() ||
                t.status === "completed" ||
                t.status === "Completed"
        );
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">On Schedule Tasks</h2>
                    <Button variant="outline" onClick={() => setTimelineSubview("main")}>
                        Back to Timeline
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="p-2 text-left">Task Name</th>
                                <th className="p-2 text-left">Assigned To</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Due Date</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {onScheduleTasks.length > 0 ? (
                                onScheduleTasks.map((task) => (
                                    <tr key={task.id} className="border-t">
                                        <td className="p-2">{task.name}</td>
                                        <td className="p-2">{task.assignedTo || "Unassigned"}</td>
                                        <td className="p-2">{task.status}</td>
                                        <td className="p-2">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString()
                                                : "Not set"}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedTimelineTask(task);
                                                        setTimelineSubview("taskDetail");
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedEditTask(task);
                                                        setIsEditTaskModalOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-4 text-center text-muted-foreground"
                                    >
                                        No on-schedule tasks found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Resource Utilization View component
    const ResourceUtilizationView = () => {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Resource Utilization</h2>
                    <Button variant="outline" onClick={() => setTimelineSubview("main")}>
                        Back to Timeline
                    </Button>
                </div>
                <div>
                    <p className="mb-4">
                        Team efficiency based on completed vs planned work hours.
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={laborHours}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="trade" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="planned" fill="#3b82f6" name="Planned Hours" />
                            <Bar dataKey="actual" fill="#10b981" name="Actual Hours" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // DPR List View
    const DPRListView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Daily Progress Reports (DPRs)</h2>
                <Button
                    variant="outline"
                    onClick={() => setReportsSubview("mainReports")}
                >
                    Back to Reports
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Weather</th>
                            <th className="p-2 text-left">Photos</th>
                            <th className="p-2 text-left">Escalated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dprs.length > 0 ? (
                            dprs.map((dpr, idx) => (
                                <tr key={dpr.id || idx} className="border-t">
                                    <td className="p-2">
                                        {new Date(dpr.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-2">{dpr.weather}</td>
                                    <td className="p-2">N/A</td>
                                    <td className="p-2">
                                        {dpr.safetyIncident &&
                                            dpr.safetyIncident.toLowerCase() !== "n/a"
                                            ? "Yes"
                                            : "No"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-4 text-center text-muted-foreground"
                                >
                                    No DPRs submitted yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // WPR List View
    const WPRListView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Weekly Progress Reports (WPRs)</h2>
                <Button
                    variant="outline"
                    onClick={() => setReportsSubview("mainReports")}
                >
                    Back to Reports
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-2 text-left">Week Start</th>
                            <th className="p-2 text-left">Week End</th>
                            <th className="p-2 text-left">Progress</th>
                            <th className="p-2 text-left">Issues</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wprs.length > 0 ? (
                            wprs.map((wpr, idx) => (
                                <tr key={wpr.id || idx} className="border-t">
                                    <td className="p-2">
                                        {new Date(wpr.weekStart).toLocaleDateString()}
                                    </td>
                                    <td className="p-2">
                                        {new Date(wpr.weekEnding).toLocaleDateString()}
                                    </td>
                                    <td className="p-2">{wpr.actualProgress}% actual</td>
                                    <td className="p-2">
                                        {wpr.issues && wpr.issues.toLowerCase() !== "n/a"
                                            ? "Yes"
                                            : "No"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-4 text-center text-muted-foreground"
                                >
                                    No WPRs submitted yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Report Quality View
    const ReportQualityView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Report Quality Metrics</h2>
                <Button
                    variant="outline"
                    onClick={() => setReportsSubview("mainReports")}
                >
                    Back to Reports
                </Button>
            </div>
            <div>
                <p className="mb-4">Average report score and quality trends.</p>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                        data={[
                            { month: "Jan", score: 4.1 },
                            { month: "Feb", score: 4.3 },
                            { month: "Mar", score: 4.0 },
                            { month: "Apr", score: 4.4 },
                            { month: "May", score: 4.2 },
                            { month: "Jun", score: 4.5 },
                        ]}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[3.5, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#10b981" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    // Material Flow tab subview state
    const [materialsSubview, setMaterialsSubview] = useState<
        "mainMaterials" | "pendingRequests" | "receivedToday" | "utilizationRate"
    >("mainMaterials");

    // Material Flow StatCard subviews
    const PendingRequestsView = () => {
        const pending = materialRequests.filter((r) => r.status === "Pending");
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Pending Material Requests</h2>
                    <Button
                        variant="outline"
                        onClick={() => setMaterialsSubview("mainMaterials")}
                    >
                        Back to Material Flow
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="p-2 text-left">Request ID</th>
                                <th className="p-2 text-left">Item</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Request Date</th>
                                <th className="p-2 text-left">Expected Delivery</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-2 text-center text-muted-foreground"
                                    >
                                        No pending requests
                                    </td>
                                </tr>
                            ) : (
                                pending.map((req) => (
                                    <tr key={req.id} className="border-t">
                                        <td className="p-2">{req.id}</td>
                                        <td className="p-2">{req.item}</td>
                                        <td className="p-2">{req.quantity}</td>
                                        <td className="p-2">{req.requestDate}</td>
                                        <td className="p-2">{req.expectedDelivery}</td>
                                        <td className="p-2">{req.status}</td>
                                        <td className="p-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedMaterialRequest(req);
                                                    setIsMaterialRequestUpdateModalOpen(true);
                                                }}
                                            >
                                                Update
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const ReceivedTodayView = () => {
        // For demo, show all requests with status 'Approved' or 'In Transit' and expectedDelivery is today
        const today = new Date().toISOString().split("T")[0];
        const received = materialRequests.filter(
            (r) => r.expectedDelivery === today
        );
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Materials Received Today</h2>
                    <Button
                        variant="outline"
                        onClick={() => setMaterialsSubview("mainMaterials")}
                    >
                        Back to Material Flow
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="p-2 text-left">Request ID</th>
                                <th className="p-2 text-left">Item</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Received Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {received.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-2 text-center text-muted-foreground"
                                    >
                                        No materials received today
                                    </td>
                                </tr>
                            ) : (
                                received.map((req) => (
                                    <tr key={req.id} className="border-t">
                                        <td className="p-2">{req.id}</td>
                                        <td className="p-2">{req.item}</td>
                                        <td className="p-2">{req.quantity}</td>
                                        <td className="p-2">{req.status}</td>
                                        <td className="p-2">{req.expectedDelivery}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const UtilizationRateView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Material Utilization Rate</h2>
                <Button
                    variant="outline"
                    onClick={() => setMaterialsSubview("mainMaterials")}
                >
                    Back to Material Flow
                </Button>
            </div>
            <div className="mb-4">
                Current Utilization Rate:{" "}
                <span className="font-semibold">{materialStats.utilizationRate}%</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={materialUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="material" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requested" fill="#3b82f6" name="Requested" />
                    <Bar dataKey="used" fill="#10b981" name="Used" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );

    // Cost Analysis tab subview state
    const [costSubview, setCostSubview] = useState<
        "mainCost" | "totalCost" | "laborUtilization" | "equipmentUtilization"
    >("mainCost");

    // Add this state near the other subview states
    const [storeManagerSubview, setStoreManagerSubview] = useState<
        | "main"
        | "activePersonnel"
        | "performance"
        | "pendingActions"
        | "activeSites"
    >("main");

    // Add this state near the other subview states
    const [centralWarehouseSubview, setCentralWarehouseSubview] = useState<
        "main" | "stockAvailability" | "pendingDeliveries" | "storageCapacity"
    >("main");

    // Add state for update modal and selected request
    const [
        isMaterialRequestUpdateModalOpen,
        setIsMaterialRequestUpdateModalOpen,
    ] = useState(false);
    const [selectedMaterialRequest, setSelectedMaterialRequest] =
        useState<any>(null);

    // Handler to update material request status
    const handleUpdateMaterialRequestStatus = (
        requestId: string,
        newStatus: string
    ) => {
        setMaterialRequests((prev) =>
            prev.map((req) =>
                req.id === requestId ? { ...req, status: newStatus } : req
            )
        );
        setIsMaterialRequestUpdateModalOpen(false);
        toast.success(`Status updated for ${requestId}`);
    };

    useEffect(() => {
        const token =
            sessionStorage.getItem("jwt_token") ||
            localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // Fetch purchase orders
        if (userID) {
            axios
                .get(`${API_URL}/purchase-orders`, { headers })
                .then((res) => setPurchaseOrders(res.data))
                .catch(() => { });
            // Fetch equipment
            axios
                .get(`${API_URL}/site-ops/equipment-maintenance`, { headers })
                .then((res) => setEquipmentList(res.data))
                .catch(() => { });
            // Fetch staff (employees)
            axios
                .get(`${API_URL}/hr/employees`, { headers })
                .then((res) => setStoreStaff(res.data))
                .catch(() => { });
            // Fetch issues
            axios
                .get(`${API_URL}/site-ops/issue-reports`, { headers })
                .then((res) => setIssues(res.data))
                .catch(() => { });
            // Fetch equipment logs
            axios
                .get(`${API_URL}/site-ops/equipment-logs`, { headers })
                .then((res) => setEquipmentLogs(res.data))
                .catch(() => { });
            // Fetch equipment locations
            axios
                .get(`${API_URL}/site-ops/equipment-locations`, { headers })
                .then((res) => setEquipmentLocations(res.data))
                .catch(() => { });
            // Fetch stock alerts
            axios
                .get(`${API_URL}/inventory/stock-alerts`, { headers })
                .then((res) => setStockAlerts(res.data))
                .catch(() => { });
            // Fetch material movements
            axios
                .get(`${API_URL}/inventory/material-movements`, { headers })
                .then((res) => setMaterialMovements(res.data))
                .catch(() => { });
            // Fetch storage sections
            axios
                .get(`${API_URL}/inventory/storage-sections`, { headers })
                .then((res) => setStorageSections(res.data))
                .catch(() => { });
            // Fetch labor hours
            axios
                .get(`${API_URL}/site-ops/labor-logs`, { headers })
                .then((res) => setLaborHours(res.data))
                .catch(() => { });
            // Fetch budget
            axios
                .get(`${API_URL}/site-ops/budget-adjustments`, { headers })
                .then((res) => setBudget(res.data))
                .catch(() => { });
            // Fetch tasks
            // axios
            //   .get(`${API_URL}/project/${user.id}/tasks`, { headers })
            //   .then((res) => setTasks(res.data))
            //   .catch(() => {});
            // Fetch material requests
            axios
                .get(`${API_URL}/inventory/material-requests`, { headers })
                .then((res) => setMaterialRequests(res.data))
                .catch(() => { });
            axios
                .get(`${API_URL}/site/progress`, { headers })
                .then((res) => setProgressStats(res.data))
                .catch(() => { });
            axios
                .get(`${API_URL}/site/material-usage`, { headers })
                .then((res) => setMaterialUsage(res.data))
                .catch(() => { });
            axios
                .get(`${API_URL}/site/cost`, { headers })
                .then((res) => setCostData(res.data))
                .catch(() => { });
            axios
                .get(`${API_URL}/site/labor`, { headers })
                .then((res) => setLaborHours(res.data))
                .catch(() => { });
            axios
                .get(`${API_URL}/purchase-orders`, { headers })
                .then((res) => setPurchaseOrders(res.data))
                .catch(() => { });
            axios
                .get(`${API_URL}/equipment`, { headers })
                .then((res) => setEquipmentList(res.data))
                .catch(() => { });
        }
    }, [userID]);

    // Ensure costData and laborData are always defined
    const safeCostData = Array.isArray(costData) ? costData : [];
    const safeLaborData = Array.isArray(laborHours) ? laborHours : [];

    return (
        <div className="space-y-6">
            <UserFilterComponent />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Site Manager Dashboard
                        {selectedUser && selectedUser.id !== currentUser?.id && (
                            <span className="text-lg text-muted-foreground ml-2">
                                - {selectedUser.name}
                            </span>
                        )}
                    </h1>
                    <p className="text-muted-foreground">
                        On-site operations and progress tracking
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setIsInvoiceModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Purchase Invoice
                    </Button>
                    <Button onClick={() => setIsDPRModalOpen(true)} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload DPR
                    </Button>
                    <Button
                        onClick={() => setIsWPRModalOpen(true)}
                        variant="outline"
                        className="gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Upload WPR
                    </Button>
                </div>
            </div>
            {/* Admin User Selection */}
            {/* {(user?.role === "admin" || user?.role === "md") && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <Label className="text-sm font-medium">View data for:</Label>
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select user to view data for" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={user?.id}>
                  Current User ({user?.name})
                </SelectItem>
                {allUsers
                  .filter((user) => user.role === "site")
                  .map((userItem) => (
                    <SelectItem key={userItem.id} value={userItem.id}>
                      {userItem.name} - {userItem.role}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {selectedUserId && (
            <div className="text-sm text-muted-foreground">
              Currently viewing:{" "}
              {allUsers.find((u) => u.id === selectedUserId)?.name ||
                "Unknown User"}
            </div>
          )}
        </div>
      )} */}

            <Tabs
                value={getCurrentTab()}
                onValueChange={handleTabChange}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="timeline">Execution Timeline</TabsTrigger>
                    <TabsTrigger value="reports">Daily & Weekly Reports</TabsTrigger>
                    <TabsTrigger value="central-warehouse">Central Warehouse</TabsTrigger>
                    <TabsTrigger value="invoices">Service Invoices</TabsTrigger>
                </TabsList>


                <div className="md:hidden mb-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            {getCurrentTab() === "timeline" ? (
                                <BarChart3 className="h-5 w-5 text-primary" />
                            ) : getCurrentTab() === "reports" ? (
                                <TrendingUp className="h-5 w-5 text-primary" />
                            ) : getCurrentTab() === "central-warehouse" ? (
                                <Warehouse className="h-5 w-5 text-primary" />
                            ) : getCurrentTab() === "invoices" ? (
                                <Receipt className="h-5 w-5 text-primary" />
                            ) : (
                                <Users className="h-5 w-5 text-primary" />
                            )}
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {getCurrentTab() === "timeline"
                                        ? "Execution Timeline"
                                        : getCurrentTab() === "reports"
                                            ? "Daily & Weekly Reports"
                                            : getCurrentTab() === "central-warehouse"
                                                ? "Central Warehouse"
                                                : getCurrentTab() === "invoices"
                                                    ? "Service Invoices"
                                                    : ""}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Store ›{" "}
                                    {getCurrentTab() === "timeline"
                                        ? "Execution Timeline"
                                        : getCurrentTab() === "reports"
                                            ? "Daily & Weekly Reports"
                                            : getCurrentTab() === "central-warehouse"
                                                ? "Central Warehouse"
                                                : getCurrentTab() === "invoices"
                                                    ? "Service Invoices"
                                                    : "Store Staff"}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {getCurrentTab() === "timeline"
                                ? `${progressStats.pendingTasks} items`
                                : getCurrentTab() === "reports"
                                    ? `${progressStats.activeTasks} reports`
                                    : getCurrentTab() === "central-warehouse"
                                        ? "Warehouse items"
                                        : getCurrentTab() === "invoices"
                                            ? `${serviceInvoices.length} invoices`
                                            : ""}
                        </div>
                    </div>
                </div>

                <TabsContent value="timeline" className="space-y-6">
                    {timelineSubview === "main" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Pending Tasks"
                                    value={progressStats.pendingTasks}
                                    icon={Clock}
                                    description="Tasks awaiting start"
                                    onClick={() => setTimelineSubview("activeTasks")}
                                />
                                <StatCard
                                    title="Active Tasks"
                                    value={progressStats.activeTasks}
                                    icon={AlertTriangle}
                                    description="Tasks in progress"
                                    onClick={() => setTimelineSubview("activeTasks")}
                                />
                                <StatCard
                                    title="Completed Tasks"
                                    value={progressStats.completedTasks}
                                    icon={CheckCircle2}
                                    description="Successfully completed tasks"
                                    onClick={() => setTimelineSubview("completedTasks")}
                                />
                            </div>
                            {timelineSubview === "main" && (
                                <>
                                    {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Progress vs Plan</CardTitle>
                        <CardDescription>
                          Weekly execution tracking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={weeklyProgress}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="planned" fill="#3b82f6" />
                            <Bar dataKey="actual" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Gantt View</CardTitle>
                        <CardDescription>
                          Timeline visualization
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {projectPhases.map((phase) => (
                            <div key={phase.phase} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">
                                  {phase.phase}
                                </span>
                                <span>{phase.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${phase.progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{phase.start}</span>
                                <span>{phase.end}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div> */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Task Management</CardTitle>
                                                <CardDescription>
                                                    Current task assignments and progress
                                                </CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => setIsAddTaskModalOpen(true)}
                                                    className="gap-2"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Task
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left py-3 px-4 font-medium w-12"></th>
                                                            <th className="text-left py-3 px-4 font-medium">
                                                                Task Name
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                                                                Project
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                                                                Assigned To
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                                                                Start Date
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                                                                Due Date
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                                                                Status
                                                            </th>
                                                            <th className="text-left py-3 px-4 font-medium">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tasks.length > 0 ? (
                                                            tasks.map((task) => (
                                                                <>
                                                                    <tr
                                                                        key={task.id}
                                                                        className="border-b hover:bg-muted/50"
                                                                    >
                                                                        <td className="py-3 px-4">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    setExpandedTaskId(
                                                                                        expandedTaskId === task.id
                                                                                            ? null
                                                                                            : task.id
                                                                                    )
                                                                                }
                                                                                className="p-1 h-6 w-6"
                                                                            >
                                                                                {expandedTaskId === task.id ? (
                                                                                    <ChevronUp className="h-4 w-4" />
                                                                                ) : (
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                                )}
                                                                            </Button>
                                                                        </td>
                                                                        <td className="py-3 px-4">
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="font-medium text-sm sm:text-base truncate">
                                                                                    {task.name}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground truncate sm:hidden">
                                                                                    {task.projectName}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground truncate sm:hidden">
                                                                                    {task.assignedTo || "Unassigned"}
                                                                                </p>
                                                                                <div className="sm:hidden mt-1">
                                                                                    <Badge
                                                                                        variant={
                                                                                            task.status === "completed"
                                                                                                ? "default"
                                                                                                : task.status === "in_progress"
                                                                                                    ? "secondary"
                                                                                                    : "outline"
                                                                                        }
                                                                                        className="text-xs"
                                                                                    >
                                                                                        {task.status === "in_progress"
                                                                                            ? "In Progress"
                                                                                            : task.status
                                                                                                .charAt(0)
                                                                                                .toUpperCase() +
                                                                                            task.status.slice(1)}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-3 px-4 hidden sm:table-cell">
                                                                            {task.projectName}
                                                                        </td>
                                                                        <td className="py-3 px-4 hidden sm:table-cell">
                                                                            {task.assignedTo || "Unassigned"}
                                                                        </td>
                                                                        <td className="py-3 px-4 hidden md:table-cell">
                                                                            {task.startDate
                                                                                ? new Date(
                                                                                    task.startDate
                                                                                ).toLocaleDateString()
                                                                                : "Not set"}
                                                                        </td>
                                                                        <td className="py-3 px-4 hidden md:table-cell">
                                                                            {task.dueDate
                                                                                ? new Date(
                                                                                    task.dueDate
                                                                                ).toLocaleDateString()
                                                                                : "Not set"}
                                                                        </td>
                                                                        <td className="py-3 px-4 hidden sm:table-cell">
                                                                            <Badge
                                                                                variant={
                                                                                    task.status === "completed"
                                                                                        ? "default"
                                                                                        : task.status === "in_progress"
                                                                                            ? "secondary"
                                                                                            : "outline"
                                                                                }
                                                                            >
                                                                                {task.status === "in_progress"
                                                                                    ? "In Progress"
                                                                                    : task.status
                                                                                        .charAt(0)
                                                                                        .toUpperCase() +
                                                                                    task.status.slice(1)}
                                                                            </Badge>
                                                                        </td>
                                                                        <td className="py-3 px-4">
                                                                            <div className="flex gap-1 sm:gap-2">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 sm:w-auto"
                                                                                    onClick={() => {
                                                                                        setSelectedEditTask(task);
                                                                                        setIsEditTaskModalOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <Pencil className="h-4 w-4" />
                                                                                    <span className="hidden sm:inline ml-1">
                                                                                        Update
                                                                                    </span>
                                                                                </Button>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 sm:w-auto text-destructive hover:text-destructive"
                                                                                    onClick={() => {
                                                                                        setSelectedDeleteTask(task);
                                                                                        setIsDeleteTaskDialogOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                    <span className="hidden sm:inline ml-1">
                                                                                        Delete
                                                                                    </span>
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    {expandedTaskId === task.id && (
                                                                        <tr className="bg-muted/30">
                                                                            <td colSpan={8} className="p-6">
                                                                                <div className="bg-background rounded-lg shadow-sm border p-6 space-y-6">
                                                                                    <div className="flex items-center gap-3 mb-4">
                                                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                                                        </div>
                                                                                        <h3 className="text-lg font-semibold">
                                                                                            Task Details
                                                                                        </h3>
                                                                                    </div>

                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                                                                <Label className="text-sm font-semibold text-muted-foreground">
                                                                                                    Task Name
                                                                                                </Label>
                                                                                            </div>
                                                                                            <div className="bg-muted/50 p-3 rounded-lg border">
                                                                                                <p className="text-sm font-medium">
                                                                                                    {task.name}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                                                <Label className="text-sm font-semibold text-muted-foreground">
                                                                                                    Project
                                                                                                </Label>
                                                                                            </div>
                                                                                            <div className="bg-muted/50 p-3 rounded-lg border">
                                                                                                <p className="text-sm font-medium">
                                                                                                    {task.projectName}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                                                                <Label className="text-sm font-semibold text-muted-foreground">
                                                                                                    Assigned To
                                                                                                </Label>
                                                                                            </div>
                                                                                            <div className="bg-muted/50 p-3 rounded-lg border">
                                                                                                <p className="text-sm font-medium">
                                                                                                    {task.assignedTo ||
                                                                                                        "Unassigned"}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                                                <Label className="text-sm font-semibold text-muted-foreground">
                                                                                                    Start Date
                                                                                                </Label>
                                                                                            </div>
                                                                                            <div className="bg-muted/50 p-3 rounded-lg border">
                                                                                                <p className="text-sm font-medium">
                                                                                                    {task.startDate
                                                                                                        ? new Date(
                                                                                                            task.startDate
                                                                                                        ).toLocaleDateString()
                                                                                                        : "Not set"}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                                                <Label className="text-sm font-semibold text-muted-foreground">
                                                                                                    Due Date
                                                                                                </Label>
                                                                                            </div>
                                                                                            <div className="bg-muted/50 p-3 rounded-lg border">
                                                                                                <p className="text-sm font-medium">
                                                                                                    {task.dueDate
                                                                                                        ? new Date(
                                                                                                            task.dueDate
                                                                                                        ).toLocaleDateString()
                                                                                                        : "Not set"}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                                                                <Label className="text-sm font-semibold text-muted-foreground">
                                                                                                    Current Status
                                                                                                </Label>
                                                                                            </div>
                                                                                            <div className="bg-muted/50 p-3 rounded-lg border">
                                                                                                <Badge
                                                                                                    variant={
                                                                                                        task.status === "completed"
                                                                                                            ? "default"
                                                                                                            : task.status ===
                                                                                                                "in_progress"
                                                                                                                ? "secondary"
                                                                                                                : "outline"
                                                                                                    }
                                                                                                    className="text-sm"
                                                                                                >
                                                                                                    {task.status === "in_progress"
                                                                                                        ? "In Progress"
                                                                                                        : task.status
                                                                                                            .charAt(0)
                                                                                                            .toUpperCase() +
                                                                                                        task.status.slice(1)}
                                                                                                </Badge>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    {task.description && (
                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                                                                <Label className="text-sm font-semibold text-muted-foreground">
                                                                                                    Description
                                                                                                </Label>
                                                                                            </div>
                                                                                            <div className="bg-muted/50 p-4 rounded-lg border">
                                                                                                <p className="text-sm leading-relaxed">
                                                                                                    {task.description}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="flex justify-between items-center pt-4 border-t">
                                                                                        <div className="text-xs text-muted-foreground"></div>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() => {
                                                                                                setSelectedEditTask(task);
                                                                                                setIsEditTaskModalOpen(true);
                                                                                                setExpandedTaskId(null);
                                                                                            }}
                                                                                        >
                                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                                            Edit Task
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan={8}
                                                                    className="py-8 text-center text-muted-foreground"
                                                                >
                                                                    No tasks found. Add a new task to get started.
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
                        </>
                    )}
                    {timelineSubview === "activeTasks" && <ActiveTasksList />}
                    {timelineSubview === "completedTasks" && <CompletedTasksList />}
                    {timelineSubview === "onSchedule" && <OnScheduleTasksList />}
                    {timelineSubview === "resourceUtilization" && (
                        <ResourceUtilizationView />
                    )}
                    {timelineSubview === "taskDetail" && <TaskDetailView />}
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    {reportsSubview === "mainReports" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatCard
                                    title="DPRs Submitted"
                                    value={reportsStats.dprsSubmitted.toString()}
                                    icon={FileText}
                                    description="This month"
                                    onClick={() => setReportsSubview("dprList")}
                                />
                                <StatCard
                                    title="WPRs Completed"
                                    value={reportsStats.wprsCompleted.toString()}
                                    icon={Calendar}
                                    description="This month"
                                    onClick={() => setReportsSubview("wprList")}
                                />
                                {/* <StatCard
                  title="Average Score"
                  value={reportsStats.averageScore}
                  icon={HardHat}
                  description="Report quality"
                  onClick={() => setReportsSubview("reportQuality")}
                /> */}
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report Upload Panel</CardTitle>
                                    <CardDescription>
                                        Submit daily and weekly progress reports
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border rounded-lg p-4">
                                            <h3 className="font-medium mb-4">
                                                Daily Progress Report (DPR)
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="text-sm text-muted-foreground">
                                                    Upload today's work progress, photos, and notes
                                                </div>
                                                <Button
                                                    onClick={() => setIsDPRModalOpen(true)}
                                                    className="w-full"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload DPR
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="border rounded-lg p-4">
                                            <h3 className="font-medium mb-4">
                                                Weekly Progress Report (WPR)
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="text-sm text-muted-foreground">
                                                    Submit weekly milestone progress and team performance
                                                </div>
                                                <Button
                                                    onClick={() => setIsWPRModalOpen(true)}
                                                    className="w-full"
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Upload WPR
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report History</CardTitle>
                                    <CardDescription>
                                        Previously submitted reports
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(() => {
                                            // Combine DPRs and WPRs into a single array
                                            const combinedReports = [
                                                ...dprs.map((dpr) => ({
                                                    ...dpr,
                                                    type: "DPR",
                                                    date: new Date(dpr.createdAt).toLocaleDateString(),

                                                    photos: 0,
                                                })),
                                                ...wprs.map((wpr) => ({
                                                    ...wpr,
                                                    type: "WPR",
                                                    date: new Date(wpr.createdAt).toLocaleDateString(),

                                                    photos: 0,
                                                })),
                                            ].sort(
                                                (a, b) =>
                                                    new Date(b.createdAt).getTime() -
                                                    new Date(a.createdAt).getTime()
                                            );

                                            if (combinedReports.length === 0) {
                                                return (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                        <p>No reports submitted yet</p>
                                                    </div>
                                                );
                                            }

                                            return combinedReports.map((report, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-4 border rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant="outline">{report.type}</Badge>
                                                            <span className="font-medium">{report.date}</span>
                                                            {report.weather && (
                                                                <Badge variant="secondary">
                                                                    {report.weather}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {/* <p className="text-sm text-muted-foreground mt-1">
                            {report.photos} photos attached
                          </p> */}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                console.log("Clicked report:", report);
                                                                setSelectedReport({
                                                                    ...report,
                                                                    photos: report.photos || 0,
                                                                });
                                                                setIsViewReportModalOpen(true);
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                        {/* <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.info(
                                `Downloading ${report.type} from ${report.date}`
                              )
                            }
                          >
                            Download
                          </Button> */}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    {reportsSubview === "dprList" && <DPRListView />}
                    {reportsSubview === "wprList" && <WPRListView />}
                    {reportsSubview === "reportQuality" && <ReportQualityView />}
                </TabsContent>

                <TabsContent value="materials" className="space-y-6">
                    {materialsSubview === "mainMaterials" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Pending Requests"
                                    value={materialStats.pendingRequests.toString()}
                                    icon={Package}
                                    description="Material requests"
                                    onClick={() => setMaterialsSubview("pendingRequests")}
                                />
                                <StatCard
                                    title="Received Today"
                                    value={materialStats.receivedToday.toString()}
                                    icon={Package}
                                    description="Material deliveries"
                                    onClick={() => setMaterialsSubview("receivedToday")}
                                />
                                <StatCard
                                    title="Utilization Rate"
                                    value={`${materialStats.utilizationRate}%`}
                                    icon={Package}
                                    description="Material efficiency"
                                    onClick={() => setMaterialsSubview("utilizationRate")}
                                />
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Material Usage vs Request</CardTitle>
                                    <CardDescription>
                                        Consumption tracking and efficiency
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={materialUsage}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="material" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="requested" fill="#3b82f6" />
                                            <Bar dataKey="used" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {materialUsage.map((material) => (
                                            <Button
                                                key={material.material}
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => handleReceiveMaterial(material.material)}
                                            >
                                                Log {material.material} Delivery
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Material Requests</CardTitle>
                                        <CardDescription>
                                            Current and pending material requirements
                                        </CardDescription>
                                    </div>
                                    {/* <Button
                    onClick={() => setIsMaterialRequestModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Raise Request
                  </Button> */}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {materialRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="font-medium">{request.id}</h3>
                                                        <Badge
                                                            variant={
                                                                request.status === "Approved"
                                                                    ? "default"
                                                                    : request.status === "In Transit"
                                                                        ? "secondary"
                                                                        : request.status === "Expedited"
                                                                            ? "destructive"
                                                                            : "outline"
                                                            }
                                                        >
                                                            {request.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {request.item} • {request.quantity}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Requested: {request.requestDate} • Expected:{" "}
                                                        {request.expectedDelivery}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedMaterialRequest(request);
                                                            setIsMaterialRequestUpdateModalOpen(true);
                                                        }}
                                                    >
                                                        Update
                                                    </Button>
                                                    {request.status === "Pending" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemindRequest(request.id)}
                                                        >
                                                            Remind
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    {materialsSubview === "pendingRequests" && <PendingRequestsView />}
                    {materialsSubview === "receivedToday" && <ReceivedTodayView />}
                    {materialsSubview === "utilizationRate" && <UtilizationRateView />}
                </TabsContent>

                <TabsContent value="issues" className="space-y-6">
                    {issuesSubview === "mainIssues" ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Open Issues"
                                    value="12"
                                    icon={AlertTriangle}
                                    description="Requiring attention"
                                    onClick={() => setIssuesSubview("openIssues")}
                                />
                                <StatCard
                                    title="High Priority"
                                    value="3"
                                    icon={AlertTriangle}
                                    description="Critical issues"
                                    onClick={() => setIssuesSubview("highPriority")}
                                />
                                <StatCard
                                    title="Resolved This Week"
                                    value="8"
                                    icon={HardHat}
                                    description="Issues fixed"
                                    onClick={() => setIssuesSubview("resolvedThisWeek")}
                                />
                            </div>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Site Issue Tracker</CardTitle>
                                        <CardDescription>
                                            Safety, quality, and operational issues
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => setIsIssueModalOpen(true)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Issue
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={[
                                            ...issueColumns,
                                            {
                                                id: "actions",
                                                header: "Actions",
                                                cell: ({ row }) => (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedIssue(row.original);
                                                                setIsViewIssueModalOpen(true);
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setIssues((prevIssues) =>
                                                                    prevIssues.map((issue) =>
                                                                        issue.id === row.original.id
                                                                            ? { ...issue, status: "Resolved" }
                                                                            : issue
                                                                    )
                                                                );
                                                                toast.success(
                                                                    `${row.original.id} marked as resolved`
                                                                );
                                                            }}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    </div>
                                                ),
                                            },
                                        ]}
                                        data={issues}
                                        searchKey="description"
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Risk Heatmap</CardTitle>
                                    <CardDescription>
                                        Issue severity and impact analysis
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {["Low", "Medium", "High"].map((severity) => (
                                            <div key={severity} className="space-y-2">
                                                <h3 className="font-medium text-center">
                                                    {severity} Severity
                                                </h3>
                                                {["Schedule", "Cost", "Safety"].map((impact) => (
                                                    <div
                                                        key={impact}
                                                        className={`p-4 rounded-lg text-center cursor-pointer transition-colors ${severity === "High"
                                                            ? "bg-red-100 hover:bg-red-200"
                                                            : severity === "Medium"
                                                                ? "bg-yellow-100 hover:bg-yellow-200"
                                                                : "bg-green-100 hover:bg-green-200"
                                                            }`}
                                                        onClick={() =>
                                                            toast.info(
                                                                `Viewing ${severity} severity ${impact} issues`
                                                            )
                                                        }
                                                    >
                                                        <div className="font-medium">{impact}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {severity === "High"
                                                                ? "3"
                                                                : severity === "Medium"
                                                                    ? "2"
                                                                    : "1"}{" "}
                                                            issues
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        // Subview content
                        <>
                            {issuesSubview === "openIssues" && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">Open Issues</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIssuesSubview("mainIssues")}
                                        >
                                            Back to Issues
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent>
                                            <DataTable
                                                columns={[
                                                    ...issueColumns,
                                                    {
                                                        id: "actions",
                                                        header: "Actions",
                                                        cell: ({ row }) => (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedIssue(row.original);
                                                                        setIsViewIssueModalOpen(true);
                                                                    }}
                                                                >
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setIssues((prevIssues) =>
                                                                            prevIssues.map((issue) =>
                                                                                issue.id === row.original.id
                                                                                    ? { ...issue, status: "Resolved" }
                                                                                    : issue
                                                                            )
                                                                        );
                                                                        toast.success(
                                                                            `${row.original.id} marked as resolved`
                                                                        );
                                                                    }}
                                                                >
                                                                    Resolve
                                                                </Button>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                data={issues.filter((issue) => issue.status === "Open")}
                                                searchKey="description"
                                            />
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                            {issuesSubview === "highPriority" && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">High Priority Issues</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIssuesSubview("mainIssues")}
                                        >
                                            Back to Issues
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent>
                                            <DataTable
                                                columns={[
                                                    ...issueColumns,
                                                    {
                                                        id: "actions",
                                                        header: "Actions",
                                                        cell: ({ row }) => (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedIssue(row.original);
                                                                        setIsViewIssueModalOpen(true);
                                                                    }}
                                                                >
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setIssues((prevIssues) =>
                                                                            prevIssues.map((issue) =>
                                                                                issue.id === row.original.id
                                                                                    ? { ...issue, status: "Resolved" }
                                                                                    : issue
                                                                            )
                                                                        );
                                                                        toast.success(
                                                                            `${row.original.id} marked as resolved`
                                                                        );
                                                                    }}
                                                                >
                                                                    Resolve
                                                                </Button>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                data={issues.filter(
                                                    (issue) => issue.severity === "High"
                                                )}
                                                searchKey="description"
                                            />
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                            {issuesSubview === "resolvedThisWeek" && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">Resolved This Week</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIssuesSubview("mainIssues")}
                                        >
                                            Back to Issues
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent>
                                            <DataTable
                                                columns={[
                                                    ...issueColumns,
                                                    {
                                                        id: "actions",
                                                        header: "Actions",
                                                        cell: ({ row }) => (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedIssue(row.original);
                                                                        setIsViewIssueModalOpen(true);
                                                                    }}
                                                                >
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setIssues((prevIssues) =>
                                                                            prevIssues.map((issue) =>
                                                                                issue.id === row.original.id
                                                                                    ? { ...issue, status: "Resolved" }
                                                                                    : issue
                                                                            )
                                                                        );
                                                                        toast.success(
                                                                            `${row.original.id} marked as resolved`
                                                                        );
                                                                    }}
                                                                >
                                                                    Resolve
                                                                </Button>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                                data={issues.filter(
                                                    (issue) => issue.status === "Resolved"
                                                )}
                                                searchKey="description"
                                            />
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="cost" className="space-y-6">
                    {costSubview === "mainCost" ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Total Cost"
                                    value="₹1,250,000"
                                    icon={DollarSign}
                                    description="Projected vs Actual"
                                    trend={{ value: -2.5, label: "vs budget" }}
                                    onClick={() => setCostSubview("totalCost")}
                                />
                                <StatCard
                                    title="Labor Utilization"
                                    value="92%"
                                    icon={Users}
                                    description="Team efficiency"
                                    trend={{ value: 3, label: "vs last week" }}
                                    onClick={() => setCostSubview("laborUtilization")}
                                />
                                <StatCard
                                    title="Equipment Utilization"
                                    value="85%"
                                    icon={Truck}
                                    description="Equipment efficiency"
                                    trend={{ value: -1, label: "vs target" }}
                                    onClick={() => setCostSubview("equipmentUtilization")}
                                />
                            </div>
                            {/* Main Cost Analysis Content (unchanged) */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Cost Analysis</CardTitle>
                                        <CardDescription>Budget vs. Actual Matrix</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => toast.info("Exporting cost report")}
                                        >
                                            Export Report
                                        </Button>
                                        <Button onClick={() => setIsBudgetAdjustModalOpen(true)}>
                                            Adjust Budget
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={safeCostData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="category" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="planned" fill="#3b82f6" name="Planned" />
                                                <Bar dataKey="actual" fill="#10b981" name="Actual" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="grid grid-cols-2 gap-4">
                                            {safeCostData.map((item) => (
                                                <div
                                                    key={item.category}
                                                    className="p-4 border rounded-lg"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-medium">{item.category}</h3>
                                                        <Badge
                                                            variant={
                                                                item.actual > item.planned
                                                                    ? "destructive"
                                                                    : "default"
                                                            }
                                                        >
                                                            {item.actual > item.planned
                                                                ? "Over Budget"
                                                                : "Under Budget"}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-2 space-y-1">
                                                        <div className="text-sm text-muted-foreground">
                                                            Planned: ₹{item.planned.toLocaleString()}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Actual: ₹{item.actual.toLocaleString()}
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            Variance:{" "}
                                                            {(
                                                                ((item.actual - item.planned) / item.planned) *
                                                                100
                                                            ).toFixed(1)}
                                                            %
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Labor Cost Dashboard</CardTitle>
                                            <CardDescription>
                                                Productive vs Non-Productive Labor
                                            </CardDescription>
                                        </div>
                                        <Button onClick={() => setIsLaborModalOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Log Hours
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Productive Labor Section */}
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                                                Productive Labor
                                            </h3>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart
                                                    data={safeLaborData.filter(
                                                        (item) => item.type === "productive"
                                                    )}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="trade" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="planned"
                                                        fill="#3b82f6"
                                                        name="Planned Hours"
                                                    />
                                                    <Bar
                                                        dataKey="actual"
                                                        fill="#10b981"
                                                        name="Actual Hours"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className="mt-2 space-y-2">
                                                {safeLaborData
                                                    .filter((item) => item.type === "productive")
                                                    .map((item) => (
                                                        <div
                                                            key={item.trade}
                                                            className="flex items-center justify-between p-2 border rounded-lg"
                                                        >
                                                            <div>
                                                                <div className="font-medium">{item.trade}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {item.actual} / {item.planned} hours
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {item.actual > item.planned * 1.15 && (
                                                                    <Badge variant="destructive">OT Alert</Badge>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleViewLaborDetails(item.trade)
                                                                    }
                                                                >
                                                                    Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                        {/* Non-Productive Labor Section */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
                                                Non-Productive Labor
                                            </h3>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart
                                                    data={safeLaborData.filter(
                                                        (item) => item.type === "non-productive"
                                                    )}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="trade" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="planned"
                                                        fill="#8b5cf6"
                                                        name="Planned Hours"
                                                    />
                                                    <Bar
                                                        dataKey="actual"
                                                        fill="#d946ef"
                                                        name="Actual Hours"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className="mt-2 space-y-2">
                                                {safeLaborData
                                                    .filter((item) => item.type === "non-productive")
                                                    .map((item) => (
                                                        <div
                                                            key={item.trade}
                                                            className="flex items-center justify-between p-2 border rounded-lg"
                                                        >
                                                            <div>
                                                                <div className="font-medium">{item.trade}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {item.actual} / {item.planned} hours
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {item.actual > item.planned * 1.15 && (
                                                                    <Badge variant="destructive">OT Alert</Badge>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleViewLaborDetails(item.trade)
                                                                    }
                                                                >
                                                                    Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Equipment & Fleet Control</CardTitle>
                                            <CardDescription>
                                                Maintenance and Utilization
                                            </CardDescription>
                                        </div>
                                        <Button onClick={() => setIsEquipmentModalOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Log Maintenance
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {equipmentList.map((item) => (
                                                <div key={item.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="font-medium">{item.name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.id}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                item.status === "Active"
                                                                    ? "default"
                                                                    : item.status === "Warning"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                            }
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Hours Used:</span>
                                                            <span>{item.hours}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span>Next Service:</span>
                                                            <Badge
                                                                variant={
                                                                    item.nextService === "Due Now"
                                                                        ? "destructive"
                                                                        : "outline"
                                                                }
                                                            >
                                                                {item.nextService}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full"
                                                                onClick={() => handleViewEquipmentLogs(item)}
                                                            >
                                                                View Logs
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full"
                                                                onClick={() => handleTrackEquipment(item)}
                                                            >
                                                                Track Location
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Purchase Orders</CardTitle>
                                        <CardDescription>
                                            Procurement & Approval Workflow
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => setIsPOModalOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create PO
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={[
                                            ...purchaseOrderColumns,
                                            {
                                                id: "actions",
                                                header: "Actions",
                                                cell: ({ row }) => {
                                                    const po = row.original;
                                                    const status = po.status;
                                                    return (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePOView(po)}
                                                            >
                                                                View
                                                            </Button>
                                                            {status === "Pending" && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedPO(po);
                                                                        setIsPOApproveModalOpen(true);
                                                                    }}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            )}
                                                            {status === "Escalated" && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedPO(po);
                                                                        setIsPOExpediteModalOpen(true);
                                                                    }}
                                                                >
                                                                    Expedite
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            },
                                        ]}
                                        data={purchaseOrders}
                                        searchKey="id"
                                    />
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        // Subview content
                        <>
                            {costSubview === "totalCost" && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">Total Cost</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCostSubview("mainCost")}
                                        >
                                            Back to Cost Analysis
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={safeCostData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="category" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="planned"
                                                        fill="#3b82f6"
                                                        name="Planned"
                                                    />
                                                    <Bar dataKey="actual" fill="#10b981" name="Actual" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                {safeCostData.map((item) => (
                                                    <div
                                                        key={item.category}
                                                        className="p-4 border rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-medium">{item.category}</h3>
                                                            <Badge
                                                                variant={
                                                                    item.actual > item.planned
                                                                        ? "destructive"
                                                                        : "default"
                                                                }
                                                            >
                                                                {item.actual > item.planned
                                                                    ? "Over Budget"
                                                                    : "Under Budget"}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="text-sm text-muted-foreground">
                                                                Planned: ₹{item.planned.toLocaleString()}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Actual: ₹{item.actual.toLocaleString()}
                                                            </div>
                                                            <div className="text-sm font-medium">
                                                                Variance:{" "}
                                                                {(
                                                                    ((item.actual - item.planned) /
                                                                        item.planned) *
                                                                    100
                                                                ).toFixed(1)}
                                                                %
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                            {costSubview === "laborUtilization" && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">Labor Utilization</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCostSubview("mainCost")}
                                        >
                                            Back to Cost Analysis
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={safeLaborData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="trade" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="planned"
                                                        fill="#3b82f6"
                                                        name="Planned Hours"
                                                    />
                                                    <Bar
                                                        dataKey="actual"
                                                        fill="#10b981"
                                                        name="Actual Hours"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                {safeLaborData.map((item) => (
                                                    <div
                                                        key={item.trade}
                                                        className="p-4 border rounded-lg"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-medium">{item.trade}</h3>
                                                            <Badge
                                                                variant={
                                                                    item.actual > item.planned * 1.15
                                                                        ? "destructive"
                                                                        : "default"
                                                                }
                                                            >
                                                                {item.actual > item.planned * 1.15
                                                                    ? "OT Alert"
                                                                    : "Normal"}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="text-sm text-muted-foreground">
                                                                Planned: {item.planned}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Actual: {item.actual}
                                                            </div>
                                                            <div className="text-sm font-medium">
                                                                Variance: {item.actual - item.planned}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                            {costSubview === "equipmentUtilization" && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">Equipment Utilization</h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCostSubview("mainCost")}
                                        >
                                            Back to Cost Analysis
                                        </Button>
                                    </div>
                                    <Card>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={equipmentList}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="hours"
                                                        fill="#3b82f6"
                                                        name="Hours Used"
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                {equipmentList.map((item) => (
                                                    <div key={item.id} className="p-4 border rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-medium">{item.name}</h3>
                                                            <Badge
                                                                variant={
                                                                    item.status === "Active"
                                                                        ? "default"
                                                                        : item.status === "Warning"
                                                                            ? "destructive"
                                                                            : "secondary"
                                                                }
                                                            >
                                                                {item.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="text-sm text-muted-foreground">
                                                                Hours Used: {item.hours}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Next Service: {item.nextService}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="store-manager" className="space-y-6">
                    {storeManagerSubview === "main" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <StatCard
                                    title="Active Personnel"
                                    value="24"
                                    icon={Package}
                                    description="Currently on duty"
                                    onClick={() => setStoreManagerSubview("activePersonnel")}
                                />
                                <StatCard
                                    title="Store Performance"
                                    value="94%"
                                    icon={CheckCircle2}
                                    description="Fulfillment rate"
                                    onClick={() => setStoreManagerSubview("performance")}
                                />
                                <StatCard
                                    title="Pending Actions"
                                    value="12"
                                    icon={Clock}
                                    description="Need attention"
                                    onClick={() => setStoreManagerSubview("pendingActions")}
                                />
                                <StatCard
                                    title="Active Sites"
                                    value="8"
                                    icon={Building2}
                                    description="Receiving supplies"
                                    onClick={() => setStoreManagerSubview("activeSites")}
                                />
                            </div>
                            {/* Render all detailed cards/components below the StatCards row */}
                            {/* Store Manager Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Staff Management */}
                                {/* <Card>
                  <CardHeader>
                    <CardTitle>Store Staff Management</CardTitle>
                    <CardDescription>
                      Manage store personnel and responsibilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {storeStaff.map((staff, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{staff.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {staff.role}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {staff.certifications.map((cert, i) => (
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
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  staff.status === "On Duty"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {staff.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Show confirmation dialog using toast
                                  toast.promise(
                                    new Promise((resolve) => {
                                      // Simulate a brief delay for visual feedback
                                      setTimeout(() => {
                                        // Remove the staff member
                                        setStoreStaff((prevStaff) =>
                                          prevStaff.filter(
                                            (_, i) => i !== index
                                          )
                                        );
                                        resolve(true);
                                      }, 300);
                                    }),
                                    {
                                      loading: "Removing staff member...",
                                      success: `${staff.name} has been removed from the staff list`,
                                      error: "Failed to remove staff member",
                                    }
                                  );
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-trash-2"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                            <div>Availability: {staff.availability}</div>
                            <div>Experience: {staff.experience}</div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                toast.info(`Scheduling ${staff.name}`, {
                                  description: `Opening scheduler for ${staff.availability} staff member`,
                                })
                              }
                            >
                              Schedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                toast.info(
                                  `${staff.name}'s Performance Metrics`,
                                  {
                                    description: `Viewing detailed performance history and metrics`,
                                  }
                                )
                              }
                            >
                              Performance
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setIsAddStaffModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Staff
                    </Button>
                  </CardContent>
                </Card> */}

                                {/* Advanced Analytics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Store Performance Analytics</CardTitle>
                                        <CardDescription>
                                            Detailed performance metrics and indicators
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium mb-2">
                                                    Store Response Time
                                                </h3>
                                                <div className="space-y-2">
                                                    {[
                                                        {
                                                            label: "Urgent Requests",
                                                            value: 45,
                                                            unit: "minutes",
                                                            target: 60,
                                                            status: "good",
                                                        },
                                                        {
                                                            label: "Regular Requests",
                                                            value: 4.5,
                                                            unit: "hours",
                                                            target: 6,
                                                            status: "good",
                                                        },
                                                        {
                                                            label: "Inter-site Transfers",
                                                            value: 28,
                                                            unit: "hours",
                                                            target: 24,
                                                            status: "warning",
                                                        },
                                                    ].map((metric, idx) => (
                                                        <div key={idx} className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span>{metric.label}</span>
                                                                <span
                                                                    className={
                                                                        metric.status === "good"
                                                                            ? "text-green-600"
                                                                            : "text-amber-600"
                                                                    }
                                                                >
                                                                    {metric.value} {metric.unit} (Target:{" "}
                                                                    {metric.target} {metric.unit})
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${metric.status === "good"
                                                                        ? "bg-green-600"
                                                                        : "bg-amber-600"
                                                                        }`}
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            100,
                                                                            (metric.value / metric.target) * 100
                                                                        )}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium mb-2">
                                                    Order Fulfillment Rate
                                                </h3>
                                                <ResponsiveContainer width="100%" height={120}>
                                                    <LineChart
                                                        data={[
                                                            { month: "Jan", rate: 92 },
                                                            { month: "Feb", rate: 94 },
                                                            { month: "Mar", rate: 91 },
                                                            { month: "Apr", rate: 95 },
                                                            { month: "May", rate: 97 },
                                                            { month: "Jun", rate: 94 },
                                                        ]}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis domain={[85, 100]} />
                                                        <Tooltip />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="rate"
                                                            stroke="#10b981"
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    toast.success("Report Generated", {
                                                        description:
                                                            "Store performance report has been exported to Excel",
                                                    })
                                                }
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Export Detailed Report
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Store Operations and Processes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Store Operations & Process Management</CardTitle>
                                    <CardDescription>
                                        Standard operating procedures and workflow management
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Process Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[
                                                {
                                                    name: "Goods Receiving",
                                                    status: "Optimized",
                                                    efficiency: 92,
                                                    lastReview: "2023-05-15",
                                                    owner: "Jane Smith",
                                                    documents: 4,
                                                },
                                                {
                                                    name: "Order Fulfillment",
                                                    status: "Under Review",
                                                    efficiency: 78,
                                                    lastReview: "2023-04-10",
                                                    owner: "Mike Johnson",
                                                    documents: 6,
                                                },
                                                {
                                                    name: "Quality Control",
                                                    status: "Optimized",
                                                    efficiency: 95,
                                                    lastReview: "2023-05-20",
                                                    owner: "John Doe",
                                                    documents: 3,
                                                },
                                                {
                                                    name: "Material Transfer",
                                                    status: "Needs Improvement",
                                                    efficiency: 68,
                                                    lastReview: "2023-03-25",
                                                    owner: "Jane Smith",
                                                    documents: 5,
                                                },
                                                {
                                                    name: "Returns Processing",
                                                    status: "Optimized",
                                                    efficiency: 88,
                                                    lastReview: "2023-05-05",
                                                    owner: "Mike Johnson",
                                                    documents: 4,
                                                },
                                                {
                                                    name: "Inventory Counting",
                                                    status: "Under Review",
                                                    efficiency: 82,
                                                    lastReview: "2023-04-15",
                                                    owner: "John Doe",
                                                    documents: 7,
                                                },
                                            ].map((process, idx) => (
                                                <div key={idx} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="font-medium">{process.name}</h3>
                                                        <Badge
                                                            variant={
                                                                process.status === "Optimized"
                                                                    ? "default"
                                                                    : process.status === "Under Review"
                                                                        ? "outline"
                                                                        : "destructive"
                                                            }
                                                        >
                                                            {process.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span>Process Efficiency</span>
                                                            <span
                                                                className={
                                                                    process.efficiency > 85
                                                                        ? "text-green-600"
                                                                        : process.efficiency > 70
                                                                            ? "text-amber-600"
                                                                            : "text-red-600"
                                                                }
                                                            >
                                                                {process.efficiency}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${process.efficiency > 85
                                                                    ? "bg-green-600"
                                                                    : process.efficiency > 70
                                                                        ? "bg-amber-600"
                                                                        : "bg-red-600"
                                                                    }`}
                                                                style={{ width: `${process.efficiency}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                                        <div>Last Review: {process.lastReview}</div>
                                                        <div>Process Owner: {process.owner}</div>
                                                        <div>Documents: {process.documents}</div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full mt-3"
                                                        onClick={() =>
                                                            toast.info(`Managing ${process.name} Process`, {
                                                                description: `Opening process workflow editor with ${process.documents} associated documents`,
                                                            })
                                                        }
                                                    >
                                                        Manage Process
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Process Improvement Initiatives */}
                                        <Card>
                                            <CardHeader className="py-3">
                                                <CardTitle className="text-sm">
                                                    Active Process Improvement Initiatives
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {[
                                                        {
                                                            name: "Digital Receiving Implementation",
                                                            completion: 65,
                                                            dueDate: "2023-07-15",
                                                            status: "On Track",
                                                            owner: "Jane Smith",
                                                        },
                                                        {
                                                            name: "Barcode System Upgrade",
                                                            completion: 40,
                                                            dueDate: "2023-08-10",
                                                            status: "Delayed",
                                                            owner: "Mike Johnson",
                                                        },
                                                        {
                                                            name: "Cross-Store Inventory Standardization",
                                                            completion: 85,
                                                            dueDate: "2023-06-30",
                                                            status: "On Track",
                                                            owner: "John Doe",
                                                        },
                                                    ].map((initiative, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center p-3 border rounded-lg"
                                                        >
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-sm">
                                                                    {initiative.name}
                                                                </h4>
                                                                <div className="flex justify-between text-xs text-muted-foreground mt-1 mb-2">
                                                                    <span>Due: {initiative.dueDate}</span>
                                                                    <span>Owner: {initiative.owner}</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                    <div
                                                                        className={`h-1.5 rounded-full ${initiative.status === "On Track"
                                                                            ? "bg-green-600"
                                                                            : "bg-amber-600"
                                                                            }`}
                                                                        style={{
                                                                            width: `${initiative.completion}%`,
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    initiative.status === "On Track"
                                                                        ? "outline"
                                                                        : "destructive"
                                                                }
                                                                className="ml-4"
                                                            >
                                                                {initiative.status}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Store Compliance & Documentation */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compliance & Documentation Management</CardTitle>
                                    <CardDescription>
                                        Manage regulatory compliance and documentation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Compliance Status */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                {
                                                    area: "Safety & Hazmat",
                                                    status: "Compliant",
                                                    lastAudit: "2023-05-10",
                                                    nextAudit: "2023-08-10",
                                                    documents: 12,
                                                },
                                                {
                                                    area: "Environmental",
                                                    status: "Needs Review",
                                                    lastAudit: "2023-04-15",
                                                    nextAudit: "2023-07-15",
                                                    documents: 8,
                                                },
                                                {
                                                    area: "Quality Management",
                                                    status: "Compliant",
                                                    lastAudit: "2023-05-20",
                                                    nextAudit: "2023-08-20",
                                                    documents: 15,
                                                },
                                                {
                                                    area: "Inventory Controls",
                                                    status: "Compliant",
                                                    lastAudit: "2023-05-05",
                                                    nextAudit: "2023-08-05",
                                                    documents: 10,
                                                },
                                            ].map((area, idx) => (
                                                <div key={idx} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-medium">{area.area}</h3>
                                                        <Badge
                                                            variant={
                                                                area.status === "Compliant"
                                                                    ? "default"
                                                                    : "destructive"
                                                            }
                                                        >
                                                            {area.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground space-y-1">
                                                        <div>Last Audit: {area.lastAudit}</div>
                                                        <div>Next Audit: {area.nextAudit}</div>
                                                        <div>{area.documents} Documents</div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full mt-3"
                                                        onClick={() =>
                                                            toast.info(`Viewing ${area.area} Documents`, {
                                                                description: `Opening document repository with ${area.documents} compliance documents`,
                                                            })
                                                        }
                                                    >
                                                        View Documents
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Recent Document Activity */}
                                        <div>
                                            <h3 className="font-medium mb-3">
                                                Recent Document Activity
                                            </h3>
                                            <div className="space-y-2">
                                                {[
                                                    {
                                                        type: "Update",
                                                        document: "Material Handling Procedure v2.3",
                                                        user: "John Doe",
                                                        timestamp: "2 hours ago",
                                                    },
                                                    {
                                                        type: "Upload",
                                                        document: "Q2 Safety Inspection Report",
                                                        user: "Jane Smith",
                                                        timestamp: "5 hours ago",
                                                    },
                                                    {
                                                        type: "Review",
                                                        document: "Hazardous Materials Storage Guidelines",
                                                        user: "Mike Johnson",
                                                        timestamp: "1 day ago",
                                                    },
                                                    {
                                                        type: "Update",
                                                        document: "Receiving Procedure v1.8",
                                                        user: "Jane Smith",
                                                        timestamp: "2 days ago",
                                                    },
                                                ].map((activity, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 border rounded-lg"
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                className={`w-2 h-2 rounded-full mr-3 ${activity.type === "Update"
                                                                    ? "bg-blue-500"
                                                                    : activity.type === "Upload"
                                                                        ? "bg-green-500"
                                                                        : "bg-amber-500"
                                                                    }`}
                                                            ></div>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {activity.document}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {activity.type} by {activity.user}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {activity.timestamp}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        toast.info("Upload New Document", {
                                                            description: "Opening document upload form",
                                                        })
                                                    }
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Upload Document
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        toast.info("Document Repository", {
                                                            description:
                                                                "Opening the complete document management system",
                                                        })
                                                    }
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View Document Repository
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inventory Status Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Status Overview</CardTitle>
                                    <CardDescription>
                                        Current stock levels and inventory movements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                {
                                                    category: "Critical Materials",
                                                    stockLevel: "92%",
                                                    items: 35,
                                                    value: "₹8.2M",
                                                    trend: "+2%",
                                                },
                                                {
                                                    category: "Regular Supplies",
                                                    stockLevel: "78%",
                                                    items: 120,
                                                    value: "₹4.5M",
                                                    trend: "-5%",
                                                },
                                                {
                                                    category: "Consumables",
                                                    stockLevel: "65%",
                                                    items: 210,
                                                    value: "₹2.3M",
                                                    trend: "+1%",
                                                },
                                                {
                                                    category: "Equipment & Tools",
                                                    stockLevel: "88%",
                                                    items: 65,
                                                    value: "₹12.7M",
                                                    trend: "0%",
                                                },
                                            ].map((category, idx) => (
                                                <div key={idx} className="border rounded-lg p-4">
                                                    <h3 className="font-medium">{category.category}</h3>
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">
                                                                Stock Level:
                                                            </span>
                                                            <span className="font-medium">
                                                                {category.stockLevel}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">
                                                                Items:
                                                            </span>
                                                            <span>{category.items}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">
                                                                Value:
                                                            </span>
                                                            <span>{category.value}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">
                                                                Trend:
                                                            </span>
                                                            <span
                                                                className={
                                                                    category.trend.startsWith("+")
                                                                        ? "text-green-600"
                                                                        : category.trend.startsWith("-")
                                                                            ? "text-red-600"
                                                                            : "text-gray-600"
                                                                }
                                                            >
                                                                {category.trend}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-medium mb-3">
                                                    Recent Stock Movements
                                                </h3>
                                                <div className="space-y-2">
                                                    {[
                                                        {
                                                            type: "In",
                                                            material: "Steel Reinforcement",
                                                            quantity: "2.5 tons",
                                                            destination: "North Block",
                                                            timestamp: "3 hours ago",
                                                        },
                                                        {
                                                            type: "Out",
                                                            material: "Portland Cement",
                                                            quantity: "120 bags",
                                                            destination: "South Tower",
                                                            timestamp: "5 hours ago",
                                                        },
                                                        {
                                                            type: "In",
                                                            material: "PVC Pipes",
                                                            quantity: "350 units",
                                                            destination: "Main Warehouse",
                                                            timestamp: "1 day ago",
                                                        },
                                                        {
                                                            type: "Out",
                                                            material: "Electrical Fittings",
                                                            quantity: "85 boxes",
                                                            destination: "East Wing",
                                                            timestamp: "1 day ago",
                                                        },
                                                    ].map((movement, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-3 border rounded-lg"
                                                        >
                                                            <div className="flex items-center">
                                                                <Badge
                                                                    variant={
                                                                        movement.type === "In"
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                    className="mr-3"
                                                                >
                                                                    {movement.type}
                                                                </Badge>
                                                                <div>
                                                                    <p className="font-medium text-sm">
                                                                        {movement.material}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {movement.quantity} • {movement.destination}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {movement.timestamp}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium mb-3">
                                                    Low Stock Alerts
                                                </h3>
                                                <div className="space-y-2">
                                                    {[
                                                        {
                                                            material: "Waterproofing Compound",
                                                            currentStock: "5 barrels",
                                                            threshold: "10 barrels",
                                                            priority: "High",
                                                        },
                                                        {
                                                            material: "Electrical Conduits",
                                                            currentStock: "120 units",
                                                            threshold: "200 units",
                                                            priority: "Medium",
                                                        },
                                                        {
                                                            material: "Concrete Admixture",
                                                            currentStock: "15 containers",
                                                            threshold: "25 containers",
                                                            priority: "Medium",
                                                        },
                                                        {
                                                            material: "Safety Gloves",
                                                            currentStock: "30 pairs",
                                                            threshold: "50 pairs",
                                                            priority: "Low",
                                                        },
                                                    ].map((alert, idx) => (
                                                        <div key={idx} className="p-3 border rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-medium text-sm">
                                                                        {alert.material}
                                                                    </p>
                                                                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                                                        <span>Current: {alert.currentStock}</span>
                                                                        <span>Threshold: {alert.threshold}</span>
                                                                    </div>
                                                                </div>
                                                                <Badge
                                                                    variant={
                                                                        alert.priority === "High"
                                                                            ? "destructive"
                                                                            : alert.priority === "Medium"
                                                                                ? "default"
                                                                                : "outline"
                                                                    }
                                                                >
                                                                    {alert.priority}
                                                                </Badge>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full mt-2"
                                                                onClick={() =>
                                                                    toast.success(`Purchase Request Created`, {
                                                                        description: `Request for ${alert.material} (${alert.currentStock} → ${alert.threshold}) has been submitted`,
                                                                    })
                                                                }
                                                            >
                                                                Create Purchase Request
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    {storeManagerSubview === "activePersonnel" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Active Personnel</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setStoreManagerSubview("main")}
                                >
                                    Back to Store Manager
                                </Button>
                            </div>
                            {/* Store Staff Management Card */}
                            <Card>
                                {/* <CardHeader>
                  <CardTitle>Store Staff Management</CardTitle>
                  <CardDescription>Manage store personnel and responsibilities</CardDescription>
                </CardHeader> */}
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {storeStaff.map((staff, index) => (
                                            <div
                                                key={index}
                                                className="p-4 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium">{staff.name}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {staff.role}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {staff.certifications.map((cert, i) => (
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
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={
                                                                staff.status === "On Duty"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            {staff.status}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toast.promise(
                                                                    new Promise((resolve) => {
                                                                        setTimeout(() => {
                                                                            setStoreStaff((prevStaff) =>
                                                                                prevStaff.filter((_, i) => i !== index)
                                                                            );
                                                                            resolve(true);
                                                                        }, 300);
                                                                    }),
                                                                    {
                                                                        loading: "Removing staff member...",
                                                                        success: `${staff.name} has been removed from the staff list`,
                                                                        error: "Failed to remove staff member",
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="lucide lucide-trash-2"
                                                            >
                                                                <path d="M3 6h18"></path>
                                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                                                    <div>Availability: {staff.availability}</div>
                                                    <div>Experience: {staff.experience}</div>
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() =>
                                                            toast.info(`Scheduling ${staff.name}`, {
                                                                description: `Opening scheduler for ${staff.availability} staff member`,
                                                            })
                                                        }
                                                    >
                                                        Schedule
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() =>
                                                            toast.info(
                                                                `${staff.name}'s Performance Metrics`,
                                                                {
                                                                    description: `Viewing detailed performance history and metrics`,
                                                                }
                                                            )
                                                        }
                                                    >
                                                        Performance
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full mt-4"
                                        onClick={() => setIsAddStaffModalOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Staff
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {storeManagerSubview === "performance" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Store Performance</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setStoreManagerSubview("main")}
                                >
                                    Back to Store Manager
                                </Button>
                            </div>
                            {/* Store Performance Analytics Card */}
                            <Card>
                                {/* <CardHeader>
                  <CardTitle>Store Performance Analytics</CardTitle>
                  <CardDescription>Detailed performance metrics and indicators</CardDescription>
                </CardHeader> */}
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium mb-2">
                                                Store Response Time
                                            </h3>
                                            <div className="space-y-2">
                                                {[
                                                    {
                                                        label: "Urgent Requests",
                                                        value: 45,
                                                        unit: "minutes",
                                                        target: 60,
                                                        status: "good",
                                                    },
                                                    {
                                                        label: "Regular Requests",
                                                        value: 4.5,
                                                        unit: "hours",
                                                        target: 6,
                                                        status: "good",
                                                    },
                                                    {
                                                        label: "Inter-site Transfers",
                                                        value: 28,
                                                        unit: "hours",
                                                        target: 24,
                                                        status: "warning",
                                                    },
                                                ].map((metric, idx) => (
                                                    <div key={idx} className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span>{metric.label}</span>
                                                            <span
                                                                className={
                                                                    metric.status === "good"
                                                                        ? "text-green-600"
                                                                        : "text-amber-600"
                                                                }
                                                            >
                                                                {metric.value} {metric.unit} (Target:{" "}
                                                                {metric.target} {metric.unit})
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${metric.status === "good"
                                                                    ? "bg-green-600"
                                                                    : "bg-amber-600"
                                                                    }`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        100,
                                                                        (metric.value / metric.target) * 100
                                                                    )}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium mb-2">
                                                Order Fulfillment Rate
                                            </h3>
                                            <ResponsiveContainer width="100%" height={120}>
                                                <LineChart
                                                    data={[
                                                        { month: "Jan", rate: 92 },
                                                        { month: "Feb", rate: 94 },
                                                        { month: "Mar", rate: 91 },
                                                        { month: "Apr", rate: 95 },
                                                        { month: "May", rate: 97 },
                                                        { month: "Jun", rate: 94 },
                                                    ]}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis domain={[85, 100]} />
                                                    <Tooltip />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="rate"
                                                        stroke="#10b981"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() =>
                                                toast.success("Report Generated", {
                                                    description:
                                                        "Store performance report has been exported to Excel",
                                                })
                                            }
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Export Detailed Report
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {storeManagerSubview === "pendingActions" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Pending Actions</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setStoreManagerSubview("main")}
                                >
                                    Back to Store Manager
                                </Button>
                            </div>
                            {/* For demo, show a filtered list of staff who are Off Duty or a placeholder */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {storeStaff.filter((staff) => staff.status !== "On Duty")
                                            .length === 0 ? (
                                            <div className="text-muted-foreground">
                                                No pending actions for staff.
                                            </div>
                                        ) : (
                                            storeStaff
                                                .filter((staff) => staff.status !== "On Duty")
                                                .map((staff, index) => (
                                                    <div key={index} className="p-4 border rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="font-medium">{staff.name}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {staff.role}
                                                                </p>
                                                            </div>
                                                            <Badge variant="secondary">{staff.status}</Badge>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-2">
                                                            Availability: {staff.availability}
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {storeManagerSubview === "activeSites" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Active Sites</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setStoreManagerSubview("main")}
                                >
                                    Back to Store Manager
                                </Button>
                            </div>
                            {/* For demo, show a placeholder for active sites overview */}
                            <Card>
                                {/* <CardHeader>
                  <CardTitle>Active Sites Overview</CardTitle>
                  <CardDescription>Sites currently receiving supplies</CardDescription>
                </CardHeader> */}
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {/* Example: List of active sites (static for now) */}
                                        {[
                                            {
                                                name: "North Block",
                                                status: "Receiving",
                                                supplies: "Steel, Cement",
                                            },
                                            {
                                                name: "South Tower",
                                                status: "Receiving",
                                                supplies: "Bricks, Sand",
                                            },
                                            { name: "Main Warehouse", status: "Idle", supplies: "-" },
                                            {
                                                name: "East Wing",
                                                status: "Receiving",
                                                supplies: "Electrical Fittings",
                                            },
                                        ]
                                            .filter((site) => site.status === "Receiving")
                                            .map((site, idx) => (
                                                <div key={idx} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-medium">{site.name}</h3>
                                                        <Badge variant="default">{site.status}</Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-2">
                                                        Supplies: {site.supplies}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="central-warehouse" className="space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span>Loading warehouse items...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                            </div>
                            <ExpandableDataTable
                                title="Warehouse Inventory Items"
                                description="Warehouse-focused view of inventory with quick insights"
                                data={inventoryItems as any[]}
                                columns={columns as any}
                                expandableContent={expandableContent as any}
                                searchKey="name"
                                filters={[
                                    { key: "category", label: "Category", options: categoryOptions },
                                    { key: "location", label: "Location", options: locationOptions },
                                ]}
                                rowActions={["view"]}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="invoices" className="space-y-6">
                    <ServiceInvoiceList
                        invoices={serviceInvoices}
                        onInvoiceCreate={handleServiceInvoiceCreate}
                        onInvoiceUpdate={handleServiceInvoiceUpdate}
                        projectId={projects[0]?.id?.toString()}
                        clientId={projects[0]?.clientId?.toString()}
                    />
                </TabsContent>
            </Tabs>
            {/* DPR Upload Modal */}
            <Dialog open={isDPRModalOpen} onOpenChange={setIsDPRModalOpen}>
                <DialogContent className="max-w-7xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Upload Daily Progress Report (DPR)</DialogTitle>
                        <DialogDescription>
                            Submit today's work progress and updates
                        </DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[70vh] bg-muted/40 rounded-md p-4">
                        <DPRManualForm
                            onSubmit={handleUploadDPR}
                            onCancel={() => setIsDPRModalOpen(false)}
                            projects={projects}
                        />
                    </div>
                </DialogContent>
            </Dialog>
            {/* WPR Upload Modal */}
            <Dialog open={isWPRModalOpen} onOpenChange={setIsWPRModalOpen}>
                <DialogContent className="max-w-7xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Upload Weekly Progress Report (WPR)</DialogTitle>
                        <DialogDescription>
                            Submit weekly milestone progress
                        </DialogDescription>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[70vh] bg-muted/40 rounded-md p-4">
                        <WPRManualForm
                            onSubmit={handleUploadWPR}
                            onCancel={() => setIsWPRModalOpen(false)}
                            projects={projects}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invoice Builder Modal - Site Dashboard */}

            {isInvoiceModalOpen && (

                <div className="-mt-4">
                    <InvoiceBuilderModal
                        showRetentionOptions={true}
                        showWorkCompleted={false}
                        onClose={() => setIsInvoiceModalOpen(false)}
                    />
                </div>
            )}
            {/* Material Request Modal */}
            <Dialog
                open={isMaterialRequestModalOpen}
                onOpenChange={setIsMaterialRequestModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Raise Material Request</DialogTitle>
                        <DialogDescription>
                            Request materials for site operations
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleRaiseMaterialRequest({
                                materialItem: formData.get("materialItem") as string,
                                quantity: formData.get("quantity") as string,
                                priority: formData.get("priority") as string,
                                useCase: formData.get("useCase") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="materialItem">Material Item</Label>
                            <Input
                                id="materialItem"
                                name="materialItem"
                                placeholder="Enter material name"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="quantity">Quantity Required</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                placeholder="Enter quantity with unit"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="priority">Priority Level</Label>
                            <Select name="priority" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="useCase">Use Case / Task ID</Label>
                            <Input
                                id="useCase"
                                name="useCase"
                                placeholder="Link to specific task (optional)"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsMaterialRequestModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Submit Request</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Add Issue Modal */}
            <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Issue</DialogTitle>
                        <DialogDescription>
                            Report a new site issue or concern
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleAddIssue({
                                category: formData.get("issueCategory") as string,
                                description: formData.get("issueDescription") as string,
                                severity: formData.get("issueSeverity") as string,
                                responsibleParty: formData.get("responsibleParty") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="issueCategory">Category</Label>
                            <Select name="issueCategory" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="quality">Quality</SelectItem>
                                    <SelectItem value="delay">Delay</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="issueDescription">Description</Label>
                            <Textarea
                                id="issueDescription"
                                name="issueDescription"
                                placeholder="Describe the issue in detail..."
                                rows={4}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="issueSeverity">Severity</Label>
                            <Select name="issueSeverity" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="responsibleParty">Tag Responsible Party</Label>
                            <Select name="responsibleParty" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select responsible party" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="site-engineer">Site Engineer</SelectItem>
                                    <SelectItem value="safety-officer">Safety Officer</SelectItem>
                                    <SelectItem value="quality-inspector">
                                        Quality Inspector
                                    </SelectItem>
                                    <SelectItem value="contractor">Contractor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsIssueModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Submit Issue</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Progress Update Modal */}
            <Dialog open={isProgressModalOpen} onOpenChange={setIsProgressModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Progress</DialogTitle>
                        <DialogDescription>
                            {selectedTask
                                ? `Updating: ${selectedTask.name}`
                                : "Update task progress"}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!selectedTask) return;
                            const formData = new FormData(e.currentTarget);
                            handleUpdateTaskStatus({
                                taskId: selectedTask.id,
                                status: formData.get("taskStatus") as string,
                                notes: formData.get("statusNotes") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="taskStatus">Task Status</Label>
                            <Select name="taskStatus" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="statusNotes">Status Notes</Label>
                            <Textarea
                                id="statusNotes"
                                name="statusNotes"
                                placeholder="Add notes about status change..."
                                rows={3}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsProgressModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Update Status</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Purchase Order Modal */}
            <Dialog open={isPOModalOpen} onOpenChange={setIsPOModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Purchase Order</DialogTitle>
                        <DialogDescription>
                            Submit a new purchase order request
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleCreatePO({
                                vendor: formData.get("vendor") as string,
                                amount: Number(formData.get("amount")),
                                description: formData.get("description") as string,
                                priority: formData.get("priority") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="vendor">Vendor</Label>
                            <Select name="vendor" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="steel-corp">Steel Corp Ltd</SelectItem>
                                    <SelectItem value="cement-ind">Cement Industries</SelectItem>
                                    <SelectItem value="hardware">Hardware Solutions</SelectItem>
                                    <SelectItem value="equipment">Equipment Rentals</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                placeholder="Enter amount"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the purchase..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsPOModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Create PO</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Equipment Maintenance Modal */}
            <Dialog
                open={isEquipmentModalOpen}
                onOpenChange={setIsEquipmentModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Equipment Maintenance</DialogTitle>
                        <DialogDescription>
                            Record equipment maintenance activity
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleEquipmentMaintenance({
                                equipmentId: formData.get("equipment") as string,
                                maintenanceType: formData.get("maintenanceType") as string,
                                notes: formData.get("notes") as string,
                                nextService: Number(formData.get("nextService")),
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="equipment">Equipment</Label>
                            <Select name="equipment" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipmentList.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id}>
                                            {eq.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="maintenanceType">Maintenance Type</Label>
                            <Select name="maintenanceType" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="routine">Routine Service</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="inspection">Safety Inspection</SelectItem>
                                    <SelectItem value="calibration">Calibration</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="notes">Maintenance Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Describe the maintenance performed..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="nextService">Next Service Due</Label>
                            <Input
                                id="nextService"
                                name="nextService"
                                type="number"
                                placeholder="Hours until next service"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsEquipmentModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Log Maintenance</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Labor Entry Modal */}
            <Dialog open={isLaborModalOpen} onOpenChange={setIsLaborModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Labor Hours</DialogTitle>
                        <DialogDescription>
                            Record labor hours and productivity
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleLaborHours({
                                trade: formData.get("trade") as string,
                                workers: Number(formData.get("workers")),
                                hours: Number(formData.get("hours")),
                                overtime: Number(formData.get("overtime")),
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="trade">Trade</Label>
                            <Select name="trade" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select trade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electricians">Electricians</SelectItem>
                                    <SelectItem value="plumbers">Plumbers</SelectItem>
                                    <SelectItem value="carpenters">Carpenters</SelectItem>
                                    <SelectItem value="masons">Masons</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="workers">Number of Workers</Label>
                            <Input
                                id="workers"
                                name="workers"
                                type="number"
                                placeholder="Enter number of workers"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="hours">Hours Worked</Label>
                            <Input
                                id="hours"
                                name="hours"
                                type="number"
                                placeholder="Enter hours worked"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="overtime">Overtime Hours</Label>
                            <Input
                                id="overtime"
                                name="overtime"
                                type="number"
                                placeholder="Enter overtime hours"
                                defaultValue="0"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="productivity">Productivity Notes</Label>
                            <Textarea
                                id="productivity"
                                name="productivity"
                                placeholder="Add notes about productivity..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsLaborModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Log Hours</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Budget Adjustment Modal */}
            <Dialog
                open={isBudgetAdjustModalOpen}
                onOpenChange={setIsBudgetAdjustModalOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Budget</DialogTitle>
                        <DialogDescription>
                            Modify budget allocation and track changes
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleBudgetAdjustment({
                                category: formData.get("category") as string,
                                adjustmentType: formData.get("adjustmentType") as
                                    | "increase"
                                    | "decrease",
                                amount: Number(formData.get("amount")),
                                reason: formData.get("reason") as string,
                                effectiveDate: formData.get("effectiveDate") as string,
                                approver: formData.get("approver") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="category">Cost Category</Label>
                            <Select name="category" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {safeCostData.map((item) => (
                                        <SelectItem key={item.category} value={item.category}>
                                            {item.category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjustmentType">Adjustment Type</Label>
                            <Select name="adjustmentType" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="increase">Increase Budget</SelectItem>
                                    <SelectItem value="decrease">Decrease Budget</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                placeholder="Enter adjustment amount"
                                min="0"
                                step="1000"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Adjustment</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Explain the reason for budget adjustment..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="effectiveDate">Effective Date</Label>
                            <Input
                                id="effectiveDate"
                                name="effectiveDate"
                                type="date"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="approver">Approving Authority</Label>
                            <Select name="approver" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select approver" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project-manager">
                                        Project Manager
                                    </SelectItem>
                                    <SelectItem value="finance-head">Finance Head</SelectItem>
                                    <SelectItem value="director">Director</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 space-x-2 flex justify-end">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsBudgetAdjustModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Submit Adjustment</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Purchase Order View Modal */}
            <Dialog open={isPOViewModalOpen} onOpenChange={setIsPOViewModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Purchase Order Details</DialogTitle>
                        <DialogDescription>
                            View details of the selected purchase order
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPO && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">PO Number</Label>
                                    <p className="font-medium">{selectedPO.id}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                selectedPO.status === "Approved"
                                                    ? "default"
                                                    : selectedPO.status === "Pending"
                                                        ? "secondary"
                                                        : selectedPO.status === "Escalated"
                                                            ? "destructive"
                                                            : "outline"
                                            }
                                        >
                                            {selectedPO.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Vendor</Label>
                                    <p className="font-medium">{selectedPO.vendor}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Amount</Label>
                                    <p className="font-medium">
                                        ₹{selectedPO.amount.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Next Approver</Label>
                                    <p className="font-medium">{selectedPO.approver}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Time in Queue</Label>
                                    <p className="font-medium">{selectedPO.timeInQueue}</p>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPOViewModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Purchase Order Approve Modal */}
            <Dialog
                open={isPOApproveModalOpen}
                onOpenChange={setIsPOApproveModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Purchase Order</DialogTitle>
                        <DialogDescription>
                            {selectedPO
                                ? `Approving PO: ${selectedPO.id} - ${selectedPO.vendor}`
                                : "Loading..."}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!selectedPO) return;
                            const formData = new FormData(e.currentTarget);
                            handlePOApprove(selectedPO, {
                                comments: formData.get("comments") as string,
                                conditions: formData.get("conditions") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="comments">Comments</Label>
                            <Textarea
                                id="comments"
                                name="comments"
                                placeholder="Enter comments about the approval..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="conditions">Conditions (Optional)</Label>
                            <Textarea
                                id="conditions"
                                name="conditions"
                                placeholder="Enter any conditions for approving the order..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsPOApproveModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Approve</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Purchase Order Expedite Modal */}
            <Dialog
                open={isPOExpediteModalOpen}
                onOpenChange={setIsPOExpediteModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Expedite Purchase Order</DialogTitle>
                        <DialogDescription>
                            {selectedPO
                                ? `Expediting PO: ${selectedPO.id} - ${selectedPO.vendor}`
                                : "Loading..."}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!selectedPO) return;
                            const formData = new FormData(e.currentTarget);
                            handlePOExpedite(selectedPO, {
                                priority: formData.get("priority") as "high" | "urgent",
                                reason: formData.get("reason") as string,
                                escalateTo: formData.get("escalateTo") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High Priority</SelectItem>
                                    <SelectItem value="urgent">Urgent - Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason for Expediting</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Enter the reason for expediting the order..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="escalateTo">Escalate To</Label>
                            <Select name="escalateTo" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select approver" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="department-head">
                                        Department Head
                                    </SelectItem>
                                    <SelectItem value="procurement-manager">
                                        Procurement Manager
                                    </SelectItem>
                                    <SelectItem value="project-director">
                                        Project Director
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsPOExpediteModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Expedite</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Add Task Modal */}{" "}
            <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                        <DialogDescription>
                            Create a new task for the project
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-2">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleAddTask({
                                    name: formData.get("name") as string,
                                    projectId: formData.get("projectId") as string,
                                    assignedToId: formData.get("assignedToId") as string,
                                    description: formData.get("description") as string,
                                    startDate: formData.get("startDate")
                                        ? new Date(formData.get("startDate") as string)
                                            .toISOString()
                                            .split("T")[0]
                                        : null,
                                    dueDate: formData.get("dueDate")
                                        ? new Date(formData.get("dueDate") as string)
                                            .toISOString()
                                            .split("T")[0]
                                        : null,
                                });
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Task Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Enter task name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="projectId">Project</Label>
                                <Select name="projectId" required>
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

                            <div className="space-y-2">
                                <Label htmlFor="assignedToId">Assigned To</Label>
                                <Select name="assignedToId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter task description"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input id="startDate" name="startDate" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input id="dueDate" name="dueDate" type="date" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {/* <Label htmlFor="dependencies">Dependencies</Label>
                <Select name="dependencies">
                  <SelectTrigger>
                    <SelectValue placeholder="Select dependencies" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Optional: Select a predecessor task that must be completed
                  before this one
                </p> */}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsAddTaskModalOpen(false)}
                                >
                                    Cancel
                                </Button>{" "}
                                <Button type="submit">Add Task</Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Labor Details Modal */}
            <Dialog
                open={isLaborDetailsModalOpen}
                onOpenChange={setIsLaborDetailsModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Labor Details</DialogTitle>
                        <DialogDescription>
                            Detailed metrics and performance data
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLabor && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Trade</Label>
                                    <p className="font-medium">{selectedLabor.trade}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Labor Type</Label>
                                    <Badge
                                        className={
                                            selectedLabor.type === "productive"
                                                ? "bg-blue-500"
                                                : "bg-purple-500"
                                        }
                                    >
                                        {selectedLabor.type === "productive"
                                            ? "Productive"
                                            : "Non-Productive"}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Utilization</Label>
                                    <p className="font-medium">
                                        {(
                                            (selectedLabor.actual / selectedLabor.planned) *
                                            100
                                        ).toFixed(1)}
                                        %
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Planned Hours</Label>
                                    <p className="font-medium">{selectedLabor.planned}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Actual Hours</Label>
                                    <p className="font-medium">{selectedLabor.actual}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Variance</Label>
                                    <p
                                        className={`font-medium ${selectedLabor.actual > selectedLabor.planned
                                            ? "text-red-500"
                                            : "text-green-500"
                                            }`}
                                    >
                                        {selectedLabor.actual - selectedLabor.planned} hours
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Cost Impact</Label>
                                    <p
                                        className={`font-medium ${selectedLabor.actual > selectedLabor.planned
                                            ? "text-red-500"
                                            : "text-green-500"
                                            }`}
                                    >
                                        ₹
                                        {Math.abs(
                                            (selectedLabor.actual - selectedLabor.planned) * 500
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Productivity Coefficient
                                    </Label>
                                    <p className="font-medium">
                                        {selectedLabor.type === "productive" ? "1.0" : "0.7"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Daily Distribution
                                </Label>
                                <div className="h-[100px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={[
                                                {
                                                    day: "Mon",
                                                    hours: Math.round(selectedLabor.actual / 5),
                                                },
                                                {
                                                    day: "Tue",
                                                    hours: Math.round(selectedLabor.actual / 5),
                                                },
                                                {
                                                    day: "Wed",
                                                    hours: Math.round(selectedLabor.actual / 5),
                                                },
                                                {
                                                    day: "Thu",
                                                    hours: Math.round(selectedLabor.actual / 5),
                                                },
                                                {
                                                    day: "Fri",
                                                    hours: Math.round(selectedLabor.actual / 5),
                                                },
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="hours" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Performance Metrics
                                </Label>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Productivity Rate</span>
                                            <span>85%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: "85%" }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Quality Score</span>
                                            <span>92%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: "92%" }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Safety Compliance</span>
                                            <span>100%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-600 h-2 rounded-full"
                                                style={{ width: "100%" }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsLaborDetailsModalOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsLaborDetailsModalOpen(false);
                                        setIsLaborModalOpen(true);
                                    }}
                                >
                                    Log Hours
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Equipment Logs Modal */}
            <Dialog
                open={isEquipmentLogsModalOpen}
                onOpenChange={setIsEquipmentLogsModalOpen}
            >
                <DialogContent className="max-w-[90vw] w-full md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="px-6 py-4">
                        <DialogTitle>Equipment Logs</DialogTitle>
                        <DialogDescription>
                            {selectedEquipment
                                ? `Viewing logs for ${selectedEquipment.name} (${selectedEquipment.id})`
                                : "Loading..."}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEquipment && (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="bg-background px-6 py-4 border-b">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <Label className="text-muted-foreground block">
                                            Total Hours
                                        </Label>
                                        <p className="text-2xl font-bold">
                                            {selectedEquipment.hours}
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <Label className="text-muted-foreground block">
                                            Next Service
                                        </Label>
                                        <p
                                            className={`text-2xl font-bold ${selectedEquipment.nextService === "Due Now"
                                                ? "text-red-500"
                                                : ""
                                                }`}
                                        >
                                            {selectedEquipment.nextService}
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <Label className="text-muted-foreground block">
                                            Status
                                        </Label>
                                        <Badge
                                            className="text-base"
                                            variant={
                                                selectedEquipment.status === "Active"
                                                    ? "default"
                                                    : selectedEquipment.status === "Warning"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {selectedEquipment.status}
                                        </Badge>
                                    </div>
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <Label className="text-muted-foreground block">
                                            Utilization
                                        </Label>
                                        <p className="text-2xl font-bold">78%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto px-6">
                                <div className="py-6 space-y-6">
                                    <div className="border rounded-lg">
                                        <div className="p-4 border-b bg-background sticky top-0 z-10">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">Activity History</h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsEquipmentLogsModalOpen(false);
                                                        setIsEquipmentModalOpen(true);
                                                    }}
                                                >
                                                    Add New Log
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="divide-y">
                                            {equipmentLogs.map((log, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={
                                                                    log.type === "Maintenance"
                                                                        ? "secondary"
                                                                        : log.type === "Repair"
                                                                            ? "destructive"
                                                                            : "default"
                                                                }
                                                            >
                                                                {log.type}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {log.date}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {log.hours} hours
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm">{log.notes}</p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Operator: {log.operator}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setIsEquipmentLogsModalOpen(false);
                                                                setIsEquipmentModalOpen(true);
                                                            }}
                                                        >
                                                            Add Note
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t bg-background px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEquipmentLogsModalOpen(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsEquipmentLogsModalOpen(false);
                                            setIsEquipmentModalOpen(true);
                                        }}
                                    >
                                        Log Maintenance
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Equipment Tracking Modal */}
            <Dialog
                open={isEquipmentTrackingModalOpen}
                onOpenChange={setIsEquipmentTrackingModalOpen}
            >
                <DialogContent className="max-w-[90vw] w-full md:max-w-[800px] lg:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="px-6 py-4">
                        <DialogTitle>Equipment Location Tracking</DialogTitle>
                        <DialogDescription>
                            {selectedEquipment
                                ? `Real-time location for ${selectedEquipment.name} (${selectedEquipment.id})`
                                : "Loading..."}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEquipment && (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="bg-background px-6 py-4 border-b">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <Label className="text-muted-foreground block">
                                            Current Location
                                        </Label>
                                        <p className="text-lg font-medium">
                                            North Block - Section A
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <Label className="text-muted-foreground block">
                                            Current Operator
                                        </Label>
                                        <p className="text-lg font-medium">John Smith</p>
                                    </div>
                                    <div className="p-4 border rounded-lg space-y-3">
                                        <Label className="text-muted-foreground block">
                                            Status
                                        </Label>
                                        <Badge
                                            className="text-base"
                                            variant={
                                                selectedEquipment.status === "Active"
                                                    ? "default"
                                                    : selectedEquipment.status === "Warning"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {selectedEquipment.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto px-6">
                                <div className="py-6 space-y-6">
                                    {/* <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-4 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <p className="text-muted-foreground">Interactive Site Map</p>
                          <Button variant="outline" size="sm" onClick={() => toast.success(`Refreshing map view for ${selectedEquipment.name}`)}>
                            Refresh Map
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div> */}

                                    <div className="border rounded-lg">
                                        <div className="p-4 border-b bg-background sticky top-0 z-10">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">Movement History</h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        toast.success(
                                                            `Refreshing location data for ${selectedEquipment.name}`
                                                        )
                                                    }
                                                >
                                                    Refresh Data
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="divide-y">
                                            {equipmentLocations.map((location, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{location.area}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {location.timestamp}
                                                                </span>
                                                                <Badge
                                                                    variant={
                                                                        location.status === "Active"
                                                                            ? "default"
                                                                            : location.status === "Maintenance"
                                                                                ? "secondary"
                                                                                : "outline"
                                                                    }
                                                                >
                                                                    {location.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">
                                                                {location.operator}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Operator
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t bg-background px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEquipmentTrackingModalOpen(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            toast.success(
                                                `Refreshing all location data for ${selectedEquipment.name}`
                                            )
                                        }
                                    >
                                        Refresh All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Equipment Maintenance Modal */}
            <Dialog
                open={isEquipmentModalOpen}
                onOpenChange={setIsEquipmentModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Equipment Maintenance</DialogTitle>
                        <DialogDescription>
                            Record equipment maintenance activity
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleEquipmentMaintenance({
                                equipmentId: formData.get("equipment") as string,
                                maintenanceType: formData.get("maintenanceType") as string,
                                notes: formData.get("notes") as string,
                                nextService: Number(formData.get("nextService")),
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="equipment">Equipment</Label>
                            <Select name="equipment" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipmentList.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id}>
                                            {eq.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="maintenanceType">Maintenance Type</Label>
                            <Select name="maintenanceType" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="routine">Routine Service</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="inspection">Safety Inspection</SelectItem>
                                    <SelectItem value="calibration">Calibration</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="notes">Maintenance Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Describe the maintenance performed..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="nextService">Next Service Due</Label>
                            <Input
                                id="nextService"
                                name="nextService"
                                type="number"
                                placeholder="Hours until next service"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsEquipmentModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Log Maintenance</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Labor Entry Modal */}
            <Dialog open={isLaborModalOpen} onOpenChange={setIsLaborModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Labor Hours</DialogTitle>
                        <DialogDescription>
                            Record labor hours and productivity
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleLaborHours({
                                trade: formData.get("trade") as string,
                                workers: Number(formData.get("workers")),
                                hours: Number(formData.get("hours")),
                                overtime: Number(formData.get("overtime")),
                            });
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label htmlFor="trade">Trade</Label>
                            <Select name="trade" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select trade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electricians">Electricians</SelectItem>
                                    <SelectItem value="plumbers">Plumbers</SelectItem>
                                    <SelectItem value="carpenters">Carpenters</SelectItem>
                                    <SelectItem value="masons">Masons</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="workers">Number of Workers</Label>
                            <Input
                                id="workers"
                                name="workers"
                                type="number"
                                placeholder="Enter number of workers"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="hours">Hours Worked</Label>
                            <Input
                                id="hours"
                                name="hours"
                                type="number"
                                placeholder="Enter hours worked"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="overtime">Overtime Hours</Label>
                            <Input
                                id="overtime"
                                name="overtime"
                                type="number"
                                placeholder="Enter overtime hours"
                                defaultValue="0"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="productivity">Productivity Notes</Label>
                            <Textarea
                                id="productivity"
                                name="productivity"
                                placeholder="Add notes about productivity..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsLaborModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Log Hours</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Budget Adjustment Modal */}
            <Dialog
                open={isBudgetAdjustModalOpen}
                onOpenChange={setIsBudgetAdjustModalOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Budget</DialogTitle>
                        <DialogDescription>
                            Modify budget allocation and track changes
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleBudgetAdjustment({
                                category: formData.get("category") as string,
                                adjustmentType: formData.get("adjustmentType") as
                                    | "increase"
                                    | "decrease",
                                amount: Number(formData.get("amount")),
                                reason: formData.get("reason") as string,
                                effectiveDate: formData.get("effectiveDate") as string,
                                approver: formData.get("approver") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="category">Cost Category</Label>
                            <Select name="category" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {safeCostData.map((item) => (
                                        <SelectItem key={item.category} value={item.category}>
                                            {item.category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjustmentType">Adjustment Type</Label>
                            <Select name="adjustmentType" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="increase">Increase Budget</SelectItem>
                                    <SelectItem value="decrease">Decrease Budget</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                placeholder="Enter adjustment amount"
                                min="0"
                                step="1000"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Adjustment</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Explain the reason for budget adjustment..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="effectiveDate">Effective Date</Label>
                            <Input
                                id="effectiveDate"
                                name="effectiveDate"
                                type="date"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="approver">Approving Authority</Label>
                            <Select name="approver" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select approver" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project-manager">
                                        Project Manager
                                    </SelectItem>
                                    <SelectItem value="finance-head">Finance Head</SelectItem>
                                    <SelectItem value="director">Director</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 space-x-2 flex justify-end">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsBudgetAdjustModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Submit Adjustment</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* View Issue Modal */}
            <Dialog
                open={isViewIssueModalOpen}
                onOpenChange={setIsViewIssueModalOpen}
            >
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Issue Details - {selectedIssue?.id}</DialogTitle>
                        <DialogDescription>View and manage site issue</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="outline">{selectedIssue?.type}</Badge>
                            <Badge
                                variant={
                                    selectedIssue?.severity === "High"
                                        ? "destructive"
                                        : selectedIssue?.severity === "Medium"
                                            ? "default"
                                            : "secondary"
                                }
                            >
                                {selectedIssue?.severity}
                            </Badge>
                            <Badge
                                variant={
                                    selectedIssue?.status === "Resolved"
                                        ? "default"
                                        : selectedIssue?.status === "In Progress"
                                            ? "secondary"
                                            : "outline"
                                }
                            >
                                {selectedIssue?.status}
                            </Badge>
                            {selectedIssue?.escalated && (
                                <Badge variant="destructive">Escalated</Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Description</h4>
                                <div className="p-4 border rounded-md">
                                    <p className="text-sm">{selectedIssue?.description}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2">Details</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between p-2 border-b">
                                        <span className="text-sm font-medium">Reported By</span>
                                        <span className="text-sm">{selectedIssue?.reportedBy}</span>
                                    </div>
                                    <div className="flex justify-between p-2 border-b">
                                        <span className="text-sm font-medium">Reported Date</span>
                                        <span className="text-sm">{selectedIssue?.dateLogged}</span>
                                    </div>
                                    <div className="flex justify-between p-2 border-b">
                                        <span className="text-sm font-medium">Location</span>
                                        <span className="text-sm">{selectedIssue?.location}</span>
                                    </div>
                                    <div className="flex justify-between p-2">
                                        <span className="text-sm font-medium">Impact</span>
                                        <span className="text-sm">
                                            {selectedIssue?.impact || "Moderate"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end space-x-2">
                            {selectedIssue?.status !== "Resolved" && (
                                <Button
                                    variant="default"
                                    onClick={() => {
                                        setIssues((prevIssues) =>
                                            prevIssues.map((issue) =>
                                                issue.id === selectedIssue?.id
                                                    ? { ...issue, status: "Resolved" }
                                                    : issue
                                            )
                                        );
                                        setIsViewIssueModalOpen(false);
                                        toast.success(
                                            `Issue ${selectedIssue?.id} marked as resolved`
                                        );
                                    }}
                                >
                                    Resolve Issue
                                </Button>
                            )}
                            {selectedIssue?.severity === "High" &&
                                !selectedIssue?.escalated && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setIssues((prevIssues) =>
                                                prevIssues.map((issue) =>
                                                    issue.id === selectedIssue?.id
                                                        ? { ...issue, escalated: true }
                                                        : issue
                                                )
                                            );
                                            setIsViewIssueModalOpen(false);
                                            toast.info(
                                                `Issue ${selectedIssue?.id} has been escalated`
                                            );
                                        }}
                                    >
                                        Escalate
                                    </Button>
                                )}
                            <Button
                                variant="outline"
                                onClick={() => setIsViewIssueModalOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* View Report Modal */}
            <Dialog
                open={isViewReportModalOpen}
                onOpenChange={setIsViewReportModalOpen}
            >
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                    <DialogHeader className="pb-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    {selectedReport?.type === "DPR" ? (
                                        <>
                                            <HardHat className="h-6 w-6 text-blue-600" />
                                            Daily Progress Report
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="h-6 w-6 text-green-600" />
                                            Weekly Progress Report
                                        </>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="text-base mt-2">
                                    Submitted on{" "}
                                    {selectedReport?.createdAt
                                        ? new Date(selectedReport.createdAt).toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )
                                        : selectedReport?.date}
                                </DialogDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge
                                    variant={
                                        selectedReport?.type === "DPR" ? "default" : "secondary"
                                    }
                                    className="text-sm px-4 py-2 font-semibold"
                                >
                                    {selectedReport?.type}
                                </Badge>
                                {selectedReport?.weather && (
                                    <Badge variant="outline" className="text-sm px-3 py-1">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {selectedReport.weather}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedReport?.type === "DPR" ? (
                            /* ==================== DPR DETAILED VIEW ==================== */
                            <div className="space-y-8">
                                {/* Header Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 text-center">
                                        <div className="text-2xl font-bold text-blue-800">
                                            {selectedReport.manpower || "N/A"}
                                        </div>
                                        <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                                            Workers
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 text-center">
                                        <div className="text-2xl font-bold text-green-800">
                                            {selectedReport.weather || "N/A"}
                                        </div>
                                        <div className="text-xs text-green-600 font-medium uppercase tracking-wide">
                                            Weather
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 text-center">
                                        <div className="text-2xl font-bold text-purple-800">
                                            {selectedReport.safetyIncident ? "Yes" : "No"}
                                        </div>
                                        <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                                            Safety Issues
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 text-center">
                                        <div className="text-2xl font-bold text-orange-800">
                                            {selectedReport.delayIssue ? "Yes" : "No"}
                                        </div>
                                        <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">
                                            Delays
                                        </div>
                                    </div>
                                </div>

                                {/* Work Items Details Table */}
                                {selectedReport.workItems && selectedReport.workItems.length > 0 && (
                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                            <Briefcase className="h-6 w-6 text-slate-700" />
                                            Work Progress Details
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-300 text-slate-900">
                                                        <th className="px-3 py-2 text-left">Sl.</th>
                                                        <th className="px-3 py-2 text-left">Description</th>
                                                        <th className="px-3 py-2 text-right">BOQ Qty</th>
                                                        <th className="px-3 py-2 text-right">Already Executed</th>
                                                        <th className="px-3 py-2 text-right">Today's Progress</th>
                                                        <th className="px-3 py-2 text-right">Yesterday</th>
                                                        <th className="px-3 py-2 text-right">Cumulative</th>
                                                        <th className="px-3 py-2 text-right">Balance</th>
                                                        <th className="px-3 py-2 text-left">Remarks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedReport.workItems.map((item: any, idx: number) => (
                                                        <tr key={idx} className="border-b hover:bg-slate-200">
                                                            <td className="px-3 py-2">{item.slNo || idx + 1}</td>
                                                            <td className="px-3 py-2">{item.description}</td>
                                                            <td className="px-3 py-2 text-right">{item.boqQuantity}</td>
                                                            <td className="px-3 py-2 text-right">{item.alreadyExecuted}</td>
                                                            <td className="px-3 py-2 text-right">{item.todaysProgram}</td>
                                                            <td className="px-3 py-2 text-right">{item.yesterdayAchievement}</td>
                                                            <td className="px-3 py-2 text-right">{item.cumulativeQuantity}</td>
                                                            <td className="px-3 py-2 text-right">{item.balanceQuantity}</td>
                                                            <td className="px-3 py-2">{item.remarks}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Work Details */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                        <Briefcase className="h-6 w-6 text-gray-700" />
                                        Work Completed Today
                                    </h3>
                                    <div className="bg-white rounded-lg p-4 border">
                                        <p className="text-gray-800 leading-relaxed">
                                            {selectedReport.workDone || "No work details provided"}
                                        </p>
                                    </div>
                                </div>

                                {/* Manpower Details */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-bold mb-4 text-blue-800 flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Manpower Deployment
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                <div className="text-sm text-blue-700 font-medium">
                                                    Total Workers
                                                </div>
                                                <div className="text-2xl font-bold text-blue-900">
                                                    {selectedReport.manpower || "Not specified"}
                                                </div>
                                            </div>
                                            {selectedReport.manpowerRoles && (
                                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                    <div className="text-sm text-blue-700 font-medium mb-2">
                                                        Worker Roles & Distribution
                                                    </div>
                                                    <div className="text-blue-800">
                                                        {selectedReport.manpowerRoles}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Site Conditions
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                                <div className="text-sm text-green-700 font-medium">
                                                    Weather Conditions
                                                </div>
                                                <div className="text-xl font-bold text-green-900">
                                                    {selectedReport.weather || "Not specified"}
                                                </div>
                                            </div>
                                            {selectedReport.workSections && (
                                                <div className="bg-white rounded-lg p-4 border border-green-100">
                                                    <div className="text-sm text-green-700 font-medium mb-2">
                                                        Work Sections
                                                    </div>
                                                    <div className="text-green-800">
                                                        {selectedReport.workSections}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Labour & Machineries Details */}
                                {selectedReport.resources && selectedReport.resources.length > 0 && (() => {
                                    const manpower = selectedReport.resources.filter((r: any) => r.resourceType === 'MANPOWER');
                                    const equipment = selectedReport.resources.filter((r: any) => r.resourceType === 'EQUIPMENT');
                                    const staff = selectedReport.resources.filter((r: any) => r.resourceType === 'STAFF');

                                    return (
                                        <div className="space-y-6">
                                            {/* Manpower Section */}
                                            {manpower.length > 0 && (
                                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                                        <Users className="h-6 w-6 text-blue-700" />
                                                        Manpower Details
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm bg-white rounded-lg">
                                                            <thead>
                                                                <tr className="bg-blue-300 text-blue-900">
                                                                    <th className="px-3 py-2 text-left">Description</th>
                                                                    <th className="px-3 py-2 text-right">Hours Worked</th>
                                                                    <th className="px-3 py-2 text-right">Planned</th>
                                                                    <th className="px-3 py-2 text-left">Remarks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {manpower.map((res: any, idx: number) => (
                                                                    <tr key={idx} className="border-b hover:bg-blue-50">
                                                                        <td className="px-3 py-2">{res.name}</td>
                                                                        <td className="px-3 py-2 text-right">{res.actualCount || '-'}</td>
                                                                        <td className="px-3 py-2 text-right">{res.plannedCount || '-'}</td>
                                                                        <td className="px-3 py-2">{res.remarks || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Equipment Section */}
                                            {equipment.length > 0 && (
                                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                                        <Truck className="h-6 w-6 text-yellow-700" />
                                                        Equipment & Machineries
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm bg-white rounded-lg">
                                                            <thead>
                                                                <tr className="bg-yellow-300 text-yellow-900">
                                                                    <th className="px-3 py-2 text-left">Equipment Name</th>
                                                                    <th className="px-3 py-2 text-right">Quantity</th>
                                                                    <th className="px-3 py-2 text-left">Remarks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {equipment.map((res: any, idx: number) => (
                                                                    <tr key={idx} className="border-b hover:bg-yellow-50">
                                                                        <td className="px-3 py-2">{res.name}</td>
                                                                        <td className="px-3 py-2 text-right">{res.actualCount || '-'}</td>
                                                                        <td className="px-3 py-2">{res.remarks || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Staff Section */}
                                            {staff.length > 0 && (
                                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                                        <Users className="h-6 w-6 text-purple-700" />
                                                        Staff Details
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm bg-white rounded-lg">
                                                            <thead>
                                                                <tr className="bg-purple-300 text-purple-900">
                                                                    <th className="px-3 py-2 text-left">Position</th>
                                                                    <th className="px-3 py-2 text-right">Count</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {staff.map((res: any, idx: number) => (
                                                                    <tr key={idx} className="border-b hover:bg-purple-50">
                                                                        <td className="px-3 py-2 font-medium">{res.name}</td>
                                                                        <td className="px-3 py-2 text-right text-lg font-semibold text-purple-700">{res.actualCount}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Equipment & Materials */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {selectedReport.equipmentUsed && (
                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                                            <h3 className="text-lg font-bold mb-4 text-yellow-800 flex items-center gap-2">
                                                <Truck className="h-5 w-5" />
                                                Equipment Utilized
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-yellow-100">
                                                <div className="text-yellow-800 whitespace-pre-wrap">
                                                    {selectedReport.equipmentUsed}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedReport.materials && (
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                            <h3 className="text-lg font-bold mb-4 text-purple-800 flex items-center gap-2">
                                                <Package className="h-5 w-5" />
                                                Materials Used
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-purple-100">
                                                {(() => {
                                                    try {
                                                        const materials = selectedReport.materials;
                                                        if (Array.isArray(materials)) {
                                                            return (
                                                                <div className="space-y-3">
                                                                    {materials.map(
                                                                        (material: any, idx: number) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="flex justify-between items-center p-2 bg-purple-50 rounded border"
                                                                            >
                                                                                <span className="font-medium text-purple-900">
                                                                                    {material.name ||
                                                                                        material.material ||
                                                                                        (typeof material === "object"
                                                                                            ? "Material"
                                                                                            : material)}
                                                                                </span>
                                                                                {material.quantity && (
                                                                                    <span className="text-purple-700 font-semibold">
                                                                                        {material.quantity}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                    } catch (e) {
                                                        // Fallback for non-JSON data
                                                    }
                                                    return (
                                                        <div className="text-purple-800 whitespace-pre-wrap">
                                                            {String(selectedReport.materials)}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Safety & Quality Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {selectedReport.safetyIncident && (
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                                            <h3 className="text-lg font-bold mb-4 text-red-800 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                Safety Incident Report
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-red-100">
                                                <div className="text-red-800 whitespace-pre-wrap font-medium">
                                                    {selectedReport.safetyIncident}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedReport.qualityCheck && (
                                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                                            <h3 className="text-lg font-bold mb-4 text-emerald-800 flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Quality Check Status
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                                <div className="text-emerald-800 whitespace-pre-wrap font-medium">
                                                    {selectedReport.qualityCheck}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Remarks & Hindrances */}
                                {selectedReport.remarks && selectedReport.remarks.length > 0 && (
                                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                            <AlertTriangle className="h-6 w-6 text-amber-700" />
                                            Remarks & Issues Reported
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedReport.remarks.map((remark: any, idx: number) => (
                                                <div key={idx} className="bg-white rounded-lg p-4 border border-amber-100">
                                                    <div className="font-semibold text-amber-800 mb-2">
                                                        {remark.category}
                                                    </div>
                                                    <div className="text-amber-700">
                                                        {remark.remarkText}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedReport.majorHindrances && (
                                    <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl p-6 border border-rose-200">
                                        <h3 className="text-lg font-bold mb-4 text-rose-800 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            Major Hindrances
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-rose-100">
                                            <div className="text-rose-800 whitespace-pre-wrap">
                                                {selectedReport.majorHindrances}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Issues & Delays */}
                                {selectedReport.delayIssue && (
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                                        <h3 className="text-lg font-bold mb-4 text-orange-800 flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Delays & Issues Encountered
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-orange-100">
                                            <div className="text-orange-800 whitespace-pre-wrap font-medium">
                                                {selectedReport.delayIssue}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Notes */}
                                {selectedReport.notes && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Additional Notes & Comments
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                                            <div className="text-gray-800 whitespace-pre-wrap">
                                                {selectedReport.notes}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Subcontractor Information */}
                                {selectedReport.subcontractor && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                                        <h3 className="text-lg font-bold mb-4 text-indigo-800 flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            Subcontractor Details
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-indigo-100">
                                            <div className="text-indigo-800 whitespace-pre-wrap font-medium">
                                                {selectedReport.subcontractor}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : selectedReport?.type === "WPR" ? (
                            /* ==================== WPR DETAILED VIEW ==================== */
                            <div className="space-y-8">
                                {/* Project & Week Period Header */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                                        <Building2 className="h-6 w-6 text-indigo-600" />
                                        Project Information
                                    </h3>
                                    <div className="bg-white rounded-lg p-4 border">
                                        <div className="text-lg font-bold text-indigo-900">
                                            {(selectedReport as any)?.projectName || "Not specified"}
                                        </div>
                                    </div>
                                </div>

                                {/* Week Period Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                        Weekly Reporting Period
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-lg p-4 border">
                                            <div className="text-sm text-blue-700 font-medium mb-1">
                                                Week Start Date
                                            </div>
                                            <div className="text-lg font-bold text-blue-900">
                                                {selectedReport.weekStart
                                                    ? new Date(
                                                        selectedReport.weekStart
                                                    ).toLocaleDateString("en-US", {
                                                        weekday: "long",
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "Not specified"}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 border">
                                            <div className="text-sm text-green-700 font-medium mb-1">
                                                Week End Date
                                            </div>
                                            <div className="text-lg font-bold text-green-900">
                                                {selectedReport.weekEnding
                                                    ? new Date(
                                                        selectedReport.weekEnding
                                                    ).toLocaleDateString("en-US", {
                                                        weekday: "long",
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "Not specified"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Metrics */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border">
                                    <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        Progress Metrics & Analysis
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 border border-blue-300">
                                            <div className="text-center">
                                                <div className="text-sm text-blue-700 font-semibold mb-2">
                                                    PLANNED PROGRESS
                                                </div>
                                                <div className="text-4xl font-black text-blue-900 mb-3">
                                                    {selectedReport.plannedProgress || 0}%
                                                </div>
                                                <div className="w-full bg-blue-300 rounded-full h-3">
                                                    <div
                                                        className="bg-blue-600 h-3 rounded-full transition-all duration-1000 shadow-inner"
                                                        style={{
                                                            width: `${selectedReport.plannedProgress || 0}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 border border-green-300">
                                            <div className="text-center">
                                                <div className="text-sm text-green-700 font-semibold mb-2">
                                                    ACTUAL PROGRESS
                                                </div>
                                                <div className="text-4xl font-black text-green-900 mb-3">
                                                    {selectedReport.actualProgress || 0}%
                                                </div>
                                                <div className="w-full bg-green-300 rounded-full h-3">
                                                    <div
                                                        className="bg-green-600 h-3 rounded-full transition-all duration-1000 shadow-inner"
                                                        style={{
                                                            width: `${selectedReport.actualProgress || 0}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Variance Analysis */}
                                    {selectedReport.plannedProgress &&
                                        selectedReport.actualProgress && (
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-700">
                                                        Progress Variance Analysis:
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`text-xl font-bold ${parseInt(selectedReport.actualProgress) >=
                                                                parseInt(selectedReport.plannedProgress)
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                                }`}
                                                        >
                                                            {parseInt(selectedReport.actualProgress) -
                                                                parseInt(selectedReport.plannedProgress) >
                                                                0
                                                                ? "+"
                                                                : ""}
                                                            {parseInt(selectedReport.actualProgress) -
                                                                parseInt(selectedReport.plannedProgress)}
                                                            %
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                parseInt(selectedReport.actualProgress) >=
                                                                    parseInt(selectedReport.plannedProgress)
                                                                    ? "default"
                                                                    : "destructive"
                                                            }
                                                        >
                                                            {parseInt(selectedReport.actualProgress) >=
                                                                parseInt(selectedReport.plannedProgress)
                                                                ? "On Track"
                                                                : "Behind Schedule"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </div>

                                {/* Milestones Achieved */}
                                {selectedReport.milestones && (
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                                        <h3 className="text-xl font-bold mb-4 text-emerald-800 flex items-center gap-3">
                                            <Building2 className="h-6 w-6" />
                                            Milestones Achieved This Week
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                            <div className="text-emerald-800 whitespace-pre-wrap leading-relaxed">
                                                {selectedReport.milestones}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Remarks */}
                                {selectedReport.progressRemarks && (
                                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
                                        <h3 className="text-xl font-bold mb-4 text-teal-800 flex items-center gap-3">
                                            <FileText className="h-6 w-6" />
                                            Progress Remarks & Observations
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-teal-100">
                                            <div className="text-teal-800 whitespace-pre-wrap leading-relaxed">
                                                {selectedReport.progressRemarks}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Issues & Risks Management */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {selectedReport.issues && (
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                                            <h3 className="text-lg font-bold mb-4 text-red-800 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                Issues Identified
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-red-100">
                                                <div className="text-red-800 whitespace-pre-wrap font-medium leading-relaxed">
                                                    {selectedReport.issues}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedReport.risks && (
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                                            <h3 className="text-lg font-bold mb-4 text-orange-800 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                Risk Assessment
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-orange-100">
                                                <div className="text-orange-800 whitespace-pre-wrap font-medium leading-relaxed">
                                                    {selectedReport.risks}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Safety & Quality Summaries */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {selectedReport.safetySummary && (
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                                            <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center gap-2">
                                                <HardHat className="h-5 w-5" />
                                                Safety Summary & Compliance
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-green-100">
                                                <div className="text-green-800 whitespace-pre-wrap leading-relaxed">
                                                    {selectedReport.safetySummary}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedReport.qualitySummary && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                            <h3 className="text-lg font-bold mb-4 text-blue-800 flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Quality Assurance Summary
                                            </h3>
                                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                <div className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                                                    {selectedReport.qualitySummary}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Resources Breakdown */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        <Warehouse className="h-6 w-6 text-gray-600" />
                                        Detailed Resource Breakdown
                                    </h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* WPR Manpower */}
                                        {selectedReport.manpower && (
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                                <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                                    <Users className="h-5 w-5" />
                                                    Manpower Allocation
                                                </h4>
                                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                                    {(() => {
                                                        try {
                                                            const manpowerData = selectedReport.manpower;
                                                            if (Array.isArray(manpowerData)) {
                                                                return (
                                                                    <div className="space-y-3">
                                                                        {manpowerData.map(
                                                                            (item: any, idx: number) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                                                                                >
                                                                                    <div className="flex justify-between items-start">
                                                                                        <div>
                                                                                            <div className="font-semibold text-blue-900">
                                                                                                {item.role}
                                                                                            </div>
                                                                                            {item.remarks && (
                                                                                                <div className="text-xs text-blue-700 mt-1">
                                                                                                    {item.remarks}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            {item.planned && (
                                                                                                <div className="text-xs text-blue-600">
                                                                                                    Planned: {item.planned}
                                                                                                </div>
                                                                                            )}
                                                                                            {item.actual && (
                                                                                                <div className="text-xs text-blue-600">
                                                                                                    Actual: {item.actual}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        } catch (e) {
                                                            // Fallback for non-JSON data
                                                        }
                                                        return (
                                                            <div className="text-blue-800 whitespace-pre-wrap font-medium">
                                                                {String(selectedReport.manpower)}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* WPR Equipment */}
                                        {selectedReport.equipment && (
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                                                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                                                    <Truck className="h-5 w-5" />
                                                    Equipment Utilization
                                                </h4>
                                                <div className="bg-white rounded-lg p-4 border border-green-100">
                                                    {(() => {
                                                        try {
                                                            const equipmentData = selectedReport.equipment;
                                                            if (Array.isArray(equipmentData)) {
                                                                return (
                                                                    <div className="space-y-3">
                                                                        {equipmentData.map(
                                                                            (item: any, idx: number) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="p-3 bg-green-50 rounded-lg border border-green-200"
                                                                                >
                                                                                    <div className="flex justify-between items-start">
                                                                                        <div>
                                                                                            <div className="font-semibold text-green-900">
                                                                                                {item.equipment}
                                                                                            </div>
                                                                                            {item.remarks && (
                                                                                                <div className="text-xs text-green-700 mt-1">
                                                                                                    {item.remarks}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            {item.uptime && (
                                                                                                <div className="text-xs text-green-600">
                                                                                                    Uptime: {item.uptime}
                                                                                                </div>
                                                                                            )}
                                                                                            {item.downtime && (
                                                                                                <div className="text-xs text-green-600">
                                                                                                    Downtime: {item.downtime}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        } catch (e) {
                                                            // Fallback for non-JSON data
                                                        }
                                                        return (
                                                            <div className="text-green-800 whitespace-pre-wrap font-medium">
                                                                {String(selectedReport.equipment)}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* WPR Materials */}
                                        {selectedReport.materials && (
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                                <h4 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                                                    <Package className="h-5 w-5" />
                                                    Materials Consumption
                                                </h4>
                                                <div className="bg-white rounded-lg p-4 border border-purple-100">
                                                    {(() => {
                                                        try {
                                                            const materialsData = selectedReport.materials;
                                                            if (Array.isArray(materialsData)) {
                                                                return (
                                                                    <div className="space-y-3">
                                                                        {materialsData.map(
                                                                            (item: any, idx: number) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                                                                                >
                                                                                    <div className="flex justify-between items-start">
                                                                                        <div>
                                                                                            <div className="font-semibold text-purple-900">
                                                                                                {item.material}
                                                                                            </div>
                                                                                            {item.remarks && (
                                                                                                <div className="text-xs text-purple-700 mt-1">
                                                                                                    {item.remarks}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            {item.planned && (
                                                                                                <div className="text-xs text-purple-600">
                                                                                                    Planned: {item.planned}
                                                                                                </div>
                                                                                            )}
                                                                                            {item.actual && (
                                                                                                <div className="text-xs text-purple-600">
                                                                                                    Actual: {item.actual}
                                                                                                </div>
                                                                                            )}
                                                                                            {/* {item.quantity && <div className="font-bold text-purple-800">{item.quantity}</div>} */}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        } catch (e) {
                                                            // Fallback for non-JSON data
                                                        }
                                                        return (
                                                            <div className="text-purple-800 whitespace-pre-wrap font-medium">
                                                                {String(selectedReport.materials)}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Team Performance */}
                                {selectedReport.teamPerformance && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                                        <h3 className="text-xl font-bold mb-4 text-indigo-800 flex items-center gap-3">
                                            <Users className="h-6 w-6" />
                                            Team Performance Assessment
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-indigo-100">
                                            <div className="text-indigo-800 whitespace-pre-wrap leading-relaxed font-medium">
                                                {selectedReport.teamPerformance}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 text-lg">
                                    No report data available
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Footer */}
                    <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                <div className="font-medium">
                                    {/* Report ID: {selectedReport?.id || "N/A"} */}
                                </div>
                                <div>
                                    Submitted:{" "}
                                    {selectedReport?.createdAt
                                        ? new Date(selectedReport.createdAt).toLocaleString()
                                        : selectedReport?.date}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {selectedReport?.type === "DPR" && (
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={async () => {
                                            try {
                                                // Transform data to match DPRData interface
                                                const dprData = {
                                                    id: selectedReport?.id || '',
                                                    dprNo: (selectedReport as any)?.dprNo || 'N/A',
                                                    date: selectedReport?.date || new Date(),
                                                    projectName: (selectedReport as any)?.projectName || '',
                                                    developer: (selectedReport as any)?.developer || '',
                                                    contractor: (selectedReport as any)?.contractor || '',
                                                    pmc: (selectedReport as any)?.pmc || '',
                                                    weatherCondition: selectedReport?.weather || '',
                                                    majorHindrances: selectedReport?.delayIssue || '',
                                                    actionTaken: selectedReport?.notes || '',
                                                    workItems: (selectedReport as any)?.workItems || [],
                                                    resources: (selectedReport as any)?.resources || [],
                                                    remarks: (selectedReport as any)?.remarks || [],
                                                    createdAt: selectedReport?.createdAt || new Date(),
                                                };
                                                await downloadDPRPDF(dprData);
                                                toast.success('DPR downloaded as PDF successfully');
                                            } catch (error) {
                                                console.error('Error downloading PDF:', error);
                                                toast.error('Failed to download PDF');
                                            }
                                        }}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Download PDF
                                    </Button>
                                )}
                                {selectedReport?.type === "WPR" && (
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={async () => {
                                            try {
                                                // Transform data to match WPRData interface
                                                const wprData = {
                                                    id: selectedReport?.id || '',
                                                    projectName: (selectedReport as any)?.projectName || '',
                                                    weekStart: selectedReport?.weekStart || new Date(),
                                                    weekEnding: selectedReport?.weekEnding || new Date(),
                                                    plannedProgress: selectedReport?.plannedProgress || 0,
                                                    actualProgress: selectedReport?.actualProgress || 0,
                                                    progressRemarks: selectedReport?.progressRemarks || '',
                                                    milestones: selectedReport?.milestones || '',
                                                    issues: selectedReport?.issues || '',
                                                    risks: selectedReport?.risks || '',
                                                    safetySummary: selectedReport?.safetySummary || '',
                                                    qualitySummary: selectedReport?.qualitySummary || '',
                                                    teamPerformance: selectedReport?.teamPerformance || '',
                                                    manpower: (selectedReport as any)?.manpower || [],
                                                    equipment: (selectedReport as any)?.equipment || [],
                                                    materials: (selectedReport as any)?.materials || [],
                                                    createdAt: selectedReport?.createdAt || new Date(),
                                                };
                                                await downloadWPRPDF(wprData);
                                                toast.success('WPR downloaded as PDF successfully');
                                            } catch (error) {
                                                console.error('Error downloading PDF:', error);
                                                toast.error('Failed to download PDF');
                                            }
                                        }}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Download PDF
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => setIsViewReportModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Add Staff Modal */}
            <Dialog open={isAddStaffModalOpen} onOpenChange={setIsAddStaffModalOpen}>
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
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);

                            // Get role display name from value
                            const roleValue = formData.get("role") as string;
                            const roleMap: Record<string, string> = {
                                "store-manager": "Store Manager",
                                "assistant-manager": "Assistant Manager",
                                "inventory-clerk": "Inventory Clerk",
                                "logistics-coordinator": "Logistics Coordinator",
                                "warehouse-staff": "Warehouse Staff",
                                "material-specialist": "Material Specialist",
                                "inventory-analyst": "Inventory Analyst",
                                "quality-inspector": "Quality Inspector",
                            };

                            // Get availability display name
                            const availabilityValue = formData.get("availability") as string;
                            const availabilityMap: Record<string, string> = {
                                "full-time": "Full-time",
                                "part-time": "Part-time",
                                contract: "Contract",
                                seasonal: "Seasonal",
                                "on-call": "On-Call",
                            };

                            // Parse certifications
                            const certificationString = formData.get(
                                "certifications"
                            ) as string;
                            const certifications = certificationString
                                ? certificationString.split(",").map((cert) => cert.trim())
                                : [];

                            // Create new staff member object
                            const newStaffMember = {
                                name: formData.get("fullName") as string,
                                role: roleMap[roleValue] || roleValue,
                                status: "On Duty",
                                availability:
                                    availabilityMap[availabilityValue] || availabilityValue,
                                experience: `${formData.get("experience")} years`,
                                certifications,
                                contactNumber: formData.get("contactNumber") as string,
                                email: formData.get("email") as string,
                                specialization: formData.get("specialization") as string,
                                shiftPreference: formData.get("shiftPreference") as string,
                                emergencyContact: formData.get("emergencyContact") as string,
                                notes: formData.get("notes") as string,
                            };

                            // Add to staff list
                            setStoreStaff((prevStaff) => [...prevStaff, newStaffMember]);

                            // Show success message
                            toast.success("Staff Member Added Successfully", {
                                description: `${newStaffMember.name} has been added as a ${newStaffMember.role}`,
                            });

                            // Close the modal
                            setIsAddStaffModalOpen(false);
                        }}
                        className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
                    >
                        {/* Staff Information Tab Panel */}
                        <Tabs defaultValue="personal" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                <TabsTrigger value="professional">Professional</TabsTrigger>
                                <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                            </TabsList>

                            {/* Personal Information Tab */}
                            <TabsContent value="personal" className="space-y-3 mt-0">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="fullName"
                                            className="text-xs flex items-center gap-1"
                                        >
                                            Full Name <span className="text-red-500 text-xs">*</span>
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            placeholder="John Doe"
                                            required
                                            className="h-8 text-sm"
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
                                        <Select name="role" required>
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
                                        <Select name="availability" required>
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
                                        <Select name="shiftPreference">
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
                                                <SelectItem value="night">Night (10PM-6AM)</SelectItem>
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
                                    onClick={() => setIsAddStaffModalOpen(false)}
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
            {/* Task View Modal */}
            {/* Edit Task Modal */}
            <Dialog open={isEditTaskModalOpen} onOpenChange={setIsEditTaskModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>Update task details</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-2">
                        {selectedEditTask && (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);

                                    try {
                                        await handleUpdateTask(selectedEditTask.id, {
                                            name: formData.get("name") as string,
                                            description: formData.get("description") as string,
                                            assignedToId: formData.get("assignedToId") as string,
                                            dueDate: formData.get("dueDate") as string,
                                            status: formData.get("status") as string,
                                        });

                                        setIsEditTaskModalOpen(false);
                                        toast.success("Task updated successfully!");
                                    } catch (error) {
                                        toast.error("Failed to update task. Please try again.");
                                    }
                                }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name">Task Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={selectedEditTask.name}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        defaultValue={selectedEditTask.description || ""}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assignedToId">Assign To</Label>
                                    <Select
                                        name="assignedToId"
                                        defaultValue={selectedEditTask.assignedToId || ""}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            name="dueDate"
                                            type="date"
                                            defaultValue={
                                                selectedEditTask.dueDate
                                                    ? new Date(selectedEditTask.dueDate)
                                                        .toISOString()
                                                        .split("T")[0]
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            name="status"
                                            defaultValue={selectedEditTask.status}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditTaskModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Update Task</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {/* Task View Modal */}
            <Dialog open={isTaskViewModalOpen} onOpenChange={setIsTaskViewModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Task Details - {selectedTaskView?.name}</DialogTitle>
                        <DialogDescription>
                            View all details and progress history
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTaskView && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Task Name</Label>
                                    <p className="font-medium">{selectedTaskView.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Project</Label>
                                    <p className="font-medium">
                                        {selectedTaskView.projectName || "Unknown Project"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Assigned To</Label>
                                    <p className="font-medium">{selectedTaskView.assignedTo}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p className="font-medium">{selectedTaskView.description}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Start Date</Label>
                                    <p className="font-medium">
                                        {
                                            new Date(selectedTaskView.startDate)
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Due Date</Label>
                                    <p className="font-medium">
                                        {
                                            new Date(selectedTaskView.dueDate)
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge
                                        variant={
                                            selectedTaskView.status === "completed"
                                                ? "default"
                                                : selectedTaskView.status === "in-progress"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                    >
                                        {selectedTaskView.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end border-t mt-6 px-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsTaskViewModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Material Request Update Modal */}
            <Dialog
                open={isMaterialRequestUpdateModalOpen}
                onOpenChange={setIsMaterialRequestUpdateModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Material Request Status</DialogTitle>
                        <DialogDescription>
                            Change the status of material request{" "}
                            {selectedMaterialRequest?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMaterialRequest && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleUpdateMaterialRequestStatus(
                                    selectedMaterialRequest.id,
                                    formData.get("status") as string
                                );
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    name="status"
                                    defaultValue={selectedMaterialRequest.status}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="In Transit">In Transit</SelectItem>
                                        <SelectItem value="Expedited">Expedited</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsMaterialRequestUpdateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Update Status</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            {/* Delete Task Confirmation Dialog */}
            <AlertDialog
                open={isDeleteTaskDialogOpen}
                onOpenChange={setIsDeleteTaskDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the task "
                            {selectedDeleteTask?.name}"? This action cannot be undone and will
                            permanently remove the task from the project.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (selectedDeleteTask) {
                                    handleDeleteTask(selectedDeleteTask.id);
                                    setIsDeleteTaskDialogOpen(false);
                                    setSelectedDeleteTask(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const SiteDashboard = () => {
    return (
        <PageUserFilterProvider allowedRoles={["project"]}>
            <SiteDashboardContent />
        </PageUserFilterProvider>
    );
};
export default SiteDashboard;

// Add this component above the SiteDashboard export
interface WorkItem {
    id: string;
    description: string;
    boqQuantity: number;
    alreadyExecuted: number;
    todaysProgress: number;
    yesterdayAchievement: number;
    cumulativeQuantity: number;
    balanceQuantity: number;
    remarks: string;
}

interface ManpowerItem {
    id: string;
    dailyManpowerReport: string;
    hoursWorked: number;
    plannedManpower: number;
    remarks: string;
    equipmentMachineries: string;
    nos: number;
}

interface StaffItem {
    id: string;
    position: string;
    count: number;
}

interface HindranceItem {
    id: string;
    category: string;
    actionTaken: string;
    remarks: string;
}

function DPRManualForm({
    onSubmit,
    onCancel,
    projects,
}: {
    onSubmit: (formData: any) => void;
    onCancel: () => void;
    projects: Project[];
}) {
    const [formData, setFormData] = useState({
        projectId: '',
        projectName: '',
        developer: '',
        contractor: '',
        pmc: '',
        bokNo: '',
        date: new Date().toISOString().split('T')[0],
        weatherCondition: 'Clear'
    });

    const [workItems, setWorkItems] = useState<WorkItem[]>([
        {
            id: '1',
            description: '',
            boqQuantity: 0,
            alreadyExecuted: 0,
            todaysProgress: 0,
            yesterdayAchievement: 0,
            cumulativeQuantity: 0,
            balanceQuantity: 0,
            remarks: ''
        }
    ]);

    const [manpowerItems, setManpowerItems] = useState<ManpowerItem[]>([
        {
            id: '1',
            dailyManpowerReport: '',
            hoursWorked: 0,
            plannedManpower: 0,
            remarks: '',
            equipmentMachineries: '',
            nos: 0
        }
    ]);

    const [staffItems, setStaffItems] = useState<StaffItem[]>([
        { id: '1', position: 'PM', count: 0 },
        { id: '2', position: 'Billing & Planning Eng.', count: 0 },
        { id: '3', position: 'Quality Eng.', count: 0 },
        { id: '4', position: 'Quality Helper', count: 0 },
        { id: '5', position: 'Site Engineer', count: 0 },
        { id: '6', position: 'Supervisor', count: 0 },
        { id: '7', position: 'Store', count: 0 },
        { id: '8', position: 'Surveyor', count: 0 },
        { id: '9', position: 'Safety', count: 0 },
        { id: '10', position: 'Electrician/Mechanic', count: 0 },
        { id: '11', position: 'PUMP OPERATOR', count: 0 },
        { id: '12', position: 'WELDER', count: 0 }
    ]);

    const [hindranceItems, setHindranceItems] = useState<HindranceItem[]>([
        { id: '1', category: '', actionTaken: '', remarks: '' }
    ]);

    const addWorkItem = () => {
        const newItem: WorkItem = {
            id: Date.now().toString(),
            description: '',
            boqQuantity: 0,
            alreadyExecuted: 0,
            todaysProgress: 0,
            yesterdayAchievement: 0,
            cumulativeQuantity: 0,
            balanceQuantity: 0,
            remarks: ''
        };
        setWorkItems([...workItems, newItem]);
    };

    const removeWorkItem = (id: string) => {
        if (workItems.length > 1) {
            setWorkItems(workItems.filter(item => item.id !== id));
        }
    };

    const updateWorkItem = (id: string, field: keyof WorkItem, value: string | number) => {
        setWorkItems(workItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                // Auto-calculate cumulative and balance quantities
                if (field === 'alreadyExecuted' || field === 'todaysProgress') {
                    updatedItem.cumulativeQuantity = updatedItem.alreadyExecuted + updatedItem.todaysProgress;
                    updatedItem.balanceQuantity = updatedItem.boqQuantity - updatedItem.cumulativeQuantity;
                } else if (field === 'boqQuantity') {
                    updatedItem.balanceQuantity = updatedItem.boqQuantity - updatedItem.cumulativeQuantity;
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const addManpowerItem = () => {
        const newItem: ManpowerItem = {
            id: Date.now().toString(),
            dailyManpowerReport: '',
            hoursWorked: 0,
            plannedManpower: 0,
            remarks: '',
            equipmentMachineries: '',
            nos: 0
        };
        setManpowerItems([...manpowerItems, newItem]);
    };

    const removeManpowerItem = (id: string) => {
        if (manpowerItems.length > 1) {
            setManpowerItems(manpowerItems.filter(item => item.id !== id));
        }
    };

    const updateManpowerItem = (id: string, field: keyof ManpowerItem, value: string | number) => {
        setManpowerItems(manpowerItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const updateStaffItem = (id: string, count: number) => {
        setStaffItems(staffItems.map(item =>
            item.id === id ? { ...item, count } : item
        ));
    };

    const addHindranceItem = () => {
        const newItem: HindranceItem = {
            id: Date.now().toString(),
            category: '',
            actionTaken: '',
            remarks: ''
        };
        setHindranceItems([...hindranceItems, newItem]);
    };

    const removeHindranceItem = (id: string) => {
        if (hindranceItems.length > 1) {
            setHindranceItems(hindranceItems.filter(item => item.id !== id));
        }
    };

    const updateHindranceItem = (id: string, field: 'category' | 'actionTaken' | 'remarks', value: string) => {
        setHindranceItems(hindranceItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            workItems,
            manpowerItems,
            staffItems,
            hindranceItems
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-md">
                <div className="space-y-2">
                    <Label htmlFor="projectName">NAME OF THE PROJECT:</Label>
                    <Select
                        value={formData.projectId}
                        onValueChange={(projectId) => {
                            const selectedProject = projects.find((p) => p.id === projectId);
                            setFormData({
                                ...formData,
                                projectId,
                                projectName: selectedProject?.name || ''
                            });
                        }}
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

                <div className="space-y-2">
                    <Label htmlFor="developer">DEVELOPER:</Label>
                    <Input
                        id="developer"
                        value={formData.developer}
                        onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                        placeholder="Enter developer name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contractor">CONTRACTOR:</Label>
                    <Input
                        id="contractor"
                        value={formData.contractor}
                        onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                        placeholder="Enter contractor name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pmc">PMC:</Label>
                    <Input
                        id="pmc"
                        value={formData.pmc}
                        onChange={(e) => setFormData({ ...formData, pmc: e.target.value })}
                        placeholder="Enter PMC"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bokNo">BOK NO:</Label>
                    <Input
                        id="bokNo"
                        value={formData.bokNo}
                        onChange={(e) => setFormData({ ...formData, bokNo: e.target.value })}
                        placeholder="Enter BOK number"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">DATE:</Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="space-y-2 lg:col-span-3">
                    <Label>Weather Condition:</Label>
                    <div className="flex space-x-4 flex-wrap">
                        {['Clear', 'Cloudy', 'Other / Rainy Dry'].map(condition => (
                            <div key={condition} className="flex items-center space-x-2">
                                <Checkbox
                                    id={condition}
                                    checked={formData.weatherCondition === condition}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setFormData({ ...formData, weatherCondition: condition });
                                        }
                                    }}
                                />
                                <Label htmlFor={condition}>{condition}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Work Progress Table */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Work Progress Details</CardTitle>
                        <Button type="button" onClick={addWorkItem} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Sl. No</TableHead>
                                    <TableHead>Description of Work</TableHead>
                                    <TableHead>BOQ Quantity</TableHead>
                                    <TableHead>Already Executed Quantity</TableHead>
                                    <TableHead>Today's Progress</TableHead>
                                    <TableHead>Yesterday Achievement</TableHead>
                                    <TableHead>Cumulative Quantity</TableHead>
                                    <TableHead>Balance Quantity</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workItems.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateWorkItem(item.id, 'description', e.target.value)}
                                                placeholder="Enter work description"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.boqQuantity}
                                                onChange={(e) => updateWorkItem(item.id, 'boqQuantity', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.alreadyExecuted}
                                                onChange={(e) => updateWorkItem(item.id, 'alreadyExecuted', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.todaysProgress}
                                                onChange={(e) => updateWorkItem(item.id, 'todaysProgress', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.yesterdayAchievement}
                                                onChange={(e) => updateWorkItem(item.id, 'yesterdayAchievement', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.cumulativeQuantity}
                                                readOnly
                                                className="bg-gray-100"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.balanceQuantity}
                                                readOnly
                                                className="bg-gray-100"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.remarks}
                                                onChange={(e) => updateWorkItem(item.id, 'remarks', e.target.value)}
                                                placeholder="Enter remarks"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeWorkItem(item.id)}
                                                disabled={workItems.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Labour & Machineries Details */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>LABOUR & MACHINERIES DETAILS</CardTitle>
                        <Button type="button" onClick={addManpowerItem} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Sl. No</TableHead>
                                    <TableHead>Daily Manpower Report</TableHead>
                                    <TableHead>No. of Hours</TableHead>
                                    <TableHead>Planned Manpower</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead>Equipment & Machineries</TableHead>
                                    <TableHead>Nos.</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {manpowerItems.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.dailyManpowerReport}
                                                onChange={(e) => updateManpowerItem(item.id, 'dailyManpowerReport', e.target.value)}
                                                placeholder="Enter manpower report"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.hoursWorked}
                                                onChange={(e) => updateManpowerItem(item.id, 'hoursWorked', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.plannedManpower}
                                                onChange={(e) => updateManpowerItem(item.id, 'plannedManpower', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.remarks}
                                                onChange={(e) => updateManpowerItem(item.id, 'remarks', e.target.value)}
                                                placeholder="Enter remarks"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.equipmentMachineries}
                                                onChange={(e) => updateManpowerItem(item.id, 'equipmentMachineries', e.target.value)}
                                                placeholder="Enter equipment details"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.nos}
                                                onChange={(e) => updateManpowerItem(item.id, 'nos', parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeManpowerItem(item.id)}
                                                disabled={manpowerItems.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Staff Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {staffItems.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <Label htmlFor={`staff-${item.id}`}>{item.position}</Label>
                                <Input
                                    id={`staff-${item.id}`}
                                    type="number"
                                    value={item.count}
                                    onChange={(e) => updateStaffItem(item.id, parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Major Hindrances */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>MAJOR HINDRANCES</CardTitle>
                        <Button type="button" onClick={addHindranceItem} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Sl. No</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Action Taken</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hindranceItems.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.category}
                                                onChange={(e) => updateHindranceItem(item.id, 'category', e.target.value)}
                                                placeholder="Enter hindrance category"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Textarea
                                                value={item.actionTaken}
                                                onChange={(e) => updateHindranceItem(item.id, 'actionTaken', e.target.value)}
                                                placeholder="Enter action taken"
                                                rows={2}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Textarea
                                                value={item.remarks}
                                                onChange={(e) => updateHindranceItem(item.id, 'remarks', e.target.value)}
                                                placeholder="Enter remarks"
                                                rows={2}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeHindranceItem(item.id)}
                                                disabled={hindranceItems.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
                <Button type="button" onClick={handleSubmit} className="px-8 py-2">
                    Save Report
                </Button>
                <Button type="button" variant="outline" className="px-8 py-2" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// Add this component above the SiteDashboard export
function WPRManualForm({
    onSubmit,
    onCancel,
    projects,
}: {
    onSubmit: (formData: any) => void;
    onCancel: () => void;
    projects: Project[];
}) {
    const [manpower, setManpower] = useState([
        { role: "", planned: "", actual: "", remarks: "" },
    ]);
    const [equipment, setEquipment] = useState([
        { equipment: "", uptime: "", downtime: "", remarks: "" },
    ]);
    const [materials, setMaterials] = useState([
        { material: "", planned: "", actual: "", remarks: "" },
    ]);

    // Manpower handlers
    const addManpowerRow = () =>
        setManpower([...manpower, { role: "", planned: "", actual: "", remarks: "" }]);
    const removeManpowerRow = (idx: number) =>
        setManpower(manpower.filter((_, i) => i !== idx));
    const updateManpower = (idx: number, field: string, value: string) => {
        setManpower(
            manpower.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
        );
    };
    // Equipment handlers
    const addEquipmentRow = () =>
        setEquipment([
            ...equipment,
            { equipment: "", uptime: "", downtime: "", remarks: "" },
        ]);
    const removeEquipmentRow = (idx: number) =>
        setEquipment(equipment.filter((_, i) => i !== idx));
    const updateEquipment = (idx: number, field: string, value: string) => {
        setEquipment(
            equipment.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
        );
    };
    // Materials handlers
    const addMaterialRow = () =>
        setMaterials([
            ...materials,
            { material: "", planned: "", actual: "", remarks: "" },
        ]);
    const removeMaterialRow = (idx: number) =>
        setMaterials(materials.filter((_, i) => i !== idx));
    const updateMaterial = (idx: number, field: string, value: string) => {
        setMaterials(
            materials.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
        );
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onSubmit({
                    projectId: formData.get("projectId") as string,
                    weekStart: formData.get("weekStart") as string,
                    weekEnding: formData.get("weekEnding") as string,
                    milestones: formData.get("milestones") as string,
                    plannedProgress: formData.get("plannedProgress") as string,
                    actualProgress: formData.get("actualProgress") as string,
                    progressRemarks: formData.get("progressRemarks") as string,
                    issues: formData.get("issues") as string,
                    risks: formData.get("risks") as string,
                    safetySummary: formData.get("safetySummary") as string,
                    qualitySummary: formData.get("qualitySummary") as string,
                    manpower,
                    equipment,
                    materials,
                    teamPerformance: formData.get("teamPerformance") as string,
                    attachments: formData.get("attachments") as unknown as FileList,
                });
            }}
            className="space-y-4"
        >
            <div>
                <Label htmlFor="projectId">Project *</Label>
                <Select name="projectId" required>
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
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="weekStart">Week Start</Label>
                    <Input id="weekStart" name="weekStart" type="date" required />
                </div>
                <div>
                    <Label htmlFor="weekEnding">Week Ending</Label>
                    <Input id="weekEnding" name="weekEnding" type="date" required />
                </div>
            </div>
            <div>
                <Label htmlFor="milestones">Key Milestones Achieved</Label>
                <Textarea
                    id="milestones"
                    name="milestones"
                    placeholder="Describe milestone achievements..."
                    rows={3}
                    required
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="plannedProgress">Planned Progress (%)</Label>
                    <Input
                        id="plannedProgress"
                        name="plannedProgress"
                        type="number"
                        min="0"
                        max="100"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="actualProgress">Actual Progress (%)</Label>
                    <Input
                        id="actualProgress"
                        name="actualProgress"
                        type="number"
                        min="0"
                        max="100"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="progressRemarks">Remarks</Label>
                    <Input
                        id="progressRemarks"
                        name="progressRemarks"
                        placeholder="Progress remarks"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="issues">Major Issues</Label>
                    <Textarea
                        id="issues"
                        name="issues"
                        placeholder="Describe major issues..."
                        rows={2}
                    />
                </div>
                <div>
                    <Label htmlFor="risks">Major Risks</Label>
                    <Textarea
                        id="risks"
                        name="risks"
                        placeholder="Describe major risks..."
                        rows={2}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="safetySummary">Safety Summary</Label>
                    <Textarea
                        id="safetySummary"
                        name="safetySummary"
                        placeholder="Incidents, toolbox talks, etc."
                        rows={2}
                    />
                </div>
                <div>
                    <Label htmlFor="qualitySummary">Quality Summary</Label>
                    <Textarea
                        id="qualitySummary"
                        name="qualitySummary"
                        placeholder="Checks, NCRs, etc."
                        rows={2}
                    />
                </div>
            </div>
            <div>
                <Label>Manpower Summary</Label>
                <div className="space-y-2">
                    {manpower.map((row, idx) => (
                        <div key={idx} className="flex gap-2 items-center flex-wrap">
                            <Input
                                name={`wprRole${idx}`}
                                placeholder="Role"
                                className="text-xs"
                                value={row.role}
                                onChange={(e) => updateManpower(idx, "role", e.target.value)}
                                required
                            />
                            <Input
                                name={`wprRolePlanned${idx}`}
                                placeholder="Planned"
                                className="text-xs"
                                value={row.planned}
                                onChange={(e) => updateManpower(idx, "planned", e.target.value)}
                                required
                            />
                            <Input
                                name={`wprRoleActual${idx}`}
                                placeholder="Actual"
                                className="text-xs"
                                value={row.actual}
                                onChange={(e) => updateManpower(idx, "actual", e.target.value)}
                                required
                            />
                            <Input
                                name={`wprRoleRemarks${idx}`}
                                placeholder="Remarks"
                                className="text-xs flex-1 min-w-[120px]"
                                value={row.remarks || ""}
                                onChange={(e) => updateManpower(idx, "remarks", e.target.value)}
                            />
                            {manpower.length > 1 && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeManpowerRow(idx)}
                                >
                                    &times;
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addManpowerRow}
                    >
                        Add Manpower Row
                    </Button>
                </div>
            </div>
            <div>
                <Label>Equipment Summary</Label>
                <div className="space-y-2">
                    {equipment.map((row, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <Input
                                name={`wprEq${idx}`}
                                placeholder="Equipment"
                                className="text-xs"
                                value={row.equipment}
                                onChange={(e) =>
                                    updateEquipment(idx, "equipment", e.target.value)
                                }
                                required
                            />
                            <Input
                                name={`wprEqUptime${idx}`}
                                placeholder="Uptime (hrs)"
                                className="text-xs"
                                value={row.uptime}
                                onChange={(e) => updateEquipment(idx, "uptime", e.target.value)}
                                required
                            />
                            <Input
                                name={`wprEqDowntime${idx}`}
                                placeholder="Downtime (hrs)"
                                className="text-xs"
                                value={row.downtime}
                                onChange={(e) =>
                                    updateEquipment(idx, "downtime", e.target.value)
                                }
                                required
                            />
                            <Input
                                name={`wprEqRemarks${idx}`}
                                placeholder="Remarks"
                                className="text-xs flex-1 min-w-[120px]"
                                value={row.remarks || ""}
                                onChange={(e) =>
                                    updateEquipment(idx, "remarks", e.target.value)
                                }
                            />
                            {equipment.length > 1 && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeEquipmentRow(idx)}
                                >
                                    &times;
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addEquipmentRow}
                    >
                        Add Equipment Row
                    </Button>
                </div>
            </div>
            <div>
                <Label>Materials Summary</Label>
                <div className="space-y-2">
                    {materials.map((row, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <Input
                                name={`wprMat${idx}`}
                                placeholder="Material"
                                className="text-xs"
                                value={row.material}
                                onChange={(e) =>
                                    updateMaterial(idx, "material", e.target.value)
                                }
                                required
                            />
                            <Input
                                name={`wprMatPlanned${idx}`}
                                placeholder="Planned"
                                className="text-xs"
                                value={row.planned}
                                onChange={(e) => updateMaterial(idx, "planned", e.target.value)}
                                required
                            />
                            <Input
                                name={`wprMatActual${idx}`}
                                placeholder="Actual"
                                className="text-xs"
                                value={row.actual}
                                onChange={(e) => updateMaterial(idx, "actual", e.target.value)}
                                required
                            />
                            <Input
                                name={`wprMatRemarks${idx}`}
                                placeholder="Remarks"
                                className="text-xs flex-1 min-w-[120px]"
                                value={row.remarks || ""}
                                onChange={(e) => updateMaterial(idx, "remarks", e.target.value)}
                            />
                            {materials.length > 1 && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeMaterialRow(idx)}
                                >
                                    &times;
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMaterialRow}
                    >
                        Add Material Row
                    </Button>
                </div>
            </div>
            <div>
                <Label htmlFor="teamPerformance">Team Performance</Label>
                <Textarea
                    id="teamPerformance"
                    name="teamPerformance"
                    placeholder="Team performance comments..."
                    rows={3}
                    required
                />
            </div>
            {/* <div>
        <Label htmlFor="attachments">Attachments (Photos, Documents)</Label>
        <Input id="attachments" name="attachments" type="file" multiple accept="image/*,application/pdf" />
      </div> */}
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">Submit WPR</Button>
            </div>
        </form>
    );
}
