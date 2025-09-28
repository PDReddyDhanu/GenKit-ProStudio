"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Team } from '@/lib/types';
import { generateProjectIdea, suggestThemes } from '@/app/actions';
import { Loader, Wand2, Lightbulb } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectSubmissionProps {
    team: Team;
}

export default function ProjectSubmission({ team }: ProjectSubmissionProps) {
    const { api, state } = useHackathon();
    const { selectedHackathonId } = state;
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [projectType, setProjectType] = useState<'Real-Time' | 'Mini' | 'Major' | 'Other' | ''>('');
    
    const [interest, setInterest] = useState('');
    const [themes, setThemes] = useState<string[]>([]);
    const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);
    const [isGeneratingThemes, setIsGeneratingThemes] = useState(false);
    const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedHackathonId && projectType) {
            setIsSubmitting(true);
            try {
                await api.submitProject(selectedHackathonId, { title: projectName, description: projectDesc, githubUrl, teamId: team.id, projectType });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert("Please select a project type.");
        }
    };

     const handleSuggestThemes = async () => {
        if (!interest) return;
        setIsGeneratingThemes(true);
        setThemes([]);
        setGeneratedIdea(null);
        try {
            const result = await suggestThemes(interest);
            setThemes(result);
        } finally {
            setIsGeneratingThemes(false);
        }
    };

    const handleGenerateIdea = async (theme: string) => {
        setIsGeneratingIdea(true);
        setGeneratedIdea(null);
        try {
            const idea = await generateProjectIdea({ theme });
            setGeneratedIdea(idea);
        } catch (error) {
            console.error("Error generating project idea:", error);
            setGeneratedIdea("Failed to generate an idea. Please ensure your API key is correct and try again.");
        } finally {
            setIsGeneratingIdea(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto">
            <BackButton />
            <Card>
                 <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">Submit Your Project</CardTitle>
                    <CardDescription>Fill out the details for your team's submission.</CardDescription>
                </CardHeader>
                <CardContent className="border-t pt-6">
                     <div className="space-y-6 mb-8 p-4 border border-dashed border-border rounded-lg">
                        <div className="space-y-2">
                             <Label htmlFor="interest" className="flex items-center gap-2 font-semibold text-lg"><Wand2 className="text-primary"/> AI Idea Generation</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="interest" 
                                    value={interest} 
                                    onChange={e => setInterest(e.target.value)} 
                                    placeholder="Describe your interests (e.g., 'AI in Healthcare')" 
                                    disabled={isGeneratingThemes}
                                />
                                <Button onClick={handleSuggestThemes} disabled={isGeneratingThemes || !interest}>
                                    {isGeneratingThemes ? <Loader className="animate-spin"/> : 'Suggest Themes'}
                                 </Button>
                            </div>
                        </div>

                        {themes.length > 0 && (
                            <Carousel opts={{ align: "start" }} className="w-full">
                                <CarouselContent>
                                    {themes.map((theme, index) => (
                                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                            <div className="p-1">
                                                <Card className="bg-muted/50">
                                                    <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                                                        <p className="font-semibold text-center">{theme}</p>
                                                        <Button size="sm" onClick={() => handleGenerateIdea(theme)} disabled={isGeneratingIdea}>
                                                            {isGeneratingIdea ? <Loader className="animate-spin"/> : <><Lightbulb className="mr-2"/> Generate Idea</>}
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        )}
                        
                        {generatedIdea && (
                            <Card className="bg-muted">
                                <CardContent className="pt-6">
                                    <p className="font-mono text-sm text-foreground">{generatedIdea}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>


                    <form onSubmit={handleSubmitProject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectType">Project Type</Label>
                            <Select onValueChange={(v) => setProjectType(v as any)} value={projectType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the type of your project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Real-Time">Real-Time Project</SelectItem>
                                    <SelectItem value="Mini">Mini Project</SelectItem>
                                    <SelectItem value="Major">Major Project</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="projectDesc">Project Description</Label>
                            <Textarea id="projectDesc" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                            <Input id="githubUrl" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Submit Project'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
