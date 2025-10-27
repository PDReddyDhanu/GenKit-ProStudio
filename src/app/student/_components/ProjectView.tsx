

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectSubmission, ProjectIdea, ProjectStatusUpdate, Team, TeamMember } from '@/lib/types';
import { CheckCircle, Bot, Loader, Download, Pencil, Presentation, ArrowLeft, Link as LinkIcon, FileText, Tags, Github, PlusCircle, Clock, XCircle, UserCheck, Milestone, Star, Video } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { getAiCodeReview, generatePitchOutline, generatePitchAudioAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useHackathon } from '@/context/HackathonProvider';
import { generateCertificate } from '@/lib/pdf';
import { GeneratePitchOutlineOutput } from '@/ai/flows/generate-pitch-outline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { marked } from 'marked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    INTERNAL_STAGE_1_RUBRIC, INDIVIDUAL_STAGE_1_RUBRIC,
    INTERNAL_STAGE_2_RUBRIC, INDIVIDUAL_STAGE_2_RUBRIC,
    INTERNAL_FINAL_RUBRIC, INDIVIDUAL_INTERNAL_FINAL_RUBRIC,
    EXTERNAL_FINAL_RUBRIC, INDIVIDUAL_EXTERNAL_FINAL_RUBRIC, ReviewType
} from '@/lib/constants';

interface ProjectViewProps {
    submission: ProjectSubmission;
    onBack: () => void;
    onAddIdea: () => void;
}

