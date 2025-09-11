
"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Project, Score, TeamMember } from '@/lib/types';
import { JUDGING_RUBRIC, INDIVIDUAL_JUDGING_RUBRIC } from '@/lib/constants';
import Link from 'next/link';
import { Bot, Loader, User } from 'lucide-react';
import { getAiProjectSummary } from '@/app/actions';
import BackButton from '@/components/layout/BackButton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ScoringFormProps {
    project: Project;
    onBack: () => void;
}

export default function ScoringForm({ project, onBack }: ScoringFormProps) {
    const { state, api } = useHackathon();
    const { currentJudge, teams, selectedHackathonId } = state;

    const [scores, setScores] = useState<Record<string, Record<string, number>>>({}); // { [memberId/team]: { [criteriaId]: value } }
    const [comments, setComments] = useState<Record<string, Record<string, string>>>({}); // { [memberId/team]: { [criteriaId]: comment } }

    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const team = teams.find(t => t.id === project.teamId);

    useEffect(() => {
        if (!currentJudge) return;

        const initialScores: Record<string, Record<string, number>> = {};
        const initialComments: Record<string, Record<string, string>> = {};

        project.scores
            .filter(s => s.judgeId === currentJudge.id)
            .forEach(s => {
                const targetId = s.memberId || 'team';
                if (!initialScores[targetId]) initialScores[targetId] = {};
                if (!initialComments[targetId]) initialComments[targetId] = {};
                
                initialScores[targetId][s.criteria] = s.value;
                initialComments[targetId][s.criteria] = s.comment;
            });
        setScores(initialScores);
        setComments(initialComments);
    }, [project, currentJudge]);

    const handleScoreChange = (targetId: string, criteriaId: string, value: number[]) => {
        setScores(prev => ({
            ...prev,
            [targetId]: { ...prev[targetId], [criteriaId]: value[0] }
        }));
    };

    const handleCommentChange = (targetId: string, criteriaId: string, value: string) => {
        setComments(prev => ({
            ...prev,
            [targetId]: { ...prev[targetId], [criteriaId]: value }
        }));
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

    const handleSubmitScores = async (e: React.FormEvent) => {
        e.preventDefault();
        if (project && currentJudge && selectedHackathonId) {
            setIsSubmitting(true);
            
            const allScores: Score[] = [];
            
            // Team scores
            JUDGING_RUBRIC.forEach(criteria => {
                allScores.push({
                    judgeId: currentJudge.id,
                    criteria: criteria.id,
                    value: scores['team']?.[criteria.id] || 0,
                    comment: comments['team']?.[criteria.id] || '',
                });
            });

            // Individual scores
            team?.members.forEach(member => {
                INDIVIDUAL_JUDGING_RUBRIC.forEach(criteria => {
                    allScores.push({
                        judgeId: currentJudge.id,
                        memberId: member.id,
                        criteria: criteria.id,
                        value: scores[member.id]?.[criteria.id] || 0,
                        comment: comments[member.id]?.[criteria.id] || '',
                    });
                });
            });
            
            try {
                await api.scoreProject(selectedHackathonId, project.id, currentJudge.id, allScores);
                onBack();
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    const renderScoringBlock = (rubric: typeof JUDGING_RUBRIC, targetId: string) => (
        <div className="space-y-6">
            {rubric.map(criteria => (
                <div key={`${targetId}-${criteria.id}`}>
                    <Label htmlFor={`score-${targetId}-${criteria.id}`} className="text-foreground text-base">{criteria.name} (0-{criteria.max})</Label>
                    <div className="flex items-center gap-4 mt-2">
                        <Slider
                            id={`score-${targetId}-${criteria.id}`}
                            min={0}
                            max={criteria.max}
                            step={1}
                            value={[scores[targetId]?.[criteria.id] || 0]}
                            onValueChange={(value) => handleScoreChange(targetId, criteria.id, value)}
                            disabled={isSubmitting}
                        />
                        <span className="font-bold text-lg text-accent w-12 text-center">{scores[targetId]?.[criteria.id] || 0}</span>
                    </div>
                    <Textarea
                        placeholder="Comments (optional)"
                        value={comments[targetId]?.[criteria.id] || ''}
                        onChange={e => handleCommentChange(targetId, criteria.id, e.target.value)}
                        className="mt-2"
                        disabled={isSubmitting}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <div className="container max-w-3xl mx-auto py-12 animate-slide-in-up">
            <BackButton />
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
                
                <form onSubmit={handleSubmitScores}>
                    <CardContent className="border-t pt-6">
                        <h3 className="text-xl font-bold font-headline mb-4">Team Scoring</h3>
                        {renderScoringBlock(JUDGING_RUBRIC, 'team')}
                    </CardContent>

                    <CardContent className="border-t pt-6">
                        <h3 className="text-xl font-bold font-headline mb-4">Individual Scoring</h3>
                         <Accordion type="single" collapsible className="w-full">
                            {team?.members.map(member => (
                                <AccordionItem value={member.id} key={member.id}>
                                    <AccordionTrigger>
                                        <span className="flex items-center gap-2"><User className="h-4 w-4"/>{member.name}</span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {renderScoringBlock(INDIVIDUAL_JUDGING_RUBRIC, member.id)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>

                    <CardFooter className="border-t pt-6">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Submit Score'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
