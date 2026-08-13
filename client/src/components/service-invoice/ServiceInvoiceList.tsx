import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Calendar,
  Building2,
  MapPin,
  Calculator
} from "lucide-react";
import { ServiceInvoice } from "@/types/service-invoice";
import { ServiceInvoiceModal } from "@/components/modals/ServiceInvoiceModal";
import { ViewServiceInvoiceModal } from "@/components/modals/ViewServiceInvoiceModal";

interface ServiceInvoiceListProps {
  invoices: ServiceInvoice[];
  onInvoiceUpdate: (invoice: ServiceInvoice) => void;
  onInvoiceCreate: (invoice: ServiceInvoice) => void;
  projectId?: string;
  clientId?: string;
}

export const ServiceInvoiceList: React.FC<ServiceInvoiceListProps> = ({
  invoices,
  onInvoiceUpdate,
  onInvoiceCreate,
  projectId,
  clientId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ServiceInvoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<ServiceInvoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.header.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'secondary';
      case 'sent': return 'default';
      case 'approved': return 'outline';
      case 'paid': return 'default';
      default: return 'secondary';
    }
  };

  const handleEditInvoice = (invoice: ServiceInvoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleViewInvoice = (invoice: ServiceInvoice) => {
    setViewingInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingInvoice(null);
  };

  const handleModalSave = (invoice: ServiceInvoice) => {
    if (editingInvoice) {
      onInvoiceUpdate(invoice);
    } else {
      onInvoiceCreate(invoice);
    }
    handleModalClose();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || isNaN(amount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Invoices</h2>
          <p className="text-muted-foreground">Manage service invoices for projects</p>
        </div>
        <Button onClick={handleCreateInvoice} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Invoice Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{invoice.header.invoiceNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice.header.raBillNumber && `R/A Bill: ${invoice.header.raBillNumber}`}
                        </p>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(invoice.summary?.payableAmountRoundedCumulative || 0)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Receiver:</span>
                          <span>{invoice.receiver.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Project:</span>
                          <span>{invoice.project.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Date:</span>
                          <span>{new Date(invoice.header.invoiceDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">GSTIN:</span>
                          <span>{invoice.receiver.gstin}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Service At:</span>
                          <span>{invoice.project.serviceRenderedAt}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Items:</span>
                          <span>{invoice.lineItems.length} line items</span>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Summary */}
                    {invoice.lineItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Line Items Summary:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="font-medium">Previous Amount</div>
                            <div className="text-lg font-semibold">
                              {formatCurrency(invoice.summary?.taxableValuePrevious || 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="font-medium">Present Amount</div>
                            <div className="text-lg font-semibold">
                              {formatCurrency(invoice.summary?.taxableValuePresent || 0)}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="font-medium">Total Amount</div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(invoice.summary?.payableAmountRoundedCumulative || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[100px]">
                    <div className="flex gap-2">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4 mr-0" />
                        View
                      </Button>
                    </div>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No service invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No invoices match your current filters.'
                  : 'Create your first service invoice to get started.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={handleCreateInvoice} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Service Invoice
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ServiceInvoiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        projectId={projectId}
        clientId={clientId}
        initialData={editingInvoice || undefined}
      />

      <ViewServiceInvoiceModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        invoice={viewingInvoice}
      />
    </div>
  );
};
