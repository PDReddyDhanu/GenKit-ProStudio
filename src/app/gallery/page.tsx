
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
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

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
                                <div 
                                    key={project.id} 
                                    className="group relative rounded-lg overflow-hidden shadow-lg animate-card-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Image 
                                        src={`https://picsum.photos/seed/${project.id}/600/400`}
                                        alt={project.name}
                                        width={600}
                                        height={400}
                                        data-ai-hint="abstract technology"
                                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    
                                    <div className="absolute bottom-0 left-0 p-6 w-full text-white transition-all duration-500 ease-in-out">
                                        <h3 className="text-xl font-bold font-headline">{project.name}</h3>
                                        <p className="text-sm text-gray-300">by {team?.name || 'Unknown Team'}</p>
                                        
                                        <div className="absolute bottom-full left-0 w-full p-6 bg-black/80 backdrop-blur-sm opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                                            <h3 className="text-xl font-bold font-headline">{project.name}</h3>
                                            <p className="text-sm text-gray-300">by {team?.name || 'Unknown Team'}</p>
                                            <p className="mt-4 text-sm text-gray-200 line-clamp-3">{project.description}</p>
                                            <div className="flex justify-between items-center mt-4">
                                                <Link 
                                                    href={project.githubUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center gap-2 text-primary hover:underline"
                                                >
                                                    <Github className="h-4 w-4" />
                                                    View on GitHub
                                                </Link>
                                                {project.achievements && project.achievements.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.achievements.map(achievement => (
                                                            <Tooltip key={achievement}>
                                                                <TooltipTrigger>
                                                                    <Award className="w-5 h-5 text-yellow-400" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{achievement}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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

