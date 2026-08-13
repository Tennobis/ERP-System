import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Package, TrendingUp, AlertTriangle, Clock, Plus } from "lucide-react";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { ExpandableDataTable } from "@/components/expandable-data-table";
import type { InventoryItem as InventoryItemType } from "@/types/dummy-data-types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithOtherFormField } from "@/components/ui/select-with-other";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Local type to be safe if fields differ
interface InventoryItem {
    itemName: string;
    maximumStock: number;
    itemQuality: string;
    id: string;
    name: string;
    category: string | string[];
    type: string;
    quantity: number;
    unit: string;
    location: string;
    lastUpdated: string;
    maxStock?: number;
    safetyStock?: number;
    unitCost?: number;
}

// Very loose shape for material requests to keep UI resilient to backend changes
interface MaterialRequest {
    id: string;
    status?: string;
    createdAt?: string;
    targetWarehouse?: string;
    requestedBy?: { id?: string; name?: string } | string;
    items?: Array<{ id?: string; name?: string; quantity?: number; uom?: string }>;
}

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
    { value: "OTHER", label: "Other"}
];

// Match Item enum from Inventory page
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
    
    { value: "OTHER", label: "Other" },
];

const INVENTORY_TYPE_OPTIONS = [
    { value: "OLD", label: "Old" },
    { value: "NEW", label: "New" },
];

