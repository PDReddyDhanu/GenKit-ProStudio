"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Team, Project } from '@/lib/types';
import { CheckCircle, Bot, Loader } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getAiCodeReview } from '@/app/actions';
import { Button } from '@/components/ui/button';

interface ProjectViewProps {
    project: Project;
    team: Team;
}

export default function ProjectView({ project, team }: ProjectViewProps) {
    const [isReviewing, setIsReviewing] = useState(false);
    const [review, setReview] = useState('');

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
                        <p><span className="font-bold text-muted-foreground">Team:</span> {team.name}</p>
                        <p><span className="font-bold text-muted-foreground">Description:</span> {project.description}</p>
                        <p><span className="font-bold text-muted-foreground">GitHub:</span> <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{project.githubUrl}</Link></p>
                    </div>
                    <div className="mt-6 border-t pt-4">
                        <h4 className="font-bold">Team Members:</h4>
                        <ul className="list-disc list-inside text-muted-foreground">
                            {team.members.map(m => <li key={m.id}>{m.name}</li>)}
                        </ul>
                    </div>

                    <div className="mt-6 border-t pt-4 space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Bot className="text-primary"/> AI Code Review</h4>
                        <Button onClick={handleGetReview} disabled={isReviewing}>
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
