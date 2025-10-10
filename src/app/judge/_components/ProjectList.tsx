
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ProjectSubmission } from '@/lib/types';
import { CheckCircle, BarChart2 } from 'lucide-react';

interface ProjectListProps {
    projects: ProjectSubmission[];
    onSelectProject: (project: ProjectSubmission) => void;
}

export default function ProjectList({ projects, onSelectProject }: ProjectListProps) {
    const { state } = useHackathon();
    const { teams, currentFaculty } = state;

    if (!currentFaculty) return null;

    if (!projects || projects.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground text-center mt-4">No projects are available for review in this stage.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {projects.map(p => {
                const team = teams.find(t => t.id === p.teamId);
                // A faculty member has scored this project if there's any score entry from them for this specific project.
                const hasScored = p.scores.some(s => s.evaluatorId === currentFaculty.id);
                const primaryIdea = p.projectIdeas[0];

                // Logic to determine if the guide should see this project
                const isMyAssignedProject = currentFaculty.role === 'guide' && team?.guide?.id === currentFaculty.id;
                const canSeeAllProjects = ['class-mentor', 'admin', 'hod', 'rnd', 'external'].includes(currentFaculty.role);

                if (!isMyAssignedProject && !canSeeAllProjects) {
                    return null;
                }
                
                return (
                    <Card key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold">{primaryIdea?.title || "Untitled Project"}</h3>
                            <p className="text-sm text-muted-foreground">by {team?.name || 'Unknown Team'}</p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {hasScored && <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Scored</span>}
                          <Button onClick={() => onSelectProject(p)}>{hasScored ? 'Edit Score' : 'Score Project'}</Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
