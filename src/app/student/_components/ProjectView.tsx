

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

const StatusTimeline = ({ history }: { history: ProjectStatusUpdate[] }) => {
    if (!history || history.length === 0) {
        return <p className="text-muted-foreground">No status history yet.</p>;
    }
    
    const getStatusIcon = (status: ProjectSubmission['status']) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'Rejected': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'PendingGuide':
            case 'PendingR&D':
            case 'PendingHoD':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default: return <Milestone className="h-5 w-5 text-muted-foreground" />;
        }
    };
    
    return (
        <div className="space-y-6 border-l-2 border-border pl-6 relative">
             <div className="absolute -left-[11px] top-0 h-full w-0.5"/>
            {history.map((update, index) => (
                 <div key={index} className="relative">
                    <div className="absolute -left-[35px] top-1.5 h-6 w-6 bg-background flex items-center justify-center rounded-full">
                         {getStatusIcon(update.to)}
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(update.timestamp), 'PPP p')}</p>
                    <p className="font-semibold text-foreground">Status changed to <span className="font-bold text-primary">{update.to}</span> by {update.updatedBy}</p>
                    {update.remarks && (
                        <blockquote className="mt-2 pl-4 border-l-2 border-muted-foreground text-sm text-muted-foreground italic">
                            "{update.remarks}"
                        </blockquote>
                    )}
                </div>
            ))}
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
                setIsGeneratingCert(false);
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
                            <h4 className="font-bold flex items-center gap-2"><Presentation className="text-primary"/> Generated Presentation Outline</h4>
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

                    <div className="mt-6 border-t pt-6 space-y-4">
                        <CardTitle className="font-headline">Approval Status & History</CardTitle>
                        <StatusTimeline history={submission.statusHistory || []} />
                    </div>
                    
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
