interface BillingData {
  id: string;
  project: string;
  amount: string;
  status: string;
  date: string;
  client: string;
}

export const exportBillingReport = () => {
  // Sample data - in a real application, this would come from your API or state
  const billingData: BillingData[] = [
    {
      id: 'INV-2024-001',
      project: 'Residential Complex A',
      amount: '₹15,50,000',
      status: 'Paid',
      date: '2024-03-15',
      client: 'Green Valley Developers'
    },
    {
      id: 'INV-2024-002',
      project: 'Office Tower B',
      amount: '₹8,75,000',
      status: 'Pending',
      date: '2024-03-25',
      client: 'Metropolitan Holdings'
    },
    {
      id: 'INV-2024-003',
      project: 'Shopping Mall C',
      amount: '₹22,30,000',
      status: 'Overdue',
      date: '2024-03-10',
      client: 'City Center Corp'
    }
  ];

  // Convert data to CSV format
  const headers = ['Invoice ID', 'Project', 'Amount', 'Status', 'Date', 'Client'];
  const csvData = billingData.map(row => 
    [row.id, row.project, row.amount, row.status, row.date, row.client].join(',')
  );
  
  const csv = [
    headers.join(','),
    ...csvData
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `billing-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportBillingStatement = (invoices: any[]) => {
  // Create CSV content
  const headers = ['Invoice Number', 'Client', 'Amount', 'Status', 'Due Date', 'Paid Date'];
  const rows = invoices.map(inv => [
    inv.invoice,
    inv.client,
    inv.amount,
    inv.status,
    inv.dueDate,
    inv.paidDate || '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `billing_statement_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 