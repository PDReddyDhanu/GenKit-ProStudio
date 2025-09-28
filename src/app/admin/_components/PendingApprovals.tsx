


"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User, Faculty } from '@/lib/types';
import { X, Bell, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PendingApprovalsProps {
    users: User[];
    faculty: Faculty[];
}

export default function PendingApprovals({ users, faculty }: PendingApprovalsProps) {
    const { api } = useHackathon();

    const handleApproveStudent = async (userId: string) => {
        await api.approveStudent(userId);
    }
    const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    }
    
    const handleApproveFaculty = async (facultyId: string) => {
        await api.approveFaculty(facultyId);
    }
    const handleRemoveFaculty = async (facultyId: string) => {
        await api.removeFaculty(facultyId);
    }
    
    const regularUsers = useMemo(() => {
        return users.filter(u => !u.approvalReminderSentAt);
    }, [users]);

    const StudentRow = ({ user }: { user: User }) => (
        <div className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
            <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleApproveStudent(user.id)}>Approve</Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveStudent(user.id)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
    
     const FacultyRow = ({ member }: { member: Faculty }) => (
        <div className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
            <div>
                <p className="font-semibold">{member.name} <Badge variant="secondary">{member.role}</Badge></p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleApproveFaculty(member.id)}>Approve</Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveFaculty(member.id)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Pending Student Approvals ({regularUsers.length})</CardTitle>
                    <CardDescription>Review and approve new student registrations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-4">
                            {regularUsers.length > 0 ? regularUsers.map(user => (
                                <StudentRow key={user.id} user={user} />
                            )) : <p className="text-muted-foreground text-center pt-8">No pending student approvals.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Pending Faculty Approvals ({faculty.length})</CardTitle>
                    <CardDescription>Review and approve new faculty registrations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-4">
                            {faculty.length > 0 ? faculty.map(fac => (
                                <FacultyRow key={fac.id} member={fac} />
                            )) : <p className="text-muted-foreground text-center pt-8">No pending faculty approvals.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
