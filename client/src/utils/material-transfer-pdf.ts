import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";

interface TransferItem {
    itemCode: string;
    itemName: string;
    quantity: number;
    unit: string | null;
    type: string;
    description?: string;
}

// Map enum unit values to display labels
const UNIT_LABELS: Record<string, string> = {
    'CUBIC_FEET': 'Cubic Feet',
    'M_CUBE': 'Metre Cube',
    'SQUARE_FEET': 'Square Feet',
    'TONNE': 'Tonne',
    'PIECE': 'Piece',
    'LITRE': 'Litre',
    'KILOGRAM': 'Kilogram',
    'BOX': 'Box',
    'ROLL': 'Roll',
    'SHEET': 'Sheet',
    'HOURS': 'Hours',
    'DAYS': 'Days',
    'LUMPSUM': 'Lump Sum',
};

interface MaterialTransferData {
    id: string;
    transferID: string;
    fromLocation: string;
    toLocation: string;
    fromUserId?: string;
    toUserId?: string;
    requestedDate: string;
    status: string;
    driverName?: string;
    etaMinutes?: number;
    vehicleName?: string;
    vehicleReg?: string;
    approvedByName?: string;
    priority?: string;
    items: TransferItem[];
    notes?: string;
    authorisedSignature?: string;
    companyName?: string;
    companyAddress?: string;
    companyCity?: string;
    companyPostalCode?: string;
    fromUserName?: string;
    toUserName?: string;
}

// Function to convert image URL to base64 or return if already base64
async function imageUrlToBase64(url: string): Promise<string | null> {
    try {
        if (!url) return null;

        // Check if it's already a data URL (base64)
        if (url.startsWith("data:")) {
            console.log("URL is already base64 data URL");
            return url;
        }

        console.log("Fetching image from URL:", url);
        
        // Try with no-cors mode first, then fallback to regular fetch
        try {
            const response = await fetch(url, {
                mode: "cors",
                credentials: "include",
                headers: {
                    "Accept": "image/*",
                },
            });

            if (!response.ok) {
                console.error("Failed to fetch image with CORS:", response.statusText);
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log("Successfully converted image to base64");
                    resolve(reader.result as string);
                };
                reader.onerror = () => {
                    console.error("Error reading file");
                    resolve(null);
                };
                reader.readAsDataURL(blob);
            });
        } catch (corsError) {
            console.warn("CORS fetch failed, trying without CORS:", corsError);
            // Fallback: try without credentials
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error("Fallback fetch also failed:", response.statusText);
                return null;
            }

            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log("Successfully converted image to base64 (fallback)");
                    resolve(reader.result as string);
                };
                reader.onerror = () => {
                    console.error("Error reading file");
                    resolve(null);
                };
                reader.readAsDataURL(blob);
            });
        }
    } catch (error) {
        console.error("Error converting image to base64:", error);
        return null;
    }
}

