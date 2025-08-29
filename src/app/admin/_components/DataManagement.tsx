
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
    const { users, teams, projects } = state;
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        setIsResetting(true);
        try {
            await api.resetHackathon();
        } finally {
            setIsResetting(false);
        }
    };

    const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><AlertTriangle className="text-destructive"/> Reset Hackathon Data</CardTitle>
                        <CardDescription>This will permanently delete all users, teams, projects, and judges for the selected college. This action cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={!state.selectedCollege || isResetting}>
                                    {isResetting ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Resetting...</> : 'Reset College Data'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is permanent and will delete all hackathon data for <strong>{state.selectedCollege}</strong>, including all user accounts, teams, project submissions, and judging scores.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReset}>Yes, Reset Everything</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">All Students ({users.length})</CardTitle>
                    <CardDescription>View and manage all registered students.</CardDescription>
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
                    <CardTitle className="font-headline">All Teams ({teams.length})</CardTitle>
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
                                {teams.map(team => (
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
                    <CardTitle className="font-headline">All Projects ({projects.length})</CardTitle>
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
                                {projects.map(project => (
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
