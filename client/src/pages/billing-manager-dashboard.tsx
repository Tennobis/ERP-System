import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Plus,
    FileText,
    CreditCard,
    Clock,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Loader2,
    Download,
    MoreVertical,
    Upload,
    CheckCircle,
    Mail,
    Trash2,
    Eye,
    Calendar,
    Folder,
    Building2,
    Target,
    MapPin,
    Timer,
    Users,
    Zap,
    Shield,
    Banknote,
    PieChart,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import PaymentEntryModal from "@/components/modals/PaymentEntryModal";
import EditableInvoiceTable from "@/components/tables/EditableInvoiceTable";
import MaterialIndaneTab from "@/components/material-indane-tab";
import {
    exportBillingReport,
    exportBillingStatement,
} from "@/utils/export-utils";
import { toast } from "@/components/ui/use-toast";
import {
    createProgressInvoice,
    generateMonthlyReport,
    followUpOverdue,
    processPayments,
    sendPaymentReminder,
} from "@/utils/billing-actions";
import { downloadProgressInvoice } from "@/utils/invoice-generator";
import axios from "axios";
import InvoiceBuilderModal from "@/components/modals/InvoiceBuilderModal";
import { Payment } from "@/types/payment";
const API_URL =
    import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    status: string;
    total: number;
    subtotal: number;
    taxAmount: number;
    project: {
        id: string;
        name: string;
    };
    client: {
        id: string;
        name: string;
        email: string;
    };
    user: {
        id: string;
        name: string;
    };
    items: any[];
    Payment: any[];
    reminderCount?: number;
    lastReminderSent?: string | null;
    paidDate?: string | null;
}

interface ReminderResponse {
    success: boolean;
    reminderCount: number;
    sentAt: string;
}

interface Document {
    id: string;
    name: string;
    type: "Invoice" | "Contract" | "Receipt" | "Tax" | "Audit";
    size: string;
    uploadedBy: string;
    date: string;
    status: "Verified" | "Pending Review";
    project?: string;
    amount?: string;
    client?: string;
    method?: string;
}

interface ProgressInvoice {
    projectId: string;
    project: string;
    completed: number;
    billed: number;
    nextBilling: string;
    invoiceDate: string;
    totalAmount: number;
    clientName: string;
    address: string;
}

const BillingManagerDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showPaymentEntryModal, setShowPaymentEntryModal] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        progressInvoice: false,
        monthlyReport: false,
        followUp: false,
        payments: false,
    });

    // Add state for reminder loading
    const [reminderLoadingStates, setReminderLoadingStates] = useState<{
        [key: string]: boolean;
    }>({});

    // Add state for document loading
    const [documentLoadingStates, setDocumentLoadingStates] = useState<{
        [key: string]: boolean;
    }>({});

    // Add ref for file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Add state for selected tab
    const [selectedTab, setSelectedTab] = useState<string>("all");

    // Replace static arrays with backend data
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [progressInvoices, setProgressInvoices] = useState<ProgressInvoice[]>(
        []
    );
    const [clientBills, setClientBills] = useState<any[]>([]);
    const [clientBillsLoading, setClientBillsLoading] = useState(false);
    const [materialIndanes, setMaterialIndanes] = useState<any[]>([]);
    const [materialIndanesLoading, setMaterialIndanesLoading] = useState(false);

    const [generatingInvoice, setGeneratingInvoice] = useState<{
        [key: string]: boolean;
    }>({});

    // Function to get current tab from URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('/overview')) return 'overview';
        if (path.includes('/invoices')) return 'invoices';
        if (path.includes('/payments')) return 'payments';
        if (path.includes('/requests')) return 'requests';
        if (path.includes('/material-indane')) return 'material-indane';
        return 'overview'; // default tab
    };

    // Handle tab changes
    const handleTabChange = (value: string) => {
        const tabRoutes: Record<string, string> = {
            overview: '/billing-management/overview',
            invoices: '/billing-management/invoices',
            payments: '/billing-management/payments',
            requests: '/billing-management/requests',
            'material-indane': '/billing-management/material-indanes'
        };
        navigate(tabRoutes[value]);
    };

    useEffect(() => {
        const token =
            sessionStorage.getItem("jwt_token") ||
            localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        axios
            .get(`${API_URL}/billing/invoices`, { headers })
            .then((res) => setInvoices(Array.isArray(res.data) ? res.data : []))
            .catch(() => setInvoices([]));

        axios
            .get(`${API_URL}/billing/payments`, { headers })
            .then((res) => setPayments(Array.isArray(res.data) ? res.data : []))
            .catch(() => setPayments([]));



        axios
            .get(`${API_URL}/billing/documents`, { headers })
            .then((res) => setDocuments(Array.isArray(res.data) ? res.data : []))
            .catch(() => setDocuments([]));

        axios
            .get(`${API_URL}/billing/progress-invoices`, { headers })
            .then((res) =>
                setProgressInvoices(Array.isArray(res.data) ? res.data : [])
            )
            .catch(() => setProgressInvoices([]));

        // Fetch client bills
        fetchClientBills();

        // Fetch material indanes
        fetchMaterialIndanes();
    }, []);

    const fetchClientBills = async () => {
        setClientBillsLoading(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(`${API_URL}/client-bills`, { headers });
            setClientBills(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching client bills:", error);
            setClientBills([]);
        } finally {
            setClientBillsLoading(false);
        }
    };

    const handleApproveClientBill = async (billId: string) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(
                `${API_URL}/client-bills/${billId}/approve`,
                {},
                { headers }
            );

            toast({
                title: "Client Bill Approved",
                description: "The client bill has been approved successfully.",
                variant: "default",
            });

            // Refresh client bills
            fetchClientBills();
        } catch (error) {
            console.error("Error approving client bill:", error);
            toast({
                title: "Approval Failed",
                description: "Failed to approve the client bill. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRejectClientBill = async (billId: string) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(
                `${API_URL}/client-bills/${billId}/reject`,
                {},
                { headers }
            );

            toast({
                title: "Client Bill Rejected",
                description: "The client bill has been rejected.",
                variant: "default",
            });

            // Refresh client bills
            fetchClientBills();
        } catch (error) {
            console.error("Error rejecting client bill:", error);
            toast({
                title: "Rejection Failed",
                description: "Failed to reject the client bill. Please try again.",
                variant: "destructive",
            });
        }
    };

    const fetchMaterialIndanes = async () => {
        setMaterialIndanesLoading(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Fetch all pending material indents globally (not filtered by user)
            const response = await axios.get(`${API_URL}/material-indane/status/PENDING?global=true`, { headers });
            setMaterialIndanes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching material indanes:", error);
            setMaterialIndanes([]);
        } finally {
            setMaterialIndanesLoading(false);
        }
    };

    const handleApproveMaterialIndane = async (indaneId: string) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(
                `${API_URL}/material-indane/indanes/${indaneId}/approve`,
                {},
                { headers }
            );

            toast({
                title: "Material Indane Approved",
                description: "The material indane has been approved successfully.",
                variant: "default",
            });

            // Refresh material indanes
            fetchMaterialIndanes();
        } catch (error) {
            console.error("Error approving material indane:", error);
            toast({
                title: "Approval Failed",
                description: "Failed to approve the material indane. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRejectMaterialIndane = async (indaneId: string) => {
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(
                `${API_URL}/material-indane/indanes/${indaneId}/reject`,
                {},
                { headers }
            );

            toast({
                title: "Material Indane Rejected",
                description: "The material indane has been rejected.",
                variant: "default",
            });

            // Refresh material indanes
            fetchMaterialIndanes();
        } catch (error) {
            console.error("Error rejecting material indane:", error);
            toast({
                title: "Rejection Failed",
                description: "Failed to reject the material indane. Please try again.",
                variant: "destructive",
            });
        }
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid":
                return "bg-green-500";
            case "Pending":
                return "bg-yellow-500";
            case "Overdue":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const handleExportReport = () => {
        try {
            exportBillingReport();
        } catch (error) {
            console.error("Failed to export report:", error);
            // Here you might want to show a toast notification for error
        }
    };

    const handleProgressInvoice = async () => {
        setLoadingStates((prev) => ({ ...prev, progressInvoice: true }));
        try {
            await createProgressInvoice({
                projectId: "PRJ-2024-001",
                completionPercentage: 75,
                amount: "₹12L",
            });
        } finally {
            setLoadingStates((prev) => ({ ...prev, progressInvoice: false }));
        }
    };

    const handleMonthlyReport = async () => {
        setLoadingStates((prev) => ({ ...prev, monthlyReport: true }));
        try {
            await generateMonthlyReport();
        } finally {
            setLoadingStates((prev) => ({ ...prev, monthlyReport: false }));
        }
    };

    const handleFollowUp = async () => {
        setLoadingStates((prev) => ({ ...prev, followUp: true }));
        try {
            await followUpOverdue();
        } finally {
            setLoadingStates((prev) => ({ ...prev, followUp: false }));
        }
    };

    const handleProcessPayments = async () => {
        setLoadingStates((prev) => ({ ...prev, payments: true }));
        try {
            await processPayments();
        } finally {
            setLoadingStates((prev) => ({ ...prev, payments: false }));
        }
    };

    const handleSendReminder = async (invoice: Invoice) => {
        // Set loading state for this invoice
        const invoiceId = invoice.id || "unknown";
        setReminderLoadingStates((prev) => ({ ...prev, [invoiceId]: true }));

        try {
            const result = await sendPaymentReminder({
                invoiceId: invoiceId,
                client: invoice.client?.name || "Unknown Client",
                amount: (invoice.total || 0).toString(),
                dueDate: invoice.dueDate || "",
                reminderCount: invoice.reminderCount || 0,
            });

            // Update invoice with new reminder count and timestamp
            const updatedInvoices = invoices.map((inv) => {
                if (inv.id === invoiceId) {
                    return {
                        ...inv,
                        reminderCount: (result as ReminderResponse).reminderCount,
                        lastReminderSent: (result as ReminderResponse).sentAt,
                    };
                }
                return inv;
            });
            setInvoices(updatedInvoices);

            toast({
                title: "Reminder Sent Successfully",
                description: `Payment reminder sent to ${invoice.client?.name || "Unknown Client"
                    }`,
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Failed to Send Reminder",
                description:
                    "There was an error sending the payment reminder. Please try again.",
                variant: "destructive",
            });
        } finally {
            setReminderLoadingStates((prev) => ({ ...prev, [invoiceId]: false }));
        }
    };

    // Helper function to format amounts in lakhs/crores
    const formatAmount = (amount: number): string => {
        if (amount >= 10000000) { // 1 crore
            return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) { // 1 lakh
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) { // 1 thousand
            return `₹${(amount / 1000).toFixed(1)}K`;
        } else {
            return `₹${amount.toLocaleString("en-IN")}`;
        }
    };

    // Calculate payment status dynamically from invoices and payments
    const calculatePaymentSummary = () => {
        const today = new Date();
        const paidInvoices: Invoice[] = [];
        const pendingInvoices: Invoice[] = [];
        const overdueInvoices: Invoice[] = [];

        invoices.forEach((invoice) => {
            // Calculate total payments for this invoice
            const totalPayments = payments
                .filter((payment) => payment.Invoice?.id === invoice.id && payment.paymentType === "RECEIVE")
                .reduce((sum, payment) => sum + (payment.total || 0), 0);

            const invoiceTotal = invoice.total || 0;
            const dueDate = new Date(invoice.dueDate);

            if (totalPayments >= invoiceTotal) {
                // Paid: sum of payments equals or exceeds invoice total
                paidInvoices.push(invoice);
            }
            else {
                // Pending: sum of payments is less than invoice total and not overdue
                pendingInvoices.push(invoice);
            }
            if (dueDate < today && totalPayments < invoiceTotal) {
                // Overdue: due date has passed and payment is still pending
                overdueInvoices.push(invoice);
            }
        });

        const paidTotal = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

        // Pending total = sum of (invoice total - payments received) for pending invoices
        const pendingTotal = pendingInvoices.reduce((sum, inv) => {
            const totalPayments = payments
                .filter((payment) => payment.Invoice?.id === inv.id && payment.paymentType === "RECEIVE")
                .reduce((paySum, payment) => paySum + (payment.total || 0), 0);
            return sum + ((inv.total || 0) - totalPayments);
        }, 0);

        // Overdue total = sum of (invoice total - payments received) for overdue invoices  
        const overdueTotal = overdueInvoices.reduce((sum, inv) => {
            const totalPayments = payments
                .filter((payment) => payment.Invoice?.id === inv.id && payment.paymentType === "RECEIVE")
                .reduce((paySum, payment) => paySum + (payment.total || 0), 0);
            return sum + ((inv.total || 0) - totalPayments);
        }, 0);

        return {
            paid: {
                count: paidInvoices.length,
                amount: formatAmount(paidTotal),
                actualAmount: `₹${paidTotal.toLocaleString("en-IN")}`
            },
            pending: {
                count: pendingInvoices.length,
                amount: formatAmount(pendingTotal),
                actualAmount: `₹${pendingTotal.toLocaleString("en-IN")}`
            },
            overdue: {
                count: overdueInvoices.length,
                amount: formatAmount(overdueTotal),
                actualAmount: `₹${overdueTotal.toLocaleString("en-IN")}`
            }
        };
    };

    const paymentSummary = calculatePaymentSummary();

    // Calculate unique KPI metrics
    const calculateUniqueKPIs = () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Weekly Revenue - Money collected in last 7 days
        const weeklyRevenue = payments
            .filter(p => {
                const paymentDate = new Date(p.postingDate);
                return paymentDate >= sevenDaysAgo &&
                    paymentDate <= today &&
                    p.paymentType === "RECEIVE";
            })
            .reduce((sum, p) => sum + (p.total || 0), 0);

        // 2. Pipeline Value - Total value of pending invoices (not yet fully paid)
        const pipelineValue = invoices.reduce((sum, inv) => {
            const totalPayments = payments
                .filter(p => p.Invoice?.id === inv.id && p.paymentType === "RECEIVE")
                .reduce((paySum, p) => paySum + (p.total || 0), 0);

            const remainingAmount = (inv.total || 0) - totalPayments;
            return sum + Math.max(0, remainingAmount);
        }, 0);

        // 3. Top Revenue Client
        const clientRevenue = new Map<string, number>();

        payments
            .filter(p => p.paymentType === "RECEIVE" && p.Invoice?.client)
            .forEach(payment => {
                const clientName = payment.Invoice?.client?.name || "Unknown";
                const current = clientRevenue.get(clientName) || 0;
                clientRevenue.set(clientName, current + (payment.total || 0));
            });

        const topClient = Array.from(clientRevenue.entries())
            .sort((a, b) => b[1] - a[1])[0] || ["No data", 0];

        return {
            weeklyRevenue: formatAmount(weeklyRevenue),
            pipelineValue: formatAmount(pipelineValue),
            topClient: {
                name: topClient[0],
                revenue: formatAmount(topClient[1])
            }
        };
    };

    const uniqueKPIs = calculateUniqueKPIs();

    // Calculate collection trends by month
    const calculateCollectionTrends = () => {
        const monthlyData = new Map<string, { invoiced: number; collected: number; }>();

        // Group invoices by month
        invoices.forEach(invoice => {
            const invoiceDate = new Date(invoice.date);
            const monthKey = invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, { invoiced: 0, collected: 0 });
            }

            const monthData = monthlyData.get(monthKey)!;
            monthData.invoiced += invoice.total || 0;

            // Calculate payments for this invoice
            const totalPayments = payments
                .filter(payment => payment.Invoice?.id === invoice.id && payment.paymentType === "RECEIVE")
                .reduce((sum, payment) => sum + (payment.total || 0), 0);

            monthData.collected += Math.min(totalPayments, invoice.total || 0);
        });

        // Convert to array and calculate percentages
        const trends = Array.from(monthlyData.entries())
            .map(([month, data]) => ({
                month,
                collection: data.invoiced > 0 ? Math.round((data.collected / data.invoiced) * 100) : 0,
                target: 90, // Standard target
                collectedAmount: formatAmount(data.collected),
                invoicedAmount: formatAmount(data.invoiced)
            }))
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
            .slice(-6); // Show last 6 months

        return trends;
    };

    const collectionTrends = calculateCollectionTrends();

    // Calculate payment trends by actual payment dates
    const calculatePaymentTrends = () => {
        const monthlyPayments = new Map<string, number>();
        const monthlyInvoices = new Map<string, number>();

        // Group payments by payment date
        payments
            .filter(p => p.paymentType === "RECEIVE")
            .forEach(payment => {
                const paymentDate = new Date(payment.postingDate);
                const monthKey = paymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

                const current = monthlyPayments.get(monthKey) || 0;
                monthlyPayments.set(monthKey, current + (payment.total || 0));
            });

        // Group invoices by invoice date to calculate targets
        invoices.forEach(invoice => {
            const invoiceDate = new Date(invoice.date);
            const monthKey = invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

            const current = monthlyInvoices.get(monthKey) || 0;
            monthlyInvoices.set(monthKey, current + (invoice.total || 0));
        });

        // Get all unique months from both payments and invoices
        const allMonths = new Set([...monthlyPayments.keys(), ...monthlyInvoices.keys()]);

        const trends = Array.from(allMonths)
            .map(month => {
                const collected = monthlyPayments.get(month) || 0;
                const invoiced = monthlyInvoices.get(month) || 0;

                return {
                    month,
                    collection: invoiced > 0 ? Math.round((collected / invoiced) * 100) : (collected > 0 ? 100 : 0),
                    target: 90,
                    collectedAmount: formatAmount(collected),
                    invoicedAmount: formatAmount(invoiced),
                    hasPayments: collected > 0,
                    hasInvoices: invoiced > 0
                };
            })
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
            .slice(-6);

        return trends;
    };

    const paymentTrends = calculatePaymentTrends();

    const handleExportStatement = () => {
        try {
            exportBillingStatement(invoices);
            toast({
                title: "Statement Exported",
                description: "The billing statement has been downloaded successfully.",
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export billing statement. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files?.length) return;

        const file = files[0];
        const newDoc: Document = {
            id: `doc${documents.length + 1}`,
            name: file.name,
            type: getDocumentType(file.name),
            size: formatFileSize(file.size),
            uploadedBy: "Current User",
            date: new Date().toISOString().split("T")[0],
            status: "Pending Review",
        };

        setDocuments((prev) => [newDoc, ...prev]);
        toast({
            title: "Document Uploaded",
            description: `${file.name} has been uploaded successfully.`,
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleBulkUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDownload = async (doc: Document) => {
        setDocumentLoadingStates((prev) => ({ ...prev, [doc.id]: true }));
        try {
            // Create a sample file based on document type
            let fileContent = "";
            let mimeType = "";
            let fileName = doc.name;

            switch (doc.type) {
                case "Invoice":
                    fileContent = generateInvoiceContent(doc);
                    mimeType = "application/pdf";
                    break;
                case "Contract":
                    fileContent = generateContractContent(doc);
                    mimeType = "application/msword";
                    break;
                case "Receipt":
                    fileContent = generateReceiptContent(doc);
                    mimeType = "application/pdf";
                    break;
                case "Tax":
                    fileContent = generateTaxContent(doc);
                    mimeType = "application/pdf";
                    break;
                case "Audit":
                    fileContent = generateAuditContent(doc);
                    mimeType = "application/pdf";
                    break;
                default:
                    fileContent = generateGenericContent(doc);
                    mimeType = "text/plain";
            }

            // Create and trigger download
            const blob = new Blob([fileContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "Download Completed",
                description: `${doc.name} has been downloaded successfully.`,
            });
        } catch (error) {
            toast({
                title: "Download Failed",
                description: `Failed to download ${doc.name}.`,
                variant: "destructive",
            });
        } finally {
            setDocumentLoadingStates((prev) => ({ ...prev, [doc.id]: false }));
        }
    };

    const handleVerify = (doc: Document) => {
        setDocuments((prev) =>
            prev.map((d) =>
                d.id === doc.id ? { ...d, status: "Verified" as const } : d
            )
        );
        toast({
            title: "Document Verified",
            description: `${doc.name} has been marked as verified.`,
        });
    };

    const handleDelete = (doc: Document) => {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        toast({
            title: "Document Deleted",
            description: `${doc.name} has been deleted.`,
            variant: "destructive",
        });
    };

    const getDocumentType = (filename: string): Document["type"] => {
        if (filename.toLowerCase().includes("invoice")) return "Invoice";
        if (filename.toLowerCase().includes("contract")) return "Contract";
        if (filename.toLowerCase().includes("receipt")) return "Receipt";
        if (filename.toLowerCase().includes("tax")) return "Tax";
        if (filename.toLowerCase().includes("audit")) return "Audit";
        return "Invoice";
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const generateInvoiceContent = (doc: Document): string => {
        return `INVOICE DOCUMENT
    
Document Name: ${doc.name}
Invoice Type: ${doc.type}
Date: ${doc.date}
Client: ${doc.client || "N/A"}
Project: ${doc.project || "N/A"}
Amount: ${doc.amount || "N/A"}

INVOICE DETAILS:
================
This is a sample invoice document for demonstration purposes.
Generated from billing management system.

Uploaded by: ${doc.uploadedBy}
Status: ${doc.status}
File Size: ${doc.size}

Thank you for your business!`;
    };

    const generateContractContent = (doc: Document): string => {
        return `CONTRACT AGREEMENT
    
Document Name: ${doc.name}
Contract Type: ${doc.type}
Date: ${doc.date}
Client: ${doc.client || "N/A"}
Amount: ${doc.amount || "N/A"}

CONTRACT TERMS:
===============
This is a sample contract document for demonstration purposes.
Generated from billing management system.

Terms and Conditions:
- Payment terms as agreed
- Project delivery schedule
- Quality standards

Uploaded by: ${doc.uploadedBy}
Status: ${doc.status}
File Size: ${doc.size}`;
    };

    const generateReceiptContent = (doc: Document): string => {
        return `PAYMENT RECEIPT
    
Document Name: ${doc.name}
Receipt Type: ${doc.type}
Date: ${doc.date}
Payment Method: ${doc.method || "N/A"}

PAYMENT DETAILS:
================
This is a sample payment receipt for demonstration purposes.
Generated from billing management system.

Receipt confirms payment received.

Uploaded by: ${doc.uploadedBy}
Status: ${doc.status}
File Size: ${doc.size}

Thank you for your payment!`;
    };

    const generateTaxContent = (doc: Document): string => {
        return `TAX DOCUMENT
    
Document Name: ${doc.name}
Tax Document Type: ${doc.type}
Date: ${doc.date}

TAX INFORMATION:
================
This is a sample tax document for demonstration purposes.
Generated from billing management system.

Tax calculation and filing information.

Uploaded by: ${doc.uploadedBy}
Status: ${doc.status}
File Size: ${doc.size}`;
    };

    const generateAuditContent = (doc: Document): string => {
        return `AUDIT REPORT
    
Document Name: ${doc.name}
Audit Type: ${doc.type}
Date: ${doc.date}

AUDIT FINDINGS:
===============
This is a sample audit document for demonstration purposes.
Generated from billing management system.

Audit findings and recommendations.

Uploaded by: ${doc.uploadedBy}
Status: ${doc.status}
File Size: ${doc.size}`;
    };

    const generateGenericContent = (doc: Document): string => {
        return `DOCUMENT
    
Document Name: ${doc.name}
Document Type: ${doc.type}
Date: ${doc.date}

DOCUMENT DETAILS:
=================
This is a sample document for demonstration purposes.
Generated from billing management system.

Document information and content.

Uploaded by: ${doc.uploadedBy}
Status: ${doc.status}
File Size: ${doc.size}`;
    };

    const getPaymentStatusColor = (paymentType: string) => {
        switch (paymentType) {
            case "RECEIVE":
                return "bg-green-500";
            case "PAY":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getPartyTypeColor = (partyType: string) => {
        switch (partyType) {
            case "CUSTOMER":
                return "bg-blue-500 text-white";
            case "VENDOR":
                return "bg-orange-500 text-white";
            case "EMPLOYEE":
                return "bg-purple-500 text-white";
            case "BANK":
                return "bg-green-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    const getMonthlyPayments = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return payments.filter((payment) => {
            const paymentDate = new Date(payment.postingDate);
            return (
                paymentDate.getMonth() === currentMonth &&
                paymentDate.getFullYear() === currentYear
            );
        });
    };

    const monthlyPayments = getMonthlyPayments();

    const filteredDocuments = documents.filter((doc) => {
        switch (selectedTab) {
            case "invoices":
                return doc.type === "Invoice";
            case "contracts":
                return doc.type === "Contract";
            case "receipts":
                return doc.type === "Receipt";
            case "others":
                return doc.type === "Tax" || doc.type === "Audit";
            default:
                return true;
        }
    });

    const handleGenerateProgressInvoice = async (invoice: ProgressInvoice) => {
        setGeneratingInvoice((prev) => ({ ...prev, [invoice.projectId]: true }));

        try {
            // Generate and download the invoice
            const success = await downloadProgressInvoice(invoice);

            if (success) {
                // Update the invoice data
                setProgressInvoices((prev) =>
                    prev.map((inv) => {
                        if (inv.projectId === invoice.projectId) {
                            return {
                                ...inv,
                                billed: inv.completed,
                                nextBilling: "₹0",
                                invoiceDate: new Date().toISOString().split("T")[0],
                            };
                        }
                        return inv;
                    })
                );

                toast({
                    title: "Invoice Generated",
                    description: `Progress invoice for ${invoice.project} has been generated and downloaded.`,
                });
            } else {
                throw new Error("Failed to generate invoice");
            }
        } catch (error) {
            console.error("Error generating invoice:", error);
            toast({
                title: "Error",
                description: "Failed to generate progress invoice. Please try again.",
                variant: "destructive",
            });
        } finally {
            setGeneratingInvoice((prev) => ({ ...prev, [invoice.projectId]: false }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Billing Management
                    </h1>
                    <p className="text-muted-foreground">
                        Invoice generation and payment tracking
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setShowInvoiceModal(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Invoice
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleExportReport}
                    >
                        <FileText className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
                {/* Hide tabs on mobile - navigation is handled by sidebar */}
                <TabsList className="hidden md:grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="material-indane">Material Indane</TabsTrigger>
                    {/* <TabsTrigger value="reports">Reports</TabsTrigger> */}
                    {/* <TabsTrigger value="progress-billing">Progress Billing</TabsTrigger> */}
                    {/* <TabsTrigger value="milestones">Milestones</TabsTrigger> */}
                    {/* <TabsTrigger value="documents">Documents</TabsTrigger> */}
                </TabsList>

                {/* Mobile-specific section header */}
                <div className="md:hidden mb-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {getCurrentTab() === "overview" ? "Overview" :
                                        getCurrentTab() === "invoices" ? "Invoices" :
                                            getCurrentTab() === "payments" ? "Payments" :
                                                getCurrentTab() === "requests" ? "Requests" : "Material Indane"}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Billing › {getCurrentTab() === "overview" ? "Overview" :
                                        getCurrentTab() === "invoices" ? "Invoices" :
                                            getCurrentTab() === "payments" ? "Payments" :
                                                getCurrentTab() === "requests" ? "Requests" : "Material Indane"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <TabsContent value="overview">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
                        <Card>
                            <CardContent className="p-3 md:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                            Total Invoices
                                        </p>
                                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{invoices.length}</p>
                                    </div>
                                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 md:mt-2">All invoices created</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-3 md:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                            Total Payments
                                        </p>
                                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{payments.filter(p => p.paymentType === "RECEIVE").length}</p>
                                    </div>
                                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 md:mt-2">Received payments</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-3 md:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                            Outstanding Amount
                                        </p>
                                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{paymentSummary.overdue.amount}</p>
                                    </div>
                                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 md:mt-2">{paymentSummary.overdue.count} overdue invoices</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-3 md:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                            Revenue Collected
                                        </p>
                                        <p className="text-lg sm:text-xl md:text-2xl font-bold">{paymentSummary.paid.amount}</p>
                                    </div>
                                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 md:mt-2">{paymentSummary.paid.count} paid invoices</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions & Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleProgressInvoice}
                    disabled={loadingStates.progressInvoice}
                  >
                    {loadingStates.progressInvoice ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Progress Invoice
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleMonthlyReport}
                    disabled={loadingStates.monthlyReport}
                  >
                    {loadingStates.monthlyReport ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Generate Monthly Report
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleFollowUp}
                    disabled={loadingStates.followUp}
                  >
                    {loadingStates.followUp ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Follow Up Overdue
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleProcessPayments}
                    disabled={loadingStates.payments}
                  >
                    {loadingStates.payments ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Process Payments
                  </Button>
                </div>
              </CardContent>
            </Card> */}

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        {
                                            status: "Paid",
                                            count: paymentSummary.paid.count,
                                            amount: paymentSummary.paid.actualAmount,
                                            color: "bg-green-500",
                                        },
                                        {
                                            status: "Pending",
                                            count: paymentSummary.pending.count,
                                            amount: paymentSummary.pending.actualAmount,
                                            color: "bg-yellow-500",
                                        },
                                        {
                                            status: "Overdue",
                                            count: paymentSummary.overdue.count,
                                            amount: paymentSummary.overdue.actualAmount,
                                            color: "bg-red-500",
                                        },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-3 h-3 ${item.color} rounded-full mr-3`}
                                                ></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.status}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.count} invoices
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-gray-900">
                                                {item.amount}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Collection Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {collectionTrends.length > 0 ? (
                                        collectionTrends.map((item, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium">{item.month}</span>
                                                    <span>
                                                        {item.collection}% / {item.target}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={item.collection}
                                                    className={`h-2 ${item.collection >= item.target ? 'bg-green-100' : 'bg-red-100'}`}
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>Collected: {item.collectedAmount}</span>
                                                    <span>Invoiced: {item.invoicedAmount}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted-foreground py-4">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No collection data available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="invoices" className="mt-0">
                    <div className="space-y-4 md:space-y-6">
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Invoice Management</CardTitle>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportStatement}
                                    className="w-full sm:w-auto"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Export Statement
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <EditableInvoiceTable />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Invoices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 md:space-y-4">
                                    {invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg gap-3 sm:gap-0"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-sm md:text-base">{invoice.invoiceNumber}</p>
                                                <p className="text-xs md:text-sm text-muted-foreground">
                                                    {invoice.project.name}
                                                </p>
                                            </div>
                                            <div className="flex justify-between sm:block sm:text-right">
                                                <p className="font-medium text-sm md:text-base">₹ {invoice.total?.toLocaleString('en-IN')}</p>
                                                <Badge
                                                    variant={
                                                        invoice.status === "Sent"
                                                            ? "default"
                                                            : invoice.status === "Draft"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="payments">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle>Payment History</CardTitle>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => setShowPaymentEntryModal(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Payment Entry
                                    </Button>
                                </div>
                                <CardDescription>
                                    Track all payment transactions and their status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {payments.length > 0 ? (
                                    <div className="space-y-4">
                                        {payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-2 rounded-full ${payment.paymentType === "RECEIVE"
                                                                ? "bg-green-100 text-green-600"
                                                                : "bg-red-100 text-red-600"
                                                            }`}
                                                    >
                                                        {payment.paymentType === "RECEIVE" ? (
                                                            <TrendingUp className="h-4 w-4" />
                                                        ) : (
                                                            <TrendingDown className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium">
                                                                {payment.Invoice?.invoiceNumber ||
                                                                    "Direct Payment"}
                                                            </h4>
                                                            <Badge
                                                                variant={
                                                                    payment.paymentType === "RECEIVE"
                                                                        ? "default"
                                                                        : "destructive"
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {payment.paymentType}
                                                            </Badge>
                                                            <Badge
                                                                variant="default"
                                                                className={`text-xs ${getPartyTypeColor(
                                                                    payment.partyType
                                                                )}`}
                                                            >
                                                                {payment.partyType}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-1">
                                                            {payment.partyName}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <CreditCard className="h-3 w-3" />
                                                                {payment.modeOfPayment || "N/A"}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(
                                                                    payment.postingDate
                                                                ).toLocaleDateString("en-US", {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}
                                                            </span>
                                                            {payment.project?.name && (
                                                                <span className="flex items-center gap-1">
                                                                    <Folder className="h-3 w-3" />
                                                                    {payment.project.name}
                                                                </span>
                                                            )}
                                                            {payment.accountPaidTo && (
                                                                <span className="flex items-center gap-1">
                                                                    <Building2 className="h-3 w-3" />
                                                                    {payment.accountPaidTo}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {payment.taxes && payment.taxes.length > 0 && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                <span>
                                                                    Base: ₹
                                                                    {(payment.amount || 0).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    Tax: ₹
                                                                    {payment.taxes
                                                                        .reduce((sum, tax) => sum + tax.amount, 0)
                                                                        .toLocaleString("en-IN")}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {(payment.costCenter || payment.placeOfSupply) && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                {payment.costCenter && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Target className="h-3 w-3" />
                                                                        {payment.costCenter}
                                                                    </span>
                                                                )}
                                                                {payment.placeOfSupply && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <MapPin className="h-3 w-3" />
                                                                            {payment.placeOfSupply}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className={`text-lg font-bold ${payment.paymentType === "RECEIVE"
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                            }`}
                                                    >
                                                        {payment.paymentType === "RECEIVE" ? "+" : "-"}₹
                                                        {(payment.total || 0).toLocaleString("en-IN")}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {payment.paymentType === "RECEIVE"
                                                                ? "Received"
                                                                : "Paid"}
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(payment.createdAt).toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                    {payment.Invoice?.invoiceNumber && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Invoice: {payment.Invoice.invoiceNumber}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            No Payment Records
                                        </h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                            Track all your payment transactions and their status.
                                            Create your first payment entry to get started.
                                        </p>
                                        <Button onClick={() => setShowPaymentEntryModal(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Payment Entry
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            Total Received
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₹
                                            {monthlyPayments
                                                .filter((p) => p.paymentType === "RECEIVE")
                                                .reduce((sum, p) => sum + p.total, 0)
                                                .toLocaleString("en-IN")}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {
                                                monthlyPayments.filter(
                                                    (p) => p.paymentType === "RECEIVE"
                                                ).length
                                            }{" "}
                                            payment
                                            {monthlyPayments.filter(
                                                (p) => p.paymentType === "RECEIVE"
                                            ).length !== 1
                                                ? "s"
                                                : ""}
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-sm text-muted-foreground">Total Paid</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            ₹
                                            {monthlyPayments
                                                .filter((p) => p.paymentType === "PAY")
                                                .reduce((sum, p) => sum + p.total, 0)
                                                .toLocaleString("en-IN")}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {
                                                monthlyPayments.filter((p) => p.paymentType === "PAY")
                                                    .length
                                            }{" "}
                                            payment
                                            {monthlyPayments.filter((p) => p.paymentType === "PAY")
                                                .length !== 1
                                                ? "s"
                                                : ""}
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            Net Cash Flow
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ₹
                                            {(
                                                monthlyPayments
                                                    .filter((p) => p.paymentType === "RECEIVE")
                                                    .reduce((sum, p) => sum + p.total, 0) -
                                                monthlyPayments
                                                    .filter((p) => p.paymentType === "PAY")
                                                    .reduce((sum, p) => sum + p.total, 0)
                                            ).toLocaleString("en-IN")}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This month
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            Total Transactions
                                        </p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {payments.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            All time
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="mt-0">
                    <div className="space-y-4 md:space-y-6">
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Client Bill Requests</CardTitle>
                                    <CardDescription>
                                        Review and approve client bills from project managers
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchClientBills}
                                    disabled={clientBillsLoading}
                                >
                                    {clientBillsLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Refresh
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {clientBillsLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                                        <p className="text-muted-foreground">Loading client bills...</p>
                                    </div>
                                ) : clientBills.filter(bill => bill.status === "DRAFT").length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Invoice No
                                                    </th>
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Date
                                                    </th>
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Project
                                                    </th>
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Contractor
                                                    </th>
                                                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                                                        Total Amount
                                                    </th>
                                                    <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                                                        Status
                                                    </th>
                                                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {clientBills
                                                    .filter(bill => bill.status === "DRAFT")
                                                    .map((bill) => (
                                                        <tr key={bill.id} className="border-b hover:bg-muted/50">
                                                            <td className="p-3">
                                                                <p className="font-medium">{bill.invoiceNo}</p>
                                                            </td>
                                                            <td className="p-3">
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(bill.invoiceDate).toLocaleDateString()}
                                                                </p>
                                                            </td>
                                                            <td className="p-3">
                                                                <p className="text-sm">{bill.projectName || "N/A"}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {bill.projectLocation || ""}
                                                                </p>
                                                            </td>
                                                            <td className="p-3">
                                                                <p className="text-sm">{bill.contractorName || "N/A"}</p>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <p className="font-semibold">
                                                                    ₹{Number(bill.totalAmount).toLocaleString("en-IN")}
                                                                </p>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Badge variant="secondary">{bill.status}</Badge>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        onClick={() => handleApproveClientBill(bill.id)}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handleRejectClientBill(bill.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            No Pending Requests
                                        </h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                            There are no client bill requests pending approval from project managers.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Material Indane Requests</CardTitle>
                                    <CardDescription>
                                        Review and approve material indane requests
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchMaterialIndanes}
                                    disabled={materialIndanesLoading}
                                >
                                    {materialIndanesLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Refresh
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {materialIndanesLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                                        <p className="text-muted-foreground">Loading material indanes...</p>
                                    </div>
                                ) : materialIndanes.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Order Slip No
                                                    </th>
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Site
                                                    </th>
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Date
                                                    </th>
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        Store Keeper
                                                    </th>
                                                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                                                        PM
                                                    </th>
                                                    <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                                                        Items
                                                    </th>
                                                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materialIndanes.map((indane) => (
                                                    <tr key={indane.id} className="border-b hover:bg-muted/50">
                                                        <td className="p-3">
                                                            <p className="font-medium">{indane.orderSlipNo}</p>
                                                        </td>
                                                        <td className="p-3">
                                                            <p className="text-sm">{indane.site}</p>
                                                        </td>
                                                        <td className="p-3">
                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(indane.date).toLocaleDateString()}
                                                            </p>
                                                        </td>
                                                        <td className="p-3">
                                                            <p className="text-sm">{indane.storeKeeperName || "N/A"}</p>
                                                        </td>
                                                        <td className="p-3">
                                                            <p className="text-sm">{indane.projectManagerName || "N/A"}</p>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Badge variant="outline">{indane.items?.length || 0} items</Badge>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    onClick={() => handleApproveMaterialIndane(indane.id)}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleRejectMaterialIndane(indane.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            No Pending Material Indanes
                                        </h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                            There are no material indane requests pending approval.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="material-indane" className="mt-0">
                    <MaterialIndaneTab />
                </TabsContent>

                <TabsContent value="reports">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">Monthly Revenue</p>
                                            <p className="text-sm text-muted-foreground">
                                                Last 6 months
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            {[
                                                { month: "October", amount: 180, target: 200 },
                                                { month: "November", amount: 220, target: 200 },
                                                { month: "December", amount: 260, target: 200 },
                                                { month: "January", amount: 190, target: 200 },
                                                { month: "February", amount: 240, target: 200 },
                                                { month: "March", amount: 280, target: 200 },
                                            ].map((data) => (
                                                <div
                                                    key={data.month}
                                                    className="flex items-center gap-4"
                                                >
                                                    <p className="w-20 text-sm">{data.month}</p>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex gap-2 items-center">
                                                            <div
                                                                className="h-3 bg-primary rounded"
                                                                style={{
                                                                    width: `${(data.amount / 300) * 100}%`,
                                                                }}
                                                            />
                                                            <span className="text-sm font-medium">
                                                                ₹{data.amount}L
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <div
                                                                className="h-1 bg-muted rounded"
                                                                style={{
                                                                    width: `${(data.target / 300) * 100}%`,
                                                                }}
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                Target: ₹{data.target}L
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <div>
                                            <p className="text-sm font-medium">Total Revenue</p>
                                            <p className="text-2xl font-bold">₹1,370L</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-600">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-sm font-medium">+15.3%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Collection Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">Collection Rate</p>
                                            <p className="text-sm text-muted-foreground">
                                                By Project Type
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    type: "Residential",
                                                    collected: 92,
                                                    pending: 8,
                                                    amount: "320L",
                                                },
                                                {
                                                    type: "Commercial",
                                                    collected: 88,
                                                    pending: 12,
                                                    amount: "450L",
                                                },
                                                {
                                                    type: "Industrial",
                                                    collected: 95,
                                                    pending: 5,
                                                    amount: "280L",
                                                },
                                                {
                                                    type: "Infrastructure",
                                                    collected: 85,
                                                    pending: 15,
                                                    amount: "520L",
                                                },
                                            ].map((data) => (
                                                <div key={data.type} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{data.type}</span>
                                                        <span className="text-muted-foreground">
                                                            ₹{data.amount}
                                                        </span>
                                                    </div>
                                                    <div className="flex h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-green-500"
                                                            style={{ width: `${data.collected}%` }}
                                                        />
                                                        <div
                                                            className="bg-yellow-500"
                                                            style={{ width: `${data.pending}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Collected: {data.collected}%</span>
                                                        <span>Pending: {data.pending}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Average Collection Rate
                                            </p>
                                            <p className="text-2xl font-bold text-green-600">90%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Outstanding
                                            </p>
                                            <p className="text-2xl font-bold text-yellow-600">
                                                ₹157L
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Collections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { month: "January", collected: 85, target: 100 },
                                        { month: "February", collected: 92, target: 100 },
                                        { month: "March", collected: 78, target: 100 },
                                    ].map((month) => (
                                        <div key={month.month} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{month.month}</span>
                                                <span>
                                                    ₹{month.collected}L / ₹{month.target}L
                                                </span>
                                            </div>
                                            <Progress
                                                value={(month.collected / month.target) * 100}
                                                className="h-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Client Payment Behavior</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { client: "ABC Developers", avgDays: 15, paymentRate: 95 },
                                        { client: "XYZ Properties", avgDays: 22, paymentRate: 88 },
                                        {
                                            client: "Government Agency",
                                            avgDays: 45,
                                            paymentRate: 100,
                                        },
                                    ].map((client) => (
                                        <div key={client.client} className="p-3 border rounded-lg">
                                            <h4 className="font-medium text-sm">{client.client}</h4>
                                            <div className="flex justify-between mt-2 text-xs">
                                                <span>Avg Payment: {client.avgDays} days</span>
                                                <span>Success Rate: {client.paymentRate}%</span>
                                            </div>
                                            <Progress
                                                value={client.paymentRate}
                                                className="h-2 mt-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="progress-billing">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress-Based Billing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {progressInvoices.map((invoice) => (
                                        <div
                                            key={invoice.projectId}
                                            className="p-4 border rounded-lg"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {invoice.project || "N/A"}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {invoice.clientName || "N/A"}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    Next: {invoice.nextBilling || "N/A"}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Work Completed: {invoice.completed || 0}%</span>
                                                    <span>Billed: {invoice.billed || 0}%</span>
                                                </div>
                                                <div className="relative">
                                                    <Progress
                                                        value={invoice.completed || 0}
                                                        className="h-3"
                                                    />
                                                    <div
                                                        className="absolute top-0 h-3 bg-green-600 bg-opacity-50 rounded"
                                                        style={{ width: `${invoice.billed || 0}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center mt-3">
                                                    <p className="text-sm text-muted-foreground">
                                                        Last Invoice: {invoice.invoiceDate || "N/A"}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleGenerateProgressInvoice(invoice)
                                                        }
                                                        disabled={
                                                            invoice.completed <= invoice.billed ||
                                                            generatingInvoice[invoice.projectId]
                                                        }
                                                    >
                                                        {generatingInvoice[invoice.projectId] ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Generate Progress Invoice
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="milestones">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Milestones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    {
                                        milestone: "Foundation Complete",
                                        percentage: 25,
                                        status: "Billed",
                                        amount: "₹12L",
                                    },
                                    {
                                        milestone: "Structure Complete",
                                        percentage: 50,
                                        status: "Due",
                                        amount: "₹18L",
                                    },
                                    {
                                        milestone: "Finishing Work",
                                        percentage: 75,
                                        status: "Upcoming",
                                        amount: "₹15L",
                                    },
                                    {
                                        milestone: "Project Handover",
                                        percentage: 100,
                                        status: "Upcoming",
                                        amount: "₹8L",
                                    },
                                ].map((milestone, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-3 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {milestone.milestone}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {milestone.percentage}% completion
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={
                                                    milestone.status === "Billed"
                                                        ? "default"
                                                        : milestone.status === "Due"
                                                            ? "destructive"
                                                            : "outline"
                                                }
                                            >
                                                {milestone.status}
                                            </Badge>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                {milestone.amount}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Document Management</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Manage and organize billing-related documents
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkUpload}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs
                                    defaultValue="all"
                                    className="w-full"
                                    onValueChange={(value) => setSelectedTab(value as any)}
                                >
                                    <TabsList className="w-full grid grid-cols-5 mb-4">
                                        <TabsTrigger value="all">All Documents</TabsTrigger>
                                        <TabsTrigger value="invoices">Invoices</TabsTrigger>
                                        <TabsTrigger value="contracts">Contracts</TabsTrigger>
                                        <TabsTrigger value="receipts">Receipts</TabsTrigger>
                                        <TabsTrigger value="others">Others</TabsTrigger>
                                    </TabsList>

                                    <div className="space-y-4">
                                        {filteredDocuments.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-gray-100 rounded">
                                                        <FileText className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{doc.name || "N/A"}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">
                                                                {doc.type || "Unknown"}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {doc.size || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground">
                                                            Uploaded by {doc.uploadedBy || "Unknown"}
                                                        </p>
                                                        <p className="text-sm">{doc.date || "N/A"}</p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            doc.status === "Verified"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {doc.status || "Unknown"}
                                                    </Badge>
                                                    <div className="flex items-center gap-2">
                                                        {doc.status === "Pending Review" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleVerify(doc)}
                                                            >
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDownload(doc)}
                                                            disabled={documentLoadingStates[doc.id]}
                                                        >
                                                            {documentLoadingStates[doc.id] ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Download className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(doc)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {documents.slice(0, 3).map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded ${doc.status === "Verified"
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-yellow-100 text-yellow-600"
                                                        }`}
                                                >
                                                    {doc.status === "Verified" ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                    ) : (
                                                        <Clock className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{doc.name || "N/A"}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {doc.status === "Verified"
                                                            ? "Verified"
                                                            : "Uploaded"}{" "}
                                                        by {doc.uploadedBy || "Unknown"}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {doc.date
                                                    ? new Date(doc.date).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Invoice Builder Modal */}
            {showInvoiceModal && (
                <div className="-top-10 ">
                    <InvoiceBuilderModal showRetentionOptions={false} showWorkCompleted={true} onClose={() => setShowInvoiceModal(false)} />
                </div>
            )}
            {showPaymentEntryModal && (
                <div className="-top-10 ">
                    <PaymentEntryModal onClose={() => setShowPaymentEntryModal(false)} />
                </div>
            )}

            {/* Add Toaster */}
            <Toaster />
        </div>
    );
};

export default BillingManagerDashboard;
