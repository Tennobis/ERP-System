import { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";
import type { FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DollarSign,
  FileText,
  Users,
  Calculator,
  CreditCard,
  AlertTriangle,
  Download,
  ArrowLeft,
  Plus,
  TrendingUp,
  PieChart,
  Check,
  Clock,
  ChevronDown,
  Trash2,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import GenerateTaxModal from "@/components/modals/GenerateTaxModal";
import EditTaxModal from "@/components/modals/EditTaxModal";
import ReconciliationPanel from "@/components/panels/ReconciliationPanel";
import InvoiceBuilderModal from "@/components/modals/InvoiceBuilderModal";
import LabourWagesModal from "@/components/modals/LabourWagesModal";
import type { Invoice, Employee, Tax } from "@/types/dummy-data-types";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Remove typeof ...Data[0] types
// type Invoice = typeof invoicesData[0]
// type Employee = typeof employeesData[0]

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
  },
  {
    accessorKey: "client.name",
    header: "Client",
    cell: ({ row }) => {
      const invoice = row.original;
      return invoice.client?.name || invoice.clientName || "N/A";
    },
  },
  {
    accessorKey: "project.name",
    header: "Project",
    cell: ({ row }) => {
      const invoice = row.original;
      return invoice.project?.name || "N/A";
    },
  },
  {
    accessorKey: "total",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = row.getValue("total") as number;
      return `₹${(amount / 1000).toFixed(0)}K`;
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "PAID"
          ? "default"
          : status === "OVERDUE"
          ? "destructive"
          : "secondary";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const invoice = row.original;
      const items = invoice.items || [];

      if (items.length === 0) return "No items";

      return (
        <Select>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={`${items.length} items`} />
          </SelectTrigger>
          <SelectContent>
            {items.map((item: any, idx: number) => (
              <SelectItem key={idx} value={item.id}>
                <div className="text-left">
                  <div className="font-medium">{item.item}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit} × ₹{item.rate}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
];

const payrollColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Employee",
  },
  {
    accessorKey: "position",
    header: "Role",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "latestNetSalary",
    header: "Salary",
    cell: ({ row }) => {
      const salary = row.getValue("latestNetSalary") as
        | number
        | null
        | undefined;
      if (typeof salary === "number" && !Number.isNaN(salary)) {
        return `₹${(salary / 1000).toFixed(0)}K`;
      }
      return "N/A";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // Backend doesn't provide status on Employee; default to Active unless leftAt is set
      const status = (row.original as any).leftAt ? "Inactive" : "Active";
      return (
        <Badge variant={status === "Active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
];

type BillLineItemRecord = {
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
};

type BillCategoryRecord = {
  id: string;
  clientBillId: string;
  categoryCode: string;
  categoryName: string;
  tower?: string;
  description?: string;
  sequence: number;
  lineItems: BillLineItemRecord[];
};

type ClientBillRecord = {
  status: string;
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  workOrderNo?: string;
  workOrderDate?: string;
  raBillNo?: string;
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
  projectName?: string;
  projectLocation?: string;
  contractorName?: string;
  contractorVillage?: string;
  contractorPost?: string;
  contractorDistrict?: string;
  contractorPin?: string;
  contractorPAN?: string;
  totalAmount: number;
  tdsPercentage: number;
  tdsAmount: number;
  netBillAmount: number;
  debitAdjustValue?: number;
  bankName?: string;
  bankBranch?: string;
  accountNo?: string;
  ifscCode?: string;
  categories: BillCategoryRecord[];
  createdAt?: string;
  updatedAt?: string;
};

type ClientBillFormState = Omit<
  ClientBillRecord,
  "tdsAmount" | "netBillAmount"
> & {
  tdsAmount?: number;
  netBillAmount?: number;
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

// Format currency with "Rs" prefix for PDF generation
const formatRsForPDF = (value: number) => {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
  return `Rs ${formatted}`;
};

const generateTempId = () => Math.random().toString(36).slice(2, 10);

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

const createBlankClientBill = (): ClientBillFormState => ({
  id: "",
  invoiceNo: "",
  invoiceDate: "",
  workOrderNo: "",
  workOrderDate: "",
  raBillNo: "",
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
  contractorVillage: "",
  contractorPost: "",
  contractorDistrict: "",
  contractorPin: "",
  contractorPAN: "",
  totalAmount: 0,
  tdsPercentage: 1,
  debitAdjustValue: 0,
  bankName: "",
  bankBranch: "",
  accountNo: "",
  ifscCode: "",
  status: "",
  categories: [createBlankCategory()],
});

const coerceNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString("en-IN");
  } catch {
    return value;
  }
};

const buildQuantityLabel = (line: BillLineItemRecord) =>
  `Prev: ${line.previousQuantity.toFixed(
    3
  )} | Pres: ${line.presentQuantity.toFixed(
    3
  )} | Cum: ${line.cumulativeQuantity.toFixed(3)}`;

const buildAmountLabel = (line: BillLineItemRecord) =>
  `Prev: ${formatINR(line.previousAmount)} | Pres: ${formatINR(
    line.presentAmount
  )} | Cum: ${formatINR(line.cumulativeAmount)}`;

const generateClientBillPdf = (bill: ClientBillRecord) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let cursorY = 8;

  // ===== HEADER =====
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(bill.billingPartyName || "Company Name", pageWidth / 2, cursorY, {
    align: "center",
  });
  cursorY += 5;

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  const headerText = `${bill.billingPartyAddress || ""} • PAN- ${
    bill.contractorPAN || ""
  }`;
  doc.text(headerText, pageWidth / 2, cursorY, {
    align: "center",
    maxWidth: pageWidth - 2 * margin,
  });
  cursorY += 8;

  // ===== TOP BORDER =====
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // ===== INVOICE LABEL & RECEIVER DETAILS =====
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("INVOICE", margin, cursorY);

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text("Original for Recipient", pageWidth - 60, cursorY - 1);
  doc.text("Duplicate for Service Provider", pageWidth - 60, cursorY + 3);

  cursorY += 10;

  // ===== INVOICE DETAILS LEFT SIDE =====
  const detailsBoxHeight = 30;
  doc.rect(margin, cursorY, (pageWidth - 2 * margin) / 2, detailsBoxHeight);

  let detailY = cursorY + 5;
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text("Reverse Charges (Yes/No):", margin + 2, detailY);
  doc.setFont(undefined, "normal");
  doc.text(bill.reverseCharges ? "Yes" : "No", margin + 60, detailY);

  detailY += 5;
  doc.setFont(undefined, "bold");
  doc.text("Invoice No:", margin + 2, detailY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.invoiceNo}`, margin + 30, detailY);

  detailY += 5;
  doc.setFont(undefined, "bold");
  doc.text("Invoice Date:", margin + 2, detailY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${formatDate(bill.invoiceDate)}`, margin + 30, detailY);

  detailY += 5;
  doc.setFont(undefined, "bold");
  doc.text("State:", margin + 2, detailY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyStateCode || "N/A"}`, margin + 30, detailY);

  // ===== RIGHT DETAILS BOX =====
  doc.rect(
    pageWidth / 2 + 2,
    cursorY,
    (pageWidth - 2 * margin) / 2 - 2,
    detailsBoxHeight
  );

  detailY = cursorY + 5;
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text("Work Order No:", pageWidth / 2 + 5, detailY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.workOrderNo || "N/A"}`, pageWidth / 2 + 35, detailY);

  detailY += 5;
  doc.setFont(undefined, "bold");
  doc.text("Work order Date:", pageWidth / 2 + 5, detailY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${formatDate(bill.workOrderDate)}`, pageWidth / 2 + 35, detailY);

  detailY += 5;
  doc.setFont(undefined, "bold");
  doc.text("R/A Bill No:", pageWidth / 2 + 5, detailY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.raBillNo || "N/A"}`, pageWidth / 2 + 35, detailY);

  cursorY += detailsBoxHeight + 6;

  // ===== DETAILS OF RECEIVER AND SERVICE PROVIDER =====
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Details of Receiver / Billed to :", margin, cursorY);
  doc.text(
    "Details of Project / Service rendered at :",
    pageWidth / 2 + 2,
    cursorY
  );

  // Add registration number on the right
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  const regNumber = "88201722720";
  doc.text(regNumber, pageWidth - margin - 30, cursorY, { align: "left" });

  cursorY += 6;

  // Receiver box
  doc.rect(margin, cursorY, (pageWidth - 2 * margin) / 2 - 1, 28);
  let receiverY = cursorY + 4;
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text("Name", margin + 2, receiverY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyName}`, margin + 20, receiverY);

  receiverY += 5;
  doc.setFont(undefined, "bold");
  doc.text("Address", margin + 2, receiverY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyAddress}`, margin + 20, receiverY);

  receiverY += 5;
  doc.setFont(undefined, "bold");
  doc.text("GSTIN No", margin + 2, receiverY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyGSTIN}`, margin + 20, receiverY);

  receiverY += 5;
  doc.setFont(undefined, "bold");
  doc.text("State", margin + 2, receiverY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyStateCode}`, margin + 20, receiverY);
  doc.setFont(undefined, "bold");
  doc.text("State Code", margin + 45, receiverY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyStateCode}`, margin + 68, receiverY);

  // Provider box
  doc.rect(pageWidth / 2 + 2, cursorY, (pageWidth - 2 * margin) / 2 - 2, 28);
  let providerY = cursorY + 4;
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text("Name", pageWidth / 2 + 4, providerY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.providerName}`, pageWidth / 2 + 20, providerY);

  providerY += 5;
  doc.setFont(undefined, "bold");
  doc.text("Address", pageWidth / 2 + 4, providerY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.providerAddress}`, pageWidth / 2 + 20, providerY);

  providerY += 5;
  doc.setFont(undefined, "bold");
  doc.text("GSTIN No", pageWidth / 2 + 4, providerY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.providerGSTIN}`, pageWidth / 2 + 20, providerY);

  providerY += 5;
  doc.setFont(undefined, "bold");
  doc.text("State", pageWidth / 2 + 4, providerY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyStateCode}`, pageWidth / 2 + 20, providerY);
  doc.setFont(undefined, "bold");
  doc.text("State Code", pageWidth / 2 + 45, providerY);
  doc.setFont(undefined, "normal");
  doc.text(`: ${bill.billingPartyStateCode}`, pageWidth / 2 + 68, providerY);

  cursorY += 35;

  // ===== ITEMS TABLE =====
  const tableData: any[] = [];

  // Add header row
  const headerRow = [
    {
      content: "Sl.",
      styles: {
        fontStyle: "bold",
        fillColor: [200, 200, 200],
        halign: "center",
      },
    },
    {
      content: "Brief Description of Items",
      styles: {
        fontStyle: "bold",
        fillColor: [200, 200, 200],
        halign: "center",
      },
    },
    {
      content: "SAC/HSN Code",
      styles: {
        fontStyle: "bold",
        fillColor: [200, 200, 200],
        halign: "center",
      },
    },
    {
      content: "Unit",
      styles: {
        fontStyle: "bold",
        fillColor: [200, 200, 200],
        halign: "center",
      },
    },
    {
      content: "Rate (Rs)",
      styles: {
        fontStyle: "bold",
        fillColor: [200, 200, 200],
        halign: "center",
      },
    },
    {
      content: "Quantity",
      styles: {
        fontStyle: "bold",
        fillColor: [200, 200, 200],
        halign: "center",
        colSpan: 3,
      },
    },
    {},
    {},
    {
      content: "Amount",
      styles: {
        fontStyle: "bold",
        fillColor: [200, 200, 200],
        halign: "center",
        colSpan: 3,
      },
    },
    {},
    {},
  ];

  // Sub-headers for Quantity and Amount columns
  const subHeaderRow = [
    "",
    "",
    "",
    "",
    "",
    "Prev ious",
    "Present",
    "Cumulative",
    "Previous",
    "Present",
    "Cumulative",
  ];

  // Build table data
  bill.categories.forEach((category, catIndex) => {
    const categoryLabel = `${category.categoryCode}. ${category.categoryName}${
      category.tower ? ` (${category.tower})` : ""
    }`;
    tableData.push([
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: categoryLabel,
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
      {
        content: "",
        styles: { fontSize: 7, fontStyle: "bold", fillColor: [245, 245, 245] },
      },
    ]);

    // Line items
    category.lineItems.forEach((line) => {
      tableData.push([
        {
          content: String(line.slNo),
          styles: { fontSize: 6, halign: "center" },
        },
        { content: line.description, styles: { fontSize: 6 } },
        {
          content: line.sacHsnCode || "—",
          styles: { fontSize: 6, halign: "center" },
        },
        { content: line.unit, styles: { fontSize: 6, halign: "center" } },
        {
          content: String(line.unitRate?.toFixed(2) || "0.00"),
          styles: { fontSize: 6, halign: "right" },
        },
        {
          content: String(line.previousQuantity?.toFixed(2) || "0.00"),
          styles: { fontSize: 6, halign: "right" },
        },
        {
          content: String(line.presentQuantity?.toFixed(2) || "0.00"),
          styles: { fontSize: 6, halign: "right", fillColor: [255, 240, 245] },
        },
        {
          content: String(line.cumulativeQuantity?.toFixed(2) || "0.00"),
          styles: { fontSize: 6, halign: "right" },
        },
        {
          content: String(line.previousAmount?.toFixed(2) || "0.00"),
          styles: { fontSize: 6, halign: "right" },
        },
        {
          content: String(line.presentAmount?.toFixed(2) || "0.00"),
          styles: { fontSize: 6, halign: "right", fillColor: [255, 240, 245] },
        },
        {
          content: String(line.cumulativeAmount?.toFixed(2) || "0.00"),
          styles: { fontSize: 6, halign: "right" },
        },
      ]);
    });
  });

  // @ts-ignore
  doc.autoTable({
    startY: cursorY,
    head: [headerRow, subHeaderRow],
    body: tableData,
    margin: margin,
    styles: {
      fontSize: 6,
      cellPadding: 2,
      valign: "middle",
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 42 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 13, halign: "center" },
      4: { cellWidth: 16, halign: "right" },
      5: { cellWidth: 14, halign: "right" },
      6: { cellWidth: 14, halign: "right" },
      7: { cellWidth: 14, halign: "right" },
      8: { cellWidth: 14, halign: "right" },
      9: { cellWidth: 14, halign: "right" },
      10: { cellWidth: 14, halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || cursorY;
  cursorY = finalY + 5;

  // ===== SUMMARY SECTION =====
  // Add a separator line before summary
  cursorY += 2;
  doc.setDrawColor(150, 150, 150);
  doc.line(pageWidth - margin - 85, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Total Amount:", pageWidth - margin - 80, cursorY);
  doc.setFont(undefined, "normal");
  doc.text(formatRsForPDF(bill.totalAmount), pageWidth - margin - 30, cursorY, {
    align: "right",
  });

  cursorY += 6;
  doc.setFont(undefined, "bold");
  doc.text(
    `TDS (${bill.tdsPercentage || 0}%):`,
    pageWidth - margin - 80,
    cursorY
  );
  doc.setFont(undefined, "normal");
  doc.text(
    formatRsForPDF(bill.tdsAmount || 0),
    pageWidth - margin - 30,
    cursorY,
    {
      align: "right",
    }
  );

  cursorY += 6;
  doc.setFont(undefined, "bold");
  doc.text("Debit/Adjust:", pageWidth - margin - 80, cursorY);
  doc.setFont(undefined, "normal");
  doc.text(
    formatRsForPDF(bill.debitAdjustValue || 0),
    pageWidth - margin - 30,
    cursorY,
    { align: "right" }
  );

  cursorY += 2;
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - margin - 85, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Net Bill Amount:", pageWidth - margin - 80, cursorY);
  doc.setFont(undefined, "bold");
  doc.text(
    formatRsForPDF(bill.netBillAmount),
    pageWidth - margin - 30,
    cursorY,
    {
      align: "right",
    }
  );

  // ===== FOOTER =====
  doc.setFontSize(7);
  doc.setFont(undefined, "normal");
  doc.text(
    "Generated via ERP System • System Generated Document",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return doc;
};

const downloadClientBillPdf = async (bill: ClientBillRecord) => {
  const doc = generateClientBillPdf(bill);
  const blob = doc.output("blob");
  const fileName = `Client_Bill_${bill.invoiceNo}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  saveAs(blob, fileName);
};

