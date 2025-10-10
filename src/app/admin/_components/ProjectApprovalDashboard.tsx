
"use client";

import React, { useMemo, useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectSubmission, Team, Faculty, ProjectIdea } from '@/lib/types';
import { Loader, Check, X, AlertTriangle, Scale, Bot, Presentation } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ScoringForm from '@/app/judge/_components/ScoringForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { getAiProjectSummary, generatePitchOutline, generatePitchAudioAction } from '@/app/actions';
import { GeneratePitchOutlineOutput } from '@/ai/flows/generate-pitch-outline';
import { marked } from 'marked';

const RejectDialog = ({ idea, projectId, onConfirm, open, onOpenChange }: { idea: ProjectIdea, projectId: string, onConfirm: (remarks: string) => void, open: boolean, onOpenChange: (open: boolean) => void }) => {
    const [remarks, setRemarks] = useState('');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Project Idea: "{idea.title}"</DialogTitle>
                    <DialogDescription>
                        Please provide clear feedback for the students on why this idea is being rejected. This will help them improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="remarks-textarea">Rejection Remarks</Label>
                    <Textarea
                        id="remarks-textarea"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g., 'The project scope is too broad for the timeline...'"
                        rows={5}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => { onConfirm(remarks); onOpenChange(false); }}>Confirm Rejection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const ProjectCard = ({ project, team }: { project: ProjectSubmission, team?: Team }) => {
    const { api, state } = useHackathon();
    const { currentFaculty, users } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [rejectingIdea, setRejectingIdea] = useState<ProjectIdea | null>(null);
    
    const [aiSummary, setAiSummary] = useState<Record<string, string>>({});
    const [isGeneratingSummary, setIsGeneratingSummary] = useState<string | null>(null);
    const [pitchOutline, setPitchOutline] = useState<GeneratePitchOutlineOutput | null>(null);
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [pitchAudio, setPitchAudio] = useState<{ audioDataUri: string } | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);


    const handleApproveIdea = async (idea: ProjectIdea) => {
        if (!currentFaculty) return;
        setIsLoading(`approve-${idea.id}`);
        try {
            await api.approveProjectIdea(project.id, idea, currentFaculty);
        } catch (error) {
            console.error('Failed to approve project idea', error);
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleRejectIdea = async (idea: ProjectIdea, remarks: string) => {
        if (!currentFaculty) return;
        setIsLoading(`reject-${idea.id}`);
        try {
            await api.updateProjectStatus(project.id, 'Rejected', currentFaculty, `Idea "${idea.title}" rejected: ${remarks}`);
        } catch (error) {
             console.error('Failed to reject project idea', error);
        } finally {
             setIsLoading(null);
        }
    }

    const handleGenerateSummary = async (idea: ProjectIdea) => {
        setIsGeneratingSummary(idea.id);
        try {
            const summary = await getAiProjectSummary({
                projectName: idea.title,
                projectDescription: idea.abstractText,
                githubUrl: idea.githubUrl,
            });
            setAiSummary(prev => ({ ...prev, [idea.id]: summary }));
        } catch (error) {
            console.error("Error generating AI summary:", error);
            setAiSummary(prev => ({ ...prev, [idea.id]: "Could not generate summary." }));
        } finally {
            setIsGeneratingSummary(null);
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
                aiCodeReview: aiSummary[idea.id] || undefined,
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


    const canApprove = (
        (currentFaculty?.role === 'guide' && project.status === 'PendingGuide' && project.teamId && team?.guide?.id === currentFaculty.id) ||
        (currentFaculty?.role === 'rnd' && project.status === 'PendingR&D') ||
        (currentFaculty?.role === 'hod' && project.status === 'PendingHoD') ||
        (currentFaculty?.role === 'admin') 
    );
    
    const canScore = useMemo(() => {
        if (!currentFaculty) return false;
        const { reviewStage } = project;
        const { role } = currentFaculty;

        if (project.status !== 'Approved') return false;
        
        const isGuideForTeam = team?.guide?.id === currentFaculty.id;

        if (role === 'external') return reviewStage === 'ExternalFinal';
        
        if (isGuideForTeam && ['Stage1', 'Stage2', 'InternalFinal'].includes(reviewStage)) return true;
        
        if (['admin', 'hod', 'rnd', 'class-mentor'].includes(role) && ['Stage1', 'Stage2', 'InternalFinal'].includes(reviewStage)) return true;

        return false;
    }, [project, team, currentFaculty]);


    if (isScoring) {
        return <ScoringForm project={project} onBack={() => setIsScoring(false)} />;
    }

    return (
        <>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">{team?.name || "Unknown Team"}</CardTitle>
                    <CardDescription>
                        {project.projectIdeas.length} idea(s) submitted for review.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue="idea-0">
                         {project.projectIdeas.map((idea, index) => (
                            <AccordionItem value={`idea-${index}`} key={idea.id}>
                                <AccordionTrigger>Idea {index + 1}: {idea.title}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 p-2">
                                        <p className="text-sm text-muted-foreground">{idea.description}</p>
                                        <Link href={idea.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline break-all">{idea.githubUrl}</Link>
                                        
                                        <div className="border-t pt-4 mt-4 space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Button onClick={() => handleGenerateSummary(idea)} disabled={isGeneratingSummary === idea.id} variant="outline" size="sm">
                                                    {isGeneratingSummary === idea.id ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Summarizing...</> : <><Bot className="mr-2 h-4 w-4"/>Generate AI Summary</>}
                                                </Button>
                                                <Button onClick={() => handleGenerateOutline(idea)} disabled={isGeneratingOutline} variant="outline" size="sm">
                                                    {isGeneratingOutline ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "AI Pitch Coach"}
                                                </Button>
                                            </div>
                                            {aiSummary[idea.id] && (
                                                    <div className="p-3 bg-background/50 rounded-md border">
                                                    <p className="text-sm">{aiSummary[idea.id]}</p>
                                                </div>
                                            )}
                                            {pitchOutline && (
                                                <div className="space-y-4">
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
                                        </div>

                                        {canApprove && (
                                            <div className="flex gap-2 pt-4 border-t">
                                                <Button size="sm" onClick={() => handleApproveIdea(idea)} disabled={!!isLoading}>
                                                    {isLoading === `approve-${idea.id}` ? <Loader className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                    <span className="ml-2">Approve this Idea</span>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setRejectingIdea(idea)} disabled={!!isLoading}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                         ))}
                    </Accordion>

                    {project.status === 'Approved' && canScore && (
                         <div className="mt-4 pt-4 border-t">
                            <Button size="sm" onClick={() => setIsScoring(true)} disabled={!!isLoading}>
                                <Scale className="mr-2 h-4 w-4" />
                                Score Project: {project.projectIdeas[0].title}
                            </Button>
                         </div>
                    )}
                </CardContent>
            </Card>
            {rejectingIdea && (
                 <RejectDialog 
                    idea={rejectingIdea}
                    projectId={project.id}
                    open={!!rejectingIdea}
                    onOpenChange={(open) => !open && setRejectingIdea(null)}
                    onConfirm={(remarks) => handleRejectIdea(rejectingIdea, remarks)}
                />
            )}
        </>
    );
};

export default function ProjectApprovalDashboard() {
    const { state } = useHackathon();
    const { projects, teams, currentFaculty, selectedHackathonId } = state;
    const [selectedProject, setSelectedProject] = useState<ProjectSubmission | null>(null);

    const projectsByStage = useMemo(() => {
        const stages: Record<string, ProjectSubmission[]> = {
            'PendingGuide': [], 'PendingR&D': [], 'PendingHoD': [],
            'Stage1': [], 'Stage2': [], 'InternalFinal': [], 'ExternalFinal': []
        };
        
        if (!selectedHackathonId) return stages;

        projects.filter(p => p.hackathonId === selectedHackathonId).forEach(p => {
            if (p.status !== 'Approved' && stages[p.status]) {
                 stages[p.status].push(p);
            } else if (p.status === 'Approved' && p.reviewStage && stages[p.reviewStage]) {
                stages[p.reviewStage].push(p);
            }
        });
        return stages;
    }, [projects, selectedHackathonId]);
    
    if (selectedProject) {
        return <ScoringForm project={selectedProject} onBack={() => setSelectedProject(null)} />
    }
    
    if (!currentFaculty || !['guide', 'rnd', 'hod', 'admin', 'class-mentor', 'external'].includes(currentFaculty.role)) {
        return (
            <Card><CardContent className="py-16 text-center"><AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">You do not have permission to view this dashboard.</p></CardContent></Card>
        )
    }

    if (!selectedHackathonId) {
        return (
            <Card><CardContent className="py-16 text-center"><AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Please select a project type from the top to view approvals.</p></CardContent></Card>
        );
    }
    
    const STAGES_CONFIG: {key: string, title: string, roles: Faculty['role'][]}[] = [
        { key: 'PendingGuide', title: 'Pending Guide', roles: ['guide', 'admin'] },
        { key: 'PendingR&D', title: 'Pending R&D', roles: ['rnd', 'admin', 'hod'] },
        { key: 'PendingHoD', title: 'Pending HOD', roles: ['hod', 'admin'] },
        { key: 'Stage1', title: 'Stage 1 Scoring', roles: ['guide', 'class-mentor', 'admin', 'hod'] },
        { key: 'Stage2', title: 'Stage 2 Scoring', roles: ['guide', 'class-mentor', 'admin', 'hod'] },
        { key: 'InternalFinal', title: 'Final Internal Scoring', roles: ['guide', 'class-mentor', 'admin', 'hod'] },
        { key: 'ExternalFinal', title: 'Final External Scoring', roles: ['external', 'admin'] },
    ];

    return (
        <div className="flex gap-6 overflow-x-auto pb-4">
            {STAGES_CONFIG.map(stage => {
                if (!currentFaculty || !stage.roles.includes(currentFaculty.role)) return null;
                
                let stageProjects = projectsByStage[stage.key] || [];

                // Special filter for guides to only see their assigned teams' projects
                if (currentFaculty.role === 'guide') {
                    const myTeamIds = new Set(teams.filter(t => t.guide?.id === currentFaculty.id).map(t => t.id));
                    stageProjects = stageProjects.filter(p => myTeamIds.has(p.teamId));
                }

                return (
                    <div key={stage.key} className="flex-shrink-0 w-[350px] space-y-4">
                        <h2 className="text-xl font-bold font-headline capitalize">{stage.title} ({stageProjects.length})</h2>
                        <ScrollArea className="h-[calc(100vh-22rem)] bg-card p-2 rounded-lg border">
                            <div className="space-y-4 p-2">
                                 {stageProjects.length > 0 ? (
                                    stageProjects.map(project => {
                                        const team = teams.find(t => t.id === project.teamId);
                                        return <ProjectCard key={project.id} project={project} team={team} />
                                    })
                                ) : (
                                    <div className="flex items-center justify-center h-48 text-muted-foreground text-center px-4">
                                        <p>No projects in this stage.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                );
            })}
        </div>
    );
}
