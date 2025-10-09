

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
        let tempUsers = users;

        if (selectedBatch) {
            const [startYear, endYear] = selectedBatch.split('-').map(Number);
            tempUsers = tempUsers.filter(u =>
                u.admissionYear && u.passoutYear &&
                parseInt(u.admissionYear) === startYear &&
                parseInt(u.passoutYear) === endYear
            );
        }

        if (selectedDepartment && selectedDepartment !== 'all') {
            tempUsers = tempUsers.filter(u => u.department === selectedDepartment || departmentBranches.includes(u.branch));
        }

        if (selectedBranch && selectedBranch !== 'all') {
            tempUsers = tempUsers.filter(u => u.branch === selectedBranch);
        }

        return tempUsers;
    }, [users, selectedBatch, selectedDepartment, selectedBranch, departmentBranches]);
    
    const filteredFaculty: Faculty[] = useMemo(() => {
        let tempFaculty = faculty;

        if (selectedDepartment && selectedDepartment !== 'all') {
            tempFaculty = tempFaculty.filter(f => f.department === selectedDepartment || departmentBranches.includes(f.branch));
        }

        if (selectedBranch && selectedBranch !== 'all') {
            tempFaculty = tempFaculty.filter(f => f.branch === selectedBranch);
        }
        
        return tempFaculty;
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
