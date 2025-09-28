

"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import AddFacultyForm from './AddJudgeForm';
import AddStudentForm from './AddStudentForm';
import PendingApprovals from './PendingApprovals';
import UserLists from './UserLists';

export default function AdminDashboard() {
    const { state } = useHackathon();
    const { users, faculty } = state;

    const { pendingUsers, approvedUsers } = useMemo(() => {
        const pending = users.filter(u => u.status === 'pending');
        const approved = users.filter(u => u.status === 'approved');
        return { pendingUsers: pending, approvedUsers: approved };
    }, [users]);

    const pendingFaculty = useMemo(() => {
        return faculty.filter(f => f.status === 'pending');
    }, [faculty]);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <AddFacultyForm />
                <AddStudentForm />
            </div>
            <div className="lg:col-span-2 space-y-8">
                <PendingApprovals users={pendingUsers} faculty={pendingFaculty} />
                <UserLists approvedStudents={approvedUsers} faculty={faculty.filter(f => f.status === 'approved')} />
            </div>
        </div>
    );
}
