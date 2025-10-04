

"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import Auth from './_components/Auth';
import Dashboard from './_components/Dashboard';
import PageIntro from '@/components/PageIntro';
import { Code, Users, ClipboardList, GanttChartSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvitationsManagement from './_components/InvitationsManagement';

export default function StudentPortal() {
    const { state, dispatch } = useHackathon();
    const { currentUser } = state;
    const [showIntro, setShowIntro] = useState(true);

    if (showIntro && !currentUser) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Code className="w-full h-full" />} title="Student Portal" description="Register, login, and start your project journey." />;
    }
    
    if (showIntro && currentUser) {
        // Don't show intro if already logged in, go straight to dashboard
        setShowIntro(false);
    }

    if (!currentUser) {
        return <Auth />;
    }

    return (
        <div className="container max-w-7xl mx-auto py-12">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Student Portal</h1>
            </div>
             <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full h-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <TabsTrigger value="dashboard"><Users className="mr-2"/> Dashboard</TabsTrigger>
                    <TabsTrigger value="management"><ClipboardList className="mr-2"/>My Teams & Requests</TabsTrigger>
                    <TabsTrigger value="status"><GanttChartSquare className="mr-2"/>Project Status</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-6">
                    <Dashboard />
                </TabsContent>
                <TabsContent value="management" className="mt-6">
                    <InvitationsManagement />
                </TabsContent>
                 <TabsContent value="status" className="mt-6">
                    <Dashboard />
                </TabsContent>
            </Tabs>
        </div>
    )
}
