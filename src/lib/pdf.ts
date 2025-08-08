
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
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'M', width: 128, color: { dark: '#FFFFFF', light: '#00000000' }});
    const performance = getPerformanceDetails(averageScore);

    // Dark background
    doc.setFillColor("#111827");
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Abstract background lines
    doc.setDrawColor("#4f46e5");
    doc.setLineCap('round');
    for(let i=0; i<10; i++) {
        doc.setLineWidth(Math.random() * 0.5);
        doc.setGState(new (doc as any).GState({opacity: Math.random() * 0.1}));
        doc.line(Math.random() * pageWidth, 0, Math.random() * pageWidth, pageHeight);
        doc.line(0, Math.random() * pageHeight, pageWidth, Math.random() * pageHeight);
    }
    doc.setGState(new (doc as any).GState({opacity: 1}));

    // Border
    doc.setDrawColor("#a855f7");
    doc.setLineWidth(1.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    doc.setLineWidth(0.5);
    doc.rect(7, 7, pageWidth - 14, pageHeight - 14);


    // Main Title
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(32);
    doc.setTextColor("#FFFFFF");
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 30, { align: 'center' });

    doc.setDrawColor("#a855f7");
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 50, 35, pageWidth / 2 + 50, 35);
    
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(16);
    doc.setTextColor("#D1D5DB");
    doc.text('This is to certify that', pageWidth / 2, 50, { align: 'center' });

    // Team Name
    doc.setFontSize(40);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#C4B5FD");
    doc.text(teamName, pageWidth / 2, 70, { align: 'center' });
    
    // Project Info
    doc.setFontSize(16);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#9CA3AF");
    doc.text(`has successfully completed the project`, pageWidth / 2, 85, { align: 'center' });
    doc.setFontSize(22);
    doc.setFont("helvetica", 'italic');
    doc.setTextColor("#A5B4FC");
    doc.text(`"${projectName}"`, pageWidth / 2, 97, { align: 'center' });
    doc.text(`at HackSprint`, pageWidth / 2, 109, { align: 'center' });
    
    // Performance Details
    doc.setFontSize(14);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#D1D5DB");
    const performanceText = `${performance.descriptor} (${performance.remarks}) with a Final Score of ${averageScore.toFixed(2)} / 10`;
    doc.text(performanceText, pageWidth / 2, 125, { align: 'center' });

    // Team Members
    doc.setFontSize(14);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#9CA3AF");
    doc.text('TEAM MEMBERS', pageWidth / 2, 145, { align: 'center' });
    const membersText = teamMembers.join('  •  ');
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#E5E7EB");
    doc.text(membersText, pageWidth / 2, 153, { align: 'center', maxWidth: pageWidth - 80 });

    const signatureX = pageWidth / 4;
    const dateX = pageWidth * 3 / 4;
    const bottomY = pageHeight - 35;
    
    // Signature
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(16);
    doc.setTextColor("#FFFFFF");
    doc.text('J. Hackerton', signatureX, bottomY, { align: 'center' });
    doc.setDrawColor("#4f46e5");
    doc.setLineWidth(0.5);
    doc.line(signatureX - 30, bottomY + 2, signatureX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#9CA3AF");
    doc.text('HackSprint Committee Lead', signatureX, bottomY + 8, { align: 'center' });

    // Date
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(16);
    doc.setTextColor("#FFFFFF");
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), dateX, bottomY, { align: 'center' });
    doc.setDrawColor("#4f46e5");
    doc.setLineWidth(0.5);
    doc.line(dateX - 30, bottomY + 2, dateX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#9CA3AF");
    doc.text('Date of Issue', dateX, bottomY + 8, { align: 'center' });
    
    // Seal / QR Code Area
    const sealSize = 35;
    const sealX = pageWidth / 2;
    const sealY = pageHeight - 45;

    // QR Code
    const qrCodeSize = 25;
    doc.addImage(qrCodeDataUrl, 'PNG', sealX - qrCodeSize/2, sealY - qrCodeSize/2, qrCodeSize, qrCodeSize);
    
    // Seal Circle
    doc.setDrawColor("#a855f7");
    doc.setLineWidth(1);
    doc.circle(sealX, sealY, sealSize/2);
    doc.setLineWidth(0.5);
    doc.circle(sealX, sealY, sealSize/2 - 1.5);
    
    // Seal Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor("#a855f7");
    doc.text("VERIFIED", sealX, sealY-14, {align: 'center'});
    doc.text("HACKSPRINT", sealX, sealY+17, {align: 'center'});
    
    doc.save(`Certificate-${teamName.replace(/\s/g, '_')}.pdf`);
};
