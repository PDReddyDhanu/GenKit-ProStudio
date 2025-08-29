
"use client";

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import ProjectList from './ProjectList';
import ScoringForm from './ScoringForm';

export default function ScoringDashboard() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    if (selectedProject) {
        return <ScoringForm project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    return (
        <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-headline text-center">Projects for Judging</h2>
            <ProjectList onSelectProject={setSelectedProject} />
        </div>
    );
}
