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
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'M', width: 128, color: { dark: '#FFFFFF', light: '#111827' }});
    const performance = getPerformanceDetails(averageScore);

    // Dark background
    doc.setFillColor("#111827");
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Gradient header
    const gradient = doc.context2d.createLinearGradient(0, 0, pageWidth, 0);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(1, '#a855f7');
    doc.context2d.fillStyle = gradient;
    doc.context2d.fillRect(0, 0, pageWidth, 50);

    // Decorative corner elements
    doc.setDrawColor('#a855f7');
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 10, 20, pageHeight - 10);
    doc.line(10, pageHeight - 20, 10, pageHeight - 10);
    doc.line(pageWidth - 10, 10, pageWidth - 20, 10);
    doc.line(pageWidth - 10, 20, pageWidth - 10, 10);
    
    // Main Title
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(36);
    doc.setTextColor("#FFFFFF");
    doc.text('Certificate of Achievement', pageWidth / 2, 35, { align: 'center' });

    doc.setFont("helvetica", 'normal');
    doc.setFontSize(16);
    doc.setTextColor("#D1D5DB");
    doc.text('This certificate is proudly presented to', pageWidth / 2, 60, { align: 'center' });

    // Team Name
    doc.setFontSize(40);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#C4B5FD");
    doc.text(teamName, pageWidth / 2, 85, { align: 'center' });
    
    // Project Info
    doc.setFontSize(16);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#9CA3AF");
    doc.text(`for their exceptional work on the project`, pageWidth / 2, 100, { align: 'center' });
    doc.setFontSize(22);
    doc.setFont("helvetica", 'italic');
    doc.setTextColor("#A5B4FC");
    doc.text(`"${projectName}"`, pageWidth / 2, 112, { align: 'center' });

    // Performance Details
    doc.setFontSize(14);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#D1D5DB");
    const performanceText = `${performance.descriptor} (${performance.remarks}) with a Final Score of ${averageScore.toFixed(2)} / 10`;
    doc.text(performanceText, pageWidth / 2, 130, { align: 'center' });

    // Team Members
    doc.setFontSize(14);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#9CA3AF");
    doc.text('AWARDED TO', pageWidth / 2, 150, { align: 'center' });
    const membersText = teamMembers.join('  •  ');
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#E5E7EB");
    doc.text(membersText, pageWidth / 2, 158, { align: 'center', maxWidth: pageWidth - 80 });

    // Signature
    const signatureX = 75;
    const signatureY = pageHeight - 35;
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(16);
    doc.setTextColor("#FFFFFF");
    doc.text('J. Hackerton', signatureX, signatureY, { align: 'center' });
    doc.setDrawColor("#4f46e5");
    doc.setLineWidth(0.5);
    doc.line(signatureX - 30, signatureY + 2, signatureX + 30, signatureY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#9CA3AF");
    doc.text('HackSprint Committee Lead', signatureX, signatureY + 8, { align: 'center' });
    
    // QR Code
    const qrCodeSize = 30;
    const qrX = pageWidth - qrCodeSize - 25;
    const qrY = pageHeight - qrCodeSize - 25;
    doc.setFillColor("#1E293B");
    doc.setDrawColor("#4f46e5");
    doc.setLineWidth(0.5);
    doc.roundedRect(qrX-2, qrY-2, qrCodeSize+4, qrCodeSize+10, 3, 3, 'FD');
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrCodeSize, qrCodeSize);
    doc.setFontSize(8);
    doc.setTextColor("#A5B4FC");
    doc.text('Scan to verify', qrX + qrCodeSize / 2, qrY + qrCodeSize + 5, { align: 'center' });

    doc.save(`Certificate-${teamName.replace(/\s/g, '_')}.pdf`);
};
