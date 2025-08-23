"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@/lib/types';

export default function Auth() {
    const { dispatch, state } = useHackathon();
    const { users } = state;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'REGISTER_STUDENT', payload: { name, email, password } });
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            if (user.status === 'pending') {
                dispatch({ type: 'SET_AUTH_ERROR', payload: 'Your account is pending approval by an admin.' });
            } else {
                dispatch({ type: 'LOGIN_STUDENT', payload: user as User });
            }
        } else {
            dispatch({ type: 'SET_AUTH_ERROR', payload: 'Invalid email or password.' });
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
                                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full">Register</Button>
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
                                    <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full">Login</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
