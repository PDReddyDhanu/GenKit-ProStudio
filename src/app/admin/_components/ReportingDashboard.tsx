
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Wand2, FileText, AlertTriangle } from 'lucide-react';
import { generateHackathonReport } from '@/app/actions';
import { marked } from 'marked';
import type { Hackathon } from '@/lib/types';

interface ReportingDashboardProps {
    hackathon: Hackathon;
}

export default function ReportingDashboard({ hackathon }: ReportingDashboardProps) {
    const { state } = useHackathon();
    const { projects, teams } = state;
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const hackathonProjects = useMemo(() => {
        return projects.filter(p => p.hackathonId === hackathon.id);
    }, [projects, hackathon.id]);

    const hackathonTeams = useMemo(() => {
        const projectTeamIds = new Set(hackathonProjects.map(p => p.teamId));
        return teams.filter(t => projectTeamIds.has(t.id));
    }, [teams, hackathonProjects]);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport(null);
        try {
            const result = await generateHackathonReport({
                hackathon,
                projects: hackathonProjects,
                teams: hackathonTeams,
            });
            setReport(result);
        } catch (error) {
            console.error("Failed to generate report:", error);
            setReport("Error: Could not generate the report.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Automated Report Generation</CardTitle>
                    <CardDescription>Generate a comprehensive AI-powered summary report for the "{hackathon.name}" event.</CardDescription>
                </CardHeader>
                <CardContent>
                     {hackathonProjects.length > 0 ? (
                        <Button onClick={handleGenerateReport} disabled={isLoading}>
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating Report...</> : <><Wand2 className="mr-2 h-4 w-4"/> Generate Hackathon Report</>}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3 text-yellow-500">
                            <AlertTriangle />
                            <p>No projects were submitted for this hackathon, so a report cannot be generated.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {report && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><FileText /> Generated Report</CardTitle>
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
