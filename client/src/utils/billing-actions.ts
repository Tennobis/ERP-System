import { toast } from '@/components/ui/use-toast';

interface ProgressInvoice {
  projectId: string;
  completionPercentage: number;
  amount: string;
}

export const createProgressInvoice = async (data: ProgressInvoice) => {
  // In a real application, this would be an API call
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Progress Invoice Created",
      description: `Invoice created for ${data.projectId} at ${data.completionPercentage}% completion`,
    });
    
    return true;
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create progress invoice",
      variant: "destructive",
    });
    return false;
  }
};

export const generateMonthlyReport = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would generate a comprehensive report
    const reportData = {
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      totalInvoices: 15,
      totalAmount: "₹1.2Cr",
      collectionRate: "92%"
    };
    
    // Create and download report
    const reportContent = `Monthly Billing Report - ${reportData.month} ${reportData.year}\n
Total Invoices: ${reportData.totalInvoices}
Total Amount: ${reportData.totalAmount}
Collection Rate: ${reportData.collectionRate}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly-report-${reportData.month.toLowerCase()}-${reportData.year}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report Generated",
      description: `Monthly report for ${reportData.month} ${reportData.year} has been downloaded`,
    });
    
    return true;
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to generate monthly report",
      variant: "destructive",
    });
    return false;
  }
};

export const followUpOverdue = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would send reminders to clients with overdue payments
    const overdueCount = 3;
    
    toast({
      title: "Reminders Sent",
      description: `Payment reminders sent to ${overdueCount} clients with overdue invoices`,
    });
    
    return true;
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to send payment reminders",
      variant: "destructive",
    });
    return false;
  }
};

export const processPayments = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // In a real app, this would process pending payments
    const processedCount = 5;
    const totalAmount = "₹45L";
    
    toast({
      title: "Payments Processed",
      description: `${processedCount} payments processed successfully, total amount: ${totalAmount}`,
    });
    
    return true;
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to process payments",
      variant: "destructive",
    });
    return false;
  }
};

interface ReminderDetails {
  invoiceId: string;
  client: string;
  amount: string;
  dueDate: string;
  reminderCount?: number;
}

export const sendPaymentReminder = async (details: ReminderDetails) => {
  // In a real application, this would make an API call to send an email/notification
  // For now, we'll simulate the API call with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Payment reminder sent for invoice ${details.invoiceId}`);
      console.log(`To: ${details.client}`);
      console.log(`Amount Due: ${details.amount}`);
      console.log(`Due Date: ${details.dueDate}`);
      resolve({
        success: true,
        reminderCount: (details.reminderCount || 0) + 1,
        sentAt: new Date().toISOString()
      });
    }, 1000); // Simulate network delay
  });
}; 