const WarehouseDashboard = () => {
    const { user } = useUser();
    const userID = user?.id || "";

    const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
    const [isReqLoading, setIsReqLoading] = useState(true);

    // Add Item Modal State
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);

    // Add Warehouse Item Modal State
    const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);

    const [currentView, setCurrentView] = useState<'all' | 'old' | 'new' | 'lowstock' | 'value'>('all');
    const [filteredItems, setFilteredItems] = useState<InventoryItemType[]>([]);

    // State for rejection reason modal
    const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string>("");
    const [isProcessingRequest, setIsProcessingRequest] = useState(false);

    useEffect(() => {
        let filtered: InventoryItemType[] = inventoryItems;

        switch (currentView) {
            case 'old':
                filtered = inventoryItems.filter(item => item.type === 'OLD');
                break;
            case 'new':
                filtered = inventoryItems.filter(item => item.type === 'NEW');
                break;
            case 'lowstock':
                filtered = inventoryItems.filter(item => (item.quantity || 0) <= (item.safetyStock || 50));
                break;
            case 'value':
                filtered = [...inventoryItems].sort((a, b) => ((b.unitCost || 0) * (b.quantity || 0)) - ((a.unitCost || 0) * (a.quantity || 0)));
                break;
            default:
                filtered = inventoryItems;
        }

        setFilteredItems(filtered);
    }, [inventoryItems, currentView]);

    // Form setup similar to Inventory page to keep fields consistent with backend
    const form = useForm<{
        name: string;
        category: string;
        type: string;
        quantity: number;
        unit: string;
        location: string;
        maxStock: number;
        safetyStock: number;
        primarySupplier: string;
        secondarySupplier?: string;
        unitCost: number;
    }>({
        defaultValues: {
            name: "",
            category: "",
            type: "",
            quantity: 0,
            unit: "",
            location: "",
            maxStock: 0,
            safetyStock: 0,
            primarySupplier: "",
            secondarySupplier: "",
            unitCost: 0,
        },
    });

    // Warehouse form for Warehouse model schema
    const warehouseForm = useForm<{
        itemName: string;
        itemNameOther?: string;
        category: string; // InventoryCategory enum value
        type: string;
        quantity: number;
        unit: string; // Unit enum value
        location: string;
        maximumStock: number;
        safetyStock: number;
        unitCost: number;
        itemQuality: string; // ItemQuality enum value
    }>({
        defaultValues: {
            itemName: "",
            itemNameOther: "",
            category: "",
            type: "",
            quantity: 0,
            unit: "",
            location: "",
            maximumStock: 0,
            safetyStock: 0,
            unitCost: 0,
            itemQuality: "GOOD",
        },
    });

    // Delete confirmation dialog state
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Warehouse Modal State
    const [isEditWarehouseOpen, setIsEditWarehouseOpen] = useState(false);
    const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);

    // Refresh helper
    const refreshWarehouses = async () => {
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint = `${API_URL}/warehouse`;
            const itemsResponse = await axios.get(endpoint, { headers });
            setInventoryItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
        } catch (err) {
            console.error("Failed to refresh inventory items", err);
        }
    };

    // Open edit with row data prefilled
    const handleEdit = (row: any) => {
        setEditingWarehouseId(row.id);
        const itemNameValue = row.itemName || row.name || "";
        const predefinedItems = ITEM_OPTIONS.map(opt => opt.value);
        const isCustomItem = itemNameValue && !predefinedItems.includes(itemNameValue);
        warehouseForm.reset({
            itemName: isCustomItem ? "OTHER" : itemNameValue,
            itemNameOther: isCustomItem ? itemNameValue : "",
            category: Array.isArray(row.category) ? (row.category[0] || "") : (row.category || ""),
            type: row.type || "OLD",
            quantity: Number(row.quantity) || 0,
            unit: row.unit || "",
            location: row.location || "",
    
            maximumStock: Number(row.maximumStock ?? row.maxStock ?? 0),
            safetyStock: Number(row.safetyStock) || 0,
            unitCost: Number(row.unitCost) || 0,
            itemQuality: row.itemQuality || "GOOD",
        });
        setIsEditWarehouseOpen(true);
    };

    // Delete warehouse item
    const handleDeleteItem = async (item: InventoryItem) => {
        setIsDeleting(true);
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`${API_URL}/warehouse/${item.id}`, { headers });
            toast.success("Item deleted successfully");
            setItemToDelete(null);
            await refreshWarehouses();
        } catch (error: any) {
            console.error("Failed to delete item:", error);
            const msg = error?.response?.data?.error || error?.message || "Failed to delete item";
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    // Update submit
    const onSubmitUpdateWarehouse = async (values: any) => {
        if (!editingWarehouseId) return;
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

            const payload = {
                itemName: values.itemName === "OTHER" ? (values.itemNameOther || "") : values.itemName,
                category: values.category,
                type: values.type,
                quantity: Number(values.quantity) || 0,
                unit: values.unit,
                location: values.location,
                maximumStock: Number(values.maximumStock) || 0,
                safetyStock: Number(values.safetyStock) || 0,
                unitCost: Number(values.unitCost) || 0,
                itemQuality: values.itemQuality,
            };

            await axios.put(`${API_URL}/warehouse/${editingWarehouseId}`, payload, { headers });

            toast.success("Item updated successfully");
            setIsEditWarehouseOpen(false);
            setEditingWarehouseId(null);
            await refreshWarehouses();
        } catch (error: any) {
            console.error("Failed to update item:", error);
            const msg = error?.response?.data?.error || error?.message || "Failed to update item";
            toast.error(msg);
        }
    };

    useEffect(() => {
        const fetchWarehouseData = async () => {
            if (!userID) return;
            setIsLoading(true);
            try {
                const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const endpoint = `${API_URL}/warehouse`;
                const itemsResponse = await axios.get(endpoint, { headers });
                setInventoryItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
            } catch (err) {
                console.error("Failed to fetch inventory items", err);
                setInventoryItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchMaterialRequests = async () => {
            if (!userID) return;
            setIsReqLoading(true);
            try {
                const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const isAdmin = user?.role === "admin" || user?.role === "md";
                const endpoint = isAdmin
                    ? `${API_URL}/material/material-requests`
                    : `${API_URL}/material/material-requests/user/${userID}`;
                const res = await axios.get(endpoint, { headers });
                setMaterialRequests(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch material requests", err);
                setMaterialRequests([]);
            } finally {
                setIsReqLoading(false);
            }
        };

        fetchWarehouseData();
        fetchMaterialRequests();
    }, [userID]);

    // Derived stats
    const totalItems = inventoryItems.length;
    const totalValue = useMemo(
        () => inventoryItems.reduce((sum, it) => sum + (it.unitCost || 0) * (it.quantity || 0), 0),
        [inventoryItems]
    );
    const lowStockCount = useMemo(
        () => inventoryItems.filter((it) => (it.quantity || 0) <= (it.safetyStock || 50)).length,
        [inventoryItems]
    );
    const uniqueCategoryCount = useMemo(() => {
        const set = new Set<string>();
        for (const it of inventoryItems) {
            if (Array.isArray(it.category)) it.category.forEach((c) => set.add(String(c)));
            else if (it.category) set.add(String(it.category));
        }
        return set.size;
    }, [inventoryItems]);

    // Dynamic filters
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

    // Submit handler to create a new inventory item
    const onSubmitAddItem = async (values: any) => {
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

            // Map UI fields to backend expected payload
            const payload = {
                itemName: values.name,
                category: values.category, // should be enum value like in Inventory page
                type: values.type, // should be enum value like in Inventory page
                quantity: Number(values.quantity) || 0,
                unit: values.unit, // enum
                location: values.location,
                maximumStock: Number(values.maxStock) || 0,
                safetyStock: Number(values.safetyStock) || 0,
                primarySupplierName: values.primarySupplier,
                vendorId: "", // optional for now unless you want to select a vendor ID
                secondarySupplierName: values.secondarySupplier || undefined,
                unitCost: Math.round((Number(values.unitCost) || 0) * 100), // cents
                createdById: userID,
            };

            const res = await axios.post(`${API_URL}/inventory/items`, payload, { headers });

            // Refresh items list with the new item structure already returned by backend
            await (async () => {
                const endpoint = `${API_URL}/warehouse`;
                const itemsResponse = await axios.get(endpoint, { headers });
                setInventoryItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
            })();

            toast.success("Item added successfully");
            setIsAddItemOpen(false);
            form.reset();
        } catch (error: any) {
            console.error("Failed to add item:", error);
            const msg = error?.response?.data?.error || error?.message || "Failed to add item";
            toast.error(msg);
        }
    };

    // Handler to approve (move to in progress) material request
    const handleApproveMaterialRequest = async (requestId: string) => {
        setIsProcessingRequest(true);
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.post(`${API_URL}/material/material-requests/${requestId}/approve`, {}, { headers });

            toast.success("Material request approved and moved to in-progress");
            // Refresh material requests
            const res = await axios.get(
                user?.role === "admin" || user?.role === "md"
                    ? `${API_URL}/material/material-requests`
                    : `${API_URL}/material/material-requests/user/${userID}`,
                { headers }
            );
            setMaterialRequests(Array.isArray(res.data) ? res.data : []);
        } catch (error: any) {
            console.error("Failed to approve material request:", error);
            const msg = error?.response?.data?.error || error?.message || "Failed to approve request";
            toast.error(msg);
        } finally {
            setIsProcessingRequest(false);
        }
    };

    // Handler to reject material request
    const handleRejectMaterialRequest = async (requestId: string) => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setIsProcessingRequest(true);
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.post(
                `${API_URL}/material/material-requests/${requestId}/reject`,
                { rejectionReason },
                { headers }
            );

            toast.success("Material request rejected");
            setRejectingRequestId(null);
            setRejectionReason("");

            // Refresh material requests
            const res = await axios.get(
                user?.role === "admin" || user?.role === "md"
                    ? `${API_URL}/material/material-requests`
                    : `${API_URL}/material/material-requests/user/${userID}`,
                { headers }
            );
            setMaterialRequests(Array.isArray(res.data) ? res.data : []);
        } catch (error: any) {
            console.error("Failed to reject material request:", error);
            const msg = error?.response?.data?.error || error?.message || "Failed to reject request";
            toast.error(msg);
        } finally {
            setIsProcessingRequest(false);
        }
    };

    // Handler to mark material request as completed
    const handleCompleteMaterialRequest = async (requestId: string) => {
        setIsProcessingRequest(true);
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.post(`${API_URL}/material/material-requests/${requestId}/complete`, {}, { headers });

            toast.success("Material request marked as completed");
            // Refresh material requests
            const res = await axios.get(
                user?.role === "admin" || user?.role === "md"
                    ? `${API_URL}/material/material-requests`
                    : `${API_URL}/material/material-requests/user/${userID}`,
                { headers }
            );
            setMaterialRequests(Array.isArray(res.data) ? res.data : []);
        } catch (error: any) {
            console.error("Failed to complete material request:", error);
            const msg = error?.response?.data?.error || error?.message || "Failed to mark as completed";
            toast.error(msg);
        } finally {
            setIsProcessingRequest(false);
        }
    };

    // Submit handler to create a new warehouse entry per Warehouse schema
    const onSubmitAddWarehouse = async (values: any) => {
        try {
            const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

            const payload = {
                itemName: values.itemName === "OTHER" ? (values.itemNameOther || "") : values.itemName,
                category: values.category,
                type: values.type,
                quantity: Number(values.quantity) || 0,
                unit: values.unit,
                location: values.location,
                maximumStock: Number(values.maximumStock) || 0,
                safetyStock: Number(values.safetyStock) || 0,
                unitCost: Number(values.unitCost) || 0,
                itemQuality: values.itemQuality,
            };

            // POST to warehouse API; createdById is set from query by backend
            await axios.post(`${API_URL}/warehouse?userId=${userID}`, payload, { headers });

            toast.success("Warehouse item added successfully");
            setIsAddWarehouseOpen(false);
            warehouseForm.reset();

            // Optionally refresh inventoryItems if you want to reflect immediately
            // You may fetch warehouses here or keep separate state for warehouse list
        } catch (error: any) {
            console.error("Failed to add warehouse item:", error);
            const msg = error?.response?.data?.error || error?.message || "Failed to add warehouse item";
            toast.error(msg);
        }
    };

    // Columns similar to Inventory tab
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
        {
            key: "actions",
            label: "Actions",
            type: "custom" as const,
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => setItemToDelete(row)}>Delete</Button>
                </div>
            ),
        },
    ];

    // Expandable row content (simplified)
    const expandableContent = (row: InventoryItem) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
                <div className="space-y-1">
                    {/* <div>Safety Stock: {row.safetyStock || 50}</div> */}
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
                    {/* <div>
            Total Value: ₹{(((row.unitCost || 0) * (row.quantity || 0)) || 0).toLocaleString()}
          </div> */}
                    <div>Location: {row.location}</div>
                    <div>Status: {row.itemQuality}</div>
                </div>
            </div>
        </div>
    );

    // Helper to get item count from a request
    const getRequestItemCount = (req: MaterialRequest) => (Array.isArray(req.items) ? req.items.length : 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Central Store Management</h1>
                    <p className="text-muted-foreground">Comprehensive Warehouse Dashboard for Inventory Insights</p>
                </div>
                <Button onClick={() => setIsAddWarehouseOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Items
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <EnhancedStatCard
                    title="Total Items"
                    value={totalItems.toString()}
                    icon={Package}
                    description="Items in warehouse"
                    trend={{ value: totalItems > 0 ? 12 : 0, label: "vs last month" }}
                    threshold={{
                        status: totalItems > 10 ? "good" : totalItems > 5 ? "warning" : "critical",
                        message: totalItems > 10 ? "Good inventory diversity" : totalItems > 5 ? "Consider expanding inventory" : "Low inventory count",
                    }}
                    onClick={() => setCurrentView('all')}
                />

                {/* <EnhancedStatCard
      title="Total Value"
      value={`₹${totalValue.toLocaleString()}`}
      icon={TrendingUp}
      description="Total inventory value"
      trend={{ value: 8, label: "vs last month" }}
      threshold={{ status: "good", message: "Healthy inventory value" }}
      onClick={() => setCurrentView('value')}
    /> */}

                <EnhancedStatCard
                    title="Low Stock Items"
                    value={lowStockCount.toString()}
                    icon={AlertTriangle}
                    description="Below reorder level"
                    threshold={{
                        status: lowStockCount === 0 ? "good" : lowStockCount <= 2 ? "warning" : "critical",
                        message: lowStockCount === 0 ? "All items well stocked" : lowStockCount <= 2 ? "Few items need restocking" : "Multiple items critically low",
                    }}
                    onClick={() => setCurrentView('lowstock')}
                />

                <EnhancedStatCard
                    title="Old Items"
                    value={(
                        inventoryItems
                            .filter((item) => item.type === 'OLD')
                            .filter((item, index, self) =>
                                index === self.findIndex(t => (t.itemName || t.name) === (item.itemName || item.name) && t.type === item.type)
                            )
                            .length || 0
                    ).toString()}
                    icon={Package}
                    description="Items marked as OLD"
                    trend={{ value: 3, label: "vs last month" }}
                    threshold={{
                        status: inventoryItems.filter((item) => item.type === 'OLD').length > 0 ? "good" : "warning",
                        message: inventoryItems.filter((item) => item.type === 'OLD').length > 0 ? "Old items in stock" : "No old items available"
                    }}
                    onClick={() => setCurrentView('old')}
                />

                <EnhancedStatCard
                    title="New Items"
                    value={(
                        inventoryItems
                            .filter((item) => item.type === 'NEW')
                            .filter((item, index, self) =>
                                index === self.findIndex(t => (t.itemName || t.name) === (item.itemName || item.name) && t.type === item.type)
                            )
                            .length || 0
                    ).toString()}
                    icon={Package}
                    description="Items marked as NEW"
                    trend={{ value: 5, label: "vs last month" }}
                    threshold={{
                        status: inventoryItems.filter((item) => item.type === 'NEW').length > 0 ? "good" : "warning",
                        message: inventoryItems.filter((item) => item.type === 'NEW').length > 0 ? "New items available" : "No new items in stock"
                    }}
                    onClick={() => setCurrentView('new')}
                />
            </div>

            {/* Tabs below the cards */}
            <Tabs defaultValue="items" className="w-full">
                <TabsList className="mb-4 grid grid-cols-2 items-center justify-between w-full">
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="items">
                    {currentView !== 'all' && (
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                                <div>
                                    <CardTitle className="text-xl">
                                        {currentView === 'old' && 'Old Items'}
                                        {currentView === 'new' && 'New Items'}
                                        {currentView === 'lowstock' && 'Low Stock Items'}
                                        {currentView === 'value' && 'High Value Items'}
                                    </CardTitle>
                                    <CardDescription>
                                        {currentView === 'old' && 'Showing items with type OLD'}
                                        {currentView === 'new' && 'Showing items with type NEW'}
                                        {currentView === 'lowstock' && 'Showing items below reorder level'}
                                        {currentView === 'value' && 'Showing items sorted by total value'}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" onClick={() => setCurrentView('all')}>
                                    Back to All Items
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ExpandableDataTable
                                    title="Warehouse Inventory Items"
                                    description="Filtered view"
                                    data={filteredItems as any[]}
                                    columns={columns as any}
                                    expandableContent={expandableContent as any}
                                    searchKey="name"
                                    filters={[
                                        { key: "category", label: "Category", options: categoryOptions },
                                        { key: "location", label: "Location", options: locationOptions },
                                    ]}
                                    rowActions={["view"]}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {currentView === 'all' && (
                        <>
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span>Loading warehouse items...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
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
                        </>
                    )}

                    {/* Add Warehouse Item Dialog (Warehouse schema) */}
                    <Dialog
                        open={isAddWarehouseOpen}
                        onOpenChange={(open) => {
                            setIsAddWarehouseOpen(open);
                            if (!open) warehouseForm.reset();
                        }}
                    >
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add Warehouse Item</DialogTitle>
                                <DialogDescription>Fill in the details to add a new warehouse item.</DialogDescription>
                            </DialogHeader>

                            <Form {...warehouseForm}>
                                <form onSubmit={warehouseForm.handleSubmit(onSubmitAddWarehouse)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SelectWithOtherFormField
                                            control={warehouseForm.control}
                                            name="itemName"
                                            label="Item"
                                            options={ITEM_OPTIONS.filter(opt => opt.value !== "OTHER").map(opt => ({ value: opt.value, label: opt.label }))}
                                            placeholder="Select Item"
                                            otherPlaceholder="Enter item name"
                                            otherOptionValue="OTHER"
                                            otherOptionLabel="Other"
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
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
                                            control={warehouseForm.control}
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
                                            control={warehouseForm.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
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
                                            control={warehouseForm.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter location" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* <FormField
                                            control={warehouseForm.control}
                                            name="reorderLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reorder Level</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> */}

                                        <FormField
                                            control={warehouseForm.control}
                                            name="maximumStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Maximum Stock</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="safetyStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Safety Stock</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="unitCost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Cost</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="itemQuality"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Quality</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select quality" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="GOOD">Good</SelectItem>
                                                            <SelectItem value="BAD">Bad</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => { setIsAddWarehouseOpen(false); warehouseForm.reset(); }}>Cancel</Button>
                                        <Button type="submit">Add Item</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Warehouse Item Dialog */}
                    <Dialog
                        open={isEditWarehouseOpen}
                        onOpenChange={(open) => {
                            setIsEditWarehouseOpen(open);
                            if (!open) setEditingWarehouseId(null);
                        }}
                    >
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Edit Warehouse Item</DialogTitle>
                                <DialogDescription>Update the fields and save changes.</DialogDescription>
                            </DialogHeader>

                            <Form {...warehouseForm}>
                                <form onSubmit={warehouseForm.handleSubmit(onSubmitUpdateWarehouse)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SelectWithOtherFormField
                                            control={warehouseForm.control}
                                            name="itemName"
                                            label="Item"
                                            options={ITEM_OPTIONS.filter(opt => opt.value !== "OTHER").map(opt => ({ value: opt.value, label: opt.label }))}
                                            placeholder="Select Item"
                                            otherPlaceholder="Enter item name"
                                            otherOptionValue="OTHER"
                                            otherOptionLabel="Other"
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
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
                                            control={warehouseForm.control}
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
                                            control={warehouseForm.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
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
                                            control={warehouseForm.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter location" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* <FormField
                                            control={warehouseForm.control}
                                            name="reorderLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reorder Level</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> */}

                                        <FormField
                                            control={warehouseForm.control}
                                            name="maximumStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Maximum Stock</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="safetyStock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Safety Stock</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="unitCost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Cost</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={warehouseForm.control}
                                            name="itemQuality"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Quality</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select quality" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="GOOD">Good</SelectItem>
                                                            <SelectItem value="BAD">Bad</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => { setIsEditWarehouseOpen(false); setEditingWarehouseId(null); }}>Cancel</Button>
                                        <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                </TabsContent>
                <AlertDialog
                    open={!!itemToDelete}
                    onOpenChange={() => setItemToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Warehouse Item</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{itemToDelete?.itemName || itemToDelete?.name}"? This
                                action cannot be undone. This will permanently remove the item
                                from your warehouse inventory.
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
                <TabsContent value="requests">
                    <div className="space-y-4">
                        {isReqLoading ? (
                            <Card>
                                <CardContent className="flex items-center justify-center p-8">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span>Loading requests...</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : materialRequests.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center p-8 text-center text-muted-foreground">
                                    No material requests found.
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Material Requests</CardTitle>
                                    <CardDescription>Manage and track material requests</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="text-left px-4 py-3 font-semibold">Request ID</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Requester</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Created Date</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Target Warehouse</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Items</th>
                                                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materialRequests.map((req) => (
                                                    <tr key={req.id} className="border-b hover:bg-muted/50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-sm">{req.id?.slice(0, 8) || "—"}...</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {typeof req.requestedBy === "object" && req.requestedBy?.name
                                                                ? req.requestedBy.name
                                                                : typeof req.requestedBy === "string"
                                                                    ? req.requestedBy.slice(0, 8)
                                                                    : "—"}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge
                                                                variant={
                                                                    req.status === "COMPLETED"
                                                                        ? "default"
                                                                        : req.status === "IN_PROGRESS"
                                                                            ? "secondary"
                                                                            : req.status === "REJECTED"
                                                                                ? "destructive"
                                                                                : "outline"
                                                                }
                                                                className="capitalize"
                                                            >
                                                                {req.status?.replace(/_/g, ' ') || "PENDING"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}</td>
                                                        <td className="px-4 py-3 text-sm">{req.targetWarehouse || "—"}</td>
                                                        <td className="px-4 py-3 text-sm">{req.items?.length || 0} items</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {req.status === "PENDING" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="default"
                                                                            onClick={() => handleApproveMaterialRequest(req.id)}
                                                                            disabled={isProcessingRequest}
                                                                            className="text-xs"
                                                                        >
                                                                            Accept
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => setRejectingRequestId(req.id)}
                                                                            disabled={isProcessingRequest}
                                                                            className="text-xs"
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {req.status === "IN_PROGRESS" && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleCompleteMaterialRequest(req.id)}
                                                                        disabled={isProcessingRequest}
                                                                        className="text-xs"
                                                                    >
                                                                        Mark Completed
                                                                    </Button>
                                                                )}
                                                                {req.status === "COMPLETED" && (
                                                                    <Badge variant="default" className="text-xs">Completed</Badge>
                                                                )}
                                                                {req.status === "REJECTED" && (
                                                                    <Badge variant="destructive" className="text-xs">Rejected</Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Rejection Reason Dialog */}
                    <Dialog
                        open={!!rejectingRequestId}
                        onOpenChange={(open) => {
                            if (!open) {
                                setRejectingRequestId(null);
                                setRejectionReason("");
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Material Request</DialogTitle>
                                <DialogDescription>
                                    Please provide a reason for rejecting this material request.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rejection Reason</label>
                                    <textarea
                                        placeholder="Enter reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setRejectingRequestId(null);
                                        setRejectionReason("");
                                    }}
                                    disabled={isProcessingRequest}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        if (rejectingRequestId) {
                                            handleRejectMaterialRequest(rejectingRequestId);
                                        }
                                    }}
                                    disabled={isProcessingRequest || !rejectionReason.trim()}
                                >
                                    {isProcessingRequest ? "Processing..." : "Reject"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default WarehouseDashboard;