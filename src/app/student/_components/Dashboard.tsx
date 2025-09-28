
"use client";

import { useHackathon } from '@/context/HackathonProvider';
import TeamManagement from './TeamManagement';
import ProjectSubmission from './ProjectSubmission';
import ProjectView from './ProjectView';
import { AuthMessage } from '@/components/AuthMessage';
import { useMemo } from 'react';
import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Countdown } from './Countdown';
import TeamHub from './TeamHub';
import StudentHomeDashboard from './StudentHomeDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompleteProfilePrompt from './CompleteProfilePrompt';


function EventHeader({ event }: { event: Hackathon }) {
    return (
        <div className="mb-8 p-6 bg-card border rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold font-headline text-primary">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-muted-foreground">
                <p><strong>Prize/Award:</strong> {event.prizeMoney}</p>
                <Countdown deadline={event.deadline} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { state, dispatch } = useHackathon();
    const { currentUser, teams, projects, selectedHackathonId, hackathons } = state;

    const handleEventChange = (hackathonId: string) => {
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId === 'default' ? null : hackathonId });
    }

    const currentEvent = useMemo(() => {
        return hackathons.find(h => h.id === selectedHackathonId);
    }, [hackathons, selectedHackathonId]);

    const currentTeam = useMemo(() => {
        if (!currentUser?.id || !selectedHackathonId) return undefined;
        return teams.find(t => 
            t.hackathonId === selectedHackathonId && 
            t.members.some(m => m.id === currentUser.id)
        );
    }, [teams, currentUser, selectedHackathonId]);

    const currentProject = useMemo(() => {
        if (!currentTeam?.id || !selectedHackathonId) return undefined;
        return projects.find(p => p.teamId === currentTeam.id && p.hackathonId === selectedHackathonId);
    }, [projects, currentTeam, selectedHackathonId]);
    
    const isProfileComplete = useMemo(() => {
        if (!currentUser) return false;
        const hasSkills = currentUser.skills && currentUser.skills.length > 0;
        const hasWorkStyle = currentUser.workStyle && currentUser.workStyle.length > 0;
        return hasSkills && hasWorkStyle;
    }, [currentUser]);

    const renderContent = () => {
        if (!selectedHackathonId || !currentEvent) {
            return <StudentHomeDashboard />;
        }
        
        if (!isProfileComplete) {
            return (
                 <>
                    <EventHeader event={currentEvent} />
                    <CompleteProfilePrompt />
                </>
            )
        }

        if (!currentTeam) {
            return (
                <>
                    <EventHeader event={currentEvent} />
                    <TeamManagement />
                </>
            );
        }
        return (
            <>
                <EventHeader event={currentEvent} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <main className="lg:col-span-2">
                        {currentProject ? (
                            <ProjectView project={currentProject} />
                        ) : (
                            <ProjectSubmission team={currentTeam} />
                        )}
                    </main>
                    <aside className="lg:col-span-1 space-y-8">
                        <TeamHub team={currentTeam} />
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Rules & Regulations</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{currentEvent.rules}</p>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </>
        );
    };

    return (
        <div className="py-6 animate-slide-in-up">
            <AuthMessage />
             <div className="mb-8">
                 <Select onValueChange={handleEventChange} value={selectedHackathonId || "default"}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Select a Project Event" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="default">Default View</SelectItem>
                        {hackathons.map(h => (
                            <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {renderContent()}
        </div>
    );
}
