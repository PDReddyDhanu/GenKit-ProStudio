
"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import AddFacultyForm from './AddJudgeForm';
import AddStudentForm from './AddStudentForm';
import PendingApprovals from './PendingApprovals';
import UserLists from './UserLists';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import type { User, Faculty } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Building2 } from 'lucide-react';

export default function AdminDashboard() {
    const { state } = useHackathon();
    const { users, faculty, selectedBatch, selectedCollege } = state;

    const filteredUsers: User[] = useMemo(() => {
        if (!selectedBatch) return [...users];
        
        const [startYear, endYear] = selectedBatch.split('-').map(Number);
        return users.filter(user => 
            user.admissionYear && user.passoutYear &&
            parseInt(user.admissionYear) === startYear &&
            parseInt(user.passoutYear) === endYear
        );
    }, [users, selectedBatch]);
    
    const filteredFaculty: Faculty[] = useMemo(() => {
        return [...faculty];
    }, [faculty]);


    const { pendingUsers, approvedUsers } = useMemo(() => {
        const pending = filteredUsers.filter(u => u.status === 'pending');
        const approved = filteredUsers.filter(u => u.status === 'approved');
        return { pendingUsers: pending, approvedUsers: approved };
    }, [filteredUsers]);

    const { pendingFaculty, approvedFaculty } = useMemo(() => {
        const pending = filteredFaculty.filter(f => f.status === 'pending');
        const approved = filteredFaculty.filter(f => f.status === 'approved');
        return { pendingFaculty: pending, approvedFaculty: approved };
    }, [filteredFaculty]);
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Building2 /> Current College
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl font-semibold text-primary">{selectedCollege}</p>
                    <p className="text-sm text-muted-foreground">All user data below is for the college selected above.</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <AddFacultyForm />
                    <AddStudentForm />
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <PendingApprovals users={pendingUsers} faculty={pendingFaculty} />
                    <UserLists approvedStudents={approvedUsers} faculty={approvedFaculty} />
                </div>
            </div>
        </div>
    );
}
