"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Github, GalleryVertical } from 'lucide-react';
import PageIntro from '@/components/PageIntro';

export default function ProjectGallery() {
    const { state } = useHackathon();
    const { projects, teams } = state;
    const [showIntro, setShowIntro] = useState(true);
    
    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<GalleryVertical className="w-full h-full" />} title="Project Showcase" description="A gallery of all submitted projects to celebrate the work." />;
    }

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-12 font-headline">Project Showcase</h1>
            
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:1000px]">
                    {projects.map((project, index) => {
                        const team = teams.find(t => t.id === project.teamId);
                        return (
                            <Card 
                                key={project.id} 
                                className="flex flex-col transition-all duration-300 transform-gpu animate-card-in hover:[transform:rotateX(var(--rotate-x,5deg))_rotateY(var(--rotate-y,5deg))_scale3d(1.05,1.05,1.05)]"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <CardHeader>
                                    <CardTitle className="font-headline">{project.name}</CardTitle>
                                    <CardDescription>by {team?.name || 'Unknown Team'}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-between">
                                    <p className="text-muted-foreground mb-4">{project.description}</p>
                                    <Link 
                                        href={project.githubUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-2 text-accent hover:underline mt-auto"
                                    >
                                        <Github className="h-4 w-4" />
                                        View on GitHub
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16">
                        <p className="text-center text-muted-foreground text-lg">No projects have been submitted yet. The gallery is waiting!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}