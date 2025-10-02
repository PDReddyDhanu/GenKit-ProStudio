

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
import { Shield, Loader, Scale, Rss, LineChart, Database, FileText, LifeBuoy, AlertTriangle, GanttChartSquare } from 'lucide-react';
import DataManagement from './_components/DataManagement';
import ScoringDashboard from '@/app/judge/_components/ScoringDashboard';
import HackathonManagement from '@/app/judge/_components/HackathonManagement';
import AnalyticsDashboard from './_components/AnalyticsDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReportingDashboard from './_components/ReportingDashboard';
import SupportDashboard from './_components/SupportDashboard';
import { useRouter } from 'next/navigation';
import UrgentApprovalsDashboard from './_components/UrgentApprovalsDashboard';
import { Badge } from '@/components/ui/badge';
import ProjectApprovalDashboard from './_components/ProjectApprovalDashboard';

const projectEvents = [
    {
        id: 'real-time-project',
        name: 'Real-Time Project',
    },
    {
        id: 'mini-project',
        name: 'Mini Project',
    },
    {
        id: 'major-project',
        name: 'Major Project',
    },
    {
        id: 'other-project',
        name: 'Other Project',
    }
];


export default function AdminPortal() {
    const { state, api, dispatch } = useHackathon();
    const { currentAdmin, currentFaculty, hackathons, selectedHackathonId, users } = state;
    const [email, setEmail] = useState('genkit@admin.com');
    const [password, setPassword] = useState('');
    const [showIntro, setShowIntro] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();


    const portalUser = currentAdmin ? 'Admin' : currentFaculty ? 'Faculty' : null;

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginAdmin({ email, password });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEventChange = (hackathonId: string) => {
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId === 'default' ? null : hackathonId });
    }
     const currentEvent = useMemo(() => {
        const dynamicEvent = hackathons.find(h => h.id === selectedHackathonId);
        if (dynamicEvent) return dynamicEvent;
        
        const staticEvent = projectEvents.find(p => p.id === selectedHackathonId);
        if(staticEvent) return { ...staticEvent, rules: '', prizeMoney: '', teamSizeLimit: 6, deadline: 0, id: staticEvent.id };

        return null;
    }, [hackathons, selectedHackathonId]);

    const urgentApprovalsCount = useMemo(() => {
        return users.filter(u => u.status === 'pending' && u.approvalReminderSentAt).length;
    }, [users]);


    const handleTabChange = (value: string) => {
        router.push(`/admin?tab=${value}`, { scroll: false });
    };


    if (showIntro && !portalUser) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Shield className="w-full h-full" />} title="Admin Portal" description="Manage projects, users, and evaluations." />;
    }

    if (!portalUser) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                <Card>
                     <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center font-headline">Main Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <AuthMessage />
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Email</Label>
                                <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={true} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-password">Password</Label>
                                <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : 'Login as Main Admin'}
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
                <h1 className="text-3xl md:text-4xl font-bold font-headline">{currentAdmin ? 'Admin' : currentFaculty?.role.toUpperCase()} Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
                <div>
                     <Select onValueChange={handleEventChange} value={selectedHackathonId || "default"}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select an Event to manage" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="default">Default View (No Event Selected)</SelectItem>
                             {projectEvents.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                             ))}
                            {hackathons.map(h => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <AuthMessage />

             <Tabs defaultValue={currentFaculty ? "scoring" : "events"} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full h-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
                    {currentFaculty && <TabsTrigger value="scoring"><Scale className="mr-2 h-4 w-4" /> Project Scoring</TabsTrigger>}
                    <TabsTrigger value="events">Events</TabsTrigger>
                     <TabsTrigger value="urgent-approvals" className="relative">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Urgent Approvals
                        {urgentApprovalsCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{urgentApprovalsCount}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approvals"><GanttChartSquare className="mr-2 h-4 w-4" /> Project Approvals</TabsTrigger>
                    <TabsTrigger value="management">User Management</TabsTrigger>
                    <TabsTrigger value="announcements"><Rss className="mr-2 h-4 w-4" /> Announcements</TabsTrigger>
                    <TabsTrigger value="analytics"><LineChart className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
                    <TabsTrigger value="data"><Database className="mr-2 h-4 w-4" /> Data & Export</TabsTrigger>
                    <TabsTrigger value="reports"><FileText className="mr-2 h-4 w-4" /> Reports</TabsTrigger>
                    <TabsTrigger value="support"><LifeBuoy className="mr-2 h-4 w-4" /> Support</TabsTrigger>
                </TabsList>
                {currentFaculty && (
                    <TabsContent value="scoring" className="mt-6">
                        {currentEvent ? <ScoringDashboard event={currentEvent} /> : <p className="text-center text-muted-foreground">Please select an event to start scoring projects.</p>}
                    </TabsContent>
                )}
                 <TabsContent value="events" className="mt-6">
                    <HackathonManagement />
                </TabsContent>
                 <TabsContent value="urgent-approvals" className="mt-6">
                    <UrgentApprovalsDashboard />
                </TabsContent>
                <TabsContent value="approvals" className="mt-6">
                    <ProjectApprovalDashboard />
                </TabsContent>
                <TabsContent value="management" className="mt-6">
                    <AdminDashboard />
                </TabsContent>
                <TabsContent value="announcements" className="mt-6">
                    <Announcements />
                </TabsContent>
                 <TabsContent value="analytics" className="mt-6">
                    {currentEvent ? <AnalyticsDashboard event={currentEvent} /> : <p className="text-center text-muted-foreground">Please select an event to view analytics.</p>}
                </TabsContent>
                <TabsContent value="data" className="mt-6">
                    <DataManagement />
                </TabsContent>
                <TabsContent value="reports" className="mt-6">
                    {currentEvent ? <ReportingDashboard /> : <p className="text-center text-muted-foreground">Please select an event to generate a report.</p>}
                </TabsContent>
                <TabsContent value="support" className="mt-6">
                    <SupportDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
