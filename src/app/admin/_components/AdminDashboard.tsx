

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

    const departmentBranches = useMemo(() => {
        if (!selectedDepartment || selectedDepartment === 'all') return [];
        return DEPARTMENTS_DATA[selectedDepartment as keyof typeof DEPARTMENTS_DATA]?.map(b => b.id) || [];
    }, [selectedDepartment]);

    const filteredUsers: User[] = useMemo(() => {
        return users.filter(user => {
            if (selectedBatch) {
                const [startYear, endYear] = selectedBatch.split('-').map(Number);
                if (
                    !user.admissionYear || !user.passoutYear ||
                    parseInt(user.admissionYear) !== startYear ||
                    parseInt(user.passoutYear) !== endYear
                ) {
                    return false;
                }
            }
            if (selectedDepartment && selectedDepartment !== 'all') {
                if (!departmentBranches.includes(user.branch)) {
                    return false;
                }
            }
            if (selectedBranch && selectedBranch !== 'all') {
                if (user.branch !== selectedBranch) {
                    return false;
                }
            }
            return true;
        });
    }, [users, selectedBatch, selectedDepartment, selectedBranch, departmentBranches]);
    
    const filteredFaculty: Faculty[] = useMemo(() => {
        return faculty.filter(fac => {
             if (selectedDepartment && selectedDepartment !== 'all') {
                // If a faculty member has a department set, it must match.
                // If they have a branch set, it must fall within the selected department.
                if (fac.department && fac.department !== selectedDepartment) {
                     return false;
                }
                 if (fac.branch && !departmentBranches.includes(fac.branch)) {
                     return false;
                 }
                 // If neither is set, they might be a cross-department role, so we don't filter them out here
                 // unless a branch is also selected.
            }

            if (selectedBranch && selectedBranch !== 'all') {
                if (fac.branch !== selectedBranch) {
                    return false;
                }
            }
            return true;
        });
    }, [faculty, selectedDepartment, selectedBranch, departmentBranches]);


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

