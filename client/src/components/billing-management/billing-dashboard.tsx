import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { DollarSign, Calendar, FileText, TrendingUp, AlertTriangle, Clock, CheckCircle, Plus, Eye, Edit } from "lucide-react";

interface Bill {
  id: string;
  projectName: string;
  client: string;
  billNumber: string;
  amount: number;
  billDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'overdue' | 'disputed';
  type: 'progress' | 'milestone' | 'final' | 'retention';
  workProgress: number;
}

export function BillingDashboard() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const bills: Bill[] = [
    {
      id: 'BILL001',
      projectName: 'Commercial Complex - Phase 1',
      client: 'ABC Developers',
      billNumber: 'INV-2024-001',
      amount: 2500000,
      billDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'paid',
      type: 'progress',
      workProgress: 25
    },
    {
      id: 'BILL002',
      projectName: 'Residential Towers',
      client: 'XYZ Properties',
      billNumber: 'INV-2024-002',
      amount: 4500000,
      billDate: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'approved',
      type: 'milestone',
      workProgress: 50
    },
    {
      id: 'BILL003',
      projectName: 'Infrastructure Development',
      client: 'Government Agency',
      billNumber: 'INV-2024-003',
      amount: 8000000,
      billDate: '2024-01-25',
      dueDate: '2024-02-10',
      status: 'overdue',
      type: 'progress',
      workProgress: 75
    }
  ];

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid': return 'default';
      case 'approved': return 'secondary';
      case 'sent': return 'outline';
      case 'overdue': return 'destructive';
      case 'disputed': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: Bill['type']) => {
    switch (type) {
      case 'milestone': return 'default';
      case 'progress': return 'secondary';
      case 'final': return 'outline';
      case 'retention': return 'outline';
    }
  };

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = bills.filter(b => b.status !== 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueCount = bills.filter(b => b.status === 'overdue').length;

  const filteredBills = bills.filter(bill => {
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    const matchesType = selectedType === 'all' || bill.type === selectedType;
    return matchesStatus && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>Invoice generation, tracking, and payment management</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Generate Report
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Bill
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          {/* Hide tabs on mobile - navigation is handled by sidebar */}
          <TabsList className="hidden md:grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Mobile-specific section header */}
          <div className="md:hidden mb-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Billing Management</h2>
                  <p className="text-xs text-muted-foreground">Invoice generation & payment tracking</p>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Billed</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold">₹{(totalAmount / 10000000).toFixed(1)}Cr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Collected</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold">₹{(paidAmount / 10000000).toFixed(1)}Cr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold">₹{(pendingAmount / 10000000).toFixed(1)}Cr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Overdue</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold">{overdueCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Collection Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collection Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Collection Rate</span>
                    <span className="font-bold text-green-600">{Math.round((paidAmount/totalAmount)*100)}%</span>
                  </div>
                  <Progress value={(paidAmount/totalAmount)*100} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Total Bills</p>
                      <p className="font-semibold">{bills.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Paid Bills</p>
                      <p className="font-semibold">{bills.filter(b => b.status === 'paid').length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Avg Days to Pay</p>
                      <p className="font-semibold">18 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bills.slice(0, 3).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{bill.billNumber}</h4>
                        <p className="text-sm text-muted-foreground">{bill.projectName} • {bill.client}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={getStatusColor(bill.status)}>{bill.status}</Badge>
                          <Badge variant={getTypeColor(bill.type)}>{bill.type}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(bill.amount / 100000).toFixed(1)}L</p>
                        <p className="text-sm text-muted-foreground">Due: {bill.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4 mt-0">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="retention">Retention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bills List */}
            <div className="space-y-3">
              {filteredBills.map((bill) => (
                <Card key={bill.id}>
                  <CardContent className="p-4">
                    {/* Mobile Layout */}
                    <div className="block lg:hidden space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{bill.billNumber}</h4>
                          <p className="text-xs text-muted-foreground">{bill.projectName}</p>
                          <p className="text-xs text-muted-foreground">{bill.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">₹{(bill.amount / 100000).toFixed(1)}L</p>
                          <Badge variant={getStatusColor(bill.status)} className="text-xs">{bill.status}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Progress</p>
                          <div className="flex items-center gap-2">
                            <Progress value={bill.workProgress} className="flex-1 h-2" />
                            <span className="text-xs">{bill.workProgress}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <p className="text-sm font-medium">{bill.dueDate}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 px-2">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-2">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:grid lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2">
                        <h4 className="font-medium text-sm sm:text-base">{bill.billNumber}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{bill.projectName}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{bill.client}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">₹{(bill.amount / 100000).toFixed(1)}L</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <div className="flex items-center gap-2">
                          <Progress value={bill.workProgress} className="flex-1" />
                          <span className="text-sm">{bill.workProgress}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium text-sm sm:text-base">{bill.dueDate}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant={getStatusColor(bill.status)}>{bill.status}</Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2">
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Payment Tracking</CardTitle>
                <CardDescription>Monitor payment receipts and follow-ups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bills.filter(b => b.status !== 'draft').map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{bill.billNumber}</h4>
                        <p className="text-sm text-muted-foreground">{bill.client}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={getStatusColor(bill.status)}>{bill.status}</Badge>
                          <Badge variant="outline">₹{(bill.amount / 100000).toFixed(1)}L</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium">{bill.dueDate}</p>
                        {bill.status === 'overdue' && (
                          <Button variant="destructive" size="sm" className="mt-2">
                            Send Reminder
                          </Button>
                        )}
                        {bill.status === 'approved' && (
                          <Button variant="outline" size="sm" className="mt-2">
                            Follow Up
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: 'January', collected: 85, target: 100 },
                      { month: 'February', collected: 92, target: 100 },
                      { month: 'March', collected: 78, target: 100 }
                    ].map((month) => (
                      <div key={month.month} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{month.month}</span>
                          <span>₹{month.collected}L / ₹{month.target}L</span>
                        </div>
                        <Progress value={(month.collected/month.target)*100} className="h-2" />
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
                      { client: 'ABC Developers', avgDays: 15, paymentRate: 95 },
                      { client: 'XYZ Properties', avgDays: 22, paymentRate: 88 },
                      { client: 'Government Agency', avgDays: 45, paymentRate: 100 }
                    ].map((client) => (
                      <div key={client.client} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm">{client.client}</h4>
                        <div className="flex justify-between mt-2 text-xs">
                          <span>Avg Payment: {client.avgDays} days</span>
                          <span>Success Rate: {client.paymentRate}%</span>
                        </div>
                        <Progress value={client.paymentRate} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
