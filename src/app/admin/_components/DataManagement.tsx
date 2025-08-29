
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
import { AlertTriangle, Trash2, Loader } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function DataManagement() {
    const { state, api } = useHackathon();
    const { users, teams, projects, selectedHackathonId } = state;
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        // This functionality needs to be re-scoped for multi-hackathon environment.
        // For now, it's disabled to prevent accidental deletion of all hackathons.
        alert("This feature is currently being updated for the new multi-hackathon system.");
        
        // setIsResetting(true);
        // try {
        //     await api.resetHackathon();
        // } finally {
        //     setIsResetting(false);
        // }
    };

    const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    }
    
    const hackathonTeams = teams.filter(t => t.hackathonId === selectedHackathonId);
    const hackathonProjects = projects.filter(p => p.hackathonId === selectedHackathonId);


    return (
        <div className="space-y-8">
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

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Teams for Current Hackathon ({hackathonTeams.length})</CardTitle>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Members</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hackathonTeams.map(team => (
                                    <TableRow key={team.id}>
                                        <TableCell className="font-medium">{team.name}</TableCell>
                                        <TableCell>{team.members.map(m => m.name).join(', ')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Projects for Current Hackathon ({hackathonProjects.length})</CardTitle>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>GitHub</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hackathonProjects.map(project => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                        <TableCell>{project.description}</TableCell>
                                        <TableCell>
                                            <Link href={project.githubUrl} target="_blank" className="text-accent hover:underline">
                                                View Repo
                                            </Link>
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