const PerformanceSummary = ({ submission, team }: { submission: ProjectSubmission, team: Team }) => {

    const calculateStageScore = (reviewType: ReviewType, teamRubric: any[], individualRubric: any[]) => {
        const stageScores = submission.scores.filter(s => s.reviewType === reviewType);
        if (stageScores.length === 0) return 0;
        
        // Average scores by evaluator
        const evaluatorScores: Record<string, { teamScore: number, individualScores: Record<string, number>, individualCount: number }> = {};

        stageScores.forEach(score => {
            if (!evaluatorScores[score.evaluatorId]) {
                evaluatorScores[score.evaluatorId] = { teamScore: 0, individualScores: {}, individualCount: 0 };
            }

            if (score.memberId) {
                 if (!evaluatorScores[score.evaluatorId].individualScores[score.memberId]) {
                    evaluatorScores[score.evaluatorId].individualScores[score.memberId] = 0;
                }
                evaluatorScores[score.evaluatorId].individualScores[score.memberId] += score.value;
            } else {
                 evaluatorScores[score.evaluatorId].teamScore += score.value;
            }
        });
        
        let totalObtained = 0;
        const evaluatorCount = Object.keys(evaluatorScores).length;

        for (const evalId in evaluatorScores) {
            const { teamScore, individualScores } = evaluatorScores[evalId];
            let totalIndividual = 0;
            const membersScored = Object.keys(individualScores).length;
            
            for (const memberId in individualScores) {
                totalIndividual += individualScores[memberId];
            }
            
            // Average individual scores for that evaluator, then scale to team size
            const avgIndividualScore = membersScored > 0 ? (totalIndividual / membersScored) : 0;
            
            totalObtained += teamScore + (avgIndividualScore * team.members.length);
        }

        return evaluatorCount > 0 ? totalObtained / evaluatorCount : 0;
    };

    const stageData = [
        { name: 'Stage 1 – Idea Presentation', teamMax: 40, indMax: 20, obtained: calculateStageScore('InternalStage1', INTERNAL_STAGE_1_RUBRIC, INDIVIDUAL_STAGE_1_RUBRIC) },
        { name: 'Stage 2 – Prototype / Internal Review', teamMax: 40, indMax: 20, obtained: calculateStageScore('InternalStage2', INTERNAL_STAGE_2_RUBRIC, INDIVIDUAL_STAGE_2_RUBRIC) },
        { name: 'Stage 3 – Internal Final Review', teamMax: 40, indMax: 20, obtained: calculateStageScore('InternalFinal', INTERNAL_FINAL_RUBRIC, INDIVIDUAL_INTERNAL_FINAL_RUBRIC) },
        { name: 'Stage 4 – External Final Review', teamMax: 50, indMax: 30, obtained: calculateStageScore('ExternalFinal', EXTERNAL_FINAL_RUBRIC, INDIVIDUAL_EXTERNAL_FINAL_RUBRIC) },
    ];

    const grandTotalMax = stageData.reduce((acc, stage) => acc + stage.teamMax + (stage.indMax * team.members.length), 0);
    const grandTotalObtained = stageData.reduce((acc, stage) => acc + stage.obtained, 0);


    return (
        <Card className="mt-6 border-primary bg-primary/5">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Overall Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Stage</TableHead>
                            <TableHead className="text-right">Team Score (Max)</TableHead>
                            <TableHead className="text-right">Individual Score (Max)</TableHead>
                            <TableHead className="text-right">Total (Max)</TableHead>
                            <TableHead className="text-right font-bold text-primary">Obtained Marks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stageData.map(stage => (
                            <TableRow key={stage.name}>
                                <TableCell className="font-medium">{stage.name}</TableCell>
                                <TableCell className="text-right">{stage.teamMax}</TableCell>
                                <TableCell className="text-right">{stage.indMax} (x{team.members.length})</TableCell>
                                <TableCell className="text-right">{stage.teamMax + (stage.indMax * team.members.length)}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{stage.obtained.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold bg-muted/50">
                            <TableCell>Grand Total</TableCell>
                            <TableCell className="text-right">170</TableCell>
                            <TableCell className="text-right">90 (x{team.members.length})</TableCell>
                            <TableCell className="text-right">{grandTotalMax}</TableCell>
                            <TableCell className="text-right text-lg text-primary">{grandTotalObtained.toFixed(2)} / {grandTotalMax}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
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
    const approvalStageOrder: ProjectSubmission['status'][] = ['PendingGuide', 'PendingR&D', 'PendingHoD', 'Approved'];
    const reviewStageOrder: ProjectSubmission['reviewStage'][] = ['Stage1', 'Stage2', 'InternalFinal', 'ExternalFinal', 'Completed'];

    const getApprovalStatus = (stage: ProjectSubmission['status']) => {
        const stageIndex = approvalStageOrder.indexOf(stage);
        const currentStatusIndex = approvalStageOrder.indexOf(project.status);

        if (project.status === 'Approved') {
            return { status: 'complete' as const, update: history.find(h => h.to === 'Approved') };
        }
        
        if (currentStatusIndex >= stageIndex) {
            const update = [...history].reverse().find(h => h.to === stage);
            if (stage === project.status) return { status: 'pending' as const, update };
            return { status: 'complete' as const, update };
        }
        
        return { status: 'upcoming' as const, update: null };
    };

    const getReviewStatus = (stage: ProjectSubmission['reviewStage']) => {
        if (project.status !== 'Approved') return { status: 'upcoming' as const };
        
        const stageIndex = reviewStageOrder.indexOf(stage);
        const currentReviewIndex = reviewStageOrder.indexOf(project.reviewStage);

        if (stage === 'Completed' && project.reviewStage === 'Completed') return { status: 'complete' as const };
        if (currentReviewIndex > stageIndex) return { status: 'complete' as const };
        if (currentReviewIndex === stageIndex) return { status: 'pending' as const };
        return { status: 'upcoming' as const };
    };

    const isRejected = project.status === 'Rejected';
    const rejectionUpdate = history.find(h => h.to === 'Rejected');

    const approvalStages: { key: ProjectSubmission['status'], name: string }[] = [
        { key: 'PendingGuide', name: 'Guide Review' },
        { key: 'PendingR&D', name: 'R&D Co-ordinator Review' },
        { key: 'PendingHoD', name: 'HOD Review' },
    ];
    
    const finalApprovalStage = {
        key: 'Approved',
        name: 'Project Approved',
        update: history.find(h => h.to === 'Approved')
    };
    
     const reviewStages: { key: ProjectSubmission['reviewStage'], name: string }[] = [
        { key: 'Stage1', name: 'Stage 1 Scoring' },
        { key: 'Stage2', name: 'Stage 2 Scoring' },
        { key: 'InternalFinal', name: 'Final Internal Review' },
        { key: 'ExternalFinal', name: 'Final External Review' },
    ];
    
    const finalCompletedStage = {
        key: 'Completed',
        name: 'Project Completed',
        status: getReviewStatus('Completed')
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
            <div className="relative border-l-2 border-dashed border-border pl-8 py-4">
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
            {approvalStages.map((stageInfo) => {
                const stageStatus = getApprovalStatus(stageInfo.key);
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
                <div className={`absolute -left-[45px] top-0 h-10 w-10 bg-background flex items-center justify-center rounded-full border-2 ${finalApprovalStage.update ? 'border-green-500' : 'border-border'}`}>
                    {getIcon(finalApprovalStage.update ? 'complete' : 'upcoming')}
                </div>
                <p className={`font-bold text-lg ${finalApprovalStage.update ? 'text-green-400' : 'text-muted-foreground'}`}>{finalApprovalStage.name}</p>
                {finalApprovalStage.update && (
                    <div className="text-xs text-muted-foreground">{format(new Date(finalApprovalStage.update.timestamp), 'PPP p')} by {finalApprovalStage.update.updatedBy}</div>
                )}
            </div>
             {project.status === 'Approved' && reviewStages.map((stageInfo) => {
                const stageStatus = getReviewStatus(stageInfo.key);
                 const isActive = stageStatus.status === 'pending' || stageStatus.status === 'complete';
                 return (
                     <div key={stageInfo.key} className="relative">
                        <div className={`absolute -left-[45px] top-0 h-10 w-10 bg-background flex items-center justify-center rounded-full border-2 ${isActive ? 'border-primary' : 'border-border'}`}>
                             {getIcon(stageStatus.status)}
                        </div>
                        <p className={`font-bold text-lg ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{stageInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{stageStatus.status === 'pending' ? 'Awaiting Scores' : (stageStatus.status === 'complete' ? 'Scoring Complete' : 'Upcoming')}</p>
                    </div>
                 )
            })}
            
             {project.status === 'Approved' && (
                <div className="relative">
                    <div className={`absolute -left-[45px] top-0 h-10 w-10 bg-background flex items-center justify-center rounded-full border-2 ${finalCompletedStage.status.status === 'complete' ? 'border-green-500' : 'border-border'}`}>
                        {getIcon(finalCompletedStage.status.status)}
                    </div>
                    <p className={`font-bold text-lg ${finalCompletedStage.status.status === 'complete' ? 'text-green-400' : 'text-muted-foreground'}`}>{finalCompletedStage.name}</p>
                     {finalCompletedStage.status.status === 'complete' ? (
                        <p className="text-sm text-muted-foreground">The evaluation process is complete.</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">Awaiting final review and completion.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ProjectView({ submission: initialSubmission, onBack, onAddIdea }: ProjectViewProps) {
    const { state, api } = useHackathon();
    const { teams, selectedCollege, projects, users } = state;
    const [submission, setSubmission] = useState(initialSubmission);

    const [isReviewing, setIsReviewing] = useState(false);
    const [review, setReview] = useState('');
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);
    
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [pitchOutline, setPitchOutline] = useState<GeneratePitchOutlineOutput | null>(null);

    const [pitchAudio, setPitchAudio] = useState<{ audioDataUri: string } | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    useEffect(() => {
        const updatedSubmission = projects.find(p => p.id === initialSubmission.id);
        if (updatedSubmission) {
            setSubmission(updatedSubmission);
        }
    }, [projects, initialSubmission.id]);

    const team = teams.find(t => t.id === submission.teamId);
    
    const approvedIdea = useMemo(() => {
        return submission.projectIdeas.find(idea => idea.status === 'approved');
    }, [submission.projectIdeas]);

    const canDownloadCertificate = submission.reviewStage === 'Completed';

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
                await generateCertificate(team.name, approvedIdea?.title || submission.projectIdeas[0].title, teamMembers, submission.id, submission.totalScore, selectedCollege);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGeneratingCert(null);
            }
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
                aiCodeReview: review || undefined,
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

    const handleResubmit = async () => {
        try {
            onAddIdea();
        } catch(e) {
            console.error(e);
        }
    }
    
    const canAddMoreIdeas = submission.projectIdeas.length < 3 && submission.status !== 'Approved';

    return (
        <div className="container max-w-3xl mx-auto px-0">
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
                         <TabsList className="grid w-full grid-cols-3">
                             <TabsTrigger value="status">Project Status</TabsTrigger>
                             <TabsTrigger value="details">Submission Details</TabsTrigger>
                             <TabsTrigger value="schedule">Scheduled Reviews</TabsTrigger>
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
                            {submission.reviewStage === 'Completed' && team && (
                                <PerformanceSummary submission={submission} team={team} />
                            )}
                         </TabsContent>
                         <TabsContent value="details" className="mt-6">
                             <Tabs defaultValue="idea-1" className="w-full">
                                <TabsList className={`grid w-full grid-cols-${submission.projectIdeas.length}`}>
                                    {submission.projectIdeas.map((idea, index) => (
                                        <TabsTrigger key={idea.id} value={`idea-${index + 1}`}>
                                            {approvedIdea?.id === idea.id ? <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" /> : null}
                                            {idea.title}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {submission.projectIdeas.map((idea, index) => (
                                    <TabsContent key={idea.id} value={`idea-${index + 1}`} className="mt-4">
                                        <Card className="bg-muted/50">
                                            <CardHeader>
                                                <CardTitle>{idea.title}</CardTitle>
                                                <CardDescription>Status: <span className="font-bold capitalize">{idea.status || 'Pending'}</span></CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <IdeaDisplay idea={idea} />
                                                {idea.status === 'approved' && (
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
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </TabsContent>
                         <TabsContent value="schedule" className="mt-6">
                             <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="font-headline">Scheduled Reviews</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(submission.meetings && submission.meetings.length > 0) ? (
                                        submission.meetings.map(meeting => (
                                            <div key={meeting.id} className="p-4 border rounded-md bg-background">
                                                <h4 className="font-semibold text-primary">{meeting.stage} Review</h4>
                                                <p className="text-sm text-muted-foreground">Scheduled by: {meeting.scheduledBy}</p>
                                                <p className="font-bold text-lg">{format(new Date(meeting.scheduledTime), 'PPP p')}</p>
                                                <Button asChild variant="secondary" size="sm" className="mt-2">
                                                    <Link href={meeting.meetLink} target="_blank" rel="noopener noreferrer">
                                                        <Video className="mr-2 h-4 w-4"/> Join Google Meet
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">No review meetings have been scheduled yet.</p>
                                    )}
                                </CardContent>
                            </Card>
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
                    
                    {canDownloadCertificate && (
                        <div className="mt-6 border-t pt-4 space-y-4">
                             <div className="text-center space-y-2">
                                <Button onClick={handleDownloadCertificate} disabled={isGeneratingCert}>
                                    {isGeneratingCert ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Download className="mr-2 h-4 w-4"/>Download Participation Certificate</>}
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
