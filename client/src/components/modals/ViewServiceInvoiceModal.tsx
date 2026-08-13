import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  Calculator,
  Hash,
  Globe
} from "lucide-react";
import { ServiceInvoice } from "@/types/service-invoice";

interface ViewServiceInvoiceModalProps {
  invoice: ServiceInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewServiceInvoiceModal = ({ invoice, isOpen, onClose }: ViewServiceInvoiceModalProps) => {
  if (!invoice) return null;

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

  const DetailRow = ({
    label,
    value,
    icon: Icon
  }: {
    label: string;
    value: string | number;
    icon?: React.ElementType;
  }) => (
    <div className="flex items-center gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <div className="flex-1">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <div className="font-medium">
          {typeof value === 'number' ? formatCurrency(value) : (value || 'N/A')}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Service Invoice Details</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {invoice.header.invoiceNumber}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 pb-4">
            {/* Header Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Invoice Header
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow
                  label="Invoice Date"
                  value={new Date(invoice.header.invoiceDate).toLocaleDateString()}
                  icon={Calendar}
                />
                <DetailRow
                  label="State"
                  value={`${invoice.header.state} (${invoice.header.stateCode})`}
                  icon={Globe}
                />
                {invoice.header.raBillNumber && (
                  <DetailRow
                    label="R/A Bill Number"
                    value={invoice.header.raBillNumber}
                    icon={FileText}
                  />
                )}
                <DetailRow
                  label="Unique Identifier"
                  value={invoice.header.uniqueIdentifier}
                />
                {invoice.header.workOrderDate && (
                  <DetailRow
                    label="Work Order Date"
                    value={new Date(invoice.header.workOrderDate).toLocaleDateString()}
                    icon={Calendar}
                  />
                )}
              </div>
            </div>

            {/* Receiver Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Receiver Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow label="Name" value={invoice.receiver.name} />
                <DetailRow label="GSTIN" value={invoice.receiver.gstin} />
                <DetailRow
                  label="State"
                  value={`${invoice.receiver.state} (${invoice.receiver.stateCode})`}
                />
                <div className="md:col-span-2">
                  <DetailRow
                    label="Address"
                    value={invoice.receiver.address}
                    icon={MapPin}
                  />
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Project Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow label="Project Name" value={invoice.project.name} />
                <DetailRow label="Service Rendered At" value={invoice.project.serviceRenderedAt} />
                <DetailRow label="GSTIN" value={invoice.project.gstin} />
                <DetailRow
                  label="State"
                  value={`${invoice.project.state} (${invoice.project.stateCode})`}
                />
                <div className="md:col-span-2">
                  <DetailRow
                    label="Project Address"
                    value={invoice.project.address}
                    icon={MapPin}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            {invoice.lineItems.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Line Items ({invoice.lineItems.length})
                </h3>
                <div className="space-y-3">
                  {invoice.lineItems.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.description}</h4>
                          {item.category && (
                            <Badge variant="outline" className="mt-1">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(item.amountPresent)}
                          </div>
                          <div className="text-sm text-muted-foreground">Present</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Unit:</span>
                          <div className="font-medium">{item.unit}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rate:</span>
                          <div className="font-medium">{formatCurrency(item.rate)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qty Present:</span>
                          <div className="font-medium">{item.quantityPresent}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qty Cumulative:</span>
                          <div className="font-medium">{item.quantityCumulative}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {invoice.summary && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Invoice Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Previous Amount</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Taxable:</span>
                        <span className="font-medium">{formatCurrency(invoice.summary.taxableValuePrevious)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Deduction:</span>
                        <span className="font-medium">{formatCurrency(invoice.summary.deductionAmountPrevious)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.summary.payableAmountRoundedPrevious)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <h4 className="font-medium text-sm text-blue-700 mb-2">Present Amount</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Taxable:</span>
                        <span className="font-medium">{formatCurrency(invoice.summary.taxableValuePresent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Deduction:</span>
                        <span className="font-medium">{formatCurrency(invoice.summary.deductionAmountPresent)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold text-blue-700">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.summary.payableAmountRoundedPresent)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <h4 className="font-medium text-sm text-green-700 mb-2">Cumulative Amount</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Taxable:</span>
                        <span className="font-medium">{formatCurrency(invoice.summary.taxableValueCumulative)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Deduction:</span>
                        <span className="font-medium">{formatCurrency(invoice.summary.deductionAmountCumulative)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold text-green-700">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.summary.payableAmountRoundedCumulative)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {invoice.summary.deductionRate > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="text-sm text-yellow-800">
                      Deduction Rate: {(invoice.summary.deductionRate * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Audit Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Audit Trail</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow
                  label="Created At"
                  value={new Date(invoice.createdAt).toLocaleDateString()}
                  icon={Calendar}
                />
                <DetailRow
                  label="Last Updated"
                  value={new Date(invoice.updatedAt).toLocaleDateString()}
                  icon={Calendar}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full md:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
