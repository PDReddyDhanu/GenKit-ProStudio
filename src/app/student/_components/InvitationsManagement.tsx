
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, UserPlus, Inbox, Check, X } from 'lucide-react';
import type { Team, JoinRequest } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InvitationsManagementProps {
    teams: Team[];
}

export default function InvitationsManagement({ teams }: InvitationsManagementProps) {
    const { api } = useHackathon();
    const [isLoading, setIsLoading] = useState<string | null>(null); // teamId-userId-action

    const handleRequest = async (teamId: string, request: JoinRequest, action: 'accept' | 'reject') => {
        setIsLoading(`${teamId}-${request.id}-${action}`);
        try {
            await api.handleJoinRequest(teamId, request, action);
        } finally {
            setIsLoading(null);
        }
    };
    
    const allRequests = teams.flatMap(team => 
        (team.joinRequests || []).map(req => ({ ...req, teamName: team.name, teamId: team.id }))
    );

    if (teams.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Manage Invitations</CardTitle>
                    <CardDescription>Review and respond to requests from students who want to join your team(s).</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You have not created any teams yet. Once you create a team, you can manage join requests here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <UserPlus className="text-primary"/> Incoming Join Requests
                </CardTitle>
                <CardDescription>Review and respond to requests from students who want to join your team(s).</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                        {allRequests.length > 0 ? allRequests.map(req => (
                            <div key={`${req.teamId}-${req.id}`} className="p-3 bg-muted/50 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                    <p className="font-semibold">{req.name}</p>
                                    <p className="text-sm text-muted-foreground">{req.email}</p>
                                    <p className="text-xs text-primary mt-1">Wants to join: <strong>{req.teamName}</strong></p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button size="sm" onClick={() => handleRequest(req.teamId, req, 'accept')} disabled={!!isLoading} className="bg-green-600 hover:bg-green-700">
                                        {isLoading === `${req.teamId}-${req.id}-accept` ? <Loader className="animate-spin h-4 w-4"/> : <Check className="h-4 w-4" />}
                                        <span className="ml-2 hidden sm:inline">Accept</span>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleRequest(req.teamId, req, 'reject')} disabled={!!isLoading}>
                                         {isLoading === `${req.teamId}-${req.id}-reject` ? <Loader className="animate-spin h-4 w-4"/> : <X className="h-4 w-4" />}
                                          <span className="ml-2 hidden sm:inline">Reject</span>
                                    </Button>
                                </div>
                            </div>
                        )) : (
                             <div className="text-center py-16">
                                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">You have no pending requests for any of your teams.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
