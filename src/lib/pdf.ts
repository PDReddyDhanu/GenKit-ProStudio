

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

const getRankSuffix = (rankNum: number) => {
    if (rankNum === 1) return '1st';
    if (rankNum === 2) return '2nd';
    if (rankNum === 3) return '3rd';
    return `${rankNum}th`;
};


const generateWinnerCertificate = async (doc: jsPDF, teamName: string, projectName: string, teamMembers: string[], projectId: string, averageScore: number, collegeName: string, rank: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const verificationUrl = `${window.location.origin}/verify/${projectId}?college=${encodeURIComponent(collegeName)}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 256, color: { dark: '#262626', light: '#00000000' }});
    const performance = getPerformanceDetails(averageScore);

    // Subtle background color
    doc.setFillColor(255, 251, 235);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Corner flourishes
    const cornerSize = 30;
    const rankColors = {
        1: '#FFC200', // Gold
        2: '#A0A0A0', // Silver
        3: '#CD7F32'  // Bronze
    };
    const rankColor = rankColors[rank as keyof typeof rankColors];
    doc.setDrawColor(rankColor);
    doc.setLineWidth(0.5);
    // ... corner drawing logic ...
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
    doc.setTextColor(rankColor);
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 35, { align: 'center' });
    
    // Rank
    doc.setFontSize(24);
    doc.text(`${getRankSuffix(rank)} Place Winner`, pageWidth / 2, 48, { align: 'center' });

    doc.setFont("helvetica", 'normal');
    doc.setFontSize(14);
    doc.setTextColor("#404040");
    doc.text('This is to certify that the team', pageWidth / 2, 65, { align: 'center' });
    
    // Team Name
    doc.setFontSize(36);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#039BE5"); // Blue for contrast
    doc.text(teamName, pageWidth / 2, 80, { align: 'center' });

    // Project Info
    doc.setFontSize(14);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#404040");
    doc.text(`has demonstrated exceptional skill in the project`, pageWidth / 2, 95, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont("helvetica", 'italic');
    doc.setTextColor("#262626");
    doc.text(`"${projectName}"`, pageWidth / 2, 107, { align: 'center' });

    // Performance
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#404040");
    const performanceText = `Awarded with a performance rating of "${performance.descriptor}" and a final score of ${averageScore.toFixed(2)} / 10.`;
    doc.text(performanceText, pageWidth / 2, 120, { align: 'center' });
    
    // Team Members
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#262626");
    doc.text('AWARDED TO', pageWidth / 2, 140, { align: 'center' });
    const membersText = teamMembers.join('  •  ');
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#404040");
    doc.text(membersText, pageWidth / 2, 148, { align: 'center', maxWidth: pageWidth - 80 });

    // Signatures, Date, QR
    const signatureX = pageWidth / 4 + 20;
    const dateX = pageWidth * 3 / 4 - 20;
    const bottomY = pageHeight - 40;
    // ... signature, date, qr logic ...
    // Signature
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(14);
    doc.setTextColor("#B95000");
    doc.text('J. Hackerton', signatureX, bottomY, { align: 'center' });
    doc.setDrawColor("#FFC200"); // Firebase Amber
    doc.setLineWidth(0.3);
    doc.line(signatureX - 30, bottomY + 2, signatureX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#404040");
    doc.text('HackSprint Committee Lead', signatureX, bottomY + 8, { align: 'center' });

    // Date
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(14);
    doc.setTextColor("#B95000");
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), dateX, bottomY, { align: 'center' });
    doc.setDrawColor("#FFC200");
    doc.setLineWidth(0.3);
    doc.line(dateX - 30, bottomY + 2, dateX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#404040");
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
};

const generateParticipantCertificate = async (doc: jsPDF, teamName: string, projectName: string, teamMembers: string[], projectId: string, collegeName: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const verificationUrl = `${window.location.origin}/verify/${projectId}?college=${encodeURIComponent(collegeName)}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 256, color: { dark: '#262626', light: '#00000000' }});

    // Background and border
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor('#039BE5'); // Primary Blue
    doc.setLineWidth(1.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    // Main Title
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(30);
    doc.setTextColor('#1E3A8A');
    doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 40, { align: 'center' });

    // College Name
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(14);
    doc.setTextColor('#404040');
    doc.text(`From the HackSprint event held at ${collegeName}`, pageWidth / 2, 55, { align: 'center' });

    doc.text('This is to proudly certify the participation of team', pageWidth / 2, 75, { align: 'center' });

    // Team Name
    doc.setFontSize(32);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#039BE5");
    doc.text(teamName, pageWidth / 2, 90, { align: 'center' });

    // Project Info
    doc.setFontSize(14);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#404040");
    doc.text(`who successfully submitted the project`, pageWidth / 2, 105, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont("helvetica", 'italic');
    doc.setTextColor("#111827");
    doc.text(`"${projectName}"`, pageWidth / 2, 117, { align: 'center' });
    
    // Team Members
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor("#111827");
    doc.text('PARTICIPANTS', pageWidth / 2, 140, { align: 'center' });
    const membersText = teamMembers.join('  •  ');
    doc.setFontSize(12);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor("#404040");
    doc.text(membersText, pageWidth / 2, 148, { align: 'center', maxWidth: pageWidth - 80 });

    // Signatures, Date, QR
    const signatureX = pageWidth / 4 + 20;
    const dateX = pageWidth * 3 / 4 - 20;
    const bottomY = pageHeight - 40;
    // ... signature, date, qr logic ...
    // Signature
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(14);
    doc.setTextColor("#1E3A8A");
    doc.text('J. Hackerton', signatureX, bottomY, { align: 'center' });
    doc.setDrawColor("#039BE5");
    doc.setLineWidth(0.3);
    doc.line(signatureX - 30, bottomY + 2, signatureX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#404040");
    doc.text('HackSprint Committee Lead', signatureX, bottomY + 8, { align: 'center' });

    // Date
    doc.setFont("helvetica", 'bold');
    doc.setFontSize(14);
    doc.setTextColor("#1E3A8A");
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), dateX, bottomY, { align: 'center' });
    doc.setDrawColor("#039BE5");
    doc.setLineWidth(0.3);
    doc.line(dateX - 30, bottomY + 2, dateX + 30, bottomY + 2);
    doc.setFont("helvetica", 'normal');
    doc.setFontSize(10);
    doc.setTextColor("#404040");
    doc.text('Date of Issue', dateX, bottomY + 8, { align: 'center' });
    
    // QR Code Area
    const qrCodeSize = 25;
    const qrCodeX = pageWidth - qrCodeSize - 15;
    const qrCodeY = pageHeight - qrCodeSize - 15;
    
    doc.addImage(qrCodeDataUrl, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#78716c");
    doc.text('Verify participation', qrCodeX + qrCodeSize/2, qrCodeY + qrCodeSize + 4, { align: 'center' });
};

export const generateCertificate = async (teamName: string, projectName: string, teamMembers: string[], projectId: string, averageScore: number, collegeName: string, rank?: number) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    if (rank && rank >= 1 && rank <= 3) {
        await generateWinnerCertificate(doc, teamName, projectName, teamMembers, projectId, averageScore, collegeName, rank);
         doc.save(`Certificate_Winner-${teamName.replace(/\s/g, '_')}.pdf`);
    } else {
        await generateParticipantCertificate(doc, teamName, projectName, teamMembers, projectId, collegeName);
         doc.save(`Certificate_Participation-${teamName.replace(/\s/g, '_')}.pdf`);
    }
};
