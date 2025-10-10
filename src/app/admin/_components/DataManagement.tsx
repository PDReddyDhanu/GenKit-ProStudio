
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
import { DEPARTMENTS_DATA } from '@/lib/constants';
import { generateScoresCsv, generateFullDataCsv, downloadCsv } from '@/lib/csv';

export default function DataManagement() {
    const { state, api } = useHackathon();
    const { users, teams, projects, selectedHackathonId, hackathons, selectedBatch, selectedDepartment, selectedBranch } = state;
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const currentEvent = useMemo(() => hackathons.find(h => h.id === selectedHackathonId), [hackathons, selectedHackathonId]);

    const { eventParticipants, eventTeams, eventProjects } = useMemo(() => {
        if (!selectedHackathonId) {
            return { eventParticipants: [], eventTeams: [], eventProjects: [] };
        }

        const teamsForEvent = teams.filter(t => t.hackathonId === selectedHackathonId);
        const teamIdsForEvent = new Set(teamsForEvent.map(t => t.id));
        const projectsForEvent = projects.filter(p => teamIdsForEvent.has(p.teamId));
        
        let filteredUsers = users;

        if (selectedBatch && selectedBatch !== 'all') {
            const [startYear, endYear] = selectedBatch.split('-').map(Number);
            filteredUsers = filteredUsers.filter(u => 
                u.admissionYear && u.passoutYear &&
                parseInt(u.admissionYear) === startYear &&
                parseInt(u.passoutYear) === endYear
            );
        }

        if (selectedDepartment && selectedDepartment !== 'all') {
            const departmentBranches = DEPARTMENTS_DATA[selectedDepartment as keyof typeof DEPARTMENTS_DATA]?.map(b => b.id) || [];
            filteredUsers = filteredUsers.filter(u => departmentBranches.includes(u.branch));
        }

        if (selectedBranch && selectedBranch !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.branch === selectedBranch);
        }

        const filteredUserIds = new Set(filteredUsers.map(u => u.id));
        
        const participantsInEvent = teamsForEvent.flatMap(t => t.members.map(m => users.find(u => u.id === m.id)).filter(Boolean));

        const uniqueParticipants = Array.from(new Map(participantsInEvent.map(p => [p!.id, p!])).values());
        
        const filteredParticipants = uniqueParticipants.filter(p => filteredUserIds.has(p.id));

        return { eventParticipants: filteredParticipants, eventTeams: teamsForEvent, eventProjects: projectsForEvent };
    }, [users, teams, projects, selectedHackathonId, selectedBatch, selectedDepartment, selectedBranch]);


    const handleExportStudents = () => {
        const headers = ["Name", "Email", "Roll No", "Branch", "Department", "Section", "Admission Year", "Passout Year"];
        const data = eventParticipants.map(u => [
            u.name, 
            u.email, 
            u.rollNo || 'N/A', 
            DEPARTMENTS_DATA[u.department as keyof typeof DEPARTMENTS_DATA]?.find(b => b.id === u.branch)?.name || u.branch || 'N/A',
            u.department || 'N/A', 
            u.section || 'N/A',
            u.admissionYear || 'N/A',
            u.passoutYear || 'N/A'
        ].map(item => `"${String(item).replace(/"/g, '""')}"`));

        const csvString = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
        const eventName = currentEvent?.name.replace(/\s/g, '_') || 'Event';
        const batchName = selectedBatch || 'AllBatches';
        const deptName = !selectedDepartment || selectedDepartment === 'all' ? 'AllDepts' : selectedDepartment.replace(/\s/g, '_');
        downloadCsv(csvString, `${eventName}_${batchName}_${deptName}_Students.csv`);
    };

    const handleExportScores = () => {
        const csvString = generateScoresCsv(eventProjects, eventTeams);
        const eventName = currentEvent?.name.replace(/\s/g, '_') || 'Event';
        downloadCsv(csvString, `${eventName}_All_Scores.csv`);
    }

    const handleExportAllData = () => {
        const csvString = generateFullDataCsv(eventProjects, eventTeams, users);
        const eventName = currentEvent?.name.replace(/\s/g, '_') || 'Event';
        downloadCsv(csvString, `${eventName}_Full_Export.csv`);
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

    const departmentDisplay = selectedDepartment === 'all' || !selectedDepartment ? 'All Departments' : selectedDepartment;
    const batchDisplay = selectedBatch || 'All Batches';

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline">Data Export & Management</CardTitle>
                        <CardDescription>Export detailed lists based on the selected project type, batch, and department.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Filtered Data Export</CardTitle>
                            <CardDescription>Export data based on the currently selected filters.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={handleExportStudents} disabled={eventParticipants.length === 0}>
                                <Download className="mr-2 h-4 w-4"/> Export Students ({eventParticipants.length})
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportScores} disabled={eventProjects.length === 0 || !currentEvent}>
                                <Download className="mr-2 h-4 w-4"/> Export Project Scores
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportAllData} disabled={eventProjects.length === 0 || !currentEvent}>
                                <Download className="mr-2 h-4 w-4"/> Export Full Project Data
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Participant Overview</CardTitle>
                            <CardDescription>
                                Students from "{batchDisplay}" in "{departmentDisplay}"
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-72">
                                    <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Team (for current event)</TableHead>
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
                                        }) : <TableRow><TableCell colSpan={3} className="text-center">No participants match the current filters.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
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
                            <h4 className="font-bold">Reset Current Project Type Data</h4>
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
                                    <AlertDialogAction onClick={handleResetCurrentEvent} className="bg-destructive hover:bg-destructive/80">Yes, reset data</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                        <div className="flex flex-wrap gap-4 justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h4 className="font-bold">Reset All Project Events</h4>
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

    
