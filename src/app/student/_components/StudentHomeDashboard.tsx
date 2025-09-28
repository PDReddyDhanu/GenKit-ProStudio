
"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Trophy, Briefcase, Bot, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const projectEvents = [
    {
        id: 'real-time-project',
        name: 'Real-Time Project',
        description: 'For 2nd Year, 2nd Sem Students',
        icon: <Bot className="w-8 h-8" />
    },
    {
        id: 'mini-project',
        name: 'Mini Project',
        description: 'For 3rd Year, 2nd Sem Students',
        icon: <Code className="w-8 h-8" />
    },
    {
        id: 'major-project',
        name: 'Major Project',
        description: 'For 4th Year, 1st & 2nd Sem Students',
        icon: <Briefcase className="w-8 h-8" />
    },
    {
        id: 'other-project',
        name: 'Other Project',
        description: 'For all students with innovative ideas',
        icon: <Rocket className="w-8 h-8" />
    }
];

export default function StudentHomeDashboard() {
    const { state, dispatch } = useHackathon();
    const { currentUser } = state;
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
                <p className="text-muted-foreground text-lg">Select the type of project you are working on to begin.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectEvents.map(event => (
                    <Card key={event.id} className="flex flex-col transform-gpu transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                        <CardHeader className="flex-row items-center gap-4">
                            <div className="text-primary">{event.icon}</div>
                            <div>
                                <CardTitle className="font-headline text-primary text-xl">{event.name}</CardTitle>
                                <CardDescription>{event.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                           {/* Future content can go here */}
                        </CardContent>
                        <div className="p-6 pt-0">
                           <Button className="w-full" onClick={() => handleSelectEvent(event.id)}>
                                <Rocket className="mr-2 h-4 w-4" /> Select & Proceed
                           </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
