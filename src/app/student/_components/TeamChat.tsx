

"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader } from 'lucide-react';
import type { Team, ChatMessage, TeamMember } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamChatProps {
    team: Team;
    scope: 'team' | 'guide' | 'personal';
    recipient?: TeamMember; // For personal chat
}

export default function TeamChat({ team, scope, recipient }: TeamChatProps) {
    const { state, api } = useHackathon();
    const { currentUser } = state;
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const messages = useMemo(() => {
        let messageArray: ChatMessage[] = [];
        if (scope === 'team') {
            messageArray = team.teamMessages || [];
        } else if (scope === 'guide') {
            messageArray = team.guideMessages || [];
        } else if (scope === 'personal' && currentUser && recipient) {
            messageArray = (team.personalMessages || []).filter(msg => 
                (msg.userId === currentUser.id && msg.recipientId === recipient.id) ||
                (msg.userId === recipient.id && msg.recipientId === currentUser.id)
            );
        }

        if (Array.isArray(messageArray)) {
            return [...messageArray].sort((a, b) => a.timestamp - b.timestamp);
        }
        return [];
    }, [team, scope, currentUser, recipient]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !currentUser) return;
        
        setIsLoading(true);
        try {
            if (scope === 'team') {
                await api.postTeamMessage(team.id, {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    text: message,
                    timestamp: Date.now()
                });
            } else if (scope === 'guide') {
                 await api.postGuideMessage(team.id, {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    text: message,
                    timestamp: Date.now()
                });
            } else if (scope === 'personal' && recipient) {
                await api.postPersonalMessage(team.id, {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    recipientId: recipient.id,
                    text: message,
                    timestamp: Date.now()
                });
            }
            setMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-grow pr-4 h-[300px]">
                <div className="space-y-4">
                    {messages.length > 0 ? messages.map(msg => (
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

