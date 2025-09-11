

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
    
    // --- Colors & Fonts ---
    const primaryGold = '#FFC107'; 
    const darkBlue = '#0D1B2A';
    const textColor = '#E0E1DD';
    const bodyTextColor = '#B0B3B8';
    
    // --- Background ---
    doc.setFillColor(darkBlue);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // --- Decorative Accents ---
    doc.setDrawColor(primaryGold);
    doc.setLineWidth(1.5);
    doc.line(20, 20, pageWidth - 20, 20); // Top line
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20); // Bottom line


    // --- Main Content ---
    doc.setFont("times", "bold");
    doc.setFontSize(38);
    doc.setTextColor(primaryGold);
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 40, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text('This certificate is proudly awarded to', pageWidth / 2, 55, { align: 'center' });

    doc.setFont("times", "bold");
    doc.setFontSize(32);
    doc.setTextColor(textColor);
    doc.text(teamName, pageWidth / 2, 75, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text('for their exceptional work on the project', pageWidth / 2, 85, { align: 'center' });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(22);
    doc.setTextColor(primaryGold);
    doc.text(`"${projectName}"`, pageWidth / 2, 98, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.text(`at the hackathon held by ${collegeName}.`, pageWidth / 2, 110, { align: 'center' });

    // Team Members
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryGold);
    doc.text('TEAM MEMBERS', pageWidth / 2, 130, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(bodyTextColor);
    doc.text(teamMembers.join('  •  '), pageWidth / 2, 138, { align: 'center', maxWidth: pageWidth - 60 });

    // --- Footer Section ---
    const bottomY = pageHeight - 50;

    // Signature
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    doc.text('J. Hackerton', pageWidth / 4, bottomY + 5);
    doc.setDrawColor(primaryGold);
    doc.setLineWidth(0.2);
    doc.line(pageWidth / 4 - 20, bottomY + 7, pageWidth / 4 + 20, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(bodyTextColor);
    doc.text('HackSprint Committee Lead', pageWidth / 4, bottomY + 12, { align: 'center' });

    // QR Code for verification
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 200, color: { dark: primaryGold, light: '#00000000' }});
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth / 2 - 15, bottomY - 13, 30, 30);
    doc.setFontSize(8);
    doc.text('Verify Authenticity', pageWidth / 2, bottomY + 23, { align: 'center' });

    // Date
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth * 3 / 4, bottomY + 5);
    doc.line(pageWidth * 3 / 4 - 20, bottomY + 7, pageWidth * 3 / 4 + 20, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(bodyTextColor);
    doc.text('Date of Issue', pageWidth * 3 / 4, bottomY + 12, { align: 'center' });
    
    // --- Rank Badge ---
    const rankBadgeSize = 30;
    doc.setFillColor(primaryGold);
    doc.circle(pageWidth - rankBadgeSize, rankBadgeSize, rankBadgeSize / 2, 'F');
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(darkBlue);
    doc.text(getRankSuffix(rank), pageWidth - rankBadgeSize, rankBadgeSize + 3, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Place', pageWidth - rankBadgeSize, rankBadgeSize + 9, { align: 'center' });

};

const generateParticipantCertificate = async (doc: jsPDF, teamName: string, projectName: string, teamMembers: string[], projectId: string, collegeName: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const verificationUrl = `${window.location.origin}/verify/${projectId}?college=${encodeURIComponent(collegeName)}`;
    
    // --- Colors & Fonts ---
    const primaryBlue = '#005A9C';
    const darkText = '#333333';
    const lightText = '#6c757d';
    const backgroundColor = '#FFFFFF';

    // --- Background & Border ---
    doc.setFillColor(backgroundColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Simple, elegant border
    doc.setDrawColor(primaryBlue);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Outer border
    doc.setDrawColor('#EAEAEA');
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24); // Inner border accent

    // --- Main Content ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(primaryBlue);
    doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 45, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(darkText);
    doc.text('This certificate is presented to', pageWidth / 2, 60, { align: 'center' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(teamName, pageWidth / 2, 80, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text('for their successful participation and project submission in the HackSprint event', pageWidth / 2, 90, { align: 'center', maxWidth: pageWidth - 80 });
    doc.text(`held at ${collegeName}.`, pageWidth / 2, 97, { align: 'center' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(darkText);
    doc.text('Project:', pageWidth / 2, 115, { align: 'center' });
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(18);
    doc.setTextColor(primaryBlue);
    doc.text(`"${projectName}"`, pageWidth / 2, 123, { align: 'center' });

    // Team Members
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(darkText);
    doc.text('PARTICIPANTS', pageWidth / 2, 140, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(lightText);
    doc.text(teamMembers.join('  •  '), pageWidth / 2, 147, { align: 'center', maxWidth: pageWidth - 60 });
    
    // --- Footer Section ---
    const bottomY = pageHeight - 50;

    // Signature
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(darkText);
    doc.text('J. Hackerton', pageWidth / 4, bottomY + 5);
    doc.setDrawColor(primaryBlue);
    doc.setLineWidth(0.2);
    doc.line(pageWidth / 4 - 30, bottomY + 7, pageWidth / 4 + 30, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(lightText);
    doc.text('HackSprint Committee Lead', pageWidth / 4, bottomY + 12, { align: 'center' });

    // Date
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(darkText);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth * 3 / 4, bottomY + 5);
    doc.line(pageWidth * 3 / 4 - 30, bottomY + 7, pageWidth * 3 / 4 + 30, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(lightText);
    doc.text('Date of Issue', pageWidth * 3 / 4, bottomY + 12, { align: 'center' });

    // QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 200, color: { dark: darkText, light: '#00000000' }});
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth / 2 - 12.5, bottomY - 10, 25, 25);
    doc.setFontSize(8);
    doc.text('Verify authenticity', pageWidth / 2, bottomY + 20, { align: 'center' });

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
