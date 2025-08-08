"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Project } from '@/lib/types';
import ProjectList from './ProjectList';
import ScoringForm from './ScoringForm';
import { AuthMessage } from '@/components/AuthMessage';

export default function JudgingDashboard() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { state } = useHackathon();

    if (selectedProject) {
        return <ScoringForm project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 animate-slide-in-up">
            <h2 className="text-3xl font-bold mb-6 font-headline">Projects for Judging</h2>
            <AuthMessage />
            <ProjectList onSelectProject={setSelectedProject} />
        </div>
    );
}
