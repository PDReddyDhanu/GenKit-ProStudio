
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Trophy } from 'lucide-react';
import { COLLEGES } from '@/lib/colleges';

export default function CollegeLogin() {
    const { dispatch } = useHackathon();
    const [selectedCollege, setSelectedCollege] = useState('');
    const [error, setError] = useState('');

    const handleProceed = () => {
        if (!selectedCollege) {
            setError('Please select a college to continue.');
            return;
        }
        setError('');
        dispatch({ type: 'SELECT_COLLEGE', payload: selectedCollege });
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-fade-in">
            <div className="text-center mb-8">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-primary animate-trophy-shine" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--primary)))' }}/>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent font-headline">
                    HackSprint
                </h1>
                <p className="text-muted-foreground mt-2">Your All-in-One Hackathon Platform</p>
            </div>

            <Card className="w-full max-w-md mx-auto animate-slide-in-up">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Building2 className="text-primary" /> Select Your College
                    </CardTitle>
                    <CardDescription>Choose your college to enter the hackathon portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Select onValueChange={setSelectedCollege} value={selectedCollege}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a college..." />
                            </SelectTrigger>
                            <SelectContent>
                                {COLLEGES.map(college => (
                                    <SelectItem key={college} value={college}>
                                        {college}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button onClick={handleProceed} className="w-full">
                            Proceed to Hackathon
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
                <p>&copy; 2025 HackSprint. (Dhanunjay Reddy) All rights reserved.</p>
            </footer>
        </div>
    );
}
