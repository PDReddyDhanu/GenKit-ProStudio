
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { Scale, Loader, Mail, Lock } from 'lucide-react';
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
                 <Card className="relative group overflow-hidden">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur-lg opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-glowing-border"></div>
                    <div className="relative bg-card rounded-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-bold font-headline text-primary">Login</CardTitle>
                            <CardDescription>Login to your Judge or Admin account!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <AuthMessage />
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        type="email" 
                                        placeholder="Email Id" 
                                        className="pl-10" 
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required 
                                        disabled={isLoading} 
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        type="password" 
                                        placeholder="Password" 
                                        className="pl-10" 
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required 
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : 'Login'}
                                </Button>
                            </form>
                        </CardContent>
                    </div>
                </Card>
            </div>
        );
    }

    // This case should ideally not be reached if the logic above is correct
    return <AdminPortal />;
}
