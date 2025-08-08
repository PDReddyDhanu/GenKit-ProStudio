"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AddJudgeForm from './AddJudgeForm';
import AddStudentForm from './AddStudentForm';
import PendingApprovals from './PendingApprovals';
import UserLists from './UserLists';
import { AuthMessage } from '@/components/AuthMessage';

export default function AdminDashboard() {
    const { state } = useHackathon();
    const { users, judges } = state;

    const { pendingUsers, approvedUsers } = useMemo(() => {
        const pending = users.filter(u => u.status === 'pending');
        const approved = users.filter(u => u.status === 'approved');
        return { pendingUsers: pending, approvedUsers: approved };
    }, [users]);
    
    return (
        <div className="container max-w-7xl mx-auto py-12 animate-slide-in-up">
            <h1 className="text-4xl font-bold mb-8 font-headline">Admin Dashboard</h1>
            <AuthMessage />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <AddJudgeForm />
                    <AddStudentForm />
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <PendingApprovals users={pendingUsers} />
                    <UserLists approvedStudents={approvedUsers} judges={judges} />
                </div>
            </div>
        </div>
    );
}
