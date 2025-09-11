

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
    
    const performance = getPerformanceDetails(averageScore);

    // --- Colors & Fonts ---
    const primaryGold = '#FFD700'; 
    const darkBlue = '#0D1B2A';
    const textColor = '#E0E1DD';
    
    // --- Background ---
    doc.setFillColor(darkBlue);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // --- Decorative Border ---
    doc.setDrawColor(primaryGold);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Outer border
    doc.setLineWidth(0.2);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24); // Inner border


    // --- Main Content ---
    doc.setFont("times", "bold");
    doc.setFontSize(36);
    doc.setTextColor(primaryGold);
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 40, { align: 'center' });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${getRankSuffix(rank)} Place Winner`, pageWidth / 2, 52, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`from the HackSprint event held at ${collegeName}`, pageWidth / 2, 62, { align: 'center' });

    doc.setFontSize(11);
    doc.text('This is to certify that the team', pageWidth / 2, 80, { align: 'center' });
    
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(textColor);
    doc.text(teamName, pageWidth / 2, 92, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text('has demonstrated exceptional skill in the project', pageWidth / 2, 102, { align: 'center' });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(20);
    doc.setTextColor(primaryGold);
    doc.text(`"${projectName}"`, pageWidth / 2, 114, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.text(`Awarded with a performance rating of "${performance.descriptor}" and a final score of ${averageScore.toFixed(2)} / 10.`, pageWidth / 2, 126, { align: 'center' });

    // Team Members
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryGold);
    doc.text('AWARDED TO', pageWidth / 2, 145, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.text(teamMembers.join('  •  '), pageWidth / 2, 153, { align: 'center', maxWidth: pageWidth - 80 });

    // --- Footer Section ---
    const bottomY = pageHeight - 45;

    // Signature
    const signatureX = pageWidth / 4 + 10;
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    doc.text('J. Hackerton', signatureX, bottomY + 5, { align: 'center' });
    doc.setDrawColor(primaryGold);
    doc.setLineWidth(0.2);
    doc.line(signatureX - 25, bottomY + 7, signatureX + 25, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    doc.text('HackSprint Committee Lead', signatureX, bottomY + 12, { align: 'center' });

    // Date
    const dateX = pageWidth * 3 / 4 - 10;
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(textColor);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), dateX, bottomY + 5, { align: 'center' });
    doc.line(dateX - 30, bottomY + 7, dateX + 30, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    doc.text('Date of Issue', dateX, bottomY + 12, { align: 'center' });
    
    // QR Code for verification
    const qrX = pageWidth / 2;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 200, color: { dark: primaryGold, light: '#00000000' }});
    doc.addImage(qrCodeDataUrl, 'PNG', qrX - 15, bottomY, 30, 30);
    doc.setFontSize(8);
    doc.text('Verify authenticity', qrX, bottomY + 35, { align: 'center' });
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
    const accentBlue = '#e7f3ff';

    // --- Background & Border ---
    doc.setFillColor(backgroundColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Decorative bars
    doc.setFillColor(primaryBlue);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setFillColor(accentBlue);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    

    // --- Main Content ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(darkText);
    doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 45, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(lightText);
    doc.text('This certificate is presented to', pageWidth / 2, 60, { align: 'center' });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(primaryBlue);
    doc.text(teamName, pageWidth / 2, 80, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(darkText);
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
    const signatureX = pageWidth / 4;
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(darkText);
    doc.text('J. Hackerton', signatureX, bottomY + 5, { align: 'center' });
    doc.setDrawColor(primaryBlue);
    doc.setLineWidth(0.2);
    doc.line(signatureX - 30, bottomY + 7, signatureX + 30, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(lightText);
    doc.text('HackSprint Committee Lead', signatureX, bottomY + 12, { align: 'center' });

    // Date
    const dateX = pageWidth * 3 / 4;
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(darkText);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), dateX, bottomY + 5, { align: 'center' });
    doc.line(dateX - 30, bottomY + 7, dateX + 30, bottomY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(lightText);
    doc.text('Date of Issue', dateX, bottomY + 12, { align: 'center' });

    // QR Code
    const qrX = pageWidth / 2;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', width: 200, color: { dark: darkText, light: '#00000000' }});
    doc.addImage(qrCodeDataUrl, 'PNG', qrX - 12.5, bottomY - 5, 25, 25);
    doc.setFontSize(8);
    doc.text('Verify authenticity', qrX, bottomY + 25, { align: 'center' });

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
