
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, BrainCircuit, Search } from 'lucide-react';
import { COLLEGES } from '@/lib/colleges';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CollegeLogin() {
    const { dispatch } = useHackathon();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollege, setSelectedCollege] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const filteredColleges = useMemo(() => {
        if (!searchQuery) return [];
        const uniqueColleges = new Set(COLLEGES.filter(college =>
            college.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        return Array.from(uniqueColleges).slice(0, 100);
    }, [searchQuery]);

    const handleProceed = () => {
        if (!selectedCollege) return;
        dispatch({ type: 'SET_SELECTED_COLLEGE', payload: selectedCollege });
    };

    const handleSelectCollege = (college: string) => {
        setSelectedCollege(college);
        setSearchQuery(college);
        setIsFocused(false);
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-fade-in">
            <div className="text-center mb-8">
                <BrainCircuit className="h-16 w-16 mx-auto mb-4 text-primary animate-trophy-shine" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--primary)))' }}/>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent font-headline">
                    GenKit ProStudio
                </h1>
                <p className="text-muted-foreground mt-2">The AI-Powered College Project Management Hub</p>
            </div>

            <Card className="w-full max-w-lg mx-auto animate-slide-in-up">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Building2 className="text-primary" /> Find Your College
                    </CardTitle>
                    <CardDescription>Search for your college to enter the project portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Start typing your college name..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedCollege('');
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                                className="pl-10"
                            />
                        </div>

                        {isFocused && filteredColleges.length > 0 && (
                            <Card className="absolute top-full mt-2 w-full z-10 shadow-lg">
                                <ScrollArea className="h-72">
                                    <div className="p-2">
                                    {filteredColleges.map((college, index) => (
                                        <div
                                            key={`${college}-${index}`}
                                            onMouseDown={() => handleSelectCollege(college)}
                                            className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm"
                                        >
                                            {college}
                                        </div>
                                    ))}
                                    </div>
                                </ScrollArea>
                            </Card>
                        )}

                        <Button onClick={handleProceed} className="w-full" disabled={!selectedCollege}>
                            Proceed
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
                <p>&copy; 2025 GenKit ProStudio. All rights reserved.</p>
            </footer>
        </div>
    );
}
