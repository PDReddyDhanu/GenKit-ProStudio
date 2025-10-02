
"use client";

import React, { useMemo, useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectSubmission, Team } from '@/lib/types';
import { Loader, Check, X, MessageSquare, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const RemarksDialog = ({
    project,
    onConfirm,
    open,
    onOpenChange,
}: {
    project: ProjectSubmission;
    onConfirm: (remarks: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const [remarks, setRemarks] = useState('');

    const handleConfirm = () => {
        onConfirm(remarks);
        onOpenChange(false);
        setRemarks('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Remarks for "{project.projectIdeas[0].title}"</DialogTitle>
                    <DialogDescription>
                        Provide feedback or reasons for rejection. This will be sent to the student team.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="remarks-textarea">Remarks</Label>
                    <Textarea
                        id="remarks-textarea"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g., 'The project scope is too broad, please refine...' or 'Idea rejected due to similarity with another project.'"
                        rows={5}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm & Send</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ProjectApprovalCard = ({ project, team }: { project: ProjectSubmission, team?: Team }) => {
    const { api, state } = useHackathon();
    const { currentFaculty } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [isRemarksOpen, setIsRemarksOpen] = useState(false);
    const [remarks, setRemarks] = useState('');

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
        Approved: null,
        Rejected: null,
    };
    
    const canApprove = (
        (currentFaculty?.role === 'guide' && project.status === 'PendingGuide') ||
        (currentFaculty?.role === 'rnd' && project.status === 'PendingR&D') ||
        (currentFaculty?.role === 'hod' && project.status === 'PendingHoD') ||
        (currentFaculty?.role === 'admin') // Admins can approve anything
    );
    
    const nextStatus = nextStatusMap[project.status];


    return (
        <Dialog open={isRemarksOpen} onOpenChange={setIsRemarksOpen}>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">{project.projectIdeas[0]?.title || "Untitled Project"}</CardTitle>
                    <CardDescription>Team: {team?.name || "Unknown"}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.projectIdeas[0]?.description}</p>
                    {canApprove && (
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
                </CardContent>
            </Card>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Project: "{project.projectIdeas[0].title}"</DialogTitle>
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
    const { projects, teams, currentFaculty } = state;

    const projectsByStatus = useMemo(() => {
        const columns: Record<string, ProjectSubmission[]> = {
            PendingGuide: [],
            'PendingR&D': [],
            PendingHoD: [],
        };
        projects.forEach(p => {
            if (columns[p.status]) {
                columns[p.status].push(p);
            }
        });
        return columns;
    }, [projects]);
    
    if (!currentFaculty || !['guide', 'rnd', 'hod', 'admin'].includes(currentFaculty.role)) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">You do not have permission to view this dashboard.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {(['PendingGuide', 'PendingR&D', 'PendingHoD'] as const).map(status => (
                <div key={status} className="space-y-4">
                    <h2 className="text-xl font-bold font-headline capitalize">{status.replace('Pending', 'Pending ')} ({projectsByStatus[status].length})</h2>
                    <ScrollArea className="h-[calc(100vh-22rem)] bg-card p-2 rounded-lg border">
                        <div className="space-y-4 p-2">
                             {projectsByStatus[status].length > 0 ? (
                                projectsByStatus[status].map(project => {
                                    const team = teams.find(t => t.id === project.teamId);
                                    return <ProjectApprovalCard key={project.id} project={project} team={team} />
                                })
                            ) : (
                                <div className="flex items-center justify-center h-48 text-muted-foreground">
                                    <p>No projects in this stage.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
}
