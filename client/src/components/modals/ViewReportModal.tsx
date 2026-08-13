import React, { useState } from 'react';
import { downloadDPRPDF } from '@/utils/dpr-pdf-generator';
import { toast } from 'sonner';

export const ViewReportModal = ({ dprData }: { dprData: any }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!dprData) {
      toast.error('No DPR data available');
      return;
    }

    setIsDownloading(true);
    try {
      await downloadDPRPDF(dprData);
      toast.success('DPR downloaded as PDF successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    handleDownloadPDF,
    isDownloading,
  };
};
