
"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Users, Loader, Bot, Presentation, FileText, Link as LinkIcon, Tags, Github } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Team, ChatMessage, ProjectSubmission, ProjectIdea } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { getAiProjectSummary } from '@/app/actions';

const GuideChatDialog = ({ team, guide, open, onOpenChange }: { team: Team, guide: any, open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { api } = useHackathon();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sortedMessages = useMemo(() => {
        if (Array.isArray(team.guideMessages)) {
            return [...team.guideMessages].sort((a, b) => a.timestamp - b.timestamp);
        }
        return [];
    }, [team.guideMessages]);

    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [sortedMessages, open]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !guide) return;
        
        setIsLoading(true);
        try {
            await api.postGuideMessage(team.id, {
                userId: guide.id,
                userName: guide.name,
                text: message,
                timestamp: Date.now()
            });
            setMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Conversation with Team: {team.name}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-4">
                            {sortedMessages.length > 0 ? sortedMessages.map((msg: ChatMessage) => (
                                <div key={msg.id} className={`flex flex-col ${msg.userId === guide?.id ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-xs ${msg.userId === guide?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1 px-1">
                                        {msg.userName.split(' ')[0]} - {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground pt-16">No messages yet. Start the conversation!</p>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto border-t pt-4">
                    <Input
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Type a message to the team..."
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader className="animate-spin"/> : <Send />}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};


const TeamCardForGuide = ({ team, project }: { team: Team, project?: ProjectSubmission }) => {
    const { state } = useHackathon();
    const { currentFaculty } = state;
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState<Record<string, string>>({});
    const [isGeneratingSummary, setIsGeneratingSummary] = useState<string | null>(null);

    const handleGenerateSummary = async (idea: ProjectIdea) => {
        setIsGeneratingSummary(idea.id);
        try {
            const summary = await getAiProjectSummary({
                projectName: idea.title,
                projectDescription: idea.abstractText,
                githubUrl: idea.githubUrl,
            });
            setAiSummary(prev => ({ ...prev, [idea.id]: summary }));
        } catch (error) {
            console.error("Error generating AI summary:", error);
            setAiSummary(prev => ({ ...prev, [idea.id]: "Could not generate summary." }));
        } finally {
            setIsGeneratingSummary(null);
        }
    };
    
    return (
        <>
            <Card className="bg-muted/50 flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <Button onClick={() => setIsChatOpen(true)} size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" /> Chat
                        </Button>
                    </div>
                    <CardDescription className="flex items-center gap-2 pt-1"><Users className="h-4 w-4"/> {team.members.length} members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                    {!project ? (
                        <div className="text-center text-muted-foreground pt-8">
                            <p>No project submitted yet.</p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {project.projectIdeas.map((idea, index) => (
                                <AccordionItem value={`idea-${index}`} key={idea.id}>
                                    <AccordionTrigger>Project Idea {index + 1}: {idea.title}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 p-2">
                                            <div>
                                                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Abstract</h4>
                                                <p className="text-sm whitespace-pre-wrap mt-1">{idea.abstractText}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</h4>
                                                <Link href={idea.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all text-sm">{idea.githubUrl}</Link>
                                            </div>
                                            {idea.abstractFileUrl && (
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Abstract Document</h4>
                                                    <Link href={idea.abstractFileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm">View Uploaded File</Link>
                                                </div>
                                            )}
                                             <div className="border-t pt-4 mt-4">
                                                <Button onClick={() => handleGenerateSummary(idea)} disabled={isGeneratingSummary === idea.id} variant="outline" size="sm">
                                                    {isGeneratingSummary === idea.id ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <><Bot className="mr-2 h-4 w-4"/>Generate AI Summary</>}
                                                </Button>
                                                {aiSummary[idea.id] && (
                                                     <div className="mt-4 p-3 bg-background/50 rounded-md border">
                                                        <p className="text-sm">{aiSummary[idea.id]}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
            <GuideChatDialog 
                team={team} 
                guide={currentFaculty} 
                open={isChatOpen} 
                onOpenChange={setIsChatOpen} 
            />
        </>
    );
};


export default function GuideTeamsDashboard() {
    const { state } = useHackathon();
    const { teams, projects, currentFaculty, selectedHackathonId } = state;

    const myAssignedTeams = useMemo(() => {
        if (!currentFaculty || !selectedHackathonId) return [];
        return teams.filter(team => 
            team.guide?.id === currentFaculty.id &&
            team.hackathonId === selectedHackathonId
        );
    }, [teams, currentFaculty, selectedHackathonId]);

    if (!currentFaculty || !['guide', 'class-mentor'].includes(currentFaculty.role)) {
        return (
            <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                    This dashboard is for assigned guides and class mentors only.
                </CardContent>
            </Card>
        );
    }
    
    if (!selectedHackathonId) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Please select a project type from the top to view your assigned teams.</p>
                </CardContent>
            </Card>
        );
    }
    
    if (myAssignedTeams.length === 0) {
        return (
             <Card>
                <CardContent className="py-16 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">You have not been assigned to any teams for this project type yet.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">My Assigned Teams</CardTitle>
                    <CardDescription>Manage and communicate with the teams you are mentoring.</CardDescription>
                </CardHeader>
            </Card>

            <ScrollArea className="h-[calc(100vh-25rem)] pr-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myAssignedTeams.map(team => {
                        const project = projects.find(p => p.teamId === team.id);
                        return <TeamCardForGuide key={team.id} team={team} project={project} />
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
