
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface ProjectListProps {
    onSelectProject: (project: Project) => void;
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
    const { state } = useHackathon();
    const { projects, teams } = state;
    const { currentJudge } = state;

    if (!projects || projects.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">No projects have been submitted yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {projects.map(p => {
                const team = teams.find(t => t.id === p.teamId);
                const hasScored = p.scores.some(s => s.judgeId === currentJudge?.id);
                return (
                    <Card key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardHeader>
                            <CardTitle>{p.name}</CardTitle>
                            <CardDescription>by {team?.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 sm:pt-6 flex items-center gap-4">
                          {hasScored && <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Scored</span>}
                          <Button onClick={() => onSelectProject(p)}>{hasScored ? 'Edit Score' : 'Score Project'}</Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
