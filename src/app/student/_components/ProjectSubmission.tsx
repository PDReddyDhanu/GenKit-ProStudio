
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Team, ProjectIdea } from '@/lib/types';
import { Loader, ArrowLeft, UploadCloud, Wand2, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateDetailedProjectIdeaAction } from '@/app/actions';
import type { GenerateDetailedProjectIdeaOutput } from '@/ai/flows/generate-detailed-project-idea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectSubmissionProps {
    team: Team;
    onBack: () => void;
}

const ProjectIdeaForm = ({ idea, setIdea, isSubmitting }: { idea: ProjectIdea, setIdea: (idea: ProjectIdea) => void, isSubmitting: boolean }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 1024 * 1024) { // 1MB limit
                alert("File size exceeds 1MB. Please choose a smaller file.");
                return;
            }
            if (!['application/pdf', 'image/jpeg', 'image/png'].includes(selectedFile.type)) {
                alert("Invalid file type. Please upload a PDF, JPG, or PNG.");
                return;
            }
            setFile(selectedFile);
            setIdea({ ...idea, abstractFile: selectedFile });
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor={`title-${idea.id}`}>Project Title</Label>
                <Input id={`title-${idea.id}`} value={idea.title} onChange={e => setIdea({ ...idea, title: e.target.value })} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`description-${idea.id}`}>Project Description (Short)</Label>
                <Textarea id={`description-${idea.id}`} value={idea.description} onChange={e => setIdea({ ...idea, description: e.target.value })} required disabled={isSubmitting} placeholder="A one-sentence summary of your project." />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`abstract-${idea.id}`}>Abstract (~400 words)</Label>
                <Textarea id={`abstract-${idea.id}`} value={idea.abstractText} onChange={e => setIdea({ ...idea, abstractText: e.target.value })} required disabled={isSubmitting} rows={10} placeholder="Provide a detailed abstract of your project idea."/>
            </div>
             <div className="space-y-2">
                <Label htmlFor={`keywords-${idea.id}`}>Keywords</Label>
                <Input id={`keywords-${idea.id}`} value={idea.keywords} onChange={e => setIdea({ ...idea, keywords: e.target.value })} required disabled={isSubmitting} placeholder="e.g., AI, Healthcare, Next.js, Firebase"/>
            </div>
             <div className="space-y-2">
                <Label htmlFor={`github-${idea.id}`}>GitHub Repository URL</Label>
                <Input id={`github-${idea.id}`} type="url" value={idea.githubUrl} onChange={e => setIdea({ ...idea, githubUrl: e.target.value })} required disabled={isSubmitting} placeholder="https://github.com/team/repo"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`file-${idea.id}`}>Abstract Document (PDF, JPG, PNG - Max 1MB)</Label>
                 <div className="flex items-center gap-2 p-2 border-2 border-dashed rounded-md">
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    <Input id={`file-${idea.id}`} type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="border-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" disabled={isSubmitting} />
                </div>
                 {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>
        </div>
    )
}

