
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function StudentHomeDashboard() {
    const { state, dispatch } = useHackathon();
    const { hackathons, currentUser } = state;
    const { toast } = useToast();

    const handleSelectEvent = (hackathonId: string) => {
        if (currentUser) {
            dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId });
        } else {
            toast({
                title: "Login Required",
                description: "You must be logged in as a student to join an event.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container max-w-5xl mx-auto space-y-8">
            <div className="text-center mb-12">
                <Trophy className="h-12 w-12 mx-auto text-primary animate-trophy-shine" />
                <h1 className="text-4xl font-bold font-headline mt-4">Welcome, {currentUser?.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground text-lg">Here are the project events available at {state.selectedCollege}.</p>
            </div>
            
            {hackathons.length === 0 ? (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">No Active Project Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center py-8">There are no project events scheduled for your college right now. Please check back later!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hackathons.map(event => (
                        <Card key={event.id} className="flex flex-col transform-gpu transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-headline text-primary text-xl">{event.name}</CardTitle>
                                <CardDescription>Deadline: {format(new Date(event.deadline), 'PPP')}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <p><strong className="text-muted-foreground">Prize/Award:</strong> {event.prizeMoney}</p>
                                <p><strong className="text-muted-foreground">Team Size:</strong> Up to {event.teamSizeLimit} members</p>
                            </CardContent>
                            <div className="p-6 pt-0">
                               <Button className="w-full" onClick={() => handleSelectEvent(event.id)}>
                                    <Rocket className="mr-2 h-4 w-4" /> Go to Event
                               </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
