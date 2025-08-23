"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Project, Score, Team, User } from '@/lib/types';
import { JUDGING_RUBRIC } from '@/lib/constants';
import Link from 'next/link';
import { ArrowLeft, Bot, Loader } from 'lucide-react';
import { getAiProjectSummary } from '@/app/actions';

interface ScoringFormProps {
    project: Project;
    onBack: () => void;
}

export default function ScoringForm({ project, onBack }: ScoringFormProps) {
    const { state, dispatch } = useHackathon();
    const { currentJudge, teams } = state;

    const [scores, setScores] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    
    useEffect(() => {
        const initialScores: Record<string, number> = {};
        const initialComments: Record<string, string> = {};
        project.scores
            .filter(s => s.judgeId === currentJudge?.id)
            .forEach(s => {
                initialScores[s.criteria] = s.value;
                initialComments[s.criteria] = s.comment;
            });
        setScores(initialScores);
        setComments(initialComments);
    }, [project, currentJudge]);

    const handleScoreChange = (criteriaId: string, value: number[]) => {
        setScores(prev => ({ ...prev, [criteriaId]: value[0] }));
    };

    const handleCommentChange = (criteriaId: string, value: string) => {
        setComments(prev => ({ ...prev, [criteriaId]: value }));
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        setAiSummary('');
        try {
            const summary = await getAiProjectSummary({
                projectName: project.name,
                projectDescription: project.description,
                githubUrl: project.githubUrl,
            });
            setAiSummary(summary);
        } catch (error) {
            console.error("Error generating AI summary:", error);
            setAiSummary("Could not generate summary.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleSubmitScores = (e: React.FormEvent) => {
        e.preventDefault();
        if (project && currentJudge) {
            const projectScores: Score[] = JUDGING_RUBRIC.map(criteria => ({
                judgeId: currentJudge.id,
                criteria: criteria.id,
                value: scores[criteria.id] || 0,
                comment: comments[criteria.id] || '',
            }));
            dispatch({ type: 'SCORE_PROJECT', payload: { projectId: project.id, judgeId: currentJudge.id, scores: projectScores } });
            onBack();
        }
    };
    
    const team = teams.find(t => t.id === project.teamId);

    return (
        <div className="container max-w-3xl mx-auto py-12 animate-slide-in-up">
            <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">{project.name}</CardTitle>
                    <CardDescription className="text-lg text-primary">by {(team?.name as string) || 'Unknown Team'}</CardDescription>
                    <p className="text-muted-foreground pt-2">{project.description}</p>
                    <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline pt-2 block">View on GitHub</Link>
                </CardHeader>

                <CardContent>
                    <div className="border-t pt-6 space-y-4">
                        <h3 className="text-xl font-bold font-headline flex items-center gap-2"><Bot className="text-primary"/> AI Summary</h3>
                        <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary} variant="outline">
                            {isGeneratingSummary ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "Generate AI Project Summary"}
                        </Button>
                        {aiSummary && (
                             <Card className="bg-muted/50">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-foreground">{aiSummary}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </CardContent>
                
                <CardContent>
                    <form onSubmit={handleSubmitScores} className="space-y-6 border-t pt-6">
                        <h3 className="text-xl font-bold font-headline">Scoring Rubric</h3>
                        {JUDGING_RUBRIC.map(criteria => (
                            <div key={criteria.id}>
                                <Label htmlFor={`score-${criteria.id}`} className="text-foreground text-base">{criteria.name} (0-{criteria.max})</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <Slider
                                        id={`score-${criteria.id}`}
                                        min={0}
                                        max={criteria.max}
                                        step={1}
                                        value={[scores[criteria.id] || 0]}
                                        onValueChange={(value) => handleScoreChange(criteria.id, value)}
                                    />
                                    <span className="font-bold text-lg text-accent w-12 text-center">{scores[criteria.id] || 0}</span>
                                </div>
                                <Textarea
                                  placeholder="Comments (optional)"
                                  value={comments[criteria.id] || ''}
                                  onChange={e => handleCommentChange(criteria.id, e.target.value)}
                                  className="mt-2"
                                />
                            </div>
                        ))}
                        <Button type="submit" className="w-full">Submit Score</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
