import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { FileText, Calendar, DollarSign, Users, TrendingUp, AlertTriangle, Download, Plus, CheckCircle, CheckCircle2, X, Clock, Truck, Edit } from "lucide-react";
import VendorComparisonTable from '@/components/tables/VendorComparisonTable';
import BidPreparationModal from '@/components/modals/BidPreparationModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import AddVehicleModal from '@/components/modals/AddVehicleModal';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TenderDetailsModal from '@/components/modals/TenderDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Tender {
  id: string;
  projectName: string;
  client: string;
  estimatedValue: number;
  submissionDate: string;
  status:  'submitted' | 'active' | 'rejected';
  completionPercentage: number;
  category: string;
  location: string;
}

interface TenderDashboardProps {
  onNewTender: () => void;
}

export const TenderDashboard: React.FC<TenderDashboardProps> = ({ onNewTender }) => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [editedTender, setEditedTender] = useState<Tender | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/tenders`, { headers })
      .then(res => setTenders(res.data))
      .catch(() => {});
  }, []);

  const getStatusColor = (status: Tender['status']) => {
    switch (status) {
      // case 'awarded': return 'default';
      case 'submitted': return 'secondary';
      // case 'under-evaluation': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredTenders = tenders.filter(tender => {
    const matchesStatus = selectedStatus === 'all' || tender.status === selectedStatus;
    const matchesSearch = tender.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tender.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalValue = tenders.reduce((sum, tender) => sum + tender.estimatedValue, 0);
  const submittedCount = tenders.filter(t => t.status === 'submitted' || t.status === 'under-evaluation').length;
  const draftCount = tenders.filter(t => t.status === 'draft').length;

  // Analytics mock data (combined)
  const analyticsKpis = [
    { label: 'Top Vendor', value: 'Steel Corp Ltd', icon: <Users className="h-6 w-6 text-blue-500" /> },
    // { label: 'Top Vehicle', value: 'Truck 1', icon: <Truck className="h-6 w-6 text-green-500" /> },
    { label: 'Total Vendors', value: 12, icon: <Users className="h-6 w-6 text-purple-500" /> },
    // { label: 'Total Vehicles', value: 18, icon: <Truck className="h-6 w-6 text-yellow-500" /> },
  ];

  const vendorStatusPie = [
    { name: 'Preferred', value: 5, color: '#22c55e' },
    { name: 'Approved', value: 4, color: '#0ea5e9' },
    { name: 'Under Review', value: 3, color: '#f59e0b' },
  ];

  const vehicleStatusPie = [
    { name: 'Active', value: 12, color: '#22c55e' },
    { name: 'Idle', value: 4, color: '#f59e0b' },
    { name: 'Maintenance', value: 2, color: '#ef4444' },
  ];

  const ordersByVendor = [
    { vendor: 'Steel Corp Ltd', orders: 24 },
    { vendor: 'Cement Industries', orders: 18 },
    { vendor: 'Hardware Solutions', orders: 15 },
    { vendor: 'Safety First Co', orders: 12 },
    { vendor: 'BuildCorp', orders: 10 },
  ];

  const topVendors = [
    { vendor: 'Steel Corp Ltd', orders: 24, value: '₹25L', status: 'Preferred' },
    { vendor: 'Cement Industries', orders: 18, value: '₹18L', status: 'Approved' },
    { vendor: 'Hardware Solutions', orders: 15, value: '₹12L', status: 'Preferred' },
    { vendor: 'Safety First Co', orders: 12, value: '₹8L', status: 'Under Review' },
    { vendor: 'BuildCorp', orders: 10, value: '₹6L', status: 'Approved' },
  ];



  // Export handler
  function handleExport() {
    // Prepare data for export
    const tendersSheet = XLSX.utils.json_to_sheet(tenders.map(t => ({
      ID: t.id,
      Project: t.projectName,
      Client: t.client,
      Value: t.estimatedValue,
      Submission: t.submissionDate,
      Status: t.status,
      Completion: t.completionPercentage,
      Category: t.category,
      Location: t.location,
    })));

    // Example: Vendors (mock data)
    const vendorsSheet = XLSX.utils.json_to_sheet([
      { Name: 'Steel Corp Ltd', Orders: 24, Value: '₹25L', Status: 'Preferred' },
      { Name: 'Cement Industries', Orders: 18, Value: '₹18L', Status: 'Approved' },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, tendersSheet, 'Tenders');
    XLSX.utils.book_append_sheet(wb, vendorsSheet, 'Vendors');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'dashboard-report.xlsx');
  }

  const handleViewDetails = (tender: Tender) => {
    setSelectedTender(tender);
    setShowDetailsModal(true);
  };

  const handleEdit = (tender: Tender) => {
    setSelectedTender(tender);
    setEditedTender({ ...tender });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editedTender) return;

    setTenders(prevTenders =>
      prevTenders.map(t =>
        t.id === editedTender.id ? editedTender : t
      )
    );
    
    setShowEditModal(false);
    setSelectedTender(null);
    setEditedTender(null);
    toast.success("Tender updated successfully!");
  };

  const handleUpdateTenderStatus = async (tenderId: string, newStatus: string) => {
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

      toast.success(`Tender status updated to ${newStatus}`);
      
      // Refresh tenders
      const response = await axios.get(`${API_URL}/tenders`, { headers });
      setTenders(response.data);
    } catch (error) {
      toast.error("Failed to update tender status. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search tenders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under-evaluation">Under Evaluation</SelectItem>
              <SelectItem value="awarded">Awarded</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

   

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {/* <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="active-tenders">Active Tenders</TabsTrigger> */}
          {/* <TabsTrigger value="vehicle-tracking">Vehicle Tracking</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tenders</p>
                    <p className="text-2xl font-bold text-green-600">{tenders.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">+3 this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-blue-600">68%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">+5% vs last quarter</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-purple-600">₹{(totalValue / 10000000).toFixed(1)}Cr</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Pipeline value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Draft Tenders</p>
                    <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Pending completion</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Complete Metro Station bid', deadline: '2 days', priority: 'high' },
                    { action: 'Vendor evaluation for Highway project', deadline: '5 days', priority: 'medium' },
                    { action: 'Cost estimation review', deadline: '1 week', priority: 'low' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.action}</p>
                        <p className="text-xs text-gray-600">Due in {item.deadline}</p>
                      </div>
                      <Badge variant={item.priority === 'high' ? 'destructive' : 
                                    item.priority === 'medium' ? 'outline' : 'default'}>
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { activity: 'Highway Bridge bid submitted', time: '2 hours ago', type: 'success' },
                    { activity: 'New vendor onboarded', time: '1 day ago', type: 'info' },
                    { activity: 'Cost analysis completed', time: '2 days ago', type: 'success' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {item.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.activity}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Bid Accuracy', value: 92, color: 'bg-green-500' },
                    { metric: 'On-time Submission', value: 85, color: 'bg-blue-500' },
                    { metric: 'Cost Competitiveness', value: 78, color: 'bg-yellow-500' }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.metric}</span>
                        <span>{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active-tenders">
          <div className="space-y-6">
            {filteredTenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">{tender.projectName}</h3>
                      <Badge variant={getStatusColor(tender.status)}>
                        {tender.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {/* Approve/Reject buttons for submitted tenders */}
                      {tender.status === "SUBMITTED" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTenderStatus(tender.id, "ACTIVE")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTenderStatus(tender.id, "REJECTED")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(tender)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleEdit(tender)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="font-semibold text-gray-900">₹{(tender.estimatedValue / 10000000).toFixed(1)}Cr</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-semibold text-gray-900">{tender.submissionDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold text-gray-900">{tender.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{tender.location}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{tender.completionPercentage}%</span>
                    </div>
                    <Progress value={tender.completionPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <VendorComparisonTable />
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tender: 'Highway Bridge Renovation', submitted: '2024-05-20', status: 'Under Review', result: 'Pending' },
                  { tender: 'Shopping Complex Foundation', submitted: '2024-05-15', status: 'Evaluated', result: 'Won' },
                  { tender: 'Water Treatment Plant', submitted: '2024-05-10', status: 'Completed', result: 'Lost' },
                  { tender: 'School Building Construction', submitted: '2024-05-05', status: 'Completed', result: 'Won' }
                ].map((submission, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{submission.tender}</p>
                      <p className="text-sm text-gray-600">Submitted: {submission.submitted}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={submission.result === 'Won' ? 'default' : 
                                    submission.result === 'Lost' ? 'destructive' : 'outline'}>
                        {submission.result}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{submission.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Filters and Export */}
          <div className="flex flex-wrap gap-4 items-center">
            <Input type="date" className="w-40" placeholder="From" />
            <Input type="date" className="w-40" placeholder="To" />
            <Select>
              <SelectTrigger className="w-40"><SelectValue placeholder="Project Site" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="site-a">Site A</SelectItem>
                <SelectItem value="site-b">Site B</SelectItem>
                <SelectItem value="site-c">Site C</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline" className="ml-auto" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export Report</Button> */}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsKpis.map((kpi, idx) => (
              <Card key={kpi.label}>
                <CardContent className="p-6 flex items-center gap-4">
                  {kpi.icon}
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart: Vendor Status */}
            <Card>
              <CardHeader><CardTitle>Vendor Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={vendorStatusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {vendorStatusPie.map((entry, idx) => (
                          <Cell key={`cell-vendor-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Pie Chart: Vehicle Status */}
            {/* <Card>
              <CardHeader><CardTitle>Vehicle Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={vehicleStatusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {vehicleStatusPie.map((entry, idx) => (
                          <Cell key={`cell-vehicle-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card> */}
            {/* Bar: Orders by Vendor */}
            <Card>
              <CardHeader><CardTitle>Orders by Vendor (Top 5)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByVendor} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vendor" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Bar: Vehicle Utilization by Project */}
            {/* <Card>
              <CardHeader><CardTitle>Vehicle Utilization by Project</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utilizationByProject} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="project" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="utilization" fill="#6366f1" name="Utilization (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Vendors Table */}
            <Card>
              <CardHeader><CardTitle>Top 5 Vendors by Orders/Value</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left">Vendor</th>
                        <th className="p-2 text-left">Orders</th>
                        <th className="p-2 text-left">Value</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topVendors.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{row.vendor}</td>
                          <td className="p-2">{row.orders}</td>
                          <td className="p-2">{row.value}</td>
                          <td className="p-2">
                            <Badge variant={row.status === 'Preferred' ? 'default' : row.status === 'Approved' ? 'secondary' : 'outline'}>{row.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            {/* Top Vehicles Table */}
            {/* <Card>
              <CardHeader><CardTitle>Top 5 Vehicles by Utilization</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left">Vehicle</th>
                        <th className="p-2 text-left">Utilization (%)</th>
                        <th className="p-2 text-left">Site</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topVehicles.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{row.vehicle}</td>
                          <td className="p-2">{row.utilization}</td>
                          <td className="p-2">{row.site}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>

        
      </Tabs>

      {/* Modals */}
      {selectedTender && showDetailsModal && (
        <TenderDetailsModal
          tender={selectedTender}
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTender(null);
          }}
        />
      )}
      
      {/* Edit Modal */}
      {showEditModal && editedTender && (
        <Dialog open={showEditModal} onOpenChange={() => setShowEditModal(false)}>
          <DialogContent className="max-w-4xl max-h-[80vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Edit Tender</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">Tender ID: {editedTender.id}</p>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="p-6 h-[calc(80vh-8rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Basic Information</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Project Name</Label>
                          <Input
                            value={editedTender.projectName}
                            onChange={(e) => setEditedTender(prev => prev ? { ...prev, projectName: e.target.value } : null)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Client</Label>
                          <Input
                            value={editedTender.client}
                            onChange={(e) => setEditedTender(prev => prev ? { ...prev, client: e.target.value } : null)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Category</Label>
                            <Input
                              value={editedTender.category}
                              onChange={(e) => setEditedTender(prev => prev ? { ...prev, category: e.target.value } : null)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Location</Label>
                            <Input
                              value={editedTender.location}
                              onChange={(e) => setEditedTender(prev => prev ? { ...prev, location: e.target.value } : null)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Project Status</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Current Status</Label>
                          <Select
                            value={editedTender.status}
                            onValueChange={(value: Tender['status']) => 
                              setEditedTender(prev => prev ? { ...prev, status: value } : null)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="under-evaluation">Under Evaluation</SelectItem>
                              <SelectItem value="awarded">Awarded</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-muted-foreground">Completion Percentage</Label>
                            <span className="text-sm font-medium">{editedTender.completionPercentage}%</span>
                          </div>
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={editedTender.completionPercentage}
                            onChange={(e) => setEditedTender(prev => prev ? { ...prev, completionPercentage: Number(e.target.value) } : null)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Financial Details</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Estimated Value (₹)</Label>
                          <div className="relative">
                            <DollarSign className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                            <Input
                              type="number"
                              value={editedTender.estimatedValue}
                              onChange={(e) => setEditedTender(prev => prev ? { ...prev, estimatedValue: Number(e.target.value) } : null)}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Timeline</h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Submission Date</Label>
                          <div className="relative">
                            <Calendar className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                            <Input
                              type="date"
                              value={editedTender.submissionDate}
                              onChange={(e) => setEditedTender(prev => prev ? { ...prev, submissionDate: e.target.value } : null)}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
