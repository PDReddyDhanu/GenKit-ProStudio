
"use client";

import React, { useState } from 'react';
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
    const [isResetting, setIsResetting] = useState(false);

    const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    }
    
    const currentHackathon = hackathons.find(h => h.id === selectedHackathonId);
    const hackathonParticipants = users.filter(u => u.hackathonId === selectedHackathonId);
    const hackathonTeams = teams.filter(t => t.hackathonId === selectedHackathonId);
    const hackathonProjects = projects.filter(p => p.hackathonId === selectedHackathonId);

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
        const data = hackathonProjects.map(p => {
            const team = hackathonTeams.find(t => t.id === p.teamId);
            const teamMembers = team?.members.map(m => m.name).join('; ') || '';
            return [
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.description.replace(/"/g, '""')}"`,
                p.githubUrl,
                `"${team?.name.replace(/"/g, '""') || 'N/A'}"`,
                `"${teamMembers.replace(/"/g, '""')}"`,
                p.averageScore.toFixed(2)
            ];
        });

        const csvString = createCsv(headers, data);
        downloadCsv(csvString, `${currentHackathon?.name}_Submissions.csv`);
    };

    const handleExportParticipants = () => {
        const headers = ["Name", "Email"];
        const data = hackathonParticipants.map(u => [u.name, u.email]);
        const csvString = createCsv(headers, data);
        downloadCsv(csvString, `${currentHackathon?.name}_Participants.csv`);
    };


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Hackathon Participants ({hackathonParticipants.length})</CardTitle>
                        <CardDescription>Students registered for "{currentHackathon?.name || 'the selected hackathon'}"</CardDescription>
                    </div>
                     {currentHackathon && (
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={handleExportSubmissions} disabled={hackathonProjects.length === 0}>
                                <Download className="mr-2 h-4 w-4"/> Export Submissions
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportParticipants} disabled={hackathonParticipants.length === 0}>
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
                                {hackathonParticipants.length > 0 ? hackathonParticipants.map(user => {
                                    const team = hackathonTeams.find(t => t.id === user.teamId);
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{team?.name || 'No Team'}</TableCell>
                                        </TableRow>
                                    )
                                }) : <TableRow><TableCell colSpan={3} className="text-center">No participants for this hackathon yet.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">All Students ({users.length})</CardTitle>
                    <CardDescription>View and manage all registered students for this college.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="destructive" size="sm" onClick={() => handleRemoveStudent(user.id)}>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
