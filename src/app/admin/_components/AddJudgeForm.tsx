
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from 'lucide-react';

export default function AddJudgeForm() {
    const { api } = useHackathon();
    const [judgeName, setJudgeName] = useState('');
    const [judgeEmail, setJudgeEmail] = useState('');
    const [judgePassword, setJudgePassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAddJudge = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.addJudge({ 
                name: judgeName, 
                email: judgeEmail, 
                password: judgePassword,
                gender: '',
                contactNumber: '',
                bio: ''
            });
            setJudgeName('');
            setJudgeEmail('');
            setJudgePassword('');
        } finally {
            setIsLoading(false);
        }
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
                        <Input id="judge-name" value={judgeName} onChange={e => setJudgeName(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="judge-email">Judge Email</Label>
                        <Input id="judge-email" type="email" placeholder="name@judge.com" value={judgeEmail} onChange={e => setJudgeEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="judge-password">Temporary Password</Label>
                        <Input id="judge-password" type="password" value={judgePassword} onChange={e => setJudgePassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Adding...</> : 'Add Judge'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
