
"use client";

import React, { useState, useMemo } from 'react';
import { Project, Hackathon } from '@/lib/types';
import ProjectList from './ProjectList';
import ScoringForm from './ScoringForm';
import { useHackathon } from '@/context/HackathonProvider';

interface ScoringDashboardProps {
    event: Hackathon;
}

export default function ScoringDashboard({ event }: ScoringDashboardProps) {
    const { state } = useHackathon();
    const { projects } = state;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const eventProjects = useMemo(() => {
        return projects.filter(p => p.hackathonId === event.id);
    }, [projects, event.id]);

    if (selectedProject) {
        return <ScoringForm project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    return (
        <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-headline text-center">Projects for Scoring: {event.name}</h2>
            <ProjectList projects={eventProjects} onSelectProject={setSelectedProject} />
        </div>
    );
}
