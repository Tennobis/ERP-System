import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Monitor,
  Users,
  Settings,
  Shield,
  AlertTriangle,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Copy,
  Loader2,
} from "lucide-react";
import { employeesData } from "@/lib/dummy-data";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
};

const usersData: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@company.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-20 09:30",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@company.com",
    role: "Managing Director",
    status: "Active",
    lastLogin: "2024-01-20 08:15",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@company.com",
    role: "Client",
    status: "Inactive",
    lastLogin: "2024-01-18 16:45",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah@company.com",
    role: "Site Manager",
    status: "Active",
    lastLogin: "2024-01-20 10:20",
  },
];

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <Badge variant="outline">{role}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
       <Badge variant={status.toLowerCase() === "active" ? "default" : "destructive"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
  },
];

const ITDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: "",
    description: "",
    expiresIn: "30",
    permissions: "read",
  });
  const [generatedApiKey, setGeneratedApiKey] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(usersData);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
  }>({
    name: "",
    email: "",
    role: "",
    status: "Active",
  });
  const [invitationLink, setInvitationLink] = useState("");
  const [showInvitationLink, setShowInvitationLink] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [systemHealth, setSystemHealth] = useState([]);
  const [modules, setModules] = useState([]);

  //   type User = {
  //   id: string // UUID
  //   email: string
  //   name: string
  //   role: string
  //   avatar?: string | null
  //   created_at?: string
  //   updated_at?: string
  // }

  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const activeToday = users.filter(user => {
    // Convert status to lowercase for case-insensitive comparison
    const userStatus = user.status?.toLowerCase();
    return userStatus === 'active';
  }).length;

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/monitoring')) return 'monitoring';
    if (path.includes('/users')) return 'users';
    if (path.includes('/modules')) return 'modules';
    if (path.includes('/security')) return 'security';
    if (path.includes('/logs')) return 'logs';
    return 'users'; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      monitoring: '/admin-dashboard/monitoring',
      users: '/admin-dashboard/users',
      modules: '/admin-dashboard/modules',
      security: '/admin-dashboard/security',
      logs: '/admin-dashboard/logs'
    };
    navigate(tabRoutes[value]);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Fetch system health
    axios.get(`${API_URL}/admin/system-health`, { headers })
      .then(res => setSystemHealth(res.data))
      .catch(() => {});
    // Fetch modules
    axios.get(`${API_URL}/admin/modules`, { headers })
      .then(res => setModules(res.data))
      .catch(() => {});
    // Fetch users
    axios.get(`${API_URL}/users`, { headers })
      .then(res => setUsers(res.data.map(dbUser => ({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status === 'active' ? 'Active' : 'Inactive',
        lastLogin: dbUser.lastLogin
          ? new Date(dbUser.lastLogin).toLocaleString()
          : "Never",
      }))))
      .catch(() => {});
  }, []);

  // Add this function to generate invitation links with Supabase
  const generateInvitationLink = async () => {
    if (!newUser.email || !newUser.name || !newUser.role) {
      toast.error("Please fill in all user details first");
      return;
    }

    setIsGeneratingLink(true);
    try {
      const res = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        }),
      });
      if (!res.ok) throw new Error('Failed to create invitation');
      const { token } = await res.json();
      const link = `${window.location.origin}/register?token=${token}`;
      setInvitationLink(link);
      setShowInvitationLink(true);
      toast.success("Invitation link generated successfully!");
    } catch (error) {
      console.error("Error generating invitation:", error);
      toast.error("Failed to generate invitation link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success("Invitation link copied to clipboard!");
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setNewUser({
      name: "",
      email: "",
      role: "",
      status: "Active",
    });
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsUserModalOpen(true);
  };

   const handleDeleteUser = async (user: User) => {
    try {
      toast.loading("Deleting user...");
      const res = await fetch(`${API_URL}/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
      toast.dismiss();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.dismiss();
      toast.error("Failed to delete user. Please try again.");
    }
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      if (selectedUser) {
        // Edit existing user
        const res = await fetch(`${API_URL}/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newUser.name,
            role: newUser.role,
            status: newUser.status,
          }),
        });
        if (!res.ok) throw new Error('Failed to update user');
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  name: newUser.name,
                  email: newUser.email,
                  role: newUser.role,
                  status: newUser.status,
                }
              : user
          )
        );
        toast.success("User updated successfully!");
      } else {
        // Generate invitation for new user
        const res = await fetch(`${API_URL}/invitations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          }),
        });
        if (!res.ok) throw new Error('Failed to create invitation');
        const { token } = await res.json();
        const link = `${window.location.origin}/register?token=${token}`;
        setInvitationLink(link);
        setShowInvitationLink(true);
        // Refresh the users list
        const userToken = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const userHeaders = userToken ? { Authorization: `Bearer ${userToken}` } : {};
        const updatedUsers = await axios.get(`${API_URL}/users`, { headers: userHeaders })
          .then(res => res.data.map(dbUser => ({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            status: dbUser.status === 'active' ? 'Active' : 'Inactive',
            lastLogin: dbUser.lastLogin
              ? new Date(dbUser.lastLogin).toLocaleString()
              : "Never",
          })));
        setUsers(updatedUsers);
        toast.success("User invitation created successfully!");
      }
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    }
  };


  const handleManualSync = () => {
    toast.success("Manual sync initiated successfully!");
  };

  const handleViewSchema = () => {
    setIsSchemaModalOpen(true);
  };

  const handleAddApiKey = () => {
    setIsApiKeyModalOpen(true);
  };

  const handleGenerateApiKey = () => {
    // Generate a random API key (in real app, this would come from backend)
    const key =
      "nf_" +
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .substring(0, 32);

    setGeneratedApiKey(key);
    toast.success("API key generated successfully!");
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(generatedApiKey);
    toast.success("API key copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin & IT Dashboard
          </h1>
          <p className="text-muted-foreground">
            System administration and IT operations
          </p>
        </div>
        {/* <Button onClick={handleManualSync} className="gap-2">
          <Settings className="h-4 w-4" />
          Manual Sync
        </Button> */}
      </div>

      <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
        {/* <TabsList className="grid w-full grid-cols-5"> */}
          {/* <TabsTrigger value="monitoring">System Monitoring</TabsTrigger> */}
          {/* <TabsTrigger value="users">User Management</TabsTrigger> */}
          {/* <TabsTrigger value="modules">Modules & API</TabsTrigger> */}
          {/* <TabsTrigger value="workflows">Workflows</TabsTrigger> */}
          {/* <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="logs">Logs & Audit</TabsTrigger> */}
        {/* </TabsList> */}

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="System Uptime"
              value="99.9%"
              icon={Monitor}
              description="Last 24 hours"
              trend={{ value: 0.1, label: "vs yesterday" }}
              onClick={() => toast.info("Viewing uptime details")}
            />
            <StatCard
              title="API Failures"
              value="0.2%"
              icon={AlertTriangle}
              description="Error rate today"
              trend={{ value: -0.1, label: "improvement" }}
              onClick={() => toast.info("Opening API failure logs")}
            />
            <StatCard
              title="Active Users"
              value={activeToday.toString()}
              icon={Users}
              description="Currently online"
              onClick={() => toast.info("Viewing active user list")}
            />
            <StatCard
              title="System Load"
              value="68%"
              icon={Settings}
              description="CPU utilization"
              onClick={() => toast.info("Opening system metrics")}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Trends</CardTitle>
                <CardDescription>24-hour monitoring overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={systemHealth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="uptime"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="apiCalls"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Events Log</CardTitle>
                <CardDescription>Recent system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      time: "10:30",
                      event: "User login: john@company.com",
                      status: "success",
                    },
                    {
                      time: "10:25",
                      event: "API sync completed",
                      status: "success",
                    },
                    {
                      time: "10:20",
                      event: "Failed login attempt",
                      status: "warning",
                    },
                    {
                      time: "10:15",
                      event: "Backup completed",
                      status: "success",
                    },
                    {
                      time: "10:10",
                      event: "System maintenance started",
                      status: "info",
                    },
                  ].map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            log.status === "success"
                              ? "bg-green-500"
                              : log.status === "warning"
                              ? "bg-yellow-500"
                              : log.status === "error"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <span className="text-sm">{log.event}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={totalUsers.toString()}
                icon={Users}
                description="Registered users"
                onClick={() => toast.info("Viewing all users")}
              />
              <StatCard
                title="Admins"
                value={adminUsers.toString()}
                icon={Shield}
                description="Administrative users"
                onClick={() => toast.info("Viewing admin list")}
              />
              <StatCard
                title="Active Today"
                value={activeToday.toString()}
                icon={Monitor}
                description="Users logged in today"
                onClick={() => toast.info("Viewing today's activity")}
              />
            </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </div>
              <Button onClick={handleAddUser} className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  ...userColumns,
                  {
                    id: "actions",
                    header: "Actions",
                    cell: ({ row }) => (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(row.original)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(row.original)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={users}
                searchKey="name"
              />
            </CardContent>
          </Card>

          <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription>
                  {selectedUser
                    ? "Update user information and permissions"
                    : "Create a new user account"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter user's name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter user's email"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="md">Managing Director</SelectItem>
                      <SelectItem value="client-manager">
                        Client Manager
                      </SelectItem>
                      <SelectItem value="store">Store Manager</SelectItem>
                      <SelectItem value="accounts">Accounts Manager</SelectItem>
                      {/* <SelectItem value="site">Site Manager</SelectItem> */}
                      {/* <SelectItem value="client">Client</SelectItem> */}
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="project">Project Manager</SelectItem>
                      <SelectItem value="warehouse">Warehouse Manager</SelectItem>
                      <SelectItem value="tender">Tender Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>{" "}
                <div className="flex items-center space-x-2">
                  {/* <Switch 
                    id="status" 
                    checked={newUser.status === 'Active'}
                    onCheckedChange={(checked) => 
                      setNewUser(prev => ({ ...prev, status: checked ? 'Active' : 'Inactive' }))
                    }
                  /> */}
                  {/* <Label htmlFor="status">Active</Label> */}
                </div>
                {!selectedUser && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateInvitationLink}
                      disabled={
                        isGeneratingLink ||
                        !newUser.email ||
                        !newUser.name ||
                        !newUser.role
                      }
                      className="w-full"
                    >
                      {isGeneratingLink ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Generating...
                        </>
                      ) : (
                        "Generate Invitation Link"
                      )}
                    </Button>
                  </div>
                )}
                {showInvitationLink && (
                  <div className="mt-4 space-y-2">
                    <Label>Invitation Link</Label>
                    <div className="flex items-center gap-2">
                      <Input type={"text"} value={invitationLink} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyInvitationLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This link will expire in 7 days
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsUserModalOpen(false);
                      setSelectedUser(null);
                      setNewUser({
                        name: "",
                        email: "",
                        role: "",
                        status: "Active",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveUser}>
                    {selectedUser ? "Update" : "Create"} User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Module Control</CardTitle>
                <CardDescription>
                  Manage system modules and API tokens
                </CardDescription>
              </div>
              <Button onClick={handleAddApiKey} className="gap-2">
                <Plus className="h-4 w-4" />
                Add API Key
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <div key={module.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{module.name}</h3>
                      <Badge
                        variant={
                          module.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {module.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usage:</span>
                        <span>{module.usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${module.usage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last sync: {module.lastSync}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Security Score"
              value="95%"
              icon={Shield}
              description="Overall security rating"
              onClick={() => toast.info("Viewing security analysis")}
            />
            <StatCard
              title="Failed Logins"
              value="3"
              icon={AlertTriangle}
              description="Last 24 hours"
              onClick={() => toast.info("Viewing security logs")}
            />
            <StatCard
              title="Last Backup"
              value="2 hrs ago"
              icon={Settings}
              description="System backup status"
              onClick={() => toast.info("Opening backup settings")}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security & Schema Manager</CardTitle>
              <CardDescription>
                Manage database schema and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Database Schema</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage document types and field configurations
                  </p>
                  <Button variant="outline" onClick={handleViewSchema}>
                    View Schema
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Backup Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automated backups are scheduled daily at 2 AM
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Starting manual backup")}
                  >
                    Manual Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Logs & Audit Trails</CardTitle>
              <CardDescription>System-wide activity monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    user: "John Doe",
                    action: "Created new project",
                    module: "Project Management",
                    timestamp: "2024-01-20 10:30:15",
                  },
                  {
                    user: "Jane Smith",
                    action: "Updated invoice status",
                    module: "Finance",
                    timestamp: "2024-01-20 10:25:30",
                  },
                  {
                    user: "Mike Johnson",
                    action: "Uploaded design file",
                    module: "Design",
                    timestamp: "2024-01-20 10:20:45",
                  },
                  {
                    user: "Admin",
                    action: "System backup completed",
                    module: "System",
                    timestamp: "2024-01-20 02:00:00",
                  },
                ].map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{log.user}</span>
                        <Badge variant="outline">{log.module}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.action}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isSchemaModalOpen} onOpenChange={setIsSchemaModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Database Schema Viewer</DialogTitle>
            <DialogDescription>
              View and analyze your database schema structure
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                name: "users",
                fields: [
                  { name: "id", type: "string", required: true },
                  { name: "email", type: "string", required: true },
                  { name: "name", type: "string", required: true },
                  {
                    name: "role",
                    type: "enum",
                    values: [
                      "admin",
                      "md",
                      "site",
                      "store",
                      "client",
                      "accounts",
                      "client-manager",
                    ],
                  },
                  { name: "createdAt", type: "timestamp" },
                ],
              },
              {
                name: "projects",
                fields: [
                  { name: "id", type: "string", required: true },
                  { name: "title", type: "string", required: true },
                  { name: "description", type: "text" },
                  {
                    name: "status",
                    type: "enum",
                    values: ["active", "archived", "deleted"],
                  },
                  { name: "ownerId", type: "string", references: "users.id" },
                ],
              },
            ].map((collection) => (
              <div key={collection.name} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-2">{collection.name}</h3>
                <div className="space-y-2">
                  {collection.fields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center gap-4 text-sm"
                    >
                      <span className="font-medium w-24">{field.name}</span>
                      <Badge variant="outline">{field.type}</Badge>
                      {field.required && (
                        <Badge variant="default">Required</Badge>
                      )}
                      {field.values && (
                        <span className="text-muted-foreground">
                          [{field.values.join(", ")}]
                        </span>
                      )}
                      {field.references && (
                        <span className="text-muted-foreground">
                          → {field.references}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for accessing the system programmatically
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyName">API Key Name</Label>
              <Input
                id="keyName"
                value={newApiKey.name}
                onChange={(e) =>
                  setNewApiKey((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Production API Key"
              />
            </div>
            <div>
              <Label htmlFor="keyDescription">Description</Label>
              <Input
                id="keyDescription"
                value={newApiKey.description}
                onChange={(e) =>
                  setNewApiKey((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What is this API key for?"
              />
            </div>
            <div>
              <Label htmlFor="expiresIn">Expires In</Label>
              <Select
                value={newApiKey.expiresIn}
                onValueChange={(value) =>
                  setNewApiKey((prev) => ({ ...prev, expiresIn: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="permissions">Permissions</Label>
              <Select
                value={newApiKey.permissions}
                onValueChange={(value) =>
                  setNewApiKey((prev) => ({ ...prev, permissions: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="write">Read & Write</SelectItem>
                  <SelectItem value="admin">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {generatedApiKey && (
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={generatedApiKey}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyApiKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsApiKeyModalOpen(false);
                  setGeneratedApiKey("");
                  setNewApiKey({
                    name: "",
                    description: "",
                    expiresIn: "30",
                    permissions: "read",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateApiKey} disabled={!newApiKey.name}>
                Generate Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* {!selectedUser && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={generateInvitationLink}
            disabled={
              isGeneratingLink ||
              !newUser.email ||
              !newUser.name ||
              !newUser.role
            }
            className="w-full"
          >
            {isGeneratingLink ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Invitation Link"
            )}
          </Button>
        </div>
      )} */}

      {/* {showInvitationLink && (
        <div className="mt-4 space-y-2">
          <Label>Invitation Link</Label>
          <div className="flex items-center gap-2">
            <Input type={"text"} value={invitationLink} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyInvitationLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This link will expire in 7 days
          </p>
        </div>
      )} */}
    </div>
  );
};

export default ITDashboard;
