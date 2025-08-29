
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/app/admin/_components/AdminDashboard';
import Announcements from '@/app/admin/_components/Announcements';
import DataManagement from '@/app/admin/_components/DataManagement';
import ScoringDashboard from './ScoringDashboard';

export default function JudgingDashboard() {
    const { state } = useHackathon();

    return (
        <div className="animate-slide-in-up container max-w-7xl mx-auto py-12">
            <h1 className="text-4xl font-bold mb-8 font-headline">Judge Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
            <AuthMessage />
            
             <Tabs defaultValue="judging" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="judging">Project Scoring</TabsTrigger>
                    <TabsTrigger value="management">User Management</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="data">Data & Reset</TabsTrigger>
                </TabsList>
                <TabsContent value="judging" className="mt-6">
                   <ScoringDashboard />
                </TabsContent>
                <TabsContent value="management" className="mt-6">
                    <AdminDashboard />
                </TabsContent>
                <TabsContent value="announcements" className="mt-6">
                    <Announcements />
                </TabsContent>
                <TabsContent value="data" className="mt-6">
                    <DataManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
