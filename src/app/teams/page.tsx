"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageIntro from '@/components/PageIntro';

export default function TeamFinder() {
    const { state, dispatch } = useHackathon();
    const { teams, currentUser } = state;
    const { toast } = useToast();
    const [joinCode, setJoinCode] = useState('');
    const [showIntro, setShowIntro] = useState(true);

    const handleJoinTeam = (e: React.FormEvent, code: string) => {
        e.preventDefault();
        if (currentUser && !currentUser.teamId) {
            dispatch({ type: 'JOIN_TEAM', payload: { joinCode: code } });
        } else if (currentUser?.teamId) {
            toast({
                title: 'Already in a team',
                description: "You can't join another team.",
                variant: 'destructive'
            });
        } else {
             toast({
                title: 'Please log in',
                description: "You need to be logged in as a student to join a team.",
                variant: 'destructive'
            });
        }
    };

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Users className="w-full h-full" />} title="Team Finder" description="Find a team or recruit new members." />;
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-12 font-headline">Team Finder</h1>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Join a Team by Code</CardTitle>
                    <CardDescription>Already have a team code? Enter it here to join instantly.</CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={(e) => handleJoinTeam(e, joinCode)} className="flex items-center gap-4">
                        <Label htmlFor="joinCode" className="sr-only">Join Code</Label>
                        <Input 
                            id="joinCode" 
                            placeholder="Enter 6-digit join code" 
                            value={joinCode} 
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="max-w-xs"
                        />
                        <Button type="submit">Join Team</Button>
                    </form>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-6">Teams Looking for Members</h2>
            {teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [perspective:1000px]">
                    {teams.map(team => (
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
                                <Button className="w-full" onClick={(e) => handleJoinTeam(e, team.joinCode)}>
                                    Join "{team.name}"
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-muted-foreground">No teams have been created yet. Be the first!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
