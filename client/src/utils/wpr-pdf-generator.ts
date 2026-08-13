import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export interface WPRData {
    id: string;
    projectName: string;
    weekStart: string | Date;
    weekEnding: string | Date;
    plannedProgress: number | string;
    actualProgress: number | string;
    progressRemarks?: string;
    milestones?: string;
    issues?: string;
    risks?: string;
    safetySummary?: string;
    qualitySummary?: string;
    teamPerformance?: string;

    // Resources data
    manpower?: Array<{
        role: string;
        planned?: string | number;
        actual?: string | number;
        remarks?: string;
    }>;

    equipment?: Array<{
        equipment: string;
        uptime?: string | number;
        downtime?: string | number;
        remarks?: string;
    }>;

    materials?: Array<{
        material: string;
        planned?: string | number;
        actual?: string | number;
        remarks?: string;
    }>;

    createdAt?: string | Date;
}

const generatePDFDocument = (wpr: WPRData): jsPDF => {
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
    doc.text('WEEKLY PROGRESS REPORT', pageWidth / 2, currentY + 5, { align: 'center' });

    currentY += 12;
    doc.setDrawColor(0);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 3;

    // Report Details Header
    const headerData = [
        ['PROJECT NAME:', wpr.projectName || ''],
    ];

    const reportDateRange = [
        ['WEEK START:', wpr.weekStart ? new Date(wpr.weekStart).toLocaleDateString('en-IN') : ''],
        ['WEEK END:', wpr.weekEnding ? new Date(wpr.weekEnding).toLocaleDateString('en-IN') : ''],
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

    reportDateRange.forEach((row) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(row[0], margin + 1, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(row[1], margin + 50, currentY);
        currentY += 6;
    });

    currentY += 3;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // ==================== PROGRESS METRICS ====================
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('PROGRESS METRICS', margin, currentY);
    currentY += 8;

    const metricsColumns = ['Metric', 'Value'];
    const metricsData = [
        ['Planned Progress', `${wpr.plannedProgress}%`],
        ['Actual Progress', `${wpr.actualProgress}%`],
    ];

    if (wpr.progressRemarks) {
        metricsData.push(['Remarks', wpr.progressRemarks]);
    }

    doc.setFontSize(9);
    (doc as any).autoTable({
        startY: currentY,
        head: [metricsColumns],
        body: metricsData,
        margin: margin,
        didDrawPage: () => { },
        headStyles: {
            fillColor: [66, 99, 139],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
        },
        bodyStyles: {
            fontSize: 8,
            valign: 'top',
        },
        columnStyles: {
            1: { halign: 'right' },
        },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // Check if we need a new page
    if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin;
    }

    // ==================== MILESTONES ====================
    if (wpr.milestones && wpr.milestones.trim()) {
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.text('Key Milestones Achieved:', margin, currentY);
        currentY += 4;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        const milestoneText = doc.splitTextToSize(wpr.milestones, pageWidth - 2 * margin);
        doc.text(milestoneText, margin, currentY);
        currentY += milestoneText.length * 4 + 5;

        if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = margin;
        }
    }

    // ==================== ISSUES & RISKS ====================
    const hasIssuesOrRisks = (wpr.issues && wpr.issues.trim()) || (wpr.risks && wpr.risks.trim());
    if (hasIssuesOrRisks) {
        if (wpr.issues && wpr.issues.trim()) {
            doc.setFontSize(10);
            doc.setFont('Helvetica', 'bold');
            doc.text('Major Issues Identified:', margin, currentY);
            currentY += 4;

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            const issuesText = doc.splitTextToSize(wpr.issues, pageWidth - 2 * margin);
            doc.text(issuesText, margin, currentY);
            currentY += issuesText.length * 4 + 5;

            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
        }

        if (wpr.risks && wpr.risks.trim()) {
            doc.setFontSize(10);
            doc.setFont('Helvetica', 'bold');
            doc.text('Major Risks Assessment:', margin, currentY);
            currentY += 4;

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            const risksText = doc.splitTextToSize(wpr.risks, pageWidth - 2 * margin);
            doc.text(risksText, margin, currentY);
            currentY += risksText.length * 4 + 5;

            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
        }
    }

    // ==================== SAFETY & QUALITY ====================
    const hasSafetyOrQuality = (wpr.safetySummary && wpr.safetySummary.trim()) || (wpr.qualitySummary && wpr.qualitySummary.trim());
    if (hasSafetyOrQuality) {
        if (wpr.safetySummary && wpr.safetySummary.trim()) {
            doc.setFontSize(10);
            doc.setFont('Helvetica', 'bold');
            doc.text('Safety Summary & Compliance:', margin, currentY);
            currentY += 4;

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            const safetyText = doc.splitTextToSize(wpr.safetySummary, pageWidth - 2 * margin);
            doc.text(safetyText, margin, currentY);
            currentY += safetyText.length * 4 + 5;

            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
        }

        if (wpr.qualitySummary && wpr.qualitySummary.trim()) {
            doc.setFontSize(10);
            doc.setFont('Helvetica', 'bold');
            doc.text('Quality Assurance Summary:', margin, currentY);
            currentY += 4;

            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            const qualityText = doc.splitTextToSize(wpr.qualitySummary, pageWidth - 2 * margin);
            doc.text(qualityText, margin, currentY);
            currentY += qualityText.length * 4 + 5;

            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
        }
    }

    // ==================== RESOURCES BREAKDOWN ====================
    const hasResources = (wpr.manpower && wpr.manpower.length > 0) ||
        (wpr.equipment && wpr.equipment.length > 0) ||
        (wpr.materials && wpr.materials.length > 0);

    if (hasResources) {
        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        doc.text('RESOURCES BREAKDOWN', margin, currentY);
        currentY += 8;

        // Manpower table
        if (wpr.manpower && wpr.manpower.length > 0) {
            doc.setFontSize(9);
            doc.setFont('Helvetica', 'bold');
            doc.text('Manpower Allocation:', margin, currentY);
            currentY += 6;

            const manpowerColumns = ['Role', 'Planned', 'Actual', 'Remarks'];
            const manpowerData = wpr.manpower.map((item) => [
                item.role || '',
                item.planned?.toString() || '-',
                item.actual?.toString() || '-',
                item.remarks || '-',
            ]);

            doc.setFontSize(8);
            (doc as any).autoTable({
                startY: currentY,
                head: [manpowerColumns],
                body: manpowerData,
                margin: margin,
                didDrawPage: () => { },
                headStyles: {
                    fillColor: [100, 120, 150],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8,
                    halign: 'center',
                    valign: 'middle',
                },
                bodyStyles: {
                    fontSize: 7,
                    valign: 'top',
                    overflow: 'linebreak',
                },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { halign: 'center', cellWidth: 18 },
                    2: { halign: 'center', cellWidth: 18 },
                    3: { cellWidth: 50, halign: 'left', valign: 'top' },
                },
            });

            currentY = (doc as any).lastAutoTable.finalY + 5;

            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
        }

        // Equipment table
        if (wpr.equipment && wpr.equipment.length > 0) {
            doc.setFontSize(9);
            doc.setFont('Helvetica', 'bold');
            doc.text('Equipment & Machineries:', margin, currentY);
            currentY += 6;

            const equipmentColumns = ['Equipment Name', 'Uptime', 'Downtime', 'Remarks'];
            const equipmentData = wpr.equipment.map((item) => [
                item.equipment || '',
                item.uptime?.toString() || '-',
                item.downtime?.toString() || '-',
                item.remarks || '-',
            ]);

            doc.setFontSize(8);
            (doc as any).autoTable({
                startY: currentY,
                head: [equipmentColumns],
                body: equipmentData,
                margin: margin,
                didDrawPage: () => { },
                headStyles: {
                    fillColor: [100, 120, 150],
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
                    0: { cellWidth: 40 },
                    1: { halign: 'center', cellWidth: 18 },
                    2: { halign: 'center', cellWidth: 18 },
                    3: { cellWidth: 'auto', valign: 'top' },
                },
            });

            currentY = (doc as any).lastAutoTable.finalY + 5;

            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
        }

        // Materials table
        if (wpr.materials && wpr.materials.length > 0) {
            doc.setFontSize(9);
            doc.setFont('Helvetica', 'bold');
            doc.text('Materials Consumption:', margin, currentY);
            currentY += 6;

            const materialsColumns = ['Material', 'Planned', 'Actual', 'Remarks'];
            const materialsData = wpr.materials.map((item) => [
                item.material || '',
                item.planned?.toString() || '-',
                item.actual?.toString() || '-',
                item.remarks || '-',
            ]);

            doc.setFontSize(8);
            (doc as any).autoTable({
                startY: currentY,
                head: [materialsColumns],
                body: materialsData,
                margin: margin,
                didDrawPage: () => { },
                headStyles: {
                    fillColor: [100, 120, 150],
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
                    0: { cellWidth: 35 },
                    1: { halign: 'center', cellWidth: 20 },
                    2: { halign: 'center', cellWidth: 20 },
                    3: { cellWidth: 'auto', valign: 'top' },
                },
            });

            currentY = (doc as any).lastAutoTable.finalY + 5;

            if (currentY > pageHeight - 40) {
                doc.addPage();
                currentY = margin;
            }
        }
    }

    // ==================== TEAM PERFORMANCE ====================
    if (wpr.teamPerformance && wpr.teamPerformance.trim()) {
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.text('Team Performance Assessment:', margin, currentY);
        currentY += 4;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        const teamText = doc.splitTextToSize(wpr.teamPerformance, pageWidth - 2 * margin);
        doc.text(teamText, margin, currentY);
        currentY += teamText.length * 4 + 5;

        if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = margin;
        }
    }

    // ==================== FOOTER ====================
    const finalY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    const weekStartStr = wpr.weekStart ? new Date(wpr.weekStart).toLocaleDateString('en-IN') : '';
    const weekEndStr = wpr.weekEnding ? new Date(wpr.weekEnding).toLocaleDateString('en-IN') : '';
    doc.text(
        `Generated on ${new Date().toLocaleString('en-IN')} | Week: ${weekStartStr} to ${weekEndStr}`,
        margin,
        finalY,
    );

    return doc;
};

export const generateWPRPDF = (wpr: WPRData): jsPDF => {
    return generatePDFDocument(wpr);
};

export const downloadWPRPDF = async (wpr: WPRData) => {
    try {
        const doc = generatePDFDocument(wpr);
        const pdfBlob = doc.output('blob');
        const weekStart = wpr.weekStart ? new Date(wpr.weekStart).toISOString().split('T')[0] : 'unknown';
        const fileName = `WPR_${wpr.projectName}_${weekStart}.pdf`;
        saveAs(pdfBlob, fileName);
        return true;
    } catch (error) {
        console.error('Error generating WPR PDF:', error);
        throw error;
    }
};
