import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SelectWithOther } from "@/components/ui/select-with-other";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { X, ChevronDown } from "lucide-react";
import { SimpleSearchableSelect } from "@/components/simple-searchable-select";

const API_URL =
    import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

type TransferStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
type TransferPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type Unit =
    | "CUBIC_FEET"
    | "M_CUBE"
    | "TONNE"
    | "SQUARE_FEET"
    | "PIECE"
    | "LITRE"
    | "KILOGRAM"
    | "BOX"
    | "ROLL"
    | "SHEET"
    | "HOURS"
    | "DAYS"
    | "LUMPSUM";

// Item type for material transfer rows
type ItemType = "OLD" | "NEW";

interface Vehicle {
    id: string;
    vehicleName: string;
    driverName: string;
    registrationNumber: string;
}

interface UserOption {
    role: string;
    id: string;
    name: string;
    email: string;
}

interface ItemRow {
    id: number;
    itemCode: string;
    itemName: string;
    quantity: number;
    unit: Unit | "";
    itemType: ItemType | ""; // OLD or NEW
    inventoryId?: string;
}

interface MaterialTransferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (createdOrUpdated: any) => void;
    mode?: "create" | "edit";
    transferId?: string; // DB id for edit mode
    onRequestNew?: () => void;
}

const UNITS: { value: Unit; label: string }[] = [
    { value: "CUBIC_FEET", label: "Cubic Feet" },
    { value: "M_CUBE", label: "Metre Cube" },
    { value: "SQUARE_FEET", label: "Square Feet" },
    { value: "TONNE", label: "Tonne" },
    { value: "PIECE", label: "Piece" },
    { value: "LITRE", label: "Litre" },
    { value: "KILOGRAM", label: "Kilogram" },
    { value: "BOX", label: "Box" },
    { value: "ROLL", label: "Roll" },
    { value: "SHEET", label: "Sheet" },
    { value: "HOURS", label: "Hours" },
    { value: "DAYS", label: "Days" },
    { value: "LUMPSUM", label: "Lump Sum" },
];

