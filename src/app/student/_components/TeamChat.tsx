
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare, Loader } from 'lucide-react';
import type { Team } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamChatProps {
    team: Team;
}

export default function TeamChat({ team }: TeamChatProps) {
    const { state, api } = useHackathon();
    const { currentUser } = state;
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sortedMessages = (team.messages || []).sort((a, b) => a.timestamp - b.timestamp);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [team.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !currentUser) return;
        
        setIsLoading(true);
        try {
            await api.postTeamMessage(team.id, {
                userId: currentUser.id,
                userName: currentUser.name,
                text: message,
                timestamp: Date.now()
            });
            setMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[400px]">
             <CardHeader className="p-0 mb-4">
                <CardTitle className="font-headline flex items-center gap-2">
                    <MessageSquare className="text-primary"/> Team Chat
                </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-grow pr-4">
                <div className="space-y-4">
                    {sortedMessages.length > 0 ? sortedMessages.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.userId === currentUser?.id ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xs ${msg.userId === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 border-t pt-4">
                <Input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader className="animate-spin"/> : <Send />}
                </Button>
            </form>
        </div>
    );
}
