
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

    const currentHackathonTeams = useMemo(() => {
        if (!selectedHackathonId) return [];
        // The teams array from state is already filtered by the provider for the selected hackathon
        return teams;
    }, [teams, selectedHackathonId]);

    const currentHackathonProjects = useMemo(() => {
        if (!selectedHackathonId) return [];
        // The projects array from state is already filtered by the provider for the selected hackathon
        return projects;
    }, [projects, selectedHackathonId]);

    const currentTeam = useMemo(() => {
        if (!currentUser?.teamId) return undefined;
        return currentHackathonTeams.find(t => t.id === currentUser.teamId);
    }, [currentHackathonTeams, currentUser]);
    
    const currentProject = useMemo(() => {
        if (!currentTeam?.id) return undefined;
        return currentHackathonProjects.find(p => p.teamId === currentTeam.id);
    }, [currentHackathonProjects, currentTeam]);


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
