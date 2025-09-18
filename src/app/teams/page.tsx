

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { User, Users, Loader, Search, AlertCircle, Sparkles, Star } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import { AuthMessage } from '@/components/AuthMessage';
import { Team, User as UserType } from '@/lib/types';
import HackathonSelector from '../student/_components/HackathonSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { findTeammateMatches } from '@/app/actions';
import { Badge } from '@/components/ui/badge';

interface Match {
    user: UserType;
    compatibilityScore: number;
    reasoning: string;
}

function AIWizard() {
    const { state, api } = useHackathon();
    const { currentUser, teams, users, selectedHackathonId } = state;
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isJoining, setIsJoining] = useState<string | null>(null);

    const otherUsers = useMemo(() => {
        if (!currentUser || !selectedHackathonId) return [];
        const teamedUserIds = new Set(teams.flatMap(t => t.hackathonId === selectedHackathonId ? t.members.map(m => m.id) : []));
        return users.filter(u => u.id !== currentUser.id && !teamedUserIds.has(u.id));
    }, [users, teams, currentUser, selectedHackathonId]);

    const handleFindMatches = async () => {
        if (!currentUser || otherUsers.length === 0) return;
        setIsLoading(true);
        setMatches([]);
        try {
            const result = await findTeammateMatches({
                currentUser: {
                    id: currentUser.id,
                    name: currentUser.name,
                    skills: currentUser.skills,
                    workStyle: currentUser.workStyle || [],
                },
                otherUsers: otherUsers.map(u => ({
                    id: u.id,
                    name: u.name,
                    skills: u.skills,
                    workStyle: u.workStyle || [],
                })),
            });
            setMatches(result.matches);
        } catch (error) {
            console.error("Failed to find matches", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRequestToJoin = async (user: UserType) => {
        if (!currentUser || !selectedHackathonId) return;

        const team = teams.find(t => t.creatorId === user.id && t.hackathonId === selectedHackathonId);
        if (!team) {
            alert(`${user.name} has not created a team yet. You can only request to join team leaders.`);
            return;
        }

        setIsJoining(user.id);
        try {
            await api.requestToJoinTeamById(selectedHackathonId, team.id, currentUser);
        } finally {
            setIsJoining(null);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <Button onClick={handleFindMatches} disabled={isLoading || !currentUser}>
                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/>Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4"/>Find My Perfect Teammates</>}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Let AI find the best collaborators for you based on skills and work style.</p>
            </div>
             {matches.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map(({ user, compatibilityScore, reasoning }) => {
                        const fullUser = users.find(u => u.id === user.id);
                        if (!fullUser) return null;
                        
                        return (
                             <Card key={user.id} className="group relative flex flex-col transition-all duration-300 transform-gpu animate-card-in">
                                <div className="flex flex-col flex-grow">
                                    <CardHeader>
                                        <CardTitle className="font-headline flex justify-between items-start">{fullUser.name}
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Star className="h-3 w-3 text-yellow-400" /> {(compatibilityScore * 100).toFixed(0)}% Match
                                            </Badge>
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-1 pt-2">
                                            {fullUser.skills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                                        </div>
                                         <div className="flex flex-wrap gap-1 pt-1">
                                            {fullUser.workStyle?.map(s => <Badge key={s}>{s}</Badge>)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground italic">"{reasoning}"</p>
                                    </CardContent>
                                    <CardFooter>
                                         <Button onClick={() => handleRequestToJoin(fullUser)} disabled={!currentUser || !!isJoining}>
                                            {isJoining === fullUser.id ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Sending...</> : 'Request to Join'}
                                        </Button>
                                    </CardFooter>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}


export default function TeamFinder() {
    const { state, api } = useHackathon();
    const { teams, hackathons, selectedHackathonId, currentUser } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState<string | null>(null);

    const { filteredTeams, currentHackathon, myTeamId, myPendingRequests } = useMemo(() => {
        const currentHackathon = hackathons.find(h => h.id === selectedHackathonId);
        if (!selectedHackathonId || !currentHackathon) {
            return { filteredTeams: [], currentHackathon: null, myTeamId: null, myPendingRequests: [] };
        }

        let currentTeams = teams.filter(t => t.hackathonId === selectedHackathonId);
        if (searchQuery) {
            currentTeams = currentTeams.filter(team =>
                team.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        const myTeam = teams.find(t => t.hackathonId === selectedHackathonId && t.members.some(m => m.id === currentUser?.id));
        
        const pendingRequests = teams
            .filter(t => t.hackathonId === selectedHackathonId && t.joinRequests?.some(req => req.id === currentUser?.id))
            .map(t => t.id);

        return { filteredTeams: currentTeams, currentHackathon, myTeamId: myTeam?.id, myPendingRequests: pendingRequests };
    }, [teams, hackathons, selectedHackathonId, searchQuery, currentUser]);


    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Users className="w-full h-full" />} title="Team Finder" description="Find a team or recruit new members." />;
    }

    const handleJoinByCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && selectedHackathonId) {
            setIsJoining('code');
            try {
                await api.requestToJoinTeamByCode(selectedHackathonId, joinCode, currentUser);
                setJoinCode('');
            } finally {
                setIsJoining(null);
            }
        } else {
            alert("You must be logged in and have a hackathon selected to join a team.");
        }
    };
    
    const handleRequestToJoin = async (team: Team) => {
        if (currentUser && selectedHackathonId) {
             setIsJoining(team.id);
            try {
                await api.requestToJoinTeamById(selectedHackathonId, team.id, currentUser);
            } finally {
                setIsJoining(null);
            }
        }
    };
    
    if (!selectedHackathonId || !currentHackathon) {
        return (
            <div className="py-12 animate-slide-in-up">
                 <HackathonSelector />
            </div>
        )
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-2 font-headline">Team Finder</h1>
            <p className="text-center text-muted-foreground mb-8">Showing teams for {currentHackathon?.name}</p>
            <AuthMessage />

            <Tabs defaultValue="finder" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="finder"><Search className="mr-2 h-4 w-4"/>Team Browser</TabsTrigger>
                    <TabsTrigger value="wizard"><Sparkles className="mr-2 h-4 w-4"/>AI Matchmaker</TabsTrigger>
                </TabsList>
                <TabsContent value="finder" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="font-headline">Join a Team by Code</CardTitle>
                                <CardDescription>Enter a team's code to send a join request.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleJoinByCode} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input 
                                            placeholder="Enter 6-digit join code" 
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                            disabled={!!isJoining || !currentUser}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={!!isJoining || !currentUser || !joinCode}>
                                        {isJoining === 'code' ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Sending Request...</> : 'Send Request to Join'}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTeams.map(team => {
                                const isFull = team.members.length >= (currentHackathon?.teamSizeLimit || 4);
                                const isMyTeam = team.id === myTeamId;
                                const hasPendingRequest = myPendingRequests.includes(team.id);
                                const canJoin = !isFull && !isMyTeam && !hasPendingRequest && !!currentUser;
                                
                                return (
                                    <Card key={team.id} className="group relative flex flex-col transition-all duration-300 transform-gpu animate-card-in">
                                        <div className="flex flex-col flex-grow">
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
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                                            <Button 
                                                variant="secondary"
                                                onClick={() => handleRequestToJoin(team)}
                                                disabled={!canJoin || !!isJoining}
                                            >
                                                {isJoining === team.id && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
                                                {isMyTeam ? 'You are in this team' : 
                                                hasPendingRequest ? 'Request Sent' : 
                                                isFull ? 'Team Full' :
                                                !currentUser ? 'Login to Join' : 
                                                'Request to Join'}
                                            </Button>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <p className="text-muted-foreground">{searchQuery ? 'No teams match your search.' : 'No teams have been created yet for this hackathon. Be the first!'}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                 <TabsContent value="wizard" className="mt-6">
                    <AIWizard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
