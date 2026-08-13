import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Users, Phone, AlertTriangle, FileText, Calendar, DollarSign, Plus, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react"
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"
import type { Client, Invoice } from "@/types/dummy-data-types";
import { add } from "date-fns"
import { useUserFilter } from "@/contexts/UserFilterContext"
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider"
import { UserFilterComponent } from "@/components/UserFilterComponent"

// Define a row type with contact fields for the table
interface ClientRow extends Client {
  contactNo: string;
  email: string;
  address: string;
  projects?: { id: string; name: string }[];
}

const clientColumns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "name",
    header: "Client Name",
  },
  {
    accessorKey: "contactNo",
    header: "Contact No",
    cell: ({ row }) => (
      <div className="hidden sm:table-cell">
        {row.getValue("contactNo")}
      </div>
    )
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="hidden md:table-cell">
        {row.getValue("email")}
      </div>
    )
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="hidden lg:table-cell">
        {row.getValue("address")}
      </div>
    )
  },
]

const ClientManagerDashboardContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientManagerStats, setClientManagerStats] = useState({ responsiveness: '', pendingApprovals: 0, avgDelay: '', slaBreaches: 0 });
  const [engagementData, setEngagementData] = useState([]);
  const [approvalDelayData, setApprovalDelayData] = useState([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isContactAccountsModalOpen, setIsContactAccountsModalOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  // Matches server prisma Client model
  const [newClient, setNewClient] = useState<{ name: string; contactNo: string; email: string; address: string }>({ name: "", contactNo: "", email: "", address: "" })
  const [editClient, setEditClient] = useState<{ id: string; name: string; contactNo: string; email: string; address: string }>({ id: "", name: "", contactNo: "", email: "", address: "" })
  const { user } = useUser();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [invoices, setInvoices] = useState([]);
  
  // Calculate KPI metrics from client data
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.activeProjects > 0).length;
  const totalActiveProjects = clients.reduce((sum, c) => sum + c.activeProjects, 0);
  const totalValue = clients.reduce((sum, c) => sum + c.totalValue, 0);

  const { 
    targetUserId, 
    selectedUser, 
    currentUser,
    selectedUserId,
    setSelectedUserId,
    isAdminUser 
  } = useUserFilter();

  const userID = targetUserId || user?.id;

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/engagement')) return 'engagement';
    if (path.includes('/billing')) return 'billing';
    return 'engagement'; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      engagement: '/client-manager/engagement',
      billing: '/client-manager/billing'
    };
    navigate(tabRoutes[value]);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetchClients();
    const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
        ? `${API_URL}/billing/invoices`
        : `${API_URL}/billing/invoices/${userID}`;
    axios.get(endpoint, { headers })
      .then(res => setInvoices(res.data))
      .catch(() => {});
  }, [userID]);
  
  const fetchClients = async () => {
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
      ? `${API_URL}/clients`
      : `${API_URL}/clients/${userID}`;
      
      console.log("Fetching clients for user:", userID, "Endpoint:", endpoint);
      
      const response = await axios.get(endpoint, { headers });
      
      // Map API clients to table format with contact fields
      const mapped: ClientRow[] = (response.data).map((c: any) => ({
        id: c.id,
        name: c.name,
        totalProjects: Array.isArray(c.Project) ? c.Project.length : 0,
        // Treat projects without endDate as active
        activeProjects: Array.isArray(c.Project) ? c.Project.filter((p: any) => !p.endDate).length : 0,
        totalValue: (Array.isArray(c.Project) ? c.Project : []).reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
        lastContact: new Date(c.updatedAt || c.createdAt).toISOString().slice(0, 10),
        contactNo: c.contactNo,
        email: c.email,
        address: c.address,
        projects: Array.isArray(c.Project) ? c.Project.map((p: any) => ({ id: p.id, name: p.name })) : [],
      }));
      
      setClients(mapped);
      console.log(clients)
      
    } catch (err: any) {
      console.log(err.message); // Handle error appropriately
    }
  };

  const handleAddInteraction = (client: Client) => {
    setSelectedClient(client)
    setIsInteractionModalOpen(true)
  }

  const handleEscalate = (client: Client) => {
    setSelectedClient(client)
    setIsEscalationModalOpen(true)
  }

  const handleSaveInteraction = () => {
    toast.success("Interaction logged successfully!")
    setIsInteractionModalOpen(false)
    setSelectedClient(null)
  }

  const handleSaveEscalation = () => {
    toast.success("Escalation raised successfully!")
    setIsEscalationModalOpen(false)
    setSelectedClient(null)
  }

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client)
    setIsProfileModalOpen(true)
  }

  const handleDownloadInvoice = (invoice: any) => {
    const invoiceContent = `
Invoice ID: ${invoice.id}
Invoice Number: ${invoice.invoiceNumber}
Client: ${invoice.client?.name || 'Unknown Client'}
Total Amount: ₹${(invoice.total / 1000).toFixed(0)}K
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
Status: ${invoice.status}
Work Completed: ${invoice.workCompletedPercent || 0}%
    `
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoice.invoiceNumber || invoice.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success("Invoice downloaded successfully!")
  }

  const handleContactAccounts = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsContactAccountsModalOpen(true)
  }

  const handleEditClient = (client: ClientRow) => {
    setEditClient({
      id: client.id,
      name: client.name,
      contactNo: client.contactNo,
      email: client.email,
      address: client.address
    })
    setIsEditClientOpen(true)
  }

  const handleDeleteClient = async (client: ClientRow) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) {
      return
    }
    
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${API_URL}/clients/${client.id}`, { headers });
      
      // Remove from local state
      setClients(prev => prev.filter(c => c.id !== client.id));
      toast.success("Client deleted successfully");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete client";
      toast.error(msg);
    }
  }

  // Mobile responsive client columns
  const mobileClientColumns: ColumnDef<ClientRow>[] = [
    {
      accessorKey: "name",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-xs text-muted-foreground sm:hidden">
              {row.original.contactNo}
            </span>
            <Badge variant="secondary" className="text-xs">
              {row.original.activeProjects} active
            </Badge>
          </div>
        </div>
      )
    },
    {
      accessorKey: "contactNo",
      header: "Contact No",
      cell: ({ row }) => (
        <div className="hidden sm:table-cell">
          {row.getValue("contactNo")}
        </div>
      )
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          {row.getValue("email")}
        </div>
      )
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="hidden lg:table-cell">
          {row.getValue("address")}
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewProfile(row.original)}
            className="h-8 w-8 p-0"
            title="View Profile"
          >
            <FileText className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClient(row.original)}
            className="h-8 w-8 p-0"
            title="Edit Client"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClient(row.original)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Delete Client"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  // Get current tab name for display
  const getCurrentTabName = () => {
    const tab = getCurrentTab();
    switch (tab) {
      case 'engagement': return 'Client Engagement';
      case 'billing': return 'Billing Insights';
      default: return 'Client Engagement';
    }
  };

  // Get icon for current tab
  const getCurrentTabIcon = () => {
    const tab = getCurrentTab();
    switch (tab) {
      case 'engagement': return Users;
      case 'billing': return DollarSign;
      default: return Users;
    }
  };

  const CurrentTabIcon = getCurrentTabIcon();
  const currentTabName = getCurrentTabName();

  return (
    <div className="space-y-6">
      <UserFilterComponent/>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Client Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Client engagement and relationship management</p>
        </div>
        <Button onClick={() => setIsAddClientOpen(true)} className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Add Client</span>
        </Button>
      </div>

      <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
        {/* Hide tabs on mobile - show only on desktop */}
        <TabsList className="hidden md:grid w-full grid-cols-2">
          <TabsTrigger value="engagement">Client Engagement</TabsTrigger>
          <TabsTrigger value="billing">Billing Insights</TabsTrigger>
        </TabsList>

        {/* Mobile-specific section header */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <CurrentTabIcon className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">{currentTabName}</h2>
                <p className="text-xs text-muted-foreground">
                  Client Manager › {currentTabName}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {getCurrentTab() === 'engagement' && `${clients.length} clients`}
              {getCurrentTab() === 'billing' && `${invoices.length} invoices`}
            </div>
          </div>
        </div>

        <TabsContent value="engagement" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
            <StatCard
              title="Total Clients"
              value={totalClients.toString()}
              icon={Users}
              description="Registered clients"
              onClick={() => toast.info("Viewing all clients")}
            />
            <StatCard
              title="Active Clients"
              value={activeClients.toString()}
              icon={Users}
              description="With ongoing projects"
              onClick={() => toast.info("Viewing active clients")}
            />
            <StatCard
              title="Total Projects"
              value={totalActiveProjects.toString()}
              icon={FileText}
              description="Active projects"
              onClick={() => toast.info("Viewing project status")}
            />
            <StatCard
              title="Portfolio Value"
              value={`₹${(totalValue / 1000000).toFixed(1)}M`}
              icon={DollarSign}
              description="Total client value"
              onClick={() => toast.info("Viewing portfolio breakdown")}
            />
          </div>

         <Card>
            <CardHeader>
              <CardTitle>Client Relationship Management</CardTitle>
              <CardDescription>Client portfolio and engagement tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={mobileClientColumns}
                data={clients}
                searchKey="name"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Pending Approvals"
              value={clientManagerStats.pendingApprovals}
              icon={FileText}
              description="Awaiting client approval"
              onClick={() => toast.info("Viewing approval queue")}
            />
            <StatCard
              title="Average Delay"
              value={clientManagerStats.avgDelay}
              icon={AlertTriangle}
              description="Approval turnaround"
              trend={{ value: -1.2, label: "improvement" }}
              onClick={() => toast.info("Opening delay analysis")}
            />
            <StatCard
              title="SLA Breaches"
              value={clientManagerStats.slaBreaches}
              icon={AlertTriangle}
              description="This month"
              onClick={() => toast.info("Viewing SLA report")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Approval Delay Analysis</CardTitle>
              <CardDescription>Client-wise approval delays by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={approvalDelayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="client" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} days`, '']} />
                  <Bar dataKey="boq" fill="#3b82f6" />
                  <Bar dataKey="design" fill="#10b981" />
                  <Bar dataKey="invoice" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>Items pending client approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalQueue.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{item.item}</h3>
                        <Badge variant="outline">{item.type}</Badge>
                        {item.daysWaiting > 7 && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.client} • {item.amount !== '-' && `Amount: ${item.amount}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Waiting for {item.daysWaiting} days
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEscalate({ id: item.client, name: item.client, totalProjects: 0, activeProjects: 0, totalValue: 0, lastContact: '' })}
                      >
                        Escalate
                      </Button>
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsReminderModalOpen(true)}
                      >
                        Remind
                      </Button> */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            <StatCard
              title="Outstanding Amount"
              value="₹8.2M"
              icon={DollarSign}
              description="Pending collections"
              onClick={() => toast.info("Viewing outstanding invoices")}
            />
            <StatCard
              title="Overdue Invoices"
              value="12"
              icon={AlertTriangle}
              description="Past due date"
              onClick={() => toast.info("Opening overdue list")}
            />
            <StatCard
              title="Collection Rate"
              value="92%"
              icon={DollarSign}
              description="This month"
              trend={{ value: 3, label: "vs last month" }}
              onClick={() => toast.info("Viewing collection analytics")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Payment Status</CardTitle>
              <CardDescription>Invoice and payment tracking by client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                        <Badge variant={
                          invoice.status === 'PAID' ? 'default' :
                          invoice.status === 'OVERDUE' ? 'destructive' :
                          'secondary'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client?.name || 'Unknown Client'} • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{(invoice.total / 1000).toFixed(0)}K</div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactAccounts(invoice)}
                        >
                          Contact Accounts
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isInteractionModalOpen} onOpenChange={setIsInteractionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client Interaction</DialogTitle>
            <DialogDescription>
              Log a new interaction with {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="interactionType">Interaction Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="site-visit">Site Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="outcome">Outcome</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow-up">Follow-up Required</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add interaction details..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInteractionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInteraction}>
                Save Interaction
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEscalationModalOpen} onOpenChange={setIsEscalationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Escalation</DialogTitle>
            <DialogDescription>
              Escalate issue for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalationReason">Escalation Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment-delay">Payment Delay</SelectItem>
                  <SelectItem value="approval-delay">Approval Delay</SelectItem>
                  <SelectItem value="communication-issue">Communication Issue</SelectItem>
                  <SelectItem value="project-concern">Project Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="escalationTarget">Escalate To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project-manager">Project Manager</SelectItem>
                  <SelectItem value="accounts-head">Accounts Head</SelectItem>
                  <SelectItem value="managing-director">Managing Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="escalationNote">Internal Note</Label>
              <Textarea id="escalationNote" placeholder="Add internal notes for escalation..." rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEscalationModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEscalation}>
                Raise Escalation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>
              Create a new client with required details
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              // Simple required validation
              if (!newClient.name || !newClient.contactNo || !newClient.email || !newClient.address) {
                toast.error("Please fill all required fields");
                return;
              }
              try {
                const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                if (!user?.id) {
                  toast.error("User not found. Please re-login.");
                  return;
                }

                const payload = {
                  name: newClient.name,
                  contactNo: newClient.contactNo,
                  email: newClient.email,
                  address: newClient.address,
                };

                const { data } = await axios.post(`${API_URL}/clients/${user.id}`, payload, { headers });

                // Optimistic add to table using backend response when possible
                setClients((prev: any) => [
                  {
                    id: data?.id || crypto.randomUUID(),
                    name: data?.name || newClient.name,
                    totalProjects: 0,
                    activeProjects: 0,
                    totalValue: 0,
                    lastContact: new Date().toISOString().slice(0, 10),
                    contactNo: data?.contactNo ?? newClient.contactNo,
                    email: data?.email ?? newClient.email,
                    address: data?.address ?? newClient.address,
                  },
                  ...prev,
                ]);
                toast.success("Client added successfully");
                setIsAddClientOpen(false);
                setNewClient({ name: "", contactNo: "", email: "", address: "" });
              } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Failed to add client";
                toast.error(msg);
              }
            }}
          >
            <div>
              <Label htmlFor="clientName">Name*</Label>
              <Input
                id="clientName"
                value={newClient.name}
                onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))}
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <Label htmlFor="clientContact">Contact Number*</Label>
              <Input
                id="clientContact"
                value={newClient.contactNo}
                onChange={(e) => setNewClient((c) => ({ ...c, contactNo: e.target.value }))}
                placeholder="Enter contact number"
                required
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email Address*</Label>
              <Input
                id="clientEmail"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Address*</Label>
              <Input
                id="clientEmail"
                type="text"
                value={newClient.address}
                onChange={(e) => setNewClient((c) => ({ ...c, address: e.target.value }))}
                placeholder="Enter address"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              // Simple required validation
              if (!editClient.name || !editClient.contactNo || !editClient.email || !editClient.address) {
                toast.error("Please fill all required fields");
                return;
              }
              try {
                const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const payload = {
                  name: editClient.name,
                  contactNo: editClient.contactNo,
                  email: editClient.email,
                  address: editClient.address,
                };

                const { data } = await axios.put(`${API_URL}/clients/${editClient.id}`, payload, { headers });

                // Update client in local state
                setClients((prev: any) => prev.map((client: any) => 
                  client.id === editClient.id 
                    ? {
                        ...client,
                        name: data?.name || editClient.name,
                        contactNo: data?.contactNo ?? editClient.contactNo,
                        email: data?.email ?? editClient.email,
                        address: data?.address ?? editClient.address,
                      }
                    : client
                ));
                toast.success("Client updated successfully");
                setIsEditClientOpen(false);
                setEditClient({ id: "", name: "", contactNo: "", email: "", address: "" });
              } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Failed to update client";
                toast.error(msg);
              }
            }}
          >
            <div>
              <Label htmlFor="editClientName">Name*</Label>
              <Input
                id="editClientName"
                value={editClient.name}
                onChange={(e) => setEditClient((c) => ({ ...c, name: e.target.value }))}
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <Label htmlFor="editClientContact">Contact Number*</Label>
              <Input
                id="editClientContact"
                value={editClient.contactNo}
                onChange={(e) => setEditClient((c) => ({ ...c, contactNo: e.target.value }))}
                placeholder="Enter contact number"
                required
              />
            </div>
            <div>
              <Label htmlFor="editClientEmail">Email Address*</Label>
              <Input
                id="editClientEmail"
                type="email"
                value={editClient.email}
                onChange={(e) => setEditClient((c) => ({ ...c, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="editClientAddress">Address*</Label>
              <Input
                id="editClientAddress"
                type="text"
                value={editClient.address}
                onChange={(e) => setEditClient((c) => ({ ...c, address: e.target.value }))}
                placeholder="Enter address"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditClientOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {selectedClient && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm font-medium">{selectedClient.name}</p>
                  </div>
                  <div>
                    <Label>Last Contact</Label>
                    <p className="text-sm font-medium">{selectedClient.lastContact}</p>
                  </div>
                  <div>
                    <Label>Total Projects</Label>
                    <p className="text-sm font-medium">{selectedClient.totalProjects}</p>
                  </div>
                  <div>
                    <Label>Active Projects</Label>
                    <p className="text-sm font-medium">{selectedClient.activeProjects}</p>
                  </div>
                  <div>
                    <Label>Total Value</Label>
                    <p className="text-sm font-medium">₹{(selectedClient.totalValue / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                {/* <div className="space-y-4">
                  <h4 className="text-sm font-medium">Recent Interactions</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'Meeting', date: '2024-02-15', notes: 'Project review meeting' },
                      { type: 'Call', date: '2024-02-10', notes: 'Follow-up on pending approvals' },
                      { type: 'Email', date: '2024-02-05', notes: 'Invoice reminder sent' }
                    ].map((interaction, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{interaction.type}</Badge>
                          <span className="text-sm text-muted-foreground">{interaction.date}</span>
                        </div>
                        <p className="text-sm mt-2">{interaction.notes}</p>
                      </div>
                    ))}
                  </div>
                </div> */}

                {/* <div className="space-y-4">
                  <h4 className="text-sm font-medium">Project Status</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Project A', status: 'In Progress', completion: '75%' },
                      { name: 'Project B', status: 'Planning', completion: '20%' },
                      { name: 'Project C', status: 'Completed', completion: '100%' }
                    ].map((project, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{project.name}</span>
                          <Badge>{project.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Completion: {project.completion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div> */}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isContactAccountsModalOpen} onOpenChange={setIsContactAccountsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Accounts Team</DialogTitle>
            <DialogDescription>
              Send a message to accounts team regarding Invoice {selectedInvoice?.invoiceNumber || selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter subject..." />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Enter your message to the accounts team..." 
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="cc">CC</Label>
              <Input id="cc" placeholder="Add email addresses to CC..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsContactAccountsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Message sent to accounts team!")
                setIsContactAccountsModalOpen(false)
              }}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const ClientManagerDashboard = () => {
  return (
    <PageUserFilterProvider allowedRoles={["client_manager"]}>
      <ClientManagerDashboardContent />
    </PageUserFilterProvider>
  );
};
export default ClientManagerDashboard;