const IdeaGeneratorDialog = ({ open, onOpenChange, onUseIdea, generatedIdea, onRegenerate, isGenerating }: { open: boolean, onOpenChange: (open: boolean) => void, onUseIdea: () => void, generatedIdea: GenerateDetailedProjectIdeaOutput | null, onRegenerate: () => void, isGenerating: boolean }) => {
    if (!generatedIdea) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>AI Generated Project Idea</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">Title</Label>
                            <p className="font-semibold text-lg">{generatedIdea.title}</p>
                        </div>
                         <div>
                            <Label className="text-muted-foreground">Description</Label>
                            <p>{generatedIdea.description}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Abstract</Label>
                            <p className="text-sm whitespace-pre-wrap">{generatedIdea.abstract}</p>
                        </div>
                         <div>
                            <Label className="text-muted-foreground">Keywords</Label>
                            <p className="text-sm italic">{generatedIdea.keywords}</p>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onRegenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Regenerate
                    </Button>
                    <Button onClick={onUseIdea}>Use This Idea</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


export default function ProjectSubmission({ team, onBack }: ProjectSubmissionProps) {
    const { api, state } = useHackathon();
    const { selectedHackathonId } = state;
    const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([
        { id: '1', title: '', description: '', abstractText: '', keywords: '', githubUrl: '' },
        { id: '2', title: '', description: '', abstractText: '', keywords: '', githubUrl: '' },
        { id: '3', title: '', description: '', abstractText: '', keywords: '', githubUrl: '' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('idea-1');

    const [generatorTheme, setGeneratorTheme] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedIdea, setGeneratedIdea] = useState<GenerateDetailedProjectIdeaOutput | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);

    const isTeamSizeValid = team.members.length >= 2 && team.members.length <= 6;

    const handleSetIdea = (updatedIdea: ProjectIdea) => {
        setProjectIdeas(prev => prev.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
    }

    const handleSubmitProject = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ensure at least the first idea has a title
        if (!projectIdeas[0].title) {
            alert("Please provide details for at least the first project idea.");
            return;
        }

        if (selectedHackathonId && isTeamSizeValid) {
            setIsSubmitting(true);
            try {
                // Filter out empty ideas, but always include the first one for validation
                const ideasToSubmit = projectIdeas.filter((idea, index) => index === 0 || idea.title.trim() !== '');
                await api.submitProject(selectedHackathonId, { teamId: team.id, ideas: ideasToSubmit });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert("Your team size must be between 2 and 6 members to submit a project.");
        }
    };
    
    const handleGenerateIdea = async () => {
        if (!generatorTheme.trim()) {
            alert("Please enter a theme or topic for the AI to generate ideas.");
            return;
        }
        setIsGenerating(true);
        setGeneratedIdea(null);
        try {
            const result = await generateDetailedProjectIdeaAction({ theme: generatorTheme });
            if (result) {
                setGeneratedIdea(result);
                setIsDialogVisible(true);
            } else {
                alert("The AI failed to generate an idea. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while generating the idea.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleUseGeneratedIdea = () => {
        if (!generatedIdea) return;
        
        const ideaIndex = parseInt(activeTab.split('-')[1]) - 1;
        const ideasCopy = [...projectIdeas];
        ideasCopy[ideaIndex] = {
            ...ideasCopy[ideaIndex],
            title: generatedIdea.title,
            description: generatedIdea.description,
            abstractText: generatedIdea.abstract,
            keywords: generatedIdea.keywords,
        };
        setProjectIdeas(ideasCopy);
        setIsDialogVisible(false);
    };

    return (
        <div className="container max-w-3xl mx-auto">
            <Button variant="ghost" onClick={onBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team Management
            </Button>
            <Card>
                 <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">Submit Your Project Ideas</CardTitle>
                    <CardDescription>Fill out the details for up to three project ideas. The first idea is mandatory. Faculty will review and approve one.</CardDescription>
                </CardHeader>

                <CardContent>
                    <Card className="bg-muted/50 mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-headline"><Wand2 className="text-primary"/>AI Idea Helper</CardTitle>
                             <CardDescription>Stuck? Enter a theme and let AI generate a full project proposal for you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input 
                                    placeholder="e.g., 'AI in healthcare' or 'Gamified learning app'" 
                                    value={generatorTheme}
                                    onChange={(e) => setGeneratorTheme(e.target.value)}
                                    disabled={isGenerating}
                                />
                                <Button onClick={handleGenerateIdea} disabled={isGenerating} className="w-full sm:w-auto">
                                    {isGenerating ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "Generate Idea"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmitProject} className="space-y-6">
                         <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="idea-1">Idea 1</TabsTrigger>
                                <TabsTrigger value="idea-2">Idea 2</TabsTrigger>
                                <TabsTrigger value="idea-3">Idea 3</TabsTrigger>
                            </TabsList>
                            <TabsContent value="idea-1" className="mt-4">
                                <ProjectIdeaForm idea={projectIdeas[0]} setIdea={(idea) => setProjectIdeas(prev => [idea, prev[1], prev[2]])} isSubmitting={isSubmitting} />
                            </TabsContent>
                            <TabsContent value="idea-2" className="mt-4">
                                <ProjectIdeaForm idea={projectIdeas[1]} setIdea={(idea) => setProjectIdeas(prev => [prev[0], idea, prev[2]])} isSubmitting={isSubmitting} />
                            </TabsContent>
                            <TabsContent value="idea-3" className="mt-4">
                                <ProjectIdeaForm idea={projectIdeas[2]} setIdea={(idea) => setProjectIdeas(prev => [prev[0], prev[1], idea])} isSubmitting={isSubmitting} />
                            </TabsContent>
                        </Tabs>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full">
                                        <Button type="submit" className="w-full" disabled={isSubmitting || !isTeamSizeValid}>
                                            {isSubmitting ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Submit Project Ideas'}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!isTeamSizeValid && (
                                     <TooltipContent>
                                        <p>Your team must have between 2 and 6 members to submit.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </form>
                </CardContent>
            </Card>

            <IdeaGeneratorDialog 
                open={isDialogVisible}
                onOpenChange={setIsDialogVisible}
                generatedIdea={generatedIdea}
                onUseIdea={handleUseGeneratedIdea}
                onRegenerate={handleGenerateIdea}
                isGenerating={isGenerating}
            />
        </div>
    );
}
