
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { Scale, Loader } from 'lucide-react';
import AdminPortal from '@/app/admin/page';

export default function JudgePortal() {
    const { state, api } = useHackathon();
    const { currentJudge, currentAdmin } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (email === 'hacksprint@admin.com') {
                await api.loginAdmin({ email, password });
            } else {
                await api.loginJudge({ email, password });
            }
        } finally {
            setIsLoading(false);
        }
    };


    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Scale className="w-full h-full" />} title="Judge & Admin Portal" description="Evaluate submissions, manage users, and run the event." />;
    }
    
    if (currentAdmin || currentJudge) {
        return <AdminPortal/>
    }

    if (!currentJudge) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center font-headline">Judge & Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <AuthMessage />
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
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

    // This case should ideally not be reached if the logic above is correct
    return <AdminPortal />;
}
