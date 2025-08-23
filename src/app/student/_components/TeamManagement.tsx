"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createTeam, joinTeam } from '@/app/actions';
import { Loader } from 'lucide-react';

export default function TeamManagement() {
    const { state, dispatch, refreshData } = useHackathon();
    const { currentUser } = state;
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName || !currentUser) return;
        
        setIsCreating(true);
        const result = await createTeam({ teamName, userId: currentUser.id });
        if (result.success) {
            dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: result.message });
            await refreshData();
            // Refetch current user from updated state
            // This is tricky without a full session management. For now, we rely on refreshData
        } else {
            dispatch({ type: 'SET_AUTH_ERROR', payload: result.message });
        }
        setIsCreating(false);
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode || !currentUser) return;

        setIsJoining(true);
        const result = await joinTeam({ joinCode, userId: currentUser.id });
        if (result.success) {
            dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: result.message });
            await refreshData();
        } else {
            dispatch({ type: 'SET_AUTH_ERROR', payload: result.message });
        }
        setIsJoining(false);
    };

    return (
        <div className="container max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Create a New Team</CardTitle>
                    <CardDescription>Assemble your squad and get ready to build.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateTeam} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name</Label>
                            <Input id="teamName" type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isCreating}>
                             {isCreating ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : 'Create Team'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Join an Existing Team</CardTitle>
                    <CardDescription>Already have a team? Enter the code to join.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoinTeam} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="joinCode">Team Join Code</Label>
                            <Input id="joinCode" type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} required />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full" disabled={isJoining}>
                             {isJoining ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Joining...</> : 'Join Team'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
