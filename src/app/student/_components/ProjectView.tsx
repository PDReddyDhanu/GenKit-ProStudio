

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { CheckCircle, Bot, Loader, Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getAiCodeReview } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useHackathon } from '@/context/HackathonProvider';
import { generateCertificate } from '@/lib/pdf';

interface ProjectViewProps {
    project: Project;
}

export default function ProjectView({ project }: ProjectViewProps) {
    const { state } = useHackathon();
    const { teams, selectedCollege } = state;
    const [isReviewing, setIsReviewing] = useState(false);
    const [review, setReview] = useState('');
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);

    const handleGetReview = async () => {
        setIsReviewing(true);
        setReview('');
        try {
            const result = await getAiCodeReview({ githubUrl: project.githubUrl });
            setReview(result);
        } catch (error) {
            console.error("Error getting AI review:", error);
            setReview("Sorry, we couldn't generate a review at this time. Please try again later.");
        } finally {
            setIsReviewing(false);
        }
    };
    
    const handleDownloadCertificate = async () => {
        const team = teams.find(t => t.id === project.teamId);
        if (team && project && selectedCollege) {
            setIsGeneratingCert(true);
            try {
                const teamMembers = team.members.map(m => m.name);
                await generateCertificate(team.name, project.name, teamMembers, project.id, project.averageScore, selectedCollege);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGeneratingCert(false);
            }
        }
    };

    return (
        <div className="container max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <CardTitle className="text-3xl font-bold text-secondary font-headline">{project.name}</CardTitle>
                            <CardDescription className="text-lg">Submission successful!</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <p><span className="font-bold text-muted-foreground">Description:</span> {project.description}</p>
                        <p><span className="font-bold text-muted-foreground">GitHub:</span> <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{project.githubUrl}</Link></p>
                    </div>

                    <div className="mt-6 border-t pt-4 space-y-4">
                        <Button onClick={handleDownloadCertificate} disabled={isGeneratingCert}>
                            {isGeneratingCert ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Download className="mr-2 h-4 w-4"/>Download Participation Certificate</>}
                        </Button>
                    </div>

                    <div className="mt-6 border-t pt-4 space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Bot className="text-primary"/> AI Code Review</h4>
                        <Button onClick={handleGetReview} disabled={isReviewing} variant="outline">
                            {isReviewing ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Get AI Feedback"}
                        </Button>
                        {review && (
                            <Card className="bg-muted/50">
                                <CardContent className="pt-6">
                                    <pre className="text-sm whitespace-pre-wrap font-code text-foreground">{review}</pre>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
