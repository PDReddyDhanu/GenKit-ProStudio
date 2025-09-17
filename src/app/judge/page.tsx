
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JudgingDashboard from './_components/JudgingDashboard';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { Scale, Loader } from 'lucide-react';
import AdminPortal from '@/app/admin/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function JudgeLoginForm() {
    const { api } = useHackathon();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginJudge({ email, password });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center font-headline">Judge Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="judge-email">Email</Label>
                        <Input id="judge-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@judge.com" disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="judge-password">Password</Label>
                        <Input id="judge-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : 'Login as Judge'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function AdminLoginForm() {
    const { api } = useHackathon();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginAdmin({ email, password });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center font-headline">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="hacksprint@admin.com" disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : 'Login as Admin'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}


export default function JudgePortal() {
    const { state, dispatch } = useHackathon();
    const { currentJudge, currentAdmin } = state;
    const [showIntro, setShowIntro] = useState(true);

     const onTabChange = () => {
        dispatch({ type: 'CLEAR_MESSAGES' });
    }

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Scale className="w-full h-full" />} title="Judge & Admin Portal" description="Evaluate submissions, manage users, and run the event." />;
    }
    
    if (currentAdmin) {
        return <AdminPortal/>
    }

    if (!currentJudge) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                <Tabs defaultValue="judge" className="w-full" onValueChange={onTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="judge">Judge</TabsTrigger>
                        <TabsTrigger value="admin">Admin</TabsTrigger>
                    </TabsList>
                    <AuthMessage />
                    <TabsContent value="judge">
                        <JudgeLoginForm />
                    </TabsContent>
                    <TabsContent value="admin">
                        <AdminLoginForm />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    return <JudgingDashboard />;
}