const deserializeLineItemRecord = (line: any): BillLineItemRecord => ({
  id: line.id || generateTempId(),
  categoryId: line.categoryId || "",
  slNo: coerceNumber(line.slNo),
  description: line.description || "",
  sacHsnCode: line.sacHsnCode || "",
  unit: line.unit || "",
  unitRate: coerceNumber(line.unitRate),
  previousQuantity: coerceNumber(line.previousQuantity),
  presentQuantity: coerceNumber(line.presentQuantity),
  cumulativeQuantity: coerceNumber(line.cumulativeQuantity),
  previousAmount: coerceNumber(line.previousAmount),
  presentAmount: coerceNumber(line.presentAmount),
  cumulativeAmount: coerceNumber(line.cumulativeAmount),
  isDeduction: Boolean(line.isDeduction),
  isRevisedRate: Boolean(line.isRevisedRate),
});

const deserializeCategoryRecord = (category: any): BillCategoryRecord => ({
  id: category.id || generateTempId(),
  clientBillId: category.clientBillId || "",
  categoryCode: category.categoryCode || "",
  categoryName: category.categoryName || "",
  tower: category.tower || "",
  description: category.description || "",
  sequence: coerceNumber(category.sequence),
  lineItems: (category.lineItems || []).map(deserializeLineItemRecord),
});

