import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface ProgressInvoiceData {
  projectId: string;
  project: string;
  completed: number;
  billed: number;
  totalAmount: number;
  clientName: string;
  address: string;
}

export const generateProgressInvoicePDF = (invoice: ProgressInvoiceData) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();
  const invoiceNumber = `PROG-INV-${invoice.projectId}-${Date.now().toString().slice(-4)}`;

  // Add company logo/header
  doc.setFontSize(20);
  doc.text('NEXUS FLOW CONSTRUCTION', 105, 20, { align: 'center' });

  // Add invoice details
  doc.setFontSize(12);
  doc.text('PROGRESS INVOICE', 105, 30, { align: 'center' });
  doc.text(`Invoice Number: ${invoiceNumber}`, 15, 40);
  doc.text(`Date: ${currentDate}`, 15, 47);

  // Add client details
  doc.text('Bill To:', 15, 60);
  doc.setFontSize(11);
  doc.text(invoice.clientName, 15, 67);
  doc.text(invoice.address, 15, 74);

  // Add project details
  doc.setFontSize(12);
  doc.text('Project Details:', 15, 90);
  doc.setFontSize(11);
  doc.text(`Project: ${invoice.project}`, 15, 97);
  doc.text(`Completion: ${invoice.completed}%`, 15, 104);
  doc.text(`Previously Billed: ${invoice.billed}%`, 15, 111);

  // Calculate billing details
  const currentBilling = invoice.completed - invoice.billed;
  const billingAmount = (invoice.totalAmount * (currentBilling / 100));

  // Add billing table
  const tableData = [
    ['Description', 'Percentage', 'Amount'],
    [
      'Current Progress Billing',
      `${currentBilling}%`,
      `Rs ${(billingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ],
    [
      'Total Amount Due',
      '',
      `Rs ${(billingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]
  ];

  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    startY: 120,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] }
  });

  // Add terms and notes
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.text('Terms and Conditions:', 15, finalY + 20);
  doc.setFontSize(10);
  doc.text('1. Payment is due within 30 days', 15, finalY + 27);
  doc.text('2. Please include invoice number in payment reference', 15, finalY + 34);
  doc.text('3. This is a computer-generated invoice', 15, finalY + 41);

  return doc;
};

export const downloadProgressInvoice = async (invoice: ProgressInvoiceData) => {
  try {
    const doc = generateProgressInvoicePDF(invoice);
    const pdfBlob = doc.output('blob');
    const fileName = `Progress_Invoice_${invoice.projectId}_${new Date().toISOString().split('T')[0]}.pdf`;
    saveAs(pdfBlob, fileName);
    return true;
  } catch (error) {
    console.error('Error generating invoice:', error);
    return false;
  }
}; 