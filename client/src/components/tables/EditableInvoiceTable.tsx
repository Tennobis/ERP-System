import React, { useState, useEffect } from 'react';
import { Edit, Eye, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EditInvoiceModal from '@/components/modals/EditInvoiceModal';
import ViewInvoiceModal from '@/components/modals/ViewInvoiceModal';
import { toast } from 'sonner';
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

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
}

// Legacy interface for modal compatibility
interface LegacyInvoice {
  id: string;
  invoiceNumber: string;
  project: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string;
  sentDate: string;
  paymentMethod: string;
}

const EditableInvoiceTable = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<LegacyInvoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/billing/invoices`, { headers })
      .then(res => setInvoices(res.data))
      .catch(() => {});
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return status !== 'Paid' && due < today;
  };

  // Transform new invoice structure to legacy format for modals
  const transformInvoiceForModal = (invoice: Invoice) => {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      project: invoice.project?.name || 'N/A',
      client: invoice.client?.name || 'N/A',
      amount: invoice.total || 0,
      status: invoice.status,
      dueDate: invoice.dueDate,
      sentDate: invoice.date || 'N/A',
      paymentMethod: 'Bank Transfer' // Default value since this field doesn't exist in new structure
    };
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(transformInvoiceForModal(invoice));
    setIsEditModalOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(transformInvoiceForModal(invoice));
    setIsViewModalOpen(true);
  };

  const handleSave = (editedInvoice: any) => {
    // Update the local state - in a real app you'd make an API call here
    setInvoices(invoices.map(invoice => 
      invoice.id === editedInvoice.id ? { ...invoice, ...editedInvoice } : invoice
    ));
    toast.success('Invoice updated successfully!');
  };

  const handleEmailInvoice = (invoice: Invoice) => {
    toast.success(`Invoice ${invoice.id} has been emailed to ${invoice.client?.name || 'client'}`, {
      description: "A copy has been sent to the accounts team."
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Define CSV headers and data
    const headers = [
      'Invoice ID',
      'Invoice Number',
      'Project',
      'Client',
      'Amount (₹)',
      'Status',
      'Due Date',
      'Date Created'
    ];

    const data = [
      invoice.id,
      invoice.invoiceNumber || 'N/A',
      invoice.project?.name || 'N/A',
      invoice.client?.name || 'N/A',
      (invoice.total || 0).toLocaleString('en-IN'),
      invoice.status,
      invoice.dueDate,
      invoice.date || 'N/A'
    ];

    // Create CSV content
    const csvContent = [
      headers.join(','),
      data.join(',')
    ].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.id}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Invoice ${invoice.id} downloaded as CSV`);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Layout */}
      <div className="block lg:hidden space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`border rounded-lg p-4 ${
              isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-50 border-red-200' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-mono text-sm font-medium">{invoice.invoiceNumber}</h4>
                <p className="text-xs text-muted-foreground">{invoice.project?.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{invoice.client?.name || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">₹{(invoice.total || 0).toLocaleString('en-IN')}</p>
                <Badge className={`${getStatusColor(invoice.status)} text-xs`}>
                  {invoice.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <span className="text-muted-foreground">Due Date:</span>
                <p className={`font-medium ${
                  isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600' : ''
                }`}>
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium">
                  {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(invoice)}
                className="flex-1 h-8 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(invoice)}
                className="flex-1 h-8 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEmailInvoice(invoice)}
                className="h-8 px-2"
              >
                <Mail className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvoice(invoice)}
                className="h-8 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-3 text-left">Invoice ID</th>
              <th className="border border-gray-300 p-3 text-left">Project</th>
              <th className="border border-gray-300 p-3 text-left">Client</th>
              <th className="border border-gray-300 p-3 text-left">Amount</th>
              <th className="border border-gray-300 p-3 text-left">Status</th>
              <th className="border border-gray-300 p-3 text-left">Due Date</th>
              <th className="border border-gray-300 p-3 text-left">Date Created</th>
              <th className="border border-gray-300 p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={`hover:bg-gray-50 ${
                  isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-50' : ''
                }`}
              >
                <td className="border border-gray-300 p-3">
                  <span className="font-mono text-[16px]">{invoice.invoiceNumber}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="text-[16px]">{invoice.project?.name || 'N/A'}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="text-[16px]">{invoice.client?.name || 'N/A'}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="font-semibold text-[16px]">
                    ₹{(invoice.total || 0).toLocaleString('en-IN')}
                  </span>
                </td>

                <td className="border border-gray-300 p-3">
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className={`text-[16px] ${
                    isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600 font-semibold' : ''
                  }`}>
                    {invoice.dueDate? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                  </span>
                </td>

                <td className="border border-gray-300 p-3">
                  <span className="text-[16px]">{invoice.date?new Date(invoice.date).toLocaleDateString(): 'N/A'}</span>
                </td>

                <td className="border border-gray-300 p-3">
                  <div className="flex space-x-1">
                    {/* <Button
                      variant="outline"
                      onClick={() => handleEdit(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="outline"
                      onClick={() => handleView(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEmailInvoice(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="h-8 w-8 p-0 [touch-action:manipulation]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditInvoiceModal
        invoice={selectedInvoice}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSave={handleSave}
      />

      <ViewInvoiceModal
        invoice={selectedInvoice}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
};

export default EditableInvoiceTable;
