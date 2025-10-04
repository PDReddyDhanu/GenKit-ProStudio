
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectSubmission, ProjectIdea, ProjectStatusUpdate } from '@/lib/types';
import { CheckCircle, Bot, Loader, Download, Pencil, Presentation, ArrowLeft, Link as LinkIcon, FileText, Tags, Github, PlusCircle, Clock, XCircle, UserCheck, Milestone } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAiCodeReview, generatePitchOutline } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useHackathon } from '@/context/HackathonProvider';
import { generateCertificate } from '@/lib/pdf';
import { GeneratePitchOutlineOutput } from '@/ai/flows/generate-pitch-outline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { marked } from 'marked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';

interface ProjectViewProps {
    submission: ProjectSubmission;
    onBack: () => void;
    onAddIdea: () => void;
}

const IdeaDisplay = ({ idea }: { idea: ProjectIdea }) => {
    return (
        <div className="space-y-4">
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
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</h4>
                <Link href={idea.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{idea.githubUrl}</Link>
            </div>
            {idea.abstractFileUrl && (
                <div>
                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Abstract Document</h4>
                    <Link href={idea.abstractFileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">View Uploaded File</Link>
                </div>
            )}
        </div>
    )
}

const StatusTimeline = ({ project, onResubmit }: { project: ProjectSubmission, onResubmit: () => void }) => {
    const history = project.statusHistory || [];
    const stageOrder: ProjectSubmission['status'][] = ['PendingGuide', 'PendingR&D', 'PendingHoD', 'Approved'];
    
    const getStatusForStage = (stage: ProjectSubmission['status']) => {
        const stageIndex = stageOrder.indexOf(stage);
        const currentStatusIndex = stageOrder.indexOf(project.status);

        if (currentStatusIndex > stageIndex) {
            // This stage is in the past and has been completed.
            const update = [...history].reverse().find(h => h.to === stageOrder[stageIndex + 1] || h.to === stage);
            return { status: 'complete' as const, update };
        }
        
        if (currentStatusIndex === stageIndex) {
             // This is the current pending stage
             const update = [...history].reverse().find(h => h.to === stage);
             return { status: 'pending' as const, update };
        }
        
        // This stage is in the future.
        return { status: 'upcoming' as const, update: null };
    };
    
    const isRejected = project.status === 'Rejected';
    const rejectionUpdate = history.find(h => h.to === 'Rejected');

    const stages: { key: ProjectSubmission['status'], name: string }[] = [
        { key: 'PendingGuide', name: 'Guide Review' },
        { key: 'PendingR&D', name: 'R&D Coordinator Review' },
        { key: 'PendingHoD', name: 'HOD Review' },
    ];
    
     const finalApprovedStage = {
        key: 'Approved',
        name: 'Project Approved',
        update: history.find(h => h.to === 'Approved')
    };

    const getIcon = (status: 'complete' | 'pending' | 'upcoming' | 'rejected') => {
        switch (status) {
            case 'complete': return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'pending': return <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />;
            case 'rejected': return <XCircle className="h-6 w-6 text-red-500" />;
            default: return <Milestone className="h-6 w-6 text-muted-foreground" />;
        }
    };
    
    if (isRejected) {
        return (
            <div className="relative border-l-2 border-dashed border-border pl-8 space-y-8 py-4">
                 <div className="relative">
                    <div className="absolute -left-[45px] top-0 h-10 w-10 bg-background flex items-center justify-center rounded-full border-2 border-red-500">
                        {getIcon('rejected')}
                    </div>
                    <p className="font-bold text-lg text-red-400">Project Rejected</p>
                    {rejectionUpdate && (
                         <div className="text-xs text-muted-foreground">{format(new Date(rejectionUpdate.timestamp), 'PPP p')} by {rejectionUpdate.updatedBy}</div>
                    )}
                    {rejectionUpdate?.remarks && (
                        <blockquote className="mt-2 pl-4 border-l-2 border-muted-foreground text-sm text-muted-foreground italic">
                            "{rejectionUpdate.remarks}"
                        </blockquote>
                    )}
                     <Button onClick={onResubmit} className="mt-4">Resubmit New Ideas</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative border-l-2 border-dashed border-border pl-8 space-y-8 py-4">
            {stages.map((stageInfo, index) => {
                const stageStatus = getStatusForStage(stageInfo.key);
                const isActive = stageStatus.status === 'pending' || stageStatus.status === 'complete';
                
                return (
                    <div key={stageInfo.key} className="relative">
                        <div className={`absolute -left-[45px] top-0 h-10 w-10 bg-background flex items-center justify-center rounded-full border-2 ${isActive ? 'border-primary' : 'border-border'}`}>
                             {getIcon(stageStatus.status)}
                        </div>
                        <p className={`font-bold text-lg ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{stageInfo.name}</p>
                        {stageStatus.update ? (
                             <>
                                <div className="text-xs text-muted-foreground">{format(new Date(stageStatus.update.timestamp), 'PPP p')} by {stageStatus.update.updatedBy}</div>
                                {stageStatus.update.remarks && (
                                    <blockquote className="mt-2 pl-4 border-l-2 border-muted-foreground text-sm text-muted-foreground italic">
                                        "{stageStatus.update.remarks}"
                                    </blockquote>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">{stageStatus.status === 'pending' ? 'Awaiting Review' : 'Upcoming'}</p>
                        )}
                    </div>
                )
            })}
             <div className="relative">
                <div className={`absolute -left-[45px] top-0 h-10 w-10 bg-background flex items-center justify-center rounded-full border-2 ${finalApprovedStage.update ? 'border-green-500' : 'border-border'}`}>
                    {getIcon(finalApprovedStage.update ? 'complete' : 'upcoming')}
                </div>
                <p className={`font-bold text-lg ${finalApprovedStage.update ? 'text-green-400' : 'text-muted-foreground'}`}>{finalApprovedStage.name}</p>
                {finalApprovedStage.update && (
                    <div className="text-xs text-muted-foreground">{format(new Date(finalApprovedStage.update.timestamp), 'PPP p')} by {finalApprovedStage.update.updatedBy}</div>
                )}
            </div>
        </div>
    );
}

export default function ProjectView({ submission: initialSubmission, onBack, onAddIdea }: ProjectViewProps) {
    const { state, api } = useHackathon();
    const { teams, selectedCollege, projects } = state;
    const [submission, setSubmission] = useState(initialSubmission);

    const [isReviewing, setIsReviewing] = useState(false);
    const [review, setReview] = useState('');
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);
    
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [pitchOutline, setPitchOutline] = useState<GeneratePitchOutlineOutput | null>(null);

    useEffect(() => {
        const updatedSubmission = projects.find(p => p.id === initialSubmission.id);
        if (updatedSubmission) {
            setSubmission(updatedSubmission);
        }
    }, [projects, initialSubmission.id]);

    const team = teams.find(t => t.id === submission.teamId);

    const handleGetReview = async (githubUrl: string) => {
        setIsReviewing(true);
        setReview('');
        try {
            const result = await getAiCodeReview({ githubUrl });
            setReview(result);
        } catch (error) {
            console.error("Error getting AI review:", error);
            setReview("Sorry, we couldn't generate a review at this time. Please try again later.");
        } finally {
            setIsReviewing(false);
        }
    };
    
    const handleDownloadCertificate = async () => {
        if (team && submission && selectedCollege) {
            setIsGeneratingCert(true);
            try {
                const teamMembers = team.members.map(m => m.name);
                await generateCertificate(team.name, submission.projectIdeas[0].title, teamMembers, submission.id, submission.totalScore, selectedCollege);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGeneratingCert(null);
            }
        }
    };

    const handleGenerateOutline = async (idea: ProjectIdea) => {
        setIsGeneratingOutline(true);
        setPitchOutline(null);
        try {
            const result = await generatePitchOutline({
                projectName: idea.title,
                projectDescription: idea.description,
                aiCodeReview: review || undefined
            });
            setPitchOutline(result);
        } finally {
            setIsGeneratingOutline(false);
        }
    };
    
    const handleResubmit = async () => {
        try {
            onAddIdea();
        } catch(e) {
            console.error(e);
        }
    }
    
    const canAddMoreIdeas = submission.projectIdeas.length < 3 && submission.status !== 'Approved' && submission.status !== 'Rejected';

    return (
        <div className="container max-w-3xl mx-auto">
             <Button variant="ghost" onClick={onBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team Management
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <div>
                                <CardTitle className="text-3xl font-bold text-secondary font-headline">Ideas Submitted!</CardTitle>
                                <CardDescription className="text-lg">Your project ideas are awaiting faculty review.</CardDescription>
                            </div>
                        </div>
                         {canAddMoreIdeas && (
                            <Button onClick={onAddIdea}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Another Idea
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="status" className="w-full">
                         <TabsList className="grid w-full grid-cols-2">
                             <TabsTrigger value="status">Project Status</TabsTrigger>
                             <TabsTrigger value="details">Submission Details</TabsTrigger>
                        </TabsList>
                         <TabsContent value="status" className="mt-6">
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="font-headline">Approval Workflow</CardTitle>
                                    <CardDescription>Track your project's progress through the approval stages.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <StatusTimeline project={submission} onResubmit={handleResubmit}/>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="details" className="mt-6">
                             <Tabs defaultValue="idea-1" className="w-full">
                                <TabsList className={`grid w-full grid-cols-${submission.projectIdeas.length}`}>
                                    {submission.projectIdeas.map((idea, index) => (
                                        <TabsTrigger key={idea.id} value={`idea-${index + 1}`}>Idea {index + 1}</TabsTrigger>
                                    ))}
                                </TabsList>
                                {submission.projectIdeas.map((idea, index) => (
                                    <TabsContent key={idea.id} value={`idea-${index + 1}`} className="mt-4">
                                        <Card className="bg-muted/50">
                                            <CardHeader>
                                                <CardTitle>{idea.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <IdeaDisplay idea={idea} />
                                                <div className="mt-6 border-t pt-4 space-y-4">
                                                    <h4 className="font-bold flex items-center gap-2"><Bot className="text-primary"/> AI Tools for this Idea</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button onClick={() => handleGetReview(idea.githubUrl)} disabled={isReviewing} variant="outline" size="sm">
                                                            {isReviewing ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Reviewing Code...</> : "Get AI Code Review"}
                                                        </Button>
                                                        <Button onClick={() => handleGenerateOutline(idea)} disabled={isGeneratingOutline} variant="outline" size="sm">
                                                            {isGeneratingOutline ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "AI Pitch Coach"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </TabsContent>
                    </Tabs>
                    
                    {review && (
                        <div className="mt-6 border-t pt-4 space-y-4">
                            <h4 className="font-bold flex items-center gap-2"><Bot className="text-primary"/> AI Code Review Result</h4>
                            <Card className="bg-muted/50">
                                <CardContent className="pt-6">
                                    <pre className="text-sm whitespace-pre-wrap font-code text-foreground">{review}</pre>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {pitchOutline && (
                        <div className="mt-6 border-t pt-4 space-y-4">
                            <div className="flex flex-wrap gap-2 justify-between items-center">
                                <h4 className="font-bold flex items-center gap-2"><Presentation className="text-primary"/> Generated Presentation Outline</h4>
                            </div>
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
                    
                    <div className="mt-6 border-t pt-4 space-y-4">
                        <Button onClick={handleDownloadCertificate} disabled={isGeneratingCert}>
                            {isGeneratingCert ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Download className="mr-2 h-4 w-4"/>Download Participation Certificate</>}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
