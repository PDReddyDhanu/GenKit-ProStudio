
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, User } from 'lucide-react';
import Link from 'next/link';

export default function CompleteProfilePrompt() {
    return (
        <Card className="border-yellow-500 bg-yellow-500/10 animate-fade-in">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-yellow-400">
                    <AlertTriangle /> Action Required: Complete Your Profile
                </CardTitle>
                <CardDescription className="text-yellow-200/80">
                    You must complete your profile before you can create or join a team.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-4">
                    Providing your **Roll Number**, **Admission Year**, **Skills**, and preferred **Work Style** is essential for our AI Teammate Matchmaker to find you the best possible collaborators. It only takes a minute!
                </p>
                <Button asChild>
                    <Link href="/profile">
                        <User className="mr-2 h-4 w-4" /> Go to Profile
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
