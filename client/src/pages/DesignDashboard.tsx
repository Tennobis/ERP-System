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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  PieChart,
  Pie,
} from "recharts";
import {
  PaintBucket,
  FileText,
  Clock,
  AlertTriangle,
  Upload,
  Pencil,
  CheckCircle,
  Eye,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { designsData } from "@/lib/dummy-data";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { useUserFilter } from "@/contexts/UserFilterContext";
const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Design {
  id: string;
  name: string;
  clientId: string;
  client?: { id: string; name: string };
  project?: { id: string; name: string };
  status: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  projectId: string;
  files: string[];
  images: string[];
}

// Types for clients and projects
interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

interface Bottleneck {
  type: string;
  project: string;
  days?: number;
  revisions?: number;
  designer: string;
  status: string;
  timeline?: Array<{ date: string; event: string }>;
  versions?: Array<{
    version: number;
    date: string;
    reviewer: string;
    status: string;
  }>;
  sla?: {
    sent: string;
    expected: string;
    overdue: boolean;
  };
}

const bottlenecks: Bottleneck[] = [
  {
    type: "Longest Feedback Delay",
    project: "Commercial Tower",
    days: 7,
    designer: "Jane Smith",
    status: "Awaiting Response",
    timeline: [
      { date: "2024-01-15", event: "Design Submitted" },
      { date: "2024-01-18", event: "Initial Review" },
      { date: "2024-01-22", event: "Feedback Due" },
    ],
  },
  {
    type: "Rejected Multiple Times",
    project: "Villa Complex",
    revisions: 6,
    designer: "John Doe",
    status: "In Revision",
    versions: [
      {
        version: 1,
        date: "2024-01-01",
        reviewer: "Mike Wilson",
        status: "Rejected",
      },
      {
        version: 2,
        date: "2024-01-05",
        reviewer: "Sarah Johnson",
        status: "Rejected",
      },
      {
        version: 3,
        date: "2024-01-10",
        reviewer: "Mike Wilson",
        status: "Rejected",
      },
    ],
  },
  {
    type: "Client Pending Response",
    project: "Shopping Mall",
    days: 5,
    designer: "Mike Johnson",
    status: "Client Review",
    sla: {
      sent: "2024-01-17",
      expected: "2024-01-20",
      overdue: true,
    },
  },
];

// Mobile-optimized columns - only name and actions
const mobileDesignColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Drawing Name",
    cell: ({ row }) => {
      const design = row.original;
      const [isExpanded, setIsExpanded] = useState(false);

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{design.name}</div>
              <div className="text-sm text-muted-foreground">
                {design.client?.name || "N/A"} • {design.project?.name || "N/A"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isExpanded && (
            <div className="md:hidden space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Created By:</span>
                  <div className="text-muted-foreground">
                    {design.createdBy?.name || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>
                    <Badge
                      variant={
                        design.status === "APPROVED"
                          ? "default"
                          : design.status === "UNDER_REVIEW"
                          ? "secondary"
                          : design.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {design.status === "UNDER_REVIEW"
                        ? "Under Review"
                        : design.status === "APPROVED"
                        ? "Approved"
                        : design.status === "REJECTED"
                        ? "Rejected"
                        : design.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Files:</span>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {design.files ? design.files.length : 0}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Images:</span>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <PaintBucket className="h-3 w-3" />
                    {design.images ? design.images.length : 0}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Created:</span>
                  <div className="text-muted-foreground">
                    {new Date(design.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    },
  },
];

// Desktop columns - all original columns
const desktopDesignColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Drawing Name",
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original.client;
      return client ? client.name : "N/A";
    },
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      const project = row.original.project;
      return project ? project.name : "N/A";
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      return createdBy ? createdBy.name : "N/A";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "APPROVED"
          ? "default"
          : status === "UNDER_REVIEW"
          ? "secondary"
          : status === "REJECTED"
          ? "destructive"
          : "outline";
      const displayStatus =
        status === "UNDER_REVIEW"
          ? "Under Review"
          : status === "APPROVED"
          ? "Approved"
          : status === "REJECTED"
          ? "Rejected"
          : status;
      return <Badge variant={variant}>{displayStatus}</Badge>;
    },
  },
  {
    accessorKey: "files",
    header: "Files",
    cell: ({ row }) => {
      const files = row.getValue("files") as string[];
      return (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{files ? files.length : 0}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      return (
        <div className="flex items-center gap-2">
          <PaintBucket className="h-4 w-4" />
          <span>{images ? images.length : 0}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
];

const DesignDashboardContent = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [designStats, setDesignStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [approvalTrendData, setApprovalTrendData] = useState([]);
  const [turnaroundData, setTurnaroundData] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAnalyticModalOpen, setIsAnalyticModalOpen] = useState(false);
  const [isBottleneckModalOpen, setIsBottleneckModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isSubmitDesignModalOpen, setIsSubmitDesignModalOpen] = useState(false);
  const [isEditDesignModalOpen, setIsEditDesignModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedAnalytic, setSelectedAnalytic] = useState<string | null>(null);
  const [selectedBottleneck, setSelectedBottleneck] = useState<any | null>(
    null
  );
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(
    null
  );
  const [expandedQueueItems, setExpandedQueueItems] = useState<
    Record<string, boolean>
  >({});

  // New design form state
  const [newDesignForm, setNewDesignForm] = useState({
    name: "",
    clientId: "",
    projectId: "",
    files: [] as File[],
    images: [] as File[],
  });

  // Edit design form state
  const [editDesignForm, setEditDesignForm] = useState({
    name: "",
    clientId: "",
    projectId: "",
    status: "",
    files: [] as string[],
    images: [] as string[],
  });
  const {
    targetUserId,
    selectedUser,
    currentUser,
    selectedUserId,
    setSelectedUserId,
    isAdminUser,
  } = useUserFilter();

  const userID = targetUserId || user?.id;

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/overview")) return "overview";
    if (path.includes("/queue")) return "queue";
    return "overview"; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      overview: "/design-dashboard/overview",
      queue: "/design-dashboard/queue",
    };
    navigate(tabRoutes[value]);
  };

  const fetchDesigns = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = (
        user?.role === "admin" || user?.role === "md"
          ? selectedUser?.id == currentUser?.id
          : user?.role === "admin" || user?.role === "md"
      )
        ? `${API_URL}/designs`
        : `${API_URL}/designs/${userID}`;
      const response = await axios.get(endpoint, { headers });
      setDesigns(response.data);
    } catch (error) {
      console.error("Error fetching designs:", error);
    }
  };

  useEffect(() => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Initialize empty stats (will be calculated from real data)
    setDesignStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    setApprovalTrendData([
      { week: "Week 1", submitted: 10, approved: 7, rejected: 3 },
      { week: "Week 2", submitted: 12, approved: 8, rejected: 4 },
      { week: "Week 3", submitted: 15, approved: 10, rejected: 5 },
      { week: "Week 4", submitted: 8, approved: 6, rejected: 2 },
    ]);
    setTurnaroundData([
      { designer: "John Doe", avgDays: 3 },
      { designer: "Jane Smith", avgDays: 2.5 },
      { designer: "Mike Johnson", avgDays: 4 },
    ]);

    // Fetch actual designs data

    fetchDesigns();

    // Fetch clients and projects for the form
    axios
      .get(`${API_URL}/clients`, { headers })
      .then((res) => setClients(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/projects`, { headers })
      .then((res) => setProjects(res.data))
      .catch(() => {});
  }, [userID]);

  // Calculate design statistics whenever designs data changes
  useEffect(() => {
    if (designs && designs.length > 0) {
      const total = designs.length;
      const pending = designs.filter(
        (d: any) => d.status === "UNDER_REVIEW"
      ).length;
      const approved = designs.filter(
        (d: any) => d.status === "APPROVED"
      ).length;
      const rejected = designs.filter(
        (d: any) => d.status === "REJECTED"
      ).length;

      setDesignStats({
        total,
        pending,
        approved,
        rejected,
      });
    }
  }, [designs]);

  const handleUploadRevision = (design: any) => {
    setSelectedDesign(design);
    setIsUploadModalOpen(true);
  };

  const handleAddComment = (design: any) => {
    setSelectedDesign(design);
    setIsCommentModalOpen(true);
  };
  const handleEscalate = (design: any) => {
    toast.success(`Design "${design.name}" escalated to Design Head`);
  };

  const handleSubmitRevision = () => {
    toast.success("Design revision uploaded successfully!");
    setIsUploadModalOpen(false);
    setSelectedDesign(null);
  };

  const handleSubmitComment = () => {
    toast.success("Comment added successfully!");
    setIsCommentModalOpen(false);
    setSelectedDesign(null);
  };

  const handleSendToReview = (design: any) => {
    setDesigns((prevDesigns) =>
      prevDesigns.map((d) =>
        d.id === design.id ? { ...d, status: "UNDER_REVIEW" } : d
      )
    );
    toast.success(`Design "${design.name}" sent for review`);
  };

  const handleViewDetails = (design: any) => {
    setSelectedDesign(design);
    setIsDetailsModalOpen(true);
  };

  const handleApproveDesign = async (design: any) => {
    if (!user) {
      toast.error("You must be logged in to approve a design");
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          };

      // Update design status to approved
      await axios.put(
        `${API_URL}/designs/${design.id}`,
        {
          ...design,
          status: "APPROVED",
        },
        { headers }
      );

      // Update local state
      setDesigns((prevDesigns) =>
        prevDesigns.map((d) =>
          d.id === design.id ? { ...d, status: "APPROVED" } : d
        )
      );

      toast.success(`Design "${design.name}" approved`);
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error approving design:", error);
      toast.error("Failed to approve design");
    }
  };

  const handleRejectDesign = async (design: any) => {
    if (!user) {
      toast.error("You must be logged in to reject a design");
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          };

      // Update design status to rejected
      await axios.put(
        `${API_URL}/designs/${design.id}`,
        {
          ...design,
          status: "REJECTED",
        },
        { headers }
      );

      // Update local state
      setDesigns((prevDesigns) =>
        prevDesigns.map((d) =>
          d.id === design.id ? { ...d, status: "REJECTED" } : d
        )
      );

      toast.success(`Design "${design.name}" rejected`);
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error rejecting design:", error);
      toast.error("Failed to reject design");
    }
  };

  const handleEditDesign = (design: any) => {
    setSelectedDesign(design);
    setEditDesignForm({
      name: design.name,
      clientId: design.clientId,
      projectId: design.projectId,
      status: design.status,
      files: design.files || [],
      images: design.images || [],
    });
    setIsEditDesignModalOpen(true);
  };

  const handleDeleteDesign = async (design: any) => {
    if (!user) {
      toast.error("You must be logged in to delete a design");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the design "${design.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Delete design via API
      await axios.delete(`${API_URL}/designs/${design.id}`, { headers });

      // Remove from local state
      setDesigns((prevDesigns) =>
        prevDesigns.filter((d) => d.id !== design.id)
      );

      toast.success(`Design "${design.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting design:", error);
      toast.error("Failed to delete design");
    }
  };

  // Handle new design form input changes
  const handleNewDesignInputChange = (field: string, value: string) => {
    setNewDesignForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file uploads for new design
  const handleNewDesignFileChange = (
    field: "files" | "images",
    files: FileList | null
  ) => {
    if (files) {
      const fileArray = Array.from(files);
      setNewDesignForm((prev) => ({ ...prev, [field]: fileArray }));
    }
  };

  // Handle edit design form input changes
  const handleEditDesignInputChange = (field: string, value: string) => {
    setEditDesignForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle edit design form submission
  const handleUpdateDesign = async () => {
    if (!user || !selectedDesign) {
      toast.error("You must be logged in to update a design");
      return;
    }

    if (
      !editDesignForm.name ||
      !editDesignForm.clientId ||
      !editDesignForm.projectId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          };

      // Update design via API
      await axios.put(
        `${API_URL}/designs/${selectedDesign.id}`,
        editDesignForm,
        { headers }
      );

      // Update local state
      setDesigns((prevDesigns) =>
        prevDesigns.map((d) =>
          d.id === selectedDesign.id ? { ...d, ...editDesignForm } : d
        )
      );

      toast.success("Design updated successfully!");
      setIsEditDesignModalOpen(false);
      setSelectedDesign(null);

      // Refresh designs list
      const refreshHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      axios
        .get(`${API_URL}/designs`, { headers: refreshHeaders })
        .then((res) => setDesigns(res.data))
        .catch(() => {});
    } catch (error) {
      console.error("Error updating design:", error);
      toast.error("Failed to update design");
    }
  };

  // Handle new design form submission
  const handleSubmitNewDesign = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a design");
      return;
    }

    if (
      !newDesignForm.name ||
      !newDesignForm.clientId ||
      !newDesignForm.projectId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};

      let fileUrls: string[] = [];
      let imageUrls: string[] = [];

      // Upload files to S3 if any
      if (newDesignForm.files.length > 0) {
        const fileFormData = new FormData();
        newDesignForm.files.forEach((file) => {
          fileFormData.append("files", file);
        });

        try {
          const fileUploadResponse = await axios.post(
            `${API_URL}/designs/${userID}/upload/files`,
            fileFormData,
            {
              headers: {
                ...headers,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          fileUrls = fileUploadResponse.data.urls || [];
          toast.success(`${fileUrls.length} file(s) uploaded successfully`);
        } catch (error) {
          console.error("Error uploading files:", error);
          toast.error("Failed to upload files");
          return;
        }
      }

      // Upload images to S3 if any
      if (newDesignForm.images.length > 0) {
        const imageFormData = new FormData();
        newDesignForm.images.forEach((image) => {
          imageFormData.append("images", image);
        });

        try {
          const imageUploadResponse = await axios.post(
            `${API_URL}/designs/${userID}/upload/images`,
            imageFormData,
            {
              headers: {
                ...headers,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          imageUrls = imageUploadResponse.data.urls || [];
          toast.success(`${imageUrls.length} image(s) uploaded successfully`);
        } catch (error) {
          console.error("Error uploading images:", error);
          toast.error("Failed to upload images");
          return;
        }
      }

      // Create design data with S3 URLs
      const designData = {
        name: newDesignForm.name,
        clientId: newDesignForm.clientId,
        projectId: newDesignForm.projectId,
        files: fileUrls,
        images: imageUrls,
        status: "UNDER_REVIEW",
      };

      // Submit to backend using the correct endpoint with userId
      await axios.post(`${API_URL}/designs/${userID}`, designData, {
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      });

      toast.success("Design submitted successfully!");
      setIsSubmitDesignModalOpen(false);

      // Reset form
      setNewDesignForm({
        name: "",
        clientId: "",
        projectId: "",
        files: [],
        images: [],
      });

      // Refresh designs list
      fetchDesigns();
    } catch (error) {
      console.error("Error submitting design:", error);
      toast.error("Failed to submit drawing");
    }
  };

  return (
    <div className="space-y-6">
      <UserFilterComponent />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Drawing Dashboard
          </h1>
          <p className="text-muted-foreground">
            Drawing approval workflow and analytics
          </p>
        </div>
        <Button
          onClick={() => setIsSubmitDesignModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Submit New Drawing
        </Button>
      </div>

      <Tabs
        value={getCurrentTab()}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        {/* Mobile Tab Navigation */}
        <div className="md:hidden">
          <Select value={getCurrentTab()} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Drawing Overview</SelectItem>
              <SelectItem value="queue">Review Queue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tab Navigation */}
        <TabsList className="hidden md:grid w-full grid-cols-2">
          <TabsTrigger value="overview">Drawing Overview</TabsTrigger>
          {/* <TabsTrigger value="analytics">Approval Analytics</TabsTrigger> */}
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Drawings"
              value={designStats.total}
              icon={FileText}
              description="All drawing submissions"
              trend={{ value: 12, label: "this month" }}
              onClick={() => toast.info("Viewing all drawings")}
            />
            <StatCard
              title="Pending Approvals"
              value={designStats.pending}
              icon={Clock}
              description="Awaiting review"
              onClick={() => toast.info("Opening pending approvals")}
            />
            <StatCard
              title="Approved This Month"
              value={designStats.approved}
              icon={CheckCircle}
              description="Successfully approved"
              trend={{ value: 8, label: "vs last month" }}
              onClick={() => toast.info("Viewing approved drawings")}
            />
            <StatCard
              title="Rejected Drawings"
              value={designStats.rejected}
              icon={AlertTriangle}
              description="Requiring revisions"
              onClick={() => toast.info("Viewing rejection reasons")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* <Card>
              <CardHeader>
                <CardTitle>Upload vs Approval Trends</CardTitle>
                <CardDescription>Weekly submission and approval tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={approvalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card> */}

            {/* <Card>
              <CardHeader>
                <CardTitle>Designer Performance</CardTitle>
                <CardDescription>Average turnaround time by designer</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={turnaroundData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="designer" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Avg. Turnaround']} />
                    <Bar dataKey="avgDays" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card> */}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Design Gallery</CardTitle>
              <CardDescription>
                Recent design submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile View */}
              <div className="md:hidden">
                <DataTable
                  columns={[
                    ...mobileDesignColumns,
                    {
                      id: "actions",
                      header: "Actions",
                      cell: ({ row }) => (
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(row.original)}
                            className="w-full justify-start"
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDesign(row.original)}
                            className="w-full justify-start"
                          >
                            <Pencil className="h-3 w-3 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDesign(row.original)}
                            className="w-full justify-start"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </Button>
                          {row.original.status !== "UNDER_REVIEW" &&
                            row.original.status !== "APPROVED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendToReview(row.original)}
                                className="w-full justify-start"
                              >
                                Send to Review
                              </Button>
                            )}
                        </div>
                      ),
                    },
                  ]}
                  data={designs}
                  searchKey="name"
                />
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <DataTable
                  columns={[
                    ...desktopDesignColumns,
                    {
                      id: "actions",
                      header: "Actions",
                      cell: ({ row }) => (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(row.original)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDesign(row.original)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDesign(row.original)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          {row.original.status !== "UNDER_REVIEW" &&
                            row.original.status !== "APPROVED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendToReview(row.original)}
                              >
                                Send to Review
                              </Button>
                            )}
                        </div>
                      ),
                    },
                  ]}
                  data={designs}
                  searchKey="name"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Avg Turnaround Time"
              value="3.4 days"
              icon={Clock}
              description="Design review cycle"
              trend={{ value: -0.5, label: "improvement" }}
              onClick={() => {
                setSelectedAnalytic("turnaround");
                setIsAnalyticModalOpen(true);
              }}
            />
            <StatCard
              title="Feedback Delays"
              value="2"
              icon={AlertTriangle}
              description="Delayed responses"
              onClick={() => {
                setSelectedAnalytic("delays");
                setIsAnalyticModalOpen(true);
              }}
            />
            <StatCard
              title="Design Efficiency"
              value="94%"
              icon={PaintBucket}
              description="First-time approval rate"
              trend={{ value: 3, label: "this quarter" }}
              onClick={() => {
                setSelectedAnalytic("efficiency");
                setIsAnalyticModalOpen(true);
              }}
            />
            <StatCard
              title="Most Reviewed"
              value="6"
              icon={FileText}
              description="Highest revision count"
              onClick={() => {
                setSelectedAnalytic("revisions");
                setIsAnalyticModalOpen(true);
              }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bottleneck Analysis</CardTitle>
              <CardDescription>Critical drawing process delays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bottlenecks.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedBottleneck(item);
                      setIsBottleneckModalOpen(true);
                    }}
                  >
                    <div>
                      <h3 className="font-medium">{item.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.project} - {item.designer}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-orange-600">
                        {"days" in item
                          ? `${item.days} days`
                          : `${item.revisions} revisions`}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEscalation(item);
                          setIsEscalateModalOpen(true);
                        }}
                      >
                        Escalate to Drawing Head
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>Drawing awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {designs.filter((d) => d.status === "UNDER_REVIEW").length ===
                0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      No drawing under review
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All drawing have been reviewed!
                    </p>
                  </div>
                ) : (
                  designs
                    .filter((d) => d.status === "UNDER_REVIEW")
                    .map((design, index) => {
                      const isExpanded = expandedQueueItems[design.id] || false;

                      const toggleExpanded = () => {
                        setExpandedQueueItems((prev) => ({
                          ...prev,
                          [design.id]: !prev[design.id],
                        }));
                      };

                      return (
                        <div
                          key={design.id || index}
                          className="border rounded-lg"
                        >
                          {/* Mobile Layout */}
                          <div className="md:hidden">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-medium">{design.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {design.client?.name || "N/A"} •{" "}
                                    {design.project?.name || "N/A"}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={toggleExpanded}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                              {isExpanded && (
                                <div className="space-y-3 p-3 bg-muted/50 rounded-lg mb-3">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        Created by:
                                      </span>
                                      <div className="text-muted-foreground">
                                        {design.createdBy?.name || "N/A"}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Created:
                                      </span>
                                      <div className="text-muted-foreground">
                                        {new Date(
                                          design.createdAt
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Files:
                                      </span>
                                      <div className="text-muted-foreground flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {design.files ? design.files.length : 0}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Images:
                                      </span>
                                      <div className="text-muted-foreground flex items-center gap-1">
                                        <PaintBucket className="h-3 w-3" />
                                        {design.images
                                          ? design.images.length
                                          : 0}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Badge variant="secondary">
                                      Under Review
                                    </Badge>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddComment(design)}
                                  className="w-full"
                                >
                                  Comment
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(design)}
                                  className="w-full"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Details
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectDesign(design)}
                                  className="w-full"
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveDesign(design)}
                                  className="w-full"
                                >
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden md:flex items-center justify-between p-4">
                            <div>
                              <h3 className="font-medium">{design.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Client: {design.client?.name || "N/A"} •
                                Project: {design.project?.name || "N/A"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Created by: {design.createdBy?.name || "N/A"} •
                                Created:{" "}
                                {new Date(
                                  design.createdAt
                                ).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">Under Review</Badge>
                                {design.files && design.files.length > 0 && (
                                  <Badge variant="outline">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {design.files.length} Files
                                  </Badge>
                                )}
                                {design.images && design.images.length > 0 && (
                                  <Badge variant="outline">
                                    <PaintBucket className="h-3 w-3 mr-1" />
                                    {design.images.length} Images
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddComment(design)}
                              >
                                Comment
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(design)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectDesign(design)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproveDesign(design)}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Drawing Revision</DialogTitle>
            <DialogDescription>
              Upload a new revision for {selectedDesign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Drawing File</Label>
              <Input id="file" type="file" accept=".pdf,.dwg,.jpg,.png" />
            </div>
            <div>
              <Label htmlFor="notes">Revision Notes</Label>
              <Textarea id="notes" placeholder="Describe the changes made..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitRevision}>Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Modal */}
      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add feedback for {selectedDesign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea id="comment" placeholder="Enter your feedback..." />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCommentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitComment}>Add Comment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Design Details</DialogTitle>
            <DialogDescription>
              Comprehensive view of the design and feedback
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-6">
              {selectedDesign && (
                <>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <h4 className="text-sm font-bold mb-2">
                        Basic Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{selectedDesign.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span>{selectedDesign.client?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Project:
                          </span>
                          <span>{selectedDesign.project?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created By:
                          </span>
                          <span>{selectedDesign.createdBy?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            variant={
                              selectedDesign.status === "APPROVED"
                                ? "default"
                                : selectedDesign.status === "UNDER_REVIEW"
                                ? "secondary"
                                : selectedDesign.status === "REJECTED"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {selectedDesign.status === "UNDER_REVIEW"
                              ? "Under Review"
                              : selectedDesign.status === "APPROVED"
                              ? "Approved"
                              : selectedDesign.status === "REJECTED"
                              ? "Rejected"
                              : selectedDesign.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-2">
                        Drawing Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created Date:
                          </span>
                          <span>
                            {new Date(
                              selectedDesign.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Files:</span>
                          <span>{selectedDesign.files?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Images:</span>
                          <span>{selectedDesign.images?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Last Updated:
                          </span>
                          <span>
                            {new Date(
                              selectedDesign.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <Separator /> */}

                  {/* <div>
                    <h4 className="text-sm font-medium mb-4">Design Preview</h4>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>

                  <Separator /> */}

                  {/* <div>
                    <h4 className="text-sm font-medium mb-4">Comments & Feedback</h4>
                    <div className="space-y-4">
                      {[
                        { user: 'John Doe', comment: 'Please adjust the dimensions of the north elevation.', date: '2024-01-20 10:30', priority: 'high' },
                        { user: 'Jane Smith', comment: 'Color scheme looks great, but consider alternative materials.', date: '2024-01-20 09:45', priority: 'medium' },
                        { user: 'Mike Johnson', comment: 'Approved all structural elements.', date: '2024-01-19 16:20', priority: 'low' },
                      ].map((comment, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">{comment.user}</span>
                              <Badge variant="outline" className="ml-2">{comment.priority}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{comment.date}</span>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            {/* <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button> */}
            {selectedDesign?.status === "UNDER_REVIEW" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectDesign(selectedDesign)}
                >
                  Reject Design
                </Button>
                <Button onClick={() => handleApproveDesign(selectedDesign)}>
                  Approve Design
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Detail Modal */}
      <Dialog open={isAnalyticModalOpen} onOpenChange={setIsAnalyticModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAnalytic === "turnaround"
                ? "Turnaround Time Analysis"
                : selectedAnalytic === "delays"
                ? "Feedback Delays"
                : selectedAnalytic === "efficiency"
                ? "Design Cycle Efficiency"
                : selectedAnalytic === "revisions"
                ? "Most Reviewed Designs"
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <>
                {selectedAnalytic === "turnaround" ? (
                  <LineChart data={approvalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="review"
                      name="Review Time"
                      stroke="#3b82f6"
                    />
                    <Line
                      type="monotone"
                      dataKey="redesign"
                      name="Redesign Time"
                      stroke="#10b981"
                    />
                    <Line
                      type="monotone"
                      dataKey="approval"
                      name="Approval Time"
                      stroke="#f59e0b"
                    />
                  </LineChart>
                ) : selectedAnalytic === "delays" ? (
                  <BarChart data={turnaroundData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="designer" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="delays" fill="#ef4444" />
                  </BarChart>
                ) : selectedAnalytic === "efficiency" ? (
                  <PieChart>
                    <Tooltip />
                    <Pie
                      data={[
                        { name: "Ideal Cycle", value: 70 },
                        { name: "Extended Cycle", value: 30 },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      fill="#3b82f6"
                    />
                  </PieChart>
                ) : null}
              </>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottleneck Detail Modal */}
      <Dialog
        open={isBottleneckModalOpen}
        onOpenChange={setIsBottleneckModalOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedBottleneck?.type}</DialogTitle>
            <DialogDescription>
              {selectedBottleneck?.project} - {selectedBottleneck?.designer}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {selectedBottleneck?.timeline && (
              <div className="space-y-4">
                <h4 className="font-medium">Timeline</h4>
                {selectedBottleneck.timeline.map(
                  (event: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 border-l-2 border-primary"
                    >
                      <span>{event.event}</span>
                      <span className="text-muted-foreground">
                        {event.date}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
            {selectedBottleneck?.versions && (
              <div className="space-y-4">
                <h4 className="font-medium">Submission History</h4>
                {selectedBottleneck.versions.map(
                  (version: any, index: number) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="flex justify-between">
                        <span>Version {version.version}</span>
                        <Badge
                          variant={
                            version.status === "Rejected"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {version.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Reviewed by {version.reviewer} on {version.date}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
            {selectedBottleneck?.sla && (
              <div className="space-y-4">
                <h4 className="font-medium">SLA Details</h4>
                <div className="p-4 border rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sent Date</p>
                      <p className="font-medium">
                        {selectedBottleneck.sla.sent}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Expected Response
                      </p>
                      <p className="font-medium">
                        {selectedBottleneck.sla.expected}
                      </p>
                    </div>
                  </div>
                  {selectedBottleneck.sla.overdue && (
                    <Badge variant="destructive" className="mt-4">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Escalation Modal */}
      <Dialog open={isEscalateModalOpen} onOpenChange={setIsEscalateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Drawing Head</DialogTitle>
            <DialogDescription>
              Confirm escalation for {selectedEscalation?.project}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalation-note">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="escalation-note"
                placeholder="Add any specific concerns or context..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEscalateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success(
                    `Escalated ${selectedEscalation?.project} to Design Head`
                  );
                  setIsEscalateModalOpen(false);
                }}
              >
                Confirm Escalation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit New Design Modal */}
      <Dialog
        open={isSubmitDesignModalOpen}
        onOpenChange={setIsSubmitDesignModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit New Drawing</DialogTitle>
            <DialogDescription>
              Submit a new Drawing for review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="design-name">Drawing Name *</Label>
              <Input
                id="design-name"
                value={newDesignForm.name}
                onChange={(e) =>
                  handleNewDesignInputChange("name", e.target.value)
                }
                placeholder="Enter drawing name"
              />
            </div>

            <div>
              <Label htmlFor="client">Client *</Label>
              <Select
                value={newDesignForm.clientId}
                onValueChange={(value) =>
                  handleNewDesignInputChange("clientId", value)
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

            <div>
              <Label htmlFor="project">Project *</Label>
              <Select
                value={newDesignForm.projectId}
                onValueChange={(value) =>
                  handleNewDesignInputChange("projectId", value)
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
              <Label htmlFor="design-files">Drawing Files</Label>
              <Input
                id="design-files"
                type="file"
                accept=".pdf,.dwg,.dxf,.rvt"
                multiple
                onChange={(e) =>
                  handleNewDesignFileChange("files", e.target.files)
                }
              />
              {newDesignForm.files.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {newDesignForm.files.length} file(s) selected
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="design-images">Drawing Images</Label>
              <Input
                id="design-images"
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                multiple
                onChange={(e) =>
                  handleNewDesignFileChange("images", e.target.files)
                }
              />
              {newDesignForm.images.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {newDesignForm.images.length} image(s) selected
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmitDesignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitNewDesign}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Drawing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Design Modal */}
      <Dialog
        open={isEditDesignModalOpen}
        onOpenChange={setIsEditDesignModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Drawing</DialogTitle>
            <DialogDescription>Update drawing information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-design-name">Drawing Name *</Label>
              <Input
                id="edit-design-name"
                value={editDesignForm.name}
                onChange={(e) =>
                  handleEditDesignInputChange("name", e.target.value)
                }
                placeholder="Enter drawing name"
              />
            </div>

            <div>
              <Label htmlFor="edit-client">Client *</Label>
              <Select
                value={editDesignForm.clientId}
                onValueChange={(value) =>
                  handleEditDesignInputChange("clientId", value)
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

            <div>
              <Label htmlFor="edit-project">Project *</Label>
              <Select
                value={editDesignForm.projectId}
                onValueChange={(value) =>
                  handleEditDesignInputChange("projectId", value)
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
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editDesignForm.status}
                onValueChange={(value) =>
                  handleEditDesignInputChange("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDesignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateDesign}>
                <Pencil className="h-4 w-4 mr-2" />
                Update Drawing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
const DesignDashboard = () => {
  return (
    <PageUserFilterProvider allowedRoles={["client_manager", "project"]}>
      <DesignDashboardContent />
    </PageUserFilterProvider>
  );
};

export default DesignDashboard;
