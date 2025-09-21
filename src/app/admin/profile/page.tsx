
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import ChangePasswordForm from './_components/ChangePasswordForm';
import { User, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminProfilePage() {
    const { state } = useHackathon();
    const { currentAdmin } = state;

    if (!currentAdmin) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Admin Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                         <p className="text-muted-foreground mb-4">You must be logged in as an admin to view this page.</p>
                         <AuthMessage />
                         <Button asChild>
                            <Link href="/admin">Go to Admin Login</Link>
                         </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 animate-fade-in">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                        <User className="h-8 w-8 text-primary"/>
                        Administrator Profile
                    </CardTitle>
                    <CardDescription>Manage your admin account settings.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
