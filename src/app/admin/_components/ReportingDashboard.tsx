
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Wand2, FileText, AlertTriangle, Download } from 'lucide-react';
import { generateSummaryReport } from '@/app/actions';
import { marked } from 'marked';
import type { Project, Team } from '@/lib/types';
import jsPDF from 'jspdf';

export default function ReportingDashboard() {
    const { state } = useHackathon();
    const { projects, teams, selectedCollege, selectedHackathonId } = state;
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const eventProjects = useMemo(() => {
        return projects.filter(p => p.hackathonId === selectedHackathonId);
    }, [projects, selectedHackathonId]);

    const eventTeams = useMemo(() => {
        const eventTeamIds = new Set(eventProjects.map(p => p.teamId));
        return teams.filter(t => eventTeamIds.has(t.id));
    }, [teams, eventProjects]);


    const handleGenerateReport = async () => {
        if (!selectedCollege) return;
        setIsLoading(true);
        setReport(null);
        try {
            const result = await generateSummaryReport({
                collegeName: selectedCollege,
                projects: eventProjects as unknown as Project[],
                teams: eventTeams,
            });
            setReport(result);
        } catch (error) {
            console.error("Failed to generate report:", error);
            setReport("Error: Could not generate the report.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadReport = () => {
        if (!report || !selectedCollege) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(`Project Summary Report: ${selectedCollege}`, pageWidth / 2, 20, { align: 'center' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        // Remove markdown for cleaner PDF text
        const plainTextReport = report.replace(/#/g, '').replace(/\*/g, '');

        const splitText = doc.splitTextToSize(plainTextReport, pageWidth - margin * 2);
        doc.text(splitText, margin, 30);
        
        const filename = `${selectedCollege.replace(/\s/g, '_')}_Report.pdf`;
        doc.save(filename);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Automated Report Generation</CardTitle>
                    <CardDescription>Generate a comprehensive AI-powered summary report for all projects in the selected event.</CardDescription>
                </CardHeader>
                <CardContent>
                     {eventProjects.length > 0 ? (
                        <Button onClick={handleGenerateReport} disabled={isLoading}>
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating Report...</> : <><Wand2 className="mr-2 h-4 w-4"/> Generate College Report</>}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3 text-yellow-500">
                            <AlertTriangle />
                            <p>No projects have been submitted for this event, so a report cannot be generated.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {report && (
                 <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="font-headline flex items-center gap-2"><FileText /> Generated Report</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                            <Download className="mr-2 h-4 w-4"/> Download as PDF
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div 
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: marked(report) as string }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
