
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Users, Loader, Search } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import { AuthMessage } from '@/components/AuthMessage';
import { Team } from '@/lib/types';
import HackathonSelector from '../student/_components/HackathonSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TeamFinder() {
    const { state, api } = useHackathon();
    const { teams, hackathons, selectedHackathonId, currentUser } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const filteredTeams = useMemo(() => {
        if (!selectedHackathonId) return [];
        let currentTeams = teams.filter(t => t.hackathonId === selectedHackathonId);
        if (searchQuery) {
            currentTeams = currentTeams.filter(team =>
                team.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return currentTeams;
    }, [teams, selectedHackathonId, searchQuery]);

    const currentHackathon = useMemo(() => {
        return hackathons.find(h => h.id === selectedHackathonId);
    }, [hackathons, selectedHackathonId]);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Users className="w-full h-full" />} title="Team Finder" description="Find a team or recruit new members." />;
    }

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && selectedHackathonId) {
            setIsJoining(true);
            try {
                await api.requestToJoinTeamByCode(selectedHackathonId, joinCode, currentUser);
                setJoinCode('');
            } finally {
                setIsJoining(false);
            }
        } else {
            alert("You must be logged in and have a hackathon selected to join a team.");
        }
    };
    
    if (!selectedHackathonId || !currentHackathon) {
        return (
            <div className="py-12 animate-slide-in-up">
                 <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Select a Hackathon</CardTitle>
                        <CardDescription>Please select a hackathon from the student dashboard to see available teams.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-2 font-headline">Team Finder</h1>
            <p className="text-center text-muted-foreground mb-8">Showing teams for {currentHackathon?.name}</p>
            <AuthMessage />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-headline">Join a Team by Code</CardTitle>
                        <CardDescription>Enter a team's code to send a join request.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJoinTeam} className="space-y-4">
                            <div className="space-y-2">
                                <Input 
                                    placeholder="Enter 6-digit join code" 
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    disabled={isJoining || !currentUser}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isJoining || !currentUser}>
                                 {isJoining ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Sending Request...</> : 'Send Request to Join'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Existing Teams ({filteredTeams.length})</h2>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for a team by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 mb-6"
                        />
                    </div>
                </div>
            </div>
            
            {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1000px]">
                    {filteredTeams.map(team => (
                        <Card key={team.id} className="flex flex-col transition-all duration-300 transform-gpu animate-card-in hover:[transform:rotateX(var(--rotate-x,5deg))_rotateY(var(--rotate-y,5deg))_scale3d(1.05,1.05,1.05)]">
                            <CardHeader>
                                <CardTitle className="font-headline">{team.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Users className="h-4 w-4" /> {team.members.length} / {currentHackathon?.teamSizeLimit || 4} members
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
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-muted-foreground">{searchQuery ? 'No teams match your search.' : 'No teams have been created yet for this hackathon. Be the first!'}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
