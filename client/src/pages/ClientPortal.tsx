import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Building2, FileText, DollarSign, Wrench, Download, CreditCard, CheckCircle, Clock, X, MessageSquare } from "lucide-react"
import axios from "axios";
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const milestoneData = [
  { milestone: 'Foundation', planned: '2024-01-15', actual: '2024-01-15', status: 'Completed' },
  { milestone: 'Structure', planned: '2024-02-15', actual: '2024-02-10', status: 'Completed' },
  { milestone: 'Roofing', planned: '2024-02-28', actual: null, status: 'In Progress' },
  { milestone: 'Finishing', planned: '2024-03-20', actual: null, status: 'Pending' },
]

const progressData = [
  { month: 'Jan', progress: 25 },
  { month: 'Feb', progress: 45 },
  { month: 'Mar', progress: 65 },
  { month: 'Apr', progress: 78 },
  { month: 'May', progress: 85 },
  { month: 'Jun', progress: 92 },
]

const ClientPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false)
  const [isServiceDetailsModalOpen, setIsServiceDetailsModalOpen] = useState(false)
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<any>(null)
  const [milestones, setMilestones] = useState([]);
  const [progress, setProgress] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/designs')) return 'designs';
    if (path.includes('/financials')) return 'financials';
    if (path.includes('/progress')) return 'progress';
    if (path.includes('/documents')) return 'documents';
    return 'designs'; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      designs: '/client-portal/designs',
      financials: '/client-portal/financials',
      progress: '/client-portal/progress',
      documents: '/client-portal/documents'
    };
    navigate(tabRoutes[value]);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/client/milestones`, { headers })
      .then(res => setMilestones(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/client/progress`, { headers })
      .then(res => setProgress(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/designs`, { headers })
      .then(res => setDesigns(res.data))
      .catch(() => {});
    axios.get(`${API_URL}/billing/invoices`, { headers })
      .then(res => setInvoices(res.data))
      .catch(() => {});
  }, []);

  const handleApproveDesign = (design: any) => {
    toast.success(`Design "${design.name}" approved successfully!`)
    setIsDesignModalOpen(false)
    setSelectedDesign(null)
  }

  const handleRequestChanges = (design: any) => {
    toast.info(`Change request submitted for "${design.name}"`)
    setIsDesignModalOpen(false)
    setSelectedDesign(null)
  }

  const handlePayOnline = (invoice: any) => {
    toast.success(`Payment initiated for invoice ${invoice.id}`)
    setIsPaymentModalOpen(false)
    setSelectedInvoice(null)
  }

  const handleServiceRequest = () => {
    toast.success("Service request submitted successfully!")
    setIsServiceRequestModalOpen(false)
  }

  const openDesignViewer = (design: any) => {
    setSelectedDesign(design)
    setIsDesignModalOpen(true)
  }

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsPaymentModalOpen(true)
  }

  // Add dummy project photos data
  const projectPhotos = [
    { id: 1, title: 'Foundation Work', date: '2024-01-15', category: 'Structure' },
    { id: 2, title: 'Steel Framework', date: '2024-01-20', category: 'Structure' },
    { id: 3, title: 'Electrical Layout', date: '2024-01-25', category: 'Electrical' },
    { id: 4, title: 'Plumbing Setup', date: '2024-01-30', category: 'Plumbing' },
    { id: 5, title: 'Wall Construction', date: '2024-02-05', category: 'Structure' },
    { id: 6, title: 'Flooring Work', date: '2024-02-10', category: 'Interior' },
    { id: 7, title: 'Window Installation', date: '2024-02-15', category: 'Exterior' },
    { id: 8, title: 'Paint Work', date: '2024-02-20', category: 'Interior' },
  ]

  // Add dummy service updates data
  const serviceUpdates = [
    { id: 1, status: 'Submitted', message: 'Service request received and logged in the system.', timestamp: '2024-01-18 09:30', user: 'System' },
    { id: 2, status: 'Assigned', message: 'Request assigned to maintenance team.', timestamp: '2024-01-18 10:15', user: 'Admin' },
    { id: 3, status: 'In Progress', message: 'Technician en route to assess the issue.', timestamp: '2024-01-18 14:00', user: 'John (Technician)' },
    { id: 4, status: 'Update', message: 'Initial assessment completed. Parts required for repair.', timestamp: '2024-01-18 15:30', user: 'John (Technician)' },
  ]

  const handleViewServiceDetails = (request: any) => {
    setSelectedServiceRequest(request)
    setIsServiceDetailsModalOpen(true)
  }

  const handleDownloadReports = () => {
    // Download milestoneData as CSV
    const csvRows = [
      ['Milestone', 'Planned', 'Actual', 'Status'],
      ...milestoneData.map(m => [m.milestone, m.planned, m.actual || '', m.status])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-milestones-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadInvoice = (invoice) => {
    // Simulate invoice download as a text file
    const content = `INVOICE\n=======\n\nInvoice ID: ${invoice.id}\nClient: ${invoice.clientName || ''}\nAmount: ₹${invoice.amount}\nDue Date: ${invoice.dueDate}\nStatus: ${invoice.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-muted-foreground">Project information and client services</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsServiceRequestModalOpen(true)} className="gap-2">
            <Wrench className="h-4 w-4" />
            New Service Request
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadReports}>
            <Download className="h-4 w-4" />
            Download Reports
          </Button>
        </div>
      </div>

      <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="designs">Design Review</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
          <TabsTrigger value="service">Service Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="designs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Drawings"
              value="24"
              icon={FileText}
              description="Submitted drawings"
              onClick={() => toast.info("Viewing all drawings")}
            />
            <StatCard
              title="Pending Review"
              value="3"
              icon={Clock}
              description="Awaiting your approval"
              onClick={() => toast.info("Viewing pending drawings")}
            />
            <StatCard
              title="Approved"
              value="18"
              icon={CheckCircle}
              description="Drawing approvals"
              trend={{ value: 12, label: "this month" }}
              onClick={() => toast.info("Viewing approved drawings")}
            />
            <StatCard
              title="Revisions"
              value="3"
              icon={FileText}
              description="Pending changes"
              onClick={() => toast.info("Viewing revision requests")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Drawing Gallery</CardTitle>
              <CardDescription>Review and approve submitted drawings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <div key={design.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{design.name}</h3>
                        <Badge variant={
                          design.status === "Approved" ? "default" : 
                          design.status === "Under Review" ? "secondary" : 
                          "destructive"
                        }>
                          {design.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Designer: {design.designer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {design.uploadDate}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openDesignViewer(design)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info(`Downloading ${design.name}`)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Project Value"
              value="₹25M"
              icon={DollarSign}
              description="Contract amount"
              onClick={() => toast.info("Viewing project financials")}
            />
            <StatCard
              title="Amount Paid"
              value="₹18M"
              icon={CheckCircle}
              description="Payments made"
              trend={{ value: 72, label: "completion" }}
              onClick={() => toast.info("Viewing payment history")}
            />
            <StatCard
              title="Outstanding"
              value="₹7M"
              icon={Clock}
              description="Pending payments"
              onClick={() => toast.info("Viewing outstanding invoices")}
            />
            <StatCard
              title="Next Payment"
              value="₹2.5M"
              icon={DollarSign}
              description="Due in 15 days"
              onClick={() => toast.info("Viewing upcoming payments")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>View and manage project invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{invoice.id}</h3>
                        <Badge variant={
                          invoice.status === 'Paid' ? 'default' :
                          invoice.status === 'Overdue' ? 'destructive' :
                          'secondary'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due Date: {invoice.dueDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Amount: ₹{(invoice.amount / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      {invoice.status !== 'Paid' && (
                        <Button 
                          size="sm"
                          onClick={() => openPaymentModal(invoice)}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '2024-01-15', amount: '₹5M', method: 'Bank Transfer', reference: 'TXN001234', status: 'Completed' },
                  { date: '2024-12-20', amount: '₹3M', method: 'Online Payment', reference: 'TXN001123', status: 'Completed' },
                  { date: '2024-11-25', amount: '₹4M', method: 'Cheque', reference: 'CHQ789123', status: 'Completed' },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{payment.amount}</h3>
                      <p className="text-sm text-muted-foreground">
                        {payment.method} • {payment.reference}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">{payment.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{payment.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Overall Progress"
              value="85%"
              icon={Building2}
              description="Project completion"
              trend={{ value: 12, label: "this month" }}
              onClick={() => toast.info("Viewing detailed progress")}
            />
            <StatCard
              title="Milestones Completed"
              value="6/8"
              icon={CheckCircle}
              description="Key milestones"
              onClick={() => toast.info("Viewing milestone details")}
            />
            <StatCard
              title="Expected Completion"
              value="45 days"
              icon={Clock}
              description="Time remaining"
              onClick={() => toast.info("Viewing timeline details")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Timeline</CardTitle>
                <CardDescription>Monthly project advancement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                    <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Photos</CardTitle>
                <CardDescription>Latest project images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {projectPhotos.slice(0, 4).map((photo) => (
                    <div 
                      key={photo.id} 
                      className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 p-4"
                      onClick={() => setIsPhotoGalleryOpen(true)}
                    >
                      <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-center text-muted-foreground">{photo.title}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setIsPhotoGalleryOpen(true)}
                >
                  View All Photos
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Milestone Tracker</CardTitle>
              <CardDescription>Key project milestones and completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.milestone} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        milestone.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {milestone.status === 'Completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{milestone.milestone}</h3>
                        <p className="text-sm text-muted-foreground">
                          Planned: {milestone.planned}
                          {milestone.actual && ` • Completed: ${milestone.actual}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      milestone.status === 'Completed' ? 'default' :
                      milestone.status === 'In Progress' ? 'secondary' :
                      'outline'
                    }>
                      {milestone.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Active Requests"
              value="3"
              icon={Wrench}
              description="Open service requests"
              onClick={() => toast.info("Viewing active requests")}
            />
            <StatCard
              title="Avg Response Time"
              value="4.2 hours"
              icon={Clock}
              description="Service response time"
              onClick={() => toast.info("Viewing response metrics")}
            />
            <StatCard
              title="Resolved This Month"
              value="12"
              icon={CheckCircle}
              description="Completed requests"
              trend={{ value: 8, label: "vs last month" }}
              onClick={() => toast.info("Viewing resolution history")}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>Submit and track service requests</CardDescription>
              </div>
              <Button onClick={() => setIsServiceRequestModalOpen(true)} className="gap-2">
                <Wrench className="h-4 w-4" />
                New Request
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'SR001', type: 'Electrical', description: 'Main switch board issue', priority: 'High', status: 'In Progress', date: '2024-01-18', eta: '2024-01-22' },
                  { id: 'SR002', type: 'Plumbing', description: 'Kitchen sink leakage', priority: 'Medium', status: 'Assigned', date: '2024-01-19', eta: '2024-01-24' },
                  { id: 'SR003', type: 'Civil', description: 'Ceiling paint touch-up', priority: 'Low', status: 'Completed', date: '2024-01-15', eta: '2024-01-20' },
                ].map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{request.id}</h3>
                        <Badge variant="outline">{request.type}</Badge>
                        <Badge variant={
                          request.priority === 'High' ? 'destructive' :
                          request.priority === 'Medium' ? 'default' :
                          'secondary'
                        }>
                          {request.priority}
                        </Badge>
                        <Badge variant={
                          request.status === 'Completed' ? 'default' :
                          request.status === 'In Progress' ? 'secondary' :
                          'outline'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {request.date} • ETA: {request.eta}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewServiceDetails(request)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Design Review Modal */}
      <Dialog open={isDesignModalOpen} onOpenChange={setIsDesignModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Design Review - {selectedDesign?.name}</DialogTitle>
            <DialogDescription>
              Review and provide feedback on the submitted design
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[50vh]">
            <div className="space-y-6 pr-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <FileText className="h-24 w-24 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-lg font-medium">Design Preview</p>
                  <p className="text-sm text-muted-foreground">Click to view full-size image</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Design Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Designer:</span>
                      <span>{selectedDesign?.designer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upload Date:</span>
                      <span>{selectedDesign?.uploadDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span>v{selectedDesign?.revisions || 1}.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline">{selectedDesign?.status}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Comments Thread</h3>
                  <div className="space-y-2">
                    <div className="text-sm p-2 bg-background rounded">
                      <p className="font-medium">Design Team</p>
                      <p>Initial design submission with floor plan layout.</p>
                      <p className="text-xs text-muted-foreground">2024-01-10</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDesignModalOpen(false)}>
              Close
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleRequestChanges(selectedDesign)}
            >
              Request Changes
            </Button>
            <Button onClick={() => handleApproveDesign(selectedDesign)}>
              Approve Design
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Invoice - {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>
              Complete payment for invoice amount ₹{selectedInvoice && (selectedInvoice.amount / 1000).toFixed(0)}K
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted">
              <h3 className="font-medium mb-2">Invoice Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Invoice ID:</span>
                  <span>{selectedInvoice?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span>{selectedInvoice?.dueDate}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Amount:</span>
                  <span>₹{selectedInvoice && (selectedInvoice.amount / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="emailConfirmation" className="rounded" />
              <label htmlFor="emailConfirmation" className="text-sm">
                Send payment confirmation via email
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handlePayOnline(selectedInvoice)}>
                Proceed to Pay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Request Modal */}
      <Dialog open={isServiceRequestModalOpen} onOpenChange={setIsServiceRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Service Request</DialogTitle>
            <DialogDescription>
              Submit a new service request for assistance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceCategory">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="servicePriority">Priority Level</Label>
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

            <div>
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea 
                id="serviceDescription" 
                placeholder="Describe the issue or service required..." 
                rows={4} 
              />
            </div>

            <div>
              <Label htmlFor="servicePhotos">Attach Photos/Videos (Optional)</Label>
              <Input id="servicePhotos" type="file" multiple accept="image/*,video/*" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsServiceRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleServiceRequest}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Modal */}
      <Dialog open={isPhotoGalleryOpen} onOpenChange={setIsPhotoGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Project Photo Gallery</DialogTitle>
            <DialogDescription>
              View all project progress photos
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <div className="space-y-6 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectPhotos.map((photo) => (
                  <div key={photo.id} className="group relative border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-muted flex flex-col items-center justify-center p-6">
                      <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                      <h3 className="font-medium text-sm text-center">{photo.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{photo.date}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Badge variant="secondary" className="pointer-events-none">
                        {photo.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPhotoGalleryOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    toast.info("Downloading all photos...")
                    setIsPhotoGalleryOpen(false)
                  }}
                >
                  Download All
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Service Request Details Modal */}
      <Dialog open={isServiceDetailsModalOpen} onOpenChange={setIsServiceDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Service Request Details - {selectedServiceRequest?.id}</DialogTitle>
            <DialogDescription>
              Detailed information and updates about your service request
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[65vh]">
            <div className="space-y-6 pr-4">
              {/* Request Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Request Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type:</p>
                    <p className="font-medium">{selectedServiceRequest?.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status:</p>
                    <Badge variant={
                      selectedServiceRequest?.status === 'Completed' ? 'default' :
                      selectedServiceRequest?.status === 'In Progress' ? 'secondary' :
                      'outline'
                    }>
                      {selectedServiceRequest?.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority:</p>
                    <Badge variant={
                      selectedServiceRequest?.priority === 'High' ? 'destructive' :
                      selectedServiceRequest?.priority === 'Medium' ? 'default' :
                      'secondary'
                    }>
                      {selectedServiceRequest?.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted On:</p>
                    <p className="font-medium">{selectedServiceRequest?.date}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Description:</p>
                    <p className="font-medium">{selectedServiceRequest?.description}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Updates */}
              <div>
                <h3 className="font-medium mb-3">Request Timeline</h3>
                <div className="space-y-4">
                  {serviceUpdates.map((update, index) => (
                    <div key={update.id} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 z-10">
                        {update.status === 'Submitted' ? <MessageSquare className="h-4 w-4" /> :
                         update.status === 'In Progress' ? <Clock className="h-4 w-4" /> :
                         <CheckCircle className="h-4 w-4" />}
                      </div>
                      {index !== serviceUpdates.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-muted" />
                      )}
                      <div className="flex-1 bg-muted/50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="outline">{update.status}</Badge>
                          <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                        </div>
                        <p className="text-sm">{update.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">Updated by: {update.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Comment Section */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Add Comment</h3>
                <Textarea 
                  placeholder="Add a comment or additional information..." 
                  className="mb-2"
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm"
                    onClick={() => toast.success("Comment added successfully")}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsServiceDetailsModalOpen(false)}>
                  Close
                </Button>
                {selectedServiceRequest?.status !== 'Completed' && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      toast.success("Service request marked as resolved")
                      setIsServiceDetailsModalOpen(false)
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClientPortal
