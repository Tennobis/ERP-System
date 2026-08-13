import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";

interface MaterialIndentItem {
  slNo: number;
  dateOfOrder?: string;
  materialDescription: string;
  unit: string;
  requiredQty: number;
  receivedQty: number;
  balance: number;
  deliveryDate?: string;
  remarks?: string;
}

interface MaterialIndentData {
  id: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyPostalCode?: string;
  site: string;
  orderSlipNo: string;
  date: string;
  storeKeeperName: string;
  storeKeeperSignature?: string;
  projectManagerName: string;
  projectManagerSignature?: string;
  items: MaterialIndentItem[];
}

// Function to convert image URL to base64
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    if (!url) return null;

    const response = await fetch(url, {
      headers: {
        "Accept": "image/*",
      },
    });
    
    if (!response.ok) {
      console.error("Failed to fetch image:", response.statusText);
      return null;
    }

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.error("Error reading file");
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
}

export async function generateMaterialIndentPDF(
  data: MaterialIndentData
): Promise<void> {
  try {
    // Create PDF in A4 format (portrait)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 7; // Reduced margin to increase width
    const contentWidth = pageWidth - 2 * margin;

    let yPosition = margin + 8; // Increased top padding

    // We'll draw the border later after we know the final content height

    // Helper function to center text
    const centerText = (
      text: string,
      yPos: number,
      fontSize: number = 12,
      fontStyle: "normal" | "bold" = "normal"
    ) => {
      pdf.setFontSize(fontSize);
      if (fontStyle === "bold") {
        pdf.setFont(undefined, "bold");
      } else {
        pdf.setFont(undefined, "normal");
      }
      const textWidth = (pdf.getStringUnitWidth(text) * fontSize) / pdf.internal.scaleFactor;
      const xPosition = (pageWidth - textWidth) / 2;
      pdf.text(text, xPosition, yPos);
    };

    // Company Name (larger, bold, centered)
    const companyName = data.companyName || "RAJ TRIMURTY INFRAPROJECTS PVT LTD";
    centerText(companyName, yPosition, 14, "bold");
    yPosition += 6;

    // Horizontal line after company name
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Company Address (centered)
    const address = data.companyAddress || "SOUTH CITY BUSINESS PARK , 770 ANANDAPUR.";
    centerText(address, yPosition, 10);
    yPosition += 5;

    // Horizontal line after address
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // City and Postal Code (centered)
    const cityPostal = `${data.companyCity || "KOLAKATA"} - ${data.companyPostalCode || "107"}`;
    centerText(cityPostal, yPosition, 10);
    yPosition += 5;

    // Horizontal line
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Order Slip No (centered)
    centerText(`ORDER SLIP NO - ${data.orderSlipNo}`, yPosition, 10);
    yPosition += 5;

    // Horizontal line
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Site and Date line
    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    pdf.text(`SITE : ${data.site}`, margin + 2, yPosition);
    
    const dateText = `DATE : ${new Date(data.date).toLocaleDateString("en-GB")}`;
    const dateWidth = (pdf.getStringUnitWidth(dateText) * 10) / pdf.internal.scaleFactor;
    pdf.text(dateText, pageWidth - margin - dateWidth - 2, yPosition);
    yPosition += 5;

    // Horizontal line
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Header text
    const headerText = "Dear sir, Please Arrange Required Material For SITE WORK,Urgent Basis.";
    pdf.setFontSize(9);
    pdf.text(headerText, margin + 2, yPosition);
    yPosition += 5;

    // Horizontal line before table
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 1;

    // Table headers
    const tableHeaders = [
      "SL NO",
      "DATE OF\nORDER",
      "MATERIAL DESCRIPTION",
      "UNIT",
      "REQUIRED\nQTY",
      "RECEIVED\nQTY",
      "BALANCE",
      "DELEVERY\nDATE",
      "REMARKS",
    ];

    // Prepare table data - dynamic rows based on items
    const tableData = data.items.map((item, index) => [
      (index + 1).toString(),
      item.dateOfOrder ? new Date(item.dateOfOrder).toLocaleDateString("en-GB") : "",
      item.materialDescription || "",
      item.unit || "",
      item.requiredQty?.toString() || "",
      item.receivedQty?.toString() || "",
      item.balance?.toString() || "",
      item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString("en-GB") : "",
      item.remarks || "",
    ]);

    // Use autoTable to create the table
    (pdf as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        textColor: 0,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        halign: "center",
        valign: "middle",
        fontSize: 8.5,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "center", cellWidth: 20 }, // Increased from 18
        2: { halign: "left", cellWidth: 40 }, // Reduced from 50
        3: { halign: "center", cellWidth: 21 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 19 },
        6: { halign: "center", cellWidth: 19 },
        7: { halign: "center", cellWidth: 20 }, // Increased from 18
        8: { halign: "left", cellWidth: 25 }, // Reduced from 31
      },
      theme: 'grid',
    });

    // Get final Y position after table
    const finalY = (pdf as any).lastAutoTable.finalY;
    
    // Draw a horizontal line after table
    pdf.setLineWidth(0.3);
    pdf.line(margin, finalY, pageWidth - margin, finalY);
    
    yPosition = finalY + 25;

    // Signatures section
    const signatureWidth = (contentWidth - 10) / 2;
    const signatureLeftX = margin + 5;
    const signatureCenterLeftX = signatureLeftX + signatureWidth / 2;
    const signatureRightX = margin + 5 + signatureWidth + 10;
    const signatureCenterRightX = signatureRightX + signatureWidth / 2;

    // Download signatures from URLs
    let storeKeeperSig: string | null = null;
    let projectManagerSig: string | null = null;

    if (data.storeKeeperSignature) {
      storeKeeperSig = await imageUrlToBase64(data.storeKeeperSignature);
    }

    if (data.projectManagerSignature) {
      projectManagerSig = await imageUrlToBase64(data.projectManagerSignature);
    }

    // Signature images
    const sigImageHeight = 15;
    const sigImageWidth = 25;
    const signatureTopY = yPosition - 20;

    // Store Keeper Signature (left side - centered)
    if (storeKeeperSig) {
      try {
        const imageType = storeKeeperSig.includes("png") ? "PNG" : "JPEG";
        pdf.addImage(
          storeKeeperSig,
          imageType,
          signatureCenterLeftX - sigImageWidth / 2,
          signatureTopY,
          sigImageWidth,
          sigImageHeight
        );
      } catch (error) {
        console.error("Error adding store keeper signature:", error);
      }
    }

    // Project Manager Signature (right side - centered)
    if (projectManagerSig) {
      try {
        const imageType = projectManagerSig.includes("png") ? "PNG" : "JPEG";
        pdf.addImage(
          projectManagerSig,
          imageType,
          signatureCenterRightX - sigImageWidth / 2,
          signatureTopY,
          sigImageWidth,
          sigImageHeight
        );
      } catch (error) {
        console.error("Error adding project manager signature:", error);
      }
    }

    // Signature labels - centered
    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    
    const storeKeeperLabel = "SIGNATURE OF STORE KEEPER";
    const storeKeeperLabelWidth = (pdf.getStringUnitWidth(storeKeeperLabel) * 9) / pdf.internal.scaleFactor;
    pdf.text(storeKeeperLabel, signatureCenterLeftX - storeKeeperLabelWidth / 2, yPosition);
    
    const projectManagerLabel = "SIGNATURE OF PROJECT MANAGER";
    const projectManagerLabelWidth = (pdf.getStringUnitWidth(projectManagerLabel) * 9) / pdf.internal.scaleFactor;
    pdf.text(projectManagerLabel, signatureCenterRightX - projectManagerLabelWidth / 2, yPosition);

    yPosition += 5;

    // Names - centered, without brackets
    const storeKeeperName = data.storeKeeperName || "NAME";
    const storeKeeperNameWidth = (pdf.getStringUnitWidth(storeKeeperName) * 9) / pdf.internal.scaleFactor;
    pdf.text(storeKeeperName, signatureCenterLeftX - storeKeeperNameWidth / 2, yPosition);
    
    const projectManagerName = data.projectManagerName || "NAME";
    const projectManagerNameWidth = (pdf.getStringUnitWidth(projectManagerName) * 9) / pdf.internal.scaleFactor;
    pdf.text(projectManagerName, signatureCenterRightX - projectManagerNameWidth / 2, yPosition);

    // Draw outer border around all content
    const finalContentHeight = yPosition + 3 - margin; // Add small padding at bottom
    pdf.setLineWidth(0.5);
    pdf.rect(margin, margin, contentWidth, finalContentHeight);

    // Save the PDF
    const fileName = `Material_Indent_${data.orderSlipNo}_${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);

    toast.success("PDF downloaded successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF");
    throw error;
  }
}