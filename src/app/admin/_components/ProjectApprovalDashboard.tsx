
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
    onConfirm: (remarks: string) =&gt; void;
    open: boolean;
    onOpenChange: (open: boolean) =&gt; void;
}) =&gt; {
    const [remarks, setRemarks] = useState('');

    const handleConfirm = () =&gt; {
        onConfirm(remarks);
        onOpenChange(false);
        setRemarks('');
    };

    return (
        &lt;Dialog open={open} onOpenChange={onOpenChange}&gt;
            &lt;DialogContent&gt;
                &lt;DialogHeader&gt;
                    &lt;DialogTitle&gt;Add Remarks for "{project.projectIdeas[0].title}"&lt;/DialogTitle&gt;
                    &lt;DialogDescription&gt;
                        Provide feedback or reasons for rejection. This will be sent to the student team.
                    &lt;/DialogDescription&gt;
                &lt;/DialogHeader&gt;
                &lt;div className="py-4"&gt;
                    &lt;Label htmlFor="remarks-textarea"&gt;Remarks&lt;/Label&gt;
                    &lt;Textarea
                        id="remarks-textarea"
                        value={remarks}
                        onChange={(e) =&gt; setRemarks(e.target.value)}
                        placeholder="e.g., 'The project scope is too broad, please refine...' or 'Idea rejected due to similarity with another project.'"
                        rows={5}
                    /&gt;
                &lt;/div&gt;
                &lt;DialogFooter&gt;
                    &lt;Button variant="outline" onClick={() =&gt; onOpenChange(false)}&gt;Cancel&lt;/Button&gt;
                    &lt;Button onClick={handleConfirm}&gt;Confirm &amp; Send&lt;/Button&gt;
                &lt;/DialogFooter&gt;
            &lt;/DialogContent&gt;
        &lt;/Dialog&gt;
    );
};

const ProjectApprovalCard = ({ project, team }: { project: ProjectSubmission, team?: Team }) =&gt; {
    const { api, state } = useHackathon();
    const { currentFaculty } = state;
    const [isLoading, setIsLoading] = useState&lt;string | null&gt;(null);
    const [isRemarksOpen, setIsRemarksOpen] = useState(false);

    const handleUpdateStatus = async (newStatus: ProjectSubmission['status'], remarks?: string) =&gt; {
        if (!currentFaculty) return;
        setIsLoading(newStatus);
        try {
            await api.updateProjectStatus(project.id, newStatus, currentFaculty, remarks);
        } catch (error) {
            console.error('Failed to update project status', error);
        } finally {
            setIsLoading(null);
        }
    };
    
    const nextStatusMap: Record&lt;ProjectSubmission['status'], ProjectSubmission['status'] | null&gt; = {
        PendingGuide: 'PendingR&amp;D',
        'PendingR&amp;D': 'PendingHoD',
        PendingHoD: 'Approved',
        Approved: null,
        Rejected: null,
    };
    
    const canApprove = (
        (currentFaculty?.role === 'guide' &amp;&amp; project.status === 'PendingGuide') ||
        (currentFaculty?.role === 'rnd' &amp;&amp; project.status === 'PendingR&amp;D') ||
        (currentFaculty?.role === 'hod' &amp;&amp; project.status === 'PendingHoD') ||
        (currentFaculty?.role === 'admin') // Admins can approve anything
    );
    
    const nextStatus = nextStatusMap[project.status];


    return (
        &lt;Card className="bg-muted/50"&gt;
            &lt;CardHeader&gt;
                &lt;CardTitle className="text-lg"&gt;{project.projectIdeas[0]?.title || "Untitled Project"}&lt;/CardTitle&gt;
                &lt;CardDescription&gt;Team: {team?.name || "Unknown"}&lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
                &lt;p className="text-sm text-muted-foreground line-clamp-3 mb-4"&gt;{project.projectIdeas[0]?.description}&lt;/p&gt;
                 {canApprove &amp;&amp; (
                    &lt;div className="flex gap-2"&gt;
                        {nextStatus &amp;&amp; (
                            &lt;Button size="sm" onClick={() =&gt; handleUpdateStatus(nextStatus)} disabled={!!isLoading}&gt;
                                {isLoading === nextStatus ? &lt;Loader className="animate-spin h-4 w-4" /&gt; : &lt;Check className="h-4 w-4" /&gt;}
                                &lt;span className="ml-2"&gt;Approve&lt;/span&gt;
                            &lt;/Button&gt;
                        )}
                        &lt;DialogTrigger asChild&gt;
                             &lt;Button variant="destructive" size="sm" onClick={() =&gt; setIsRemarksOpen(true)} disabled={!!isLoading}&gt;
                                {isLoading === 'Rejected' ? &lt;Loader className="animate-spin h-4 w-4" /&gt; : &lt;X className="h-4 w-4" /&gt;}
                                &lt;span className="ml-2"&gt;Reject&lt;/span&gt;
                            &lt;/Button&gt;
                        &lt;/DialogTrigger&gt;
                        &lt;Button variant="outline" size="sm"&gt;
                            &lt;MessageSquare className="h-4 w-4 mr-2" /&gt; Remarks
                        &lt;/Button&gt;
                    &lt;/div&gt;
                )}
            &lt;/CardContent&gt;
            &lt;RemarksDialog
                project={project}
                open={isRemarksOpen}
                onOpenChange={setIsRemarksOpen}
                onConfirm={(remarks) =&gt; handleUpdateStatus('Rejected', remarks)}
            /&gt;
        &lt;/Card&gt;
    );
};

