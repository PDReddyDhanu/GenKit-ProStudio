
"use client";

import { useHackathon } from '@/context/HackathonProvider';
import TeamManagement from './TeamManagement';
import ProjectSubmission from './ProjectSubmission';
import ProjectView from './ProjectView';
import { AuthMessage } from '@/components/AuthMessage';
import { useMemo } from 'react';
import HackathonSelector from './HackathonSelector';
import type { Team, Project, Hackathon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Countdown } from './Countdown';
import TeamHub from './TeamHub';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvitationsManagement from './InvitationsManagement';


function HackathonHeader({ hackathon }: { hackathon: Hackathon }) {
    return (
        <div className="mb-8 p-6 bg-card border rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold font-headline text-primary">{hackathon.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-muted-foreground">
                <p><strong>Prize:</strong> {hackathon.prizeMoney}</p>
                <Countdown deadline={hackathon.deadline} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { state } = useHackathon();
    const { currentUser, teams, projects, selectedHackathonId, hackathons } = state;

    const currentHackathon = useMemo(() => {
        return hackathons.find(h => h.id === selectedHackathonId);
    }, [hackathons, selectedHackathonId]);

    const userTeams = useMemo(() => {
        if (!currentUser || !selectedHackathonId) return [];
        return teams.filter(t => t.creatorId === currentUser.id && t.hackathonId === selectedHackathonId);
    }, [teams, currentUser, selectedHackathonId]);

    const currentTeam = useMemo(() => {
        if (!currentUser?.teamId || !selectedHackathonId) return undefined;
        return teams.find(t => t.id === currentUser.teamId && t.hackathonId === selectedHackathonId);
    }, [teams, currentUser, selectedHackathonId]);

    const currentProject = useMemo(() => {
        if (!currentTeam?.id || !selectedHackathonId) return undefined;
        return projects.find(p => p.teamId === currentTeam.id && p.hackathonId === selectedHackathonId);
    }, [projects, currentTeam, selectedHackathonId]);


    if (!selectedHackathonId || !currentHackathon) {
        return (
             <div className="py-12 animate-slide-in-up">
                <AuthMessage />
                <HackathonSelector />
            </div>
        )
    }

    if (!currentTeam) {
        return (
            <div className="py-12 animate-slide-in-up">
                <AuthMessage />
                <HackathonHeader hackathon={currentHackathon} />
                <Tabs defaultValue="join" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="join">Create/Join Team</TabsTrigger>
                        <TabsTrigger value="invitations">
                            Manage Invitations
                            {userTeams.some(t => t.joinRequests && t.joinRequests.length > 0) && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="join" className="mt-6">
                        <TeamManagement />
                    </TabsContent>
                    <TabsContent value="invitations" className="mt-6">
                        <InvitationsManagement teams={userTeams} />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    return (
        <div className="py-12 animate-slide-in-up">
            <AuthMessage />
            <HackathonHeader hackathon={currentHackathon} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <main className="lg:col-span-2">
                    {!currentProject ? (
                        <ProjectSubmission team={currentTeam} />
                    ) : (
                        <ProjectView project={currentProject} team={currentTeam} />
                    )}
                </main>
                <aside className="lg:col-span-1 space-y-8">
                    {currentTeam ? (
                        <TeamHub team={currentTeam} />
                    ) : (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Join a Team</CardTitle>
                                <CardDescription>Create or join a team to get started.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Once you are on a team, you can collaborate with your members here.</p>
                            </CardContent>
                        </Card>
                    )}
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Rules & Regulations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{currentHackathon.rules}</p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
