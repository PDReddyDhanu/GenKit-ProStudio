
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Project, User, Judge } from '@/lib/types';
import ProjectList from './ProjectList';
import ScoringForm from './ScoringForm';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import components from admin portal
import AddStudentForm from '@/app/admin/_components/AddStudentForm';
import PendingApprovals from '@/app/admin/_components/PendingApprovals';
import UserLists from '@/app/admin/_components/UserLists';

function JudgingPanel() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    if (selectedProject) {
        return <ScoringForm project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    return (
        <div className="container max-w-4xl mx-auto py-12">
            <h2 className="text-3xl font-bold mb-6 font-headline">Projects for Judging</h2>
            <ProjectList onSelectProject={setSelectedProject} />
        </div>
    );
}

function StudentManagementPanel() {
    const { state } = useHackathon();
    const { users } = state.collegeData;

    const { pendingUsers, approvedUsers } = useMemo(() => {
        const pending = users.filter(u => u.status === 'pending');
        const approved = users.filter(u => u.status === 'approved');
        return { pendingUsers: pending, approvedUsers: approved };
    }, [users]);
    
    return (
        <div className="container max-w-7xl mx-auto py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <AddStudentForm />
            </div>
            <div className="lg:col-span-2 space-y-8">
                <PendingApprovals users={pendingUsers} />
                {/* We can reuse UserLists, but we only need the student part. Judges list is not relevant here. */}
                <UserLists approvedStudents={approvedUsers} judges={[]} />
            </div>
        </div>
    );
}

export default function JudgingDashboard() {
    const { state } = useHackathon();

    return (
        <div className="animate-slide-in-up">
            <h1 className="text-4xl font-bold mt-12 mb-8 font-headline text-center">Judge Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
            <AuthMessage />

            <Tabs defaultValue="judging" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="judging">Project Scoring</TabsTrigger>
                    <TabsTrigger value="students">Student Management</TabsTrigger>
                </TabsList>
                <TabsContent value="judging" className="mt-6">
                    <JudgingPanel />
                </TabsContent>
                <TabsContent value="students" className="mt-6">
                    <StudentManagementPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
}
