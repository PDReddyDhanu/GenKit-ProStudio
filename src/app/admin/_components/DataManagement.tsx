

"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Loader, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function DataManagement() {
    const { state, api } = useHackathon();
    const { users, teams, projects, selectedHackathonId, hackathons } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    }
    
    const currentEvent = useMemo(() => hackathons.find(h => h.id === selectedHackathonId), [hackathons, selectedHackathonId]);

    const eventTeams = useMemo(() => teams.filter(t => t.hackathonId === selectedHackathonId), [teams, selectedHackathonId]);

    const eventParticipants = useMemo(() => {
        if (!selectedHackathonId) return [];
        const participantIds = new Set(eventTeams.flatMap(t => t.members.map(m => m.id)));
        return users.filter(u => participantIds.has(u.id));
    }, [users, eventTeams, selectedHackathonId]);
    
    const eventProjects = useMemo(() => projects.filter(p => p.hackathonId === selectedHackathonId), [projects, selectedHackathonId]);


    const createCsv = (headers: string[], data: string[][]) => {
        const csvRows = [headers.join(','), ...data.map(row => row.join(','))];
        return csvRows.join('\n');
    }

    const downloadCsv = (csvString: string, filename: string) => {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleExportSubmissions = () => {
        const headers = ["Project Name", "Project Description", "GitHub URL", "Team Name", "Team Members", "Average Score"];
        const data = eventProjects.map(p => {
            const team = eventTeams.find(t => t.id === p.teamId);
            const teamMembers = team?.members.map(m => m.name).join('; ') || '';
            const primaryIdea = p.projectIdeas[0];
            return [
                `"${(primaryIdea?.title || 'N/A').replace(/"/g, '""')}"`,
                `"${(primaryIdea?.description || 'N/A').replace(/"/g, '""')}"`,
                primaryIdea?.githubUrl || 'N/A',
                `"${team?.name.replace(/"/g, '""') || 'N/A'}"`,
                `"${teamMembers.replace(/"/g, '""')}"`,
                p.averageScore.toFixed(2)
            ];
        });

        const csvString = createCsv(headers, data);
        downloadCsv(csvString, `${currentEvent?.name}_Submissions.csv`);
    };

    const handleExportParticipants = () => {
        const headers = ["Name", "Email"];
        const data = eventParticipants.map(u => [u.name, u.email]);
        const csvString = createCsv(headers, data);
        downloadCsv(csvString, `${currentEvent?.name}_Participants.csv`);
    };

    const handleResetCurrentEvent = async () => {
        if (!selectedHackathonId) return;
        setIsLoading('reset-current');
        try {
            await api.resetCurrentHackathon(selectedHackathonId);
        } catch (error) {
            console.error("Failed to reset event data:", error);
        } finally {
            setIsLoading(null);
        }
    }

    const handleResetAllEvents = async () => {
        setIsLoading('reset-all-events');
        try {
            await api.resetAllHackathons();
        } catch (error) {
            console.error("Failed to reset all event data:", error);
        } finally {
            setIsLoading(null);
        }
    }
    
    const handleResetAllUsers = async () => {
        setIsLoading('reset-all-users');
        try {
            await api.resetAllUsers();
        } catch (error) {
            console.error("Failed to reset all users:", error);
        } finally {
            setIsLoading(null);
        }
    }


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Event Participants ({eventParticipants.length})</CardTitle>
                        <CardDescription>Students registered for "{currentEvent?.name || 'the selected event'}"</CardDescription>
                    </div>
                     {currentEvent && (
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={handleExportSubmissions} disabled={eventProjects.length === 0}>
                                <Download className="mr-2 h-4 w-4"/> Export Submissions
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportParticipants} disabled={eventParticipants.length === 0}>
                                <Download className="mr-2 h-4 w-4"/> Export Participants
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Team</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventParticipants.length > 0 ? eventParticipants.map(user => {
                                    const team = eventTeams.find(t => t.members.some(m => m.id === user.id));
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{team?.name || 'No Team'}</TableCell>
                                        </TableRow>
                                    )
                                }) : <TableRow><TableCell colSpan={3} className="text-center">No participants for this event yet.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-3 text-destructive"><AlertTriangle/> Danger Zone</CardTitle>
                    <CardDescription>These are irreversible actions. Please proceed with caution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-wrap gap-4 justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h4 className="font-bold">Reset Current Event Data</h4>
                            <p className="text-sm text-muted-foreground">Deletes all teams, projects, and scores for "{currentEvent?.name || 'N/A'}".</p>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={!selectedHackathonId || !!isLoading}>
                                    {isLoading === 'reset-current' ? <Loader className="animate-spin" /> : <Trash2 />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete all submissions and team data for {currentEvent?.name}. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetCurrentEvent} className="bg-destructive hover:bg-destructive/80">Yes, reset event data</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                     <div className="flex flex-wrap gap-4 justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h4 className="font-bold">Reset All Events</h4>
                            <p className="text-sm text-muted-foreground">Deletes all project events, teams, and projects. Users and faculty will remain.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={!!isLoading}>
                                     {isLoading === 'reset-all-events' ? <Loader className="animate-spin" /> : <Trash2 />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete ALL project events, teams, and project data. User and faculty accounts will NOT be deleted. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetAllEvents} className="bg-destructive hover:bg-destructive/80">Yes, reset all events</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                     <div className="flex flex-wrap gap-4 justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h4 className="font-bold">Reset All Users</h4>
                            <p className="text-sm text-muted-foreground">Deletes all student user accounts from Firestore and Firebase Auth.</p>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={!!isLoading}>
                                    {isLoading === 'reset-all-users' ? <Loader className="animate-spin" /> : <Trash2 />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure? This is highly destructive.</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete ALL student user accounts, including their login credentials from Firebase Authentication. Faculty and project data will remain. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetAllUsers} className="bg-destructive hover:bg-destructive/80">Yes, delete all users</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

