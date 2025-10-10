
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminDashboard from './_components/AdminDashboard';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Announcements from './_components/Announcements';
import PageIntro from '@/components/PageIntro';
import { Shield, Loader, Scale, Rss, LineChart, Database, FileText, LifeBuoy, AlertTriangle, GanttChartSquare, User, MessageSquare, Eye, EyeOff, Users, CheckCheck, Info } from 'lucide-react';
import DataManagement from './_components/DataManagement';
import HackathonManagement from '@/app/judge/_components/HackathonManagement';
import AnalyticsDashboard from './_components/AnalyticsDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReportingDashboard from './_components/ReportingDashboard';
import SupportDashboard from './_components/SupportDashboard';
import { useRouter } from 'next/navigation';
import UrgentApprovalsDashboard from './_components/UrgentApprovalsDashboard';
import { Badge } from '@/components/ui/badge';
import ProjectApprovalDashboard from './_components/ProjectApprovalDashboard';
import GuideAssignmentDashboard from './_components/GuideAssignmentDashboard';
import GuideTeamsDashboard from './_components/GuideTeamsDashboard';
import { StarButton } from '@/components/ui/star-button';
import { Button } from '@/components/ui/button';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import ProjectInfoDashboard from './_components/ProjectInfoDashboard';

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
    const { currentAdmin, currentFaculty, hackathons, selectedHackathonId, users, selectedBatch } = state;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();


    const portalUser = currentAdmin ? 'Admin' : currentFaculty ? 'Faculty' : null;
    const isExternal = currentFaculty?.role === 'external';

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
    
    const handleBatchChange = (batch: string) => {
        dispatch({ type: 'SET_SELECTED_BATCH', payload: batch === 'all' ? null : batch });
    }

    const allEvents = useMemo(() => {
        const staticEvents = projectEvents;
        const dynamicEvents = hackathons.map(h => ({id: h.id, name: h.name}));
        const combined = [...staticEvents, ...dynamicEvents];
        // Remove duplicates by id
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique;
    }, [hackathons]);

     const currentEvent = useMemo(() => {
        if (!selectedHackathonId) return null;
        
        const event = allEvents.find(e => e.id === selectedHackathonId);
        if (!event) return null;

        const dynamicEvent = hackathons.find(h => h.id === selectedHackathonId);

        return {
             id: event.id,
             name: event.name,
             rules: dynamicEvent?.rules || '',
             prizeMoney: dynamicEvent?.prizeMoney || '',
             teamSizeLimit: dynamicEvent?.teamSizeLimit || 6,
             deadline: dynamicEvent?.deadline || 0,
        };
    }, [hackathons, selectedHackathonId, allEvents]);

    const urgentApprovalsCount = useMemo(() => {
        return users.filter(u => u.status === 'pending' && u.approvalReminderSentAt).length;
    }, [users]);
    
    const availableBatches = useMemo(() => {
        const batches = new Set<string>();
        for (let year = 2012; year <= 2100 - 4; year++) {
            batches.add(`${year}-${year + 4}`);
        }
        users.forEach(u => {
            if (u.admissionYear && u.passoutYear) {
                batches.add(`${u.admissionYear}-${u.passoutYear}`);
            }
        });
        return Array.from(batches).sort();
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
                                <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="space-y-2 relative">
                                <Label htmlFor="admin-password">Password</Label>
                                <Input id="admin-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                            </div>
                            <StarButton type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : 'Login as Main Admin'}
                            </StarButton>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    let defaultTab = "approvals";
    if (isExternal) {
        defaultTab = "information";
    } else if (currentFaculty?.role === 'guide' || currentFaculty?.role === 'class-mentor') {
        defaultTab = 'my-teams';
    } else if (!currentAdmin) {
        defaultTab = 'approvals';
    } else {
        defaultTab = 'events';
    }

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-slide-in-up">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">{currentAdmin ? 'Admin' : currentFaculty?.role.toUpperCase()} Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
                 <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <Select onValueChange={handleBatchChange} value={selectedBatch || ""}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Batch" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">All Batches</SelectItem>
                             {availableBatches.map(batch => (
                                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                     <Select onValueChange={handleEventChange} value={selectedHackathonId || ""}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an Event" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="default">Default View (No Event Selected)</SelectItem>
                             {allEvents.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <AuthMessage />

             <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap justify-start">
                    
                    {!isExternal && (currentFaculty?.role === 'guide' || currentFaculty?.role === 'class-mentor') && <TabsTrigger value="my-teams"><MessageSquare className="mr-2 h-4 w-4" /> My Teams</TabsTrigger>}
                    
                    <TabsTrigger value="approvals"><CheckCheck className="mr-2 h-4 w-4" /> Approvals & Scoring</TabsTrigger>
                    
                    <TabsTrigger value="information"><Info className="mr-2 h-4 w-4" /> Information & Reports</TabsTrigger>

                    {!isExternal && (
                        <>
                            <TabsTrigger value="events">Events</TabsTrigger>
                            <TabsTrigger value="urgent-approvals" className="relative">
                                <AlertTriangle className="mr-2 h-4 w-4" /> Urgent Approvals
                                {urgentApprovalsCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{urgentApprovalsCount}</Badge>
                                )}
                            </TabsTrigger>
                            {currentFaculty?.role === 'hod' && <TabsTrigger value="assign-guides"><User className="mr-2 h-4 w-4" /> Assign Guides</TabsTrigger>}
                            <TabsTrigger value="management"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
                            <TabsTrigger value="announcements"><Rss className="mr-2 h-4 w-4" /> Announcements</TabsTrigger>
                            <TabsTrigger value="analytics"><LineChart className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
                            <TabsTrigger value="data"><Database className="mr-2 h-4 w-4" /> Data & Export</TabsTrigger>
                            <TabsTrigger value="reports"><FileText className="mr-2 h-4 w-4" /> Reports</TabsTrigger>
                            <TabsTrigger value="support"><LifeBuoy className="mr-2 h-4 w-4" /> Support</TabsTrigger>
                        </>
                    )}
                </TabsList>

                {!isExternal && (currentFaculty?.role === 'guide' || currentFaculty?.role === 'class-mentor') && (
                    <TabsContent value="my-teams" className="mt-6">
                        <GuideTeamsDashboard />
                    </TabsContent>
                )}
                 
                <TabsContent value="approvals" className="mt-6">
                    <ProjectApprovalDashboard />
                </TabsContent>

                <TabsContent value="information" className="mt-6">
                    <ProjectInfoDashboard />
                </TabsContent>

                {!isExternal && (
                    <>
                        <TabsContent value="events" className="mt-6">
                           <HackathonManagement />
                       </TabsContent>
                        <TabsContent value="urgent-approvals" className="mt-6">
                           <UrgentApprovalsDashboard />
                       </TabsContent>
                        {currentFaculty?.role === 'hod' && (
                           <TabsContent value="assign-guides" className="mt-6">
                               <GuideAssignmentDashboard />
                           </TabsContent>
                       )}
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
                   </>
                )}
            </Tabs>
        </div>
    );
}
