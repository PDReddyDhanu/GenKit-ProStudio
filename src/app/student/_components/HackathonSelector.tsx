
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function HackathonSelector() {
    const { state, dispatch } = useHackathon();
    const { hackathons, currentUser } = state;
    const { toast } = useToast();

    const handleSelectHackathon = (hackathonId: string) => {
        if (currentUser) {
            dispatch({ type: 'SET_SELECTED_HACKATHON', payload: hackathonId });
        } else {
            toast({
                title: "Login Required",
                description: "You must be logged in as a student to join a hackathon.",
                variant: "destructive",
            });
        }
    };

    if (hackathons.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">No Active Hackathons</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">There are no hackathons scheduled for your college right now. Please check back later!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="container max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">Select a Hackathon</h1>
                <p className="text-muted-foreground">Choose an event to join and start competing.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hackathons.map(hackathon => (
                    <Card key={hackathon.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline text-primary">{hackathon.name}</CardTitle>
                            <CardDescription>Deadline: {format(new Date(hackathon.deadline), 'PPP')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p><strong className="text-muted-foreground">Prize:</strong> {hackathon.prizeMoney}</p>
                            <p><strong className="text-muted-foreground">Team Size:</strong> Up to {hackathon.teamSizeLimit} members</p>
                             <div className="pt-2">
                                 <h4 className="font-semibold mb-1">Rules:</h4>
                                <p className="text-sm whitespace-pre-wrap">{hackathon.rules}</p>
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                           <Button className="w-full" onClick={() => handleSelectHackathon(hackathon.id)}>
                                <Rocket className="mr-2 h-4 w-4" /> Join Hackathon
                           </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
