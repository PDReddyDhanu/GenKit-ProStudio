"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeamManagement() {
    const { dispatch } = useHackathon();
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamName) dispatch({ type: 'CREATE_TEAM', payload: { teamName } });
    };

    const handleJoinTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode) dispatch({ type: 'JOIN_TEAM', payload: { joinCode } });
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
                        <Button type="submit" className="w-full">Create Team</Button>
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
                        <Button type="submit" variant="secondary" className="w-full">Join Team</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