export async function generateMaterialTransferPDF(
    data: MaterialTransferData
): Promise<void> {
    try {
        // Validate essential data
        if (!data) {
            throw new Error("No transfer data provided");
        }

        if (!data.items) {
            data.items = [];
        }

        console.log("Generating PDF with data:", data);

        // Create PDF in A4 format (portrait)
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin;

        let yPosition = margin + 5;

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

        // Title
        centerText("DELIVERY CHALAN", yPosition, 16, "bold");
        yPosition += 8;

        // Horizontal line
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Header info in two columns
        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");

        // Left column
        pdf.text(`Transfer ID: ${data.transferID}`, margin + 2, yPosition);
        pdf.text(
            `Date: ${new Date(data.requestedDate).toLocaleDateString("en-GB")}`,
            margin + 2,
            yPosition + 6
        );
        pdf.text(`Status: ${data.status}`, margin + 2, yPosition + 12);
        pdf.text(`Priority: ${data.priority || "-"}`, margin + 2, yPosition + 18);

        // Right column
        const rightColX = pageWidth / 2;
        pdf.text(`Company: ${data.companyName || "-"}`, rightColX, yPosition);
        pdf.text(
            `Address: ${data.companyAddress || "-"}`,
            rightColX,
            yPosition + 6
        );
        pdf.text(
            `City: ${data.companyCity || "-"}`,
            rightColX,
            yPosition + 12
        );

        yPosition += 25;

        // Horizontal line
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Location details
        pdf.setFontSize(9);
        pdf.setFont(undefined, "bold");
        pdf.text("From Location:", margin + 2, yPosition);
        pdf.setFont(undefined, "normal");
        pdf.text(data.fromLocation || "-", margin + 2, yPosition + 5);

        pdf.setFont(undefined, "bold");
        pdf.text("To Location:", margin + 2, yPosition + 12);
        pdf.setFont(undefined, "normal");
        pdf.text(data.toLocation || "-", margin + 2, yPosition + 17);

        // Driver and Vehicle info (right side)
        pdf.setFont(undefined, "bold");
        pdf.text("Driver:", rightColX, yPosition);
        pdf.setFont(undefined, "normal");
        pdf.text(data.driverName || "-", rightColX, yPosition + 5);

        pdf.setFont(undefined, "bold");
        pdf.text("Vehicle:", rightColX, yPosition + 12);
        pdf.setFont(undefined, "normal");
        const vehicleInfo = data.vehicleName ? `${data.vehicleName} (${data.vehicleReg || ""})` : "-";
        pdf.text(vehicleInfo, rightColX, yPosition + 17);

        yPosition += 28;

        // ETA and Approved info
        pdf.setFont(undefined, "bold");
        pdf.text("ETA:", margin + 2, yPosition);
        pdf.setFont(undefined, "normal");
        const etaText = data.etaMinutes ? `${(data.etaMinutes / 60).toFixed(1)} hours` : "-";
        pdf.text(etaText, margin + 2, yPosition + 5);

        pdf.setFont(undefined, "bold");
        pdf.text("Approved By:", rightColX, yPosition);
        pdf.setFont(undefined, "normal");
        pdf.text(data.approvedByName || "-", rightColX, yPosition + 5);

        yPosition += 15;

        // Horizontal line before table
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 2;

        // Items Table
        const tableHeaders = [
            "S.No",
            "Item Code",
            "Item Name",
            "Type",
            "Qty",
            "Unit",
        ];

        console.log("Processing items for table, total items:", data.items?.length || 0);

        const tableData = (data.items && Array.isArray(data.items) ? data.items : []).map((item: any, index: number) => {
            try {
                console.log(`========== ITEM ${index} DETAILS ==========`);
                console.log("Full item object:", JSON.stringify(item, null, 2));
                console.log("itemCode:", item?.itemCode);
                console.log("itemName:", item?.itemName);
                console.log("quantity:", item?.quantity);
                console.log("unit:", item?.unit);
                console.log("unit type:", typeof item?.unit);
                console.log("type:", item?.type);
                console.log("description:", item?.description);

                // Get unit label from enum mapping or use the value as-is
                let unitDisplay = "-";
                if (item?.unit !== null && item?.unit !== undefined && item?.unit !== "") {
                    console.log("Unit found, mapping from:", item.unit);
                    unitDisplay = UNIT_LABELS[item.unit] || item.unit;
                    console.log("Unit mapped to:", unitDisplay);
                } else {
                    console.log("No unit found in item, unit value is:", item?.unit);
                }

                const row = [
                    (index + 1).toString(),
                    item?.itemCode || item?.code || "-",
                    item?.itemName || item?.name || item?.description || "-",
                    item?.type || "-",
                    item?.quantity ? item.quantity.toString() : "0",
                    unitDisplay,
                ];
                console.log("Table row:", row);
                console.log("========== END ITEM ${index} ==========");
                return row;
            } catch (e) {
                console.error("Error processing item:", item, e);
                return [(index + 1).toString(), "-", "-", "-", "0", "-"];
            }
        });

        console.log("Final table data:", tableData);

        if (tableData.length === 0) {
            console.log("No items found, adding empty row");
            tableData.push(["1", "-", "No items", "-", "0", "-"]);
        }

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
                fillColor: [220, 220, 220],
                textColor: 0,
                fontStyle: "bold",
                lineColor: [0, 0, 0],
                lineWidth: 0.3,
                halign: "center",
                valign: "middle",
                fontSize: 9,
            },
            columnStyles: {
                0: { halign: "center" },
                1: { halign: "center" },
                2: { halign: "left" },
                3: { halign: "center" },
                4: { halign: "center" },
                5: { halign: "center" },
            },
            theme: "grid",
        });

        // Get final Y position after table
        const finalY = (pdf as any).lastAutoTable.finalY;
        yPosition = finalY + 8;

        // Notes section
        if (data.notes) {
            pdf.setFont(undefined, "bold");
            pdf.setFontSize(9);
            pdf.text("Notes:", margin + 2, yPosition);
            pdf.setFont(undefined, "normal");

            const noteLines = pdf.splitTextToSize(data.notes, contentWidth - 4);
            pdf.text(noteLines, margin + 2, yPosition + 5);
            yPosition += noteLines.length * 4 + 5;
        }

        // Signature section
        yPosition += 10;

        console.log("Adding signature, data.authorisedSignature:", data.authorisedSignature);
        console.log("Signature is truthy?", !!data.authorisedSignature);
        console.log("Signature is empty string?", data.authorisedSignature === "");
        console.log("Signature is null?", data.authorisedSignature === null);
        console.log("Signature is undefined?", data.authorisedSignature === undefined);
        console.log("Signature length:", data.authorisedSignature?.length);

        // Add signature image if available (check for empty string too)
        if (data.authorisedSignature && data.authorisedSignature !== "" && data.authorisedSignature.length > 0) {
            try {
                console.log("Attempting to fetch and convert signature image");
                const signatureBase64 = await imageUrlToBase64(data.authorisedSignature);
                console.log("Signature base64 result:", signatureBase64 ? "success" : "failed");
                console.log("Signature base64 length:", signatureBase64?.length);

                if (signatureBase64) {
                    try {
                        // Determine image type from base64 data
                        let imageType = "JPEG";
                        if (signatureBase64.includes("data:image/png")) {
                            imageType = "PNG";
                        } else if (signatureBase64.includes("data:image/jpeg") || signatureBase64.includes("data:image/jpg")) {
                            imageType = "JPEG";
                        }
                        console.log("Adding image as type:", imageType);
                        
                        pdf.addImage(
                            signatureBase64,
                            imageType,
                            margin + 2,
                            yPosition,
                            30,
                            15
                        );
                        console.log("Image added successfully to PDF");
                        pdf.setFont(undefined, "normal");
                        pdf.setFontSize(8);
                        pdf.text("Authorized Signature", margin + 10, yPosition + 18);
                    } catch (imageError) {
                        console.error("Error adding image to PDF:", imageError);
                        // Draw placeholder line instead
                        pdf.setLineWidth(0.5);
                        pdf.line(margin + 2, yPosition + 15, margin + 40, yPosition + 15);
                        pdf.setFont(undefined, "normal");
                        pdf.setFontSize(8);
                        pdf.text("Authorized Signature", margin + 10, yPosition + 18);
                    }
                } else {
                    console.log("Failed to convert signature image, drawing placeholder");
                    // Draw placeholder line instead
                    pdf.setLineWidth(0.5);
                    pdf.line(margin + 2, yPosition + 15, margin + 40, yPosition + 15);
                    pdf.setFont(undefined, "normal");
                    pdf.setFontSize(8);
                    pdf.text("Authorized Signature", margin + 10, yPosition + 18);
                }
            } catch (error) {
                console.error("Error processing signature:", error);
                // Draw placeholder line instead
                pdf.setLineWidth(0.5);
                pdf.line(margin + 2, yPosition + 15, margin + 40, yPosition + 15);
                pdf.setFont(undefined, "normal");
                pdf.setFontSize(8);
                pdf.text("Authorized Signature", margin + 10, yPosition + 18);
            }
        } else {
            console.log("No signature available, drawing placeholder");
            // Draw placeholder line
            pdf.setLineWidth(0.5);
            pdf.line(margin + 2, yPosition + 15, margin + 40, yPosition + 15);
            pdf.setFont(undefined, "normal");
            pdf.setFontSize(8);
            pdf.text("Authorized Signature", margin + 10, yPosition + 18);
        }

        // Save the PDF
        try {
            const fileName = `Material_Transfer_${data.transferID || data.id || "Transfer"}_${new Date().toISOString().split("T")[0]}.pdf`;
            console.log("Saving PDF with filename:", fileName);
            pdf.save(fileName);
            toast.success("PDF downloaded successfully");
        } catch (saveError) {
            console.error("Error saving PDF file:", saveError);
            toast.error("Error saving PDF file");
            throw saveError;
        }
    } catch (error) {
        console.error("Error generating PDF:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        toast.error("Failed to generate PDF: " + errorMessage);
        throw error;
    }
}
