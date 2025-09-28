"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';

interface TeamManagementProps {
    onTeamCreated: () => void;
}

export default function TeamManagement({ onTeamCreated }: TeamManagementProps) {
    const { state, api } = useHackathon();
    const { currentUser, selectedHackathonId, teams } = state;
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const pendingRequestTeam = useMemo(() => {
        if (!currentUser || !selectedHackathonId) return null;
        return teams.find(team => 
            team.hackathonId === selectedHackathonId &&
            team.joinRequests?.some(req => req.id === currentUser.id)
        );
    }, [teams, currentUser, selectedHackathonId]);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && selectedHackathonId) {
            setIsCreating(true);
            try {
                await api.createTeam(selectedHackathonId, teamName, currentUser);
                onTeamCreated();
            } finally {
                setIsCreating(false);
            }
        }
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && selectedHackathonId) {
            setIsJoining(true);
            try {
                await api.requestToJoinTeamByCode(selectedHackathonId, joinCode, currentUser);
            } finally {
                setIsJoining(false);
            }
        }
    };

    if (pendingRequestTeam) {
        return (
            <div className="container max-w-2xl mx-auto py-12">
                <BackButton />
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Request Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-muted-foreground">Your request to join team <strong className="text-primary">{pendingRequestTeam.name}</strong> is pending approval from the team leader.</p>
                        <p className="text-muted-foreground mt-2">You will be notified once they respond.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto">
             <BackButton />
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Create a New Team</CardTitle>
                        <CardDescription>Assemble your squad and get ready to build.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamName">Team Name</Label>
                                <Input id="teamName" type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required disabled={isCreating} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isCreating}>
                                {isCreating ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : 'Create Team'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Join a Team</CardTitle>
                        <CardDescription>Enter a team's code to send a join request.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJoinTeam} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="joinCode">Team Join Code</Label>
                                <Input id="joinCode" type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} required disabled={isJoining} />
                            </div>
                            <Button type="submit" variant="secondary" className="w-full" disabled={isJoining}>
                                 {isJoining ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Sending Request...</> : 'Send Request to Join'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
