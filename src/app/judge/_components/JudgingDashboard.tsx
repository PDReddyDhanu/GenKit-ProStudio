
"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/app/admin/_components/AdminDashboard';
import Announcements from '@/app/admin/_components/Announcements';
import AnalyticsDashboard from '@/app/admin/_components/AnalyticsDashboard';
import DataManagement from '@/app/admin/_components/DataManagement';
import ScoringDashboard from './ScoringDashboard';
import HackathonManagement from './HackathonManagement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function JudgingDashboard() {
    const { state, dispatch } = useHackathon();
    const { hackathons, selectedHackathonId } = state;

    const handleHackathonChange = (hackathonId: string) => {
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId === 'default' ? null : hackathonId });
    }

    const currentHackathon = useMemo(() => {
        return hackathons.find(h => h.id === selectedHackathonId);
    }, [hackathons, selectedHackathonId]);

    return (
        <div className="animate-slide-in-up container max-w-7xl mx-auto py-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Judge Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
                <div>
                     <Select onValueChange={handleHackathonChange} value={selectedHackathonId || "default"}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a Hackathon to Judge" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="default">Default View</SelectItem>
                            {hackathons.map(h => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <AuthMessage />
            
             <Tabs defaultValue="judging" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto md:h-10">
                    <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                    <TabsTrigger value="judging">Project Scoring</TabsTrigger>
                    <TabsTrigger value="management">User Management</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="data">Data & Reset</TabsTrigger>
                </TabsList>
                <TabsContent value="hackathons" className="mt-6">
                    <HackathonManagement />
                </TabsContent>
                <TabsContent value="judging" className="mt-6">
                    {currentHackathon ? <ScoringDashboard hackathon={currentHackathon} /> : <p className="text-center text-muted-foreground">Please select a hackathon to start judging.</p>}
                </TabsContent>
                 <TabsContent value="management" className="mt-6">
                    <AdminDashboard />
                </TabsContent>
                <TabsContent value="announcements" className="mt-6">
                    <Announcements />
                </TabsContent>
                 <TabsContent value="analytics" className="mt-6">
                     {currentHackathon ? <AnalyticsDashboard hackathon={currentHackathon} /> : <p className="text-center text-muted-foreground">Please select a hackathon to view analytics.</p>}
                </TabsContent>
                 <TabsContent value="data" className="mt-6">
                    <DataManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
