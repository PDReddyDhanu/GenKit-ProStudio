
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Trophy } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentHomeDashboard() {
    const { state, dispatch } = useHackathon();
    const { hackathons, currentUser } = state;

    const handleSelectHackathon = (hackathonId: string) => {
        if (currentUser) {
            dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId });
        }
    };

    return (
        <div className="container max-w-5xl mx-auto space-y-8">
            <div className="text-center mb-12">
                <Trophy className="h-12 w-12 mx-auto text-primary animate-trophy-shine" />
                <h1 className="text-4xl font-bold font-headline mt-4">Welcome, {currentUser?.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground text-lg">Here are the hackathons available at {state.selectedCollege}.</p>
            </div>
            
            {hackathons.length === 0 ? (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">No Active Hackathons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-8">There are no hackathons scheduled for your college right now. Please check back later!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hackathons.map(hackathon => (
                        <Card key={hackathon.id} className="flex flex-col transform-gpu transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-headline text-primary text-xl">{hackathon.name}</CardTitle>
                                <CardDescription>Deadline: {format(new Date(hackathon.deadline), 'PPP')}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <p><strong className="text-muted-foreground">Prize:</strong> {hackathon.prizeMoney}</p>
                                <p><strong className="text-muted-foreground">Team Size:</strong> Up to {hackathon.teamSizeLimit} members</p>
                            </CardContent>
                            <div className="p-6 pt-0">
                               <Button className="w-full" onClick={() => handleSelectHackathon(hackathon.id)}>
                                    <Rocket className="mr-2 h-4 w-4" /> Go to Hackathon
                               </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
