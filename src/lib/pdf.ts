
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
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 256, color: { dark: '#262626', light: '#00000000' }});
    const performance = getPerformanceDetails(averageScore);

    // Subtle background color
    doc.setFillColor('#F8F7FF'); // A very light, almost white lavender
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Corner flourishes for a classic look
    const cornerSize = 30;
    doc.setDrawColor('#A78BFA'); // Muted purple from primary palette
    doc.setLineWidth(0.5);
    // Top-left
    doc.line(10, 10 + cornerSize, 10, 10);
    doc.line(10, 10, 10 + cornerSize, 10);
    // Top-right
    doc.line(pageWidth - 10, 10 + cornerSize, pageWidth - 10, 10);
    doc.line(pageWidth - 10, 10, pageWidth - 10 - cornerSize, 10);
    // Bottom-left
    doc.line(10, pageHeight - 10 - cornerSize, 10, pageHeight - 10);
    doc.line(10, pageHeight - 10, 10 + cornerSize, pageHeight - 10);
    // Bottom-right
    doc.line(pageWidth - 10, pageHeight - 10 - cornerSize, pageWidth - 10, pageHeight - 10);
    doc.line(pageWidth - 10, pageHeight - 10, pageWidth - 10 - cornerSize, pageHeight - 10);

    // Main Title
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(30);
    doc.setTextColor("#1e1b4b"); // Dark indigo
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 40, { align: 'center' });

    doc.setFont("helvetica", 'normal');
    doc.setFontSize(14);
    doc.setTextColor("#57534e"); // Dark stone
    doc.text('This is to certify that the team', pageWidth / 2, 55, { align: 'center' });

    // Team Name
    doc.setFontSize(36);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#4c1d95"); // Dark violet
    doc.text(teamName, pageWidth / 2, 75, { align: 'center' });
    
    // Project Info
    doc.setFontSize(14);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#57534e");
    doc.text(`has demonstrated exceptional skill and collaboration in the project`, pageWidth / 2, 90, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont("helvetica", 'italic');
    doc.setTextColor("#1e40af"); // Dark blue
    doc.text(`"${projectName}"`, pageWidth / 2, 102, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#57534e");
    doc.text(`during the HackSprint event.`, pageWidth / 2, 112, { align: 'center' });
    
    // Performance Details
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#57534e");
    const performanceText = `Awarded with a performance rating of "${performance.descriptor}" and a final score of ${averageScore.toFixed(2)} / 10.`;
    doc.text(performanceText, pageWidth / 2, 125, { align: 'center' });

    // Team Members
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#44403c"); // Darker stone
    doc.text('AWARDED TO', pageWidth / 2, 145, { align: 'center' });
    const membersText = teamMembers.join('  •  ');
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#57534e");
    doc.text(membersText, pageWidth / 2, 153, { align: 'center', maxWidth: pageWidth - 80 });

    const signatureX = pageWidth / 4 + 20;
    const dateX = pageWidth * 3 / 4 - 20;
    const bottomY = pageHeight - 40;

    // Signature
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(14);
    doc.setTextColor("#1e1b4b");
    doc.text('J. Hackerton', signatureX, bottomY, { align: 'center' });
    doc.setDrawColor("#7c3aed"); // Violet
    doc.setLineWidth(0.3);
    doc.line(signatureX - 30, bottomY + 2, signatureX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#57534e");
    doc.text('HackSprint Committee Lead', signatureX, bottomY + 8, { align: 'center' });

    // Date
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(14);
    doc.setTextColor("#1e1b4b");
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), dateX, bottomY, { align: 'center' });
    doc.setDrawColor("#7c3aed");
    doc.setLineWidth(0.3);
    doc.line(dateX - 30, bottomY + 2, dateX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#57534e");
    doc.text('Date of Issue', dateX, bottomY + 8, { align: 'center' });
    
    // QR Code Area
    const qrCodeSize = 30;
    const qrCodeX = pageWidth - qrCodeSize - 15;
    const qrCodeY = pageHeight - qrCodeSize - 15;
    
    doc.addImage(qrCodeDataUrl, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#78716c");
    doc.text('Verify authenticity', qrCodeX + qrCodeSize/2, qrCodeY + qrCodeSize + 4, { align: 'center' });
    
    doc.save(`Certificate-${teamName.replace(/\s/g, '_')}.pdf`);
};
