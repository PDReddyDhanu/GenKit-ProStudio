"use client";

import React, { useState, useMemo } from 'react';
import { ProjectSubmission, Hackathon } from '@/lib/types';
import ProjectList from './ProjectList';
import ScoringForm from './ScoringForm';
import { useHackathon } from '@/context/HackathonProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

interface ScoringDashboardProps {
    event: Hackathon;
}

export default function ScoringDashboard({ event }: ScoringDashboardProps) {
    const { state } = useHackathon();
    const { projects, currentFaculty, teams } = state;
    const [selectedProject, setSelectedProject] = useState<ProjectSubmission | null>(null);

    const facultyProjects = useMemo(() => {
        if (!currentFaculty || !event?.id) return [];

        // 1. Get all approved projects for the current event.
        const eventProjects = projects.filter(p => 
            p.hackathonId === event.id && p.status === 'Approved'
        );

        // 2. Filter projects based on faculty role.
        if (currentFaculty.role === 'guide') {
            const myTeamIds = new Set(teams.filter(t => t.guide?.id === currentFaculty.id).map(t => t.id));
            return eventProjects.filter(p => myTeamIds.has(p.teamId));
        }

        if (currentFaculty.role === 'external') {
            return eventProjects.filter(p => p.reviewStage === 'ExternalFinal');
        }

        // For Admin, HOD, R&D, Class Mentor - show all approved projects for the event.
        if (['admin', 'hod', 'rnd', 'class-mentor'].includes(currentFaculty.role)) {
            return eventProjects;
        }

        return [];
    }, [projects, event.id, currentFaculty, teams]);

    const projectsByStage = useMemo(() => {
        const stages: { [key: string]: ProjectSubmission[] } = {
            'Stage1': [],
            'Stage2': [],
            'InternalFinal': [],
            'ExternalFinal': [],
        };
        facultyProjects.forEach(p => {
            if (p.reviewStage && stages[p.reviewStage]) {
                stages[p.reviewStage].push(p);
            }
        });
        return stages;
    }, [facultyProjects]);

    if (selectedProject) {
        return <ScoringForm project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }
    
    if (facultyProjects.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No approved projects are available for you to score in this event yet.</p>
                </CardContent>
            </Card>
        )
    }
    
    const isExternal = currentFaculty?.role === 'external';

    return (
        <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-headline text-center">Projects for Scoring: {event.name}</h2>
            {isExternal ? (
                 <div>
                    <h3 className="text-xl font-semibold mb-4">Final External Review ({projectsByStage['ExternalFinal'].length})</h3>
                    <ProjectList projects={projectsByStage['ExternalFinal']} onSelectProject={setSelectedProject} />
                </div>
            ) : (
                <Tabs defaultValue="Stage1" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="Stage1">Stage 1 Review ({projectsByStage['Stage1'].length})</TabsTrigger>
                        <TabsTrigger value="Stage2">Stage 2 Review ({projectsByStage['Stage2'].length})</TabsTrigger>
                        <TabsTrigger value="InternalFinal">Final Internal Review ({projectsByStage['InternalFinal'].length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Stage1" className="mt-6">
                        <ProjectList projects={projectsByStage['Stage1']} onSelectProject={setSelectedProject} />
                    </TabsContent>
                    <TabsContent value="Stage2" className="mt-6">
                        <ProjectList projects={projectsByStage['Stage2']} onSelectProject={setSelectedProject} />
                    </TabsContent>
                    <TabsContent value="InternalFinal" className="mt-6">
                        <ProjectList projects={projectsByStage['InternalFinal']} onSelectProject={setSelectedProject} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
