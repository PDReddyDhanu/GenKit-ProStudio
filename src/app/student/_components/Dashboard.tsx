
"use client";

import { useHackathon } from '@/context/HackathonProvider';
import TeamManagement from './TeamManagement';
import ProjectSubmission from './ProjectSubmission';
import ProjectView from './ProjectView';
import { AuthMessage } from '@/components/AuthMessage';
import { useMemo } from 'react';

export default function Dashboard() {
    const { state } = useHackathon();
    const { currentUser, teams, projects } = state;

    const currentTeam = useMemo(() => {
        return teams.find(t => t.id === currentUser?.teamId);
    }, [teams, currentUser]);

    const currentProject = useMemo(() => {
        if (!currentTeam) return undefined;
        return projects.find(p => p.teamId === currentTeam.id);
    }, [projects, currentTeam]);

    return (
        <div className="py-12 animate-slide-in-up">
            <AuthMessage />
            {!currentTeam ? (
                <TeamManagement />
            ) : !currentProject ? (
                <ProjectSubmission team={currentTeam} />
            ) : (
                <ProjectView project={currentProject} team={currentTeam} />
            )}
        </div>
    );
}
