
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import Link from 'next/link';
import { Github, GalleryVertical, Award } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProjectGallery() {
    const { state } = useHackathon();
    const { projects, teams } = state;
    const [showIntro, setShowIntro] = useState(true);
    
    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<GalleryVertical className="w-full h-full" />} title="Project Showcase" description="A gallery of all submitted projects to celebrate the work." />;
    }

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-center mb-2 font-headline">Project Showcase</h1>
                <p className="text-lg text-muted-foreground">Celebrating the incredible work from {state.selectedCollege}</p>
            </div>
            
            {projects.length > 0 ? (
                 <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => {
                            const team = teams.find(t => t.id === project.teamId);
                            return (
                                <Card 
                                    key={project.id} 
                                    className="group relative flex flex-col animate-card-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex flex-col flex-grow">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3">
                                                <GalleryVertical className="h-6 w-6 text-primary" />
                                                {project.name}
                                            </CardTitle>
                                            <CardDescription>by {team?.name || 'Unknown Team'}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                                            {project.achievements && project.achievements.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {project.achievements.map(achievement => (
                                                        <Tooltip key={achievement}>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="icon" className="border-yellow-400 text-yellow-400">
                                                                    <Award className="w-5 h-5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{achievement}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                                         <Button asChild variant="secondary">
                                            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                                <Github className="mr-2 h-4 w-4" />
                                                View on GitHub
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </TooltipProvider>
            ) : (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center text-muted-foreground">
                            <GalleryVertical className="h-12 w-12 mx-auto" />
                             <p className="mt-4 text-lg">No projects have been submitted yet.</p>
                             <p>The gallery is waiting to be filled!</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
