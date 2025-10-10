
"use client";

import React, { useMemo, useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectSubmission, Team, Faculty } from '@/lib/types';
import { Loader, Check, X, AlertTriangle, Scale } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ScoringForm from '@/app/judge/_components/ScoringForm';

const ProjectCard = ({ project, team }: { project: ProjectSubmission, team?: Team }) => {
    const { api, state } = useHackathon();
    const { currentFaculty } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [isRemarksOpen, setIsRemarksOpen] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [isScoring, setIsScoring] = useState(false);

    const handleUpdateStatus = async (newStatus: ProjectSubmission['status'], remarksText?: string) => {
        if (!currentFaculty) return;
        setIsLoading(newStatus);
        try {
            await api.updateProjectStatus(project.id, newStatus, currentFaculty, remarksText);
            if(newStatus === 'Rejected') {
                setIsRemarksOpen(false);
            }
        } catch (error) {
            console.error('Failed to update project status', error);
        } finally {
            setIsLoading(null);
        }
    };
    
    const nextStatusMap: Record<ProjectSubmission['status'], ProjectSubmission['status'] | null> = {
        PendingGuide: 'PendingR&D',
        'PendingR&D': 'PendingHoD',
        PendingHoD: 'Approved',
        Approved: null, // This now transitions to a review stage, handled differently
        Rejected: null,
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
        
        if (role === 'class-mentor' && ['Stage1', 'Stage2', 'InternalFinal'].includes(reviewStage)) return true;
        
        // Admins/HODs can score at any internal stage
        if (['admin', 'hod', 'rnd'].includes(role) && ['Stage1', 'Stage2', 'InternalFinal'].includes(reviewStage)) return true;

        return false;
    }, [project, team, currentFaculty]);


    const nextStatus = nextStatusMap[project.status];
    const isApprovalStage = project.status !== 'Approved' && project.status !== 'Rejected';

    if (isScoring) {
        return <ScoringForm project={project} onBack={() => setIsScoring(false)} />;
    }

    return (
        <Dialog open={isRemarksOpen} onOpenChange={setIsRemarksOpen}>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">{project.projectIdeas[0]?.title || "Untitled Project"}</CardTitle>
                    <CardDescription>Team: {team?.name || "Unknown"}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.projectIdeas[0]?.description}</p>
                    {isApprovalStage && canApprove && (
                        <div className="flex gap-2">
                            {nextStatus && (
                                <Button size="sm" onClick={() => handleUpdateStatus(nextStatus)} disabled={!!isLoading}>
                                    {isLoading === nextStatus ? <Loader className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                                    <span className="ml-2">Approve</span>
                                </Button>
                            )}
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={!!isLoading}>
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </DialogTrigger>
                        </div>
                    )}
                    {!isApprovalStage && canScore && (
                         <Button size="sm" onClick={() => setIsScoring(true)} disabled={!!isLoading}>
                            <Scale className="mr-2 h-4 w-4" />
                            Score Project
                        </Button>
                    )}
                </CardContent>
            </Card>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Project: "{project.projectIdeas[0]?.title}"</DialogTitle>
                    <DialogDescription>
                        Please provide clear feedback for the students on why their project is being rejected. This will help them improve for their next submission.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="remarks-textarea">Rejection Remarks</Label>
                    <Textarea
                        id="remarks-textarea"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g., 'The project scope is too broad for the timeline, please refine...' or 'Idea rejected due to similarity with another project.'"
                        rows={5}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRemarksOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => handleUpdateStatus('Rejected', remarks)}>Confirm Rejection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
        { key: 'PendingR&D', title: 'Pending R&D', roles: ['rnd', 'admin'] },
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
                
                const stageProjects = projectsByStage[stage.key] || [];

                return (
                    <div key={stage.key} className="flex-shrink-0 w-[320px] space-y-4">
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
