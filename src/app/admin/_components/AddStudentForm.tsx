"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AddStudentForm() {
    const { dispatch } = useHackathon();
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentPassword, setStudentPassword] = useState('');

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'ADMIN_REGISTER_STUDENT', payload: { name: studentName, email: studentEmail, password: studentPassword } });
        setStudentName('');
        setStudentEmail('');
        setStudentPassword('');
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
                        <Input id="student-name" value={studentName} onChange={e => setStudentName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-email">Student Email</Label>
                        <Input id="student-email" type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-password">Password</Label>
                        <Input id="student-password" type="password" value={studentPassword} onChange={e => setStudentPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Register Student</Button>
                </form>
            </CardContent>
        </Card>
    );
}
