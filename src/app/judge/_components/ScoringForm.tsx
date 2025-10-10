
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ProjectSubmission, ProjectIdea, Score, TeamMember, ReviewType, ChatMessage } from '@/lib/types';
import { 
    INTERNAL_STAGE_1_RUBRIC, 
    INDIVIDUAL_STAGE_1_RUBRIC,
    INTERNAL_STAGE_2_RUBRIC,
    INDIVIDUAL_STAGE_2_RUBRIC,
    INTERNAL_FINAL_RUBRIC,
    INDIVIDUAL_INTERNAL_FINAL_RUBRIC,
    EXTERNAL_FINAL_RUBRIC,
    INDIVIDUAL_EXTERNAL_FINAL_RUBRIC
} from '@/lib/constants';
import Link from 'next/link';
import { Bot, Loader, User, Tags, FileText, Link as LinkIcon, AlertTriangle, Send, MessageSquare, Presentation } from 'lucide-react';
import { getAiProjectSummary, generatePitchOutline, generatePitchAudioAction } from '@/app/actions';
import BackButton from '@/components/layout/BackButton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { GeneratePitchOutlineOutput } from '@/ai/flows/generate-pitch-outline';
import { marked } from 'marked';


interface ScoringFormProps {
    project: ProjectSubmission;
    onBack: () => void;
}

type RubricItem = { id: string; name: string; max: number; description: string };