export default function ProjectApprovalDashboard() {
    const { state } = useHackathon();
    const { projects, teams, currentFaculty } = state;

    const projectsByStatus = useMemo(() =&gt; {
        const columns: Record&lt;string, ProjectSubmission[]&gt; = {
            PendingGuide: [],
            'PendingR&amp;D': [],
            PendingHoD: [],
        };
        projects.forEach(p =&gt; {
            if (columns[p.status]) {
                columns[p.status].push(p);
            }
        });
        return columns;
    }, [projects]);
    
    if (!currentFaculty || !['guide', 'rnd', 'hod', 'admin'].includes(currentFaculty.role)) {
        return (
            &lt;Card&gt;
                &lt;CardContent className="py-16 text-center"&gt;
                    &lt;AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" /&gt;
                    &lt;p className="mt-4 text-muted-foreground"&gt;You do not have permission to view this dashboard.&lt;/p&gt;
                &lt;/CardContent&gt;
            &lt;/Card&gt;
        )
    }

    return (
        &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"&gt;
            {(['PendingGuide', 'PendingR&amp;D', 'PendingHoD'] as const).map(status =&gt; (
                &lt;div key={status} className="space-y-4"&gt;
                    &lt;h2 className="text-xl font-bold font-headline capitalize"&gt;{status.replace('Pending', 'Pending ')} ({projectsByStatus[status].length})&lt;/h2&gt;
                    &lt;ScrollArea className="h-[calc(100vh-22rem)] bg-card p-2 rounded-lg border"&gt;
                        &lt;div className="space-y-4 p-2"&gt;
                             {projectsByStatus[status].length &gt; 0 ? (
                                projectsByStatus[status].map(project =&gt; {
                                    const team = teams.find(t =&gt; t.id === project.teamId);
                                    return &lt;ProjectApprovalCard key={project.id} project={project} team={team} /&gt;
                                })
                            ) : (
                                &lt;div className="flex items-center justify-center h-48 text-muted-foreground"&gt;
                                    &lt;p&gt;No projects in this stage.&lt;/p&gt;
                                &lt;/div&gt;
                            )}
                        &lt;/div&gt;
                    &lt;/ScrollArea&gt;
                &lt;/div&gt;
            ))}
        &lt;/div&gt;
    );
}
