

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

    const handleAdminLogin = async (e: React.FormEvent) =&gt; {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginAdmin({ email, password });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEventChange = (hackathonId: string) =&gt; {
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId === 'default' ? null : hackathonId });
    }
     const currentEvent = useMemo(() =&gt; {
        const dynamicEvent = hackathons.find(h =&gt; h.id === selectedHackathonId);
        if (dynamicEvent) return dynamicEvent;
        
        const staticEvent = projectEvents.find(p =&gt; p.id === selectedHackathonId);
        if(staticEvent) return { ...staticEvent, rules: '', prizeMoney: '', teamSizeLimit: 6, deadline: 0, id: staticEvent.id };

        return null;
    }, [hackathons, selectedHackathonId]);

    const urgentApprovalsCount = useMemo(() =&gt; {
        return users.filter(u =&gt; u.status === 'pending' &amp;&amp; u.approvalReminderSentAt).length;
    }, [users]);


    const handleTabChange = (value: string) =&gt; {
        router.push(`/admin?tab=${value}`, { scroll: false });
    };


    if (showIntro &amp;&amp; !portalUser) {
        return &lt;PageIntro onFinished={() =&gt; setShowIntro(false)} icon=&lt;Shield className="w-full h-full" /&gt; title="Admin Portal" description="Manage projects, users, and evaluations." /&gt;;
    }

    if (!portalUser) {
        return (
            &lt;div className="container max-w-md mx-auto py-12 animate-fade-in"&gt;
                &lt;Card&gt;
                     &lt;CardHeader&gt;
                        &lt;CardTitle className="text-2xl font-bold text-center font-headline"&gt;Main Admin Login&lt;/CardTitle&gt;
                    &lt;/CardHeader&gt;
                    &lt;CardContent&gt;
                        &lt;form onSubmit={handleAdminLogin} className="space-y-4"&gt;
                            &lt;AuthMessage /&gt;
                            &lt;div className="space-y-2"&gt;
                                &lt;Label htmlFor="admin-email"&gt;Email&lt;/Label&gt;
                                &lt;Input id="admin-email" type="email" value={email} onChange={e =&gt; setEmail(e.target.value)} required disabled={true} /&gt;
                            &lt;/div&gt;
                            &lt;div className="space-y-2"&gt;
                                &lt;Label htmlFor="admin-password"&gt;Password&lt;/Label&gt;
                                &lt;Input id="admin-password" type="password" value={password} onChange={e =&gt; setPassword(e.target.value)} required disabled={isLoading} /&gt;
                            &lt;/div&gt;
                            &lt;Button type="submit" className="w-full" disabled={isLoading}&gt;
                                {isLoading ? &lt;&gt;&lt;Loader className="mr-2 h-4 w-4 animate-spin"/&gt; Logging in...&lt;/&gt; : 'Login as Main Admin'}
                            &lt;/Button&gt;
                        &lt;/form&gt;
                    &lt;/CardContent&gt;
                &lt;/Card&gt;
            &lt;/div&gt;
        );
    }

    return (
        &lt;div className="container max-w-7xl mx-auto py-12 animate-slide-in-up"&gt;
            &lt;div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8"&gt;
                &lt;h1 className="text-3xl md:text-4xl font-bold font-headline"&gt;{currentAdmin ? 'Admin' : currentFaculty?.role.toUpperCase()} Dashboard: &lt;span className="text-secondary"&gt;{state.selectedCollege}&lt;/span&gt;&lt;/h1&gt;
                &lt;div&gt;
                     &lt;Select onValueChange={handleEventChange} value={selectedHackathonId || "default"}&gt;
                        &lt;SelectTrigger className="w-full sm:w-[280px]"&gt;
                            &lt;SelectValue placeholder="Select an Event to manage" /&gt;
                        &lt;/SelectTrigger&gt;
                        &lt;SelectContent&gt;
                             &lt;SelectItem value="default"&gt;Default View (No Event Selected)&lt;/SelectItem&gt;
                             {projectEvents.map(p =&gt; (
                                &lt;SelectItem key={p.id} value={p.id}&gt;{p.name}&lt;/SelectItem&gt;
                             ))}
                            {hackathons.map(h =&gt; (
                                &lt;SelectItem key={h.id} value={h.id}&gt;{h.name}&lt;/SelectItem&gt;
                            ))}
                        &lt;/SelectContent&gt;
                    &lt;/Select&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            &lt;AuthMessage /&gt;

             &lt;Tabs defaultValue={currentFaculty ? "scoring" : "events"} className="w-full" onValueChange={handleTabChange}&gt;
                &lt;TabsList className="grid w-full h-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10"&gt;
                    {currentFaculty &amp;&amp; &lt;TabsTrigger value="scoring"&gt;&lt;Scale className="mr-2 h-4 w-4" /&gt; Project Scoring&lt;/TabsTrigger&gt;}
                    &lt;TabsTrigger value="events"&gt;Events&lt;/TabsTrigger&gt;
                     &lt;TabsTrigger value="urgent-approvals" className="relative"&gt;
                        &lt;AlertTriangle className="mr-2 h-4 w-4" /&gt; Urgent Approvals
                        {urgentApprovalsCount &gt; 0 &amp;&amp; (
                            &lt;Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0"&gt;{urgentApprovalsCount}&lt;/Badge&gt;
                        )}
                    &lt;/TabsTrigger&gt;
                    &lt;TabsTrigger value="approvals"&gt;&lt;GanttChartSquare className="mr-2 h-4 w-4" /&gt; Project Approvals&lt;/TabsTrigger&gt;
                    &lt;TabsTrigger value="management"&gt;User Management&lt;/TabsTrigger&gt;
                    &lt;TabsTrigger value="announcements"&gt;&lt;Rss className="mr-2 h-4 w-4" /&gt; Announcements&lt;/TabsTrigger&gt;
                    &lt;TabsTrigger value="analytics"&gt;&lt;LineChart className="mr-2 h-4 w-4" /&gt; Analytics&lt;/TabsTrigger&gt;
                    &lt;TabsTrigger value="data"&gt;&lt;Database className="mr-2 h-4 w-4" /&gt; Data &amp; Export&lt;/TabsTrigger&gt;
                    &lt;TabsTrigger value="reports"&gt;&lt;FileText className="mr-2 h-4 w-4" /&gt; Reports&lt;/TabsTrigger&gt;
                    &lt;TabsTrigger value="support"&gt;&lt;LifeBuoy className="mr-2 h-4 w-4" /&gt; Support&lt;/TabsTrigger&gt;
                &lt;/TabsList&gt;
                {currentFaculty &amp;&amp; (
                    &lt;TabsContent value="scoring" className="mt-6"&gt;
                        {currentEvent ? &lt;ScoringDashboard event={currentEvent} /&gt; : &lt;p className="text-center text-muted-foreground"&gt;Please select an event to start scoring projects.&lt;/p&gt;}
                    &lt;/TabsContent&gt;
                )}
                 &lt;TabsContent value="events" className="mt-6"&gt;
                    &lt;HackathonManagement /&gt;
                &lt;/TabsContent&gt;
                 &lt;TabsContent value="urgent-approvals" className="mt-6"&gt;
                    &lt;UrgentApprovalsDashboard /&gt;
                &lt;/TabsContent&gt;
                &lt;TabsContent value="approvals" className="mt-6"&gt;
                    &lt;ProjectApprovalDashboard /&gt;
                &lt;/TabsContent&gt;
                &lt;TabsContent value="management" className="mt-6"&gt;
                    &lt;AdminDashboard /&gt;
                &lt;/TabsContent&gt;
                &lt;TabsContent value="announcements" className="mt-6"&gt;
                    &lt;Announcements /&gt;
                &lt;/TabsContent&gt;
                 &lt;TabsContent value="analytics" className="mt-6"&gt;
                    {currentEvent ? &lt;AnalyticsDashboard event={currentEvent} /&gt; : &lt;p className="text-center text-muted-foreground"&gt;Please select an event to view analytics.&lt;/p&gt;}
                &lt;/TabsContent&gt;
                &lt;TabsContent value="data" className="mt-6"&gt;
                    &lt;DataManagement /&gt;
                &lt;/TabsContent&gt;
                &lt;TabsContent value="reports" className="mt-6"&gt;
                    {currentEvent ? &lt;ReportingDashboard /&gt; : &lt;p className="text-center text-muted-foreground"&gt;Please select an event to generate a report.&lt;/p&gt;}
                &lt;/TabsContent&gt;
                &lt;TabsContent value="support" className="mt-6"&gt;
                    &lt;SupportDashboard /&gt;
                &lt;/TabsContent&gt;
            &lt;/Tabs&gt;
        &lt;/div&gt;
    );
}