export default function ScoringForm({ project: submission, onBack }: ScoringFormProps) {
    const { state, api } = useHackathon();
    const { currentFaculty, teams, users } = state;
    const isExternal = currentFaculty?.role === 'external';

    const [scores, setScores] = useState<Record<string, Record<string, number>>>({}); // { [memberId/team]: { [criteriaId]: value } }
    const [comments, setComments] = useState<Record<string, Record<string, string>>>({}); // { [memberId/team]: { [criteriaId]: comment } }

    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [pitchOutline, setPitchOutline] = useState<GeneratePitchOutlineOutput | null>(null);
    const [pitchAudio, setPitchAudio] = useState<{ audioDataUri: string } | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    
    const team = teams.find(t => t.id === submission.teamId);

    const { currentReviewType, currentTeamRubric, currentIndividualRubric } = useMemo(() => {
        let reviewType: ReviewType | null = null;
        let teamRubric: RubricItem[] = [];
        let individualRubric: RubricItem[] = [];

        if (isExternal && submission.reviewStage === 'ExternalFinal') {
            reviewType = 'ExternalFinal';
            teamRubric = EXTERNAL_FINAL_RUBRIC;
            individualRubric = INDIVIDUAL_EXTERNAL_FINAL_RUBRIC;
        } else {
            switch (submission.reviewStage) {
                case 'Stage1':
                    reviewType = 'InternalStage1';
                    teamRubric = INTERNAL_STAGE_1_RUBRIC;
                    individualRubric = INDIVIDUAL_STAGE_1_RUBRIC;
                    break;
                case 'Stage2':
                    reviewType = 'InternalStage2';
                    teamRubric = INTERNAL_STAGE_2_RUBRIC;
                    individualRubric = INDIVIDUAL_STAGE_2_RUBRIC;
                    break;
                case 'InternalFinal':
                    reviewType = 'InternalFinal';
                    teamRubric = INTERNAL_FINAL_RUBRIC;
                    individualRubric = INDIVIDUAL_INTERNAL_FINAL_RUBRIC;
                    break;
            }
        }
        return { currentReviewType: reviewType, currentTeamRubric: teamRubric, currentIndividualRubric: individualRubric };
    }, [submission.reviewStage, isExternal]);

    useEffect(() => {
        if (!currentFaculty || !currentReviewType) return;

        const initialScores: Record<string, Record<string, number>> = {};
        const initialComments: Record<string, Record<string, string>> = {};

        submission.scores
            .filter(s => s.evaluatorId === currentFaculty.id && s.reviewType === currentReviewType)
            .forEach(s => {
                const targetId = s.memberId || 'team';
                if (!initialScores[targetId]) initialScores[targetId] = {};
                if (!initialComments[targetId]) initialComments[targetId] = {};
                
                initialScores[targetId][s.criteria] = s.value;
                if(s.comment) {
                  initialComments[targetId][s.criteria] = s.comment;
                }
            });
        setScores(initialScores);
        setComments(initialComments);
    }, [submission, currentFaculty, currentReviewType]);

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

    const handleGenerateSummary = async (idea: ProjectIdea) => {
        setIsGeneratingSummary(true);
        setAiSummary('');
        try {
            const summary = await getAiProjectSummary({
                projectName: idea.title,
                projectDescription: idea.abstractText,
                githubUrl: idea.githubUrl,
            });
            setAiSummary(summary);
        } catch (error) {
            console.error("Error generating AI summary:", error);
            setAiSummary("Could not generate summary.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleGenerateOutline = async (idea: ProjectIdea) => {
        if (!team) return;
        setIsGeneratingOutline(true);
        setPitchOutline(null);
        setPitchAudio(null);
        try {
            const creator = users.find(u => u.id === team.creatorId);
            const result = await generatePitchOutline({
                projectName: idea.title,
                projectDescription: idea.description,
                aiCodeReview: aiSummary || undefined,
                course: creator?.department,
                guideName: team.guide?.name,
                teamMembers: team.members.map(m => m.name),
            });
            setPitchOutline(result);
        } finally {
            setIsGeneratingOutline(false);
        }
    };
    
    const handleGenerateAudio = async () => {
        if (!pitchOutline) return;
        setIsGeneratingAudio(true);
        setPitchAudio(null);
        try {
            const script = pitchOutline.slides
                .map(slide => `${slide.title}. ${slide.content.replace(/^-/gm, '')}`)
                .join('\n\n');
            const result = await generatePitchAudioAction({ script });
            if (result) {
                setPitchAudio(result);
            }
        } catch (error) {
            console.error("Failed to generate audio:", error);
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handleSubmitScores = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submission || !currentFaculty || !currentReviewType) return;

        setIsSubmitting(true);
        
        const newScores: Score[] = [];
        
        // Team scores
        currentTeamRubric.forEach(criteria => {
            newScores.push({
                evaluatorId: currentFaculty.id,
                criteria: criteria.id,
                value: scores['team']?.[criteria.id] || 0,
                comment: comments['team']?.[criteria.id] || '',
                reviewType: currentReviewType,
            });
        });

        // Individual scores
        team?.members.forEach(member => {
            currentIndividualRubric.forEach(criteria => {
                newScores.push({
                    evaluatorId: currentFaculty.id,
                    memberId: member.id,
                    criteria: criteria.id,
                    value: scores[member.id]?.[criteria.id] || 0,
                    comment: comments[member.id]?.[criteria.id] || '',
                    reviewType: currentReviewType,
                });
            });
        });
        
        try {
            await api.evaluateProject(submission.id, currentFaculty.id, newScores);
            onBack();
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderScoringBlock = (rubric: RubricItem[], targetId: string) => (
        <div className="space-y-6">
            {rubric.map(criteria => (
                <div key={`${targetId}-${criteria.id}`}>
                    <Label htmlFor={`score-${targetId}-${criteria.id}`} className="text-foreground text-base">{criteria.name} (0-{criteria.max})</Label>
                    <p className="text-xs text-muted-foreground mb-2">{criteria.description}</p>
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
    
    if (!currentReviewType) {
        return (
             <div className="container max-w-3xl mx-auto py-12">
                 <BackButton />
                 <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2"><AlertTriangle /> Invalid Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This project is not in a valid state for review.</p>
                    </CardContent>
                 </Card>
            </div>
        )
    }

    const stageTitles: Record<ReviewType, string> = {
        InternalStage1: 'Project Stage 1 Review',
        InternalStage2: 'Project Stage 2 Review',
        InternalFinal: 'Final Internal Review',
        ExternalFinal: 'Final External Review',
    }

    return (
        <div className="container max-w-3xl mx-auto py-12 animate-slide-in-up">
            <BackButton />
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Reviewing: {submission.projectIdeas[0]?.title || "Untitled Project"}</CardTitle>
                    <CardDescription className="text-lg text-primary">Team: {team?.name || 'Unknown Team'}</CardDescription>
                </CardHeader>
                
                <CardContent>
                    <Tabs defaultValue="details" className="w-full">
                         <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Project Details</TabsTrigger>
                            <TabsTrigger value="scoring">Scoring</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="mt-4">
                             <Tabs defaultValue="idea-1" className="w-full">
                                <TabsList className="grid w-full grid-cols-1">
                                    {submission.projectIdeas.map((idea, index) => (
                                        <TabsTrigger key={idea.id} value={`idea-${index + 1}`}>{idea.title}</TabsTrigger>
                                    ))}
                                </TabsList>
                                {submission.projectIdeas.map((idea, index) => (
                                    <TabsContent key={idea.id} value={`idea-${index + 1}`}>
                                        <Card className="mt-4 bg-muted/50">
                                            <CardHeader>
                                                <CardTitle>{idea.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Description</h4>
                                                    <p>{idea.description}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Abstract</h4>
                                                    <p className="whitespace-pre-wrap">{idea.abstractText}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><Tags className="h-4 w-4" /> Keywords</h4>
                                                    <p>{idea.keywords}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground">GitHub</h4>
                                                    <Link href={idea.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{idea.githubUrl}</Link>
                                                </div>
                                                {idea.abstractFileUrl && (
                                                    <div>
                                                        <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Abstract Document</h4>
                                                        <Link href={idea.abstractFileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">View Uploaded File</Link>
                                                    </div>
                                                )}
                                                <div className="border-t pt-4">
                                                    <Button onClick={() => handleGenerateSummary(idea)} disabled={isGeneratingSummary} variant="outline" size="sm">
                                                        {isGeneratingSummary ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "Generate AI Summary"}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                ))}
                            </Tabs>
                             {aiSummary && (
                                <div className="border-t pt-6 mt-6 space-y-4">
                                    <h3 className="text-xl font-bold font-headline flex items-center gap-2"><Bot className="text-primary"/> AI Summary</h3>
                                    <Card className="bg-muted/50">
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-foreground">{aiSummary}</p>
                                        </CardContent>
                                    </Card>
                                     <div className="flex flex-wrap gap-2">
                                        <Button onClick={() => handleGenerateOutline(submission.projectIdeas[0])} disabled={isGeneratingOutline} variant="outline" size="sm">
                                            {isGeneratingOutline ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "AI Pitch Coach"}
                                        </Button>
                                     </div>
                                </div>
                            )}
                            {pitchOutline && (
                                <div className="mt-6 border-t pt-4 space-y-4">
                                    <div className="flex flex-wrap gap-2 justify-between items-center">
                                        <h4 className="font-bold flex items-center gap-2"><Presentation className="text-primary"/> Generated Presentation Outline</h4>
                                        <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio} size="sm">
                                            {isGeneratingAudio ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating Audio...</> : "Generate Audio"}
                                        </Button>
                                    </div>
                                    {pitchAudio?.audioDataUri && (
                                        <div className="mt-4">
                                            <audio controls src={pitchAudio.audioDataUri} className="w-full">
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    )}
                                    <Accordion type="single" collapsible className="w-full">
                                        {pitchOutline.slides.map((slide, index) => (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>{index + 1}. {slide.title}</AccordionTrigger>
                                            <AccordionContent>
                                                <div
                                                    className="prose prose-sm dark:prose-invert text-foreground max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: marked(slide.content) as string }}
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            )}
                        </TabsContent>
                         <TabsContent value="scoring" className="mt-4">
                             <form onSubmit={handleSubmitScores}>
                                <div className="p-4 rounded-md border bg-card">
                                    <h3 className="text-xl font-bold font-headline mb-4">{stageTitles[currentReviewType]}</h3>
                                    {renderScoringBlock(currentTeamRubric, 'team')}
                                </div>
                                
                                <div className="mt-6 p-4 rounded-md border bg-card">
                                    <h3 className="text-xl font-bold font-headline mb-4">Individual Scoring</h3>
                                    <Accordion type="single" collapsible className="w-full">
                                        {team?.members.map(member => (
                                            <AccordionItem value={member.id} key={member.id}>
                                                <AccordionTrigger>
                                                    <span className="flex items-center gap-2"><User className="h-4 w-4"/>{member.name}</span>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    {renderScoringBlock(currentIndividualRubric, member.id)}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                                <CardFooter className="pt-6 px-0">
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Submit Score'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
