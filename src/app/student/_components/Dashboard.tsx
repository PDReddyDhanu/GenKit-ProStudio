
"use client";

import { useHackathon } from '@/context/HackathonProvider';
import { Team, Project } from '@/lib/types';
import TeamManagement from './TeamManagement';
import ProjectSubmission from './ProjectSubmission';
import ProjectView from './ProjectView';
import { AuthMessage } from '@/components/AuthMessage';

export default function Dashboard() {
    const { state } = useHackathon();
    const { currentUser } = state;
    const { teams, projects } = state.collegeData;

    const currentTeam: Team | undefined = teams.find(t => t.id === currentUser?.teamId);
    const currentProject: Project | undefined = projects.find(p => p.teamId === currentTeam?.id);

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

    