
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from 'lucide-react';

export default function Auth() {
    const { api, dispatch } = useHackathon();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.registerStudent({ name, email, password });
            setName('');
            setEmail('');
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginStudent({ email, password });
        } finally {
            setIsLoading(false);
        }
    }

    const onTabChange = () => {
        dispatch({ type: 'CLEAR_MESSAGES' });
        setName('');
        setEmail('');
        setPassword('');
    }

    return (
        <div className="container max-w-md mx-auto py-12 animate-fade-in">
             <Tabs defaultValue="register" className="w-full" onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="register">Register</TabsTrigger>
                    <TabsTrigger value="login">Login</TabsTrigger>
                </TabsList>
                <AuthMessage />
                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-bold text-center font-headline">Student Registration</h2>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Registering...</> : 'Register'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="login">
                     <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-bold text-center font-headline">Student Login</h2>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email Address</Label>
                                    <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
