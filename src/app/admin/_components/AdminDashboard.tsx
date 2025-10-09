
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

export default function AdminDashboard() {
    const { state, dispatch } = useHackathon();
    const { users, faculty, selectedBatch, selectedDepartment, selectedBranch } = state;

    const availableDepartments = useMemo(() => Object.keys(DEPARTMENTS_DATA), []);
    const availableBranches = useMemo(() => {
        if (!selectedDepartment) return [];
        return DEPARTMENTS_DATA[selectedDepartment as keyof typeof DEPARTMENTS_DATA] || [];
    }, [selectedDepartment]);

    const handleDepartmentChange = (department: string) => {
        dispatch({ type: 'SET_SELECTED_DEPARTMENT', payload: department === 'all' ? null : department });
        dispatch({ type: 'SET_SELECTED_BRANCH', payload: null });
    };

    const handleBranchChange = (branch: string) => {
        dispatch({ type: 'SET_SELECTED_BRANCH', payload: branch === 'all' ? null : branch });
    };

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
            filtered = filtered.filter(fac => fac.department === selectedDepartment);
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
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users /> User Management Filters
                    </CardTitle>
                    <CardDescription>
                        Filter students and faculty by department and branch to manage registrations and approvals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select onValueChange={handleDepartmentChange} value={selectedDepartment || "all"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Department" />
                            </SelectTrigger>
                            <SelectContent>
                                 <SelectItem value="all">All Departments</SelectItem>
                                 {availableDepartments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                 ))}
                            </SelectContent>
                        </Select>
                         <Select onValueChange={handleBranchChange} value={selectedBranch || "all"} disabled={!selectedDepartment || selectedDepartment === 'all'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                 <SelectItem value="all">All Branches</SelectItem>
                                 {availableBranches.map(branch => (
                                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                 ))}
                            </SelectContent>
                        </Select>
                    </div>
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
