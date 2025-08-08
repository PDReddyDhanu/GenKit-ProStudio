"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/lib/types';
import JudgingDashboard from './_components/JudgingDashboard';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { Scale } from 'lucide-react';

export default function JudgePortal() {
    const { state, dispatch } = useHackathon();
    const { currentJudge } = state;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showIntro, setShowIntro] = useState(true);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'LOGIN_JUDGE', payload: { email, password } });
    };

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Scale className="w-full h-full" />} title="Judge Portal" description="Evaluate submissions and decide the winners." />;
    }

    if (!currentJudge) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center font-headline">Judge Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <AuthMessage />
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Judge Email</Label>
                                <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="judge@judge.com" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <JudgingDashboard />;
}