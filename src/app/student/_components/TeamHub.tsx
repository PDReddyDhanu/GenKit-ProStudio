
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Inbox, Check, X, Loader } from 'lucide-react';
import type { Team, User as UserType, JoinRequest } from '@/lib/types';
import TeamChat from './TeamChat';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamHubProps {
    team: Team;
}

export default function TeamHub({ team }: TeamHubProps) {
    const { api, state } = useHackathon();
    const { currentUser } = state;
    const [isLoadingRequest, setIsLoadingRequest] = useState<string | null>(null);

    const isTeamCreator = currentUser?.id === team.creatorId;

    const handleRequest = async (request: JoinRequest, action: 'accept' | 'reject') => {
        setIsLoadingRequest(`${team.id}-${request.id}-${action}`);
        try {
            await api.handleJoinRequest(team.id, request, action);
        } finally {
            setIsLoadingRequest(null);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users className="text-primary"/> Team Hub
                    </CardTitle>
                    <CardDescription>
                        Share this code to invite members:
                        <span className="font-mono text-lg text-accent bg-muted p-2 rounded-md ml-2">{team.joinCode}</span>
                    </CardDescription>
                </CardHeader>
                
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

            </Card>
            <TeamChat team={team} />
        </div>
    );
}
