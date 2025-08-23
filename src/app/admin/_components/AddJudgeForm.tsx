"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AddJudgeForm() {
    const { dispatch } = useHackathon();
    const [judgeName, setJudgeName] = useState('');
    const [judgeEmail, setJudgeEmail] = useState('');
    const [judgePassword, setJudgePassword] = useState('');
    
    const handleAddJudge = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'ADD_JUDGE', payload: { name: judgeName, email: judgeEmail, password: judgePassword } });
        setJudgeName('');
        setJudgeEmail('');
        setJudgePassword('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Add New Judge</CardTitle>
                <CardDescription>Create an account for a new judge.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddJudge} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="judge-name">Judge Name</Label>
                        <Input id="judge-name" value={judgeName} onChange={e => setJudgeName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="judge-email">Judge Email</Label>
                        <Input id="judge-email" type="email" placeholder="name@judge.com" value={judgeEmail} onChange={e => setJudgeEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="judge-password">Password</Label>
                        <Input id="judge-password" type="password" value={judgePassword} onChange={e => setJudgePassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Add Judge</Button>
                </form>
            </CardContent>
        </Card>
    );
}