// Match the item enum used in Inventory.tsx
const ITEM_OPTIONS = [
    // Acrogan items
    { value: "ACROGAN", label: "Acrogan" },
    { value: "ACROSPAN", label: "Acrospan" },
    { value: "INNER_ACROSPAN", label: "Inner Acrospan" },
    { value: "OUTER_ACROGAN", label: "Outer Acrogan" },
    { value: "OUTER_ACROSPAN", label: "Outer Acrospan" },
    {
        value: "TWO_POINT_FIVE_MTR_INNER_ACROSPAN",
        label: "2.5 Mtr Inner Acrospan",
    },
    {
        value: "TWO_POINT_FIVE_MTR_OUTER_ACROSPAN",
        label: "2.5 Mtr Outer Acrospan",
    },
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
    {
        value: "SIX_HUNDRED_MM_DIA_PILE_BUILDUP_FRAME",
        label: "600 MM Dia Pile Buildup Frame",
    },
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
    {
        value: "ONE_POINT_FIVE_HP_PETROL_DEWATERING_PUMP",
        label: "1.5 Hp Petrol Dewatering Pump",
    },
    {
        value: "THREE_HP_DISEAL_DEWATERING_PUMP",
        label: "3 Hp Diesel Dewatering Pump",
    },
    {
        value: "FIVE_HP_DISEAL_DEWATERING_PUMP",
        label: "5 Hp Diesel Dewatering Pump",
    },
    {
        value: "TEN_HP_DISEAL_DEWATERING_PUMP",
        label: "10 Hp Diesel Dewatering Pump",
    },
    { value: "CHINA_DISEAL_PUMP", label: "China Diesel Pump" },
    {
        value: "ZERO_POINT_FIVE_HP_ELECTRIC_DEWATERING_PUMP",
        label: "0.5 Hp Electric Dewatering Pump",
    },
    {
        value: "ONE_HP_ELECTRIC_DEWATERING_PUMP",
        label: "1 Hp Electric Dewatering Pump",
    },
    {
        value: "ONE_POINT_FIVE_HP_ELECTRIC_DEWATERING_PUMP",
        label: "1.5 Hp Electric Dewatering Pump",
    },
    {
        value: "TWO_HP_ELECTRIC_DEWATERING_PUMP",
        label: "2 Hp Electric Dewatering Pump",
    },
    {
        value: "THREE_HP_ELECTRIC_DEWATERING_PUMP",
        label: "3 Hp Electric Dewatering Pump",
    },
    {
        value: "FIVE_HP_ELECTRIC_DEWATERING_PUMP",
        label: "5 Hp Electric Dewatering Pump",
    },

    // Submersible Pumps
    { value: "ONE_HP_SUMERSIBLE_PUMP", label: "1 Hp Submersible Pump" },
    {
        value: "ONE_POINT_FIVE_HP_SUMERSIBLE_PUMP",
        label: "1.5 Hp Submersible Pump",
    },
    { value: "TWO_HP_SUMERSIBLE_PUMP", label: "2 Hp Submersible Pump" },
    { value: "THREE_HP_SUMERSIBLE_PUMP", label: "3 Hp Submersible Pump" },
    { value: "FIVE_HP_SUMERSIBLE_PUMP", label: "5 Hp Submersible Pump" },
    {
        value: "SEVEN_POINT_FIVE_HP_SUMERSIBLE_PUMP",
        label: "7.5 Hp Submersible Pump",
    },
    { value: "TEN_HP_SUMERSIBLE_PUMP", label: "10 Hp Submersible Pump" },
    { value: "FOURTEEN_HP_SUMERSIBLE_PUMP", label: "14 Hp Submersible Pump" },
    { value: "FIFTEEN_HP_SUMERSIBLE_PUMP", label: "15 Hp Submersible Pump" },
    { value: "SUMERSIBLE_TULU_PUMP", label: "Submersible Tulu Pump" },

    // Mud Submersible Pumps
    {
        value: "ONE_POINT_FIVE_HP_MUD_SUMERSIBLE_PUMP",
        label: "1.5 Hp Mud Submersible Pump",
    },
    { value: "TWO_HP_MUD_SUMERSIBLE_PUMP", label: "2 Hp Mud Submersible Pump" },
    { value: "THREE_HP_MUD_SUMERSIBLE_PUMP", label: "3 Hp Mud Submersible Pump" },
    { value: "FIVE_HP_MUD_SUMERSIBLE_PUMP", label: "5 Hp Mud Submersible Pump" },

    // Monoblock Pumps
    { value: "ONE_HP_MONOBLOCK_PUMP", label: "1 Hp Monoblock Pump" },
    { value: "TWO_HP_MONOBLOCK_PUMP", label: "2 Hp Monoblock Pump" },
    { value: "THREE_HP_MONOBLOCK_PUMP", label: "3 Hp Monoblock Pump" },
    { value: "FIVE_HP_MONOBLOCK_PUMP", label: "5 Hp Monoblock Pump" },
    {
        value: "TWELVE_POINT_FIVE_HP_MONOBLOCK_PUMP",
        label: "12.5 Hp Monoblock Pump",
    },

    // Diesel Generator
    { value: "DG_125_KVA", label: "DG 125 KVA" },

    // Compactors and Welding Machines
    { value: "SOIL_COMPECTOR_MACHINE", label: "Soil Compactor Machine" },
    { value: "ROLLER_MINI_COMPACTOR", label: "Roller Mini Compactor" },
    { value: "SMALL_WELDING_MACHINE", label: "Small Welding Machine" },
    { value: "BIG_WELDING_MACHINE", label: "Big Welding Machine" },

    // Cutting and Bending Machines
    {
        value: "FOURTEEN_INCH_STEEL_CUTTER_MACHINE",
        label: "14 Inch Steel Cutter Machine",
    },
    { value: "BIG_STEEL_CUTTER_MACHINE", label: "Big Steel Cutter Machine" },
    { value: "STEEL_BENDING_MACHINE", label: "Steel Bending Machine" },
    {
        value: "SCRAP_STEEL_STRAIGHTING_MACHINE",
        label: "Scrap Steel Straightening Machine",
    },
    { value: "GANDING_MACHINE", label: "Grinding Machine" },
    { value: "PLY_CUTTER_MACHINE", label: "Ply Cutter Machine" },
    { value: "BLOCK_CUTTING_MACHINE", label: "Block Cutting Machine" },

    // Demolition and Drilling Tools
    { value: "FIVE_KG_DEMOLITION_HAMMER", label: "5 Kg Demolition Hammer" },
    { value: "SEVEN_KG_DEMOLITION_HAMMER", label: "7 Kg Demolition Hammer" },
    {
        value: "ELEVEN_KG_DEMOLITION_HAMMER_1306",
        label: "11 Kg Demolition Hammer 1306",
    },
    {
        value: "SIXTEEN_KG_DEMOLITION_HAMMER_1205C",
        label: "16 Kg Demolition Hammer 1205C",
    },
    { value: "SIXTEEN_KG_DRILL_HAMMER", label: "16 Kg Drill Hammer" },
    { value: "DRILL_MACHINE", label: "Drill Machine" },
    { value: "HILTI_GUN", label: "Hilti Gun" },

    // Mixture Machines
    { value: "TEN_SEVEN_MIXTURE_MACHINE", label: "10/7 Mixture Machine" },
    { value: "TEN_FIVE_MIXTURE_MACHINE", label: "10/5 Mixture Machine" },
    { value: "BABY_MIXTURE_MACHINE", label: "Baby Mixture Machine" },
    {
        value: "ONE_THOUSAND_FIFTY_UNIVERSAL_MACHINE",
        label: "1050 Universal Machine",
    },

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
    {
        value: "FINE_AGREGATE_SELVE_ANALYSIS",
        label: "Fine Aggregate Sieve Analysis",
    },
    {
        value: "MANUAL_CUBE_TESTING_MACHINE",
        label: "Manual Cube Testing Machine",
    },
    { value: "ELE_CUBE_TESTING_MACHINE", label: "Electric Cube Testing Machine" },
    {
        value: "CONCRETE_TEST_HAMMER_MACHINE",
        label: "Concrete Test Hammer Machine",
    },
    { value: "HOT_AIR_OVEN", label: "Hot Air Oven" },
    { value: "GI_TRAY", label: "GI Tray" },
    { value: "CTM_MACHINE_2000_KN", label: "CTM Machine 2000 KN" },
    { value: "ONE_TWENTY_KN_DAIL_GAUGE", label: "120 KN Dial Gauge" },
    { value: "TWO_THOUSAND_KN_DAIL_GAUGE", label: "2000 KN Dial Gauge" },

    // Miscellaneous Testing and Utility
    { value: "MEASURING_CYLINDER", label: "Measuring Cylinder" },
    { value: "OIL_SUCKING_PUMP", label: "Oil Sucking Pump" },
    {
        value: "VDF_FLOWER_WATERING_MACHINE",
        label: "VDF Flower Watering Machine",
    },
    { value: "SOIL_TESTING_MACHINE", label: "Soil Testing Machine" },
    {
        value: "SUSPENDED_PLATEFROM_HOIST_CADLE",
        label: "Suspended Platform Hoist Cradle",
    },
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
    {
        value: "SP_2000_CONCREATE_PUMP_SCHWING",
        label: "SP 2000 Concrete Pump Schwing",
    },
    {
        value: "CONCRETE_PUMP_1407_AQUARIOUS",
        label: "1407 Concrete Pump Aquarious",
    },
    {
        value: "SP_1807_CONCREATE_PUMP_SCHWING",
        label: "SP 1807 Concrete Pump Schwing",
    },
    { value: "CONCRETE_PUMP_1400_SCHWING", label: "1400 Concrete Pump Schwing" },
    {
        value: "CONCRETE_PUMP_1460_AQUARIOUS",
        label: "1460 Concrete Pump Aquarious",
    },
    {
        value: "CONCRETE_PUMP_1400_AQUARIOUS",
        label: "1400 Concrete Pump Aquarious",
    },
    {
        value: "CONCRETE_PUMP_1405D_AQUARIOUS",
        label: "1405D Concrete Pump Aquarious",
    },

    // Concrete Pump Pipes and Components
    { value: "THREE_MTR_PIPE_CONCREATE_PUMP", label: "3 Mtr Pipe Concrete Pump" },
    { value: "TWO_MTR_PIPE_CONCREATE_PUMP", label: "2 Mtr Pipe Concrete Pump" },
    { value: "ONE_MTR_PIPE_CONCREATE_PUMP", label: "1 Mtr Pipe Concrete Pump" },
    {
        value: "HALF_MTR_PIPE_CONCREATE_PUMP",
        label: "0.5 Mtr Pipe Concrete Pump",
    },

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
    {
        value: "BRACKET_FOR_CONCREATE_PIPE_LINE",
        label: "Bracket For Concrete Pipe Line",
    },

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
    {
        value: "ONE_POINT_FIVE_METER_TELE_SCOPING_MASS",
        label: "1.5 Meter Tele Scoping Mass",
    },
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
    {
        value: "TEN_MTR_MAIN_MASS_WITH_HYDROLIC_JACK",
        label: "10 Mtr Main Mass With Hydraulic Jack",
    },
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
    {
        value: "TWELVE_INCH_HOIST_BOCKET_PULLI",
        label: "12 Inch Hoist Bucket Pulli",
    },
    { value: "LANDING_FRME", label: "Landing Frame" },
    { value: "TWELVE_MM_X_FIFTY_MM_NUT_BOLT", label: "12 MM X 50 MM Nut Bolt" },
    { value: "HOIST_BOCKET", label: "Hoist Bucket" },
    { value: "JOIST_PATTI_FOR_HOIST", label: "Joist Patti For Hoist" },
    { value: "ONE_MTR_TOWER_HOIST_COLUMN", label: "1 Mtr Tower Hoist Column" },
    {
        value: "ONE_POINT_FIVE_MTR_TOWER_HOIST_COLUMN",
        label: "1.5 Mtr Tower Hoist Column",
    },
    { value: "TWO_MTR_TOWER_HOIST_COLUMN", label: "2 Mtr Tower Hoist Column" },
    { value: "THREE_MTR_TOWER_HOIST_COLUMN", label: "3 Mtr Tower Hoist Column" },
    {
        value: "THREE_MTR_TOP_TOWER_HOIST_COLUMN",
        label: "3 Mtr Top Tower Hoist Column",
    },
    {
        value: "THREE_MTR_BOTTOM_TOWER_HOIST_COLUMN",
        label: "3 Mtr Bottom Tower Hoist Column",
    },
    { value: "TROLLEY_SET_FOR_HOIST", label: "Trolley Set For Hoist" },
    { value: "HOIST_SUPPORT_ROLLER", label: "Hoist Support Roller" },
    {
        value: "HOIST_BOCKET_CHENNEL_6_INCH",
        label: "Hoist Bucket Channel 6 Inch",
    },
    { value: "TEN_MM_ROPE", label: "10 MM Rope" },
    { value: "HOIST_BOOM_BUCKET", label: "Hoist Boom Bucket" },
    { value: "LIMIT_SWITCH", label: "Limit Switch" },
    { value: "LIMIT_FRAM", label: "Limit Frame" },
    { value: "WALL_SUPPORT", label: "Wall Support" },
    { value: "TOWER_SUPPORT_FRAME", label: "Tower Support Frame" },

    // MKG variants and additional hoist equipment
    {
        value: "MKG_WINGS_ELECTRIC_MOTOR_SET",
        label: "MKG Wings Electric Motor Set",
    },
    {
        value: "MKG_TOWER_HOIST_COLUMN_1MTR",
        label: "MKG 1 Mtr Tower Hoist Column",
    },
    {
        value: "MKG_TOWER_HOIST_COLUMN_1_5MTR",
        label: "MKG 1.5 Mtr Tower Hoist Column",
    },
    {
        value: "MKG_TOWER_HOIST_COLUMN_2MTR",
        label: "MKG 2 Mtr Tower Hoist Column",
    },
    {
        value: "MKG_TOWER_HOIST_COLUMN_3MTR",
        label: "MKG 3 Mtr Tower Hoist Column",
    },
    { value: "MKG_TOP_TOWER_HOIST_COLUMN", label: "MKG Top Tower Hoist Column" },
    {
        value: "MKG_BOTTOM_TOWER_HOIST_COLUMN",
        label: "MKG Bottom Tower Hoist Column",
    },
    { value: "STEEL_LIFTING_TROLLING_SET", label: "Steel Lifting Trolling Set" },
    { value: "MKG_LIMIT_SWITCH", label: "MKG Limit Switch" },
    { value: "REJECT_RACK", label: "Reject Rack" },
    { value: "CAGE_TOP_BARICATION_SET", label: "Cage Top Barication Set" },
    { value: "MOTER_DERECK_SET", label: "Motor Derrick Set" },
    { value: "ENCLOUSER_SET", label: "Enclosure Set" },
    { value: "LIMIT_PLATE", label: "Limit Plate" },
    { value: "END_CLOSER_GATE_SET", label: "End Closer Gate Set" },
    {
        value: "END_CLOSER_GATE_MAIN_SWITCH",
        label: "End Closer Gate Main Switch",
    },
    {
        value: "MKG_TOWER_HOIST_COLUMN_SUPPORTING",
        label: "MKG Tower Hoist Column Supporting",
    },
    { value: "OTHER", label: "Other" },
] as const;

