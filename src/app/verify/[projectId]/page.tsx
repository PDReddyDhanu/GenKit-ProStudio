

"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import type { ProjectSubmission, Team } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const getPerformanceDetails = (score: number) => {
    const totalPercentage = score; // Score is already out of 100
    if (totalPercentage >= 90) return { descriptor: 'Outstanding', remarks: 'Passed' };
    if (totalPercentage >= 80) return { descriptor: 'Very Satisfactory', remarks: 'Passed' };
    if (totalPercentage >= 70) return { descriptor: 'Satisfactory', remarks: 'Passed' };
    if (totalPercentage >= 50) return { descriptor: 'Fairly Satisfactory', remarks: 'Passed' };
    return { descriptor: 'Did Not Meet Expectations', remarks: 'Failed' };
};

const getRankSuffix = (rankNum: number | null) => {
    if (!rankNum) return '';
    if (rankNum === 1) return 'st';
    if (rankNum === 2) return 'nd';
    if (rankNum === 3) return 'rd';
    return 'th';
};

interface VerificationData {
    project?: ProjectSubmission;
    team?: Team;
    rank?: number | null;
    performance?: { descriptor: string; remarks: string };
    collegeName?: string | null;
}

export default function CertificateVerifyPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
    const [data, setData] = useState<VerificationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;

        const fetchCertificateData = async () => {
            try {
                // Ensure this code only runs on the client
                if (typeof window === 'undefined') {
                    return;
                }
                const urlParams = new URLSearchParams(window.location.search);
                const collegeId = urlParams.get('college');
                const rankParam = urlParams.get('rank');

                if (!collegeId) {
                    throw new Error("College information is missing from the verification link.");
                }

                const projectDoc = await getDoc(doc(db, `colleges/${collegeId}/projects/${projectId}`));
                if (!projectDoc.exists()) {
                    throw new Error("Project not found.");
                }
                const project = { id: projectDoc.id, ...projectDoc.data() } as ProjectSubmission;

                const teamDoc = await getDoc(doc(db, `colleges/${collegeId}/teams/${project.teamId}`));
                if (!teamDoc.exists()) {
                    throw new Error("Team not found.");
                }
                const team = { id: teamDoc.id, ...teamDoc.data() } as Team;

                const rank = rankParam ? parseInt(rankParam, 10) : null;
                const performance = getPerformanceDetails(project.totalScore);

                setData({ project, team, rank, performance, collegeName: collegeId });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCertificateData();
    }, [projectId]);

    const { project, team, rank, performance, collegeName } = data || {};

    return (
        <div className="container max-w-2xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 font-headline">Certificate Verification</h1>
            
            {isLoading ? (
                 <Card>
                    <CardContent className="pt-6 text-center flex items-center justify-center space-x-2">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                        <p>Verifying certificate...</p>
                    </CardContent>
                </Card>
            ) : error || !project || !team || !performance ? (
                 <Card className="border-2 border-red-500">
                    <CardContent className="pt-6 text-center">
                        <XCircle className="h-16 w-16 mx-auto text-red-400" />
                        <h2 className="text-3xl font-bold mt-4 text-red-300 font-headline">Verification Failed</h2>
                        <p className="text-muted-foreground mt-1 px-4">{error || 'This certificate is invalid or could not be found.'}</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-2 border-green-500">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
                        <CardTitle className="text-3xl mt-4 text-green-300 font-headline">Certificate Verified</CardTitle>
                        <CardDescription>This certificate is authentic and has been issued by GenKit ProStudio for {collegeName}.</CardDescription>
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
                            <p className="font-bold text-xl text-secondary">{project.totalScore.toFixed(2)} / 100</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Project</p>
                            <p className="font-bold text-xl">{project.projectIdeas[0]?.title || 'Untitled Project'}</p>
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
            )}
        </div>
    );
};
