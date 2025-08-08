"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminDashboard from './_components/AdminDashboard';
import { AuthMessage } from '@/components/AuthMessage';

export default function AdminPortal() {
    const { state, dispatch } = useHackathon();
    const { currentAdmin } = state;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'ADMIN_LOGIN', payload: { email, password } });
    };

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

    return <AdminDashboard />;
}
