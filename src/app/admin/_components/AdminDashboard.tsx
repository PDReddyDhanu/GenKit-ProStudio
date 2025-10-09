
"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import AddFacultyForm from './AddJudgeForm';
import AddStudentForm from './AddStudentForm';
import PendingApprovals from './PendingApprovals';
import UserLists from './UserLists';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import type { User, Faculty } from '@/lib/types';

export default function AdminDashboard() {
    const { state } = useHackathon();
    const { users, faculty, selectedBatch, selectedDepartment, selectedBranch } = state;

    const filteredUsers: User[] = useMemo(() => {
        let filtered = users;

        if (selectedBatch) {
            const [startYear, endYear] = selectedBatch.split('-').map(Number);
            filtered = filtered.filter(user => 
                user.admissionYear && user.passoutYear &&
                parseInt(user.admissionYear) === startYear &&
                parseInt(user.passoutYear) === endYear
            );
        }

        if (selectedDepartment && selectedDepartment !== 'all') {
            const departmentBranches = DEPARTMENTS_DATA[selectedDepartment as keyof typeof DEPARTMENTS_DATA]?.map(b => b.id) || [];
            filtered = filtered.filter(user => departmentBranches.includes(user.branch));
        }

        if (selectedBranch && selectedBranch !== 'all') {
            filtered = filtered.filter(user => user.branch === selectedBranch);
        }

        return filtered;
    }, [users, selectedBatch, selectedDepartment, selectedBranch]);
    
    const filteredFaculty: Faculty[] = useMemo(() => {
        let filtered = faculty;

        if (selectedDepartment && selectedDepartment !== 'all') {
            const departmentBranches = DEPARTMENTS_DATA[selectedDepartment as keyof typeof DEPARTMENTS_DATA]?.map(b => b.id) || [];
            filtered = filtered.filter(fac => 
                (fac.department && fac.department === selectedDepartment) || 
                (fac.branch && departmentBranches.includes(fac.branch)) ||
                (!fac.department && !fac.branch) // Include faculty without department/branch info if no specific branch is selected
            );
        }

        if (selectedBranch && selectedBranch !== 'all') {
            filtered = filtered.filter(fac => fac.branch === selectedBranch);
        }
        
        return filtered;
    }, [faculty, selectedDepartment, selectedBranch]);


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
    );
}
