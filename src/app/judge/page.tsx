
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { Scale, Loader, Mail, Lock, Building, ArrowRight, Shield, UserCheck, Briefcase } from 'lucide-react';
import AdminPortal from '@/app/admin/page';
import Link from 'next/link';

export default function FacultyPortal() {
    const { state, api } = useHackathon();
    const { currentFaculty, currentAdmin } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginFaculty({ email, password });
        } finally {
            setIsLoading(false);
        }
    };

    if (showIntro && !currentFaculty && !currentAdmin) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Scale className="w-full h-full" />} title="Faculty Portal" description="Evaluate submissions, manage users, and run the project hub." />;
    }
    
    if (currentAdmin || currentFaculty) {
        return <AdminPortal/>
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 animate-fade-in">
             <Card className="relative group overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur-lg opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-glowing-border"></div>
                <div className="relative bg-card rounded-lg grid md:grid-cols-2">
                     <div className="p-8 bg-muted/30 rounded-l-lg">
                        <CardHeader className="p-0">
                            <CardTitle className="text-3xl font-bold font-headline text-primary">Welcome Back</CardTitle>
                            <CardDescription>
                                Login to access your dedicated portal for all faculty and administrative roles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 mt-6 space-y-4">
                             <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-center gap-3"><UserCheck className="h-5 w-5 text-secondary"/> Guides & Mentors</li>
                                <li className="flex items-center gap-3"><Building className="h-5 w-5 text-secondary"/> HoDs & R&D Coordinators</li>
                                <li className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-secondary"/> External Evaluators</li>
                                <li className="flex items-center gap-3"><Shield className="h-5 w-5 text-secondary"/> College Sub-Admins</li>
                            </ul>
                            <div className="pt-6 border-t">
                                 <div className="flex flex-wrap gap-x-4 gap-y-2">
                                     <div>
                                        <p className="text-sm text-muted-foreground">Are you a student?</p>
                                         <Button variant="link" asChild className="px-0 -mt-1 h-auto">
                                            <Link href="/student">Go to Student Portal <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                         </Button>
                                     </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Main Developer?</p>
                                         <Button variant="link" asChild className="px-0 -mt-1 h-auto">
                                            <Link href="/admin">Main Admin Login <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                         </Button>
                                     </div>
                                 </div>
                            </div>
                        </CardContent>
                     </div>
                     <div className="p-8">
                        <CardHeader className="p-0 text-center">
                            <CardTitle className="text-2xl font-bold font-headline">Faculty Login</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-6">
                            <form onSubmit={handleLogin} className="space-y-6">
                                <AuthMessage />
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        type="email" 
                                        placeholder="Faculty or Sub-Admin Email" 
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
                </div>
            </Card>
        </div>
    );
}

    

    