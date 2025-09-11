
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Inbox, Check, X, Loader, MessageSquare, Trash2, User as UserIcon } from 'lucide-react';
import type { Team, User as UserType, JoinRequest } from '@/lib/types';
import TeamChat from './TeamChat';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TeamHubProps {
    team: Team;
}

export default function TeamHub({ team }: TeamHubProps) {
    const { api, state } = useHackathon();
    const { currentUser } = state;
    const [isLoadingRequest, setIsLoadingRequest] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const isTeamCreator = currentUser?.id === team.creatorId;

    const handleRequest = async (request: JoinRequest, action: 'accept' | 'reject') => {
        setIsLoadingRequest(`${team.id}-${request.id}-${action}`);
        try {
            await api.handleJoinRequest(team.id, request, action);
        } finally {
            setIsLoadingRequest(null);
        }
    };
    
    const handleRemoveMember = async (member: UserType) => {
        if (!window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) return;
        
        setIsRemoving(member.id);
        try {
            await api.removeTeammate(team.id, member);
        } catch (error) {
            console.error("Failed to remove member:", error);
        } finally {
            setIsRemoving(null);
        }
    }


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users className="text-primary"/> Team Hub: {team.name}
                    </CardTitle>
                    <CardDescription>
                        Share this code to invite members:
                        <span className="font-mono text-lg text-accent bg-muted p-2 rounded-md ml-2">{team.joinCode}</span>
                    </CardDescription>
                </CardHeader>
                
                 <CardContent className="border-t pt-6">
                    <h4 className="font-semibold mb-3">Team Members ({team.members.length})</h4>
                    <ul className="space-y-3">
                        {team.members.map(member => (
                            <li key={member.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <div className="flex flex-col">
                                    <span className="flex items-center gap-2 font-semibold">
                                        <UserIcon className="h-4 w-4" /> {member.name} 
                                        {member.id === team.creatorId && <Badge variant="secondary">Leader</Badge>}
                                    </span>
                                </div>
                                {isTeamCreator && member.id !== currentUser?.id && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member)} disabled={isRemoving === member.id}>
                                        {isRemoving === member.id ? <Loader className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>

                {isTeamCreator && (
                     <CardContent className="border-t pt-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Inbox /> Incoming Join Requests
                        </h4>
                        <ScrollArea className="h-48 pr-4">
                             <div className="space-y-3">
                                {(team.joinRequests || []).length > 0 ? team.joinRequests?.map(req => (
                                    <div key={req.id} className="p-3 bg-muted/50 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                        <div>
                                            <p className="font-semibold">{req.name}</p>
                                            <p className="text-sm text-muted-foreground">{req.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button size="sm" onClick={() => handleRequest(req, 'accept')} disabled={!!isLoadingRequest} className="bg-green-600 hover:bg-green-700">
                                                {isLoadingRequest === `${team.id}-${req.id}-accept` ? <Loader className="animate-spin h-4 w-4"/> : <Check className="h-4 w-4" />}
                                                <span className="ml-2 hidden sm:inline">Accept</span>
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleRequest(req, 'reject')} disabled={!!isLoadingRequest}>
                                                {isLoadingRequest === `${team.id}-${req.id}-reject` ? <Loader className="animate-spin h-4 w-4"/> : <X className="h-4 w-4" />}
                                                <span className="ml-2 hidden sm:inline">Reject</span>
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No pending requests.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                )}
                 <CardContent className="border-t pt-0">
                    <TeamChat team={team} />
                 </CardContent>

            </Card>
        </div>
    );
}
