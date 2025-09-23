
"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User } from '@/lib/types';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function UrgentApprovalsDashboard() {
    const { state, api } = useHackathon();
    const { users } = state;

    const handleApproveStudent = async (userId: string) => {
        await api.approveStudent(userId);
    }
     const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    }
    
    const urgentUsers = useMemo(() => {
        return users.filter(u => u.status === 'pending' && u.approvalReminderSentAt).sort((a, b) => b.approvalReminderSentAt! - a.approvalReminderSentAt!);
    }, [users]);


    const UserRow = ({ user }: { user: User }) => (
        <div className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
            <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                 {user.approvalReminderSentAt && (
                    <p className="text-xs text-yellow-400 mt-1">
                        Reminder sent {formatDistanceToNow(new Date(user.approvalReminderSentAt), { addSuffix: true })}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleApproveStudent(user.id)}>Approve</Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveStudent(user.id)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <Card className="border-yellow-500 bg-yellow-500/10">
            <CardHeader>
                <CardTitle className="font-headline text-yellow-400 flex items-center gap-2">
                    <AlertTriangle/> Urgent Student Approvals ({urgentUsers.length})
                </CardTitle>
                <CardDescription>These students have sent a reminder and are waiting for approval.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                        {urgentUsers.length > 0 ? (
                            urgentUsers.map(user => <UserRow key={user.id} user={user} />)
                        ) : (
                            <p className="text-muted-foreground text-center pt-16">No urgent approvals at this time.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
