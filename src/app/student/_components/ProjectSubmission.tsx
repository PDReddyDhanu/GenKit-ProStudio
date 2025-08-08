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
import { Lightbulb, Loader } from 'lucide-react';

interface ProjectSubmissionProps {
    team: Team;
}

export default function ProjectSubmission({ team }: ProjectSubmissionProps) {
    const { dispatch } = useHackathon();
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [ideaThemeQuery, setIdeaThemeQuery] = useState('');
    const [suggestedThemes, setSuggestedThemes] = useState<string[]>([]);
    const [generatedIdea, setGeneratedIdea] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingThemes, setIsGeneratingThemes] = useState(false);

    const handleSubmitProject = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_PROJECT', payload: { name: projectName, description: projectDesc, githubUrl } });
    };

    const handleSuggestThemes = async () => {
        if (!ideaThemeQuery) return;
        setIsGeneratingThemes(true);
        setSuggestedThemes([]);
        setGeneratedIdea('');
        try {
            const themes = await suggestThemes(ideaThemeQuery);
            setSuggestedThemes(themes);
        } catch (error) {
            console.error("Error suggesting themes:", error);
            setSuggestedThemes([]);
        } finally {
            setIsGeneratingThemes(false);
        }
    };

    const handleGenerateIdea = async (theme: string) => {
        setIsGenerating(true);
        setGeneratedIdea('');
        try {
            const idea = await generateProjectIdea({ theme });
            setGeneratedIdea(idea);
        } catch (error) {
            setGeneratedIdea("Sorry, couldn't generate an idea right now.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="container max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">Team: {team.name}</CardTitle>
                    <CardDescription>
                        Share this code to invite members:
                        <span className="font-mono text-lg text-accent bg-muted p-2 rounded-md ml-2">{team.joinCode}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="border-t pt-6">
                    <div className="space-y-4 mb-6 p-4 border border-dashed rounded-lg">
                        <h4 className="font-semibold text-lg flex items-center gap-2 font-headline"><Lightbulb className="text-accent" /> Need an Idea?</h4>
                        <Label htmlFor="ideaThemeQuery">Describe your interests (e.g., "AI in Healthcare")</Label>
                        <div className="flex gap-2">
                             <Input id="ideaThemeQuery" value={ideaThemeQuery} onChange={e => setIdeaThemeQuery(e.target.value)} placeholder="Sustainable Tech, Gaming" />
                             <Button onClick={handleSuggestThemes} disabled={isGeneratingThemes}>
                                {isGeneratingThemes ? <Loader className="animate-spin" /> : 'Suggest Themes'}
                             </Button>
                        </div>
                        {suggestedThemes.length > 0 && (
                            <div className="space-y-2 animate-fade-in">
                                <p className="text-sm text-muted-foreground">Click a theme to generate an idea:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedThemes.map((theme, i) => (
                                        <Button key={i} variant="outline" size="sm" onClick={() => handleGenerateIdea(theme)} disabled={isGenerating}>
                                            {isGenerating ? <Loader className="animate-spin" /> : theme}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {generatedIdea && (
                            <div className="bg-muted p-3 rounded-md text-muted-foreground animate-fade-in">
                                <p className="font-mono">{generatedIdea}</p>
                            </div>
                        )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 font-headline">Submit Your Project</h3>
                    <form onSubmit={handleSubmitProject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="projectDesc">Project Description</Label>
                            <Textarea id="projectDesc" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                            <Input id="githubUrl" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Submit Project</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
