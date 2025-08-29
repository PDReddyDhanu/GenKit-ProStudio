
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Project } from '@/lib/types';
import ProjectList from './ProjectList';
import ScoringForm from './ScoringForm';
import { AuthMessage } from '@/components/AuthMessage';

function JudgingPanel() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    if (selectedProject) {
        return <ScoringForm project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    return (
        <div className="container max-w-4xl mx-auto py-12">
            <h2 className="text-3xl font-bold mb-6 font-headline">Projects for Judging</h2>
            <ProjectList onSelectProject={setSelectedProject} />
        </div>
    );
}

export default function JudgingDashboard() {
    const { state } = useHackathon();

    return (
        <div className="animate-slide-in-up">
            <h1 className="text-4xl font-bold mt-12 mb-8 font-headline text-center">Judge Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
            <AuthMessage />
            <JudgingPanel />
        </div>
    );
}
