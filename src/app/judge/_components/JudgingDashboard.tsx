
"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScoringDashboard from './ScoringDashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function JudgingDashboard() {
    const { state, dispatch } = useHackathon();
    const { hackathons, selectedHackathonId } = state;

    const handleHackathonChange = (hackathonId: string) => {
        dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId === 'default' ? null : hackathonId });
    }

    const currentHackathon = useMemo(() => {
        return hackathons.find(h => h.id === selectedHackathonId);
    }, [hackathons, selectedHackathonId]);

    return (
        <div className="animate-slide-in-up container max-w-7xl mx-auto py-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Judge Dashboard: <span className="text-secondary">{state.selectedCollege}</span></h1>
                <div>
                     <Select onValueChange={handleHackathonChange} value={selectedHackathonId || "default"}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a Hackathon to Judge" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="default">Default View</SelectItem>
                            {hackathons.map(h => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <AuthMessage />
            
             <Tabs defaultValue="judging" className="w-full">
                <TabsList className="grid w-full grid-cols-1 h-auto md:h-10">
                    <TabsTrigger value="judging">Project Scoring</TabsTrigger>
                </TabsList>
                <TabsContent value="judging" className="mt-6">
                    {currentHackathon ? <ScoringDashboard hackathon={currentHackathon} /> : <p className="text-center text-muted-foreground">Please select a hackathon to start judging.</p>}
                </TabsContent>
            </Tabs>
        </div>
    );
}
