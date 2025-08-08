"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Project, Team } from '@/lib/types';

const getPerformanceDetails = (score: number) => {
    const roundedScore = Math.round(score);
    if (roundedScore >= 9) return { descriptor: 'Outstanding', remarks: 'Passed' };
    if (roundedScore >= 8) return { descriptor: 'Very Satisfactory', remarks: 'Passed' };
    if (roundedScore >= 7) return { descriptor: 'Satisfactory', remarks: 'Passed' };
    if (roundedScore >= 5) return { descriptor: 'Fairly Satisfactory', remarks: 'Passed' };
    return { descriptor: 'Did Not Meet Expectations', remarks: 'Failed' };
};

const getRankSuffix = (rankNum: number | null) => {
    if (!rankNum) return '';
    if (rankNum === 1) return 'st';
    if (rankNum === 2) return 'nd';
    if (rankNum === 3) return 'rd';
    return 'th';
};

export default function CertificateVerifyPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
    const { state } = useHackathon();
    const { projects, teams } = state;

    const { project, team, rank, performance } = useMemo(() => {
        const currentProject = projects.find(p => p.id === projectId);
        if (!currentProject) {
            return { project: undefined, team: undefined, rank: undefined, performance: undefined };
        }
        
        const currentTeam = teams.find(t => t.id === currentProject.teamId);

        const sortedWinners = [...projects]
            .filter(p => p.averageScore > 0)
            .sort((a, b) => b.averageScore - a.averageScore);
        
        const projectRank = sortedWinners.findIndex(p => p.id === projectId) + 1;
        const perfDetails = getPerformanceDetails(currentProject.averageScore);

        return { project: currentProject, team: currentTeam, rank: projectRank > 0 ? projectRank : null, performance: perfDetails };
    }, [projectId, projects, teams]);

    return (
        <div className="container max-w-2xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 font-headline">Certificate Verification</h1>
            
            {project && team && performance ? (
                <Card className="border-2 border-green-500">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
                        <CardTitle className="text-3xl mt-4 text-green-300 font-headline">Certificate Verified</CardTitle>
                        <CardDescription>This certificate is authentic and has been issued by HackSprint.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-muted/50 p-6 rounded-md">
                        {rank && (
                             <div>
                                <p className="text-muted-foreground text-sm">Achievement</p>
                                <p className="font-bold text-2xl text-yellow-400">{rank}{getRankSuffix(rank)} Place</p>
                            </div>
                        )}
                        <div>
                            <p className="text-muted-foreground text-sm">Performance</p>
                            <p className="font-bold text-xl">{performance.descriptor} ({performance.remarks})</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground text-sm">Final Score</p>
                            <p className="font-bold text-xl text-secondary">{project.averageScore.toFixed(2)} / 10</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Project</p>
                            <p className="font-bold text-xl">{project.name}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground text-sm">Team</p>
                            <p className="font-bold text-xl">{team.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Awarded Team Members</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                {team.members.map(member => (
                                    <li key={member.id} className="font-semibold text-foreground">{member.name}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-2 border-red-500">
                    <CardContent className="pt-6 text-center">
                        <XCircle className="h-16 w-16 mx-auto text-red-400" />
                        <h2 className="text-3xl font-bold mt-4 text-red-300 font-headline">Verification Failed</h2>
                        <p className="text-muted-foreground mt-1 px-4">This certificate is invalid or could not be found. The hackathon data may not be available in this browser.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
