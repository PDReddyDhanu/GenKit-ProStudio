
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectSubmission, ProjectIdea } from '@/lib/types';
import { CheckCircle, Bot, Loader, Download, Pencil, Presentation, ArrowLeft, Link as LinkIcon, FileText, Tags, Github } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectViewProps {
    submission: ProjectSubmission;
    onBack: () => void;
}

const IdeaDisplay = ({ idea }: { idea: ProjectIdea }) => {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Description</h4>
                <p>{idea.description}</p>
            </div>
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Abstract</h4>
                <p className="whitespace-pre-wrap">{idea.abstractText}</p>
            </div>
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><Tags className="h-4 w-4" /> Keywords</h4>
                <p>{idea.keywords}</p>
            </div>
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</h4>
                <Link href={idea.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{idea.githubUrl}</Link>
            </div>
            {idea.abstractFileUrl && (
                <div>
                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Abstract Document</h4>
                    <Link href={idea.abstractFileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">View Uploaded File</Link>
                </div>
            )}
        </div>
    )
}

export default function ProjectView({ submission: initialSubmission, onBack }: ProjectViewProps) {
    const { state, api } = useHackathon();
    const { teams, selectedCollege, projects } = state;
    const [submission, setSubmission] = useState(initialSubmission);

    const [isReviewing, setIsReviewing] = useState(false);
    const [review, setReview] = useState('');
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [pitchOutline, setPitchOutline] = useState<GeneratePitchOutlineOutput | null>(null);

    // This effect ensures the view updates if the submission data changes in the provider
    useEffect(() => {
        const updatedSubmission = projects.find(p => p.id === initialSubmission.id);
        if (updatedSubmission) {
            setSubmission(updatedSubmission);
        }
    }, [projects, initialSubmission.id]);


    const handleGetReview = async (githubUrl: string) => {
        setIsReviewing(true);
        setReview('');
        try {
            const result = await getAiCodeReview({ githubUrl });
            setReview(result);
        } catch (error) {
            console.error("Error getting AI review:", error);
            setReview("Sorry, we couldn't generate a review at this time. Please try again later.");
        } finally {
            setIsReviewing(false);
        }
    };
    
    const handleDownloadCertificate = async () => {
        const team = teams.find(t => t.id === submission.teamId);
        if (team && submission && selectedCollege) {
            setIsGeneratingCert(true);
            try {
                const teamMembers = team.members.map(m => m.name);
                await generateCertificate(team.name, submission.projectIdeas[0].title, teamMembers, submission.id, submission.averageScore, selectedCollege);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGeneratingCert(null);
            }
        }
    };

    const handleGenerateOutline = async (idea: ProjectIdea) => {
        setIsGeneratingOutline(true);
        setPitchOutline(null);
        try {
            const result = await generatePitchOutline({
                projectName: idea.title,
                projectDescription: idea.description,
                aiCodeReview: review || undefined
            });
            setPitchOutline(result);
        } finally {
            setIsGeneratingOutline(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto">
             <Button variant="ghost" onClick={onBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team Management
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <div>
                                <CardTitle className="text-3xl font-bold text-secondary font-headline">Ideas Submitted!</CardTitle>
                                <CardDescription className="text-lg">Your project ideas are awaiting faculty review.</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="idea-1" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            {submission.projectIdeas.map((idea, index) => (
                                <TabsTrigger key={idea.id} value={`idea-${index + 1}`}>Idea {index + 1}</TabsTrigger>
                            ))}
                        </TabsList>
                        {submission.projectIdeas.map((idea, index) => (
                            <TabsContent key={idea.id} value={`idea-${index + 1}`} className="mt-4">
                                <Card className="bg-muted/50">
                                    <CardHeader>
                                        <CardTitle>{idea.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <IdeaDisplay idea={idea} />
                                         <div className="mt-6 border-t pt-4 space-y-4">
                                            <h4 className="font-bold flex items-center gap-2"><Bot className="text-primary"/> AI Tools for this Idea</h4>
                                            <div className="flex flex-wrap gap-2">
                                                <Button onClick={() => handleGetReview(idea.githubUrl)} disabled={isReviewing} variant="outline" size="sm">
                                                    {isReviewing ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Reviewing Code...</> : "Get AI Code Review"}
                                                </Button>
                                                <Button onClick={() => handleGenerateOutline(idea)} disabled={isGeneratingOutline} variant="outline" size="sm">
                                                    {isGeneratingOutline ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : "AI Pitch Coach"}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                    
                    {review && (
                        <div className="mt-6 border-t pt-4 space-y-4">
                            <h4 className="font-bold flex items-center gap-2"><Bot className="text-primary"/> AI Code Review Result</h4>
                            <Card className="bg-muted/50">
                                <CardContent className="pt-6">
                                    <pre className="text-sm whitespace-pre-wrap font-code text-foreground">{review}</pre>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {pitchOutline && (
                        <div className="mt-6 border-t pt-4 space-y-4">
                            <h4 className="font-bold flex items-center gap-2"><Presentation className="text-primary"/> Generated Presentation Outline</h4>
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
                        </div>
                    )}
                    
                    <div className="mt-6 border-t pt-4 space-y-4">
                        <Button onClick={handleDownloadCertificate} disabled={isGeneratingCert}>
                            {isGeneratingCert ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Download className="mr-2 h-4 w-4"/>Download Participation Certificate</>}
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