export default function MaterialTransferModal({
    open,
    onOpenChange,
    onSave,
    mode = "create",
    transferId,
    onRequestNew,
}: MaterialTransferModalProps) {
    const { toast } = useToast();
    const { user } = useUser();

    // Form state
    const [transferID, setTransferID] = useState("");
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
    const [requestedDate, setRequestedDate] = useState<string>(
        () => new Date().toISOString().split("T")[0]
    );
    const [status, setStatus] = useState<TransferStatus>("PENDING");
    const [driverName, setDriverName] = useState("");
    const [etaMinutes, setEtaMinutes] = useState<string>("");
    const [vehicleId, setVehicleId] = useState<string>("");
    const [vehicleNumber, setVehicleNumber] = useState<string>("");
    const [vehicleName, setVehicleName] = useState<string>("");
    const [fromProject, setFromProject] = useState<string>("");
    const [toProject, setToProject] = useState<string>("");
    const [fromProjectId, setFromProjectId] = useState<string>("");
    const [toProjectId, setToProjectId] = useState<string>("");
    const [approvedById, setApprovedById] = useState<string>("");
    const [priority, setPriority] = useState<TransferPriority>("NORMAL");
    const [notes, setNotes] = useState("");
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    // From/To as user selections
    const [fromUserId, setFromUserId] = useState<string>("");
    const [toUserId, setToUserId] = useState<string>("");

    const [items, setItems] = useState<ItemRow[]>([
        {
            id: 1,
            itemCode: "",
            itemName: "",
            quantity: 0,
            unit: "",
            itemType: "",
        },
    ]);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

    // Reference data
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Refs
    const signatureInputRef = useRef<HTMLInputElement>(null);

    // const getToken = () => sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");

    useEffect(() => {
        if (!open) return;
        const token =
            sessionStorage.getItem("jwt_token") ||
            localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // Load vehicles, users, and projects
        const vehiclesUrl = `${API_URL}/vehicles`;
        Promise.all([
            fetch(vehiclesUrl, { headers }).then((r) => (r.ok ? r.json() : [])),
            fetch(`${API_URL}/users`, { headers }).then((r) =>
                r.ok ? r.json() : []
            ),
            fetch(`${API_URL}/projects`, { headers }).then((r) =>
                r.ok ? r.json() : []
            ),
        ])
            .then(async ([vehiclesRes, usersRes, projectsRes]) => {
                setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
                const normalizedUsers: UserOption[] = Array.isArray(usersRes)
                    ? usersRes.map((u: any) => ({
                        id: u.id,
                        name: u.name || u.email || "User",
                        email: u.email,
                        role: u.role,
                    }))
                    : [];
                if (user && !normalizedUsers.some((u) => u.id === user.id)) {
                    normalizedUsers.push({
                        id: user.id,
                        name: user.name || user.email || "Current User",
                        email: user.email || "",
                        role: user.role || "",
                    });
                }
                setUsers(normalizedUsers);
                setProjects(Array.isArray(projectsRes) ? projectsRes : []);

                // In create mode, default From to current user if available
                if (mode === "create" && user?.id) {
                    setFromUserId(user.id);
                    const me = normalizedUsers.find((u) => u.id === user.id);
                    if (me) setFromLocation(me.name || me.email || "");
                } else if (mode === "create") {
                    // Default to first store user if available
                    const firstStoreUser = normalizedUsers.find(
                        (u) => u.role === "store"
                    );
                    if (firstStoreUser) {
                        setFromUserId(firstStoreUser.id);
                        setFromLocation(firstStoreUser.name || firstStoreUser.email || "");
                    }
                }

                // If edit mode, fetch the transfer details
                if (mode === "edit" && transferId && user?.id) {
                    try {
                        const resp = await fetch(
                            `${API_URL}/inventory/transfers/${transferId}?userId=${user.id}`,
                            { headers }
                        );
                        if (resp.ok) {
                            const t = await resp.json();
                            setTransferID(t.transferID || "");
                            setFromLocation(t.fromLocation || "");
                            setToLocation(t.toLocation || "");
                            // Try to resolve from/to user IDs based on names/emails stored in locations
                            const fromMatch = normalizedUsers.find(
                                (u) => u.name === t.fromLocation || u.email === t.fromLocation
                            );
                            const toMatch = normalizedUsers.find(
                                (u) => u.name === t.toLocation || u.email === t.toLocation
                            );
                            setFromUserId(fromMatch ? fromMatch.id : "");
                            setToUserId(toMatch ? toMatch.id : "");

                            setRequestedDate(
                                t.requestedDate
                                    ? new Date(t.requestedDate).toISOString().split("T")[0]
                                    : new Date().toISOString().split("T")[0]
                            );
                            setStatus((t.status || "PENDING") as TransferStatus);
                            setDriverName(t.driverName || "");
                            setEtaMinutes(
                                typeof t.etaMinutes === "number"
                                    ? String((t.etaMinutes / 60).toFixed(1))
                                    : ""
                            );
                            setVehicleId(t.vehicleId || "");
                            setVehicleNumber(t.vehicleNumber || "");
                            setVehicleName(t.vehicleName || "");
                            setFromProjectId(t.fromProjectId || "");
                            setToProjectId(t.toProjectId || "");
                            setFromProject(t.fromProject || "");
                            setToProject(t.toProject || "");
                            setApprovedById(t.approvedById || "");
                            setPriority((t.priority || "NORMAL") as TransferPriority);
                            const mappedItems: ItemRow[] = Array.isArray(t.items)
                                ? t.items.map((it: any, idx: number) => ({
                                    id: idx + 1,
                                    itemCode: it.itemCode || "",
                                    itemName: it.itemName || "",
                                    quantity: typeof it.quantity === "number" ? it.quantity : 0,
                                    unit: (it.unit || "") as Unit | "",
                                    itemType: (it.itemType || "") as ItemType | "",
                                    inventoryId: it.inventoryId || undefined,
                                }))
                                : [
                                    {
                                        id: 1,
                                        itemCode: "",
                                        itemName: "",
                                        quantity: 0,
                                        unit: "",
                                        itemType: "",
                                    },
                                ];
                            setItems(mappedItems);
                            setNotes("");
                            // Load authorised signature if it exists
                            if (t.authorisedSignature) {
                                setSignaturePreview(t.authorisedSignature);
                            }
                        } else {
                            toast({
                                title: "Error",
                                description: "Failed to load transfer details",
                                variant: "destructive",
                            });
                        }
                    } catch (e) {
                        toast({
                            title: "Error",
                            description: "Failed to load transfer details",
                            variant: "destructive",
                        });
                    }
                }
            })
            .catch(() => {
                toast({
                    title: "Warning",
                    description: "Failed to load reference data",
                    variant: "destructive",
                });
            });
    }, [open, mode, transferId]);

    const addRow = () => {
        const newId =
            items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        setItems((prev) => [
            ...prev,
            {
                id: newId,
                itemCode: "",
                itemName: "",
                quantity: 0,
                unit: "",
                itemType: "",
            },
        ]);
    };

    const removeSelectedRows = () => {
        setItems((prev) => prev.filter((row) => !selectedRowIds.has(row.id)));
        setSelectedRowIds(new Set());
    };

    const updateItem = (id: number, field: keyof ItemRow, value: any) => {
        setItems((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const handleSignatureSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Error",
                    description: "Please select an image file",
                    variant: "destructive",
                });
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "Error",
                    description: "File size must be less than 10MB",
                    variant: "destructive",
                });
                return;
            }
            setSignatureFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setSignaturePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        if (!fromUserId || !toUserId) {
            toast({
                title: "Validation Error",
                description: "Please select both From and To users",
                variant: "destructive",
            });
            return false;
        }
        if (!requestedDate) {
            toast({
                title: "Validation Error",
                description: "Requested date is required",
                variant: "destructive",
            });
            return false;
        }
        const validItems = items.filter((i) => {
            return (
                i.itemCode.trim() && i.itemName.trim() && i.quantity > 0 && i.itemType
            );
        });

        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const etaMinutesValue = etaMinutes
                ? Math.round(Number(etaMinutes) * 60)
                : null;
            const fromUser = users.find((u) => u.id === fromUserId);
            const toUser = users.find((u) => u.id === toUserId);
            const payload = {
              transferID: transferID,
              fromLocation: fromLocation.trim(),
              toLocation: toLocation.trim(),
              fromProjectId: fromUserId || null,
              toProjectId: toUserId || null,
                requestedDate: new Date(requestedDate).toISOString(),
                status,
                driverName: driverName.trim() || null,
                etaMinutes: etaMinutesValue,
                vehicleId: vehicleId || null,
                vehicleNumber: vehicleNumber.trim() || null,
                vehicleName: vehicleName.trim() || null,
                approvedById: approvedById || null,
                priority,
                items: items
                    .filter((i) => {
                        return i.itemCode.trim() && i.itemName.trim() && i.quantity > 0;
                    })
                    .map((i) => ({
                        itemCode: i.itemCode,
                        itemName: i.itemName,
                        quantity: i.quantity,
                        unit: i.unit || null,
                        type: i.itemType || null,
                    })),
                notes: notes.trim() || null,
            };

            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            if (mode === "edit" && transferId && user?.id) {
                // Update the transfer header
                const putResp = await fetch(
                    `${API_URL}/inventory/transfers/${transferId}?userId=${user.id}`,
                    {
                        method: "PUT",
                        headers,
                        body: JSON.stringify(payload),
                    }
                );
                if (!putResp.ok) {
                    const err = await putResp.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to update material transfer");
                }

                // Replace items: delete existing then create new
                const itemsResp = await fetch(
                    `${API_URL}/inventory/transfers/${transferId}/items?userId=${user.id}`,
                    { headers }
                );
                if (!itemsResp.ok) throw new Error("Failed to load existing items");
                const existingItems = await itemsResp.json();
                await Promise.all(
                    (existingItems || []).map((it: any) =>
                        fetch(
                            `${API_URL}/inventory/transfers/${transferId}/items/${it.id}?userId=${user.id}`,
                            {
                                method: "DELETE",
                                headers,
                            }
                        )
                    )
                );
                // Create new items
                for (const i of payload.items) {
                    const createItemResp = await fetch(
                        `${API_URL}/inventory/transfers/${transferId}/items?userId=${user.id}`,
                        {
                            method: "POST",
                            headers,
                            body: JSON.stringify(i),
                        }
                    );
                    if (!createItemResp.ok) {
                        const err = await createItemResp.json().catch(() => ({}));
                        throw new Error(err.error || "Failed to create transfer item");
                    }
                }

                const updatedResp = await fetch(
                    `${API_URL}/inventory/transfers/${transferId}?userId=${user.id}`,
                    { headers }
                );
                const updated = updatedResp.ok ? await updatedResp.json() : null;
                toast({
                    title: "Success",
                    description: "Material transfer updated successfully",
                });
                if (onSave) onSave(updated || { id: transferId, ...payload });
                onOpenChange(false);
            } else {
                // Create new transfer
                const resp = await fetch(`${API_URL}/inventory/transfers`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                });

                if (resp.ok) {
                    const created = await resp.json();
                    toast({
                        title: "Success",
                        description: "Material transfer created successfully",
                    });
                    if (onSave) onSave(created);
                    onOpenChange(false);
                } else {
                    const err = await resp.json().catch(() => ({}));
                    toast({
                        title: "Error",
                        description: err.error || "Failed to create material transfer",
                        variant: "destructive",
                    });
                }
            }

            // reset form after successful close
            setTransferID("");
            setFromLocation("");
            setToLocation("");
            setRequestedDate(new Date().toISOString().split("T")[0]);
            setStatus("PENDING");
            setDriverName("");
            setEtaMinutes("");
            setVehicleId("");
            setApprovedById("");
            setPriority("NORMAL");
            setItems([
                {
                    id: 1,
                    itemCode: "",
                    itemName: "",
                    quantity: 0,
                    unit: "",
                    itemType: "",
                },
            ]);
            setNotes("");
            setSignatureFile(null);
            setSignaturePreview(null);
        } catch (e) {
            toast({
                title: "Error",
                description:
                    (e as Error).message ||
                    (mode === "edit"
                        ? "Failed to update material transfer"
                        : "Failed to create material transfer"),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-full max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "edit"
                            ? "Edit Material Transfer"
                            : "New Material Transfer"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "edit"
                            ? "Update transfer details and items."
                            : "Capture transfer details and items."}
                    </DialogDescription>
                </DialogHeader>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="mb-1 block">Transfer ID</Label>
                        <Input
                            value={transferID}
                            onChange={(e) => setTransferID(e.target.value)}
                            placeholder="TRF001"
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block">Requested Date *</Label>
                        <Input
                            type="date"
                            value={requestedDate}
                            onChange={(e) => setRequestedDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block">From Project</Label>
                        <Select
                            value={fromProjectId}
                            onValueChange={(v) => {
                                setFromProjectId(v);
                                const p = projects.find((x: any) => x.id === v);
                                if (p) setFromProject(p.projectName || p.name || "");
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select from project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.projectName || p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-1 block">To Project</Label>
                        <Select
                            value={toProjectId}
                            onValueChange={(v) => {
                                setToProjectId(v);
                                const p = projects.find((x: any) => x.id === v);
                                if (p) setToProject(p.projectName || p.name || "");
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select to project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.projectName || p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-1 block">From *</Label>
                        <Select
                            value={fromUserId}
                            onValueChange={(v) => {
                                setFromUserId(v);
                                const u = users.find((x) => x.id === v);
                                if (u) setFromLocation(u.name);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select from user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users
                                    .filter(
                                        (u) =>
                                            u.role === "store" ||
                                            u.role === "project" ||
                                            u.role === "admin" ||
                                            u.role === "warehouse"
                                    )
                                    .map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-1 block">To *</Label>
                        <Select
                            value={toUserId}
                            onValueChange={(v) => {
                                setToUserId(v);
                                const u = users.find((x) => x.id === v);
                                if (u) setToLocation(u.name);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select destination user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users
                                    .filter(
                                        (u) =>
                                            u.role === "store" ||
                                            u.role === "project" ||
                                            u.role === "admin" ||
                                            u.role === "warehouse"
                                    )
                                    .map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-1 block">Status *</Label>
                        <Select
                            value={status}
                            onValueChange={(v: TransferStatus) => setStatus(v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-1 block">Priority *</Label>
                        <Select
                            value={priority}
                            onValueChange={(v: TransferPriority) => setPriority(v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="NORMAL">Normal</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-1 block">Driver</Label>
                        <Input
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block">ETA (hours)</Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={etaMinutes}
                            onChange={(e) => setEtaMinutes(e.target.value)}
                            placeholder="2.0"
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block">Vehicle Number</Label>
                        <Input
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            placeholder="ABC-123"
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block">Vehicle Name</Label>
                        <Input
                            value={vehicleName}
                            onChange={(e) => setVehicleName(e.target.value)}
                            placeholder="Truck A"
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block">Approved By</Label>
                        <Select value={approvedById} onValueChange={setApprovedById}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select approver" />
                            </SelectTrigger>
                            <SelectContent>
                                {users
                                    .filter(
                                        (u) =>
                                            u.role === "admin" ||
                                            u.role === "warehouse" ||
                                            u.role === "store" ||
                                            u.role === "project"
                                    )
                                    .map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Items */}
                <Card className="mt-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={addRow} size="sm">
                                    Add Item
                                </Button>
                                {selectedRowIds.size > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600"
                                        onClick={removeSelectedRows}
                                    >
                                        Delete Selected ({selectedRowIds.size})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    items.length > 0 &&
                                                    selectedRowIds.size === items.length
                                                }
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRowIds(new Set(items.map((i) => i.id)));
                                                    } else {
                                                        setSelectedRowIds(new Set());
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>No.</TableHead>
                                        <TableHead className="w-[100px]">Item Code *</TableHead>
                                        <TableHead>Item Name *</TableHead>
                                        <TableHead className="w-[140px]">Item Type *</TableHead>
                                        <TableHead className="w-[120px]">Quantity *</TableHead>
                                        <TableHead className="w-[180px]">Unit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((row, idx) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRowIds.has(row.id)}
                                                    onChange={(e) => {
                                                        const next = new Set(selectedRowIds);
                                                        e.target.checked
                                                            ? next.add(row.id)
                                                            : next.delete(row.id);
                                                        setSelectedRowIds(next);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell className="w-[100px] p-1">
                                                <Input
                                                    value={row.itemCode}
                                                    onChange={(e) =>
                                                        updateItem(row.id, "itemCode", e.target.value)
                                                    }
                                                    placeholder="Code"
                                                    className="h-9 text-xs"
                                                />
                                            </TableCell>
                                            <TableCell className="p-1">
                                                <SimpleSearchableSelect
                                                    value={row.itemName}
                                                    onValueChange={(v) =>
                                                        updateItem(row.id, "itemName", v)
                                                    }
                                                    options={ITEM_OPTIONS}
                                                    placeholder="Search item..."
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={row.itemType}
                                                    onValueChange={(v: ItemType) =>
                                                        updateItem(row.id, "itemType", v)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Item Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="OLD">Old</SelectItem>
                                                        <SelectItem value="NEW">New</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={row.quantity}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            row.id,
                                                            "quantity",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={row.unit}
                                                    onValueChange={(v) => updateItem(row.id, "unit", v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {UNITS.map((u) => (
                                                            <SelectItem key={u.value} value={u.value}>
                                                                {u.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-4">
                    <Label className="mb-1 block">Notes</Label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional information..."
                        rows={3}
                    />
                </div>

                {/* Authorised Signature Upload */}
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Authorised Signature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {signaturePreview ? (
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-md bg-gray-50">
                                        <p className="text-sm font-medium mb-3">
                                            Current Signature:
                                        </p>
                                        <img
                                            src={signaturePreview}
                                            alt="Signature preview"
                                            className="max-w-xs max-h-48 rounded border"
                                        />
                                    </div>
                                    {mode === "edit" && (
                                        <div>
                                            <Label
                                                htmlFor="signature-upload"
                                                className="block mb-2 cursor-pointer"
                                            >
                                                Replace Signature Image
                                            </Label>
                                            <Input
                                                id="signature-upload"
                                                ref={signatureInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleSignatureSelect}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Supported formats: JPEG, PNG, GIF, WEBP | Max size: 10MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Label
                                            htmlFor="signature-upload"
                                            className="block mb-2 cursor-pointer"
                                        >
                                            Upload Signature Image
                                        </Label>
                                        <Input
                                            id="signature-upload"
                                            ref={signatureInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSignatureSelect}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Supported formats: JPEG, PNG, GIF, WEBP | Max size: 10MB
                                        </p>
                                    </div>
                                </div>
                            )}
                            {signatureFile && (
                                <div className="space-y-3">
                                    <div className="p-4 border rounded-md bg-blue-50">
                                        <p className="text-sm font-medium mb-2">
                                            New Signature Preview:
                                        </p>
                                        <img
                                            src={signaturePreview}
                                            alt="Signature preview"
                                            className="max-w-xs max-h-40 rounded border"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSignatureFile(null);
                                            // Only reset preview if we're in create mode or no existing signature
                                            if (mode === "create") {
                                                setSignaturePreview(null);
                                            } else {
                                                // In edit mode, reload the original signature
                                                if (transferId && user?.id) {
                                                    const token =
                                                        sessionStorage.getItem("jwt_token") ||
                                                        localStorage.getItem("jwt_token_backup");
                                                    const headers = token
                                                        ? { Authorization: `Bearer ${token}` }
                                                        : {};
                                                    fetch(
                                                        `${API_URL}/inventory/transfers/${transferId}?userId=${user.id}`,
                                                        { headers }
                                                    )
                                                        .then((r) => (r.ok ? r.json() : null))
                                                        .then((t) => {
                                                            if (t?.authorisedSignature) {
                                                                setSignaturePreview(t.authorisedSignature);
                                                            }
                                                        });
                                                }
                                            }
                                            if (signatureInputRef.current) {
                                                signatureInputRef.current.value = "";
                                            }
                                        }}
                                    >
                                        Cancel Upload
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Transfer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
