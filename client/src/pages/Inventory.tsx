import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryData } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import {
    Download,
    FilterIcon,
    Map,
    Package,
    Plus,
    Search,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Clock,
    Truck,
    Warehouse,
    Calendar,
    Users,
    CheckCircle,
    Check,
    Pencil,
    Trash,
    Edit,
    X,
    Eye,
    FileDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { StatCard } from "@/components/stat-card";
import { InteractiveChart } from "@/components/interactive-chart";
import { ExpandableDataTable } from "@/components/expandable-data-table";
import MaterialTransferModal from "@/components/modals/MaterialTransferModal";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SimpleSearchableSelect } from "@/components/simple-searchable-select";
import { Progress } from "@/components/ui/progress";
import { GanttChart } from "@/components/project-management/gantt-chart";
import { MaterialForecast } from "@/components/project-management/material-forecast";
import { IssueReportingFunctional } from "@/components/project-management/issue-reporting-functional";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import type { InventoryItem as InventoryItemType } from "@/types/dummy-data-types";
import { useUser } from "@/contexts/UserContext";
import { useUserFilter } from "@/contexts/UserFilterContext";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import { generateMaterialIndentPDF } from "@/utils/material-indent-pdf";
import { generateMaterialTransferPDF } from "@/utils/material-transfer-pdf";
const API_URL =
    import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Add backend state
// const [inventoryTrends, setInventoryTrends] = useState([]);
// const [warehouseUtilization, setWarehouseUtilization] = useState([]);
// const [grnData, setGrnData] = useState([]);
// const [transferData, setTransferData] = useState([]);
// const [tasks, setTasks] = useState([]);

// Add the form schema
const addItemFormSchema = z.object({
    project: z.string().optional(),
    name: z.string().min(2, "Item name must be at least 2 characters"),
    itemCode: z.string().min(2, "Item code must be at least 2 characters"),
    category: z.array(z.string()).min(1, "Please select at least one category"),
    type: z.string().min(1, "Please select a type"),
    quantity: z.number().min(0, "Quantity must be 0 or greater"),
    unit: z.string().min(1, "Please select a unit"),
    maxStock: z.number().min(0, "Maximum stock must be 0 or greater"),
    safetyStock: z.number().min(0, "Safety stock must be 0 or greater"),
    primarySupplier: z.string().min(1, "Please select a primary supplier"),
    primarySupplierManual: z.string().optional(),
    secondarySupplier: z.string().optional(),
    secondarySupplierManual: z.string().optional(),
    unitCost: z.number().min(0, "Unit cost must be 0 or greater"),
    image: z.instanceof(File).optional(),
}).refine(
    (data) => {
        if (data.primarySupplier === "OTHER" && !data.primarySupplierManual) {
            return false;
        }
        return true;
    },
    {
        message: "Please enter a supplier name",
        path: ["primarySupplierManual"],
    }
).refine(
    (data) => {
        if (data.secondarySupplier === "OTHER" && !data.secondarySupplierManual) {
            return false;
        }
        return true;
    },
    {
        message: "Please enter a supplier name",
        path: ["secondarySupplierManual"],
    }
);

// Add maintenance form schema
const maintenanceFormSchema = z.object({
    equipment: z.string().min(1, "Please select equipment"),
    maintenanceType: z.string().min(1, "Please select maintenance type"),
    scheduledDate: z.string().min(1, "Please select a date"),
    priority: z.string().min(1, "Please select priority"),
    technician: z.string().min(1, "Please assign a technician"),
    estimatedDuration: z.number().min(1, "Duration must be at least 1 hour"),
    description: z.string().optional(),
    notes: z.string().optional(),
});

// Add material indane form schema
const materialIndentFormSchema = z.object({
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    companyCity: z.string().optional(),
    companyPostalCode: z.string().optional(),
    headerText: z.string().optional(),
    site: z.string().min(1, "Site is required"),
    orderSlipNo: z.string().min(1, "Order Slip No is required"),
    date: z.string().min(1, "Date is required"),
    storeKeeperName: z.string().min(1, "Store Keeper Name is required"),
    storeKeeperSignature: z.instanceof(File).optional(),
    projectManagerName: z.string().min(1, "Project Manager Name is required"),
    projectManagerSignature: z.instanceof(File).optional(),
    items: z
        .array(
            z.object({
                slNo: z.number().min(1, "Serial number is required"),
                dateOfOrder: z.string().optional(),
                materialDescription: z
                    .string()
                    .min(1, "Material description is required"),
                unit: z.string().min(1, "Unit is required"),
                requiredQty: z
                    .number()
                    .min(0, "Required quantity must be 0 or greater"),
                receivedQty: z
                    .number()
                    .min(0, "Received quantity must be 0 or greater"),
                balance: z.number().min(0, "Balance must be 0 or greater"),
                deliveryDate: z.string().optional(),
                remarks: z.string().optional(),
            })
        )
        .min(1, "At least one item is required"),
});

type AddItemFormValues = z.infer<typeof addItemFormSchema>;
type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;
type MaterialIndentFormValues = z.infer<typeof materialIndentFormSchema>;

// Department options for construction
const DEPARTMENT_OPTIONS = [
    { value: "CIVIL_WORKS", label: "Civil Works" },
    { value: "ELECTRICAL", label: "Electrical" },
    { value: "PLUMBING", label: "Plumbing" },
    { value: "HVAC", label: "HVAC" },
    { value: "FINISHING", label: "Finishing" },
    { value: "PROCUREMENT", label: "Procurement" },
    { value: "SITE_MANAGEMENT", label: "Site Management" },
];

// Priority options
const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

const defaultValues: Partial<AddItemFormValues> = {
    quantity: 0,
    maxStock: 500,
    safetyStock: 20,
    unitCost: 0,
    category: [],
    unit: "",
    primarySupplier: "",
    primarySupplierManual: "",
    secondarySupplier: "",
    secondarySupplierManual: "",
    image: undefined,
    itemCode: "",
};

const maintenanceDefaultValues: Partial<MaintenanceFormValues> = {
    equipment: "",
    maintenanceType: "",
    scheduledDate: "",
    priority: "Medium",
    technician: "",
    estimatedDuration: 2,
    description: "",
    notes: "",
};

// Update the interface for filters
interface FilterOption {
    key: string;
    label: string;
    options: string[];
    multiple?: boolean;
}

// Add interfaces for transfer

interface Transfer {
    approvalStatus: string;
    dbId?: string;
    id: string;
    from: string;
    to: string;
    items: number;
    status: string;
    driver: string;
    eta: string;
    etaMinutes?: number;
    isFlagged: boolean;
    requestedDate?: string;
    requestedAtMs?: number;
}

// Update category options constant to match backend enums
const CATEGORY_OPTIONS = [
    { value: "CONSTRUCTION_MATERIALS", label: "Construction Materials" },
    { value: "TOOLS_AND_EQUIPMENT", label: "Tools & Equipment" },
    { value: "SAFETY_EQUIPMENT", label: "Safety Equipment" },
    { value: "ELECTRICAL_COMPONENTS", label: "Electrical Components" },
    { value: "PLUMBING_MATERIALS", label: "Plumbing Materials" },
    { value: "HVAC_EQUIPMENT", label: "HVAC Equipment" },
    { value: "FINISHING_MATERIALS", label: "Finishing Materials" },
    { value: "HARDWARE_AND_FASTENERS", label: "Hardware & Fasteners" },
];

const UNIT_OPTIONS = [
    { value: "PIECE", label: "Pieces" },
    { value: "KILOGRAM", label: "Kilograms" },
    { value: "TONNE", label: "Tonnes" },
    { value: "CUBIC_FEET", label: "Cubic Feet" },
    { value: "M_CUBE", label: "Metre Cube" },
    { value: "SQUARE_FEET", label: "Square Feet" },
    { value: "SQUARE_METRE", label: "Square Metres" },
    { value: "LITRE", label: "Litres" },
    { value: "BOX", label: "Boxes" },
    { value: "ROLL", label: "Rolls" },
    { value: "SHEET", label: "Sheets" },
];

