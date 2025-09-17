
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import Link from 'next/link';
import { Github, GalleryVertical, Award, Image as ImageIcon, Loader } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateHackathonImage } from '@/app/actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function ProjectGallery() {
    const { state, api } = useHackathon();
    const { projects, teams, selectedHackathonId, hackathons, selectedCollege, currentAdmin, currentJudge } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const router = useRouter();

    const handleGenerateImage = async () => {
        if (!selectedHackathonId || !selectedCollege) {
            alert("Please ensure a hackathon is selected to generate an image.");
            return;
        }

        const currentHackathon = hackathons.find(h => h.id === selectedHackathonId);
        const hackathonTeams = teams.filter(t => t.hackathonId === selectedHackathonId);

        if (!currentHackathon) {
             alert("Could not find the current hackathon's details.");
            return;
        }

        setIsGeneratingImage(true);
        try {
            const imageResult = await generateHackathonImage({
                hackathonName: currentHackathon.name,
                collegeName: selectedCollege,
                teamCount: hackathonTeams.length
            });

            if (imageResult?.imageUrl) {
                await api.updateHackathon(selectedHackathonId, { summaryImageUrl: imageResult.imageUrl });
                alert("Image generated successfully! You can view it in the 'Generated Images' tab on the Admin Dashboard.");
                router.push('/admin');
            } else {
                 throw new Error("Image generation did not return a URL.");
            }

        } catch (error) {
            console.error("Failed to generate summary image:", error);
            alert("Image generation failed. This can happen under heavy load or due to content restrictions. Please try again in a few moments.");
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<GalleryVertical className="w-full h-full" />} title="Project Showcase" description="A gallery of all submitted projects to celebrate the work." />;
    }

    const canGenerateImage = currentAdmin || currentJudge;

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-12">
                 <div className="text-center sm:text-left">
                    <h1 className="text-4xl font-bold mb-2 font-headline">Project Showcase</h1>
                    <p className="text-lg text-muted-foreground">Celebrating the incredible work from {state.selectedCollege}</p>
                </div>
                 {canGenerateImage && (
                    <Button onClick={handleGenerateImage} disabled={isGeneratingImage || projects.length === 0}>
                        {isGeneratingImage ? <Loader className="mr-2 animate-spin"/> : <ImageIcon className="mr-2"/>}
                        {isGeneratingImage ? 'Generating Image...' : 'Generate Hackathon Image'}
                    </Button>
                 )}
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
                                     {project.imageUrl && (
                                        <div className="relative h-48 w-full">
                                            <Image 
                                                src={project.imageUrl} 
                                                alt={`${project.name} visualization`} 
                                                fill 
                                                className="object-cover rounded-t-lg"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-grow p-6">
                                        <CardTitle className="flex items-center gap-3">
                                            <GalleryVertical className="h-6 w-6 text-primary flex-shrink-0" />
                                            {project.name}
                                        </CardTitle>
                                        <CardDescription>by {team?.name || 'Unknown Team'}</CardDescription>
                                        
                                        <CardContent className="p-0 flex-grow pt-4">
                                            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                                            {project.achievements && project.achievements.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {project.achievements.map(achievement => (
                                                        <Tooltip key={achievement}>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="icon" className="border-yellow-400 text-yellow-400 h-8 w-8">
                                                                    <Award className="w-4 h-4" />
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
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
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
