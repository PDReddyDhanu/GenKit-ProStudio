
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import Auth from './_components/Auth';
import Dashboard from './_components/Dashboard';
import PageIntro from '@/components/PageIntro';
import { Code, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentPortal() {
    const { state, dispatch } = useHackathon();
    const { currentUser, hackathons, selectedHackathonId } = state;
    const [showIntro, setShowIntro] = useState(true);

    const handleHackathonChange = (hackathonId: string) => {
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId });
    }

    if (showIntro && !currentUser) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Code className="w-full h-full" />} title="Student Portal" description="Register, login, and start your hackathon journey." />;
    }
    
    if (showIntro && currentUser) {
        // Don't show intro if already logged in, go straight to dashboard
        setShowIntro(false);
    }

    if (!currentUser) {
        return <Auth />;
    }

    return (
        <div className="container max-w-7xl mx-auto py-12">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-4xl font-bold font-headline">Student Dashboard</h1>
                <div>
                     <Select onValueChange={handleHackathonChange} value={selectedHackathonId || ""}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a Hackathon" />
                        </SelectTrigger>
                        <SelectContent>
                            {hackathons.map(h => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Dashboard />
        </div>
    )
}