const ITEM_OPTIONS = [
    // Acrogan items
    { value: "ACROGAN", label: "Acrogan" },
    { value: "ACROSPAN", label: "Acrospan" },
    { value: "INNER_ACROSPAN", label: "Inner Acrospan" },
    { value: "OUTER_ACROGAN", label: "Outer Acrogan" },
    { value: "OUTER_ACROSPAN", label: "Outer Acrospan" },
    { value: "TWO_POINT_FIVE_MTR_INNER_ACROSPAN", label: "2.5 Mtr Inner Acrospan" },
    { value: "TWO_POINT_FIVE_MTR_OUTER_ACROSPAN", label: "2.5 Mtr Outer Acrospan" },
    { value: "THREE_MTR_INNER_ACROSPAN", label: "3 Mtr Inner Acrospan" },
    { value: "THREE_MTR_OUTER_ACROSPAN", label: "3 Mtr Outer Acrospan" },
    { value: "TWO_MTR_BOX_SET_ACROSPAN", label: "2 Mtr Box Set Acrospan" },
    { value: "THREE_MTR_BOX_SET_ACROSPAN", label: "3 Mtr Box Set Acrospan" },

    // Tele Prop items
    { value: "THREE_THREE_TELE_PROP", label: "3/3 Tele Prop" },
    { value: "TWO_THREE_TELE_PROP", label: "2/3 Tele Prop" },
    { value: "THREE_MTR_INNER_TELE_PROP", label: "3 Mtr Inner Tele Prop" },
    { value: "THREE_MTR_OUTER_TELE_PROP", label: "3 Mtr Outer Tele Prop" },
    { value: "TWO_TWO_TELE_PROP", label: "2/2 Tele Prop" },
    { value: "TWO_MTR_INNER_TELE_PROP", label: "2 Mtr Inner Tele Prop" },
    { value: "TWO_MTR_OUTER_TELE_PROP", label: "2 Mtr Outer Tele Prop" },

    // Vertical items
    { value: "CUTTING_PIC_VERTICAL", label: "Cutting Pic Vertical" },
    { value: "SCRAP_VERTICAL", label: "Scrap Vertical" },
    { value: "THREE_MTR_2_CAP_VERTICAL", label: "3 Mtr 2 Cap Vertical" },
    { value: "THREE_MTR_3_CAP_VERTICAL", label: "3 Mtr 3 Cap Vertical" },
    { value: "THREE_MTR_6_CAP_VERTICAL", label: "3 Mtr 6 Cap Vertical" },
    { value: "REJECT_3_MTR_VERTICAL", label: "Reject 3 Mtr Vertical" },
    { value: "FIVE_HUNDRED_MM_VERTICAL", label: "500 MM Vertical" },
    { value: "MM_VERTICAL_1500", label: "1500 MM Vertical" },
    { value: "MM_VERTICAL_1000", label: "1000 MM Vertical" },
    { value: "TWO_MTR_VERTICAL", label: "2 Mtr Vertical" },

    // Horizontal items
    { value: "MM_HORIZONTAL_600", label: "600 MM Horizontal" },
    { value: "SEVEN_FIFTY_MM_HORIZONTAL", label: "750 MM Horizontal" },
    { value: "NINE_HUNDRED_MM_HORIZONTAL", label: "900 MM Horizontal" },
    { value: "MM_HORIZONTAL_1000", label: "1000 MM Horizontal" },
    { value: "ONE_THOUSAND_FIFTY_MM_HORIZONTAL", label: "1050 MM Horizontal" },
    { value: "MM_HORIZONTAL_1150", label: "1150 MM Horizontal" },
    { value: "MM_HORIZONTAL_1200", label: "1200 MM Horizontal" },
    { value: "TWELVE_FIFTY_MM_HORIZONTAL", label: "1250 MM Horizontal" },
    { value: "FIFTEEN_HUNDRED_MM_HORIZONTAL", label: "1500 MM Horizontal" },
    { value: "MM_HORIZONTAL_1700", label: "1700 MM Horizontal" },
    { value: "SEVENTEEN_FIFTY_MM_HORIZONTAL", label: "1750 MM Horizontal" },
    { value: "MM_HORIZONTAL_1800", label: "1800 MM Horizontal" },

    // MS Pipe items
    { value: "STAGING_SUPPORTING_PIPE", label: "Staging Supporting Pipe" },
    { value: "TWENTY_FEET_MS_PIPE", label: "20 Feet MS Pipe" },
    { value: "TEN_FEET_MS_PIPE", label: "10 Feet MS Pipe" },
    { value: "CUTTING_PIC_MS_PIPE", label: "Cutting Pic MS Pipe" },
    { value: "MS_CLUMP", label: "MS Clump" },
    { value: "FORTY_X_FORTY_SWING_CLUMP", label: "40x40 Swing Clump" },
    { value: "CLAMP_40X40_FIXED", label: "40x40 Fixed Clamp" },
    { value: "CLAMP_50X40_SWING", label: "50x40 Swing Clamp" },
    { value: "FIFTY_X_FORTY_FIXED_CLUMP", label: "50x40 Fixed Clump" },
    { value: "GI_SHEET_TINA", label: "GI Sheet Tina" },

    // SIKANJA sizes
    { value: "SIKANJA_600MM", label: "600 MM SIKANJA" },
    { value: "SIKANJA_650MM", label: "650 MM SIKANJA" },
    { value: "SIKANJA_700MM", label: "700 MM SIKANJA" },
    { value: "SIKANJA_750MM", label: "750 MM SIKANJA" },
    { value: "SIKANJA_800MM", label: "800 MM SIKANJA" },
    { value: "SIKANJA_850MM", label: "850 MM SIKANJA" },
    { value: "SIKANJA_900MM", label: "900 MM SIKANJA" },
    { value: "SIKANJA_950MM", label: "950 MM SIKANJA" },
    { value: "SIKANJA_1000MM", label: "1000 MM SIKANJA" },
    { value: "SIKANJA_1050MM", label: "1050 MM SIKANJA" },
    { value: "SIKANJA_1100MM", label: "1100 MM SIKANJA" },
    { value: "SIKANJA_1150MM", label: "1150 MM SIKANJA" },
    { value: "SIKANJA_1200MM", label: "1200 MM SIKANJA" },
    { value: "SIKANJA_1250MM", label: "1250 MM SIKANJA" },
    { value: "SIKANJA_1300MM", label: "1300 MM SIKANJA" },
    { value: "SIKANJA_1350MM", label: "1350 MM SIKANJA" },
    { value: "SIKANJA_1400MM", label: "1400 MM SIKANJA" },
    { value: "SIKANJA_1450MM", label: "1450 MM SIKANJA" },
    { value: "SIKANJA_1500MM", label: "1500 MM SIKANJA" },
    { value: "SIKANJA_1550MM", label: "1550 MM SIKANJA" },
    { value: "SIKANJA_1600MM", label: "1600 MM SIKANJA" },
    { value: "SIKANJA_1650MM", label: "1650 MM SIKANJA" },
    { value: "SIKANJA_1700MM", label: "1700 MM SIKANJA" },
    { value: "SIKANJA_1750MM", label: "1750 MM SIKANJA" },
    { value: "SIKANJA_1800MM", label: "1800 MM SIKANJA" },
    { value: "SIKANJA_1850MM", label: "1850 MM SIKANJA" },
    { value: "SIKANJA_1900MM", label: "1900 MM SIKANJA" },
    { value: "SIKANJA_2000MM", label: "2000 MM SIKANJA" },
    { value: "SIKANJA_2050MM", label: "2050 MM SIKANJA" },
    { value: "SIKANJA_2100MM", label: "2100 MM SIKANJA" },
    { value: "SIKANJA_2150MM", label: "2150 MM SIKANJA" },
    { value: "SIKANJA_2200MM", label: "2200 MM SIKANJA" },
    { value: "SIKANJA_2250MM", label: "2250 MM SIKANJA" },
    { value: "SIKANJA_2300MM", label: "2300 MM SIKANJA" },
    { value: "ALL_SIKANJA", label: "All SIKANJA" },
    { value: "SIKANJA_PIN", label: "SIKANJA Pin" },

    // C SIKANJA variants
    { value: "C_SIKANJA_750MM", label: "750 MM C SIKANJA" },
    { value: "C_SIKANJA_800MM", label: "800 MM C SIKANJA" },
    { value: "C_SIKANJA_860MM", label: "860 MM C SIKANJA" },
    { value: "C_SIKANJA_1000MM", label: "1000 MM C SIKANJA" },
    { value: "C_SIKANJA_1050MM", label: "1050 MM C SIKANJA" },

    // Other structural items
    { value: "C_CHANEL", label: "C Channel" },
    { value: "TAI_ROD", label: "Tai Rod" },
    { value: "BASE_PLATE", label: "Base Plate" },
    { value: "BASE_JACK", label: "Base Jack" },
    { value: "STIRRUP_HEAD", label: "Stirrup Head" },
    { value: "U_HEAD_JACK", label: "U Head Jack" },
    { value: "JOINT_PIN", label: "Joint Pin" },
    { value: "MS_PLATE", label: "MS Plate" },
    { value: "MS_ANGLE", label: "MS Angle" },
    { value: "WAILER", label: "Wailer" },
    { value: "EIGHT_SIX_ONE", label: "Eight Six One" },
    { value: "WALKWAY_JALI", label: "Walkway Jali" },
    { value: "WALKWAY_TABLE", label: "Walkway Table" },
    { value: "HOLLOW_PIPE", label: "Hollow Pipe" },
    { value: "FORTY_X_FORTY_HOLLOW_PIPE", label: "40x40 Hollow Pipe" },
    { value: "LIFT_GUARD_OPENING", label: "Lift Guard Opening" },
    { value: "PVC_PIPE_10_MM", label: "PVC Pipe 10 MM" },

    // Bunker beds and support equipment
    { value: "TWO_TARE_BUNKER_BED", label: "2 Tyre Bunker Bed" },
    { value: "THREE_TARE_BUNKER_BED", label: "3 Tyre Bunker Bed" },
    { value: "VERTICAL_BUNKER_BED", label: "Vertical Bunker Bed" },
    { value: "HORIZENTAL_BUNKER_BED", label: "Horizontal Bunker Bed" },
    { value: "NUT_BOLT_FOR_BUNKER_BED", label: "Nut Bolt For Bunker Bed" },
    { value: "PLY_FOR_BUNKER_BED", label: "Ply For Bunker Bed" },

    // Safety and infrastructure
    { value: "FIRE_EXTINGULS", label: "Fire Extinguishers" },
    { value: "WATER_STOPPER", label: "Water Stopper" },
    { value: "SHALL_BALLAH", label: "Shall Ballah" },
    { value: "SHUTTERINING_PLATE", label: "Shuttering Plate" },

    // Water tank sizes
    { value: "TWO_HUNDRED_LTR_WATER_TANK", label: "200 Ltr Water Tank" },
    { value: "FIVE_FIFTY_LTR_WATER_TANK", label: "550 Ltr Water Tank" },
    { value: "SEVEN_FIFTY_LTR_WATER_TANK", label: "750 Ltr Water Tank" },
    { value: "ONE_THOUSAND_LTR_WATER_TANK", label: "1000 Ltr Water Tank" },
    { value: "TWO_THOUSAND_LTR_WATER_TANK", label: "2000 Ltr Water Tank" },
    { value: "FIVE_THOUSAND_LTR_WATER_TANK", label: "5000 Ltr Water Tank" },

    // Miscellaneous equipment
    { value: "BYCYCLE", label: "Bicycle" },
    { value: "GHUGHU_NUT", label: "Ghughu Nut" },
    { value: "GHUGHU_MACHINE", label: "Ghughu Machine" },
    { value: "MS_COUPLAR", label: "MS Coupler" },
    { value: "TABLE", label: "Table" },
    { value: "FIBER_CHAIR", label: "Fiber Chair" },
    { value: "ALMIRAHA", label: "Almiraha" },
    { value: "SAFTEY_NET", label: "Safety Net" },
    { value: "GREEN_CHAT", label: "Green Chat" },
    { value: "ONE_THOUSAND_MM_PILE_STATER", label: "1000 MM Pile Starter" },
    { value: "MS_WINDOW", label: "MS Window" },
    { value: "MS_DOOR", label: "MS Door" },
    { value: "EARTHING_PIPE", label: "Earthing Pipe" },
    { value: "SIX_HUNDRED_MM_DIA_PILE_BUILDUP_FRAME", label: "600 MM Dia Pile Buildup Frame" },
    { value: "ROUND_CLOUMN_FRAME", label: "Round Column Frame" },
    { value: "ANCHOR_NUT", label: "Anchor Nut" },
    { value: "COPICOL", label: "Copicol" },
    { value: "WALIKIE_TALKIE", label: "Walkie Talkie" },
    { value: "CHARGER_WALIKIE_TALKIE", label: "Charger Walkie Talkie" },
    { value: "STAIR_GURD", label: "Stair Guard" },
    { value: "GAS_OVEN", label: "Gas Oven" },
    { value: "OXIZEN_CYCLDER", label: "Oxygen Cylinder" },
    { value: "LPG_GAS_CYLINDER", label: "LPG Gas Cylinder" },
    { value: "GARBAGE_CHUTE", label: "Garbage Chute" },

    // Vibrators
    { value: "ELECTRIC_VIBRATOR", label: "Electric Vibrator" },
    { value: "PETROL_VIBRATOR", label: "Petrol Vibrator" },
    { value: "DISEAL_VIBRATOR", label: "Diesel Vibrator" },
    { value: "HAND_ELECTRIC_VIBRATOR", label: "Hand Electric Vibrator" },
    { value: "NOZZEL_VIBRATOR", label: "Nozzle Vibrator" },

    // Dewatering Pumps
    { value: "ONE_POINT_FIVE_HP_PETROL_DEWATERING_PUMP", label: "1.5 Hp Petrol Dewatering Pump" },
    { value: "THREE_HP_DISEAL_DEWATERING_PUMP", label: "3 Hp Diesel Dewatering Pump" },
    { value: "FIVE_HP_DISEAL_DEWATERING_PUMP", label: "5 Hp Diesel Dewatering Pump" },
    { value: "TEN_HP_DISEAL_DEWATERING_PUMP", label: "10 Hp Diesel Dewatering Pump" },
    { value: "CHINA_DISEAL_PUMP", label: "China Diesel Pump" },
    { value: "ZERO_POINT_FIVE_HP_ELECTRIC_DEWATERING_PUMP", label: "0.5 Hp Electric Dewatering Pump" },
    { value: "ONE_HP_ELECTRIC_DEWATERING_PUMP", label: "1 Hp Electric Dewatering Pump" },
    { value: "ONE_POINT_FIVE_HP_ELECTRIC_DEWATERING_PUMP", label: "1.5 Hp Electric Dewatering Pump" },
    { value: "TWO_HP_ELECTRIC_DEWATERING_PUMP", label: "2 Hp Electric Dewatering Pump" },
    { value: "THREE_HP_ELECTRIC_DEWATERING_PUMP", label: "3 Hp Electric Dewatering Pump" },
    { value: "FIVE_HP_ELECTRIC_DEWATERING_PUMP", label: "5 Hp Electric Dewatering Pump" },

    // Submersible Pumps
    { value: "ONE_HP_SUMERSIBLE_PUMP", label: "1 Hp Submersible Pump" },
    { value: "ONE_POINT_FIVE_HP_SUMERSIBLE_PUMP", label: "1.5 Hp Submersible Pump" },
    { value: "TWO_HP_SUMERSIBLE_PUMP", label: "2 Hp Submersible Pump" },
    { value: "THREE_HP_SUMERSIBLE_PUMP", label: "3 Hp Submersible Pump" },
    { value: "FIVE_HP_SUMERSIBLE_PUMP", label: "5 Hp Submersible Pump" },
    { value: "SEVEN_POINT_FIVE_HP_SUMERSIBLE_PUMP", label: "7.5 Hp Submersible Pump" },
    { value: "TEN_HP_SUMERSIBLE_PUMP", label: "10 Hp Submersible Pump" },
    { value: "FOURTEEN_HP_SUMERSIBLE_PUMP", label: "14 Hp Submersible Pump" },
    { value: "FIFTEEN_HP_SUMERSIBLE_PUMP", label: "15 Hp Submersible Pump" },
    { value: "SUMERSIBLE_TULU_PUMP", label: "Submersible Tulu Pump" },

    // Mud Submersible Pumps
    { value: "ONE_POINT_FIVE_HP_MUD_SUMERSIBLE_PUMP", label: "1.5 Hp Mud Submersible Pump" },
    { value: "TWO_HP_MUD_SUMERSIBLE_PUMP", label: "2 Hp Mud Submersible Pump" },
    { value: "THREE_HP_MUD_SUMERSIBLE_PUMP", label: "3 Hp Mud Submersible Pump" },
    { value: "FIVE_HP_MUD_SUMERSIBLE_PUMP", label: "5 Hp Mud Submersible Pump" },

    // Monoblock Pumps
    { value: "ONE_HP_MONOBLOCK_PUMP", label: "1 Hp Monoblock Pump" },
    { value: "TWO_HP_MONOBLOCK_PUMP", label: "2 Hp Monoblock Pump" },
    { value: "THREE_HP_MONOBLOCK_PUMP", label: "3 Hp Monoblock Pump" },
    { value: "FIVE_HP_MONOBLOCK_PUMP", label: "5 Hp Monoblock Pump" },
    { value: "TWELVE_POINT_FIVE_HP_MONOBLOCK_PUMP", label: "12.5 Hp Monoblock Pump" },

    // Diesel Generator
    { value: "DG_125_KVA", label: "DG 125 KVA" },

    // Compactors and Welding Machines
    { value: "SOIL_COMPECTOR_MACHINE", label: "Soil Compactor Machine" },
    { value: "ROLLER_MINI_COMPACTOR", label: "Roller Mini Compactor" },
    { value: "SMALL_WELDING_MACHINE", label: "Small Welding Machine" },
    { value: "BIG_WELDING_MACHINE", label: "Big Welding Machine" },

    // Cutting and Bending Machines
    { value: "FOURTEEN_INCH_STEEL_CUTTER_MACHINE", label: "14 Inch Steel Cutter Machine" },
    { value: "BIG_STEEL_CUTTER_MACHINE", label: "Big Steel Cutter Machine" },
    { value: "STEEL_BENDING_MACHINE", label: "Steel Bending Machine" },
    { value: "SCRAP_STEEL_STRAIGHTING_MACHINE", label: "Scrap Steel Straightening Machine" },
    { value: "GANDING_MACHINE", label: "Grinding Machine" },
    { value: "PLY_CUTTER_MACHINE", label: "Ply Cutter Machine" },
    { value: "BLOCK_CUTTING_MACHINE", label: "Block Cutting Machine" },

    // Demolition and Drilling Tools
    { value: "FIVE_KG_DEMOLITION_HAMMER", label: "5 Kg Demolition Hammer" },
    { value: "SEVEN_KG_DEMOLITION_HAMMER", label: "7 Kg Demolition Hammer" },
    { value: "ELEVEN_KG_DEMOLITION_HAMMER_1306", label: "11 Kg Demolition Hammer 1306" },
    { value: "SIXTEEN_KG_DEMOLITION_HAMMER_1205C", label: "16 Kg Demolition Hammer 1205C" },
    { value: "SIXTEEN_KG_DRILL_HAMMER", label: "16 Kg Drill Hammer" },
    { value: "DRILL_MACHINE", label: "Drill Machine" },
    { value: "HILTI_GUN", label: "Hilti Gun" },

    // Mixture Machines
    { value: "TEN_SEVEN_MIXTURE_MACHINE", label: "10/7 Mixture Machine" },
    { value: "TEN_FIVE_MIXTURE_MACHINE", label: "10/5 Mixture Machine" },
    { value: "BABY_MIXTURE_MACHINE", label: "Baby Mixture Machine" },
    { value: "ONE_THOUSAND_FIFTY_UNIVERSAL_MACHINE", label: "1050 Universal Machine" },

    // Batching and Testing Equipment
    { value: "BATCHING_PLANT", label: "Batching Plant" },
    { value: "CEMENT_SILO", label: "Cement Silo" },
    { value: "TS_MACHINE", label: "TS Machine" },
    { value: "AUTO_LEVEL_MACHINE", label: "Auto Level Machine" },
    { value: "CUBE_MOLD", label: "Cube Mold" },
    { value: "SLUMP_CONE", label: "Slump Cone" },
    { value: "TEN_KG_WEIGHT_MACHINE", label: "10 Kg Weight Machine" },
    { value: "ONE_HUNDRED_KG_WEIGHT_MACHINE", label: "100 Kg Weight Machine" },
    { value: "C_AGREGATE_SELVE_ANALYSIS", label: "C Aggregate Sieve Analysis" },
    { value: "FINE_AGREGATE_SELVE_ANALYSIS", label: "Fine Aggregate Sieve Analysis" },
    { value: "MANUAL_CUBE_TESTING_MACHINE", label: "Manual Cube Testing Machine" },
    { value: "ELE_CUBE_TESTING_MACHINE", label: "Electric Cube Testing Machine" },
    { value: "CONCRETE_TEST_HAMMER_MACHINE", label: "Concrete Test Hammer Machine" },
    { value: "HOT_AIR_OVEN", label: "Hot Air Oven" },
    { value: "GI_TRAY", label: "GI Tray" },
    { value: "CTM_MACHINE_2000_KN", label: "CTM Machine 2000 KN" },
    { value: "ONE_TWENTY_KN_DAIL_GAUGE", label: "120 KN Dial Gauge" },
    { value: "TWO_THOUSAND_KN_DAIL_GAUGE", label: "2000 KN Dial Gauge" },

    // Miscellaneous Testing and Utility
    { value: "MEASURING_CYLINDER", label: "Measuring Cylinder" },
    { value: "OIL_SUCKING_PUMP", label: "Oil Sucking Pump" },
    { value: "VDF_FLOWER_WATERING_MACHINE", label: "VDF Flower Watering Machine" },
    { value: "SOIL_TESTING_MACHINE", label: "Soil Testing Machine" },
    { value: "SUSPENDED_PLATEFROM_HOIST_CADLE", label: "Suspended Platform Hoist Cradle" },
    { value: "JET_PUMP_CPWO2", label: "Jet Pump CPWO2" },

    // Fans
    { value: "CELLING_FAN", label: "Ceiling Fan" },
    { value: "STAND_FAN", label: "Stand Fan" },
    { value: "WALL_FAN", label: "Wall Fan" },
    { value: "EXHUAST_FAN", label: "Exhaust Fan" },

    // Computing Devices
    { value: "COMPUTER", label: "Computer" },
    { value: "CPU", label: "CPU" },
    { value: "UPS", label: "UPS" },
    { value: "MONITER", label: "Monitor" },
    { value: "PRINTER", label: "Printer" },

    // Lights and Power
    { value: "TWO_HUNDRED_W_LED_LIGHT", label: "200 W LED Light" },
    { value: "TWO_FORTY_W_LED_LIGHT", label: "240 W LED Light" },
    { value: "ONE_HUNDRED_W_LED_LIGHT", label: "100 W LED Light" },
    { value: "ONE_FIFTY_W_LED_LIGHT", label: "150 W LED Light" },
    { value: "THREE_HUNDRED_W_LED_LIGHT", label: "300 W LED Light" },
    { value: "AIR_BLOWER", label: "Air Blower" },
    { value: "PROJECTOR", label: "Projector" },

    // Concrete Pumps - Schwing
    { value: "SP_2000_CONCREATE_PUMP_SCHWING", label: "SP 2000 Concrete Pump Schwing" },
    { value: "CONCRETE_PUMP_1407_AQUARIOUS", label: "1407 Concrete Pump Aquarious" },
    { value: "SP_1807_CONCREATE_PUMP_SCHWING", label: "SP 1807 Concrete Pump Schwing" },
    { value: "CONCRETE_PUMP_1400_SCHWING", label: "1400 Concrete Pump Schwing" },
    { value: "CONCRETE_PUMP_1460_AQUARIOUS", label: "1460 Concrete Pump Aquarious" },
    { value: "CONCRETE_PUMP_1400_AQUARIOUS", label: "1400 Concrete Pump Aquarious" },
    { value: "CONCRETE_PUMP_1405D_AQUARIOUS", label: "1405D Concrete Pump Aquarious" },

    // Concrete Pump Pipes and Components
    { value: "THREE_MTR_PIPE_CONCREATE_PUMP", label: "3 Mtr Pipe Concrete Pump" },
    { value: "TWO_MTR_PIPE_CONCREATE_PUMP", label: "2 Mtr Pipe Concrete Pump" },
    { value: "ONE_MTR_PIPE_CONCREATE_PUMP", label: "1 Mtr Pipe Concrete Pump" },
    { value: "HALF_MTR_PIPE_CONCREATE_PUMP", label: "0.5 Mtr Pipe Concrete Pump" },

    // Concrete Pump Bands
    { value: "NINETY_BAND_CONCREATE_PUMP", label: "90 Band Concrete Pump" },
    { value: "SIXTY_BAND_CONCREATE_PUMP", label: "60 Band Concrete Pump" },
    { value: "FORTY_FIVE_BAND_CONCREATE_PUMP", label: "45 Band Concrete Pump" },
    { value: "THIRTY_BAND_CONCREATE_PUMP", label: "30 Band Concrete Pump" },
    { value: "FIFTEEN_BAND_CONCREATE_PUMP", label: "15 Band Concrete Pump" },
    { value: "S_BAND_CONCREATE_PUMP", label: "S Band Concrete Pump" },

    // Concrete Pump Components
    { value: "PISTION_CONCREATE_PUMP", label: "Piston Concrete Pump" },
    { value: "BALL_HEAD_CONCREATE_PUMP", label: "Ball Head Concrete Pump" },
    { value: "BALL_CONCREATE_PUMP", label: "Ball Concrete Pump" },
    { value: "CLUMP_CONCREATE_PUMP", label: "Clump Concrete Pump" },
    { value: "MAIN_CLUMP_CONCREATE_PUMP", label: "Main Clump Concrete Pump" },
    { value: "HOSE_CONCREATE_PUMP", label: "Hose Concrete Pump" },
    { value: "MAIN_PIPE_CONCREATE_PUMP", label: "Main Pipe Concrete Pump" },
    { value: "GATE_VALVE_CONCREATE_PUMP", label: "Gate Valve Concrete Pump" },
    { value: "BRACKET_FOR_CONCREATE_PIPE_LINE", label: "Bracket For Concrete Pipe Line" },

    // Tower Crane items
    { value: "TOWER_CRAIN_SET", label: "Tower Crane Set" },
    { value: "THREE_MTR_MASS_PIC", label: "3 Mtr Mass Pic" },
    { value: "MASS_PIN", label: "Mass Pin" },
    { value: "MASS_LOCK_PIN", label: "Mass Lock Pin" },
    { value: "MASS_MAIN_PIN", label: "Mass Main Pin" },
    { value: "MASS_LOCK_MAIN_PIN", label: "Mass Lock Main Pin" },
    { value: "TIE_PIN", label: "Tie Pin" },
    { value: "TIE", label: "Tie" },
    { value: "SWING_LOCK_PIN", label: "Swing Lock Pin" },
    { value: "SWING_PIN", label: "Swing Pin" },
    { value: "HYDROLIC_PIN", label: "Hydraulic Pin" },
    { value: "PUMP_HYDROLIC", label: "Pump Hydraulic" },
    { value: "QUARTER_PIN", label: "Quarter Pin" },
    { value: "SWING_LOCK", label: "Swing Lock" },
    { value: "ROPE_LOCK", label: "Rope Lock" },
    { value: "MANUAL_TROLLEY", label: "Manual Trolley" },
    { value: "TROLY_LOCK", label: "Trolley Lock" },
    { value: "TROLY_KEY", label: "Trolley Key" },
    { value: "C_FRAME", label: "C Frame" },
    { value: "C_FRAME_NUT_BOLT", label: "C Frame Nut Bolt" },
    { value: "BASE", label: "Base" },
    { value: "MAIN_CABLE", label: "Main Cable" },
    { value: "BOOM", label: "Boom" },
    { value: "BOOM_LOCK", label: "Boom Lock" },
    { value: "HOOK", label: "Hook" },
    { value: "MANUAL_HOOK", label: "Manual Hook" },
    { value: "COUNTER_WEIGHT", label: "Counter Weight" },
    { value: "COUNTER_JIB", label: "Counter Jib" },
    { value: "COUNTER_PIN", label: "Counter Pin" },
    { value: "CATHEAD", label: "Cathead" },
    { value: "ONE_POINT_FIVE_METER_TELE_SCOPING_MASS", label: "1.5 Meter Tele Scoping Mass" },
    { value: "TELE_SCOPING_CADGE", label: "Tele Scoping Cadge" },
    { value: "CABIN", label: "Cabin" },
    { value: "BOOM_TOLLY", label: "Boom Trolley" },
    { value: "POWER_PAD", label: "Power Pad" },
    { value: "SEVEN_POINT_FIVE_METER_TIE_ROD", label: "7.5 Meter Tie Rod" },
    { value: "ONE_HUNDRED_MTR_CABLE", label: "100 Mtr Cable" },
    { value: "BASIC_MASS_PIN", label: "Basic Mass Pin" },
    { value: "BASICK_LOCK_PIN", label: "Basic Lock Pin" },
    { value: "MANUL_SWING_HANDLE", label: "Manual Swing Handle" },
    { value: "MAIN_SWITCH", label: "Main Switch" },
    { value: "TEN_MTR_MAIN_MASS_WITH_HYDROLIC_JACK", label: "10 Mtr Main Mass With Hydraulic Jack" },
    { value: "CONCRETE_BOCKET", label: "Concrete Bucket" },
    { value: "TEMPLATE", label: "Template" },
    { value: "MS_SUPPORT", label: "MS Support" },
    { value: "SAFTEY_ROPE", label: "Safety Rope" },
    { value: "MONOROLL_NUT", label: "Monoroll Nut" },
    { value: "SABOL", label: "Sabol" },
    { value: "HAMMER", label: "Hammer" },
    { value: "CAGE_PIN_LOCK", label: "Cage Pin Lock" },
    { value: "CAGE_SIDE_RAILING", label: "Cage Side Railing" },
    { value: "GRISH_GUN", label: "Grish Gun" },

    // Hoist items
    { value: "WINGS_ELECTRIC_MOTOR_SET", label: "Wings Electric Motor Set" },
    { value: "WINGS_DISEAL_MACHINE_SET", label: "Wings Diesel Machine Set" },
    { value: "TEN_INCH_HOIST_GACHH_PILLI", label: "10 Inch Hoist Gachh Pilli" },
    { value: "TWELVE_INCH_HOIST_BOCKET_PULLI", label: "12 Inch Hoist Bucket Pulli" },
    { value: "LANDING_FRME", label: "Landing Frame" },
    { value: "TWELVE_MM_X_FIFTY_MM_NUT_BOLT", label: "12 MM X 50 MM Nut Bolt" },
    { value: "HOIST_BOCKET", label: "Hoist Bucket" },
    { value: "JOIST_PATTI_FOR_HOIST", label: "Joist Patti For Hoist" },
    { value: "ONE_MTR_TOWER_HOIST_COLUMN", label: "1 Mtr Tower Hoist Column" },
    { value: "ONE_POINT_FIVE_MTR_TOWER_HOIST_COLUMN", label: "1.5 Mtr Tower Hoist Column" },
    { value: "TWO_MTR_TOWER_HOIST_COLUMN", label: "2 Mtr Tower Hoist Column" },
    { value: "THREE_MTR_TOWER_HOIST_COLUMN", label: "3 Mtr Tower Hoist Column" },
    { value: "THREE_MTR_TOP_TOWER_HOIST_COLUMN", label: "3 Mtr Top Tower Hoist Column" },
    { value: "THREE_MTR_BOTTOM_TOWER_HOIST_COLUMN", label: "3 Mtr Bottom Tower Hoist Column" },
    { value: "TROLLEY_SET_FOR_HOIST", label: "Trolley Set For Hoist" },
    { value: "HOIST_SUPPORT_ROLLER", label: "Hoist Support Roller" },
    { value: "HOIST_BOCKET_CHENNEL_6_INCH", label: "Hoist Bucket Channel 6 Inch" },
    { value: "TEN_MM_ROPE", label: "10 MM Rope" },
    { value: "HOIST_BOOM_BUCKET", label: "Hoist Boom Bucket" },
    { value: "LIMIT_SWITCH", label: "Limit Switch" },
    { value: "LIMIT_FRAM", label: "Limit Frame" },
    { value: "WALL_SUPPORT", label: "Wall Support" },
    { value: "TOWER_SUPPORT_FRAME", label: "Tower Support Frame" },

    // MKG variants and additional hoist equipment
    { value: "MKG_WINGS_ELECTRIC_MOTOR_SET", label: "MKG Wings Electric Motor Set" },
    { value: "MKG_TOWER_HOIST_COLUMN_1MTR", label: "MKG 1 Mtr Tower Hoist Column" },
    { value: "MKG_TOWER_HOIST_COLUMN_1_5MTR", label: "MKG 1.5 Mtr Tower Hoist Column" },
    { value: "MKG_TOWER_HOIST_COLUMN_2MTR", label: "MKG 2 Mtr Tower Hoist Column" },
    { value: "MKG_TOWER_HOIST_COLUMN_3MTR", label: "MKG 3 Mtr Tower Hoist Column" },
    { value: "MKG_TOP_TOWER_HOIST_COLUMN", label: "MKG Top Tower Hoist Column" },
    { value: "MKG_BOTTOM_TOWER_HOIST_COLUMN", label: "MKG Bottom Tower Hoist Column" },
    { value: "STEEL_LIFTING_TROLLING_SET", label: "Steel Lifting Trolling Set" },
    { value: "MKG_LIMIT_SWITCH", label: "MKG Limit Switch" },
    { value: "REJECT_RACK", label: "Reject Rack" },
    { value: "CAGE_TOP_BARICATION_SET", label: "Cage Top Barication Set" },
    { value: "MOTER_DERECK_SET", label: "Motor Derrick Set" },
    { value: "ENCLOUSER_SET", label: "Enclosure Set" },
    { value: "LIMIT_PLATE", label: "Limit Plate" },
    { value: "END_CLOSER_GATE_SET", label: "End Closer Gate Set" },
    { value: "END_CLOSER_GATE_MAIN_SWITCH", label: "End Closer Gate Main Switch" },
    { value: "MKG_TOWER_HOIST_COLUMN_SUPPORTING", label: "MKG Tower Hoist Column Supporting" },
    { value: "OTHER", label: "Other" },


];

const INVENTORY_TYPE_OPTIONS = [
    { value: "OLD", label: "Old" },
    { value: "NEW", label: "New" },
];

// Column definitions
const inventoryColumns = [
    { key: "name", label: "Item Name", type: "text" as const },
    { key: "category", label: "Category", type: "badge" as const },
    {
        key: "quantity",
        label: "Quantity",
        render: (value: number) => (
            <Badge variant={value > 100 ? "default" : "destructive"}>{value}</Badge>
        ),
    },
    { key: "unit", label: "Unit", type: "text" as const },
    {
        key: "project",
        label: "Project",
        render: (value: any) => (
            value ? <span className="text-sm text-gray-600">{value.name}</span> : <span className="text-xs text-gray-400">-</span>
        ),
    },
    { key: "lastUpdated", label: "Last Updated", type: "text" as const },
    { key: "actions", label: "Actions", type: "actions" as const },
];

