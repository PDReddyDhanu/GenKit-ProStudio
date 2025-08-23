
"use client";

import React, { useState } from 'react';
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
import { Shield } from 'lucide-react';
import DataManagement from './_components/DataManagement';

export default function AdminPortal() {
    const { state, dispatch } = useHackathon();
    const { currentAdmin } = state;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showIntro, setShowIntro] = useState(true);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.toLowerCase() === 'hacksprint@admin.com' && password === 'hack123') {
             dispatch({ type: 'ADMIN_LOGIN' });
        } else {
            dispatch({ type: 'SET_AUTH_ERROR', payload: 'Invalid admin credentials.' });
        }
    };

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Shield className="w-full h-full" />} title="Admin Portal" description="Manage the hackathon, users, and announcements." />;
    }

    if (!currentAdmin) {
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
                                <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-password">Password</Label>
                                <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-slide-in-up">
            <h1 className="text-4xl font-bold mb-8 font-headline">Admin Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
            <AuthMessage />

             <Tabs defaultValue="management" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="management">User Management</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="data">Data & Reset</TabsTrigger>
                </TabsList>
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
