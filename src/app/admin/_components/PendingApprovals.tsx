

"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User } from '@/lib/types';
import { X, Bell, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PendingApprovalsProps {
    users: User[];
}

export default function PendingApprovals({ users }: PendingApprovalsProps) {
    const { api } = useHackathon();

    const handleApproveStudent = async (userId: string) => {
        await api.approveStudent(userId);
    }
     const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    }
    
    const { urgent, regular } = useMemo(() => {
        const urgentUsers = users.filter(u => u.approvalReminderSentAt);
        const regularUsers = users.filter(u => !u.approvalReminderSentAt);
        return { urgent: urgentUsers, regular: regularUsers };
    }, [users]);


    const UserRow = ({ user }: { user: User }) => (
        <div className="p-3 bg-muted/50 rounded-md flex justify-between items-center">
            <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
                 {user.approvalReminderSentAt && (
                    <TooltipProvider>
                         <Tooltip>
                            <TooltipTrigger>
                                <Bell className="h-5 w-5 text-yellow-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Student sent a reminder for approval.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <Button size="sm" onClick={() => handleApproveStudent(user.id)}>Approve</Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveStudent(user.id)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Pending Student Approvals ({users.length})</CardTitle>
                <CardDescription>Review and approve new student registrations.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                         {urgent.length > 0 && (
                            <div className="space-y-2 p-3 border-2 border-yellow-500/50 rounded-lg bg-yellow-500/10">
                                <h3 className="font-bold text-yellow-400 flex items-center gap-2 text-lg">
                                   <AlertTriangle /> Urgent Approvals ({urgent.length})
                                </h3>
                                {urgent.map(user => <UserRow key={user.id} user={user} />)}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            {regular.length > 0 ? regular.map(user => (
                                <UserRow key={user.id} user={user} />
                            )) : null}
                        </div>

                        {users.length === 0 && <p className="text-muted-foreground text-center pt-8">No pending student approvals.</p>}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
