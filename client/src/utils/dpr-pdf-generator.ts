import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export interface DPRData {
    id: string;
    dprNo: string;
    date: string | Date;
    projectName: string;
    developer: string;
    contractor: string;
    pmc?: string;
    weatherCondition?: string;
    majorHindrances?: string;
    actionTaken?: string;

    // Work items data
    workItems?: Array<{
        slNo: number;
        category: string;
        description: string;
        unit: string;
        boqQuantity: number;
        alreadyExecuted: number;
        todaysProgram: number;
        yesterdayAchievement: number;
        cumulativeQuantity: number;
        balanceQuantity: number;
        remarks?: string;
    }>;

    // Resources data
    resources?: Array<{
        resourceType: string;
        name: string;
        actualCount?: number;
        plannedCount?: number;
        availability?: string;
        remarks?: string;
    }>;

    // Remarks
    remarks?: Array<{
        category: string;
        remarkText?: string;
    }>;

    createdAt?: string | Date;
}

const generatePDFDocument = (dpr: DPRData): jsPDF => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let currentY = margin;

    // Set default font
    doc.setFont('Helvetica');

    // ==================== HEADER ====================
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('DAILY PROGRESS REPORT', pageWidth / 2, currentY + 5, { align: 'center' });

    currentY += 12;
    doc.setDrawColor(0);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 3;

    // Report Details Header Table
    const headerData = [
        ['NAME OF THE PROJECT:', dpr.projectName || ''],
        ['DEVELOPER:', dpr.developer || ''],
        ['CONTRACTOR:', dpr.contractor || ''],
        ['PMC:', dpr.pmc || ''],
    ];

    const reportNoDate = [
        ['DPR NO:', dpr.dprNo || ''],
        ['DATE:', dpr.date ? new Date(dpr.date).toLocaleDateString('en-IN') : ''],
    ];

    // Draw header information
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    headerData.forEach((row, index) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(row[0], margin + 1, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(row[1], margin + 50, currentY);
        currentY += 6;
    });

    currentY += 2;

    reportNoDate.forEach((row) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(row[0], margin + 1, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(row[1], margin + 50, currentY);
        currentY += 6;
    });

    currentY += 3;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Weather Condition
    if (dpr.weatherCondition) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Weather Condition:', margin, currentY);

        const weatherOptions = ['Clear', 'Cloudy', 'Other / Rainy Day'];
        let weatherX = margin + 50;
        weatherOptions.forEach((option) => {
            const isSelected = dpr.weatherCondition === option;
            doc.setDrawColor(0);
            doc.rect(weatherX, currentY - 3, 3, 3);
            if (isSelected) {
                doc.setFillColor(255, 255, 0); // Yellow for checked
                doc.rect(weatherX, currentY - 3, 3, 3, 'F');
            }
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(option, weatherX + 5, currentY);
            weatherX += 35;
        });
        currentY += 8;
    }

    currentY += 3;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // ==================== WORK ITEMS TABLE ====================
    if (dpr.workItems && dpr.workItems.length > 0) {
        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        doc.text('WORK PROGRESS DETAILS', margin, currentY);
        currentY += 8;

        const tableColumns = [
            'Sl. No',
            'Description of Work',
            'BOQ Qty',
            'Already Executed',
            'Todays Program',
            'Yesterday Achievement',
            'Cumulative Qty',
            'Balance Qty',
            'Remarks',
        ];

        const tableData = dpr.workItems.map((item, idx) => [
            item.slNo?.toString() || (idx + 1).toString(),
            item.description || '',
            item.boqQuantity?.toString() || '0',
            item.alreadyExecuted?.toString() || '0',
            item.todaysProgram?.toString() || '0',
            item.yesterdayAchievement?.toString() || '0',
            item.cumulativeQuantity?.toString() || '0',
            item.balanceQuantity?.toString() || '0',
            item.remarks || '',
        ]);

        doc.setFontSize(8);
        (doc as any).autoTable({
            startY: currentY,
            head: [tableColumns],
            body: tableData,
            margin: margin,
            didDrawPage: () => { },
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center',
                valign: 'middle',
            },
            bodyStyles: {
                fontSize: 7,
                valign: 'top',
            },
            columnStyles: {
                0: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' },
                7: { halign: 'right' },
            },
        });

        currentY = (doc as any).lastAutoTable.finalY + 5;

        // Check if we need a new page
        if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = margin;
        }
    }

    // ==================== LABOUR & MACHINERIES DETAILS ====================
    if (dpr.resources && dpr.resources.length > 0) {
        // Separate resources by type
        const manpowerResources = dpr.resources.filter((r: any) => r.resourceType === 'MANPOWER');
        const equipmentResources = dpr.resources.filter((r: any) => r.resourceType === 'EQUIPMENT');
        const staffResources = dpr.resources.filter((r: any) => r.resourceType === 'STAFF');

        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        doc.text('LABOUR & MACHINERIES DETAILS', margin, currentY);
        currentY += 8;

        // Manpower table
        if (manpowerResources.length > 0) {
            doc.setFontSize(9);
            doc.setFont('Helvetica', 'bold');
            doc.text('Manpower:', margin, currentY);
            currentY += 6;

            const manpowerColumns = ['Name/Description', 'Hours Worked', 'Planned', 'Remarks'];
            const manpowerData = manpowerResources.map((resource: any) => [
                resource.name || '',
                resource.actualCount?.toString() || '-',
                resource.plannedCount?.toString() || '-',
                resource.remarks || '-',
            ]);

            doc.setFontSize(8);
            (doc as any).autoTable({
                startY: currentY,
                head: [manpowerColumns],
                body: manpowerData,
                margin: margin,
                didDrawPage: () => { },
                headStyles: {
                    fillColor: [100, 100, 100],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8,
                },
                bodyStyles: {
                    fontSize: 7,
                },
            });

            currentY = (doc as any).lastAutoTable.finalY + 5;
        }

        // Equipment table
        if (equipmentResources.length > 0) {
            doc.setFontSize(9);
            doc.setFont('Helvetica', 'bold');
            doc.text('Equipment & Machineries:', margin, currentY);
            currentY += 6;

            const equipmentColumns = ['Equipment Name', 'Quantity', 'Remarks'];
            const equipmentData = equipmentResources.map((resource: any) => [
                resource.name || '',
                resource.actualCount?.toString() || '-',
                resource.remarks || '-',
            ]);

            doc.setFontSize(8);
            (doc as any).autoTable({
                startY: currentY,
                head: [equipmentColumns],
                body: equipmentData,
                margin: margin,
                didDrawPage: () => { },
                headStyles: {
                    fillColor: [100, 100, 100],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8,
                },
                bodyStyles: {
                    fontSize: 7,
                },
            });

            currentY = (doc as any).lastAutoTable.finalY + 5;
        }

        // Staff table
        if (staffResources.length > 0) {
            doc.setFontSize(9);
            doc.setFont('Helvetica', 'bold');
            doc.text('Staff:', margin, currentY);
            currentY += 6;

            const staffColumns = ['Position', 'Count'];
            const staffData = staffResources.map((resource: any) => [
                resource.name || '',
                resource.actualCount?.toString() || '-',
            ]);

            doc.setFontSize(8);
            (doc as any).autoTable({
                startY: currentY,
                head: [staffColumns],
                body: staffData,
                margin: margin,
                didDrawPage: () => { },
                headStyles: {
                    fillColor: [100, 100, 100],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8,
                },
                bodyStyles: {
                    fontSize: 7,
                },
            });

            currentY = (doc as any).lastAutoTable.finalY + 5;
        }

        // Check if we need a new page
        if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = margin;
        }
    }

    // ==================== ADDITIONAL SECTIONS ====================
    if (dpr.majorHindrances && dpr.majorHindrances.trim()) {
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.text('Major Hindrances:', margin, currentY);
        currentY += 4;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        const hindText = doc.splitTextToSize(dpr.majorHindrances, pageWidth - 2 * margin);
        doc.text(hindText, margin, currentY);
        currentY += hindText.length * 4 + 3;

        if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = margin;
        }
    }

    if (dpr.actionTaken && dpr.actionTaken.trim()) {
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.text('Action Taken:', margin, currentY);
        currentY += 4;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        const actionText = doc.splitTextToSize(dpr.actionTaken, pageWidth - 2 * margin);
        doc.text(actionText, margin, currentY);
        currentY += actionText.length * 4 + 3;

        if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = margin;
        }
    }

    // ==================== REMARKS ====================
    if (dpr.remarks && dpr.remarks.length > 0) {
        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        doc.text('REMARKS & ISSUES REPORTED', margin, currentY);
        currentY += 8;

        const remarksTableColumns = ['Category', 'Details'];
        const remarksTableData = dpr.remarks.map((remark) => [
            remark.category || '',
            remark.remarkText || '',
        ]);

        doc.setFontSize(8);
        (doc as any).autoTable({
            startY: currentY,
            head: [remarksTableColumns],
            body: remarksTableData,
            margin: margin,
            didDrawPage: () => { },
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center',
            },
            bodyStyles: {
                fontSize: 7,
                valign: 'top',
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 'auto' },
            },
        });

        currentY = (doc as any).lastAutoTable.finalY + 5;

        // Check if we need a new page
        if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = margin;
        }
    }

    // ==================== FOOTER ====================
    const finalY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    doc.text(
        `Generated on ${new Date().toLocaleString('en-IN')} | DPR No: ${dpr.dprNo}`,
        margin,
        finalY,
    );

    return doc;
};

export const generateDPRPDF = (dpr: DPRData): jsPDF => {
    return generatePDFDocument(dpr);
};

export const downloadDPRPDF = async (dpr: DPRData) => {
    try {
        const doc = generatePDFDocument(dpr);
        const pdfBlob = doc.output('blob');
        const fileName = `DPR_${dpr.dprNo}_${new Date().toISOString().split('T')[0]}.pdf`;
        saveAs(pdfBlob, fileName);
        return true;
    } catch (error) {
        console.error('Error generating DPR PDF:', error);
        throw error;
    }
};
