"use client";

import { useHackathon } from '@/context/HackathonProvider';
import TeamManagement from './TeamManagement';
import ProjectSubmission from './ProjectSubmission';
import ProjectView from './ProjectView';
import { AuthMessage } from '@/components/AuthMessage';
import { useMemo } from 'react';
import HackathonSelector from './HackathonSelector';
import type { Team, Project } from '@/lib/types';

export default function Dashboard() {
    const { state } = useHackathon();
    const { currentUser, teams, projects, selectedHackathonId } = state;

    const currentTeam = useMemo(() => {
        if (!currentUser?.teamId || !selectedHackathonId) return undefined;
        // Search all teams for the current user's team ID, ensuring it matches the selected hackathon.
        return teams.find(t => t.id === currentUser.teamId && t.hackathonId === selectedHackathonId);
    }, [teams, currentUser, selectedHackathonId]);

    const currentProject = useMemo(() => {
        if (!currentTeam?.id || !selectedHackathonId) return undefined;
        return projects.find(p => p.teamId === currentTeam.id && p.hackathonId === selectedHackathonId);
    }, [projects, currentTeam, selectedHackathonId]);


    return (
        <div className="py-12 animate-slide-in-up">
            <AuthMessage />
            {!selectedHackathonId ? (
                <HackathonSelector />
            ) : !currentTeam ? (
                <TeamManagement />
            ) : !currentProject ? (
                <ProjectSubmission team={currentTeam} />
            ) : (
                <ProjectView project={currentProject} team={currentTeam} />
            )}
        </div>
    );
}
