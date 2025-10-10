

"use client";

import React, { useMemo, useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectSubmission, Team, User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, XCircle, Milestone, Download, FileText, Database, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadCsv, generateFullDataCsv, generateScoresCsv, generateTeamsCsv } from '@/lib/csv';
import { Input } from '@/components/ui/input';

const ProjectStatusCard = ({ project, team, users }: { project: ProjectSubmission, team?: Team, users: User[] }) => {
    
    const getStatusInfo = (project: ProjectSubmission) => {
        if (project.status === 'Rejected') {
            return { text: 'Rejected', icon: <XCircle className="text-red-500" />, color: 'text-red-500' };
        }
        if (project.reviewStage === 'Completed') {
            return { text: 'Completed', icon: <CheckCircle className="text-green-500" />, color: 'text-green-500' };
        }
        if (project.status === 'Approved') {
            return { text: `In Review: ${project.reviewStage}`, icon: <Clock className="text-yellow-500 animate-pulse" />, color: 'text-yellow-500' };
        }
        return { text: `Pending: ${project.status.replace('Pending', '')}`, icon: <Milestone className="text-blue-500" />, color: 'text-blue-500' };
    }

    const statusInfo = getStatusInfo(project);

    const handleDownloadScores = () => {
        if (!team) return;
        const csv = generateScoresCsv([project], [team]);
        downloadCsv(csv, `Scores_${team.name.replace(/\s/g, '_')}.csv`);
    }

    const handleDownloadFullData = () => {
        if (!team) return;
        const csv = generateFullDataCsv([project], [team], users);
        downloadCsv(csv, `FullData_${team.name.replace(/\s/g, '_')}.csv`);
    }
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-lg">{project.projectIdeas[0]?.title || 'Untitled Project'}</CardTitle>
                        <CardDescription>Team: {team?.name || 'Unknown'}</CardDescription>
                    </div>
                    <div className={`flex items-center gap-2 font-bold ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.projectIdeas[0]?.description}</p>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleDownloadScores} variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" /> Download Team Scores
                    </Button>
                    <Button onClick={handleDownloadFullData} variant="outline" size="sm">
                        <Database className="mr-2 h-4 w-4" /> Download Full Data
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ProjectInfoDashboard() {
    const { state } = useHackathon();
    const { projects, teams, users, selectedHackathonId, hackathons } = state;
    const [searchQuery, setSearchQuery] = useState('');

    const eventProjects = useMemo(() => {
        if (!selectedHackathonId) return [];
        let filteredProjects = projects.filter(p => p.hackathonId === selectedHackathonId)
            .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filteredProjects = filteredProjects.filter(p => {
                const team = teams.find(t => t.id === p.teamId);
                return team?.name.toLowerCase().includes(lowercasedQuery);
            });
        }
        
        return filteredProjects;
    }, [projects, teams, selectedHackathonId, searchQuery]);
    
    const eventTeams = useMemo(() => {
        const teamIds = new Set(eventProjects.map(p => p.teamId));
        return teams.filter(t => teamIds.has(t.id));
    }, [eventProjects, teams]);

    const handleExportCompletedProjects = () => {
        const currentEvent = hackathons.find(h => h.id === selectedHackathonId);
        const completedProjects = eventProjects.filter(p => p.reviewStage === 'Completed');
        const completedTeamIds = new Set(completedProjects.map(p => p.teamId));
        const completedTeams = eventTeams.filter(t => completedTeamIds.has(t.id));

        const teamsCsv = generateTeamsCsv(completedTeams, users);
        const projectsCsv = generateFullDataCsv(completedProjects, completedTeams, users);

        const eventName = currentEvent?.name.replace(/\s/g, '_') || 'Event';
        
        downloadCsv(teamsCsv, `${eventName}_Completed_Teams_Info.csv`);
        downloadCsv(projectsCsv, `${eventName}_Completed_Projects_Scores.csv`);
    };

    const totalSubmissions = eventProjects.length;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Project Information & Reporting</CardTitle>
                    <CardDescription>
                        An overview of all submitted projects for the selected event.
                        Found {totalSubmissions} submission(s).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by team name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                     <Card className="bg-muted/50 border-primary">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Master Completed Project Export</CardTitle>
                            <CardDescription>Downloads all data for completed projects within the selected event and filters.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleExportCompletedProjects} disabled={eventProjects.filter(p=>p.reviewStage === 'Completed').length === 0}>
                                <Download className="mr-2 h-4 w-4"/> Export All Completed Data
                            </Button>
                             <p className="text-xs text-muted-foreground mt-2">This will generate two CSV files: one for team information and one for project/scoring details.</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <ScrollArea className="h-[calc(100vh-25rem)] pr-4">
                <div className="space-y-4">
                    {eventProjects.length > 0 ? (
                        eventProjects.map(project => {
                            const team = teams.find(t => t.id === project.teamId);
                            return <ProjectStatusCard key={project.id} project={project} team={team} users={users} />;
                        })
                    ) : (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                No projects have been submitted for this event yet, or none match your search.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
