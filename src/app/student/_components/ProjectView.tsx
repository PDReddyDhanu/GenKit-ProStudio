
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { CheckCircle, Bot, Loader, Download, Pencil, Presentation } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAiCodeReview, generatePitchOutline } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useHackathon } from '@/context/HackathonProvider';
import { generateCertificate } from '@/lib/pdf';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GeneratePitchOutlineOutput } from '@/ai/flows/generate-pitch-outline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { marked } from 'marked';

interface ProjectViewProps {
    project: Project;
}

export default function ProjectView({ project }: ProjectViewProps) {
    const { state, api } = useHackathon();
    const { teams, selectedCollege } = state;
    const [isReviewing, setIsReviewing] = useState(false);
    const [review, setReview] = useState('');
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [projectName, setProjectName] = useState(project.name);
    const [projectDesc, setProjectDesc] = useState(project.description);
    const [githubUrl, setGithubUrl] = useState(project.githubUrl);

    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [pitchOutline, setPitchOutline] = useState<GeneratePitchOutlineOutput | null>(null);

     useEffect(() => {
        setProjectName(project.name);
        setProjectDesc(project.description);
        setGithubUrl(project.githubUrl);
    }, [project]);


    const handleGetReview = async () => {
        setIsReviewing(true);
        setReview('');
        try {
            const result = await getAiCodeReview({ githubUrl: project.githubUrl });
            setReview(result);
        } catch (error) {
            console.error("Error getting AI review:", error);
            setReview("Sorry, we couldn't generate a review at this time. Please try again later.");
        } finally {
            setIsReviewing(false);
        }
    };
    
    const handleDownloadCertificate = async () => {
        const team = teams.find(t => t.id === project.teamId);
        if (team && project && selectedCollege) {
            setIsGeneratingCert(true);
            try {
                const teamMembers = team.members.map(m => m.name);
                await generateCertificate(team.name, project.name, teamMembers, project.id, project.averageScore, selectedCollege);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGeneratingCert(false);
            }
        }
    };

    const handleGenerateOutline = async () => {
        setIsGeneratingOutline(true);
        setPitchOutline(null);
        try {
            const result = await generatePitchOutline({
                projectName: project.name,
                projectDescription: project.description,
                aiCodeReview: review || undefined
            });
            setPitchOutline(result);
        } finally {
            setIsGeneratingOutline(false);
        }
    };
    
    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.updateProject(project.id, {
                name: projectName,
                description: projectDesc,
                githubUrl,
            });
            setIsEditing(false);
        } catch(error) {
            console.error("Failed to save changes:", error);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="container max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <div>
                                <CardTitle className="text-3xl font-bold text-secondary font-headline">{project.name}</CardTitle>
                                <CardDescription className="text-lg">Submission successful!</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} disabled={isSaving}>
                            <Pencil className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <form onSubmit={handleSaveChanges} className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="editProjectName">Project Name</Label>
                                <Input id="editProjectName" value={projectName} onChange={e => setProjectName(e.target.value)} required disabled={isSaving} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editProjectDesc">Project Description</Label>
                                <Textarea id="editProjectDesc" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} required disabled={isSaving} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editGithubUrl">GitHub Repository URL</Label>
                                <Input id="editGithubUrl" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required disabled={isSaving} />
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3 text-sm">
                            <p><span className="font-bold text-muted-foreground">Description:</span> {project.description}</p>
                            <p><span className="font-bold text-muted-foreground">GitHub:</span> <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{project.githubUrl}</Link></p>
                        </div>
                    )}

                    <div className="mt-6 border-t pt-4 space-y-4">
                        <Button onClick={handleDownloadCertificate} disabled={isGeneratingCert}>
                            {isGeneratingCert ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Download className="mr-2 h-4 w-4"/>Download Participation Certificate</>}
                        </Button>
                    </div>

                    <div className="mt-6 border-t pt-4 space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Bot className="text-primary"/> AI Code Review</h4>
                        <Button onClick={handleGetReview} disabled={isReviewing} variant="outline">
                            {isReviewing ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Get AI Feedback"}
                        </Button>
                        {review && (
                            <Card className="bg-muted/50">
                                <CardContent className="pt-6">
                                    <pre className="text-sm whitespace-pre-wrap font-code text-foreground">{review}</pre>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="mt-6 border-t pt-4 space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Presentation className="text-primary"/> AI Pitch Coach</h4>
                        <Button onClick={handleGenerateOutline} disabled={isGeneratingOutline} variant="outline">
                            {isGeneratingOutline ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "Generate Presentation Outline"}
                        </Button>
                        {pitchOutline && (
                            <Accordion type="single" collapsible className="w-full">
                                {pitchOutline.slides.map((slide, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>{index + 1}. {slide.title}</AccordionTrigger>
                                    <AccordionContent>
                                        <div
                                            className="prose prose-sm dark:prose-invert text-foreground max-w-none"
                                            dangerouslySetInnerHTML={{ __html: marked(slide.content) as string }}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
