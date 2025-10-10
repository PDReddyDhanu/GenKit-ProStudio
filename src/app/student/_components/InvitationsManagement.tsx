

"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, UserPlus, Inbox, Check, X, Send, Users, Trash2 } from 'lucide-react';
import type { Team, JoinRequest, User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function InvitationsManagement() {
    const { state, api } = useHackathon();
    const { currentUser, teams, hackathons, selectedHackathonId } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null); // format: "action-teamId-requestId" or "remove-teamId-memberId"

    const myCreatedTeams = useMemo(() => {
        if (!currentUser) return [];
        return teams.filter(team => team.creatorId === currentUser.id && team.hackathonId === selectedHackathonId);
    }, [teams, currentUser, selectedHackathonId]);

    const myPendingRequests = useMemo(() => {
        if (!currentUser) return [];
        return teams
            .filter(team => team.hackathonId === selectedHackathonId && team.joinRequests?.some(req => req.id === currentUser.id))
            .map(team => ({
                teamId: team.id,
                teamName: team.name,
                hackathonName: hackathons.find(h => h.id === team.hackathonId)?.name || 'Unknown Hackathon'
            }));
    }, [teams, currentUser, hackathons, selectedHackathonId]);

    const handleRequest = async (teamId: string, request: JoinRequest, action: 'accept' | 'reject') => {
        setIsLoading(`${action}-${teamId}-${request.id}`);
        try {
            await api.handleJoinRequest(teamId, request, action);
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleRemoveMember = async (teamId: string, member: User) => {
        if (!window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) return;
        
        setIsLoading(`remove-${teamId}-${member.id}`);
        try {
            await api.removeTeammate(teamId, member);
        } catch (error) {
            console.error("Failed to remove member:", error);
        } finally {
            setIsLoading(null);
        }
    }
    
    const handleDeleteTeam = async (teamId: string) => {
        setIsLoading(`delete-${teamId}`);
        try {
            await api.deleteTeam(teamId);
        } catch (error) {
            console.error("Failed to delete team:", error);
        } finally {
            setIsLoading(null);
        }
    };

    if (!selectedHackathonId) {
        return (
            <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                    Please select a project type from the dashboard to manage your teams and requests.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <UserPlus className="text-primary"/> Manage Your Teams
                    </CardTitle>
                    <CardDescription>Review join requests and manage members for the teams you lead in this project event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-6">
                            {myCreatedTeams.length > 0 ? myCreatedTeams.map(team => (
                                <div key={team.id} className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg text-primary">{team.name}</h3>
                                            <p className="text-sm text-muted-foreground">{hackathons.find(h => h.id === team.hackathonId)?.name || "Selected Project"}</p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={!!isLoading}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Team
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the team and any associated project submissions.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteTeam(team.id)} className="bg-destructive hover:bg-destructive/80">
                                                        {isLoading === `delete-${team.id}` ? <Loader className="animate-spin" /> : 'Yes, Delete Team'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    
                                    {/* Member Management */}
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm flex items-center gap-2"><Users className="h-4 w-4"/>Team Members</h4>
                                        {team.members.map(member => (
                                            <div key={member.id} className="p-2 bg-muted/20 rounded-md flex justify-between items-center">
                                                <p className="font-semibold text-sm">{member.name} {member.id === currentUser?.id && '(You)'}</p>
                                                {currentUser?.id === team.creatorId && member.id !== currentUser?.id && (
                                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveMember(team.id, member)} disabled={!!isLoading}>
                                                        {isLoading === `remove-${team.id}-${member.id}` ? <Loader className="animate-spin h-4 w-4"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Request Management */}
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm flex items-center gap-2"><Inbox className="h-4 w-4"/>Incoming Requests ({team.joinRequests?.length || 0})</h4>
                                        {team.joinRequests && team.joinRequests.length > 0 ? team.joinRequests.map(req => (
                                            <div key={`${team.id}-${req.id}`} className="p-3 bg-muted/50 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                <div>
                                                    <p className="font-semibold">{req.name}</p>
                                                    <p className="text-sm text-muted-foreground">{req.email}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button size="sm" onClick={() => handleRequest(team.id, req, 'accept')} disabled={!!isLoading} className="bg-green-600 hover:bg-green-700">
                                                        {isLoading === `accept-${team.id}-${req.id}` ? <Loader className="animate-spin h-4 w-4"/> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleRequest(team.id, req, 'reject')} disabled={!!isLoading}>
                                                        {isLoading === `reject-${team.id}-${req.id}` ? <Loader className="animate-spin h-4 w-4"/> : <X className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        )) : <p className="text-xs text-muted-foreground pl-2">No pending requests.</p>}
                                    </div>
                                   {myCreatedTeams.length > 1 && <Separator />}
                                </div>
                            )) : (
                                <div className="text-center py-16">
                                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">You have not created any teams for this project event.</p>
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
                    <CardDescription>Track your requests to join other teams for this project event.</CardDescription>
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
                                    <p className="mt-4 text-muted-foreground">You have not sent any join requests for this project event.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
