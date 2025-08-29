
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from 'lucide-react';

export default function AddStudentForm() {
    const { api } = useHackathon();
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.registerAndApproveStudent({ name: studentName, email: studentEmail, password: studentPassword });
            setStudentName('');
            setStudentEmail('');
            setStudentPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Register New Student</CardTitle>
                <CardDescription>Directly register and approve a student.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="student-name">Student Name</Label>
                        <Input id="student-name" value={studentName} onChange={e => setStudentName(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-email">Student Email</Label>
                        <Input id="student-email" type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-password">Password</Label>
                        <Input id="student-password" type="password" value={studentPassword} onChange={e => setStudentPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Registering...</> : 'Register Student'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
