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
import { Calendar1, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import {
  Download,
  Plus,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Edit,
  Eye,
  Calculator,
  TrendingUp,
  Clock,
  CheckCircle,
  CheckCircle2,
  X,
  Trash2,
} from "lucide-react";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { TenderDashboard } from "@/components/tender-management/tender-dashboard";
import BidPreparationModal from "@/components/modals/BidPreparationModal";
import BOQManagement from "@/components/boq/BOQManagement";
import { useBOQStats } from "@/hooks/useBOQStats";
import { read, utils, write } from "xlsx";
import { saveAs } from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { useUserFilter } from "@/contexts/UserFilterContext";
import { useUser } from "@/contexts/UserContext";
const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const TenderManagementContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const {user} = useUser()
  const { targetUserId, selectedUser, currentUser, setSelectedUserId } =  useUserFilter();
  const userID = targetUserId || user?.id || ""

  // Get BOQ statistics
  const boqStats = useBOQStats();

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isViewMode, setIsViewMode] = useState(true);
  const [submissionData, setSubmissionData] = useState({
    status: "",
    notes: "",
    followUpDate: "",
    contactPerson: "",
    submissionStatus: "",
  });
  const [tenders, setTenders] = useState([]);
  const [expandedTenders, setExpandedTenders] = useState<Set<number>>(
    new Set()
  );

  const fetchTenders = () => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
          ? `${API_URL}/tenders`
          : `${API_URL}/tenders?userId=${userID}`;
          console.log("Fetching tenders from endpoint:", endpoint);
    axios
      .get(endpoint, { headers })
      .then((res) => setTenders(res.data))
      .catch(() => {});
  };

  const handleDeleteTender = async (tenderId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this tender? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/tenders/${tenderId}`, { headers });

      toast({
        title: "Tender Deleted",
        description: "The tender has been successfully deleted.",
      });

      fetchTenders(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tender. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTenderStatus = async (
    tenderId: number,
    newStatus: string
  ) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${API_URL}/tenders/${tenderId}`,
        { status: newStatus },
        { headers }
      );

      toast({
        title: "Tender Updated",
        description: `Tender status has been updated to ${newStatus}.`,
      });

      fetchTenders(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tender status. Please try again.",
        variant: "destructive",
      });
    }
  };
 
  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/preparation')) return 'preparation';
    if (path.includes('/tracking')) return 'tracking';
    if (path.includes('/active-tenders')) return 'active-tenders';
    return 'dashboard'; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      dashboard: '/tender-management/dashboard',
      preparation: '/tender-management/preparation',
      tracking: '/tender-management/tracking',
      'active-tenders': '/tender-management/active-tenders'
    };
    navigate(tabRoutes[value]);
  };

  useEffect(() => {
    if(userID){
    fetchTenders();
    }
  }, [userID]);

  function handleExport() {
    const tendersSheet = utils.json_to_sheet(
      tenders.map((t) => ({
        ID: t.id,
        Project: t.projectName,
        Client: t.client,
        Value: t.estimatedValue,
        Submission: t.submissionDate,
        Status: t.status,
        Completion: t.completionPercentage,
        Category: t.category,
        Location: t.location,
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, tendersSheet, "Tenders");
    const wbout = write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "tenders-report.xlsx"
    );
  }

  const handleStartAnalysis = () => {
    setIsAnalysisModalOpen(true);
  };

  const handlePlanSchedule = () => {
    setIsScheduleModalOpen(true);
  };

  const handlePlanResources = () => {
    setIsResourceModalOpen(true);
  };

  const handleAccessTemplates = () => {
    setIsTemplateModalOpen(true);
  };

  const handleBuildTeam = () => {
    setIsTeamModalOpen(true);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setSubmissionData({
      status: submission.status,
      notes: submission.notes || "",
      followUpDate: submission.followUpDate || "",
      contactPerson: submission.contactPerson || "",
      submissionStatus: submission.submissionStatus || "submitted",
    });
    setIsViewMode(true);
    setIsSubmissionModalOpen(true);
  };

  const handleEditSubmission = (submission) => {
    setSelectedSubmission(submission);
    setSubmissionData({
      status: submission.status,
      notes: submission.notes || "",
      followUpDate: submission.followUpDate || "",
      contactPerson: submission.contactPerson || "",
      submissionStatus: submission.submissionStatus || "submitted",
    });
    setIsViewMode(false);
    setIsSubmissionModalOpen(true);
  };

  const handleSaveSubmission = () => {
    // Update the submission data in the mock data
    toast({
      title: "Submission Updated",
      description: "Tender submission has been updated successfully",
    });
    setIsSubmissionModalOpen(false);
  };

  const toggleTenderDetails = (tenderId: number) => {
    setExpandedTenders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tenderId)) {
        newSet.delete(tenderId);
      } else {
        newSet.add(tenderId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <UserFilterComponent />
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tender Management
             {selectedUser && selectedUser.id !== currentUser?.id && (
              <span className="text-lg text-muted-foreground ml-2">
                - {selectedUser.name}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Comprehensive bid preparation, submission tracking, and tender
            analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button
            onClick={() => {
              setEditingTender(null);
              setShowBidModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Tender
          </Button>
        </div>
      </div>

      <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="preparation">BOQ Generation</TabsTrigger>
          <TabsTrigger value="tracking">Submission Tracking</TabsTrigger>
          <TabsTrigger value="active-tenders">Active Tenders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <EnhancedStatCard
              title="Active Tenders"
              value={tenders
                .filter((t) => t.status === "ACTIVE")
                .length.toString()}
              icon={FileText}
              trend={{
                value:
                  tenders.length > 0
                    ? Math.round(
                        (tenders.filter((t) => t.status === "SUBMITTED")
                          .length /
                          tenders.length) *
                          100
                      )
                    : 0,
                label: "pending approval",
              }}
              threshold={{
                status:
                  tenders.length > 10
                    ? "good"
                    : tenders.length > 5
                    ? "warning"
                    : "critical",
                message:
                  tenders.length > 10
                    ? "Strong pipeline"
                    : tenders.length > 5
                    ? "Moderate pipeline"
                    : "Build pipeline",
              }}
            />
            <EnhancedStatCard
              title="Pipeline Value"
              value={`₹${(
                tenders.reduce(
                  (sum, t) =>
                    sum +
                    (t.requirements?.reduce(
                      (reqSum, req) => reqSum + (req.estimatedCost || 0),
                      0
                    ) || 0),
                  0
                ) / 10000000
              ).toFixed(3)}Cr`}
              icon={DollarSign}
              trend={{
                value: Math.round(
                  (tenders.filter((t) => t.status === "ACTIVE").length /
                    Math.max(tenders.length, 1)) *
                    100
                ),
                label: "of total value active",
              }}
              threshold={{
                status:
                  tenders.length > 15
                    ? "good"
                    : tenders.length > 8
                    ? "warning"
                    : "critical",
                message:
                  tenders.length > 15
                    ? "Excellent growth"
                    : "Focus on pipeline",
              }}
            />
            <EnhancedStatCard
              title="Success Rate"
              value={`${
                tenders.length > 0
                  ? Math.round(
                      (tenders.filter((t) => t.status === "ACTIVE").length /
                        tenders.length) *
                        100
                    )
                  : 0
              }%`}
              description="Active vs total tenders"
              icon={TrendingUp}
              trend={{
                value:
                  tenders.length > 0
                    ? Math.round(
                        (tenders.filter((t) => t.status === "REJECTED").length /
                          tenders.length) *
                          100
                      )
                    : 0,
                label: "rejection rate",
              }}
              threshold={{
                status:
                  tenders.length > 0 &&
                  tenders.filter((t) => t.status === "ACTIVE").length /
                    tenders.length >
                    0.5
                    ? "good"
                    : "warning",
                message:
                  tenders.length > 0 &&
                  tenders.filter((t) => t.status === "ACTIVE").length /
                    tenders.length >
                    0.5
                    ? "Above average"
                    : "Improve conversion",
              }}
            />
            <EnhancedStatCard
              title="Under Evaluation"
              value={tenders
                .filter((t) => t.status === "SUBMITTED")
                .length.toString()}
              description="Awaiting client decisions"
              icon={Clock}
              threshold={{
                status:
                  tenders.filter((t) => t.status === "SUBMITTED").length > 5
                    ? "warning"
                    : "good",
                message:
                  tenders.filter((t) => t.status === "SUBMITTED").length > 5
                    ? "Follow up required"
                    : "Good response time",
              }}
            />
          </div>

          {/* All Tenders Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Tenders Overview</CardTitle>
              <CardDescription>
                Complete list of all tenders including active, submitted, and
                rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter and Search Controls */}
                {/* <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under-evaluation">
                          Under Evaluation
                        </SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-categories">
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">
                          All Categories
                        </SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="infrastructure">
                          Infrastructure
                        </SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingTender(null);
                        setShowBidModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Tender
                    </Button>
                  </div>
                </div> */}

                {/* Tenders Cards with Expandable Details */}
                <div className="space-y-4">
                  {tenders.length > 0 ? (
                    tenders.map((tender) => (
                      <Card
                        key={tender.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-0">
                          {/* Main tender header - always visible */}
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-8 w-8"
                                  onClick={() => toggleTenderDetails(tender.id)}
                                >
                                  {expandedTenders.has(tender.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <div className="font-semibold">
                                    {tender.Project?.name || "N/A"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {tender.client?.name || "N/A"} •{" "}
                                    {tender.location}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-semibold">
                                    ₹
                                    {(
                                      tender.requirements?.reduce(
                                        (sum, req) =>
                                          sum + (req.estimatedCost || 0),
                                        0
                                      ) / 100000
                                    ).toFixed(3)}
                                    L
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(
                                      tender.submissionDate
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      tender.status === "awarded"
                                        ? "default"
                                        : tender.status === "SUBMITTED"
                                        ? "secondary"
                                        : tender.status === "under-evaluation"
                                        ? "outline"
                                        : tender.status === "REJECTED"
                                        ? "destructive"
                                        : tender.status === "ACTIVE"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {tender.status
                                      .replace("-", " ")
                                      .toUpperCase()}
                                  </Badge>

                                  {/* Approve/Reject buttons for submitted tenders */}
                                  {tender.status === "SUBMITTED" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateTenderStatus(
                                            tender.id,
                                            "ACTIVE"
                                          )
                                        }
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateTenderStatus(
                                            tender.id,
                                            "REJECTED"
                                          )
                                        }
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingTender(tender);
                                      setShowBidModal(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteTender(tender.id)
                                    }
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded tender details - only visible when expanded */}
                          {expandedTenders.has(tender.id) && (
                            <div className="border-t bg-gray-50/50 p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Basic Details */}
                                <div>
                                  <h4 className="font-medium mb-3">
                                    Tender Details
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                                      <span className="text-muted-foreground">
                                        Tender Number:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {tender.tenderNumber}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                                      <span className="text-muted-foreground">
                                        Category:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {tender.projectCategory}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                                      <span className="text-muted-foreground">
                                        Location:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {tender.location}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                      <span className="text-muted-foreground">
                                        Submission:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {new Date(
                                          tender.submissionDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {/* <div className="flex items-center">
                                      <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                                      <span className="text-muted-foreground">Value:</span>
                                      <span className="ml-1 font-medium">₹{(tender.requirements?.reduce((sum, req) => sum + (req.estimatedCost || 0), 0) / 100000).toFixed(3)}L</span>
                                    </div> */}
                                    <div className="flex items-center">
                                      <Calendar1 className="h-4 w-4 text-muted-foreground mr-2" />
                                      <span className="text-muted-foreground">
                                        Project Duration:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {tender.projectDuration || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Requirements */}
                                <div>
                                  <h4 className="font-medium mb-3">
                                    Requirements
                                  </h4>
                                  <div className="space-y-2">
                                    {tender.requirements
                                      ?.slice(0, 3)
                                      .map((req, index) => (
                                        <div key={index} className="text-sm">
                                          <div className="font-medium">
                                            {req.description}
                                          </div>
                                          <div className="text-muted-foreground">
                                            Qty: {req.quantity} <br /> Unit:{" "}
                                            {req.unit} <br /> Cost: ₹
                                            {(
                                              req.estimatedCost / 100000
                                            ).toFixed(3)}
                                            L
                                          </div>
                                        </div>
                                      )) || (
                                      <div className="text-sm text-muted-foreground">
                                        No requirements available
                                      </div>
                                    )}
                                    {tender.requirements?.length > 3 && (
                                      <div className="text-sm text-muted-foreground">
                                        +{tender.requirements.length - 3} more
                                        requirements
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Additional Info */}
                                <div>
                                  <h4 className="font-medium mb-3">
                                    Additional Information
                                  </h4>
                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Scope Of Work:
                                      </span>
                                      <p className="text-sm mt-1">
                                        {tender.scopeOfWork ||
                                          "No description available"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Special Requirements:
                                      </span>
                                      <p className="text-sm mt-1">
                                        {tender.specialRequirements ||
                                          "Not specified"}
                                      </p>
                                    </div>
                                    {/* <div>
                                      <span className="text-muted-foreground">Contact:</span>
                                      <p className="text-sm mt-1">{tender.contactPerson || 'Project Manager'}</p>
                                    </div> */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                          <h3 className="text-lg font-medium text-muted-foreground">
                            No Tenders Found
                          </h3>
                          <p className="text-muted-foreground">
                            Start by creating your first tender.
                          </p>
                          <Button
                            onClick={() => setShowBidModal(true)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Tender
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Summary Statistics */}
                {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {
                            tenders.filter(
                              (t) =>
                                t.status === "submitted" ||
                                t.status === "under-evaluation"
                            ).length
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Active Tenders
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {tenders.filter((t) => t.status === "awarded").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Awarded</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {
                            tenders.filter((t) => t.status === "rejected")
                              .length
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rejected
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          ₹
                          {(
                            tenders.reduce(
                              (sum, t) => sum + t.estimatedValue,
                              0
                            ) / 10000000
                          ).toFixed(1)}
                          Cr
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total Value
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparation" className="space-y-6">
          {/* BOQ Header with Action Button */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                BOQ Generation & Management
              </h2>
              <p className="text-muted-foreground">
                Create, manage and track your Bills of Quantities for tender
                preparation
              </p>
            </div>
          </div>

          {/* BOQ KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <EnhancedStatCard
              title="Total BOQs"
              value={boqStats.loading ? "..." : boqStats.totalBOQs.toString()}
              icon={Calculator}
              trend={{ value: boqStats.monthlyGrowth, label: "new this month" }}
              threshold={{
                status: boqStats.totalBOQs > 10 ? "good" : "warning",
                message:
                  boqStats.totalBOQs > 10
                    ? "Active BOQ generation"
                    : "Need more BOQs",
              }}
            />
            <EnhancedStatCard
              title="BOQ Value"
              value={boqStats.loading ? "..." : boqStats.totalValue}
              icon={DollarSign}
              trend={{
                value: boqStats.monthlyGrowth,
                label: "BOQs added this month",
              }}
              threshold={{
                status: "good",
                message: `${boqStats.activeProjects} active projects`,
              }}
            />
            <EnhancedStatCard
              title="Avg. Profit Margin"
              value={boqStats.loading ? "..." : `${boqStats.avgProfitMargin}%`}
              description="Cost optimization"
              icon={TrendingUp}
              trend={{
                value: boqStats.avgProfitMargin,
                label: "margin percentage",
              }}
              threshold={{
                status: boqStats.avgProfitMargin > 15 ? "good" : "warning",
                message:
                  boqStats.avgProfitMargin > 15
                    ? "Healthy margins"
                    : "Consider increasing margins",
              }}
            />
            <EnhancedStatCard
              title="Recent BOQs"
              value={boqStats.loading ? "..." : boqStats.pendingBOQs.toString()}
              description="Created in last 7 days"
              icon={Clock}
              threshold={{
                status: boqStats.pendingBOQs > 0 ? "good" : "warning",
                message:
                  boqStats.pendingBOQs > 0
                    ? "Active BOQ creation"
                    : "No recent activity",
              }}
            />
          </div>

          {/* BOQ Management Section */}
          <BOQManagement  />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          {/* Filter and Search Controls - Same as Dashboard */}
          {/* <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Select defaultValue="submitted">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under-evaluation">Under Evaluation</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-categories">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div> */}

          {/* Tenders Cards with Expandable Details - Only show SUBMITTED status */}
          <div className="space-y-4">
            {tenders.filter((tender) => tender.status === "SUBMITTED").length >
            0 ? (
              tenders
                .filter((tender) => tender.status === "SUBMITTED")
                .map((tender) => (
                  <Card
                    key={tender.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      {/* Main tender header - always visible */}
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8"
                              onClick={() => toggleTenderDetails(tender.id)}
                            >
                              {expandedTenders.has(tender.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div>
                              <div className="font-semibold">
                                {tender.Project?.name ||
                                  tender.projectName ||
                                  "N/A"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {tender.client?.name || tender.client || "N/A"}{" "}
                                • {tender.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold">
                                ₹
                                {(
                                  tender.requirements?.reduce(
                                    (sum, req) =>
                                      sum + (req.estimatedCost || 0),
                                    0
                                  ) / 100000 || tender.estimatedValue / 100000
                                ).toFixed(3)}
                                L
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  tender.submissionDate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {tender.status.toUpperCase()}
                              </Badge>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdateTenderStatus(tender.id, "ACTIVE")
                                }
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdateTenderStatus(
                                    tender.id,
                                    "REJECTED"
                                  )
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTender(tender);
                                  setShowBidModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded tender details - only visible when expanded */}
                      {expandedTenders.has(tender.id) && (
                        <div className="border-t bg-gray-50/50 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Basic Details */}
                            <div>
                              <h4 className="font-medium mb-3">
                                Tender Details
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Tender Number:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {tender.tenderNumber || `TN-${tender.id}`}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Category:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {tender.projectCategory ||
                                      tender.category ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Location:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {tender.location}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Submission Date:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {new Date(
                                      tender.submissionDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Requirements */}
                            <div>
                              <h4 className="font-medium mb-3">Requirements</h4>
                              <div className="space-y-2">
                                {tender.requirements
                                  ?.slice(0, 3)
                                  .map((req, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="font-medium">
                                        {req.description || req.item}
                                      </div>
                                      <div className="text-muted-foreground">
                                        Qty: {req.quantity} <br /> Unit:{" "}
                                        {req.unit} <br /> Cost: ₹
                                        {(req.estimatedCost / 100000).toFixed(
                                          3
                                        )}
                                        L
                                      </div>
                                    </div>
                                  )) || (
                                  <div className="text-sm text-muted-foreground">
                                    No requirements available
                                  </div>
                                )}
                                {tender.requirements?.length > 3 && (
                                  <div className="text-sm text-muted-foreground">
                                    +{tender.requirements.length - 3} more
                                    requirements
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Submission Tracking Info */}
                            <div>
                              <h4 className="font-medium mb-3">
                                Submission Tracking
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-muted-foreground text-sm">
                                    Days Since Submission:
                                  </span>
                                  <p className="font-medium">
                                    {Math.floor(
                                      (new Date().getTime() -
                                        new Date(
                                          tender.submissionDate
                                        ).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )}{" "}
                                    days
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-sm">
                                    Current Phase:
                                  </span>
                                  <p className="font-medium">
                                    {tender.status === "SUBMITTED"
                                      ? "Under Review"
                                      : tender.status === "ACTIVE"
                                      ? "Approved & Active"
                                      : tender.status === "REJECTED"
                                      ? "Rejected"
                                      : "In Progress"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-sm">
                                    Est. Value:
                                  </span>
                                  <div className="font-semibold">
                                    ₹
                                    {(
                                      tender.requirements?.reduce(
                                        (sum, req) =>
                                          sum + (req.estimatedCost || 0),
                                        0
                                      ) / 100000
                                    ).toFixed(3)}
                                    L
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No submitted tenders found
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tenders will appear here once they are submitted for review
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active-tenders" className="space-y-6">
          {/* Active Tenders Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {tenders.filter((t) => t.status === "ACTIVE").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Tenders</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{(
                      tenders
                        .filter((t) => t.status === "ACTIVE")
                        .reduce((sum, t) =>
                          sum + (t.requirements?.reduce(
                            (reqSum, req) => reqSum + (req.estimatedCost || 0),
                            0
                          ) || 0),
                          0
                        ) / 10000000
                    ).toFixed(2)}Cr
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {tenders
                      .filter((t) => t.status === "ACTIVE")
                      .reduce((sum, t) => sum + (t.requirements?.length || 0), 0)
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Total Requirements</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {[...new Set(
                      tenders
                        .filter((t) => t.status === "ACTIVE")
                        .map((t) => t.client?.name || t.client)
                        .filter(Boolean)
                    )].length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Search Controls - Same as Dashboard */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Select defaultValue="active">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-evaluation">
                    Under Evaluation
                  </SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-categories">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Active
              </Button>
              <Button
                onClick={() => {
                  setEditingTender(null);
                  setShowBidModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Tender
              </Button>
            </div>
          </div>

          {/* Tenders Cards with Expandable Details - Same as Dashboard but filtered for active status */}
          <div className="space-y-4">
            {tenders.length > 0 ? (
              tenders
                .filter((tender) => tender.status === "ACTIVE")
                .map((tender) => (
                  <Card
                    key={tender.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      {/* Main tender header - always visible */}
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8"
                              onClick={() => toggleTenderDetails(tender.id)}
                            >
                              {expandedTenders.has(tender.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div>
                              <div className="font-semibold">
                                {tender.Project?.name ||
                                  tender.projectName ||
                                  "N/A"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {tender.client?.name || tender.client || "N/A"}{" "}
                                • {tender.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold">
                                ₹
                                {(
                                  tender.requirements?.reduce(
                                    (sum, req) =>
                                      sum + (req.estimatedCost || 0),
                                    0
                                  ) / 100000
                                ).toFixed(3)}
                                L
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  tender.submissionDate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  tender.status === "awarded"
                                    ? "default"
                                    : tender.status === "SUBMITTED"
                                    ? "secondary"
                                    : tender.status === "under-evaluation"
                                    ? "outline"
                                    : tender.status === "REJECTED"
                                    ? "destructive"
                                    : tender.status === "ACTIVE"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {tender.status.replace("-", " ").toUpperCase()}
                              </Badge>

                              {/* Approve/Reject buttons for submitted tenders */}
                              {tender.status === "SUBMITTED" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateTenderStatus(
                                        tender.id,
                                        "ACTIVE"
                                      )
                                    }
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateTenderStatus(
                                        tender.id,
                                        "REJECTED"
                                      )
                                    }
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTender(tender);
                                  setShowBidModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTender(tender.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded tender details - only visible when expanded */}
                      {expandedTenders.has(tender.id) && (
                        <div className="border-t bg-gray-50/50 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Basic Details */}
                            <div>
                              <h4 className="font-medium mb-3">
                                Tender Details
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Tender Number:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {tender.tenderNumber || `TN-${tender.id}`}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Category:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {tender.category ||
                                      tender.projectCategory ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Location:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {tender.location}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                  <span className="text-muted-foreground">
                                    Submission Date:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {new Date(
                                      tender.submissionDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Progress and Value */}
                            <div>
                              <h4 className="font-medium mb-3">Requirements</h4>
                              <div className="space-y-3">
                                {/* <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Completion</span>
                                    <span className="font-medium">{tender.completionPercentage || 0}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${tender.completionPercentage || 0}%` }}
                                    ></div>
                                  </div>
                                </div> */}
                                <div>
                                  <div className="space-y-2">
                                    {tender.requirements
                                      ?.slice(0, 3)
                                      .map((req, index) => (
                                        <div key={index} className="text-sm">
                                          <div className="font-medium">
                                            {req.description || req.item}
                                          </div>
                                          <div className="text-muted-foreground">
                                            Qty: {req.quantity} <br /> Unit:{" "}
                                            {req.unit} <br /> Cost: ₹
                                            {(
                                              req.estimatedCost / 100000
                                            ).toFixed(3)}
                                            L
                                          </div>
                                        </div>
                                      )) || (
                                      <div className="text-sm text-muted-foreground">
                                        No requirements available
                                      </div>
                                    )}
                                    {tender.requirements?.length > 3 && (
                                      <div className="text-sm text-muted-foreground">
                                        +{tender.requirements.length - 3} more
                                        requirements
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            {/* <div>
                              <h4 className="font-medium mb-3">Actions</h4>
                              <div className="space-y-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    setEditingTender(tender);
                                    setShowBidModal(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Tender
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() =>
                                    handleViewSubmission({
                                      id: tender.id,
                                      tender: tender.projectName,
                                      client: tender.client,
                                      submissionDate: tender.submissionDate,
                                      status: tender.status,
                                      notes: `Active tender for ${tender.projectName}`,
                                      followUpDate: "",
                                      contactPerson: "Project Manager",
                                      submissionStatus: tender.status,
                                    })
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full justify-start"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download BOQ
                                </Button>
                              </div>
                            </div> */}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No active tenders found
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by creating a new tender or check your filters
                  </p>
                  <Button
                    onClick={() => {
                      setEditingTender(null);
                      setShowBidModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Tender
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {showBidModal && (
        <div className="top-0 ">
          <BidPreparationModal
            onClose={() => {
              setShowBidModal(false);
              setEditingTender(null);
              fetchTenders(); // Refresh tenders list
            }}
            editTender={editingTender}
          />
        </div>
      )}

      {/* Rate Analysis Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Rate Analysis</DialogTitle>
            <DialogDescription>
              Analyze costs and rates for tender items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Item Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civil">Civil Works</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="finishing">Finishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Analysis Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed Analysis</SelectItem>
                    <SelectItem value="summary">Summary Analysis</SelectItem>
                    <SelectItem value="comparative">
                      Comparative Analysis
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="custom">Custom Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Cost Components</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Labor Cost Index</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select index" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Market</SelectItem>
                      <SelectItem value="government">
                        Government Rates
                      </SelectItem>
                      <SelectItem value="custom">Custom Rates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Material Cost Basis</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market Survey</SelectItem>
                      <SelectItem value="quotation">
                        Vendor Quotations
                      </SelectItem>
                      <SelectItem value="historical">
                        Historical Data
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Equipment Rates</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owned">Company Owned</SelectItem>
                      <SelectItem value="rental">Market Rental</SelectItem>
                      <SelectItem value="mixed">Mixed Fleet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Overhead (%)</Label>
                  <Input type="number" placeholder="15" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Profit (%)</Label>
                  <Input type="number" placeholder="10" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Contingency (%)</Label>
                  <Input type="number" placeholder="5" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" placeholder="18" min="0" max="100" />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Analysis Parameters</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price Escalation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Escalation</SelectItem>
                      <SelectItem value="linear">Linear Projection</SelectItem>
                      <SelectItem value="custom">Custom Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Market Volatility</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select factor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (±5%)</SelectItem>
                      <SelectItem value="medium">Medium (±10%)</SelectItem>
                      <SelectItem value="high">High (±15%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Analysis
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAnalysisModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Analysis Started",
                      description: "Rate analysis process has been initiated",
                    });
                    setIsAnalysisModalOpen(false);
                  }}
                >
                  Start Analysis
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Project Schedule Planner</DialogTitle>
            <DialogDescription>
              Create and manage project timelines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Project Duration</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min="1" placeholder="24" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Working Calendar</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (5 days)</SelectItem>
                    <SelectItem value="extended">Extended (6 days)</SelectItem>
                    <SelectItem value="continuous">
                      Continuous (7 days)
                    </SelectItem>
                    <SelectItem value="custom">Custom Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Schedule Components</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Breakdown Structure</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select WBS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard Template
                      </SelectItem>
                      <SelectItem value="detailed">
                        Detailed Template
                      </SelectItem>
                      <SelectItem value="custom">Custom Structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Critical Path Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        Automatic Calculation
                      </SelectItem>
                      <SelectItem value="manual">Manual Definition</SelectItem>
                      <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Milestone Types</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contractual">Contractual</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="payment">Payment Linked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dependencies</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fs">Finish-to-Start</SelectItem>
                      <SelectItem value="ss">Start-to-Start</SelectItem>
                      <SelectItem value="ff">Finish-to-Finish</SelectItem>
                      <SelectItem value="sf">Start-to-Finish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Float Calculation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total Float</SelectItem>
                      <SelectItem value="free">Free Float</SelectItem>
                      <SelectItem value="both">Both Methods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Import/Export Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Import Schedule</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="file"
                      accept=".mpp,.xer,.xml"
                      className="col-span-2"
                    />
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      MS Project
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Primavera P6
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Schedule Templates</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Schedule
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Schedule Created",
                      description:
                        "Project schedule has been created successfully",
                    });
                    setIsScheduleModalOpen(false);
                  }}
                >
                  Create Schedule
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Planning Modal */}
      <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Resource Planning</DialogTitle>
            <DialogDescription>
              Plan and allocate project resources
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manpower">Manpower</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project Phase</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="execution">Execution</SelectItem>
                    <SelectItem value="closeout">Closeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resource Calendar</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (8 hours)</SelectItem>
                    <SelectItem value="extended">
                      Extended (12 hours)
                    </SelectItem>
                    <SelectItem value="shift">Shift Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Resource Requirements</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Skill Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unskilled">Unskilled</SelectItem>
                      <SelectItem value="semiskilled">Semi-skilled</SelectItem>
                      <SelectItem value="skilled">Skilled</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Experience Required</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">0-2 years</SelectItem>
                      <SelectItem value="junior">2-5 years</SelectItem>
                      <SelectItem value="senior">5-10 years</SelectItem>
                      <SelectItem value="expert">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Time</SelectItem>
                      <SelectItem value="part">Part Time</SelectItem>
                      <SelectItem value="oncall">On Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resource Loading</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="frontloaded">Front Loaded</SelectItem>
                      <SelectItem value="backloaded">Back Loaded</SelectItem>
                      <SelectItem value="custom">Custom Pattern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resource Leveling</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Cost & Productivity</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cost Basis</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="daily">Daily Rate</SelectItem>
                      <SelectItem value="monthly">Monthly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Productivity Factor</Label>
                  <Input
                    type="number"
                    placeholder="1.0"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overtime Policy</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (1.5x)</SelectItem>
                      <SelectItem value="double">Double (2x)</SelectItem>
                      <SelectItem value="custom">Custom Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Plan
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsResourceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Resources Planned",
                      description: "Resource allocation plan has been created",
                    });
                    setIsResourceModalOpen(false);
                  }}
                >
                  Create Plan
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Document Templates</DialogTitle>
            <DialogDescription>
              Access and customize tender document templates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Template Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">
                      Technical Specifications
                    </SelectItem>
                    <SelectItem value="commercial">Commercial Terms</SelectItem>
                    <SelectItem value="legal">Legal Documents</SelectItem>
                    <SelectItem value="quality">Quality Documents</SelectItem>
                    <SelectItem value="hse">HSE Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conditions">
                      General Conditions
                    </SelectItem>
                    <SelectItem value="specifications">
                      Specifications
                    </SelectItem>
                    <SelectItem value="forms">Forms</SelectItem>
                    <SelectItem value="schedules">Schedules</SelectItem>
                    <SelectItem value="drawings">Drawing Templates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Industry Standard</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fidic">FIDIC</SelectItem>
                    <SelectItem value="jct">JCT</SelectItem>
                    <SelectItem value="nec">NEC</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Template Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word">Microsoft Word</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Microsoft Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Template Version</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest Version</SelectItem>
                      <SelectItem value="2023">2023 Edition</SelectItem>
                      <SelectItem value="2022">2022 Edition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="uae">UAE</SelectItem>
                      <SelectItem value="uk">UK</SelectItem>
                      <SelectItem value="usa">USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contract Value</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (&lt;₹10Cr)</SelectItem>
                      <SelectItem value="medium">Medium (₹10-50Cr)</SelectItem>
                      <SelectItem value="large">Large (&gt;₹50Cr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Customization Options</h4>
              <div className="grid grid-cols-1 gap-2">
                <Input placeholder="Company Name" />
                <Input placeholder="Project Reference" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Style Guide
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTemplateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Template Generated",
                      description: "Document template has been generated",
                    });
                    setIsTemplateModalOpen(false);
                  }}
                >
                  Generate Document
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Building Modal */}
      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Team Builder</DialogTitle>
            <DialogDescription>
              Create project team structure and organization chart
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (5-15)</SelectItem>
                    <SelectItem value="medium">Medium (16-50)</SelectItem>
                    <SelectItem value="large">Large (50+)</SelectItem>
                    <SelectItem value="enterprise">
                      Enterprise (100+)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">
                      Short Term (&lt;1 year)
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium Term (1-2 years)
                    </SelectItem>
                    <SelectItem value="long">
                      Long Term (&gt;2 years)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Organization Structure</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Structure Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hierarchical">Hierarchical</SelectItem>
                      <SelectItem value="matrix">Matrix</SelectItem>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="projectized">Projectized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Lines</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="matrix">Matrix</SelectItem>
                      <SelectItem value="dotted">Dotted Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Key Positions</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Set</SelectItem>
                      <SelectItem value="extended">Extended Set</SelectItem>
                      <SelectItem value="custom">Custom Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Departments</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="all">All Departments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Support Staff</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="comprehensive">
                        Comprehensive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Team Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Technical Expertise</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Primary skills" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="civil">Civil Engineering</SelectItem>
                        <SelectItem value="mep">MEP</SelectItem>
                        <SelectItem value="structural">Structural</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">
                          Junior (0-5 years)
                        </SelectItem>
                        <SelectItem value="mid">Mid (5-10 years)</SelectItem>
                        <SelectItem value="senior">
                          Senior (10+ years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Certifications Required</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pmp">PMP</SelectItem>
                        <SelectItem value="professional">
                          Professional Engineer
                        </SelectItem>
                        <SelectItem value="safety">
                          Safety Certifications
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mandatory">Mandatory</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Preview Chart
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Structure
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTeamModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Team Structure Created",
                      description: "Project team structure has been generated",
                    });
                    setIsTeamModalOpen(false);
                  }}
                >
                  Create Structure
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission View/Edit Modal */}
      <Dialog
        open={isSubmissionModalOpen}
        onOpenChange={setIsSubmissionModalOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? "View Submission" : "Edit Submission"} -{" "}
              {selectedSubmission?.tender}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? "View submission details and status"
                : "Update submission status and details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Submission Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">{selectedSubmission?.tender}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission?.client}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Submission Date</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">
                    {selectedSubmission?.submissionDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Status and Submission Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="font-medium">{submissionData.status}</p>
                  </div>
                ) : (
                  <Select
                    value={submissionData.status}
                    onValueChange={(value) =>
                      setSubmissionData({ ...submissionData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under Evaluation">
                        Under Evaluation
                      </SelectItem>
                      <SelectItem value="Technical Evaluation">
                        Technical Evaluation
                      </SelectItem>
                      <SelectItem value="Financial Evaluation">
                        Financial Evaluation
                      </SelectItem>
                      <SelectItem value="Awarded">Awarded</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Clarification Required">
                        Clarification Required
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Submission Status</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <Badge
                      variant={
                        submissionData.submissionStatus === "submitted"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {submissionData.submissionStatus}
                    </Badge>
                  </div>
                ) : (
                  <Select
                    value={submissionData.submissionStatus}
                    onValueChange={(value) =>
                      setSubmissionData({
                        ...submissionData,
                        submissionStatus: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select submission status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="not-submitted">
                        Not Submitted
                      </SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resubmitted">Resubmitted</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Contact Person and Follow-up Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="font-medium">
                      {submissionData.contactPerson}
                    </p>
                  </div>
                ) : (
                  <Input
                    value={submissionData.contactPerson}
                    onChange={(e) =>
                      setSubmissionData({
                        ...submissionData,
                        contactPerson: e.target.value,
                      })
                    }
                    placeholder="Enter contact person name"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                {isViewMode ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="font-medium">{submissionData.followUpDate}</p>
                  </div>
                ) : (
                  <Input
                    type="date"
                    value={submissionData.followUpDate}
                    onChange={(e) =>
                      setSubmissionData({
                        ...submissionData,
                        followUpDate: e.target.value,
                      })
                    }
                  />
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              {isViewMode ? (
                <div className="p-2 bg-gray-50 rounded border min-h-20">
                  <p>{submissionData.notes}</p>
                </div>
              ) : (
                <Textarea
                  value={submissionData.notes}
                  onChange={(e) =>
                    setSubmissionData({
                      ...submissionData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Enter notes about the submission..."
                  rows={4}
                />
              )}
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Value</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">{selectedSubmission?.value}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Days Since Submission</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="font-medium">
                    {selectedSubmission?.daysElapsed} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              {isViewMode ? (
                <Button variant="outline" onClick={() => setIsViewMode(false)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Submission
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsViewMode(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Mode
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmissionModalOpen(false)}
              >
                Cancel
              </Button>
              {!isViewMode && (
                <Button onClick={handleSaveSubmission}>Save Changes</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TenderManagement = () => {
  return (
    <PageUserFilterProvider allowedRoles={["client_manager", "tender"]}>
      <TenderManagementContent />
    </PageUserFilterProvider>
  );
};
export default TenderManagement;
