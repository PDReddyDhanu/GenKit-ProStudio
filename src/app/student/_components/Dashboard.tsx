
"use client";

import { useHackathon } from '@/context/HackathonProvider';
import TeamManagement from './TeamManagement';
import ProjectSubmission from './ProjectSubmission';
import ProjectView from './ProjectView';
import { AuthMessage } from '@/components/AuthMessage';
import { useMemo, useState } from 'react';
import type { Hackathon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Countdown } from './Countdown';
import TeamHub from './TeamHub';
import StudentHomeDashboard from './StudentHomeDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CompleteProfilePrompt from './CompleteProfilePrompt';

const staticEventDetails: { [key: string]: Partial<Hackathon> } = {
    'real-time-project': { name: 'Real-Time Project', rules: 'Standard rules apply. Focus on live data processing and interaction.' },
    'mini-project': { name: 'Mini Project', rules: 'Standard rules apply. Scope should be manageable for a shorter timeframe.' },
    'major-project': { name: 'Major Project', rules: 'Standard rules apply. This is a comprehensive project, documentation is key.' },
    'other-project': { name: 'Other Project', rules: 'Standard rules apply. Present your unique and innovative ideas.' },
};


function EventHeader({ event }: { event: Partial<Hackathon> }) {
     if (!event.name) return null;
    const deadline = new Date('2099-12-31').getTime();

    return (
        <div className="mb-8 p-6 bg-card border rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold font-headline text-primary">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-muted-foreground">
                <p><strong>Prize/Award:</strong> College Grade / Recognition</p>
                <Countdown deadline={deadline} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { state, dispatch } = useHackathon();
    const { currentUser, teams, projects, selectedHackathonId } = state;
    const [forceTeamView, setForceTeamView] = useState(false);

    const handleEventChange = (hackathonId: string) => {
        setForceTeamView(false);
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId === 'default' ? null : hackathonId });
    }

    const currentEvent = useMemo(() => {
        if (!selectedHackathonId) return null;
        return staticEventDetails[selectedHackathonId] || { name: selectedHackathonId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
    }, [selectedHackathonId]);

    const currentTeam = useMemo(() => {
        if (!currentUser?.id || !selectedHackathonId) return undefined;
        return teams.find(t => 
            t.hackathonId === selectedHackathonId && 
            t.members.some(m => m.id === currentUser.id)
        );
    }, [teams, currentUser, selectedHackathonId]);

    const currentSubmission = useMemo(() => {
        if (!currentTeam?.id || !selectedHackathonId) return undefined;
        return projects.find(p => p.teamId === currentTeam.id && p.hackathonId === selectedHackathonId);
    }, [projects, currentTeam, selectedHackathonId]);
    
    const isProfileComplete = useMemo(() => {
        if (!currentUser) return false;
        const hasSkills = currentUser.skills && currentUser.skills.length > 0;
        const hasWorkStyle = currentUser.workStyle && currentUser.workStyle.length > 0;
        const hasRollNo = !!currentUser.rollNo;
        return hasSkills && hasWorkStyle && hasRollNo;
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

        if (!currentTeam || forceTeamView) {
            return (
                <>
                    <EventHeader event={currentEvent} />
                    <TeamManagement onTeamCreated={() => setForceTeamView(false)} />
                </>
            );
        }
        return (
            <>
                <EventHeader event={currentEvent} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <main className="lg:col-span-2">
                        {currentSubmission ? (
                            <ProjectView submission={currentSubmission} onBack={() => setForceTeamView(true)} />
                        ) : (
                            <ProjectSubmission team={currentTeam} onBack={() => setForceTeamView(true)} />
                        )}
                    </main>
                    <aside className="lg:col-span-1 space-y-8">
                        <TeamHub team={currentTeam} />
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Rules & Regulations</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{currentEvent.rules || "Standard project submission rules apply."}</p>
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
                         <SelectItem value="default">Back to Project Selection</SelectItem>
                        {Object.entries(staticEventDetails).map(([id, { name }]) => (
                            <SelectItem key={id} value={id}>{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {renderContent()}
        </div>
    );
}

