
"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import Link from 'next/link';
import { Github, GalleryVertical, Award, X, Play } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateShowcaseSummary, generateShowcaseImage } from '@/app/actions';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

interface ShowcaseItem {
    id: string;
    name: string;
    teamName: string;
    summary: string;
    imageUrl: string;
}

function ShowcaseViewer({ items, onClose }: { items: ShowcaseItem[], onClose: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length === 0) return;
        
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % items.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(timer);
    }, [items]);
    
    if(items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
         <motion.div 
            className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-4 right-4 text-white z-10">
                <X />
            </Button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.9, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -100 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="w-full h-full"
                >
                    <Image
                        src={currentItem.imageUrl}
                        alt={currentItem.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                     <div className="absolute bottom-10 left-10 text-white max-w-2xl">
                        <motion.h1 
                            className="text-5xl md:text-7xl font-bold font-headline mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            {currentItem.name}
                        </motion.h1>
                        <motion.p 
                            className="text-2xl md:text-3xl text-secondary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            by {currentItem.teamName}
                        </motion.p>
                         <motion.p 
                            className="text-xl md:text-2xl mt-4 italic text-neutral-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                        >
                            {currentItem.summary}
                        </motion.p>
                    </div>
                </motion.div>
            </AnimatePresence>

             <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full">
                <motion.div 
                    key={currentIndex}
                    className="h-full bg-white rounded-full"
                    initial={{ width: '0%'}}
                    animate={{ width: '100%'}}
                    transition={{ duration: 5, ease: 'linear'}}
                />
            </div>
        </motion.div>
    );
}


export default function ProjectGallery() {
    const { state } = useHackathon();
    const { projects, teams } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [isInShowcaseMode, setIsInShowcaseMode] = useState(false);
    const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
    const [isLoadingShowcase, setIsLoadingShowcase] = useState(false);

    const handleEnterShowcase = async () => {
        setIsLoadingShowcase(true);
        const items: ShowcaseItem[] = [];

        for (const project of projects) {
            try {
                const team = teams.find(t => t.id === project.teamId);
                if (!team) continue;

                const summaryRes = await generateShowcaseSummary({ projectName: project.name, projectDescription: project.description });
                if (!summaryRes) continue;

                let finalImageUrl = project.imageUrl;
                if (!finalImageUrl) {
                    const imageRes = await generateShowcaseImage({ summary: summaryRes.summary });
                    if (imageRes && imageRes.imageUrl) {
                        finalImageUrl = imageRes.imageUrl;
                    }
                }
                
                if (!finalImageUrl) continue;

                items.push({
                    id: project.id,
                    name: project.name,
                    teamName: team.name,
                    summary: summaryRes.summary,
                    imageUrl: finalImageUrl,
                });
            } catch (error) {
                console.error(`Failed to generate showcase data for project ${project.name}:`, error);
            }
        }
        setShowcaseItems(items);
        setIsLoadingShowcase(false);
        if(items.length > 0) {
           setIsInShowcaseMode(true);
        } else {
            alert("Could not generate showcase data. Please try again.");
        }
    };
    
    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<GalleryVertical className="w-full h-full" />} title="Project Showcase" description="A gallery of all submitted projects to celebrate the work." />;
    }

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-fade-in">
            <AnimatePresence>
                {isInShowcaseMode && <ShowcaseViewer items={showcaseItems} onClose={() => setIsInShowcaseMode(false)} />}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-12">
                 <div className="text-center sm:text-left">
                    <h1 className="text-4xl font-bold mb-2 font-headline">Project Showcase</h1>
                    <p className="text-lg text-muted-foreground">Celebrating the incredible work from {state.selectedCollege}</p>
                </div>
                 <Button onClick={handleEnterShowcase} disabled={isLoadingShowcase || projects.length === 0}>
                    <Play className="mr-2"/> 
                    {isLoadingShowcase ? 'Preparing...' : 'Enter Showcase Mode'}
                </Button>
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
