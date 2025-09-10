
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Users, Loader } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import { AuthMessage } from '@/components/AuthMessage';
import { Team } from '@/lib/types';
import HackathonSelector from '../student/_components/HackathonSelector';

export default function TeamFinder() {
    const { state, api, dispatch } = useHackathon();
    const { teams, currentUser, hackathons, selectedHackathonId } = state;
    const [joinCode, setJoinCode] = useState('');
    const [showIntro, setShowIntro] = useState(true);
    const [isJoining, setIsJoining] = useState<string | null>(null); // Track joining by team ID

    const handleRequestToJoin = async (team: Team) => {
        if (!currentUser) {
             dispatch({ type: 'SET_AUTH_ERROR', payload: "You must be logged in to request to join a team." });
             return;
        }
        if (currentUser.teamId) {
             dispatch({ type: 'SET_AUTH_ERROR', payload: "You are already in a team." });
             return;
        }
        setIsJoining(team.id);
        try {
            await api.requestToJoinTeamByCode(team.hackathonId, team.joinCode, currentUser);
        } finally {
            setIsJoining(null);
        }
    };
    
    const handleRequestWithCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            dispatch({ type: 'SET_AUTH_ERROR', payload: "You must be logged in to join a team." });
            return;
        }
         if (currentUser.teamId) {
             dispatch({ type: 'SET_AUTH_ERROR', payload: "You are already in a team." });
             return;
        }
        if (!selectedHackathonId) {
            dispatch({ type: 'SET_AUTH_ERROR', payload: "Please go to the Student Dashboard to select a hackathon first." });
            return;
        }
        setIsJoining('form-join');
        try {
            await api.requestToJoinTeamByCode(selectedHackathonId, joinCode, currentUser);
        } finally {
            setIsJoining(null);
        }
    }

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Users className="w-full h-full" />} title="Team Finder" description="Find a team or recruit new members." />;
    }

    if (!selectedHackathonId) {
        return (
            <div className="py-12 animate-slide-in-up">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Select a Hackathon</CardTitle>
                        <CardDescription>Please select a hackathon from the student dashboard to see available teams.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <HackathonSelector />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const currentTeams = teams.filter(t => t.hackathonId === selectedHackathonId);
    const currentHackathon = hackathons.find(h => h.id === selectedHackathonId);

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-2 font-headline">Team Finder</h1>
            <p className="text-center text-muted-foreground mb-8">Showing teams for {currentHackathon?.name}</p>
            <AuthMessage />
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Join a Team by Code</CardTitle>
                    <CardDescription>Already have a team code? Enter it here to send a join request.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleRequestWithCode} className="flex items-center gap-4">
                        <Label htmlFor="joinCode" className="sr-only">Join Code</Label>
                        <Input 
                            id="joinCode" 
                            placeholder="Enter 6-digit join code" 
                            value={joinCode} 
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="max-w-xs"
                            disabled={!!isJoining}
                        />
                        <Button type="submit" disabled={!joinCode || !!isJoining}>
                            {isJoining === 'form-join' ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Sending Request...</> : 'Send Request'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">Teams Looking for Members</h2>
            {currentTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1000px]">
                    {currentTeams.map(team => (
                        <Card key={team.id} className="flex flex-col transition-all duration-300 transform-gpu animate-card-in hover:[transform:rotateX(var(--rotate-x,5deg))_rotateY(var(--rotate-y,5deg))_scale3d(1.05,1.05,1.05)]">
                            <CardHeader>
                                <CardTitle className="font-headline">{team.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Users className="h-4 w-4" /> {team.members.length} member(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <h4 className="font-semibold mb-2 text-sm">Members:</h4>
                                <ul className="space-y-1">
                                    {team.members.map(member => (
                                        <li key={member.id} className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <User className="h-4 w-4" /> {member.name}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <div className="p-6 pt-0">
                                <Button className="w-full" onClick={() => handleRequestToJoin(team)} disabled={!!isJoining}>
                                    {isJoining === team.id ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Requesting...</> : `Request to Join "${team.name}"`}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-muted-foreground">No teams have been created yet for this hackathon. Be the first!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
