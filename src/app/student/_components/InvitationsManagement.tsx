
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, UserPlus, Inbox, Check, X, Send } from 'lucide-react';
import type { Team, JoinRequest } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function InvitationsManagement() {
    const { state, api } = useHackathon();
    const { currentUser, teams, hackathons, selectedHackathonId } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null); // format: "action-teamId-requestId"

    const myCreatedTeams = useMemo(() => {
        if (!currentUser) return [];
        return teams.filter(team => team.creatorId === currentUser.id);
    }, [teams, currentUser]);

    const myPendingRequests = useMemo(() => {
        if (!currentUser) return [];
        return teams
            .filter(team => team.joinRequests?.some(req => req.id === currentUser.id))
            .map(team => ({
                teamId: team.id,
                teamName: team.name,
                hackathonName: hackathons.find(h => h.id === team.hackathonId)?.name || 'Unknown Hackathon'
            }));
    }, [teams, currentUser, hackathons]);

    const handleRequest = async (teamId: string, request: JoinRequest, action: 'accept' | 'reject') => {
        setIsLoading(`${action}-${teamId}-${request.id}`);
        try {
            await api.handleJoinRequest(teamId, request, action);
        } finally {
            setIsLoading(null);
        }
    };
    
    const allRequestsForMyTeams = myCreatedTeams.flatMap(team => 
        (team.joinRequests || []).map(req => ({ ...req, teamName: team.name, teamId: team.id }))
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <UserPlus className="text-primary"/> Incoming Requests for Your Teams
                    </CardTitle>
                    <CardDescription>Review requests from students who want to join the teams you lead.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-4">
                            {allRequestsForMyTeams.length > 0 ? allRequestsForMyTeams.map(req => (
                                <div key={`${req.teamId}-${req.id}`} className="p-3 bg-muted/50 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                    <div>
                                        <p className="font-semibold">{req.name}</p>
                                        <p className="text-sm text-muted-foreground">{req.email}</p>
                                        <p className="text-xs text-primary mt-1">Wants to join: <strong>{req.teamName}</strong></p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button size="sm" onClick={() => handleRequest(req.teamId, req, 'accept')} disabled={!!isLoading} className="bg-green-600 hover:bg-green-700">
                                            {isLoading === `accept-${req.teamId}-${req.id}` ? <Loader className="animate-spin h-4 w-4"/> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleRequest(req.teamId, req, 'reject')} disabled={!!isLoading}>
                                            {isLoading === `reject-${req.teamId}-${req.id}` ? <Loader className="animate-spin h-4 w-4"/> : <X className="h-4 w-4" />}
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

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Send className="text-primary"/> Your Sent Requests
                    </CardTitle>
                    <CardDescription>Track the status of your requests to join other teams.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-96 pr-4">
                        <div className="space-y-4">
                            {myPendingRequests.length > 0 ? myPendingRequests.map(req => (
                                <div key={req.teamId} className="p-3 bg-muted/50 rounded-md">
                                    <p>Your request to join <strong>{req.teamName}</strong> is pending approval.</p>
                                    <p className="text-sm text-muted-foreground">{req.hackathonName}</p>
                                </div>
                            )) : (
                                <div className="text-center py-16">
                                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">You have not sent any join requests.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
