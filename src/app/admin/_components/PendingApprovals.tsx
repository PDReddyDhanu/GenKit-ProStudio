
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User } from '@/lib/types';
import { X } from 'lucide-react';

interface PendingApprovalsProps {
    users: User[];
}

export default function PendingApprovals({ users }: PendingApprovalsProps) {
    const { dispatch } = useHackathon();

    const handleApproveStudent = (userId: string) => {
        dispatch({ type: 'APPROVE_STUDENT', payload: { userId } });
    }
     const handleRemoveStudent = (userId: string) => {
        dispatch({ type: 'REMOVE_STUDENT', payload: { userId } });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Pending Student Approvals ({users.length})</CardTitle>
                <CardDescription>Review and approve new student registrations.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64 pr-4">
                    <div className="space-y-2">
                        {users.length > 0 ? users.map(user => (
                            <div key={user.id} className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
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
                        )) : <p className="text-muted-foreground text-center pt-8">No pending student approvals.</p>}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
