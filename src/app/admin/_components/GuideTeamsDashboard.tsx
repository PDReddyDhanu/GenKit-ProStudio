
"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Users, Loader } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Team, ChatMessage } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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


const TeamCardForGuide = ({ team, project }: { team: Team, project?: any }) => {
    const { state } = useHackathon();
    const { currentFaculty } = state;
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2"><Users className="h-4 w-4"/> {team.members.length} members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Project Title:</h4>
                        <p className="text-primary">{project?.projectIdeas[0]?.title || 'Not Submitted Yet'}</p>
                    </div>
                    <Button onClick={() => setIsChatOpen(true)} className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat with Team
                    </Button>
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
    const { teams, projects, currentFaculty } = state;

    const myAssignedTeams = useMemo(() => {
        if (!currentFaculty) return [];
        return teams.filter(team => team.guide?.id === currentFaculty.id);
    }, [teams, currentFaculty]);

    if (currentFaculty?.role !== 'guide') {
        return (
            <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                    This dashboard is for assigned guides only.
                </CardContent>
            </Card>
        );
    }
    
    if (myAssignedTeams.length === 0) {
        return (
             <Card>
                <CardContent className="py-16 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">You have not been assigned to any teams yet.</p>
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
