"use client";

import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const getPerformanceDetails = (score: number) => {
    const roundedScore = Math.round(score);
    if (roundedScore >= 9) return { descriptor: 'Outstanding', remarks: 'Passed' };
    if (roundedScore >= 8) return { descriptor: 'Very Satisfactory', remarks: 'Passed' };
    if (roundedScore >= 7) return { descriptor: 'Satisfactory', remarks: 'Passed' };
    if (roundedScore >= 5) return { descriptor: 'Fairly Satisfactory', remarks: 'Passed' };
    return { descriptor: 'Did Not Meet Expectations', remarks: 'Failed' };
};

export const generateCertificate = async (teamName: string, projectName: string, teamMembers: string[], projectId: string, averageScore: number) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const verificationUrl = `${window.location.origin}/verify/${projectId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'M', width: 128 });
    const performance = getPerformanceDetails(averageScore);

    doc.addFont('https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQtsPqBpVf0EVzA.ttf', 'Space Grotesk', 'normal');
    doc.addFont('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf', 'Inter', 'normal');

    doc.setDrawColor("#A78BFA");
    doc.setLineWidth(2);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    doc.setFont('Space Grotesk', 'normal');
    doc.setFontSize(40);
    doc.setTextColor("#F9FAFB");
    doc.text('Certificate of Achievement', pageWidth / 2, 40, { align: 'center' });

    doc.setFont('Inter', 'normal');
    doc.setFontSize(20);
    doc.setTextColor("#9CA3AF");
    doc.text('This certificate is proudly presented to', pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(32);
    doc.setFont('Space Grotesk', 'normal');
    doc.setTextColor("#6366F1");
    doc.text(teamName, pageWidth / 2, 80, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('Inter', 'normal');
    doc.setTextColor("#F9FAFB");
    const performanceText = `for their ${performance.descriptor.toLowerCase()} project submission`;
    doc.text(performanceText, pageWidth / 2, 95, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont('Inter', 'normal');
    doc.setTextColor("#818CF8");
    doc.text(`"${projectName}"`, pageWidth / 2, 110, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('Inter', 'normal');
    doc.setTextColor("#F9FAFB");
    doc.text(`Final Score: ${averageScore.toFixed(2)} / 10`, pageWidth / 2, 125, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('Inter', 'normal');
    doc.setTextColor("#9CA3AF");
    doc.text('Awarded to team members:', pageWidth / 2, 140, { align: 'center' });
    
    const membersText = teamMembers.join('  •  ');
    doc.setFontSize(12);
    doc.setFont('Inter', 'normal');
    doc.setTextColor("#F9FAFB");
    doc.text(membersText, pageWidth / 2, 150, { align: 'center', maxWidth: pageWidth - 60 });

    doc.setFont('Inter', 'normal');
    doc.setFontSize(22);
    doc.setTextColor("#F9FAFB");
    doc.text('J. Hackerton', 80, pageHeight - 45, { align: 'center' });

    doc.setDrawColor("#F9FAFB");
    doc.setLineWidth(0.5);
    doc.line(40, pageHeight - 40, 120, pageHeight - 40);
    doc.setFont('Inter', 'normal');
    doc.setFontSize(12);
    doc.text('HackSprint Committee', 80, pageHeight - 32, { align: 'center' });
    
    const qrCodeSize = 30;
    const qrX = pageWidth - qrCodeSize - 20;
    const qrY = pageHeight - qrCodeSize - 30;
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrCodeSize, qrCodeSize);
    doc.setFontSize(8);
    doc.setTextColor("#9CA3AF");
    doc.text('Scan to verify authenticity', qrX + qrCodeSize / 2, qrY + qrCodeSize + 4, { align: 'center' });

    doc.save(`Certificate-${teamName.replace(/\s/g, '_')}.pdf`);
};