const transferColumns = [
    { key: "id", label: "Transfer ID", type: "text" as const },
    { key: "from", label: "From", type: "text" as const },
    { key: "to", label: "To", type: "text" as const },
    { key: "items", label: "Items", type: "text" as const },
    {
        key: "status",
        label: "Status",
        type: "badge" as const,
        options: ["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
    },
    { key: "driver", label: "Driver", type: "text" as const },
    { key: "eta", label: "ETA", type: "text" as const },
    { key: "actions", label: "Actions", type: "actions" as const },
];

const InventoryContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [inventoryTrends, setInventoryTrends] = useState([]);
    const [warehouseUtilization, setWarehouseUtilization] = useState([]);
    const [grnData, setGrnData] = useState([]);
    const [transferData, setTransferData] = useState([]);
    const [tasks, setTasks] = useState([]);
    const { user } = useUser();

    // Use UserFilter Context
    const { targetUserId, selectedUser, currentUser, setSelectedUserId } =
        useUserFilter();

    const userID = targetUserId || user?.id || "";

    // Function to get current tab from URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes("/material-forecast")) return "material-forecast";
        if (path.includes("/material-indent")) return "material-indent";
        if (path.includes("/issue-tracking")) return "issue-tracking";
        if (path.includes("/transfers")) return "transfers";
        if (path.includes("/warehouse")) return "warehouse";
        if (path.includes("/inventory")) return "inventory";
        return "inventory"; // default tab
    };

    // Handle tab changes
    const handleTabChange = (value: string) => {
        const tabRoutes: Record<string, string> = {
            inventory: "/inventory/inventory",
            "material-forecast": "/inventory/material-forecast",
            "material-indent": "/inventory/material-indent",
            "issue-tracking": "/inventory/issue-tracking",
            transfers: "/inventory/transfers",
            warehouse: "/inventory/warehouse",
        };

        // Fetch material indents when navigating to material-indent tab
        if (value === "material-indent") {
            fetchMaterialIndents();
        }

        navigate(tabRoutes[value]);
    };

    // Add new state variables for quick action dialogs
    const [isResolveIssuesOpen, setIsResolveIssuesOpen] = useState(false);
    const [isTrackMaterialsOpen, setIsTrackMaterialsOpen] = useState(false);
    const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
    const [isReviewProgressOpen, setIsReviewProgressOpen] = useState(false);

    // Add state for inventory items and transfers
    const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);
    const [isEditTransferOpen, setIsEditTransferOpen] = useState(false);
    const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);

    // Add state for Approve Transfer section
    const [transfersForApproval, setTransfersForApproval] = useState<any[]>([]);
    const [isLoadingApprovalTransfers, setIsLoadingApprovalTransfers] = useState(false);
    const [isApproveTransferModalOpen, setIsApproveTransferModalOpen] = useState(false);
    const [transferToApprove, setTransferToApprove] = useState<any | null>(null);
    const [isApprovingTransfer, setIsApprovingTransfer] = useState(false);

    // Add state for search and filters
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<"OLD" | "NEW" | null>(null);

    // Inventory subview like vehicle tracking pattern
    const [inventorySubview, setInventorySubview] = useState<
        "main" | "old" | "new" | "all"
    >("main");

    // Add state for Add Item dialog
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);

    // Add state for View Details dialog
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(
        null
    );

    // Add state for Edit Item dialog
    const [isEditItemOpen, setIsEditItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItemType | null>(
        null
    );

    // Add state for Delete confirmation
    const [itemToDelete, setItemToDelete] = useState<InventoryItemType | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Add state for Schedule Maintenance dialog
    const [isScheduleMaintenanceOpen, setIsScheduleMaintenanceOpen] =
        useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
        null
    );

    // Add state for Schedule Maintenance CRUD
    const [scheduleMaintenances, setScheduleMaintenances] = useState<any[]>([]);
    const [isEditMaintenanceOpen, setIsEditMaintenanceOpen] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState<any | null>(
        null
    );
    const [maintenanceToDelete, setMaintenanceToDelete] = useState<any | null>(
        null
    );
    const [isDeletingMaintenance, setIsDeletingMaintenance] = useState(false);

    // Add loading state
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingIndents, setIsLoadingIndents] = useState(false);

    // Add vendors state
    const [vendors, setVendors] = useState<any[]>([]);

    // Add projects state
    const [projects, setProjects] = useState<any[]>([]);

    // Add state for Material Indent
    const [isAddMaterialIndentOpen, setIsAddMaterialIndentOpen] = useState(false);
    const [isViewMaterialIndentOpen, setIsViewMaterialIndentOpen] =
        useState(false);
    const [isEditMaterialIndentOpen, setIsEditMaterialIndentOpen] =
        useState(false);
    const [selectedMaterialIndent, setSelectedMaterialIndent] =
        useState<any>(null);
    const [editingMaterialIndent, setEditingMaterialIndent] =
        useState<any>(null);
    const [materialIndents, setMaterialIndents] = useState<any[]>([]);

    // Add state for search functionality
    const [primarySupplierSearch, setPrimarySupplierSearch] = useState("");
    const [secondarySupplierSearch, setSecondarySupplierSearch] = useState("");

    // Add state for manual supplier selection
    const [primarySupplierIsOther, setPrimarySupplierIsOther] = useState(false);
    const [secondarySupplierIsOther, setSecondarySupplierIsOther] = useState(false);

    // Add these state variables near your other state declarations
    const [editPrimarySupplierSearch, setEditPrimarySupplierSearch] =
        useState("");
    const [editSecondarySupplierSearch, setEditSecondarySupplierSearch] =
        useState("");
    const [editPrimarySupplierIsOther, setEditPrimarySupplierIsOther] = useState(false);
    const [editSecondarySupplierIsOther, setEditSecondarySupplierIsOther] = useState(false);

    // Add image preview states
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

    // Add state for view modal image loading
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
    const [isLoadingIndentDetails, setIsLoadingIndentDetails] = useState(false);

    // Function to handle image file selection and preview
    const handleImageChange = (
        file: File | null,
        setPreview: (preview: string | null) => void
    ) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    // Function to fetch transfers by approver (for approval)
    const fetchTransfersForApproval = async () => {
        if (!user?.id) return; // Don't fetch if no user ID

        setIsLoadingApprovalTransfers(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching transfers for approval by user:", user.id);

            // Fetch all transfers and filter by approvedById matching current user and approvalStatus = PENDING
            const response = await axios.get(`${API_URL}/inventory/transfers`, {
                headers,
            });

            const filteredTransfers = (Array.isArray(response.data) ? response.data : [])
                .filter((t: any) => t.approvedById === user.id && t.approvalStatus === "PENDING");

            console.log("Transfers for approval:", filteredTransfers);
            setTransfersForApproval(filteredTransfers);
        } catch (error) {
            console.error("Error fetching transfers for approval:", error);
        } finally {
            setIsLoadingApprovalTransfers(false);
        }
    };

    // Function to reject a transfer
    const handleRejectTransfer = async (transferId: string) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Rejecting transfer:", transferId);

            // Update the approvalStatus to REJECTED
            const response = await axios.put(
                `${API_URL}/inventory/transfers/${transferId}`,
                { approvalStatus: "REJECTED" },
                { headers }
            );

            toast.success("Transfer rejected successfully");

            // Remove the transfer from the list
            setTransfersForApproval((prev) =>
                prev.filter((t) => t.id !== transferId)
            );
        } catch (error) {
            console.error("Error rejecting transfer:", error);
            toast.error("Failed to reject transfer");
        }
    };

    // Function to approve transfer after modal approval
    const handleApproveTransferFinal = async (transferData: any) => {
        if (!transferToApprove || !user?.id) return;
        
        setIsApprovingTransfer(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Approving transfer:", transferToApprove.id);

            // Update transfer status to APPROVED - server will handle material transfer
            const response = await axios.put(
                `${API_URL}/inventory/transfers/${transferToApprove.id}?userId=${transferToApprove.createdById}`,
                {
                    approvalStatus: "APPROVED",
                    approvedById: user.id,
                },
                { headers }
            );

            toast.success("Transfer approved and materials transferred successfully");
            
            // Remove the transfer from the list
            setTransfersForApproval((prev) =>
                prev.filter((t) => t.id !== transferToApprove.id)
            );
            
            // Close the modal
            setIsApproveTransferModalOpen(false);
            setTransferToApprove(null);
            
            // Refresh inventory data
            await fetchInventoryData();
        } catch (error) {
            console.error("Error approving transfer:", error);
            toast.error("Failed to approve transfer");
        } finally {
            setIsApprovingTransfer(false);
        }
    };

    // Function to fetch vendors data
    const fetchVendors = async () => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching vendors...");
            const vendorsResponse = await axios.get(`${API_URL}/vendors`, {
                headers,
            });
            console.log("Vendors data:", vendorsResponse.data);
            setVendors(vendorsResponse.data);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    // Function to fetch projects data
    const fetchProjects = async () => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching projects...");
            const projectsResponse = await axios.get(`${API_URL}/projects`, {
                headers,
            });
            console.log("Projects data:", projectsResponse.data);
            setProjects(projectsResponse.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    // Fetch Material Indents
    const fetchMaterialIndents = async () => {
        setIsLoadingIndents(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching material indents for user:", targetUserId);

            // Build endpoint based on user role and selection
            // Admin/MD users can view all indents or filter by specific user
            let endpoint = `${API_URL}/material-indane/indanes`;
            if ((user?.role === 'admin' || user?.role === 'md') && targetUserId && targetUserId !== user?.id) {
                endpoint = `${API_URL}/material-indane/indanes/user/${targetUserId}`;
            }

            const response = await axios.get(endpoint, {
                headers,
            });
            console.log("Material indents data:", response.data);

            // Transform the data to match the expected format
            const transformedIndents = response.data.map((indent: any) => ({
                id: indent.id,
                indentNo: indent.orderSlipNo || indent.id,
                project: indent.site || "Unknown",
                indentDate: indent.date || new Date().toISOString(),
                relatedWBSNo: indent.site,
                status: indent.status || "PENDING", // Use status from backend (PENDING, APPROVED, REJECTED)
                createdBy: indent.createdBy?.name || "Unknown",
                createdDate: indent.createdAt || indent.date,
                items: indent.items || [],
                storeKeeperName: indent.storeKeeperName,
                projectManagerName: indent.projectManagerName,
                storeKeeperSignature: indent.storeKeeperSignature,
                projectManagerSignature: indent.projectManagerSignature,
            }));

            setMaterialIndents(transformedIndents);
        } catch (error) {
            console.error("Error fetching material indents:", error);
            toast.error("Failed to load material indents");
        } finally {
            setIsLoadingIndents(false);
        }
    };

    // Fetch detailed material indent data
    const fetchMaterialIndentDetails = async (indentId: string) => {
        setIsLoadingIndentDetails(true);
        setIsViewMaterialIndentOpen(true); // Open modal immediately
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching material indent details for:", indentId);
            const response = await axios.get(
                `${API_URL}/material-indane/indanes/${indentId}`,
                { headers }
            );
            console.log("Material indent details response:", response.data);
            console.log("Response keys:", Object.keys(response.data || {}));

            if (!response.data) {
                throw new Error("No data received from server");
            }

            setSelectedMaterialIndent(response.data);
        } catch (error) {
            console.error("Error fetching material indent details:", error);
            console.error("Error details:", error instanceof Error ? error.message : error);
            toast.error("Failed to load indent details");
            setIsViewMaterialIndentOpen(false);
        } finally {
            setIsLoadingIndentDetails(false);
        }
    };

    // Handle edit button click
    const handleEditMaterialIndent = async (indentId: string) => {
        setIsLoadingIndentDetails(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching material indent for edit:", indentId);
            const response = await axios.get(
                `${API_URL}/material-indane/indanes/${indentId}`,
                { headers }
            );

            if (!response.data) {
                throw new Error("No data received from server");
            }

            // Set the editing indent with the data
            setEditingMaterialIndent(response.data);
            setIsEditMaterialIndentOpen(true);
        } catch (error) {
            console.error("Error fetching material indent for edit:", error);
            toast.error("Failed to load indent for editing");
        } finally {
            setIsLoadingIndentDetails(false);
        }
    };

    // Handle download PDF
    const handleDownloadPDF = async (indentId: string) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching material indent for PDF:", indentId);
            const response = await axios.get(
                `${API_URL}/material-indane/indanes/${indentId}`,
                { headers }
            );

            if (!response.data) {
                throw new Error("No data received from server");
            }

            // Generate PDF with the fetched data
            await generateMaterialIndentPDF(response.data);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            toast.error("Failed to download PDF");
        }
    };

    const handleDownloadTransferPDF = async (transfer: any) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Fetch complete transfer data from server
            const transferId = transfer.dbId || transfer.id;
            const userID = user?.id || "";
            console.log("========== DOWNLOAD TRANSFER PDF START ==========");
            console.log("Transfer ID:", transferId);
            console.log("User ID:", userID);
            console.log("Frontend transfer object:", transfer);

            const response = await axios.get(
                `${API_URL}/inventory/transfers/${transferId}?userId=${userID}`,
                { headers }
            );

            const apiTransfer = response.data;
            console.log("========== API RESPONSE ==========");
            console.log("Full API transfer response:", JSON.stringify(apiTransfer, null, 2));
            console.log("Items array:", apiTransfer?.items);
            console.log("Items array type:", Array.isArray(apiTransfer?.items) ? "array" : "not array");
            console.log("Items length:", apiTransfer?.items?.length);
            console.log("Signature field (authorisedSignature):", apiTransfer?.authorisedSignature);
            console.log("Signature field type:", typeof apiTransfer?.authorisedSignature);
            console.log("Signature length:", apiTransfer?.authorisedSignature?.length);

            // Map the API response to PDF generator format
            const itemsArray = Array.isArray(apiTransfer?.items)
                ? apiTransfer.items.filter((item: any) => item !== null && item !== undefined).map((item: any, idx: number) => {
                    console.log(`Item ${idx}:`, JSON.stringify(item, null, 2));
                    const mappedItem = {
                        itemCode: item?.itemCode || item?.code || "-",
                        itemName: item?.itemName || item?.name || "-",
                        quantity: item?.quantity ? parseFloat(item.quantity.toString()) : 0,
                        unit: item?.unit || null,
                        type: item?.type || "-",
                        description: item?.description || item?.itemName || item?.name || "-",
                    };
                    console.log(`Mapped item ${idx}:`, mappedItem);
                    return mappedItem;
                })
                : [];

            console.log("========== MAPPING COMPLETE ==========");
            console.log("Final items array:", JSON.stringify(itemsArray, null, 2));

            const transferDataForPDF = {
                id: apiTransfer?.id || transferId,
                transferID: apiTransfer?.transferID || apiTransfer?.id || transferId,
                fromLocation: apiTransfer?.fromLocation || "-",
                toLocation: apiTransfer?.toLocation || "-",
                fromUserId: apiTransfer?.fromUserId,
                toUserId: apiTransfer?.toUserId,
                fromUserName: apiTransfer?.createdBy?.name || "-",
                toUserName: apiTransfer?.approvedBy?.name || "-",
                requestedDate: apiTransfer?.requestedDate ? new Date(apiTransfer.requestedDate).toISOString() : new Date().toISOString(),
                status: apiTransfer?.status || "PENDING",
                driverName: apiTransfer?.driverName || "-",
                etaMinutes: apiTransfer?.etaMinutes ? Math.round(apiTransfer.etaMinutes) : undefined,
                vehicleName: apiTransfer?.vehicle?.vehicleName || "-",
                vehicleReg: apiTransfer?.vehicle?.registrationNumber || "-",
                approvedByName: apiTransfer?.approvedBy?.name || "-",
                priority: apiTransfer?.priority || "NORMAL",
                items: itemsArray,
                notes: apiTransfer?.notes || "",
                authorisedSignature: apiTransfer?.authorisedSignature || "",
                companyName: apiTransfer?.companyName || "RAJ TRIMURTY INFRAPROJECTS PVT LTD",
                companyAddress: apiTransfer?.companyAddress || "SOUTH CITY BUSINESS PARK , 770 ANANDAPUR.",
                companyCity: apiTransfer?.companyCity || "KOLKATA",
                companyPostalCode: apiTransfer?.companyPostalCode || "700",
            };

            console.log("========== FINAL PDF DATA ==========");
            console.log("Transfer data for PDF:", JSON.stringify(transferDataForPDF, null, 2));
            console.log("Items count in PDF data:", transferDataForPDF.items?.length);
            console.log("========== STARTING PDF GENERATION ==========");

            // Generate PDF with the transfer data
            await generateMaterialTransferPDF(transferDataForPDF);
            console.log("========== PDF GENERATION COMPLETE ==========");
        } catch (error) {
            console.error("Error downloading transfer PDF:", error);
            toast.error("Failed to download PDF: " + ((error as any)?.message || "Unknown error"));
        }
    };

    // Update material indent
    const updateMaterialIndent = async (indentId: string, data: MaterialIndentFormValues) => {
        try {
            console.log("updateMaterialIndent called with:", { indentId, data });

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Sending PUT request to:", `${API_URL}/material-indane/indanes/${indentId}`);

            // Update the main indent data
            const response = await axios.put(
                `${API_URL}/material-indane/indanes/${indentId}`,
                {
                    orderSlipNo: data.orderSlipNo,
                    site: data.site,
                    date: data.date,
                    storeKeeperName: data.storeKeeperName,
                    projectManagerName: data.projectManagerName,
                    items: data.items,
                },
                { headers }
            );

            console.log("PUT request response:", response);

            // Update store keeper signature if provided
            if (data.storeKeeperSignature && data.storeKeeperSignature instanceof File) {
                const sigFormData = new FormData();
                sigFormData.append("file", data.storeKeeperSignature);

                await axios.post(
                    `${API_URL}/material-indane/indanes/${indentId}/upload/store-keeper-signature`,
                    sigFormData,
                    {
                        headers: {
                            ...headers,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }

            // Update project manager signature if provided
            if (data.projectManagerSignature && data.projectManagerSignature instanceof File) {
                const pmSigFormData = new FormData();
                pmSigFormData.append("file", data.projectManagerSignature);

                await axios.post(
                    `${API_URL}/material-indane/indanes/${indentId}/upload/project-manager-signature`,
                    pmSigFormData,
                    {
                        headers: {
                            ...headers,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }

            // Refresh the material indents list
            await fetchMaterialIndents();

            toast.success("Material indent updated successfully");
            setIsEditMaterialIndentOpen(false);
            setEditingMaterialIndent(null);
            materialIndentForm.reset();
        } catch (error) {
            console.error("Error updating material indent:", error);
            toast.error("Failed to update material indent");
            throw error;
        }
    };

    // Auto-reset on page change
    useEffect(() => {
        // Reset to current user on page load/change
        setSelectedUserId(null);
    }, []); // Empty dependency - runs once on mount

    // Function to fetch inventory data
    const fetchInventoryData = async () => {
        if (!userID) return; // Don't fetch if no user ID

        setIsLoading(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching inventory items for user:", userID);

            // Fetch inventory items
            const endpoint = (
                user?.role === "admin" ||
                    user?.role === "md" ||
                    user?.role === "warehouse"
                    ? selectedUser?.id == currentUser?.id
                    : user?.role === "admin" ||
                    user?.role === "md" ||
                    user?.role === "warehouse"
            )
                ? `${API_URL}/inventory/items`
                : `${API_URL}/inventory/items?userId=${userID}`;
            console.log("Fetching tasks from:", endpoint);
            const itemsResponse = await axios.get(endpoint, {
                headers,
            });
            console.log("Raw inventory data:", itemsResponse.data);

            // Function to transform backend category enum to frontend label
            const getCategoryLabel = (categoryEnum: string) => {
                const categoryMap = CATEGORY_OPTIONS.find(
                    (opt) => opt.value === categoryEnum
                );
                return categoryMap ? categoryMap.label : categoryEnum;
            };

            // Function to transform backend unit enum to frontend label
            const getUnitLabel = (unitEnum: string) => {
                const unitMap = UNIT_OPTIONS.find((opt) => opt.value === unitEnum);
                return unitMap ? unitMap.label : unitEnum;
            };

            // Transform the data to match frontend expectations
            const transformedItems = itemsResponse.data.map((item: any) => ({
                id: item.id,
                name: item.itemName || item.name,
                itemCode: item.itemCode,
                category: getCategoryLabel(item.category),
                type: item.type || "OLD",
                quantity: item.quantity,
                unit: getUnitLabel(item.unit),
                location: item.location,
                lastUpdated: item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString()
                    : new Date().toLocaleDateString(),
                maxStock: item.maximumStock || item.maxStock,
                safetyStock: item.safetyStock,
                isFlagged: item.isFlagged || false,
                primarySupplier:
                    item.primarySupplierName || item.primarySupplier?.name || "",
                secondarySupplier:
                    item.secondarySupplierName || item.secondarySupplier?.name || "",
                unitCost: item.unitCost ? item.unitCost / 100 : 0, // Convert from cents to currency
                description: item.description,
                lastOrderDate: item.lastOrderDate,
                nextOrderDate: item.nextOrderDate,
                qualityScore: item.qualityScore || 85,
                photos: item.photos || [],
                notes: item.notes,
                imageUrl: item.imageUrl,
                project: item.project,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }));

            console.log("Transformed inventory items:", transformedItems);
            setInventoryItems(transformedItems);

            // Fetch other data
            try {
                const endpoint = (
                    user?.role === "admin" ||
                        user?.role === "md" ||
                        user?.role === "warehouse"
                        ? selectedUser?.id == currentUser?.id
                        : user?.role === "admin" ||
                        user?.role === "md" ||
                        user?.role === "warehouse"
                )
                    ? `${API_URL}/inventory/transfers`
                    : `${API_URL}/inventory/transfers?userId=${userID}`;
                console.log("Fetching tasks from:", endpoint);
                const transfersResponse = await axios.get(endpoint, { headers });
                const mappedTransfers: Transfer[] = (
                    Array.isArray(transfersResponse.data) ? transfersResponse.data : []
                ).map(
                    (t: any) =>
                    ({
                        dbId: t?.id,
                        id: t?.transferID || t?.id || `TRF-${Date.now()}`,
                        from: t?.fromLocation || t?.from || "-",
                        to: t?.toLocation || t?.to || "-",
                        items: Array.isArray(t?.items) ? t.items.length : t?.items ?? 0,
                        status: t?.status || "PENDING",
                        approvalStatus: t?.approvalStatus || "PENDING",
                        driver: t?.driverName || t?.driver || "-",
                        eta:
                            t?.etaMinutes != null
                                ? `${(t.etaMinutes / 60).toFixed(1)} hrs`
                                : t?.eta || "-",
                        etaMinutes:
                            typeof t?.etaMinutes === "number" ? t.etaMinutes : undefined,
                        isFlagged: false,
                        requestedDate: t?.requestedDate
                            ? new Date(t.requestedDate).toLocaleString()
                            : undefined,
                        requestedAtMs: t?.requestedDate
                            ? new Date(t.requestedDate).getTime()
                            : undefined,
                        approvedByName: t?.approvedBy?.name,
                        vehicleName: t?.vehicle?.vehicleName,
                        vehicleReg:
                            t?.vehicle?.registrationNumber || t?.vehicle?.licensePlate,
                        priority: t?.priority,
                        itemsList: Array.isArray(t?.items)
                            ? t.items.map((it: any) => ({
                                description: it.description,
                                quantity: it.quantity,
                                unit: it.unit || null,
                            }))
                            : [],
                    } as any)
                );
                setTransfers(mappedTransfers);
                console.log("Mapped transfers:", mappedTransfers);
            } catch (error) {
                console.log("Transfers data not available");
            }

            try {
                const trendsResponse = await axios.get(`${API_URL}/inventory/trends`, {
                    headers,
                });
                setInventoryTrends(trendsResponse.data);
            } catch (error) {
                console.log("Trends data not available");
            }

            try {
                const warehouseResponse = await axios.get(
                    `${API_URL}/inventory/warehouse-utilization`,
                    { headers }
                );
                setWarehouseUtilization(warehouseResponse.data);
            } catch (error) {
                console.log("Warehouse data not available");
            }

            try {
                const grnResponse = await axios.get(`${API_URL}/inventory/grn`, {
                    headers,
                });
                setGrnData(grnResponse.data);
            } catch (error) {
                console.log("GRN data not available");
            }

            try {
                const tasksResponse = await axios.get(`${API_URL}/inventory/tasks`, {
                    headers,
                });
                setTasks(tasksResponse.data);
            } catch (error) {
                console.log("Tasks data not available");
            }
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            toast.error("Failed to fetch inventory data");
        } finally {
            setIsLoading(false);
        }
    };

    // Schedule Maintenance CRUD functions
    const fetchScheduleMaintenances = async () => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const endpoint = (
                user?.role === "admin" ||
                    user?.role === "md" ||
                    user?.role === "warehouse"
                    ? selectedUser?.id == currentUser?.id
                    : user?.role === "admin" ||
                    user?.role === "md" ||
                    user?.role === "warehouse"
            )
                ? `${API_URL}/schedule-maintenances-global`
                : `${API_URL}/schedule-maintenance?userId=${userID}`;
            console.log("Fetching schedule maintenances from:", endpoint);
            const response = await axios.get(endpoint, {
                headers,
            });
            setScheduleMaintenances(response.data);
        } catch (error) {
            console.error("Error fetching schedule maintenances:", error);
        }
    };

    const createScheduleMaintenance = async (data: any) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const maintenanceData = {
                equipmentName: data.equipment,
                maintenanceType: data.maintenanceType.toUpperCase(),
                scheduledDate: new Date(data.scheduledDate).toISOString(),
                Priority: data.priority.toUpperCase(),
                technicianName: data.technician,
                estimatedTime: data.estimatedDuration,
                description: data.description || "",
                additionalNotes: data.notes || "",
            };

            const response = await axios.post(
                `${API_URL}/schedule-maintenance`,
                maintenanceData,
                { headers }
            );

            toast.success(`Maintenance scheduled for ${data.equipment}`);
            fetchScheduleMaintenances(); // Refresh the list
            return response.data;
        } catch (error) {
            console.error("Error creating schedule maintenance:", error);
            toast.error("Failed to schedule maintenance");
            throw error;
        }
    };

    const updateScheduleMaintenance = async (id: string, data: any) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const maintenanceData = {
                equipmentName: data.equipment,
                maintenanceType: data.maintenanceType.toUpperCase(),
                scheduledDate: new Date(data.scheduledDate).toISOString(),
                Priority: data.priority.toUpperCase(),
                technicianName: data.technician,
                estimatedTime: data.estimatedDuration,
                description: data.description || "",
                additionalNotes: data.notes || "",
            };

            const response = await axios.put(
                `${API_URL}/schedule-maintenance/${id}`,
                maintenanceData,
                { headers }
            );

            toast.success("Maintenance updated successfully");
            fetchScheduleMaintenances(); // Refresh the list
            return response.data;
        } catch (error) {
            console.error("Error updating schedule maintenance:", error);
            toast.error("Failed to update maintenance");
            throw error;
        }
    };

    const deleteScheduleMaintenance = async (id: string) => {
        try {
            setIsDeletingMaintenance(true);
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.delete(`${API_URL}/schedule-maintenance/${id}`, { headers });

            toast.success("Maintenance deleted successfully");
            fetchScheduleMaintenances(); // Refresh the list
        } catch (error) {
            console.error("Error deleting schedule maintenance:", error);
            toast.error("Failed to delete maintenance");
        } finally {
            setIsDeletingMaintenance(false);
            setMaintenanceToDelete(null);
        }
    };

    // Use effect to fetch data when targetUserId changes
    useEffect(() => {
        if (userID) {
            fetchInventoryData();
        }
    }, [userID]); // Refetch when target user changes

    useEffect(() => {
        if (userID) {
            fetchVendors();
            fetchScheduleMaintenances();
            fetchMaterialIndents();
            fetchTransfersForApproval();
        }
    }, [userID]);

    // Populate form when editing a material indent
    useEffect(() => {
        if (editingMaterialIndent && isEditMaterialIndentOpen) {
            console.log("Populating edit form with data:", editingMaterialIndent);

            // Ensure items have proper types
            const items = (editingMaterialIndent.items || []).map((item: any, index: number) => ({
                slNo: parseInt(item.slNo) || (index + 1),
                dateOfOrder: item.dateOfOrder || "",
                materialDescription: item.materialDescription || "",
                unit: item.unit || "",
                requiredQty: parseFloat(item.requiredQty) || 0,
                receivedQty: parseFloat(item.receivedQty) || 0,
                balance: parseFloat(item.balance) || 0,
                deliveryDate: item.deliveryDate || "",
                remarks: item.remarks || "",
            }));

            materialIndentForm.reset({
                companyName: editingMaterialIndent.companyName || "",
                companyAddress: editingMaterialIndent.companyAddress || "",
                companyCity: editingMaterialIndent.companyCity || "",
                companyPostalCode: editingMaterialIndent.companyPostalCode || "",
                headerText: editingMaterialIndent.headerText || "",
                site: editingMaterialIndent.site || "",
                orderSlipNo: editingMaterialIndent.orderSlipNo || "",
                date: editingMaterialIndent.date
                    ? new Date(editingMaterialIndent.date).toISOString().slice(0, 10)
                    : "",
                storeKeeperName: editingMaterialIndent.storeKeeperName || "",
                projectManagerName: editingMaterialIndent.projectManagerName || "",
                items: items.length > 0 ? items : [
                    {
                        slNo: 1,
                        dateOfOrder: "",
                        materialDescription: "",
                        unit: "",
                        requiredQty: 0,
                        receivedQty: 0,
                        balance: 0,
                        deliveryDate: "",
                        remarks: "",
                    },
                ],
            });
        }
    }, [editingMaterialIndent, isEditMaterialIndentOpen]);

    // Add action handlers
    const handleInventoryAction = (
        action: string,
        item: InventoryItemType,
        updatedData?: any
    ) => {
        switch (action) {
            case "view":
                handleViewDetails(item);
                break;
            case "edit":
                handleEditItem(item);
                break;
            case "delete":
                setItemToDelete(item);
                break;
            case "flag":
                const flaggedItems = inventoryItems.map((i) =>
                    i.id === item.id ? { ...i, isFlagged: !i.isFlagged } : i
                );
                setInventoryItems(flaggedItems);
                toast.success(
                    `Item ${item.isFlagged ? "unflagged" : "flagged"} successfully`
                );
                break;
        }
    };

    const handleTransferAction = (
        action: string,
        transfer: Transfer,
        updatedData?: any
    ) => {
        switch (action) {
            case "edit":
                const updatedTransfers = transfers.map((t) =>
                    t.id === transfer.id ? { ...t, ...updatedData } : t
                );
                setTransfers(updatedTransfers);
                toast.success("Transfer updated successfully");
                break;

            case "delete": {
                if (!user?.id) {
                    toast.error("User not authenticated. Please log in.");
                    return;
                }
                const token =
                    sessionStorage.getItem("jwt_token") ||
                    localStorage.getItem("jwt_token_backup");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const idForDelete = transfer.dbId || transfer.id;
                axios
                    .delete(
                        `${API_URL}/inventory/transfers/${idForDelete}?userId=${user.id}`,
                        { headers }
                    )
                    .then(() => {
                        setTransfers((prev) => prev.filter((t) => t.id !== transfer.id));
                        toast.success("Transfer deleted successfully");
                    })
                    .catch((err) => {
                        console.error(err);
                        toast.error("Failed to delete transfer");
                    });
                break;
            }
        }
    };

    // Filter vendors based on search
    const filteredPrimaryVendors = vendors.filter((vendor) =>
        vendor.name?.toLowerCase().includes(primarySupplierSearch.toLowerCase())
    );

    const filteredSecondaryVendors = vendors.filter((vendor) =>
        vendor.name?.toLowerCase().includes(secondarySupplierSearch.toLowerCase())
    );

    // Add these filtered vendor arrays for the edit form
    const filteredEditPrimaryVendors = vendors.filter((vendor) =>
        vendor.name?.toLowerCase().includes(editPrimarySupplierSearch.toLowerCase())
    );

    const filteredEditSecondaryVendors = vendors.filter((vendor) =>
        vendor.name
            ?.toLowerCase()
            .includes(editSecondarySupplierSearch.toLowerCase())
    );

    // Filter items based on search and filters
    const basicFilteredItems = inventoryItems.filter((item) => {
        if (!item || !item.name) return false; // Skip items without required fields

        const categoryValue =
            typeof item.category === "string"
                ? item.category
                : Array.isArray(item.category)
                    ? item.category.join(" ")
                    : "";
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            categoryValue.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            !selectedCategory || categoryValue === selectedCategory;
        const matchesType = !typeFilter || item.type === typeFilter;
        return matchesSearch && matchesCategory && matchesType;
    });

    // Group items by name and sum quantities
    const filteredItems = Object.values(
        basicFilteredItems.reduce((acc, item) => {
            const existingItem = acc[item.name];
            if (existingItem) {
                // Sum the quantities
                existingItem.quantity += item.quantity;
            } else {
                // Use the first occurrence with its data
                acc[item.name] = { ...item };
            }
            return acc;
        }, {} as Record<string, InventoryItemType>)
    );

    const form = useForm<AddItemFormValues>({
        resolver: zodResolver(addItemFormSchema),
        defaultValues,
    });

    const editForm = useForm<AddItemFormValues>({
        resolver: zodResolver(addItemFormSchema),
        defaultValues,
    });

    const maintenanceForm = useForm<MaintenanceFormValues>({
        resolver: zodResolver(maintenanceFormSchema),
        defaultValues: maintenanceDefaultValues,
    });

    const materialIndentForm = useForm<MaterialIndentFormValues>({
        resolver: zodResolver(materialIndentFormSchema),
        defaultValues: {
            companyName: "",
            companyAddress: "",
            companyCity: "",
            companyPostalCode: "",
            headerText: "",
            site: "",
            orderSlipNo: "",
            date: "",
            storeKeeperName: "",
            projectManagerName: "",
            items: [
                {
                    slNo: 1,
                    dateOfOrder: "",
                    materialDescription: "",
                    unit: "",
                    requiredQty: 0,
                    receivedQty: 0,
                    balance: 0,
                    deliveryDate: "",
                    remarks: "",
                },
            ],
        },
    });

    const onSubmit = async (data: AddItemFormValues) => {
        try {
            if (!user?.id) {
                toast.error("User not authenticated. Please log in.");
                return;
            }

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Handle primary supplier - can be "OTHER" for manual entry
            let primaryVendor: any = null;
            let primarySupplierName = "";
            let primarySupplierManualName = "";

            if (data.primarySupplier === "OTHER") {
                primarySupplierManualName = data.primarySupplierManual || "";
                primarySupplierName = primarySupplierManualName;
                // Create a dummy vendor ID for manual supplier (will be stored as manual name)
                primaryVendor = { id: "manual-primary" };
            } else {
                primaryVendor = vendors.find(
                    (vendor) => vendor.name === data.primarySupplier
                );
                primarySupplierName = data.primarySupplier;
            }

            if (!primaryVendor) {
                toast.error(
                    "Primary supplier not found. Please select a valid supplier."
                );
                return;
            }

            // Handle secondary supplier
            let secondaryVendor: any = null;
            let secondarySupplierName = "";
            let secondarySupplierManualName = "";

            if (data.secondarySupplier === "OTHER") {
                secondarySupplierManualName = data.secondarySupplierManual || "";
                secondarySupplierName = secondarySupplierManualName;
                secondaryVendor = { id: "manual-secondary" };
            } else if (data.secondarySupplier && data.secondarySupplier !== "none") {
                secondaryVendor = vendors.find(
                    (vendor) => vendor.name === data.secondarySupplier
                );
                secondarySupplierName = data.secondarySupplier;
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("itemName", data.name);
            formData.append("itemCode", data.itemCode);
            formData.append("category", data.category[0]); // Backend expects single category enum value
            formData.append("quantity", data.quantity.toString());
            formData.append("type", data.type || "OLD");
            formData.append("unit", data.unit);
            formData.append("maximumStock", data.maxStock.toString());
            formData.append("safetyStock", data.safetyStock.toString());
            formData.append("primarySupplierName", primarySupplierName);
            formData.append("primarySupplierManualName", primarySupplierManualName);
            formData.append("vendorId", primaryVendor.id !== "manual-primary" ? primaryVendor.id : "00000000-0000-0000-0000-000000000000");

            // Handle secondary supplier
            if (secondaryVendor) {
                formData.append("secondarySupplierName", secondarySupplierName);
                formData.append("secondarySupplierManualName", secondarySupplierManualName);
                formData.append("secondaryVendorId", secondaryVendor.id !== "manual-secondary" ? secondaryVendor.id : "");
            } else {
                formData.append("secondarySupplierName", "");
                formData.append("secondarySupplierManualName", "");
                formData.append("secondaryVendorId", "");
            }

            formData.append("unitCost", Math.round(data.unitCost * 100).toString()); // Backend expects cents
            formData.append("createdById", user.id);

            // Add project if selected
            if (data.project) {
                formData.append("projectId", data.project);
            }

            // Add image file if provided
            if (data.image) {
                formData.append("image", data.image);
            }

            const response = await axios.post(
                `${API_URL}/inventory/items`,
                formData,
                {
                    headers: {
                        ...headers,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const newItem = response.data;
            // Refresh the inventory data to get the latest items
            await fetchInventoryData();
            toast.success("Item added successfully!");
            setIsAddItemOpen(false);
            form.reset();
        } catch (error) {
            toast.error("Failed to add item. Please try again.");
            console.error("Error adding item:", error);
        }
    };

    const onEditSubmit = async (data: AddItemFormValues) => {
        if (!editingItem || !user?.id) {
            toast.error("No item selected for editing");
            return;
        }

        try {
            console.log("Updating item with data:", data);
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Find the vendor by name to get the vendor ID
            const primaryVendor = vendors.find(
                (vendor) => vendor.name === data.primarySupplier
            );
            const secondaryVendor =
                data.secondarySupplier && data.secondarySupplier !== "none"
                    ? vendors.find((vendor) => vendor.name === data.secondarySupplier)
                    : null;

            if (!primaryVendor) {
                toast.error(
                    "Primary supplier not found. Please select a valid supplier."
                );
                return;
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append("itemName", data.name);
            formData.append("itemCode", data.itemCode);
            formData.append("category", data.category[0]);
            formData.append("type", data.type || "OLD");
            formData.append("quantity", data.quantity.toString());
            formData.append("unit", data.unit);
            formData.append("maximumStock", data.maxStock.toString());
            formData.append("safetyStock", data.safetyStock.toString());
            formData.append("primarySupplierName", data.primarySupplier);
            formData.append("vendorId", primaryVendor.id);

            // Handle secondary supplier - explicitly set to null if "none" or empty
            if (
                data.secondarySupplier &&
                data.secondarySupplier !== "none" &&
                secondaryVendor
            ) {
                formData.append("secondarySupplierName", data.secondarySupplier);
                formData.append("secondaryVendorId", secondaryVendor.id);
            } else {
                // Explicitly set secondary supplier to null when "none" is selected
                formData.append("secondarySupplierName", "");
                formData.append("secondaryVendorId", "");
            }

            formData.append("unitCost", Math.round(data.unitCost * 100).toString());
            formData.append("createdById", user.id);

            // Add image file if provided
            if (data.image) {
                formData.append("image", data.image);
            }

            console.log("Sending PUT request to:", `${API_URL}/inventory/items/${editingItem.id}`);
            const response = await axios.put(
                `${API_URL}/inventory/items/${editingItem.id}`,
                formData,
                {
                    headers: {
                        ...headers,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Update response:", response.data);
            const updatedItem = response.data;
            // Refresh the inventory data to get the latest items
            await fetchInventoryData();
            toast.success("Item updated successfully!");
            setIsEditItemOpen(false);
            setEditingItem(null);
            editForm.reset();
        } catch (error: any) {
            console.error("Error updating item:", error);
            const errorMsg = error.response?.data?.message || "Failed to update item. Please try again.";
            toast.error(errorMsg);
        }
    };

    const handleExport = (tabName: string) => {
        let exportData: any[] = [];
        let fileName = "";

        switch (tabName) {
            case "project-overview":
                exportData = tasks.map((task) => ({
                    "Task ID": task.id,
                    "Task Name": task.name,
                    "Start Date": task.startDate,
                    "End Date": task.endDate,
                    Progress: `${task.progress}%`,
                    Status: task.status,
                    Priority: task.priority,
                    "Assigned To": task.assignedTo,
                }));
                fileName = "project-tasks";
                break;

            case "inventory":
                exportData = filteredItems.map((item) => ({
                    "Item Name": item.name,
                    Category: Array.isArray(item.category)
                        ? item.category.join(", ")
                        : item.category,
                    Quantity: item.quantity,
                    Unit: item.unit,
                    Location: item.location,
                    "Last Updated": item.lastUpdated,
                    "Max Stock": item.maxStock,
                    "Safety Stock": item.safetyStock,
                }));
                fileName = "inventory-items";
                break;

            case "transfers":
                exportData = transfers.map((transfer) => ({
                    "Transfer ID": transfer.id,
                    From: transfer.from,
                    To: transfer.to,
                    Items: transfer.items,
                    Status: transfer.status,
                    Driver: transfer.driver,
                    ETA: transfer.eta,
                }));
                fileName = "material-transfers";
                break;

            case "warehouse":
                exportData = warehouseUtilization.map((warehouse) => ({
                    Location: warehouse.location,
                    Capacity: `${warehouse.capacity}%`,
                    "Used Space": `${warehouse.used}%`,
                    "Available Space": `${warehouse.capacity - warehouse.used}%`,
                    Efficiency: `${warehouse.efficiency}%`,
                }));
                fileName = "warehouse-utilization";
                break;

            case "analytics":
                // Create workbook with multiple sheets
                const wb = XLSX.utils.book_new();

                // Progress data
                const progressData = inventoryTrends.map((data) => ({
                    Month: data.month,
                    "Planned Progress": `${data.forecast}%`,
                    "Actual Progress": `${data.stockLevel}`,
                    Efficiency: `${data.efficiency}%`,
                }));

                // Cost data
                const costData = [
                    { category: "Raw Materials", cost: 850000, budget: 900000 },
                    { category: "Equipment", cost: 320000, budget: 350000 },
                    { category: "Labor", cost: 450000, budget: 400000 },
                    { category: "Transport", cost: 180000, budget: 200000 },
                ].map((data) => ({
                    Category: data.category,
                    "Actual Cost": `₹${data.cost}`,
                    Budget: `₹${data.budget}`,
                    Variance: `₹${data.budget - data.cost}`,
                }));

                const ws1 = XLSX.utils.json_to_sheet(progressData);
                const ws2 = XLSX.utils.json_to_sheet(costData);

                XLSX.utils.book_append_sheet(wb, ws1, "Progress Analytics");
                XLSX.utils.book_append_sheet(wb, ws2, "Cost Analytics");

                const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                const data = new Blob([excelBuffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                saveAs(
                    data,
                    `analytics-report-${new Date().toISOString().split("T")[0]}.xlsx`
                );

                toast.success("Analytics data has been exported to Excel");
                return;

            default:
                toast.error("No data available for export");
                return;
        }

        if (exportData.length === 0) {
            toast.error("No data available to export");
            return;
        }

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Data");

        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Save file with current date in filename
        const currentDate = new Date().toISOString().split("T")[0];
        saveAs(data, `${fileName}-${currentDate}.xlsx`);

        toast.success("Data has been exported to Excel");
    };

    // Add handlers for quick actions
    const handleResolveIssues = () => {
        const criticalIssues = [
            {
                id: "ISS001",
                title: "Material shortage",
                priority: "high",
                status: "open",
            },
            {
                id: "ISS002",
                title: "Equipment malfunction",
                priority: "critical",
                status: "open",
            },
            {
                id: "ISS003",
                title: "Quality control failure",
                priority: "high",
                status: "open",
            },
        ];
        setIsResolveIssuesOpen(true);
        toast.info(`${criticalIssues.length} critical issues found`, {
            description: "Prioritizing resolution based on impact severity",
        });
    };

    const handleTrackMaterials = () => {
        const delayedMaterials = [
            {
                id: "MAT001",
                name: "Steel Bars",
                delay: "2 days",
                supplier: "Steel Corp",
            },
            {
                id: "MAT002",
                name: "Cement Bags",
                delay: "1 day",
                supplier: "Cement Ltd",
            },
            {
                id: "MAT003",
                name: "Electrical Cables",
                delay: "3 days",
                supplier: "Electric Co",
            },
        ];
        setIsTrackMaterialsOpen(true);
        toast.info(`${delayedMaterials.length} materials delayed`, {
            description: "Tracking delivery status and coordinating with suppliers",
        });
    };

    const handleViewSchedule = () => {
        const scheduledWorkers = [
            { id: "W001", name: "John Doe", role: "Mason", shift: "Morning" },
            { id: "W002", name: "Jane Smith", role: "Electrician", shift: "Morning" },
            { id: "W003", name: "Mike Johnson", role: "Plumber", shift: "Afternoon" },
        ];
        setIsViewScheduleOpen(true);
        toast.info(`${scheduledWorkers.length} workers scheduled`, {
            description: "Reviewing workforce allocation and shifts",
        });
    };

    const handleReviewProgress = () => {
        const milestones = [
            {
                id: "M001",
                name: "Foundation Work",
                progress: 100,
                dueDate: "2024-01-25",
            },
            {
                id: "M002",
                name: "Steel Framework",
                progress: 75,
                dueDate: "2024-01-30",
            },
        ];
        setIsReviewProgressOpen(true);
        toast.info(`${milestones.length} milestones due this week`, {
            description: "Analyzing project timeline and deliverables",
        });
    };

    // Add view details handler
    const handleViewDetails = async (item: InventoryItemType) => {
        setSelectedItem(item);
        setIsViewDetailsOpen(true);
        setViewImageUrl(null);

        // If there's an imageUrl, download and display it
        if (item.imageUrl) {
            setIsImageLoading(true);
            try {
                // The imageUrl is already a full URL from S3, just use it directly
                setViewImageUrl(item.imageUrl);
            } catch (error) {
                console.error("Error loading image:", error);
                toast.error("Failed to load image");
            } finally {
                setIsImageLoading(false);
            }
        }
    };

    // Add edit item handler
    const handleEditItem = (item: InventoryItemType) => {
        setEditingItem(item);
        setEditPrimarySupplierSearch("");
        setEditSecondarySupplierSearch("");

        // Find the backend enum value for the category
        const getCategoryEnum = (categoryLabel: string | string[]) => {
            const label =
                typeof categoryLabel === "string"
                    ? categoryLabel
                    : Array.isArray(categoryLabel)
                        ? categoryLabel[0]
                        : "";
            const categoryMap = CATEGORY_OPTIONS.find((opt) => opt.label === label);
            return categoryMap ? categoryMap.value : label;
        };

        // Find the backend enum value for the unit
        const getUnitEnum = (unitLabel: string | string[]) => {
            const label =
                typeof unitLabel === "string"
                    ? unitLabel
                    : Array.isArray(unitLabel)
                        ? unitLabel[0]
                        : "";
            const unitMap = UNIT_OPTIONS.find((opt) => opt.label === label);
            return unitMap ? unitMap.value : label;
        };

        const getItemEnum = (itemLabel: string) => {
            const itemMap = ITEM_OPTIONS.find((opt) => opt.label === itemLabel);
            return itemMap ? itemMap.value : itemLabel;
        };

        const getTypeEnum = (typeLabel: string) => {
            const typeMap = INVENTORY_TYPE_OPTIONS.find(
                (opt) => opt.label === typeLabel
            );
            return typeMap ? typeMap.value : typeLabel;
        };

        // Populate edit form with current item data
        editForm.reset({
            name: getItemEnum(item.name),
            itemCode: item.itemCode || "",
            category: [getCategoryEnum(item.category || "")],
            type: getTypeEnum(item.type || "OLD"),
            quantity: item.quantity,
            unit: getUnitEnum(item.unit || ""),
            maxStock: item.maxStock || 500,
            safetyStock: item.safetyStock || 20,
            primarySupplier: item.primarySupplier || "",
            secondarySupplier: item.secondarySupplier || "",
            unitCost: item.unitCost || 0,
            image: undefined, // File field cannot be pre-populated
        });
        setIsEditItemOpen(true);
    };

    // Add delete item handler
    const handleDeleteItem = async (item: InventoryItemType) => {
        setIsDeleting(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.delete(`${API_URL}/inventory/items/${item.id}`, { headers });

            // Refresh the inventory data to get the latest items
            await fetchInventoryData();
            toast.success("Item deleted successfully!");
            setItemToDelete(null);
        } catch (error) {
            toast.error("Failed to delete item. Please try again.");
            console.error("Error deleting item:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Function to get vendor details by supplier name
    const getVendorDetails = (supplierName: string) => {
        if (!supplierName || !vendors.length) return null;
        return vendors.find(
            (vendor) =>
                vendor.name?.toLowerCase().includes(supplierName?.toLowerCase()) ||
                supplierName?.toLowerCase().includes(vendor.name?.toLowerCase())
        );
    };

    // Enhanced expandable content with vendor information
    const inventoryExpandableContent = (row: InventoryItemType) => {
        const primaryVendor = getVendorDetails(row.primarySupplier || "");
        const secondaryVendor = getVendorDetails(row.secondarySupplier || "");

        return (
            <div className="space-y-4">
                {/* Item Image */}
                {row.imageUrl && (
                    <div className="flex justify-center">
                        <img
                            src={row.imageUrl}
                            alt={row.name}
                            className="max-w-full h-auto max-h-32 rounded-lg border"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                            }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h4 className="font-medium mb-2">Stock Details</h4>
                        <div className="space-y-1 text-sm">
                            <div>Max Stock: {row.maxStock || 500}</div>
                            <div>Safety Stock: {row.safetyStock || 20}</div>
                            <div>Unit Cost: ₹{row.unitCost || 0}</div>
                            <div>
                                Total Value: ₹
                                {((row.unitCost || 0) * row.quantity).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Primary Vendor</h4>
                        <div className="space-y-1 text-sm">
                            {primaryVendor ? (
                                <>
                                    <div className="font-medium text-primary">
                                        Name : {primaryVendor.name}
                                    </div>
                                    {primaryVendor.email && (
                                        <div>Email : {primaryVendor.email}</div>
                                    )}
                                    {primaryVendor.mobile && (
                                        <div>Contact : {primaryVendor.mobile}</div>
                                    )}
                                    {primaryVendor.gstin && (
                                        <div>GSTIN : {primaryVendor.gstin}</div>
                                    )}
                                    {primaryVendor.city && primaryVendor.state && (
                                        <div>
                                            {primaryVendor.city}, {primaryVendor.state}
                                        </div>
                                    )}
                                    {primaryVendor.paymentTerms && (
                                        <div>Location : {primaryVendor.paymentTerms}</div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>{row.primarySupplier || "Not specified"}</div>
                                    <div className="text-muted-foreground text-xs">
                                        Vendor details not found
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Secondary Supplier</h4>
                        <div className="space-y-1 text-sm">
                            {row.secondarySupplier ? (
                                secondaryVendor ? (
                                    <>
                                        <div className="font-medium text-primary">
                                            Name: {secondaryVendor.name}
                                        </div>
                                        {secondaryVendor.email && (
                                            <div>Email : {secondaryVendor.email}</div>
                                        )}
                                        {secondaryVendor.mobile && (
                                            <div>Contact : {secondaryVendor.mobile}</div>
                                        )}
                                        {secondaryVendor.gstin && (
                                            <div>GSTIN : {secondaryVendor.gstin}</div>
                                        )}
                                        {secondaryVendor.city && secondaryVendor.state && (
                                            <div>
                                                Location : {secondaryVendor.city},{" "}
                                                {secondaryVendor.state}
                                            </div>
                                        )}
                                        {secondaryVendor.paymentTerms && (
                                            <div>💳 {secondaryVendor.paymentTerms}</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div>{row.secondarySupplier}</div>
                                        <div className="text-muted-foreground text-xs">
                                            Vendor details not found
                                        </div>
                                    </>
                                )
                            ) : (
                                <div className="text-muted-foreground text-sm">
                                    No secondary supplier
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Mobile responsive inventory columns
    const mobileInventoryColumns = [
        {
            key: "name",
            label: "Item Name",
            type: "text" as const,
            render: (value: any, row: InventoryItemType) => (
                <div className="flex flex-col">
                    <span className="font-medium">{value}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                            {row.category}
                        </Badge>
                        <Badge
                            variant={
                                row.quantity > (row.safetyStock || 20)
                                    ? "default"
                                    : "destructive"
                            }
                            className="text-xs"
                        >
                            {row.quantity} {row.unit}
                        </Badge>
                    </div>
                </div>
            ),
        },
        // {
        //   key: "type",
        //   label: "Type",
        //   type: "text" as const,
        //   className: "hidden sm:table-cell"
        // },
        {
            key: "itemCode",
            label: "Item Code",
            type: "text" as const,
            className: "hidden sm:table-cell",
        },
        {
            key: "project",
            label: "Project",
            type: "text" as const,
            className: "hidden md:table-cell",
            render: (value: any) => (
                value ? <span className="text-sm text-gray-600">{value.name}</span> : <span className="text-xs text-gray-400">-</span>
            ),
        },
        {
            key: "lastUpdated",
            label: "Last Updated",
            type: "text" as const,
            className: "hidden md:table-cell",
        },
        {
            key: "actions",
            label: "Actions",
            type: "actions" as const,
            render: (value: any, item: InventoryItemType) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInventoryAction("edit", item)}
                        className="h-8 w-8 p-0"
                        title="Edit Item"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInventoryAction("delete", item)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete Item"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Mobile responsive transfer columns
    const mobileTransferColumns = [
        {
            key: "id",
            label: "Transfer ID",
            type: "text" as const,
            render: (value: any, row: Transfer) => (
                <div className="flex flex-col">
                    <span className="font-medium">{value}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                            {row.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {row.items} items
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "from",
            label: "From",
            type: "text" as const,
            className: "hidden sm:table-cell",
        },
        {
            key: "to",
            label: "To",
            type: "text" as const,
            className: "hidden sm:table-cell",
        },
        {
            key: "eta",
            label: "ETA",
            type: "text" as const,
            className: "hidden md:table-cell",
        },
        {
            key: "actions",
            label: "Actions",
            type: "actions" as const,
            render: (value: any, row: Transfer) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setEditingTransfer(row);
                            setIsEditTransferOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="Edit Transfer"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransferAction("delete", row)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete Transfer"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // Get current tab name for display
    const getCurrentTabName = () => {
        const tab = getCurrentTab();
        switch (tab) {
            case "inventory":
                return "Inventory";
            case "material-forecast":
                return "Material Forecast";
            case "issue-tracking":
                return "Issue Tracking";
            case "transfers":
                return "Transfers";
            case "warehouse":
                return "Warehouse";
            default:
                return "Inventory";
        }
    };

    // Get icon for current tab
    const getCurrentTabIcon = () => {
        const tab = getCurrentTab();
        switch (tab) {
            case "inventory":
                return Package;
            case "material-forecast":
                return TrendingUp;
            case "issue-tracking":
                return AlertTriangle;
            case "transfers":
                return Truck;
            case "warehouse":
                return Warehouse;
            default:
                return Package;
        }
    };

    const CurrentTabIcon = getCurrentTabIcon();
    const currentTabName = getCurrentTabName();

    return (
        <div className="space-y-6">
            {/* User Filter Component */}
            <UserFilterComponent />

            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        SiteStock Management
                        {selectedUser && selectedUser.id !== currentUser?.id && (
                            <span className="text-sm md:text-lg text-muted-foreground ml-2">
                                - {selectedUser.name}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Comprehensive project tracking, SiteStock management and material
                        planning
                        {!isLoading &&
                            ` • ${filteredItems.length} items${inventoryItems.length !== filteredItems.length
                                ? ` (${inventoryItems.length} total)`
                                : ""
                            }`}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={() => handleExport("inventory")}
                        size="sm"
                        className="h-9"
                    >
                        <Download className="mr-1 md:mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Export</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={fetchInventoryData}
                        disabled={isLoading}
                        size="sm"
                        className="h-9"
                    >
                        <Package className="mr-1 md:mr-2 h-4 w-4" />
                        <span className="hidden md:inline">
                            {isLoading ? "Refreshing..." : "Refresh"}
                        </span>
                    </Button>
                    <Button
                        onClick={() => {
                            setIsAddItemOpen(true);
                            fetchProjects();
                        }}
                        size="sm"
                        className="h-9"
                    >
                        <Plus className="mr-1 md:mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Add Item</span>
                    </Button>
                </div>
            </div>

            {/* Add Item Dialog */}
            <Dialog
                open={isAddItemOpen}
                onOpenChange={(open) => {
                    setIsAddItemOpen(open);
                    if (!open) {
                        form.reset();
                        setImagePreview(null);
                        setPrimarySupplierIsOther(false);
                        setSecondarySupplierIsOther(false);
                        setPrimarySupplierSearch("");
                        setSecondarySupplierSearch("");
                    }
                }}
            >
                <DialogContent
                    className="max-w-2xl overflow-y-auto max-h-[90vh]"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to add a new item to the inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="project"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Item</FormLabel>
                                            <FormControl>
                                                <SimpleSearchableSelect
                                                    value={field.value || ""}
                                                    onValueChange={field.onChange}
                                                    options={ITEM_OPTIONS}
                                                    placeholder="Search and select item..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="itemCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Item Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Item Code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange([value])}
                                                defaultValue={field.value?.[0]}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CATEGORY_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {INVENTORY_TYPE_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter quantity"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {UNIT_OPTIONS.map((unit) => (
                                                        <SelectItem key={unit.value} value={unit.value}>
                                                            {unit.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maxStock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter maximum stock"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="safetyStock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Safety Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter safety stock"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="primarySupplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Supplier</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    if (value === "OTHER") {
                                                        setPrimarySupplierIsOther(true);
                                                    } else {
                                                        setPrimarySupplierIsOther(false);
                                                        form.setValue("primarySupplierManual", "");
                                                    }
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select primary supplier" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {/* Search input for primary supplier */}
                                                    <div className="p-2">
                                                        <Input
                                                            placeholder="Search suppliers..."
                                                            value={primarySupplierSearch}
                                                            onChange={(e) =>
                                                                setPrimarySupplierSearch(e.target.value)
                                                            }
                                                            className="h-8"
                                                            onClick={(e) => e.stopPropagation()}
                                                            onKeyDown={(e) => {
                                                                // Prevent the Select component from handling keyboard events
                                                                e.stopPropagation();
                                                            }}
                                                        />
                                                    </div>
                                                    {filteredPrimaryVendors.length > 0 ? (
                                                        filteredPrimaryVendors.map((vendor) => (
                                                            <SelectItem key={vendor.id} value={vendor.name}>
                                                                {vendor.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No suppliers found
                                                        </div>
                                                    )}
                                                    <SelectItem value="OTHER">Other (Add Manual)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {primarySupplierIsOther && (
                                    <FormField
                                        control={form.control}
                                        name="primarySupplierManual"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Enter Supplier Name</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        placeholder="Enter the supplier's name here..."
                                                        {...field}
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="secondarySupplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Secondary Supplier (Optional)</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    if (value === "OTHER") {
                                                        setSecondarySupplierIsOther(true);
                                                    } else {
                                                        setSecondarySupplierIsOther(false);
                                                        form.setValue("secondarySupplierManual", "");
                                                    }
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select secondary supplier" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {/* Search input for secondary supplier */}
                                                    <div className="p-2">
                                                        <Input
                                                            placeholder="Search suppliers..."
                                                            value={secondarySupplierSearch}
                                                            onChange={(e) =>
                                                                setSecondarySupplierSearch(e.target.value)
                                                            }
                                                            className="h-8"
                                                            onClick={(e) => e.stopPropagation()}
                                                            onKeyDown={(e) => {
                                                                // Prevent the Select component from handling keyboard events
                                                                e.stopPropagation();
                                                            }}
                                                        />
                                                    </div>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {filteredSecondaryVendors.length > 0 ? (
                                                        filteredSecondaryVendors.map((vendor) => (
                                                            <SelectItem key={vendor.id} value={vendor.name}>
                                                                {vendor.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                                            No suppliers found
                                                        </div>
                                                    )}
                                                    <SelectItem value="OTHER">Other (Add Manual)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {secondarySupplierIsOther && (
                                    <FormField
                                        control={form.control}
                                        name="secondarySupplierManual"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Enter Supplier Name</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        placeholder="Enter the supplier's name here..."
                                                        {...field}
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="unitCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Cost (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter unit cost"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Item Image (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        onChange(file);
                                                        handleImageChange(file, setImagePreview);
                                                    }}
                                                    {...field}
                                                    value=""
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Upload an image for the inventory item (JPG, PNG, GIF)
                                            </FormDescription>
                                            {imagePreview && (
                                                <div className="mt-2 relative inline-block">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                        onClick={() => {
                                                            onChange(null);
                                                            setImagePreview(null);
                                                            // Reset the file input
                                                            const fileInput = document.querySelector(
                                                                'input[type="file"]'
                                                            ) as HTMLInputElement;
                                                            if (fileInput) fileInput.value = "";
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter className="mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddItemOpen(false);
                                        form.reset();
                                        setImagePreview(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="ml-3">
                                    Add Item
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Tabs
                value={getCurrentTab()}
                onValueChange={handleTabChange}
                className="space-y-6"
            >
                {/* Hide tabs on mobile - show only on desktop */}
                <TabsList className="hidden md:grid w-full grid-cols-6">
                    <TabsTrigger value="inventory">SiteStock</TabsTrigger>
                    <TabsTrigger value="material-forecast">Material Forecast</TabsTrigger>
                    <TabsTrigger value="material-indent">Material Indane</TabsTrigger>
                    <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
                    <TabsTrigger value="transfers">Transfers</TabsTrigger>
                    <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
                </TabsList>

                {/* Mobile-specific section header */}
                <div className="md:hidden mb-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <CurrentTabIcon className="h-5 w-5 text-primary" />
                            <div>
                                <h2 className="text-lg font-semibold">{currentTabName}</h2>
                                <p className="text-xs text-muted-foreground">
                                    Inventory › {currentTabName}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {getCurrentTab() === "inventory" && filteredItems.length} items
                            {getCurrentTab() === "transfers" && transfers.length} transfers
                        </div>
                    </div>
                </div>

                <TabsContent value="material-forecast" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* <EnhancedStatCard
              title="Forecasted Items"
              value={inventoryItems
                .filter((item) => item.quantity < (item.safetyStock || 50) * 2)
                .length.toString()}
              icon={Package}
              description="Items needing procurement"
              trend={{ value: 8, label: "vs last forecast" }}
              threshold={{
                status: "good",
                message: "Active forecasting in place",
              }}
            /> */}
                        <EnhancedStatCard
                            title="Estimated Cost"
                            value={`₹${inventoryItems
                                .filter((item) => item.quantity < (item.safetyStock || 50) * 2)
                                .reduce(
                                    (total, item) =>
                                        total +
                                        (item.unitCost || 0) *
                                        ((item.safetyStock || 50) - item.quantity),
                                    0
                                )
                                .toLocaleString()}`}
                            icon={TrendingUp}
                            description="Total procurement value"
                            trend={{ value: 12, label: "vs last forecast" }}
                            threshold={{
                                status: "good",
                                message: "Within budget parameters",
                            }}
                        />
                        <EnhancedStatCard
                            title="Critical Items"
                            value={inventoryItems
                                .filter((item) => item.quantity <= (item.safetyStock || 20))
                                .length.toString()}
                            icon={AlertTriangle}
                            description="Below safety stock"
                            trend={{ value: -25, label: "reduction" }}
                            threshold={{
                                status:
                                    inventoryItems.filter(
                                        (item) => item.quantity <= (item.safetyStock || 20)
                                    ).length === 0
                                        ? "good"
                                        : "critical",
                                message:
                                    inventoryItems.filter(
                                        (item) => item.quantity <= (item.safetyStock || 20)
                                    ).length === 0
                                        ? "No critical shortages"
                                        : "Immediate attention required",
                            }}
                        />
                        <EnhancedStatCard
                            title="Avg Unit Cost"
                            value={`₹${inventoryItems.length > 0
                                ? Math.round(
                                    inventoryItems.reduce(
                                        (total, item) => total + (item.unitCost || 0),
                                        0
                                    ) / inventoryItems.length
                                )
                                : 0
                                }`}
                            icon={Calendar}
                            description="Average cost per item"
                            trend={{ value: -5, label: "cost optimization" }}
                            threshold={{
                                status: "good",
                                message: "Cost management effective",
                            }}
                        />
                    </div>

                    <MaterialForecast
                        projectId="PROJ001"
                        timeframe="1-month"
                        inventoryData={inventoryItems}
                    />
                </TabsContent>

                <TabsContent value="issue-tracking" className="space-y-6">
                    <IssueReportingFunctional projectId="PROJ001" siteId="SITE001" />
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    {inventorySubview === "main" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <StatCard
                                title="Old Items"
                                value={(
                                    inventoryItems
                                        .filter((item) => item.type === "OLD")
                                        .filter(
                                            (item, index, self) =>
                                                index ===
                                                self.findIndex(
                                                    (t) => t.name === item.name && t.type === item.type
                                                )
                                        ).length || 0
                                ).toString()}
                                icon={Package}
                                description="Items marked as OLD"
                                onClick={() => {
                                    setTypeFilter("OLD");
                                    setInventorySubview("old");
                                }}
                            />

                            <StatCard
                                title="New Items"
                                value={(
                                    inventoryItems
                                        .filter((item) => item.type === "NEW")
                                        .filter(
                                            (item, index, self) =>
                                                index ===
                                                self.findIndex(
                                                    (t) => t.name === item.name && t.type === item.type
                                                )
                                        ).length || 0
                                ).toString()}
                                icon={Package}
                                description="Items marked as NEW"
                                onClick={() => {
                                    setTypeFilter("NEW");
                                    setInventorySubview("new");
                                }}
                            />

                            <StatCard
                                title="Total Items"
                                value={(inventoryItems.length || 0).toString()}
                                icon={Package}
                                description="All inventory items"
                                onClick={() => {
                                    setTypeFilter(null);
                                    setInventorySubview("all");
                                }}
                            />
                        </div>
                    )}

                    {inventorySubview !== "main" && (
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                                <div>
                                    <CardTitle className="text-xl">
                                        {inventorySubview === "old" && "Old Items"}
                                        {inventorySubview === "new" && "New Items"}
                                        {inventorySubview === "all" && "Total Items"}
                                    </CardTitle>
                                    <CardDescription>
                                        {inventorySubview === "old" &&
                                            "Showing items with type OLD"}
                                        {inventorySubview === "new" &&
                                            "Showing items with type NEW"}
                                        {inventorySubview === "all" && "Showing all items"}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setInventorySubview("main");
                                        setTypeFilter(null);
                                    }}
                                >
                                    Back to Inventory
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ExpandableDataTable
                                    title="Inventory Items"
                                    description="Filtered view"
                                    data={filteredItems}
                                    columns={mobileInventoryColumns}
                                    expandableContent={inventoryExpandableContent}
                                    searchKey="name"
                                    filters={[
                                        {
                                            key: "category",
                                            label: "Category",
                                            options: CATEGORY_OPTIONS.map((cat) => cat.label),
                                            multiple: false,
                                        },
                                    ]}
                                    onRowAction={handleInventoryAction}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {inventorySubview === "main" &&
                        (isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span>Loading inventory items...</span>
                                </div>
                            </div>
                        ) : (
                            <ExpandableDataTable
                                title="Inventory Items"
                                description="Comprehensive SiteStock management with detailed insights"
                                data={filteredItems}
                                columns={mobileInventoryColumns}
                                expandableContent={inventoryExpandableContent}
                                searchKey="name"
                                filters={[
                                    {
                                        key: "category",
                                        label: "Category",
                                        options: CATEGORY_OPTIONS.map((cat) => cat.label),
                                        multiple: false,
                                    },
                                ]}
                                onRowAction={handleInventoryAction}
                            />
                        ))}

                    {/* View Details Dialog */}
                    <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            {selectedItem && (
                                <>
                                    <DialogHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <DialogTitle className="text-xl md:text-2xl">
                                                    {selectedItem.name}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Item ID: {selectedItem.id} • Last Updated:{" "}
                                                    {selectedItem.lastUpdated}
                                                </DialogDescription>
                                            </div>
                                            <Badge
                                                variant={
                                                    selectedItem.quantity >
                                                        (selectedItem.safetyStock || 50)
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {selectedItem.quantity >
                                                    (selectedItem.safetyStock || 50)
                                                    ? "In Stock"
                                                    : "Low Stock"}
                                            </Badge>
                                        </div>
                                    </DialogHeader>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        {/* Item Image */}
                                        {selectedItem.imageUrl && (
                                            <Card className="md:col-span-2">
                                                <CardHeader>
                                                    <CardTitle>Item Image</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={selectedItem.imageUrl}
                                                            alt={selectedItem.name}
                                                            className="max-w-full h-auto max-h-64 rounded-lg border"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = "none";
                                                            }}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Stock Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Stock Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Current Quantity</Label>
                                                        <p className="text-xl md:text-2xl font-bold">
                                                            {selectedItem.quantity} {selectedItem.unit}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label>Category</Label>
                                                        <p className="text-lg">
                                                            {Array.isArray(selectedItem.category)
                                                                ? selectedItem.category.join(", ")
                                                                : selectedItem.category}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {/* <div className="flex justify-between">
                                                        <span>Reorder Level</span>
                                                        <span>
                                                            {selectedItem.safetyStock || 50}{" "}
                                                            {selectedItem.unit}
                                                        </span>
                                                    </div> */}
                                                    <div className="flex justify-between">
                                                        <span>Maximum Stock</span>
                                                        <span>
                                                            {selectedItem.maxStock || 500} {selectedItem.unit}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Safety Stock</span>
                                                        <span>
                                                            {selectedItem.safetyStock || 20}{" "}
                                                            {selectedItem.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Progress
                                                    value={
                                                        (selectedItem.quantity /
                                                            (selectedItem.maxStock || 500)) *
                                                        100
                                                    }
                                                    className="h-2"
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* Location & Movement */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Location & Movement</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label>Current Location</Label>
                                                    <p className="text-lg">{selectedItem.location}</p>
                                                </div>
                                                <div>
                                                    <Label>Last Order Date</Label>
                                                    <p>{selectedItem.lastOrderDate || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <Label>Next Scheduled Order</Label>
                                                    <p>{selectedItem.nextOrderDate || "Not scheduled"}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Project Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Project Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label>Assigned Project</Label>
                                                    <p className="text-lg">
                                                        {selectedItem.project?.name || "No project assigned"}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Supplier Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Supplier Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Primary Supplier */}
                                                <div className="border-b pb-3">
                                                    <Label className="font-semibold">
                                                        Primary Supplier
                                                    </Label>
                                                    {(() => {
                                                        const vendor = getVendorDetails(
                                                            selectedItem.primarySupplier || ""
                                                        );
                                                        return vendor ? (
                                                            <div className="mt-2 space-y-2">
                                                                <p className="text-lg font-medium text-primary">
                                                                    {vendor.name}
                                                                </p>
                                                                {vendor.email && (
                                                                    <p className="text-sm">📧 {vendor.email}</p>
                                                                )}
                                                                {vendor.mobile && (
                                                                    <p className="text-sm">📱 {vendor.mobile}</p>
                                                                )}
                                                                {vendor.gstin && (
                                                                    <p className="text-sm">🆔 {vendor.gstin}</p>
                                                                )}
                                                                {vendor.city && vendor.state && (
                                                                    <p className="text-sm">
                                                                        📍 {vendor.city}, {vendor.state}
                                                                    </p>
                                                                )}
                                                                {vendor.paymentTerms && (
                                                                    <p className="text-sm">
                                                                        💳 {vendor.paymentTerms}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2">
                                                                <p className="text-lg">
                                                                    {selectedItem.primarySupplier ||
                                                                        "Not specified"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Vendor details not found
                                                                </p>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Secondary Supplier */}
                                                <div className="border-b pb-3">
                                                    <Label className="font-semibold">
                                                        Secondary Supplier
                                                    </Label>
                                                    {selectedItem.secondarySupplier ? (
                                                        (() => {
                                                            const secondaryVendor = getVendorDetails(
                                                                selectedItem.secondarySupplier
                                                            );
                                                            return secondaryVendor ? (
                                                                <div className="mt-2 space-y-2">
                                                                    <p className="text-lg font-medium text-secondary">
                                                                        {secondaryVendor.name}
                                                                    </p>
                                                                    {secondaryVendor.email && (
                                                                        <p className="text-sm">
                                                                            📧 {secondaryVendor.email}
                                                                        </p>
                                                                    )}
                                                                    {secondaryVendor.mobile && (
                                                                        <p className="text-sm">
                                                                            📱 {secondaryVendor.mobile}
                                                                        </p>
                                                                    )}
                                                                    {secondaryVendor.gstin && (
                                                                        <p className="text-sm">
                                                                            🆔 {secondaryVendor.gstin}
                                                                        </p>
                                                                    )}
                                                                    {secondaryVendor.city &&
                                                                        secondaryVendor.state && (
                                                                            <p className="text-sm">
                                                                                📍 {secondaryVendor.city},{" "}
                                                                                {secondaryVendor.state}
                                                                            </p>
                                                                        )}
                                                                    {secondaryVendor.paymentTerms && (
                                                                        <p className="text-sm">
                                                                            💳 {secondaryVendor.paymentTerms}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="mt-2">
                                                                    <p className="text-lg">
                                                                        {selectedItem.secondarySupplier}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Vendor details not found
                                                                    </p>
                                                                </div>
                                                            );
                                                        })()
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            No secondary supplier assigned
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Unit Cost</Label>
                                                    <p className="text-lg">
                                                        ₹{selectedItem.unitCost || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label>Quality Score</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={selectedItem.qualityScore || 85}
                                                            className="h-2"
                                                        />
                                                        <span>{selectedItem.qualityScore || 85}%</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Notes & Description */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Additional Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label>Description</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedItem.description ||
                                                            "No description available"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label>Notes</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedItem.notes || "No notes available"}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <DialogFooter className="mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsViewDetailsOpen(false)}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsViewDetailsOpen(false);
                                                toast.success("Item details updated successfully");
                                            }}
                                        >
                                            Update
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Edit Item Dialog */}
                    <Dialog
                        open={isEditItemOpen}
                        onOpenChange={(open) => {
                            setIsEditItemOpen(open);
                            if (!open) {
                                setEditingItem(null);
                                editForm.reset();
                                setEditImagePreview(null);
                                // Reset search states
                                setEditPrimarySupplierSearch("");
                                setEditSecondarySupplierSearch("");
                            }
                        }}
                    >
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Inventory Item</DialogTitle>
                                <DialogDescription>
                                    Update the details of this inventory item.
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...editForm}>
                                <form
                                    onSubmit={editForm.handleSubmit(onEditSubmit)}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={editForm.control}
                                        name="project"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Project</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select project (Optional)" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {projects.map((project) => (
                                                            <SelectItem key={project.id} value={project.id}>
                                                                {project.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Item Name as Searchable Select */}
                                        <FormField
                                            control={editForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item</FormLabel>
                                                    <FormControl>
                                                        <SimpleSearchableSelect
                                                            value={field.value || ""}
                                                            onValueChange={field.onChange}
                                                            options={ITEM_OPTIONS}
                                                            placeholder="Search and select item..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="itemCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter Item Code" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select
                                                        value={field.value?.[0] || ""}
                                                        onValueChange={(value) => field.onChange([value])}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {CATEGORY_OPTIONS.map((category) => (
                                                                <SelectItem
                                                                    key={category.value}
                                                                    value={category.value}
                                                                >
                                                                    {category.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Add Type Field */}
                                        <FormField
                                            control={editForm.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {INVENTORY_TYPE_OPTIONS.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseInt(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="unit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select unit" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {UNIT_OPTIONS.map((unit) => (
                                                                <SelectItem key={unit.value} value={unit.value}>
                                                                    {unit.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* <FormField
                                            control={editForm.control}
                                            name="safetyStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reorder Level</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="50"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseInt(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Minimum quantity before reordering
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> */}

                                        <FormField
                                            control={editForm.control}
                                            name="maxStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Maximum Stock</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="500"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseInt(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Maximum storage capacity
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="safetyStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Safety Stock</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="20"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseInt(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Emergency stock level
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="primarySupplier"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Primary Supplier</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select primary supplier" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {/* Search input for primary supplier */}
                                                            <div className="p-2">
                                                                <Input
                                                                    placeholder="Search suppliers..."
                                                                    value={editPrimarySupplierSearch}
                                                                    onChange={(e) =>
                                                                        setEditPrimarySupplierSearch(e.target.value)
                                                                    }
                                                                    className="h-8"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => {
                                                                        // Prevent the Select component from handling keyboard events
                                                                        e.stopPropagation();
                                                                    }}
                                                                />
                                                            </div>
                                                            {filteredEditPrimaryVendors.length > 0 ? (
                                                                filteredEditPrimaryVendors.map((vendor) => (
                                                                    <SelectItem
                                                                        key={vendor.id}
                                                                        value={vendor.name}
                                                                    >
                                                                        {vendor.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                                    No suppliers found
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="secondarySupplier"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Secondary Supplier (Optional)</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select secondary supplier" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {/* Search input for secondary supplier */}
                                                            <div className="p-2">
                                                                <Input
                                                                    placeholder="Search suppliers..."
                                                                    value={editSecondarySupplierSearch}
                                                                    onChange={(e) =>
                                                                        setEditSecondarySupplierSearch(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="h-8"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => {
                                                                        // Prevent the Select component from handling keyboard events
                                                                        e.stopPropagation();
                                                                    }}
                                                                />
                                                            </div>
                                                            <SelectItem value="none">None</SelectItem>
                                                            {filteredEditSecondaryVendors.length > 0 ? (
                                                                filteredEditSecondaryVendors.map((vendor) => (
                                                                    <SelectItem
                                                                        key={vendor.id}
                                                                        value={vendor.name}
                                                                    >
                                                                        {vendor.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                                    No suppliers found
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="unitCost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Cost (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseFloat(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="image"
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Item Image (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] || null;
                                                                onChange(file);
                                                                handleImageChange(file, setEditImagePreview);
                                                            }}
                                                            {...field}
                                                            value=""
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Upload a new image for the inventory item (JPG, PNG,
                                                        GIF)
                                                    </FormDescription>
                                                    {editImagePreview && (
                                                        <div className="mt-2">
                                                            <img
                                                                src={editImagePreview}
                                                                alt="Preview"
                                                                className="w-32 h-32 object-cover rounded-lg border"
                                                            />
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditItemOpen(false);
                                                setEditingItem(null);
                                                editForm.reset();
                                                setEditImagePreview(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Update Item</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Alert Dialog */}
                    <AlertDialog
                        open={!!itemToDelete}
                        onOpenChange={() => setItemToDelete(null)}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{itemToDelete?.name}"? This
                                    action cannot be undone. This will permanently remove the item
                                    from your inventory.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => itemToDelete && handleDeleteItem(itemToDelete)}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* View Details Dialog */}
                    <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Inventory Item Details</DialogTitle>
                                <DialogDescription>
                                    View complete information about this inventory item
                                </DialogDescription>
                            </DialogHeader>

                            {selectedItem && (
                                <div className="space-y-6">
                                    {/* Image Section */}
                                    {selectedItem.imageUrl && (
                                        <div className="flex flex-col items-center space-y-2">
                                            {isImageLoading ? (
                                                <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                                    <p className="mt-4 text-sm text-muted-foreground">
                                                        Loading image...
                                                    </p>
                                                </div>
                                            ) : viewImageUrl ? (
                                                <div className="w-full flex justify-center">
                                                    <img
                                                        src={viewImageUrl}
                                                        alt={selectedItem.name}
                                                        className="max-w-full h-auto max-h-64 rounded-lg border shadow-sm"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = "none";
                                                            toast.error("Failed to display image");
                                                        }}
                                                        onLoad={() => setIsImageLoading(false)}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* Item Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Item Name
                                            </Label>
                                            <p className="text-base font-semibold">
                                                {selectedItem.name}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Category
                                            </Label>
                                            <p className="text-base">
                                                {Array.isArray(selectedItem.category)
                                                    ? selectedItem.category.join(", ")
                                                    : selectedItem.category}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Type
                                            </Label>
                                            <Badge
                                                variant={
                                                    selectedItem.type === "NEW" ? "default" : "secondary"
                                                }
                                            >
                                                {selectedItem.type || "OLD"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Quantity
                                            </Label>
                                            <p className="text-base">
                                                <Badge
                                                    variant={
                                                        selectedItem.quantity > 100
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                >
                                                    {selectedItem.quantity} {selectedItem.unit}
                                                </Badge>
                                            </p>
                                        </div>

                                        {/* <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Location
                                            </Label>
                                            <p className="text-base">{selectedItem.location}</p>
                                        </div> */}

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Last Updated
                                            </Label>
                                            <p className="text-base">{selectedItem.lastUpdated}</p>
                                        </div>

                                        {/* <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Reorder Level
                                            </Label>
                                            <p className="text-base">
                                                {selectedItem.safetyStock || "-"}
                                            </p>
                                        </div> */}

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Maximum Stock
                                            </Label>
                                            <p className="text-base">
                                                {selectedItem.maxStock || "-"}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Safety Stock
                                            </Label>
                                            <p className="text-base">
                                                {selectedItem.safetyStock || "-"}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Unit Cost
                                            </Label>
                                            <p className="text-base">
                                                ₹{selectedItem.unitCost?.toFixed(2) || "0.00"}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">
                                                Primary Supplier
                                            </Label>
                                            <p className="text-base">
                                                {selectedItem.primarySupplier || "-"}
                                            </p>
                                        </div>

                                        {selectedItem.secondarySupplier && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-muted-foreground">
                                                    Secondary Supplier
                                                </Label>
                                                <p className="text-base">
                                                    {selectedItem.secondarySupplier}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Information */}
                                    {(selectedItem.description || selectedItem.notes) && (
                                        <div className="space-y-4 pt-4 border-t">
                                            {selectedItem.description && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Description
                                                    </Label>
                                                    <p className="text-sm">{selectedItem.description}</p>
                                                </div>
                                            )}

                                            {selectedItem.notes && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-muted-foreground">
                                                        Notes
                                                    </Label>
                                                    <p className="text-sm">{selectedItem.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsViewDetailsOpen(false);
                                        setSelectedItem(null);
                                        setViewImageUrl(null);
                                        setIsImageLoading(false);
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="transfers" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <EnhancedStatCard
                            title="Active Transfers"
                            value={(() => {
                                const activeCount = transfers.filter(
                                    (t) => (t.status || "").toUpperCase() === "IN_TRANSIT"
                                ).length;
                                return activeCount.toString();
                            })()}
                            icon={Truck}
                            description="Currently in transit"
                            threshold={{
                                status: (() => {
                                    const c = transfers.filter(
                                        (t) => (t.status || "").toUpperCase() === "IN_TRANSIT"
                                    ).length;
                                    return c === 0 ? "good" : c <= 5 ? "warning" : "critical";
                                })(),
                                message: (() => {
                                    const c = transfers.filter(
                                        (t) => (t.status || "").toUpperCase() === "IN_TRANSIT"
                                    ).length;
                                    return c === 0
                                        ? "No active transfers"
                                        : c <= 5
                                            ? "Normal transfer activity"
                                            : "High transfer load";
                                })(),
                            }}
                        />
                        <EnhancedStatCard
                            title={"Today's Transfers"}
                            value={(() => {
                                const start = new Date();
                                start.setHours(0, 0, 0, 0);
                                const end = new Date();
                                end.setHours(23, 59, 59, 999);
                                const countToday = transfers.filter((t) => {
                                    if (typeof t.requestedAtMs === "number") {
                                        return (
                                            t.requestedAtMs >= start.getTime() &&
                                            t.requestedAtMs <= end.getTime()
                                        );
                                    }
                                    // fallback: try to parse requestedDate if present
                                    if (t.requestedDate) {
                                        const ms = Date.parse(t.requestedDate);
                                        return (
                                            !isNaN(ms) && ms >= start.getTime() && ms <= end.getTime()
                                        );
                                    }
                                    return false;
                                }).length;
                                return countToday.toString();
                            })()}
                            icon={Package}
                            description="Requested today"
                        />
                        <EnhancedStatCard
                            title="Avg ETA"
                            value={(() => {
                                const active = transfers.filter(
                                    (t) => (t.status || "").toUpperCase() === "IN_TRANSIT"
                                );
                                const etas = active
                                    .map((t) => t.etaMinutes)
                                    .filter((v): v is number => typeof v === "number");
                                if (etas.length === 0) return "-";
                                const avgHours =
                                    etas.reduce((a, b) => a + b, 0) / etas.length / 60;
                                return `${avgHours.toFixed(1)} hrs`;
                            })()}
                            icon={Clock}
                            description="Avg for active transfers"
                        />
                    </div>

                    {/* Approve Transfer Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                Approve Transfer
                            </CardTitle>
                            <CardDescription>
                                Manage transfer approvals assigned to you
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingApprovalTransfers ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">Loading transfers...</p>
                                    </div>
                                </div>
                            ) : transfersForApproval.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No pending transfers for approval</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transfersForApproval.map((transfer) => (
                                        <div
                                            key={transfer.id}
                                            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50 dark:bg-blue-950/20"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Transfer ID</p>
                                                        <p className="font-semibold">{transfer.transferID || transfer.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Route</p>
                                                        <p className="text-sm font-medium">
                                                            {transfer.fromLocation} → {transfer.toLocation}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Requested By</p>
                                                            <p className="text-sm font-medium">{transfer.createdBy?.name || "-"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Date</p>
                                                            <p className="text-sm font-medium">
                                                                {transfer.requestedDate ? new Date(transfer.requestedDate).toLocaleDateString() : "-"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => {
                                                            setTransferToApprove(transfer);
                                                            setIsApproveTransferModalOpen(true);
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={() => handleRejectTransfer(transfer.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Material Transfers
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Track material movement between locations organized by approval status
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsAddTransferOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            New Transfer
                        </Button>
                    </div>

                    {/* Approved Transfers Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Approved Transfers
                            </CardTitle>
                            <CardDescription>
                                Material transfers with approved status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transfers.filter((t) => t.approvalStatus === "APPROVED").length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            No approved transfers
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {transfers.filter((t) => t.approvalStatus === "APPROVED").map((transfer) => (
                                        <div
                                            key={transfer.id}
                                            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50 dark:bg-green-950/20"
                                        >
                                            <div className="space-y-3">
                                                {/* Transfer ID */}
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Transfer ID
                                                    </p>
                                                    <p className="font-semibold text-lg">
                                                        {transfer.id}
                                                    </p>
                                                </div>

                                                {/* From/To */}
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Route
                                                    </p>
                                                    <p className="text-sm font-medium">{transfer.from} → {transfer.to}</p>
                                                </div>

                                                {/* Date & Items */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Date
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {transfer.requestedDate || "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Items
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {transfer.items || 0}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status & Actions */}
                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <Badge className="bg-green-600 hover:bg-green-700">
                                                        {transfer.status}
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                handleDownloadTransferPDF(transfer);
                                                            }}
                                                            title="Download as PDF"
                                                        >
                                                            <FileDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingTransfer(transfer);
                                                                setIsEditTransferOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending and Rejected Cards - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pending Transfers Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Pending Transfers
                                </CardTitle>
                                <CardDescription>
                                    Transfers awaiting approval
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transfers.filter((t) => t.approvalStatus === "PENDING").length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                No pending transfers
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transfers.filter((t) => t.approvalStatus === "PENDING").map((transfer) => (
                                            <div
                                                key={transfer.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-yellow-50 dark:bg-yellow-950/20"
                                            >
                                                <div className="space-y-3">
                                                    {/* Transfer ID */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Transfer ID
                                                        </p>
                                                        <p className="font-semibold">
                                                            {transfer.id}
                                                        </p>
                                                    </div>

                                                    {/* From/To */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Route
                                                        </p>
                                                        <p className="text-sm font-medium">{transfer.from} → {transfer.to}</p>
                                                    </div>

                                                    {/* Date */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Date
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {transfer.requestedDate || "-"}
                                                        </p>
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <Badge className="bg-yellow-600 hover:bg-yellow-700">
                                                            {transfer.status}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    handleDownloadTransferPDF(transfer);
                                                                }}
                                                                title="Download as PDF"
                                                            >
                                                                <FileDown className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingTransfer(transfer);
                                                                    setIsEditTransferOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rejected Transfers Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Rejected Transfers
                                </CardTitle>
                                <CardDescription>
                                    Transfers that have been rejected
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transfers.filter((t) => t.approvalStatus === "REJECTED").length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                No rejected transfers
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transfers.filter((t) => t.approvalStatus === "REJECTED").map((transfer) => (
                                            <div
                                                key={transfer.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50 dark:bg-red-950/20"
                                            >
                                                <div className="space-y-3">
                                                    {/* Transfer ID */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Transfer ID
                                                        </p>
                                                        <p className="font-semibold">
                                                            {transfer.id}
                                                        </p>
                                                    </div>

                                                    {/* From/To */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Route
                                                        </p>
                                                        <p className="text-sm font-medium">{transfer.from} → {transfer.to}</p>
                                                    </div>

                                                    {/* Date */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Date
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {transfer.requestedDate || "-"}
                                                        </p>
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <Badge className="bg-red-600 hover:bg-red-700">
                                                            {transfer.status}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    handleDownloadTransferPDF(transfer);
                                                                }}
                                                                title="Download as PDF"
                                                            >
                                                                <FileDown className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingTransfer(transfer);
                                                                    setIsEditTransferOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <MaterialTransferModal
                        open={isAddTransferOpen}
                        onOpenChange={setIsAddTransferOpen}
                        onSave={(created: any) => {
                            const mapped: Transfer = {
                                id: created?.transferID || created?.id || `TRF-${Date.now()}`,
                                from: created?.fromLocation || created?.from || "-",
                                to: created?.toLocation || created?.to || "-",
                                items: Array.isArray(created?.items)
                                    ? created.items.length
                                    : created?.items ?? 0,
                                status: created?.status || "PENDING",
                                approvalStatus: created?.approvalStatus || "PENDING",
                                driver: created?.driverName || created?.driver || "-",
                                eta: created?.etaMinutes != null
                                    ? `${(created.etaMinutes / 60).toFixed(1)} hrs`
                                    : created?.eta || "-",
                                etaMinutes: typeof created?.etaMinutes === "number"
                                    ? created.etaMinutes
                                    : undefined,
                                isFlagged: false,
                                requestedDate: created?.requestedDate
                                    ? new Date(created.requestedDate).toLocaleString()
                                    : undefined,
                                requestedAtMs: created?.requestedDate
                                    ? new Date(created.requestedDate).getTime()
                                    : Date.now()
                            };
                            setTransfers((prev) => [mapped, ...prev]);
                        }}
                    />
                    {editingTransfer && (
                        <MaterialTransferModal
                            open={isEditTransferOpen}
                            onOpenChange={setIsEditTransferOpen}
                            mode="edit"
                            transferId={editingTransfer?.dbId || editingTransfer?.id}
                            onRequestNew={() => setIsAddTransferOpen(true)}
                            onSave={(updated: any) => {
                                const mapped: Transfer = {
                                    dbId: editingTransfer?.dbId,
                                    id: updated?.transferID || updated?.id || editingTransfer.id,
                                    from:
                                        updated?.fromLocation ||
                                        updated?.from ||
                                        editingTransfer.from,
                                    to: updated?.toLocation || updated?.to || editingTransfer.to,
                                    items: Array.isArray(updated?.items)
                                        ? updated.items.length
                                        : updated?.items ?? editingTransfer.items,
                                    status: updated?.status || editingTransfer.status,
                                    approvalStatus: updated?.approvalStatus || editingTransfer.approvalStatus,
                                    driver:
                                        updated?.driverName ||
                                        updated?.driver ||
                                        editingTransfer.driver,
                                    eta:
                                        updated?.etaMinutes != null
                                            ? `${(updated.etaMinutes / 60).toFixed(1)} hrs`
                                            : updated?.eta || editingTransfer.eta,
                                    etaMinutes:
                                        typeof updated?.etaMinutes === "number"
                                            ? updated.etaMinutes
                                            : editingTransfer.etaMinutes,
                                    isFlagged: editingTransfer.isFlagged,
                                    requestedDate: updated?.requestedDate
                                        ? new Date(updated.requestedDate).toLocaleString()
                                        : editingTransfer.requestedDate,
                                    requestedAtMs: updated?.requestedDate
                                        ? new Date(updated.requestedDate).getTime()
                                        : editingTransfer.requestedAtMs,
                                };
                                setTransfers((prev) =>
                                    prev.map((t) => (t.id === editingTransfer.id ? mapped : t))
                                );
                                setEditingTransfer(null);
                            }}
                        />
                    )}
                </TabsContent>

                {/* Material Indent Tab */}
                <TabsContent value="material-indent" className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Material Indane
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                Manage and track material indane requests
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsAddMaterialIndentOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create Indane
                        </Button>
                    </div>

                    {/* Material Indent Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <EnhancedStatCard
                            title="Total Indents"
                            value={materialIndents.length.toString()}
                            icon={Package}
                            description="Total material indents created"
                            trend={{ value: 12, label: "this month" }}
                            threshold={{
                                status: "good",
                                message: "All tracked",
                            }}
                        />
                        <EnhancedStatCard
                            title="Pending"
                            value={materialIndents
                                .filter((i) => i.status === "PENDING")
                                .length.toString()}
                            icon={Clock}
                            description="Awaiting approval"
                            trend={{ value: materialIndents.filter((i) => i.status === "PENDING").length, label: "pending indents" }}
                            threshold={{
                                status:
                                    materialIndents.filter((i) => i.status === "PENDING").length >
                                        0
                                        ? "warning"
                                        : "good",
                                message:
                                    materialIndents.filter((i) => i.status === "PENDING").length >
                                        0
                                        ? "Review pending"
                                        : "No pending",
                            }}
                        />
                        <EnhancedStatCard
                            title="Approved"
                            value={materialIndents
                                .filter((i) => i.status === "APPROVED")
                                .length.toString()}
                            icon={CheckCircle}
                            description="Approved indents"
                            trend={{ value: materialIndents.filter((i) => i.status === "APPROVED").length, label: "approved" }}
                            threshold={{
                                status: "good",
                                message: "Ready for procurement",
                            }}
                        />
                        <EnhancedStatCard
                            title="Rejected"
                            value={materialIndents
                                .filter((i) => i.status === "REJECTED")
                                .length.toString()}
                            icon={AlertTriangle}
                            description="Rejected indents"
                            trend={{ value: materialIndents.filter((i) => i.status === "REJECTED").length, label: "rejected" }}
                            threshold={{
                                status: materialIndents.filter((i) => i.status === "REJECTED").length > 0 ? "warning" : "good",
                                message: materialIndents.filter((i) => i.status === "REJECTED").length > 0 ? "Review rejections" : "No rejections",
                            }}
                        />
                    </div>

                    {/* Approved Material Indents Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Approved Material Indents
                            </CardTitle>
                            <CardDescription>
                                Material indents with approved status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingIndents ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">
                                            Loading material indents...
                                        </p>
                                    </div>
                                </div>
                            ) : materialIndents.filter((i) => i.status === "APPROVED").length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            No approved material indents
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {materialIndents.filter((i) => i.status === "APPROVED").map((indent) => (
                                        <div
                                            key={indent.id}
                                            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50 dark:bg-green-950/20"
                                        >
                                            <div className="space-y-3">
                                                {/* Indent No */}
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Indent No.
                                                    </p>
                                                    <p className="font-semibold text-lg">
                                                        {indent.indentNo}
                                                    </p>
                                                </div>

                                                {/* Project */}
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Project
                                                    </p>
                                                    <p className="font-medium">{indent.project}</p>
                                                </div>

                                                {/* Date & WBS */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Date
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {new Date(indent.indentDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            WBS No.
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {indent.relatedWBSNo || "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status & Actions */}
                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <Badge className="bg-green-600 hover:bg-green-700">
                                                        {indent.status}
                                                    </Badge>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                handleDownloadPDF(indent.id);
                                                            }}
                                                            title="Download as PDF"
                                                        >
                                                            <FileDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                fetchMaterialIndentDetails(indent.id);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending and Rejected Cards - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pending Material Indents Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Pending Requests
                                </CardTitle>
                                <CardDescription>
                                    Material indents awaiting approval
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingIndents ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                                            <p className="text-muted-foreground">
                                                Loading...
                                            </p>
                                        </div>
                                    </div>
                                ) : materialIndents.filter((i) => i.status === "PENDING").length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                No pending requests
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {materialIndents.filter((i) => i.status === "PENDING").map((indent) => (
                                            <div
                                                key={indent.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-yellow-50 dark:bg-yellow-950/20"
                                            >
                                                <div className="space-y-3">
                                                    {/* Indent No */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Indent No.
                                                        </p>
                                                        <p className="font-semibold">
                                                            {indent.indentNo}
                                                        </p>
                                                    </div>

                                                    {/* Project */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Project
                                                        </p>
                                                        <p className="text-sm font-medium">{indent.project}</p>
                                                    </div>

                                                    {/* Date */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Date
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {new Date(indent.indentDate).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <Badge className="bg-yellow-600 hover:bg-yellow-700">
                                                            {indent.status}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    fetchMaterialIndentDetails(indent.id);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    handleEditMaterialIndent(indent.id);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rejected Material Indents Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Rejected Indents
                                </CardTitle>
                                <CardDescription>
                                    Material indents that were rejected
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingIndents ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                                            <p className="text-muted-foreground">
                                                Loading...
                                            </p>
                                        </div>
                                    </div>
                                ) : materialIndents.filter((i) => i.status === "REJECTED").length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                No rejected indents
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {materialIndents.filter((i) => i.status === "REJECTED").map((indent) => (
                                            <div
                                                key={indent.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50 dark:bg-red-950/20"
                                            >
                                                <div className="space-y-3">
                                                    {/* Indent No */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Indent No.
                                                        </p>
                                                        <p className="font-semibold">
                                                            {indent.indentNo}
                                                        </p>
                                                    </div>

                                                    {/* Project */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Project
                                                        </p>
                                                        <p className="text-sm font-medium">{indent.project}</p>
                                                    </div>

                                                    {/* Date */}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Date
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {new Date(indent.indentDate).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <Badge variant="destructive">
                                                            {indent.status}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    fetchMaterialIndentDetails(indent.id);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    handleEditMaterialIndent(indent.id);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="warehouse" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <EnhancedStatCard
                            title="Total Maintenance"
                            value={scheduleMaintenances.length.toString()}
                            icon={Calendar}
                            description="Scheduled maintenance tasks"
                            threshold={{
                                status: scheduleMaintenances.length > 0 ? "good" : "warning",
                                message:
                                    scheduleMaintenances.length > 0
                                        ? "Active maintenance schedule"
                                        : "No maintenance scheduled",
                            }}
                        />
                        <EnhancedStatCard
                            title="Overdue Tasks"
                            value={(() => {
                                const now = new Date();
                                const overdue = scheduleMaintenances.filter((m) => {
                                    const scheduledDate = new Date(m.scheduledDate);
                                    return scheduledDate < now;
                                });
                                return overdue.length.toString();
                            })()}
                            icon={AlertTriangle}
                            description="Past due maintenance"
                            threshold={{
                                status: (() => {
                                    const now = new Date();
                                    const overdue = scheduleMaintenances.filter((m) => {
                                        const scheduledDate = new Date(m.scheduledDate);
                                        return scheduledDate < now;
                                    });
                                    return overdue.length === 0
                                        ? "good"
                                        : overdue.length <= 2
                                            ? "warning"
                                            : "critical";
                                })(),
                                message: (() => {
                                    const now = new Date();
                                    const overdue = scheduleMaintenances.filter((m) => {
                                        const scheduledDate = new Date(m.scheduledDate);
                                        return scheduledDate < now;
                                    });
                                    return overdue.length === 0
                                        ? "All tasks on schedule"
                                        : `${overdue.length} task(s) overdue`;
                                })(),
                            }}
                        />
                        <EnhancedStatCard
                            title="High Priority"
                            value={(() => {
                                const highPriority = scheduleMaintenances.filter(
                                    (m) => m.Priority === "HIGH" || m.Priority === "CRITICAL"
                                );
                                return highPriority.length.toString();
                            })()}
                            icon={TrendingUp}
                            description="Critical & high priority"
                            threshold={{
                                status: (() => {
                                    const highPriority = scheduleMaintenances.filter(
                                        (m) => m.Priority === "HIGH" || m.Priority === "CRITICAL"
                                    );
                                    return highPriority.length === 0
                                        ? "good"
                                        : highPriority.length <= 3
                                            ? "warning"
                                            : "critical";
                                })(),
                                message: (() => {
                                    const highPriority = scheduleMaintenances.filter(
                                        (m) => m.Priority === "HIGH" || m.Priority === "CRITICAL"
                                    );
                                    return highPriority.length === 0
                                        ? "No urgent tasks"
                                        : `${highPriority.length} urgent task(s)`;
                                })(),
                            }}
                        />
                        <EnhancedStatCard
                            title="This Week"
                            value={(() => {
                                const now = new Date();
                                const weekFromNow = new Date(
                                    now.getTime() + 7 * 24 * 60 * 60 * 1000
                                );
                                const thisWeek = scheduleMaintenances.filter((m) => {
                                    const scheduledDate = new Date(m.scheduledDate);
                                    return scheduledDate >= now && scheduledDate <= weekFromNow;
                                });
                                return thisWeek.length.toString();
                            })()}
                            icon={Clock}
                            description="Due within 7 days"
                            threshold={{
                                status: "good",
                                message: (() => {
                                    const now = new Date();
                                    const weekFromNow = new Date(
                                        now.getTime() + 7 * 24 * 60 * 60 * 1000
                                    );
                                    const thisWeek = scheduleMaintenances.filter((m) => {
                                        const scheduledDate = new Date(m.scheduledDate);
                                        return scheduledDate >= now && scheduledDate <= weekFromNow;
                                    });
                                    return thisWeek.length === 0
                                        ? "No tasks this week"
                                        : "Upcoming maintenance";
                                })(),
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Equipment & Maintenance</CardTitle>
                                        <CardDescription>
                                            Warehouse equipment status and schedules
                                        </CardDescription>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => setIsScheduleMaintenanceOpen(true)}
                                        className="h-9"
                                    >
                                        <Calendar className="mr-1 md:mr-2 h-4 w-4" />
                                        <span className="hidden md:inline">
                                            Schedule Maintenance
                                        </span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {scheduleMaintenances.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                            <p>No maintenance schedules yet</p>
                                            <p className="text-sm">
                                                Click "Schedule Maintenance" to add one
                                            </p>
                                        </div>
                                    ) : (
                                        scheduleMaintenances.map((maintenance) => {
                                            const scheduledDate = new Date(maintenance.scheduledDate);
                                            const now = new Date();
                                            const daysUntil = Math.ceil(
                                                (scheduledDate.getTime() - now.getTime()) /
                                                (1000 * 3600 * 24)
                                            );
                                            const isOverdue = daysUntil < 0;
                                            const isDue = daysUntil <= 7 && daysUntil >= 0;

                                            return (
                                                <div
                                                    key={maintenance.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium">
                                                                {maintenance.equipmentName}
                                                            </h4>
                                                            <Badge
                                                                variant={
                                                                    maintenance.maintenanceType === "EMERGENCY"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {maintenance.maintenanceType}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Scheduled: {scheduledDate.toLocaleDateString()} at{" "}
                                                            {scheduledDate.toLocaleTimeString()}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Technician: {maintenance.technicianName} •{" "}
                                                            {maintenance.estimatedTime}h estimated
                                                        </p>
                                                        {maintenance.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {maintenance.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right mr-3">
                                                            <Badge
                                                                variant={
                                                                    isOverdue
                                                                        ? "destructive"
                                                                        : isDue
                                                                            ? "secondary"
                                                                            : "default"
                                                                }
                                                            >
                                                                {maintenance.Priority}
                                                            </Badge>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {isOverdue
                                                                    ? `${Math.abs(daysUntil)} days overdue`
                                                                    : isDue
                                                                        ? `${daysUntil} days left`
                                                                        : `${daysUntil} days left`}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingMaintenance(maintenance);
                                                                    maintenanceForm.reset({
                                                                        equipment: maintenance.equipmentName,
                                                                        maintenanceType:
                                                                            maintenance.maintenanceType.toLowerCase(),
                                                                        scheduledDate: new Date(
                                                                            maintenance.scheduledDate
                                                                        )
                                                                            .toISOString()
                                                                            .slice(0, 10),
                                                                        priority:
                                                                            maintenance.Priority.charAt(
                                                                                0
                                                                            ).toUpperCase() +
                                                                            maintenance.Priority.slice(
                                                                                1
                                                                            ).toLowerCase(),
                                                                        technician: maintenance.technicianName,
                                                                        estimatedDuration:
                                                                            maintenance.estimatedTime,
                                                                        description: maintenance.description,
                                                                        notes: maintenance.additionalNotes,
                                                                    });
                                                                    setIsScheduleMaintenanceOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        <Trash className="h-3 w-3" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            Delete Maintenance Schedule
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete the
                                                                            maintenance schedule for "
                                                                            {maintenance.equipmentName}"? This action
                                                                            cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                deleteScheduleMaintenance(
                                                                                    maintenance.id
                                                                                )
                                                                            }
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            disabled={isDeletingMaintenance}
                                                                        >
                                                                            {isDeletingMaintenance
                                                                                ? "Deleting..."
                                                                                : "Delete"}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Resolve Issues Dialog */}
            <Dialog open={isResolveIssuesOpen} onOpenChange={setIsResolveIssuesOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Critical Issues Resolution</DialogTitle>
                        <DialogDescription>
                            Review and take action on critical issues requiring immediate
                            attention
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {[
                            {
                                id: "ISS001",
                                title: "Material shortage",
                                priority: "high",
                                status: "open",
                                description:
                                    "Urgent steel reinforcement shortage affecting foundation work",
                            },
                            {
                                id: "ISS002",
                                title: "Equipment malfunction",
                                priority: "critical",
                                status: "open",
                                description: "Main crane hydraulic system failure",
                            },
                            {
                                id: "ISS003",
                                title: "Quality control failure",
                                priority: "high",
                                status: "open",
                                description:
                                    "Concrete mixture not meeting strength requirements",
                            },
                        ].map((issue) => (
                            <div key={issue.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium">{issue.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {issue.description}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            issue.priority === "critical" ? "destructive" : "default"
                                        }
                                    >
                                        {issue.priority}
                                    </Badge>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        toast.success(`Issue ${issue.id} marked for resolution`);
                                    }}
                                >
                                    Start Resolution
                                </Button>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsResolveIssuesOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Track Materials Dialog */}
            <Dialog
                open={isTrackMaterialsOpen}
                onOpenChange={setIsTrackMaterialsOpen}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Material Tracking</DialogTitle>
                        <DialogDescription>
                            Monitor delayed materials and their current status
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {[
                            {
                                id: "MAT001",
                                name: "Steel Bars",
                                delay: "2 days",
                                supplier: "Steel Corp",
                                status: "In Transit",
                            },
                            {
                                id: "MAT002",
                                name: "Cement Bags",
                                delay: "1 day",
                                supplier: "Cement Ltd",
                                status: "Processing",
                            },
                            {
                                id: "MAT003",
                                name: "Electrical Cables",
                                delay: "3 days",
                                supplier: "Electric Co",
                                status: "Delayed",
                            },
                        ].map((material) => (
                            <div key={material.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium">{material.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Supplier: {material.supplier}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            material.status === "Delayed" ? "destructive" : "default"
                                        }
                                    >
                                        {material.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-red-600 mb-2">
                                    Delayed by: {material.delay}
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        toast.success(
                                            `Expedited delivery request sent for ${material.name}`
                                        );
                                    }}
                                >
                                    Expedite Delivery
                                </Button>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsTrackMaterialsOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Schedule Dialog */}
            <Dialog open={isViewScheduleOpen} onOpenChange={setIsViewScheduleOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Labor Schedule</DialogTitle>
                        <DialogDescription>
                            Review workforce allocation and shift schedules
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {[
                            {
                                id: "W001",
                                name: "John Doe",
                                role: "Mason",
                                shift: "Morning",
                                location: "Block A",
                            },
                            {
                                id: "W002",
                                name: "Jane Smith",
                                role: "Electrician",
                                shift: "Morning",
                                location: "Block B",
                            },
                            {
                                id: "W003",
                                name: "Mike Johnson",
                                role: "Plumber",
                                shift: "Afternoon",
                                location: "Block A",
                            },
                        ].map((worker) => (
                            <div key={worker.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium">{worker.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {worker.role}
                                        </p>
                                    </div>
                                    <Badge>{worker.shift}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Location: {worker.location}
                                </p>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsViewScheduleOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Progress Dialog */}
            <Dialog
                open={isReviewProgressOpen}
                onOpenChange={setIsReviewProgressOpen}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Milestone Progress Review</DialogTitle>
                        <DialogDescription>
                            Track project milestones and their completion status
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {[
                            {
                                id: "M001",
                                name: "Foundation Work",
                                progress: 100,
                                dueDate: "2024-01-25",
                                status: "Completed",
                            },
                            {
                                id: "M002",
                                name: "Steel Framework",
                                progress: 75,
                                dueDate: "2024-01-30",
                                status: "In Progress",
                            },
                        ].map((milestone) => (
                            <div key={milestone.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium">{milestone.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Due: {milestone.dueDate}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            milestone.status === "Completed" ? "default" : "secondary"
                                        }
                                    >
                                        {milestone.status}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{milestone.progress}%</span>
                                    </div>
                                    <Progress value={milestone.progress} className="h-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsReviewProgressOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Schedule Maintenance Dialog */}
            <Dialog
                open={isScheduleMaintenanceOpen}
                onOpenChange={setIsScheduleMaintenanceOpen}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMaintenance
                                ? "Edit Equipment Maintenance"
                                : "Schedule Equipment Maintenance"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMaintenance
                                ? "Update the maintenance schedule for warehouse equipment"
                                : "Schedule maintenance for warehouse equipment to ensure optimal operation"}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...maintenanceForm}>
                        <form
                            onSubmit={maintenanceForm.handleSubmit(async (data) => {
                                try {
                                    if (editingMaintenance) {
                                        await updateScheduleMaintenance(
                                            editingMaintenance.id,
                                            data
                                        );
                                    } else {
                                        await createScheduleMaintenance(data);
                                    }
                                    setIsScheduleMaintenanceOpen(false);
                                    setIsEditMaintenanceOpen(false);
                                    setEditingMaintenance(null);
                                    maintenanceForm.reset();
                                } catch (error) {
                                    // Error handling is done in the API functions
                                }
                            })}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={maintenanceForm.control}
                                    name="equipment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Equipment</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter equipment name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={maintenanceForm.control}
                                    name="maintenanceType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maintenance Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="preventive">Preventive</SelectItem>
                                                    <SelectItem value="corrective">Corrective</SelectItem>
                                                    <SelectItem value="emergency">Emergency</SelectItem>
                                                    <SelectItem value="inspection">Inspection</SelectItem>
                                                    <SelectItem value="calibration">
                                                        Calibration
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={maintenanceForm.control}
                                    name="scheduledDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Scheduled Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                // min={new Date().toISOString().slice(0, 10)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={maintenanceForm.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                    <SelectItem value="Critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={maintenanceForm.control}
                                    name="technician"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assigned Technician</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter technician name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={maintenanceForm.control}
                                    name="estimatedDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Duration (hours)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="24"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={maintenanceForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maintenance Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Brief description of maintenance work"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={maintenanceForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Additional Notes</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Any additional information or special requirements"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsScheduleMaintenanceOpen(false);
                                        setIsEditMaintenanceOpen(false);
                                        setEditingMaintenance(null);
                                        maintenanceForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingMaintenance
                                        ? "Update Maintenance"
                                        : "Schedule Maintenance"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Material Indent Dialog */}
            <Dialog
                open={isAddMaterialIndentOpen}
                onOpenChange={setIsAddMaterialIndentOpen}
            >
                <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[93vw]">
                    <DialogHeader>
                        <DialogTitle>Create Material Indane</DialogTitle>
                        <DialogDescription>
                            Create a new material indane request form
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...materialIndentForm}>
                        <form
                            onSubmit={materialIndentForm.handleSubmit(async (data) => {
                                try {
                                    if (!user?.id) {
                                        toast.error("User not authenticated. Please log in.");
                                        return;
                                    }

                                    const token =
                                        sessionStorage.getItem("jwt_token") ||
                                        localStorage.getItem("jwt_token_backup");
                                    const headers = token
                                        ? { Authorization: `Bearer ${token}` }
                                        : {};

                                    // Step 1: Create the Material Indane
                                    const createResponse = await axios.post(
                                        `${API_URL}/material-indane/indanes`,
                                        {
                                            orderSlipNo: data.orderSlipNo,
                                            site: data.site,
                                            date: data.date,
                                            storeKeeperName: data.storeKeeperName,
                                            projectManagerName: data.projectManagerName,
                                            items: data.items,
                                        },
                                        { headers }
                                    );

                                    const indaneId = createResponse.data.id;

                                    // Step 2: Upload store keeper signature if provided
                                    if (data.storeKeeperSignature) {
                                        const sigFormData = new FormData();
                                        sigFormData.append("file", data.storeKeeperSignature);

                                        await axios.post(
                                            `${API_URL}/material-indane/indanes/${indaneId}/upload/store-keeper-signature`,
                                            sigFormData,
                                            {
                                                headers: {
                                                    ...headers,
                                                    "Content-Type": "multipart/form-data",
                                                },
                                            }
                                        );
                                    }

                                    // Step 3: Upload project manager signature if provided
                                    if (data.projectManagerSignature) {
                                        const pmSigFormData = new FormData();
                                        pmSigFormData.append("file", data.projectManagerSignature);

                                        await axios.post(
                                            `${API_URL}/material-indane/indanes/${indaneId}/upload/project-manager-signature`,
                                            pmSigFormData,
                                            {
                                                headers: {
                                                    ...headers,
                                                    "Content-Type": "multipart/form-data",
                                                },
                                            }
                                        );
                                    }

                                    // Refresh the material indents list
                                    const listResponse = await axios.get(
                                        `${API_URL}/material-indane/indanes`,
                                        { headers }
                                    );
                                    setMaterialIndents(listResponse.data);

                                    toast.success("Material indane created successfully");
                                    setIsAddMaterialIndentOpen(false);
                                    materialIndentForm.reset();
                                } catch (error) {
                                    toast.error("Failed to create material indane");
                                    console.error("Error creating material indane:", error);
                                }
                            })}
                            className="space-y-6"
                        >
                            {/* Company Details - Row 1 */}
                            <div className="border-2 border-black p-4 space-y-2">
                                <h3 className="font-bold text-center text-lg">
                                    Company Details
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="companyName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">
                                                    Company Name (Default if empty)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="RAJ TRIMURTY INFRAPROJECTS PVT LTD"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="companyAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">
                                                    Company Address (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="SOUTH CITY BUSINESS PARK, 770 ANANDAPUR"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="companyCity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">
                                                    Company City (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="KOLKATA" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="companyPostalCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">
                                                    Company Postal Code (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="107" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={materialIndentForm.control}
                                    name="headerText"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">
                                                Header Text (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Dear sir, Please Arrange Required Material For SITE WORK, Urgent Basis."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Header Section - Row 1 */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b pb-4">
                                <FormField
                                    control={materialIndentForm.control}
                                    name="orderSlipNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Order Slip No.</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., OS-001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={materialIndentForm.control}
                                    name="site"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Site</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Site name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={materialIndentForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Store Keeper and Project Manager Details */}
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <FormField
                                    control={materialIndentForm.control}
                                    name="storeKeeperName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store Keeper Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Store Keeper name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={materialIndentForm.control}
                                    name="projectManagerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Manager Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Project Manager name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Items Table */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Schedule / Items</h3>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const currentItems =
                                                materialIndentForm.getValues("items");
                                            const nextSlNo = currentItems.length + 1;
                                            materialIndentForm.setValue("items", [
                                                ...currentItems,
                                                {
                                                    slNo: nextSlNo,
                                                    dateOfOrder: "",
                                                    materialDescription: "",
                                                    unit: "",
                                                    requiredQty: 0,
                                                    receivedQty: 0,
                                                    balance: 0,
                                                    deliveryDate: "",
                                                    remarks: "",
                                                },
                                            ]);
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </Button>
                                </div>

                                <div className="border rounded-lg overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted">
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    SL NO
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    DATE OF ORDER
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    MATERIAL DESCRIPTION
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    UNIT
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    REQUIRED QTY
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    RECEIVED QTY
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    BALANCE
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    DELIVERY DATE
                                                </th>
                                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                    REMARKS
                                                </th>
                                                <th className="px-3 py-2 text-center font-semibold whitespace-nowrap">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {materialIndentForm.watch("items").map((item, index) => (
                                                <tr key={index} className="border-b hover:bg-muted/50">
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.slNo`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    size={1}
                                                                    placeholder="#"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            parseInt(e.target.value) || 0
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.dateOfOrder`}
                                                            render={({ field }) => (
                                                                <Input type="date" {...field} />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.materialDescription`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    placeholder="Material description"
                                                                    {...field}
                                                                />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.unit`}
                                                            render={({ field }) => (
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field.value}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Unit" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="PIECE">Piece</SelectItem>
                                                                        <SelectItem value="KILOGRAM">Kg</SelectItem>
                                                                        <SelectItem value="TONNE">Tonne</SelectItem>
                                                                        <SelectItem value="LITRE">Litre</SelectItem>
                                                                        <SelectItem value="SQUARE_METRE">
                                                                            Sqm
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.requiredQty`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            parseFloat(e.target.value) || 0
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.receivedQty`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            parseFloat(e.target.value) || 0
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.balance`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            parseFloat(e.target.value) || 0
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.deliveryDate`}
                                                            render={({ field }) => (
                                                                <Input type="date" {...field} />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <FormField
                                                            control={materialIndentForm.control}
                                                            name={`items.${index}.remarks`}
                                                            render={({ field }) => (
                                                                <Input placeholder="Remarks" {...field} />
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                const items =
                                                                    materialIndentForm.getValues("items");
                                                                materialIndentForm.setValue(
                                                                    "items",
                                                                    items.filter((_, i) => i !== index)
                                                                );
                                                            }}
                                                        >
                                                            <Trash className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Signature Section */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-4">Signatures</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="storeKeeperSignature"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Signature of Store Keeper</FormLabel>
                                                <FormControl>
                                                    <div className="flex flex-col gap-2">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                field.onChange(file);
                                                            }}
                                                        />
                                                        {field.value && (
                                                            <div className="text-sm text-green-600">
                                                                ✓ {(field.value as File).name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    Upload a picture of the store keeper's signature (JPG,
                                                    PNG, GIF)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="projectManagerSignature"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Signature of Project Manager</FormLabel>
                                                <FormControl>
                                                    <div className="flex flex-col gap-2">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                field.onChange(file);
                                                            }}
                                                        />
                                                        {field.value && (
                                                            <div className="text-sm text-green-600">
                                                                ✓ {(field.value as File).name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    Upload a picture of the project manager's signature
                                                    (JPG, PNG, GIF)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddMaterialIndentOpen(false);
                                        materialIndentForm.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create Indane</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* View Material Indent Modal */}
            <Dialog
                open={isViewMaterialIndentOpen}
                onOpenChange={(open) => {
                    setIsViewMaterialIndentOpen(open);
                    if (!open) {
                        setSelectedMaterialIndent(null);
                    }
                }}
            >
                <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[93vw]">
                    <DialogHeader>
                        <DialogTitle>Material Indent Details</DialogTitle>
                        <DialogDescription>
                            Complete view of material indent request
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingIndentDetails && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading indent details...</p>
                            </div>
                        </div>
                    )}

                    {!isLoadingIndentDetails && !selectedMaterialIndent && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-muted-foreground">
                                    No data available
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedMaterialIndent && !isLoadingIndentDetails && (
                        <div className="space-y-6">

                            {/* Header Info - Row 1 */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b">
                                <div>
                                    <p className="text-xs text-muted-foreground">Order Slip No.</p>
                                    <p className="font-semibold text-lg">
                                        {selectedMaterialIndent.orderSlipNo}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Site</p>
                                    <p className="font-semibold">
                                        {selectedMaterialIndent.site}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                    <p className="font-semibold">
                                        {new Date(selectedMaterialIndent.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Store Keeper and Project Manager Info */}
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Store Keeper Name
                                    </p>
                                    <p className="font-medium">
                                        {selectedMaterialIndent.storeKeeperName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Project Manager Name
                                    </p>
                                    <p className="font-medium">
                                        {selectedMaterialIndent.projectManagerName}
                                    </p>
                                </div>
                            </div>

                            {/* Items Table */}
                            {selectedMaterialIndent.items &&
                                selectedMaterialIndent.items.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold">Schedule / Items</h3>
                                        <div className="border rounded-lg overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted">
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            SL NO
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            DATE OF ORDER
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            MATERIAL DESCRIPTION
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            UNIT
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            REQUIRED QTY
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            RECEIVED QTY
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            BALANCE
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            DELIVERY DATE
                                                        </th>
                                                        <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                            REMARKS
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedMaterialIndent.items.map(
                                                        (item: any, idx: number) => (
                                                            <tr key={idx} className="border-b">
                                                                <td className="px-3 py-2">{item.slNo}</td>
                                                                <td className="px-3 py-2">
                                                                    {item.dateOfOrder
                                                                        ? new Date(
                                                                            item.dateOfOrder
                                                                        ).toLocaleDateString()
                                                                        : "-"}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {item.materialDescription}
                                                                </td>
                                                                <td className="px-3 py-2">{item.unit}</td>
                                                                <td className="px-3 py-2">
                                                                    {item.requiredQty}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {item.receivedQty}
                                                                </td>
                                                                <td className="px-3 py-2">{item.balance}</td>
                                                                <td className="px-3 py-2">
                                                                    {item.deliveryDate
                                                                        ? new Date(
                                                                            item.deliveryDate
                                                                        ).toLocaleDateString()
                                                                        : "-"}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {item.remarks || "-"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            {/* Signatures Section */}
                            {(selectedMaterialIndent.storeKeeperSignature ||
                                selectedMaterialIndent.projectManagerSignature) && (
                                    <div className="border-t pt-4 space-y-4">
                                        <h3 className="font-semibold">Signatures</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedMaterialIndent.storeKeeperSignature && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Store Keeper Signature
                                                    </p>
                                                    <img
                                                        src={selectedMaterialIndent.storeKeeperSignature}
                                                        alt="Store Keeper Signature"
                                                        className="max-w-full h-auto border rounded"
                                                    />
                                                </div>
                                            )}
                                            {selectedMaterialIndent.projectManagerSignature && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        Project Manager Signature
                                                    </p>
                                                    <img
                                                        src={selectedMaterialIndent.projectManagerSignature}
                                                        alt="Project Manager Signature"
                                                        className="max-w-full h-auto border rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-xs text-muted-foreground">Created By</p>
                                    <p className="font-medium">
                                        {selectedMaterialIndent.createdBy?.name ||
                                            selectedMaterialIndent.createdBy ||
                                            "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Created Date</p>
                                    <p className="font-medium">
                                        {selectedMaterialIndent.createdAt
                                            ? new Date(
                                                selectedMaterialIndent.createdAt
                                            ).toLocaleDateString()
                                            : selectedMaterialIndent.createdDate
                                                ? new Date(
                                                    selectedMaterialIndent.createdDate
                                                ).toLocaleDateString()
                                                : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Debug: Show raw data */}


                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsViewMaterialIndentOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Material Indent Dialog */}
            <Dialog
                open={isEditMaterialIndentOpen}
                onOpenChange={setIsEditMaterialIndentOpen}
            >
                <DialogContent className="max-w-full max-h-[95vh] overflow-y-auto w-[98vw]">
                    <DialogHeader>
                        <DialogTitle>Edit Material Indane</DialogTitle>
                        <DialogDescription>
                            Update material indane request form
                        </DialogDescription>
                    </DialogHeader>
                    {editingMaterialIndent && (
                        <Form {...materialIndentForm}>
                            <form
                                onSubmit={materialIndentForm.handleSubmit(
                                    async (data) => {
                                        console.log("Form submitted with data:", data);
                                        try {
                                            await updateMaterialIndent(editingMaterialIndent.id, data);
                                        } catch (error) {
                                            console.error("Error updating material indane:", error);
                                        }
                                    },
                                    (errors) => {
                                        console.error("Form validation errors:", errors);
                                    }
                                )}
                                className="space-y-6"
                            >
                                {/* Company Details - Row 1 */}
                                <div className="border-2 border-black p-4 space-y-2">
                                    <h3 className="font-bold text-center text-lg">
                                        Company Details
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <FormField
                                            control={materialIndentForm.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">
                                                        Company Name (Default if empty)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="RAJ TRIMURTY INFRAPROJECTS PVT LTD"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={materialIndentForm.control}
                                            name="companyAddress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">
                                                        Company Address (Optional)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="SOUTH CITY BUSINESS PARK, 770 ANANDAPUR"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={materialIndentForm.control}
                                            name="companyCity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">
                                                        Company City (Optional)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="KOLKATA" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={materialIndentForm.control}
                                            name="companyPostalCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">
                                                        Company Postal Code (Optional)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="107" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="headerText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm">
                                                    Header Text (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Dear sir, Please Arrange Required Material For SITE WORK, Urgent Basis."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Header Section - Row 1 */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b pb-4">
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="orderSlipNo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Order Slip No.</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., OS-001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="site"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Site</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Site A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={materialIndentForm.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Signatures Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                                    <div>
                                        <FormField
                                            control={materialIndentForm.control}
                                            name="storeKeeperName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Store Keeper Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={materialIndentForm.control}
                                            name="projectManagerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Manager Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Items Section */}
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-4">Items</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border">
                                            <thead>
                                                <tr className="bg-muted">
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        SL NO
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        DATE OF ORDER
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        MATERIAL DESCRIPTION
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        UNIT
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        REQUIRED QTY
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        RECEIVED QTY
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        BALANCE
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        DELIVERY DATE
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                                        REMARKS
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-semibold whitespace-nowrap">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materialIndentForm.watch("items").map((item, index) => (
                                                    <tr key={index} className="border-b hover:bg-muted/50">
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.slNo`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        type="number"
                                                                        size={1}
                                                                        placeholder="#"
                                                                        {...field}
                                                                        onChange={(e) =>
                                                                            field.onChange(
                                                                                parseInt(e.target.value) || 0
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.dateOfOrder`}
                                                                render={({ field }) => (
                                                                    <Input type="date" {...field} />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.materialDescription`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        placeholder="Material description"
                                                                        {...field}
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.unit`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        placeholder="Unit"
                                                                        {...field}
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.requiredQty`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        {...field}
                                                                        onChange={(e) =>
                                                                            field.onChange(
                                                                                parseFloat(e.target.value) || 0
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.receivedQty`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        {...field}
                                                                        onChange={(e) =>
                                                                            field.onChange(
                                                                                parseFloat(e.target.value) || 0
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.balance`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        {...field}
                                                                        onChange={(e) =>
                                                                            field.onChange(
                                                                                parseFloat(e.target.value) || 0
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.deliveryDate`}
                                                                render={({ field }) => (
                                                                    <Input type="date" {...field} />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <FormField
                                                                control={materialIndentForm.control}
                                                                name={`items.${index}.remarks`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        placeholder="Remarks"
                                                                        {...field}
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    const items =
                                                                        materialIndentForm.getValues("items");
                                                                    materialIndentForm.setValue(
                                                                        "items",
                                                                        items.filter((_, i) => i !== index)
                                                                    );
                                                                }}
                                                            >
                                                                <Trash className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                        onClick={() => {
                                            const items = materialIndentForm.getValues("items");
                                            materialIndentForm.setValue("items", [
                                                ...items,
                                                {
                                                    slNo: items.length + 1,
                                                    dateOfOrder: "",
                                                    materialDescription: "",
                                                    unit: "",
                                                    requiredQty: 0,
                                                    receivedQty: 0,
                                                    balance: 0,
                                                    deliveryDate: "",
                                                    remarks: "",
                                                },
                                            ]);
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Item
                                    </Button>
                                </div>

                                {/* Signature Section */}
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-4">Signatures</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={materialIndentForm.control}
                                            name="storeKeeperSignature"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Signature of Store Keeper</FormLabel>
                                                    <FormControl>
                                                        <div className="flex flex-col gap-2">
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    field.onChange(file);
                                                                }}
                                                            />
                                                            {field.value && (
                                                                <div className="text-sm text-green-600">
                                                                    ✓ {(field.value as File).name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={materialIndentForm.control}
                                            name="projectManagerSignature"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Signature of Project Manager</FormLabel>
                                                    <FormControl>
                                                        <div className="flex flex-col gap-2">
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    field.onChange(file);
                                                                }}
                                                            />
                                                            {field.value && (
                                                                <div className="text-sm text-green-600">
                                                                    ✓ {(field.value as File).name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            console.log("Cancel clicked");
                                            setIsEditMaterialIndentOpen(false);
                                            setEditingMaterialIndent(null);
                                            materialIndentForm.reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={async () => {
                                            console.log("Update button clicked");
                                            try {
                                                const isValid = await materialIndentForm.trigger();
                                                console.log("Form is valid:", isValid);
                                                if (isValid) {
                                                    const data = materialIndentForm.getValues();
                                                    console.log("Form data:", data);
                                                    await updateMaterialIndent(editingMaterialIndent.id, data);
                                                } else {
                                                    const errors = materialIndentForm.formState.errors;
                                                    console.error("Form validation errors:", errors);
                                                    toast.error("Please fix validation errors");
                                                }
                                            } catch (error) {
                                                console.error("Error during update:", error);
                                            }
                                        }}
                                    >
                                        Update Indane
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Transfer Modal */}
            <Dialog open={isApproveTransferModalOpen} onOpenChange={setIsApproveTransferModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Approve Material Transfer</DialogTitle>
                        <DialogDescription>
                            Review and approve the material transfer request
                        </DialogDescription>
                    </DialogHeader>

                    {transferToApprove && (
                        <div className="space-y-6">
                            {/* Transfer Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transfer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Transfer ID</Label>
                                            <p className="font-semibold">{transferToApprove.transferID || transferToApprove.id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Status</Label>
                                            <p className="font-semibold">{transferToApprove.status || "PENDING"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">From Location</Label>
                                            <p className="font-semibold">{transferToApprove.fromLocation}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">To Location</Label>
                                            <p className="font-semibold">{transferToApprove.toLocation}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Requested By</Label>
                                            <p className="font-semibold">{transferToApprove.createdBy?.name || "-"}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Requested Date</Label>
                                            <p className="font-semibold">
                                                {transferToApprove.requestedDate
                                                    ? new Date(transferToApprove.requestedDate).toLocaleDateString()
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                    {transferToApprove.notes && (
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Notes</Label>
                                            <p className="font-semibold">{transferToApprove.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Items List */}
                            {transferToApprove.items && Array.isArray(transferToApprove.items) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Items to Transfer</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {transferToApprove.items.map((item: any, index: number) => (
                                                <div key={index} className="border rounded-lg p-3 bg-muted/50">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Description</Label>
                                                            <p className="font-semibold text-sm">{item.description || item.itemName || "-"}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Quantity</Label>
                                                            <p className="font-semibold text-sm">{item.quantity} {item.unit || ""}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Status</Label>
                                                            <Badge variant="outline">{item.status || "PENDING"}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Additional Info */}
                            {transferToApprove.vehicle && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Vehicle Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Vehicle Name</Label>
                                                <p className="font-semibold">{transferToApprove.vehicle.vehicleName || "-"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Registration Number</Label>
                                                <p className="font-semibold">{transferToApprove.vehicle.registrationNumber || "-"}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {transferToApprove.driverName && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Driver Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm text-muted-foreground">Driver Name</Label>
                                                <p className="font-semibold">{transferToApprove.driverName}</p>
                                            </div>
                                            {transferToApprove.etaMinutes && (
                                                <div>
                                                    <Label className="text-sm text-muted-foreground">ETA</Label>
                                                    <p className="font-semibold">{(transferToApprove.etaMinutes / 60).toFixed(1)} hrs</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsApproveTransferModalOpen(false);
                                setTransferToApprove(null);
                            }}
                            disabled={isApprovingTransfer}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (transferToApprove) {
                                    handleApproveTransferFinal(transferToApprove);
                                }
                            }}
                            disabled={isApprovingTransfer}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isApprovingTransfer ? "Approving..." : "Approve Transfer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const Inventory = () => {
    return (
        <PageUserFilterProvider allowedRoles={["store", "project"]}>
            <InventoryContent />
        </PageUserFilterProvider>
    );
};

export default Inventory;