const deserializeClientBillRecord = (bill: any): ClientBillRecord => ({
  id: bill.id || generateTempId(),
  invoiceNo: bill.invoiceNo || "",
  invoiceDate: bill.invoiceDate || "",
  workOrderNo: bill.workOrderNo || "",
  workOrderDate: bill.workOrderDate || "",
  raBillNo: bill.raBillNo || "",
  reverseCharges: Boolean(bill.reverseCharges),
  billingPartyName: bill.billingPartyName || "",
  billingPartyAddress: bill.billingPartyAddress || "",
  billingPartyGSTIN: bill.billingPartyGSTIN || "",
  billingPartyState: bill.billingPartyState || "",
  billingPartyStateCode: bill.billingPartyStateCode || "",
  providerName: bill.providerName || "",
  providerAddress: bill.providerAddress || "",
  providerGSTIN: bill.providerGSTIN || "",
  providerState: bill.providerState || "",
  providerStateCode: bill.providerStateCode || "",
  projectName: bill.projectName || "",
  projectLocation: bill.projectLocation || "",
  contractorName: bill.contractorName || "",
  contractorVillage: bill.contractorVillage || "",
  contractorPost: bill.contractorPost || "",
  contractorDistrict: bill.contractorDistrict || "",
  contractorPin: bill.contractorPin || "",
  contractorPAN: bill.contractorPAN || "",
  totalAmount: coerceNumber(bill.totalAmount),
  tdsPercentage: coerceNumber(bill.tdsPercentage),
  tdsAmount: coerceNumber(bill.tdsAmount),
  netBillAmount: coerceNumber(bill.netBillAmount),
  debitAdjustValue:
    bill.debitAdjustValue !== null && bill.debitAdjustValue !== undefined
      ? coerceNumber(bill.debitAdjustValue)
      : undefined,
  bankName: bill.bankName || "",
  bankBranch: bill.bankBranch || "",
  accountNo: bill.accountNo || "",
  ifscCode: bill.ifscCode || "",
  categories: (bill.categories || []).map(deserializeCategoryRecord),
  createdAt: bill.createdAt,
  updatedAt: bill.updatedAt,
  status: bill.status || "DRAFT",
});

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token =
    sessionStorage.getItem("jwt_token") ||
    localStorage.getItem("jwt_token_backup");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AccountsDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [showGenerateTaxModal, setShowGenerateTaxModal] = useState(false);
  const [showEditTaxModal, setShowEditTaxModal] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [isLabourWagesModalOpen, setIsLabourWagesModalOpen] = useState(false);
  const [labourWages, setLabourWages] = useState([]);
  const [collections, setCollections] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [collectionTrends, setCollectionTrends] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [payrollStats, setPayrollStats] = useState({
    totalEmployees: 0,
    payrollAmount: "",
    avgSalary: "",
    compliance: "",
  }); // legacy, not displayed
  const [kpiData, setKpiData] = useState({
    totalOutstanding: 0,
    overdueAmount: 0,
    paidThisMonth: 0,
  });
  const [taxes, setTaxes] = useState([]);
  const [taxCharges, setTaxCharges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [budgetMetrics, setBudgetMetrics] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    projectCount: 0,
  });
  const [isClientBillFormOpen, setIsClientBillFormOpen] = useState(false);
  const [clientBills, setClientBills] = useState<ClientBillRecord[]>([]);
  const [clientBillsLoading, setClientBillsLoading] = useState(true);
  const [clientBillsError, setClientBillsError] = useState<string | null>(null);
  const [isClientBillSaving, setIsClientBillSaving] = useState(false);
  const [downloadingBillId, setDownloadingBillId] = useState<string | null>(
    null
  );
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [clientBillFormData, setClientBillFormData] =
    useState<ClientBillFormState>(createBlankClientBill());

  const calculatedTdsAmount = useMemo(() => {
    const amount = Number(clientBillFormData.totalAmount || 0);
    const rate = Number(clientBillFormData.tdsPercentage || 0);
    const computed = (amount * rate) / 100;
    return Number.isFinite(computed) ? Number(computed.toFixed(2)) : 0;
  }, [clientBillFormData.totalAmount, clientBillFormData.tdsPercentage]);

  const calculatedNetBillAmount = useMemo(() => {
    const base = Number(clientBillFormData.totalAmount || 0);
    const debit = Number(clientBillFormData.debitAdjustValue || 0);
    const computed = base - calculatedTdsAmount - debit;
    const safeValue = Number.isFinite(computed) ? computed : 0;
    return Number(Number(Math.max(safeValue, 0)).toFixed(2));
  }, [
    clientBillFormData.totalAmount,
    clientBillFormData.debitAdjustValue,
    calculatedTdsAmount,
  ]);

  // Memoized Payroll KPIs derived from employees with latestNetSalary
  const payrollKPIs = useMemo(() => {
    const active = employees.filter((e) => !e.leftAt);
    const totalEmployees = active.length;
    const totalPayroll = active.reduce(
      (sum, e) =>
        sum + (typeof e.latestNetSalary === "number" ? e.latestNetSalary : 0),
      0
    );
    const countWithSalary = active.reduce(
      (c, e) =>
        c +
        (typeof e.latestNetSalary === "number" && e.latestNetSalary > 0
          ? 1
          : 0),
      0
    );
    const avg = countWithSalary ? totalPayroll / countWithSalary : 0;
    return {
      totalEmployees,
      payrollAmountLabel: `₹${(totalPayroll / 1000000).toFixed(1)}M`,
      avgSalaryLabel: `₹${(avg / 1000).toFixed(0)}K`,
    };
  }, [employees]);

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/overview")) return "overview";
    if (path.includes("/invoicing")) return "invoicing";
    if (path.includes("/budget")) return "budget";
    if (path.includes("/payroll")) return "payroll";
    if (path.includes("/taxes")) return "taxes";
    if (path.includes("/client-bill")) return "client-bill";
    return "overview"; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      overview: "/accounts-manager/overview",
      invoicing: "/accounts-manager/invoicing",
      budget: "/accounts-manager/budget",
      payroll: "/accounts-manager/payroll",
      taxes: "/accounts-manager/taxes",
      "client-bill": "/accounts-manager/client-bill",
    };
    navigate(tabRoutes[value]);
  };

  useEffect(() => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch collections and invoices
    axios
      .get(`${API_URL}/accounts/collections`, { headers })
      .then((res) => setCollections(res.data))
      .catch(() => {});

    axios
      .get(`${API_URL}/billing/invoices`, { headers })
      .then((res) => {
        setInvoices(res.data);
        // Calculate KPI data from invoices
        calculateKPIData(res.data);
      })
      .catch(() => {});

    axios
      .get(`${API_URL}/hr/employees`, { headers })
      .then(async (res) => {
        const baseEmployees = res.data as any[];
        // Fetch all salaries and map latest net salary per employee
        try {
          const salariesRes = await axios.get(
            `${API_URL}/hr-salary/employee-salaries`,
            { headers }
          );
          const salaries = salariesRes.data as any[];
          // Build latest net salary map by employeeId
          const latestMap = new Map<string, number>();
          for (const s of salaries) {
            const empId = s.employeeId;
            const current = latestMap.get(empId);
            const date = s.paymentDate || s.createdAt;
            // Store by the latest date
            if (!current) {
              latestMap.set(empId, s.netSalary || 0);
            }
          }
          const enriched = baseEmployees.map((e) => ({
            ...e,
            latestNetSalary: latestMap.get(e.id) ?? null,
          }));
          setEmployees(enriched);
        } catch (e) {
          // If salaries fetch fails, still render employees with N/A salary
          const enriched = baseEmployees.map((e) => ({
            ...e,
            latestNetSalary: null,
          }));
          setEmployees(enriched);
        }
      })
      .catch(() => {});

    // Fetch projects data
    fetchProjects();

    // Fetch payments data
    axios
      .get(`${API_URL}/billing/payments`, { headers })
      .then((res) => setPayments(res.data))
      .catch(() => {});

    // Fetch labour wages data
    fetchLabourWages();
  }, []);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/projects`, { headers });
      const projectsData = response.data;
      setProjects(projectsData);

      // Calculate budget metrics from projects data
      calculateBudgetMetrics(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch project data");
      // Set fallback empty data to prevent UI crashes
      setProjects([]);
      setBudgetMetrics({
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        projectCount: 0,
      });
      setBudgetData([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchLabourWages = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_URL}/non-billables`, { headers });
      setLabourWages(response.data);
    } catch (error) {
      console.error("Error fetching labour wages:", error);
    }
  };

  const calculateBudgetMetrics = (projectsData: any[]) => {
    let totalBudget = 0;
    let totalSpent = 0;

    // For each project, calculate budget and spent amounts
    const updatedBudgetData = projectsData.map((project: any) => {
      // Use actual project budget from the budget field
      const projectBudget = project.budget || 0;

      // Calculate spent amount as sum of non-billables (labour wages) + invoices for this project
      const projectNonBillables = project.nonBillables || [];
      const nonBillableTotal = projectNonBillables.reduce(
        (sum: number, nb: any) => sum + (nb.amount || 0),
        0
      );

      const projectInvoices = project.invoices || [];
      const invoiceTotal = projectInvoices.reduce(
        (sum: number, invoice: any) =>
          sum + (invoice.total || invoice.amount || 0),
        0
      );

      const projectSpent = nonBillableTotal + invoiceTotal;

      totalBudget += projectBudget;
      totalSpent += projectSpent;

      return {
        project: project.name,
        budgeted: projectBudget,
        actual: projectSpent,
        variance: projectBudget - projectSpent,
      };
    });

    setBudgetData(updatedBudgetData);
    setBudgetMetrics({
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      projectCount: projectsData.length,
    });
  };

  const calculateKPIData = (invoicesData: Invoice[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Total outstanding: sum of all unpaid/overdue invoices
    const totalOutstanding = invoicesData
      .filter((invoice) => invoice.status !== "PAID")
      .reduce(
        (sum, invoice) => sum + (invoice.total || invoice.amount || 0),
        0
      );

    // Overdue amount: invoices past due date minus payments
    const overdueAmount = invoicesData
      .filter((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        return dueDate < currentDate && invoice.status !== "PAID";
      })
      .reduce((sum, invoice) => {
        const invoiceAmount = invoice.total || invoice.amount || 0;
        const paymentsSum = (invoice.Payment || [])
          .filter((payment: any) => payment.paymentType === "RECEIVE")
          .reduce((paySum, payment) => paySum + payment.total, 0);
        return sum + Math.max(0, invoiceAmount - paymentsSum);
      }, 0);

    // Paid this month: sum of payments in current month
    const paidThisMonth = invoicesData
      .flatMap((invoice) => invoice.Payment || [])
      .filter((payment) => {
        const paymentDate = new Date(payment.postingDate);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear &&
          payment.paymentType === "RECEIVE"
        );
      })
      .reduce((sum, payment) => sum + payment.total, 0);

    setKpiData({
      totalOutstanding,
      overdueAmount,
      paidThisMonth,
    });
  };

  const fetchClientBills = useCallback(async () => {
    setClientBillsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/client-bills`, { headers });
      const normalized = Array.isArray(response.data)
        ? response.data.map(deserializeClientBillRecord)
        : [];
      // Filter to show only APPROVED client bills
      const approvedBills = normalized.filter(
        (bill) => bill.status === "APPROVED"
      );
      setClientBills(approvedBills);
      setClientBillsError(null);
    } catch (error: any) {
      console.error("Error fetching client bills:", error);
      setClientBillsError(
        error?.response?.data?.message || "Failed to load client bills"
      );
      toast.error(
        error?.response?.data?.message || "Failed to load client bills"
      );
    } finally {
      setClientBillsLoading(false);
    }
  }, []);

  const handleDownloadClientBill = async (bill: ClientBillRecord) => {
    setDownloadingBillId(bill.id);
    try {
      await downloadClientBillPdf(bill);
      toast.success(`Client bill ${bill.invoiceNo} downloaded`);
    } catch (error) {
      console.error("Error downloading client bill:", error);
      toast.error("Failed to download client bill");
    } finally {
      setDownloadingBillId(null);
    }
  };

  const handleDeleteClientBill = async (bill: ClientBillRecord) => {
    setDeletingBillId(bill.id);
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/client-bills/${bill.id}`, { headers });
      setClientBills((prev) =>
        prev.filter((existing) => existing.id !== bill.id)
      );
      toast.success(`Client bill ${bill.invoiceNo} deleted`);
    } catch (error: any) {
      console.error("Error deleting client bill:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete client bill"
      );
    } finally {
      setDeletingBillId(null);
    }
  };

  const requestDeleteClientBill = (bill: ClientBillRecord) => {
    toast.warning(`Delete client bill ${bill.invoiceNo}?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => handleDeleteClientBill(bill),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const numericBillFields: Array<keyof ClientBillFormState> = [
    "totalAmount",
    "tdsPercentage",
    "debitAdjustValue",
  ];
  const numericCategoryFields: Array<keyof BillCategoryRecord> = ["sequence"];
  const numericLineItemFields: Array<keyof BillLineItemRecord> = [
    "slNo",
    "unitRate",
    "previousQuantity",
    "presentQuantity",
    "cumulativeQuantity",
    "previousAmount",
    "presentAmount",
    "cumulativeAmount",
  ];

  const handleClientBillFieldChange = (
    field: keyof ClientBillFormState,
    value: string | number | boolean
  ) => {
    setClientBillFormData((prev) => {
      const parsedValue = numericBillFields.includes(field)
        ? Number(value) || 0
        : value;
      return {
        ...prev,
        [field]: parsedValue as ClientBillFormState[typeof field],
      };
    });
  };

  const handleCategoryFieldChange = (
    categoryIndex: number,
    field: keyof BillCategoryRecord,
    value: string | number
  ) => {
    setClientBillFormData((prev) => {
      const updatedCategories = prev.categories.map((category, idx) => {
        if (idx !== categoryIndex) return category;
        const parsedValue = numericCategoryFields.includes(field)
          ? Number(value) || 0
          : value;
        return {
          ...category,
          [field]: parsedValue as BillCategoryRecord[typeof field],
        };
      });
      return { ...prev, categories: updatedCategories };
    });
  };

  const handleLineItemFieldChange = (
    categoryIndex: number,
    lineIndex: number,
    field: keyof BillLineItemRecord,
    value: string | number | boolean
  ) => {
    setClientBillFormData((prev) => {
      const updatedCategories = prev.categories.map((category, idx) => {
        if (idx !== categoryIndex) return category;
        const updatedLineItems = category.lineItems.map((line, lIdx) => {
          if (lIdx !== lineIndex) return line;
          const parsedValue = numericLineItemFields.includes(field)
            ? Number(value) || 0
            : value;
          return {
            ...line,
            [field]: parsedValue as BillLineItemRecord[typeof field],
          };
        });
        return { ...category, lineItems: updatedLineItems };
      });
      return { ...prev, categories: updatedCategories };
    });
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
        (_, idx) => idx !== categoryIndex
      );
      return { ...prev, categories: updatedCategories };
    });
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

  const handleClientBillSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isClientBillSaving) return;
    const normalizeDateValue = (value?: string) => {
      if (!value) return undefined;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    };

    const sanitizedCategories = clientBillFormData.categories.map(
      (category, index) => {
        return {
          categoryCode: category.categoryCode,
          categoryName: category.categoryName,
          tower: category.tower || undefined,
          description: category.description || undefined,
          sequence: category.sequence || index + 1,
          lineItems: category.lineItems.map((line, lineIndex) => ({
            slNo: line.slNo || lineIndex + 1,
            description: line.description,
            sacHsnCode: line.sacHsnCode || undefined,
            unit: line.unit,
            unitRate: Number(line.unitRate) || 0,
            previousQuantity: Number(line.previousQuantity) || 0,
            presentQuantity: Number(line.presentQuantity) || 0,
            cumulativeQuantity: Number(line.cumulativeQuantity) || 0,
            previousAmount: Number(line.previousAmount) || 0,
            presentAmount: Number(line.presentAmount) || 0,
            cumulativeAmount: Number(line.cumulativeAmount) || 0,
            isDeduction: Boolean(line.isDeduction),
            isRevisedRate: Boolean(line.isRevisedRate),
          })),
        };
      }
    );

    const totalAmount = Number(clientBillFormData.totalAmount || 0);
    const debitAdjustValue = Number(clientBillFormData.debitAdjustValue || 0);

    const payload = {
      invoiceNo: clientBillFormData.invoiceNo,
      invoiceDate:
        normalizeDateValue(clientBillFormData.invoiceDate) ||
        new Date().toISOString(),
      workOrderNo: clientBillFormData.workOrderNo || undefined,
      workOrderDate: normalizeDateValue(clientBillFormData.workOrderDate),
      raBillNo: clientBillFormData.raBillNo || undefined,
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
      projectName: clientBillFormData.projectName || undefined,
      projectLocation: clientBillFormData.projectLocation || undefined,
      contractorName: clientBillFormData.contractorName || undefined,
      contractorVillage: clientBillFormData.contractorVillage || undefined,
      contractorPost: clientBillFormData.contractorPost || undefined,
      contractorDistrict: clientBillFormData.contractorDistrict || undefined,
    };

    setIsClientBillSaving(true);
    try {
      const headers = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      const response = await axios.post(`${API_URL}/client-bills`, payload, {
        headers,
      });
      const savedBill = deserializeClientBillRecord(response.data);
      setClientBills((prev) => [savedBill, ...prev]);
      toast.success("Client bill saved successfully!");
      setClientBillFormData(createBlankClientBill());
      setIsClientBillFormOpen(false);
    } catch (error: any) {
      console.error("Error saving client bill:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save client bill"
      );
    } finally {
      setIsClientBillSaving(false);
    }
  };

  useEffect(() => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(`${API_URL}/accounts/collection-trends`, { headers })
      .then((res) => setCollectionTrends(res.data))
      .catch(() => {});
    // Budget data is now calculated from projects in fetchProjects()
    axios
      .get(`${API_URL}/accounts/payroll-stats`, { headers })
      .then((res) => setPayrollStats(res.data))
      .catch(() => {});

    // Fetch tax data
    axios
      .get(`${API_URL}/tax/taxes`, { headers })
      .then((res) => setTaxes(res.data))
      .catch(() => {});

    axios
      .get(`${API_URL}/tax/tax-charges`, { headers })
      .then((res) => setTaxCharges(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchClientBills();
  }, [fetchClientBills]);

  const handleGenerateInvoice = () => {
    toast.success("Invoice generated and sent successfully!");
    setIsInvoiceModalOpen(false);
  };

  const handleProcessPayroll = () => {
    toast.success("Payroll processed successfully!");
    setIsPayrollModalOpen(false);
  };

  const handleSetBudgetCap = () => {
    toast.success("Budget cap configured successfully!");
    setIsBudgetModalOpen(false);
  };

  const handleAutoMatch = () => {
    toast.success("Bank receipts auto-matched successfully!");
    setIsReconcileModalOpen(false);
  };

  const handleBulkReminder = () => {
    toast.success("Bulk reminder sent to all overdue clients!");
  };

  const handleEditTax = (tax: Tax) => {
    setSelectedTax(tax);
    setShowEditTaxModal(true);
  };

  const handleDeleteTax = async (tax: Tax) => {
    if (
      !confirm(
        `Are you sure you want to delete the tax "${tax.title}"? This will also delete all associated tax charges.`
      )
    ) {
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Delete the tax (this should cascade and delete tax charges)
      await axios.delete(`${API_URL}/tax/taxes/${tax.id}`, { headers });

      // Refresh the tax data
      const [taxesResponse, taxChargesResponse] = await Promise.all([
        axios.get(`${API_URL}/tax/taxes`, { headers }),
        axios.get(`${API_URL}/tax/tax-charges`, { headers }),
      ]);

      setTaxes(taxesResponse.data);
      setTaxCharges(taxChargesResponse.data);
      toast.success("Tax deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting tax:", error);
      toast.error(error.response?.data?.message || "Failed to delete tax");
    }
  };

  const handleLabourWagesSuccess = () => {
    fetchLabourWages();
    fetchProjects(); // Refresh projects to update budget calculations
  };

  const handleDeleteLabourWage = async (wageId: string, wageName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the labour wage entry "${wageName}"?`
      )
    ) {
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/non-billables/${wageId}`, { headers });

      toast.success("Labour wage entry deleted successfully!");
      fetchLabourWages(); // Refresh the labour wages list
      fetchProjects(); // Refresh projects to update budget calculations
    } catch (error: any) {
      console.error("Error deleting labour wage:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete labour wage entry"
      );
    }
  };

  const handleDeleteTaxCharge = async (taxCharge: any) => {
    if (
      !confirm(
        `Are you sure you want to delete this tax charge (${taxCharge.type} - ${taxCharge.accountHead})?`
      )
    ) {
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Delete the tax charge
      await axios.delete(`${API_URL}/tax/tax-charges/${taxCharge.id}`, {
        headers,
      });

      // Refresh the tax charges data
      const taxChargesResponse = await axios.get(`${API_URL}/tax/tax-charges`, {
        headers,
      });
      setTaxCharges(taxChargesResponse.data);
      toast.success("Tax charge deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting tax charge:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete tax charge"
      );
    }
  };

  const handleTaxUpdated = async (updatedTax: Tax) => {
    // Refresh the tax data from backend to get updated tax charges
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [taxesResponse, taxChargesResponse] = await Promise.all([
        axios.get(`${API_URL}/tax/taxes`, { headers }),
        axios.get(`${API_URL}/tax/tax-charges`, { headers }),
      ]);

      setTaxes(taxesResponse.data);
      setTaxCharges(taxChargesResponse.data);
      toast.success("Tax updated successfully!");
    } catch (error) {
      console.error("Error refreshing tax data:", error);
      // Fallback to local update if refresh fails
      setTaxes(
        taxes.map((tax) => (tax.id === updatedTax.id ? updatedTax : tax))
      );
      toast.success("Tax updated successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Accounts Dashboard
          </h1>
          <p className="text-muted-foreground">
            Financial management and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsInvoiceModalOpen(true)} className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Invoice
          </Button>
          <Button
            onClick={() => setShowGenerateTaxModal(true)}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            Generate Tax
          </Button>
          {/* <Button onClick={handleBulkReminder} variant="outline" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Bulk Reminder
                    </Button> */}
        </div>
      </div>

      <Tabs
        value={getCurrentTab()}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        {/* Hide tabs on mobile - navigation is handled by sidebar */}
        <TabsList className="hidden md:grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="budget">Budget Control</TabsTrigger>
          <TabsTrigger value="payroll">Payroll & Compliance</TabsTrigger>
          <TabsTrigger value="taxes">Tax Management</TabsTrigger>
          <TabsTrigger value="client-bill">Client Bill</TabsTrigger>
          {/* <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger> */}
        </TabsList>

        {/* Mobile-specific section header */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              {getCurrentTab() === "overview" ? (
                <PieChart className="h-5 w-5 text-primary" />
              ) : getCurrentTab() === "invoicing" ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : getCurrentTab() === "budget" ? (
                <Calculator className="h-5 w-5 text-primary" />
              ) : getCurrentTab() === "payroll" ? (
                <Users className="h-5 w-5 text-primary" />
              ) : getCurrentTab() === "client-bill" ? (
                <FileText className="h-5 w-5 text-primary" />
              ) : (
                <DollarSign className="h-5 w-5 text-primary" />
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  {getCurrentTab() === "overview"
                    ? "Overview"
                    : getCurrentTab() === "invoicing"
                    ? "Invoicing"
                    : getCurrentTab() === "budget"
                    ? "Budget Control"
                    : getCurrentTab() === "payroll"
                    ? "Payroll & Compliance"
                    : getCurrentTab() === "client-bill"
                    ? "Client Bill"
                    : "Tax Management"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Accounts ›{" "}
                  {getCurrentTab() === "overview"
                    ? "Overview"
                    : getCurrentTab() === "invoicing"
                    ? "Invoicing"
                    : getCurrentTab() === "budget"
                    ? "Budget Control"
                    : getCurrentTab() === "payroll"
                    ? "Payroll & Compliance"
                    : getCurrentTab() === "client-bill"
                    ? "Client Bill"
                    : "Tax Management"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Outstanding"
              value={`₹${(kpiData.totalOutstanding / 100000).toFixed(2)}L`}
              icon={DollarSign}
              description="Pending collections"
              trend={{ value: -5, label: "vs last month" }}
              onClick={() => toast.info("Viewing outstanding breakdown")}
            />
            <StatCard
              title="Overdue Amount"
              value={`₹${(kpiData.overdueAmount / 100000).toFixed(2)}L`}
              icon={AlertTriangle}
              description="Past due date"
              onClick={() => toast.info("Opening overdue analysis")}
            />
            <StatCard
              title="Paid This Month"
              value={`₹${(kpiData.paidThisMonth / 100000).toFixed(2)}L`}
              icon={DollarSign}
              description="Payment received"
              trend={{ value: 12, label: "vs last month" }}
              onClick={() => toast.info("Viewing collection report")}
            />
            {/* <StatCard
              title="Collection Rate"
              value="92%"
              icon={FileText}
              description="Payment efficiency"
              onClick={() => toast.info("Viewing efficiency metrics")}
            /> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Trends</CardTitle>
                <CardDescription>
                  Monthly invoicing and collection analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={collectionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `��${(Number(value) / 100000).toFixed(1)}L`,
                        "",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="invoiced"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="collected"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="outstanding"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Tracking</CardTitle>
                <CardDescription>
                  Recent payment activities and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collections
                    .slice(0, 5)
                    .map((payment: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {payment.partyName || payment.party}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.modeOfPayment || "Bank Transfer"} •{" "}
                            {new Date(
                              payment.postingDate || payment.createdAt
                            ).toLocaleDateString()}
                          </p>
                          <Badge
                            variant={
                              payment.paymentType === "RECEIVE"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1"
                          >
                            {payment.paymentType}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹
                            {(
                              (payment.total || payment.amount || 0) / 1000
                            ).toFixed(0)}
                            K
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.accountPaidTo || "Main Account"}
                          </p>
                        </div>
                      </div>
                    ))}
                  {collections.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No recent payments</p>
                      <p className="text-sm">
                        Payment activities will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cash Flow Summary</CardTitle>
              <CardDescription>
                Inflow vs outflow for the current month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{(kpiData.paidThisMonth / 100000).toFixed(1)}L
                  </div>
                  <p className="text-sm text-muted-foreground">Cash Inflow</p>
                  <p className="text-xs text-green-600">Payments received</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    ₹
                    {(
                      (kpiData.totalOutstanding - kpiData.overdueAmount) /
                      100000
                    ).toFixed(1)}
                    L
                  </div>
                  <p className="text-sm text-muted-foreground">Cash Outflow</p>
                  <p className="text-xs text-red-600">Payments made</p>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      kpiData.paidThisMonth >
                      kpiData.totalOutstanding - kpiData.overdueAmount
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹
                    {(
                      (kpiData.paidThisMonth -
                        (kpiData.totalOutstanding - kpiData.overdueAmount)) /
                      100000
                    ).toFixed(1)}
                    L
                  </div>
                  <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                  <p
                    className={`text-xs ${
                      kpiData.paidThisMonth >
                      kpiData.totalOutstanding - kpiData.overdueAmount
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {kpiData.paidThisMonth >
                    kpiData.totalOutstanding - kpiData.overdueAmount
                      ? "Positive"
                      : "Negative"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Invoiced"
              value={`₹${(
                invoices.reduce(
                  (sum, inv) => sum + (inv.total || inv.amount || 0),
                  0
                ) / 100000
              ).toFixed(2)}L`}
              icon={FileText}
              description="This month"
              trend={{ value: 8, label: "vs last month" }}
            />
            <StatCard
              title="Paid Invoices"
              value={`₹${(
                payments
                  .filter((payment: any) => payment.paymentType === "RECEIVE")
                  .reduce((sum, payment) => sum + (payment.total || 0), 0) /
                100000
              ).toFixed(2)}L`}
              icon={Check}
              description="Total payments received"
              trend={{ value: 12, label: "vs last month" }}
            />
            <StatCard
              title="Pending Amount"
              value={`₹${(
                (invoices.reduce(
                  (sum, inv) => sum + (inv.total || inv.amount || 0),
                  0
                ) -
                  payments
                    .filter((payment: any) => payment.paymentType === "RECEIVE")
                    .reduce((sum, payment) => sum + (payment.total || 0), 0)) /
                100000
              ).toFixed(2)}L`}
              icon={AlertTriangle}
              description="Total Invoiced - Paid Invoices"
              trend={{ value: -15, label: "vs last month" }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Track and manage invoice status with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.slice(0, 10).map((invoice: any) => (
                  <div key={invoice.id} className="border rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const expanded = document.getElementById(
                              `invoice-${invoice.id}`
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
                            {invoice.invoiceNumber ||
                              `INV-${invoice.id?.slice(0, 8)}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.client?.name ||
                              invoice.clientName ||
                              "N/A"}{" "}
                            • {invoice.project?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            ₹
                            {(
                              (invoice.total || invoice.amount || 0) / 100000
                            ).toFixed(1)}
                            L
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due:{" "}
                            {new Date(invoice.dueDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            invoice.status === "PAID"
                              ? "default"
                              : invoice.status === "OVERDUE"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>

                    <div
                      id={`invoice-${invoice.id}`}
                      style={{ display: "none" }}
                      className="border-t bg-muted/50 p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-2 text-sm">
                            Invoice Details
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div>
                              Invoice Date:{" "}
                              {new Date(
                                invoice.date || invoice.createdAt
                              ).toLocaleDateString("en-IN")}
                            </div>
                            <div>Type: {invoice.type || "STANDARD"}</div>
                            <div>
                              Work Progress: {invoice.workCompletedPercent || 0}
                              %
                            </div>
                            <div>
                              GST Applied: {invoice.applyGst ? "Yes" : "No"}
                            </div>
                            <div>
                              Retention: {invoice.applyRetention ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">
                            Amount Breakdown
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div>
                              Subtotal: ₹
                              {((invoice.subtotal || 0) / 100000).toFixed(1)}L
                            </div>
                            <div>
                              Tax Amount: ₹
                              {((invoice.taxAmount || 0) / 1000).toFixed(0)}K
                            </div>
                            {invoice.retentionAmount > 0 && (
                              <div>
                                Retention: ₹
                                {(
                                  (invoice.retentionAmount || 0) / 1000
                                ).toFixed(0)}
                                K
                              </div>
                            )}
                            <div className="font-medium border-t pt-1">
                              Total: ₹
                              {(
                                (invoice.total || invoice.amount || 0) / 100000
                              ).toFixed(1)}
                              L
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-sm">
                            Invoice Items
                          </h4>
                          <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                            {(invoice.items || []).length > 0 ? (
                              (invoice.items || []).map(
                                (item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between"
                                  >
                                    <span>• {item.item}</span>
                                    <span>
                                      {item.quantity} {item.unit}
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
                          {(invoice.Payment || []).length > 0 && (
                            <div className="mt-3">
                              <h5 className="font-medium text-xs mb-1">
                                Payments Received
                              </h5>
                              <div className="space-y-1 text-xs">
                                {(invoice.Payment || [])
                                  .slice(0, 3)
                                  .map((payment: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        ₹
                                        {((payment.total || 0) / 1000).toFixed(
                                          0
                                        )}
                                        K
                                      </span>
                                      <span>
                                        {new Date(
                                          payment.postingDate
                                        ).toLocaleDateString("en-IN")}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No invoices found</p>
                    <p className="text-sm">
                      Generated invoices will appear here
                    </p>
                  </div>
                )}
                {invoices.length > 10 && (
                  <Button variant="outline" className="w-full">
                    View All {invoices.length} Invoices
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border rounded-lg p-4 space-y-3 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Budget"
                value={`₹${(budgetMetrics.totalBudget / 100000).toFixed(2)}L`}
                icon={DollarSign}
                description="All projects"
                trend={{
                  value: budgetMetrics.totalBudget > 0 ? 8 : 0,
                  label: "project allocations",
                }}
              />
              <StatCard
                title="Spent"
                value={`₹${(budgetMetrics.totalSpent / 100000).toFixed(2)}L`}
                icon={TrendingUp}
                description="Total expenses"
                trend={{
                  value:
                    budgetMetrics.totalBudget > 0
                      ? Math.round(
                          ((budgetMetrics.totalBudget -
                            budgetMetrics.totalSpent) /
                            budgetMetrics.totalBudget) *
                            100
                        ) - 100
                      : 0,
                  label:
                    budgetMetrics.totalSpent <= budgetMetrics.totalBudget
                      ? "under budget"
                      : "over budget",
                }}
              />
              <StatCard
                title="Remaining"
                value={`₹${(budgetMetrics.remaining / 100000).toFixed(2)}L`}
                icon={PieChart}
                description="Available funds"
                trend={{
                  value:
                    budgetMetrics.totalBudget > 0
                      ? Math.round(
                          (budgetMetrics.remaining /
                            budgetMetrics.totalBudget) *
                            100
                        )
                      : 0,
                  label: "of total budget",
                }}
              />
              <StatCard
                title="Projects"
                value={budgetMetrics.projectCount.toString()}
                icon={Users}
                description="Active projects"
                trend={{
                  value:
                    budgetMetrics.projectCount > 0
                      ? Math.round(
                          budgetMetrics.totalBudget /
                            budgetMetrics.projectCount /
                            100000
                        )
                      : 0,
                  label: "avg ₹L per project",
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>Project-wise comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        `₹${(Number(value) / 100000).toFixed(1)}L`,
                        "",
                      ]}
                    />
                    <Bar dataKey="budgeted" fill="#3b82f6" name="Budget" />
                    <Bar dataKey="actual" fill="#10b981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Details</CardTitle>
                <CardDescription>Project-wise breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetData.map((project, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{project.project}</span>
                        <span
                          className={
                            project.variance > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {project.variance > 0 ? "Under" : "Over"} by ₹
                          {Math.abs(project.variance / 100000).toFixed(2)}L
                        </span>
                      </div>
                      <Progress
                        value={(project.actual / project.budgeted) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          Spent: ₹{(project.actual / 100000).toFixed(2)}L
                        </span>
                        <span>
                          Budget: ₹{(project.budgeted / 100000).toFixed(2)}L
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Detailed breakdown of active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project: any) => {
                  const projectBudget = project.budget || 0;
                  const nonBillableTotal = (project.nonBillables || []).reduce(
                    (sum: number, nb: any) => sum + (nb.amount || 0),
                    0
                  );
                  const invoiceTotal = (project.invoices || []).reduce(
                    (sum: number, invoice: any) =>
                      sum + (invoice.total || invoice.amount || 0),
                    0
                  );
                  const projectSpent = nonBillableTotal + invoiceTotal;
                  const completionPercentage =
                    projectBudget > 0
                      ? (projectSpent / projectBudget) * 100
                      : 0;

                  return (
                    <div
                      key={project.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.client?.name || "No client"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Budget:</span>
                          <span>₹{(projectBudget / 100000).toFixed(2)}L</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Spent:</span>
                          <span>₹{(projectSpent / 100000).toFixed(1)}L</span>
                        </div>
                        <Progress
                          value={Math.min(completionPercentage, 100)}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {completionPercentage.toFixed(1)}% utilized
                          </span>
                          <span>{project.invoices?.length || 0} invoices</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Start:{" "}
                          {new Date(project.startDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>
                        <span>
                          End:{" "}
                          {new Date(project.endDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {projects.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No projects found</p>
                    <p className="text-sm">
                      Create projects to see budget analysis
                    </p>
                  </div>
                )}

                {projects.length > 6 && (
                  <div className="col-span-full">
                    <Button variant="outline" className="w-full">
                      View All {projects.length} Projects
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Employees"
              value={payrollKPIs.totalEmployees}
              icon={Users}
              description="Active staff"
              trend={{ value: 0, label: "vs last month" }}
            />
            {/* <StatCard
                            title="Payroll Amount"
                            value={payrollKPIs.payrollAmountLabel}
                            icon={DollarSign}
                            description="Sum of latest net salaries"
                            trend={{ value: 0, label: "vs last month" }}
                        /> */}
            <StatCard
              title="Avg. Salary"
              value={payrollKPIs.avgSalaryLabel}
              icon={TrendingUp}
              description="Per active employee"
            />
            <StatCard
              title="Labour Wages"
              value={`₹${(
                labourWages.reduce(
                  (sum: number, wage: any) => sum + (wage.amount || 0),
                  0
                ) / 1000
              ).toFixed(0)}K`}
              icon={Users}
              description="Total labour costs"
              trend={{ value: labourWages.length, label: "wage entries" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>
                  Manage employee information and payroll
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={payrollColumns} data={employees} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Labour Wages</CardTitle>
                  <CardDescription>
                    All labour wage entries across projects
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsLabourWagesModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Labour Wage
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labourWages.length > 0 ? (
                    labourWages.slice(0, 4).map((wage: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded-lg group hover:border-muted-foreground/20 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{wage.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {wage.project?.name || "No project"} •{" "}
                            {new Date(wage.createdAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                          {wage.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {wage.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium">
                              ₹{(wage.amount / 1000).toFixed(1)}K
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {wage.creator?.name || "Unknown"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteLabourWage(wage.id, wage.name)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No Labour Wages</p>
                      <p className="text-sm">
                        Click "Add Labour Wage" to create your first entry.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="client-bill" className="space-y-6">
          <Card className="border-primary/30">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Client Bill Register</CardTitle>
                <CardDescription>
                  Capture RA bills in the Quintessa layout with complete
                  metadata.
                </CardDescription>
              </div>
              <div className="flex flex-col w-full gap-2 md:w-auto md:flex-row">
                <Button
                  variant="outline"
                  onClick={fetchClientBills}
                  disabled={clientBillsLoading}
                  className="w-full md:w-auto"
                >
                  {clientBillsLoading ? (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </span>
                  )}
                </Button>
                <Button
                  variant="default"
                  onClick={() => setIsClientBillFormOpen(true)}
                  className="w-full md:w-auto"
                >
                  Add Client Bill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use the actions above to sync with the backend register or capture
              a new entry. Data displayed below reflects what is stored in the
              `/api/client-bills` service.
            </CardContent>
          </Card>

          {clientBillsError && (
            <Card className="border-destructive/30">
              <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-destructive">
                  {clientBillsError}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={fetchClientBills}
                  disabled={clientBillsLoading}
                >
                  Retry Fetch
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {clientBillsLoading && clientBills.length === 0 && (
              <Card>
                <CardContent className="py-10 space-y-4">
                  {[1, 2].map((row) => (
                    <div key={row} className="space-y-2 animate-pulse">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {!clientBillsLoading && clientBills.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-4 h-10 w-10 opacity-40" />
                  No client bills captured yet.
                </CardContent>
              </Card>
            )}
            {clientBills.map((bill) => (
              <Card key={bill.id} className="shadow-sm">
                <CardHeader className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Contractor
                      </p>
                      <p className="text-2xl font-semibold">
                        {bill.contractorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bill.contractorVillage}, {bill.contractorDistrict}, PIN{" "}
                        {bill.contractorPin}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PAN: {bill.contractorPAN}
                      </p>
                    </div>
                    <div className="text-right space-y-1 flex flex-col items-end gap-2">
                      <p className="text-lg font-semibold">
                        Invoice #{bill.invoiceNo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dated{" "}
                        {new Date(bill.invoiceDate).toLocaleDateString("en-IN")}
                      </p>
                      <Badge
                        variant={
                          bill.reverseCharges ? "destructive" : "secondary"
                        }
                      >
                        Reverse Charges{" "}
                        {bill.reverseCharges ? "Applicable" : "Not Applicable"}
                      </Badge>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDownloadClientBill(bill)}
                          disabled={
                            downloadingBillId === bill.id ||
                            deletingBillId === bill.id
                          }
                        >
                          <Download className="h-4 w-4" />
                          {downloadingBillId === bill.id
                            ? "Downloading..."
                            : "Download PDF"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => requestDeleteClientBill(bill)}
                          disabled={
                            deletingBillId === bill.id ||
                            downloadingBillId === bill.id
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingBillId === bill.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs uppercase text-muted-foreground">
                        Billing Party
                      </p>
                      <p className="font-semibold">{bill.billingPartyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {bill.billingPartyAddress}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        GSTIN: {bill.billingPartyGSTIN} • State{" "}
                        {bill.billingPartyStateCode}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs uppercase text-muted-foreground">
                        Service Provider
                      </p>
                      <p className="font-semibold">{bill.providerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {bill.providerAddress}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        GSTIN: {bill.providerGSTIN}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4 space-y-2">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Project
                        </p>
                        <p className="font-semibold">{bill.projectName}</p>
                        <p className="text-sm text-muted-foreground">
                          {bill.projectLocation}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Work Order: {bill.workOrderNo || "N/A"} (
                        {bill.workOrderDate
                          ? new Date(bill.workOrderDate).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                        )
                      </div>
                      <div className="text-sm text-muted-foreground">
                        RA Bill: {bill.raBillNo || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <p className="text-xs uppercase text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-2xl font-semibold">
                        {formatINR(bill.totalAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <p className="text-xs uppercase text-muted-foreground">
                        TDS ({bill.tdsPercentage}%)
                      </p>
                      <p className="text-2xl font-semibold text-orange-600">
                        {formatINR(bill.tdsAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <p className="text-xs uppercase text-muted-foreground">
                        Debit / Adjust
                      </p>
                      <p className="text-2xl font-semibold">
                        {formatINR(bill.debitAdjustValue || 0)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4 bg-primary/5">
                      <p className="text-xs uppercase text-primary">
                        Net Bill Amount
                      </p>
                      <p className="text-2xl font-semibold text-primary">
                        {formatINR(bill.netBillAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Sl</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>SAC/HSN</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Rate</TableHead>
                          <TableHead>Quantity (Prev / Pres / Cum)</TableHead>
                          <TableHead>Amount (Prev / Pres / Cum)</TableHead>
                          <TableHead>Flags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bill.categories.map((category) => (
                          <Fragment key={category.id}>
                            <TableRow className="bg-muted/70">
                              <TableCell colSpan={8}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="font-semibold">
                                    {category.categoryCode}.{" "}
                                    {category.categoryName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {category.tower} •{" "}
                                    {category.description || "—"}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                            {category.lineItems.map((line) => (
                              <TableRow key={line.id}>
                                <TableCell>{line.slNo}</TableCell>
                                <TableCell>{line.description}</TableCell>
                                <TableCell>{line.sacHsnCode || "—"}</TableCell>
                                <TableCell>{line.unit}</TableCell>
                                <TableCell>
                                  {formatINR(line.unitRate)}
                                </TableCell>
                                <TableCell>
                                  <div className="text-xs text-muted-foreground">
                                    <p>
                                      Prev: {line.previousQuantity.toFixed(3)}
                                    </p>
                                    <p>
                                      Pres: {line.presentQuantity.toFixed(3)}
                                    </p>
                                    <p>
                                      Cum: {line.cumulativeQuantity.toFixed(3)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-xs text-muted-foreground">
                                    <p>
                                      Prev: {formatINR(line.previousAmount)}
                                    </p>
                                    <p>Pres: {formatINR(line.presentAmount)}</p>
                                    <p>
                                      Cum: {formatINR(line.cumulativeAmount)}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="space-x-2">
                                  {line.isDeduction && (
                                    <Badge variant="destructive">
                                      Deduction
                                    </Badge>
                                  )}
                                  {line.isRevisedRate && (
                                    <Badge variant="secondary">Revised</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs uppercase text-muted-foreground">
                        Debit / Adjust
                      </p>
                      <p className="text-lg font-semibold">
                        {formatINR(bill.debitAdjustValue || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        For binding wire & nails
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs uppercase text-muted-foreground">
                        Bank
                      </p>
                      <p className="text-lg font-semibold">{bill.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        Branch: {bill.bankBranch}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        A/C: {bill.accountNo} • IFSC: {bill.ifscCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Tax Entities"
              value={taxes.length.toString()}
              icon={FileText}
              description="Active tax configurations"
            />
            <StatCard
              title="Tax Charges"
              value={taxCharges.length.toString()}
              icon={Calculator}
              description="Individual tax line items"
            />
            <StatCard
              title="Total Tax Amount"
              value={`₹${(
                taxCharges.reduce(
                  (sum: number, charge: any) => sum + (charge.total || 0),
                  0
                ) / 100000
              ).toFixed(1)}L`}
              icon={DollarSign}
              description="Total tax liability"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tax Entities</CardTitle>
                    <CardDescription>
                      Manage tax configurations and categories
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowGenerateTaxModal(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tax
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxes.map((tax: any) => (
                    <div
                      key={tax.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{tax.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {tax.company}
                        </p>
                        {tax.taxCategory && (
                          <Badge variant="outline" className="mt-1">
                            {tax.taxCategory}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTax(tax)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteTax(tax)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {taxes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No tax entities configured</p>
                      <p className="text-sm">Add a tax entity to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Charges</CardTitle>
                <CardDescription>
                  Individual tax line items and calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxCharges.slice(0, 10).map((charge: any) => (
                    <div
                      key={charge.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              charge.type === "GST"
                                ? "default"
                                : charge.type === "TDS"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {charge.type}
                          </Badge>
                          <span className="font-medium">
                            {charge.accountHead}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Rate: {charge.taxRate}% | Amount: ₹
                          {(charge.amount / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{(charge.total / 1000).toFixed(1)}K
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTaxCharge(charge)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {taxCharges.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No tax charges found</p>
                      <p className="text-sm">Tax charges will appear here</p>
                    </div>
                  )}
                  {taxCharges.length > 10 && (
                    <Button variant="outline" className="w-full">
                      View All {taxCharges.length} Tax Charges
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* <Card>
                        <CardHeader>
                            <CardTitle>Tax Management Tools</CardTitle>
                            <CardDescription>Quick actions for tax management</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start" onClick={() => setShowGenerateTaxModal(true)}>
                                    <Calculator className="h-5 w-5 mb-2" />
                                    <span className="font-medium">GST Calculator</span>
                                    <span className="text-sm text-muted-foreground">Calculate GST amounts</span>
                                </Button>
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start" onClick={() => setShowGenerateTaxModal(true)}>
                                    <FileText className="h-5 w-5 mb-2" />
                                    <span className="font-medium">TDS Calculator</span>
                                    <span className="text-sm text-muted-foreground">Calculate TDS deductions</span>
                                </Button>
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start">
                                    <Download className="h-5 w-5 mb-2" />
                                    <span className="font-medium">Generate Reports</span>
                                    <span className="text-sm text-muted-foreground">Export tax reports</span>
                                </Button>
                                <Button variant="outline" className="p-4 h-auto flex flex-col items-start">
                                    <TrendingUp className="h-5 w-5 mb-2" />
                                    <span className="font-medium">Tax Analytics</span>
                                    <span className="text-sm text-muted-foreground">View tax trends</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card> */}
        </TabsContent>

        <TabsContent value="reconciliation">
          <ReconciliationPanel />
        </TabsContent>
      </Tabs>

      {/* Client Bill Form Modal */}
      <Dialog
        open={isClientBillFormOpen}
        onOpenChange={setIsClientBillFormOpen}
      >
        <DialogContent
          className="w-full max-w-[90vw] xl:max-w-[1400px] 2xl:max-w-[1600px] bg-white"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add Client Bill</DialogTitle>
            <DialogDescription>
              Fill every section to match the Quintessa client bill layout.
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
                        handleClientBillFieldChange(
                          "invoiceDate",
                          e.target.value
                        )
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
                        handleClientBillFieldChange(
                          "workOrderNo",
                          e.target.value
                        )
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
                        <Label htmlFor="billingPartyStateCode">
                          State Code
                        </Label>
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
                        handleClientBillFieldChange(
                          "totalAmount",
                          e.target.value
                        )
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
                        handleClientBillFieldChange(
                          "bankBranch",
                          e.target.value
                        )
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
                            disabled={
                              clientBillFormData.categories.length === 1
                            }
                            onClick={() => removeCategorySection(categoryIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-[#f7f8f8]">
                          <Table>
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
                          </Table>
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
                  {isClientBillSaving ? "Saving..." : "Save Client Bill"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {showGenerateTaxModal && (
        <GenerateTaxModal
          onClose={() => setShowGenerateTaxModal(false)}
          onTaxCreated={async (tax) => {
            toast.success(`Tax "${tax.title}" created successfully!`);
            // Refresh the tax data

            const token =
              sessionStorage.getItem("jwt_token") ||
              localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const [taxesResponse, taxChargesResponse] = await Promise.all([
              axios.get(`${API_URL}/tax/taxes`, { headers }),
              axios.get(`${API_URL}/tax/tax-charges`, { headers }),
            ]);

            setTaxes(taxesResponse.data);
            setTaxCharges(taxChargesResponse.data);
          }}
        />
      )}

      {showEditTaxModal && selectedTax && (
        <EditTaxModal
          onClose={() => {
            setShowEditTaxModal(false);
            setSelectedTax(null);
          }}
          onTaxUpdated={handleTaxUpdated}
          tax={selectedTax}
        />
      )}

      {/* Replace old Generate Invoice modal with InvoiceBuilderModal */}
      {isInvoiceModalOpen && (
        <div className="-top-10 ">
          <InvoiceBuilderModal onClose={() => setIsInvoiceModalOpen(false)} />
        </div>
      )}

      <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
            <DialogDescription>
              Generate payroll for current month
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="month">Payroll Month</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jan-2024">January 2024</SelectItem>
                  <SelectItem value="feb-2024">February 2024</SelectItem>
                  <SelectItem value="mar-2024">March 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 border rounded-lg bg-muted">
              <h3 className="font-medium mb-2">Payroll Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Employees:</span>
                  <span>148</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Salary:</span>
                  <span>₹14.2M</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span>₹1.7M</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Net Payable:</span>
                  <span>₹12.5M</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPayrollModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleProcessPayroll}>Process Payroll</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Budget Cap</DialogTitle>
            <DialogDescription>Set budget limits and alerts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="budgetProject">Project</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa-complex">Villa Complex</SelectItem>
                  <SelectItem value="commercial-tower">
                    Commercial Tower
                  </SelectItem>
                  <SelectItem value="apartments">Apartments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxLimit">Maximum Budget Limit</Label>
              <Input
                id="maxLimit"
                type="number"
                placeholder="Enter budget limit"
              />
            </div>
            <div>
              <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBudgetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSetBudgetCap}>Save Configuration</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isReconcileModalOpen}
        onOpenChange={setIsReconcileModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Match Bank Receipts</DialogTitle>
            <DialogDescription>
              Automatically match bank transactions with invoices
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hdfc-current">
                    HDFC Bank - Current
                  </SelectItem>
                  <SelectItem value="icici-savings">
                    ICICI Bank - Savings
                  </SelectItem>
                  <SelectItem value="sbi-project">
                    SBI - Project Account
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 border rounded-lg bg-muted">
              <h3 className="font-medium mb-2">Match Preview</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Transactions to Process:</span>
                  <span>25</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Matches:</span>
                  <span>22</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual Review Required:</span>
                  <span>3</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReconcileModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAutoMatch}>Start Auto-Match</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LabourWagesModal
        isOpen={isLabourWagesModalOpen}
        onClose={() => setIsLabourWagesModalOpen(false)}
        onSuccess={handleLabourWagesSuccess}
      />
    </div>
  );
};

export default AccountsDashboard;
