"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminDashboard from './_components/AdminDashboard';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Announcements from './_components/Announcements';
import PageIntro from '@/components/PageIntro';
import { Shield, Loader, Scale, Rss, LineChart, Database, Image as ImageIcon } from 'lucide-react';
import DataManagement from './_components/DataManagement';
import JudgingDashboard from '@/app/judge/_components/JudgingDashboard';
import HackathonManagement from '@/app/judge/_components/HackathonManagement';
import AnalyticsDashboard from './_components/AnalyticsDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GeneratedImages from './_components/GeneratedVideos';


export default function AdminPortal() {
    const { state, api, dispatch } = useHackathon();
    const { currentAdmin, currentJudge, hackathons, selectedHackathonId } = state;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showIntro, setShowIntro] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const portalUser = currentAdmin ? 'Admin' : currentJudge ? 'Judge' : null;

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginAdmin({ email, password });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHackathonChange = (hackathonId: string) => {
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId === 'default' ? null : hackathonId });
    }
     const currentHackathon = useMemo(() => {
        return hackathons.find(h => h.id === selectedHackathonId);
    }, [hackathons, selectedHackathonId]);


    if (showIntro && !portalUser) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Shield className="w-full h-full" />} title="Admin Portal" description="Manage the hackathon, users, and announcements." />;
    }

    if (!portalUser) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                <Card>
                     <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center font-headline">Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <AuthMessage />
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Admin Email</Label>
                                <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-password">Password</Label>
                                <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : 'Login'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-slide-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">{portalUser} Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
                <div>
                     <Select onValueChange={handleHackathonChange} value={selectedHackathonId || "default"}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a Hackathon to manage" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="default">Default View (No Hackathon Selected)</SelectItem>
                            {hackathons.map(h => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <AuthMessage />

             <Tabs defaultValue={currentJudge ? "judging" : "hackathons"} className="w-full">
                <TabsList className={`grid w-full h-auto md:h-10 ${currentJudge ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-7' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
                    {currentJudge && <TabsTrigger value="judging"><Scale /> Project Scoring</TabsTrigger>}
                    <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                    <TabsTrigger value="management">User Management</TabsTrigger>
                    <TabsTrigger value="announcements"><Rss/> Announcements</TabsTrigger>
                    <TabsTrigger value="analytics"><LineChart /> Analytics</TabsTrigger>
                    <TabsTrigger value="data"><Database/> Data & Export</TabsTrigger>
                    <TabsTrigger value="images"><ImageIcon/> Generated Images</TabsTrigger>
                </TabsList>
                {currentJudge && (
                    <TabsContent value="judging" className="mt-6">
                        {currentHackathon ? <JudgingDashboard hackathon={currentHackathon} /> : <p className="text-center text-muted-foreground">Please select a hackathon to start judging.</p>}
                    </TabsContent>
                )}
                 <TabsContent value="hackathons" className="mt-6">
                    <HackathonManagement />
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
                <TabsContent value="images" className="mt-6">
                    {currentHackathon ? <GeneratedImages /> : <p className="text-center text-muted-foreground">Please select a hackathon to view generated images.</p>}
                </TabsContent>
            </Tabs>
        </div>
    );
}
