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
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { InteractiveChart } from "@/components/interactive-chart";
import { ExpandableDataTable } from "@/components/expandable-data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  AlertTriangle,
  Calendar,
  Download,
  Target,
  Zap,
  Clock,
  Shield,
  Activity,
  BarChart3,
  AlertCircle,
  Percent,
  Edit,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Risk {
  id: string;
  project: string;
  riskLevel: string;
  probability: number;
  impact: string;
  mitigation: string;
  category: string;
  lastAssessment: string;
  nextReview: string;
  owner: string;
  mitigationActions: string[];
  isFlagged: boolean;
}

interface Department {
  department: string;
  efficiency: number;
  utilization: number;
  issues: number;
  trend: number;
  isFlagged?: boolean;
}

const MDDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  // Replace static arrays with backend data
  const [executiveScorecard, setExecutiveScorecard] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [risks, setRisks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [budget, setBudget] = useState(null);
  const [invoices, setInvoices] = useState([]);

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/executive')) return 'executive';
    if (path.includes('/projects')) return 'projects';
    if (path.includes('/financials')) return 'financials';
    return 'executive'; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      executive: '/md-dashboard/executive',
      projects: '/md-dashboard/projects',
      financials: '/md-dashboard/financials'
    };
    navigate(tabRoutes[value]);
  };

  useEffect(() => {
    const token =
      sessionStorage.getItem("jwt_token") ||
      localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(`${API_URL}/md/scorecard`, { headers })
      .then((res) => setExecutiveScorecard(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/md/revenue`, { headers })
      .then((res) => setRevenueData(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/md/risks`, { headers })
      .then((res) => setRisks(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/md/team-performance`, { headers })
      .then((res) => setDepartments(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/projects`, { headers })
      .then((res) => setProjects(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/clients`, { headers })
      .then((res) => setClients(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/accounts/payments`, { headers })
      .then((res) => setPayments(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/accounts/collections`, { headers })
      .then((res) => setCollections(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/accounts/budget`, { headers })
      .then((res) => setBudget(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/billing/invoices`, { headers })
      .then((res) => setInvoices(res.data))
      .catch(() => {});
  }, []);

  const handleExportSnapshot = () => {
    // Generate comprehensive dashboard report
    const timestamp = new Date().toISOString().split("T")[0];
    const reportData = {
      reportTitle: "MD Dashboard Executive Snapshot",
      generatedOn: new Date().toLocaleString(),
      timeRange: selectedTimeRange,

      executiveScorecard: executiveScorecard.map((item) => ({
        metric: item.metric,
        current: `${item.current}%`,
        target: `${item.target}%`,
        status: item.status,
        performance:
          item.current >= item.target ? "Above Target" : "Below Target",
      })),

      keyMetrics: {
        activeProjects: 24,
        totalRevenue: "₹50M",
        monthlyGrowth: "15.2%",
        teamUtilization: "87%",
      },

      financialSummary: revenueData.map((item) => ({
        month: item.month,
        revenue: `₹${(item.revenue / 1000000).toFixed(1)}M`,
        expense: `₹${(item.expense / 1000000).toFixed(1)}M`,
        profit: `₹${((item.revenue - item.expense) / 1000000).toFixed(1)}M`,
        profitMargin: `${(
          ((item.revenue - item.expense) / item.revenue) *
          100
        ).toFixed(1)}%`,
      })),

      teamPerformance: departments.map((dept) => ({
        department: dept.department,
        efficiency: `${dept.efficiency}%`,
        utilization: `${dept.utilization}%`,
        openIssues: dept.issues,
        trend: dept.trend > 0 ? `+${dept.trend}%` : `${dept.trend}%`,
      })),

      riskSummary: {
        highRiskProjects: risks.filter((r) => r.riskLevel === "High").length,
        mediumRiskProjects: risks.filter((r) => r.riskLevel === "Medium")
          .length,
        lowRiskProjects: risks.filter((r) => r.riskLevel === "Low").length,
        avgRiskScore: "3.2/10",
        mitigationRate: "76%",
      },

      criticalAlerts: [
        "2 projects exceeding budget variance threshold",
        "3 departments below optimal utilization",
        "4 high-risk projects requiring immediate attention",
        "Cost control measures needed for Q2 targets",
      ],

      recommendations: [
        "Implement enhanced cost control measures for budget variance projects",
        "Increase resource allocation for underutilized departments",
        "Escalate risk mitigation plans for high-risk projects",
        "Review and adjust Q2 financial targets based on current performance",
      ],
    };

    // Convert to formatted text report
    const reportContent = `
MANAGING DIRECTOR DASHBOARD - EXECUTIVE SNAPSHOT
Generated: ${reportData.generatedOn}
Time Range: ${reportData.timeRange}

==========================================
EXECUTIVE SCORECARD
==========================================
${reportData.executiveScorecard
  .map(
    (item) =>
      `${item.metric}: ${item.current} (Target: ${
        item.target
      }) - ${item.status.toUpperCase()}`
  )
  .join("\n")}

==========================================
KEY PERFORMANCE METRICS
==========================================
Active Projects: ${reportData.keyMetrics.activeProjects}
Total Revenue (FY): ${reportData.keyMetrics.totalRevenue}
Monthly Growth: ${reportData.keyMetrics.monthlyGrowth}
Team Utilization: ${reportData.keyMetrics.teamUtilization}

==========================================
FINANCIAL SUMMARY (6-MONTH)
==========================================
${reportData.financialSummary
  .map(
    (item) =>
      `${item.month}: Revenue ${item.revenue} | Expense ${item.expense} | Profit ${item.profit} (${item.profitMargin} margin)`
  )
  .join("\n")}

==========================================
TEAM PERFORMANCE BY DEPARTMENT
==========================================
${reportData.teamPerformance
  .map(
    (dept) =>
      `${dept.department}: ${dept.efficiency} efficiency | ${dept.utilization} utilization | ${dept.openIssues} issues | Trend: ${dept.trend}`
  )
  .join("\n")}

==========================================
RISK ASSESSMENT SUMMARY
==========================================
High Risk Projects: ${reportData.riskSummary.highRiskProjects}
Medium Risk Projects: ${reportData.riskSummary.mediumRiskProjects}
Low Risk Projects: ${reportData.riskSummary.lowRiskProjects}
Average Risk Score: ${reportData.riskSummary.avgRiskScore}
Risk Mitigation Rate: ${reportData.riskSummary.mitigationRate}

==========================================
CRITICAL ALERTS
==========================================
${reportData.criticalAlerts
  .map((alert, index) => `${index + 1}. ${alert}`)
  .join("\n")}

==========================================
STRATEGIC RECOMMENDATIONS
==========================================
${reportData.recommendations
  .map((rec, index) => `${index + 1}. ${rec}`)
  .join("\n")}

==========================================
DETAILED PROJECT RISK MATRIX
==========================================
${risks
  .map(
    (risk) =>
      `${risk.project}: ${risk.riskLevel} Risk (${risk.probability}% probability) - ${risk.impact} impact
   Category: ${risk.category} | Owner: ${risk.owner}
   Mitigation: ${risk.mitigation}
   Next Review: ${risk.nextReview}`
  )
  .join("\n\n")}

Report End - Generated by MD Dashboard System
    `.trim();

    // Create and download the file
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MD_Dashboard_Snapshot_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Executive dashboard snapshot downloaded successfully!");
  };

  const handleDrillDown = (data: any) => {
    toast.info(`Drilling down into ${data.month || data.name} data...`);
  };

  const enhancedProjectColumns = [
    {
      key: "name",
      label: "Project Name",
      type: "text" as const,
      render: (value: string, row: any) => (
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm sm:text-base truncate">{value || "Untitled Project"}</p>
          <p className="text-xs text-muted-foreground truncate sm:hidden">{row.clientName || "N/A"}</p>
          <p className="text-xs text-muted-foreground truncate sm:hidden">{row.location || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "clientName",
      label: "Client",
      type: "text" as const,
      className: "hidden sm:table-cell",
      render: (value: string) => value || "N/A",
    },
    {
      key: "location",
      label: "Location",
      type: "text" as const,
      className: "hidden md:table-cell",
      render: (value: string) => value || "N/A",
    },
    {
      key: "projectType",
      label: "Type",
      type: "text" as const,
      className: "hidden lg:table-cell",
      render: (value: string) => value || "N/A",
    },
    {
      key: "budget",
      label: "Budget",
      className: "hidden sm:table-cell",
      render: (value: number) => {
        if (typeof value !== "number" || isNaN(value)) return "N/A";
        return `₹${(value / 1000000).toFixed(1)}M`;
      },
    },
    {
      key: "totalSpend",
      label: "Spent",
      className: "hidden md:table-cell",
      render: (value: number) => {
        if (typeof value !== "number" || isNaN(value)) return "N/A";
        return `₹${(value / 1000000).toFixed(1)}M`;
      },
    },
    {
      key: "milestones",
      label: "Progress",
      render: (row: any) => {
        try {
          const milestones = Array.isArray(row.milestones)
            ? row.milestones
            : [];
          const total = milestones.length;
          const completed = milestones.filter(
            (m: any) => m && m.endDate
          ).length;
          return (
            <div className="text-center">
              <div className="text-sm font-medium">{completed}/{total}</div>
              <div className="text-xs text-muted-foreground">milestones</div>
            </div>
          );
        } catch (e) {
          return "0/0";
        }
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions" as const,
      render: (value: any, row: any) => (
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2"
          >
            <Edit className="h-3 w-3" />
            <span className="hidden sm:inline sm:ml-1">Edit</span>
          </Button>
        </div>
      ),
    },
  ];

  const projectExpandableContent = (row: any) => {
    // Ensure we have a valid row object
    if (!row) return null;

    // Safe accessors for nested objects
    const getNestedValue = (
      obj: any,
      path: string,
      defaultValue: any = "N/A"
    ) => {
      try {
        return (
          path.split(".").reduce((acc, part) => acc?.[part], obj) ??
          defaultValue
        );
      } catch (e) {
        return defaultValue;
      }
    };

    // Safe number formatter
    const formatCurrency = (value: number | undefined | null) => {
      if (typeof value !== "number" || isNaN(value)) return "N/A";
      return `₹${(value / 1000000).toFixed(1)}M`;
    };

    const safeMilestones = Array.isArray(row.milestones) ? row.milestones : [];
    const safeTasks = Array.isArray(row.tasks) ? row.tasks : [];
    const safeMembers = Array.isArray(row.members) ? row.members : [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div>
          <h4 className="font-medium mb-3 text-sm sm:text-base">Financial Details</h4>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span>Budget Utilization:</span>
              <span className="font-medium">
                {typeof row.budget === "number" &&
                typeof row.totalSpend === "number"
                  ? `${((row.totalSpend / row.budget) * 100).toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contingency:</span>
              <span className="font-medium">
                {formatCurrency(row.contingency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Non-Billables:</span>
              <span className="font-medium">
                {Array.isArray(row.nonBillables)
                  ? `${row.nonBillables.length} items`
                  : "0 items"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cost Center:</span>
              <span className="font-medium">
                {row.defaultCostCenter || "Not assigned"}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-sm sm:text-base">Project Milestones</h4>
          <div className="space-y-2 text-xs sm:text-sm">
            {safeMilestones.length > 0 ? (
              safeMilestones
                .slice(0, 3)
                .map((milestone: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        milestone?.endDate ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <span className="flex-1 min-w-0 truncate">{milestone?.name || "Unnamed Milestone"}</span>
                    <span className="text-muted-foreground text-xs">
                      {milestone?.endDate
                        ? new Date(milestone.endDate).toLocaleDateString()
                        : "In Progress"}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-muted-foreground">No milestones defined</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleRiskAction = (action: string, risk: Risk, updatedData?: any) => {
    switch (action) {
      case "edit":
        const updatedRisks = risks.map((r) =>
          r.id === risk.id ? { ...r, ...updatedData } : r
        );
        setRisks(updatedRisks);
        toast.success("Risk updated successfully");
        break;

      case "flag":
        const flaggedRisks = risks.map((r) =>
          r.id === risk.id ? { ...r, isFlagged: !r.isFlagged } : r
        );
        setRisks(flaggedRisks);
        toast.success(
          `Risk ${risk.isFlagged ? "unflagged" : "flagged"} successfully`
        );
        break;
    }
  };

  const handleDepartmentAction = (
    action: string,
    department: Department,
    updatedData?: any
  ) => {
    switch (action) {
      case "edit":
        const updatedDepartments = departments.map((d) =>
          d.department === department.department ? { ...d, ...updatedData } : d
        );
        setDepartments(updatedDepartments);
        toast.success("Department updated successfully");
        break;

      case "flag":
        const flaggedDepartments = departments.map((d) =>
          d.department === department.department
            ? { ...d, isFlagged: !d.isFlagged }
            : d
        );
        setDepartments(flaggedDepartments);
        toast.success(
          `Department ${
            department.isFlagged ? "unflagged" : "flagged"
          } successfully`
        );
        break;
    }
  };

  const handleProjectAction = (
    action: string,
    project: any,
    updatedData?: any
  ) => {
    switch (action) {
      case "edit":
        const updatedProjects = projects.map((p) =>
          p.name === project.name ? { ...p, ...updatedData } : p
        );
        setProjects(updatedProjects);
        toast.success("Project updated successfully");
        break;

      case "flag":
        const flaggedProjects = projects.map((p) =>
          p.name === project.name ? { ...p, isFlagged: !p.isFlagged } : p
        );
        setProjects(flaggedProjects);
        toast.success(
          `Project ${project.isFlagged ? "unflagged" : "flagged"} successfully`
        );
        break;
    }
  };

  // Get section title and icon based on current tab
  const getSectionInfo = () => {
    const tab = getCurrentTab();
    switch (tab) {
      case 'executive':
        return { title: 'Executive Overview', icon: BarChart3 };
      case 'projects':
        return { title: 'Project Performance', icon: Building2 };
      case 'financials':
        return { title: 'Financial Insights', icon: DollarSign };
      default:
        return { title: 'Executive Overview', icon: BarChart3 };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Managing Director Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Strategic overview and executive insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportSnapshot} className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Snapshot</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
        {/* Hide tabs on mobile - navigation is handled by sidebar */}
        <TabsList className="hidden md:grid w-full grid-cols-3">
          <TabsTrigger value="executive">Executive Overview</TabsTrigger>
          <TabsTrigger value="projects">Project Performance</TabsTrigger>
          <TabsTrigger value="financials">Financial Insights</TabsTrigger>
        </TabsList>

        {/* Mobile-specific section header */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              {(() => {
                const { title, icon: Icon } = getSectionInfo();
                return (
                  <>
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-lg font-semibold">{title}</h2>
                      <p className="text-xs text-muted-foreground">
                        MD Dashboard › {title}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <TabsContent value="executive" className="mt-0 space-y-4 sm:space-y-6">
          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <EnhancedStatCard
              title="Total Projects"
              value={projects.length.toString()}
              icon={Building2}
              description="All projects in system"
              trend={{
                value: projects.length,
                label: "total projects",
                data: projects.map((p, i) => ({ value: i + 1 })),
              }}
              threshold={{
                status:
                  projects.length > 10
                    ? "good"
                    : projects.length > 5
                    ? "warning"
                    : "critical",
                message:
                  projects.length > 10
                    ? "Project count within optimal range"
                    : "Low project count",
              }}
              onClick={() => toast.info("Viewing all projects")}
            />
            <EnhancedStatCard
              title="Total Expenses"
              value={`₹${projects
                .reduce((sum, p) => sum + (p.totalSpend || 0), 0)
                .toLocaleString()}`}
              icon={DollarSign}
              description="Combined project expenses"
              trend={{
                value: projects.length,
                label: "projects with expenses",
                data: projects.map((p) => ({ value: p.totalSpend || 0 })),
              }}
              threshold={{
                status: projects.length > 0 ? "good" : "warning",
                message:
                  projects.length > 0
                    ? "Expense data available"
                    : "No expense data",
              }}
              onClick={() => toast.info("Opening expense breakdown")}
            />

            <EnhancedStatCard
              title="Total Clients"
              value={clients.length.toString()}
              icon={Users}
              description="Client portfolio"
              trend={{
                value: clients.length,
                label: "total clients",
                data: clients.map((c, i) => ({ value: i + 1 })),
              }}
              threshold={{
                status:
                  clients.length > 5
                    ? "good"
                    : clients.length > 2
                    ? "warning"
                    : "critical",
                message:
                  clients.length > 5
                    ? "Healthy client base"
                    : "Need more clients",
              }}
              onClick={() => toast.info("Viewing client details")}
            />
          </div>

          {/* Portfolio Analysis */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Project Portfolio Distribution</CardTitle>
                <CardDescription className="text-sm">
                  By project type and budget allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InteractiveChart
                  title="Budget Distribution"
                  description="Budget allocation by project type"
                  data={Object.entries(
                    projects.reduce((acc, project) => {
                      const type = project.projectType || "Unspecified";
                      acc[type] = (acc[type] || 0) + (project.budget || 0);
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, budget]) => ({
                    name: type,
                    value: budget,
                  }))}
                  type="pie"
                  dataKey="value"
                  onDrillDown={handleDrillDown}
                />
              </CardContent>
            </Card>
          </div>

          {/* Project Health Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Project Health Overview</CardTitle>
              <CardDescription className="text-sm">
                Comprehensive project status analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Budget Health */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Budget Variance</h4>
                  <Progress
                    value={
                      (projects.filter(
                        (p) => (p.totalSpend || 0) <= (p.budget || 0)
                      ).length /
                        Math.max(projects.length, 1)) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {
                      projects.filter(
                        (p) => (p.totalSpend || 0) <= (p.budget || 0)
                      ).length
                    }{" "}
                    projects within budget
                  </p>
                </div>

                {/* Milestone Progress */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Milestone Completion</h4>
                  <Progress
                    value={
                      (projects.reduce(
                        (sum, p) =>
                          sum +
                          (p.milestones?.filter((m) => m.endDate)?.length || 0),
                        0
                      ) /
                        Math.max(
                          projects.reduce(
                            (sum, p) => sum + (p.milestones?.length || 0),
                            0
                          ),
                          1
                        )) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {projects.reduce(
                      (sum, p) =>
                        sum +
                        (p.milestones?.filter((m) => m.endDate)?.length || 0),
                      0
                    )}{" "}
                    milestones completed
                  </p>
                </div>

                {/* Client Distribution */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Client Engagement</h4>
                  <Progress
                    value={
                      (new Set(projects.map((p) => p.clientId)).size /
                        Math.max(clients.length, 1)) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {new Set(projects.map((p) => p.clientId)).size} active
                    clients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-0 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <EnhancedStatCard
              title="Project Budget"
              value={`₹${projects
                .reduce((sum, p) => sum + (p.budget || 0), 0)
                .toLocaleString()}`}
              icon={DollarSign}
              description="Total project budgets"
              trend={{
                value: projects.filter((p) => p.budget).length,
                label: "budgeted projects",
                data: projects.map((p) => ({ value: p.budget || 0 })),
              }}
              threshold={{
                status:
                  projects.filter((p) => p.budget).length > 0
                    ? "good"
                    : "warning",
                message:
                  projects.filter((p) => p.budget).length > 0
                    ? "Budget data available"
                    : "No budget data",
              }}
            />
            <EnhancedStatCard
              title="Budget Usage"
              value={`${(
                (projects.reduce((sum, p) => sum + (p.totalSpend || 0), 0) /
                  projects.reduce((sum, p) => sum + (p.budget || 0), 0)) *
                100
              ).toFixed(1)}%`}
              icon={Target}
              description="Budget utilization"
              trend={{
                value: projects.filter((p) => p.totalSpend && p.budget).length,
                label: "tracked",
                data: projects.map((p) => ({
                  value: ((p.totalSpend || 0) / (p.budget || 1)) * 100,
                })),
              }}
              threshold={{
                status:
                  (projects.reduce((sum, p) => sum + (p.totalSpend || 0), 0) /
                    projects.reduce((sum, p) => sum + (p.budget || 0), 0)) *
                    100 <=
                  100
                    ? "good"
                    : "warning",
                message: "Budget utilization status",
              }}
            />

            <EnhancedStatCard
              title="Average Contingency"
              value={`${(
                projects.reduce((sum, p) => sum + (p.contingency || 0), 0) /
                (projects.filter((p) => p.contingency).length || 1)
              ).toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
              `}
              icon={Shield}
              description="Per project contingency"
              trend={{
                value: projects.filter((p) => p.contingency).length,
                label: "projects with contingency",
                data: projects.map((p) => ({
                  value: p.contingency || 0,
                })),
              }}
              threshold={{
                status:
                  projects.filter((p) => p.contingency).length >
                  projects.length * 0.5
                    ? "good"
                    : "warning",
                message: "Contingency allocation coverage",
              }}
            />
          </div>

          {projects.length > 0 ? (
            <>
              <ExpandableDataTable
                title="Project Performance Matrix"
                description="Comprehensive project tracking with expandable details"
                data={(projects || [])
                  .map((p) => {
                    // Ensure we have a valid project object
                    if (!p) return null;

                    const client = p.client || {};
                    const clientName =
                      typeof client === "object"
                        ? client.name || client.email || client.id || "N/A"
                        : String(client || "N/A");

                    // Transform the project data with safe accessors
                    return {
                      ...p,
                      clientName,
                      location: p.location || "N/A",
                      projectType: p.projectType || "N/A",
                      budget: typeof p.budget === "number" ? p.budget : 0,
                      totalSpend:
                        typeof p.totalSpend === "number" ? p.totalSpend : 0,
                      startDate: p.startDate || null,
                      endDate: p.endDate || null,
                      milestones: Array.isArray(p.milestones)
                        ? p.milestones
                        : [],
                      tasks: Array.isArray(p.tasks) ? p.tasks : [],
                      members: Array.isArray(p.members) ? p.members : [],
                    };
                  })
                  .filter(Boolean)}
                columns={enhancedProjectColumns}
                expandableContent={projectExpandableContent}
                searchKey="name"
                filters={[
                  {
                    key: "projectType",
                    label: "Project Type",
                    options: [
                      "Commercial",
                      "Residential",
                      "Industrial",
                      "Infrastructure",
                    ].filter(Boolean),
                  },
                  {
                    key: "location",
                    label: "Location",
                    options: Array.from(
                      new Set(
                        (projects || []).map((p) => p?.location).filter(Boolean)
                      )
                    ),
                  },
                ]}
                onRowAction={handleProjectAction}
              />

              {/* Cost and Resource Analysis */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Budget vs Actual Spend</CardTitle>
                  <CardDescription className="text-sm">Project cost analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractiveChart
                    title="Cost Comparison"
                    description="Budget allocation and utilization"
                    data={projects.map((p) => ({
                      name: p.name,
                      budget: p.budget || 0,
                      spent: p.totalSpend || 0,
                      variance: p.budget
                        ? ((p.totalSpend || 0) / p.budget) * 100 - 100
                        : 0,
                    }))}
                    type="bar"
                    dataKey="budget"
                    secondaryDataKey="spent"
                    xAxisKey="name"
                    onDrillDown={handleDrillDown}
                    showComparison={true}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8 sm:py-12">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg sm:text-xl font-medium mb-2">No project data available</h3>
              <p className="text-sm">Project data will appear here once available.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="financials" className="mt-0 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <EnhancedStatCard
              title="Revenue"
              value={`₹${payments
                .reduce((sum, p) => sum + (p.amount || 0), 0)
                .toLocaleString()}`}
              icon={TrendingUp}
              description="Total revenue generated"
              trend={{
                value: payments.length,
                label: "transactions",
                data: payments.map((p) => ({ value: p.amount || 0 })),
              }}
              threshold={{
                status: payments.length > 0 ? "good" : "warning",
                message:
                  payments.length > 0 ? "Healthy revenue flow" : "Low revenue",
              }}
            />
            <EnhancedStatCard
              title="Receivables"
              value={`₹${(
                invoices.reduce((sum, inv) => sum + (inv.total || 0), 0) -
                payments.reduce((sum, p) => sum + (p.amount || 0), 0)
              ).toLocaleString()}`}
              icon={AlertCircle}
              description="Outstanding payments"
              trend={{
                value: invoices.filter((inv) => !inv.isPaid).length,
                label: "pending invoices",
                data: invoices
                  .filter((inv) => !inv.isPaid)
                  .map((inv) => ({ value: inv.total || 0 })),
              }}
              threshold={{
                status:
                  invoices.filter((inv) => !inv.isPaid).length === 0
                    ? "good"
                    : "warning",
                message: "Payment collection status",
              }}
            />
            <EnhancedStatCard
              title="Profit Margin"
              value={`${(
                ((payments.reduce((sum, p) => sum + (p.amount || 0), 0) -
                  projects.reduce((sum, p) => sum + (p.totalSpend || 0), 0)) /
                  Math.max(
                    payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                    1
                  )) *
                100
              ).toFixed(1)}%`}
              icon={Percent}
              description="Overall profit margin"
              trend={{
                value: projects.filter((p) => p.totalSpend && p.budget).length,
                label: "profitable projects",
                data: projects.map((p) => ({
                  value:
                    (((p.totalRevenue || 0) - (p.totalSpend || 0)) /
                      Math.max(p.totalRevenue || 1, 1)) *
                    100,
                })),
              }}
              threshold={{
                status:
                  ((payments.reduce((sum, p) => sum + (p.amount || 0), 0) -
                    projects.reduce((sum, p) => sum + (p.totalSpend || 0), 0)) /
                    Math.max(
                      payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                      1
                    )) *
                    100 >
                  20
                    ? "good"
                    : "warning",
                message: "Profit margin health",
              }}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Financial Health Matrix</CardTitle>
              <CardDescription className="text-sm">Key financial indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm sm:text-base">Collection Efficiency</h4>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {(
                        (payments.reduce(
                          (sum, p) => sum + (p.amount || 0),
                          0
                        ) /
                          Math.max(
                            invoices.reduce(
                              (sum, inv) => sum + (inv.total || 0),
                              0
                            ),
                            1
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (payments.reduce((sum, p) => sum + (p.amount || 0), 0) /
                        Math.max(
                          invoices.reduce(
                            (sum, inv) => sum + (inv.total || 0),
                            0
                          ),
                          1
                        )) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm sm:text-base">Budget Adherence</h4>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {
                        projects.filter(
                          (p) => (p.totalSpend || 0) <= (p.budget || 0)
                        ).length
                      }{" "}
                      of {projects.length} projects
                    </span>
                  </div>
                  <Progress
                    value={
                      (projects.filter(
                        (p) => (p.totalSpend || 0) <= (p.budget || 0)
                      ).length /
                        Math.max(projects.length, 1)) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm sm:text-base">Revenue Growth</h4>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {(
                        (payments
                          .filter((p) => {
                            const date = new Date(p.date);
                            return date.getMonth() === new Date().getMonth();
                          })
                          .reduce((sum, p) => sum + (p.amount || 0), 0) /
                          Math.max(
                            payments
                              .filter((p) => {
                                const date = new Date(p.date);
                                return (
                                  date.getMonth() ===
                                  new Date().getMonth() - 1
                                );
                              })
                              .reduce((sum, p) => sum + (p.amount || 0), 1),
                            1
                          ) -
                          1) *
                        100
                      ).toFixed(1)}
                      % MoM
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      ((payments
                        .filter((p) => {
                          const date = new Date(p.date);
                          return date.getMonth() === new Date().getMonth();
                        })
                        .reduce((sum, p) => sum + (p.amount || 0), 0) /
                        Math.max(
                          payments
                            .filter((p) => {
                              const date = new Date(p.date);
                              return (
                                date.getMonth() === new Date().getMonth() - 1
                              );
                            })
                            .reduce((sum, p) => sum + (p.amount || 0), 1),
                          1
                        ) -
                        1) *
                        100,
                      100)
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MDDashboard;