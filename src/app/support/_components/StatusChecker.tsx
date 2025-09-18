
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Search, Ticket, Circle, CheckCircle, Clock } from 'lucide-react';
import type { SupportTicket } from '@/lib/types';
import { format } from 'date-fns';

const getStatusInfo = (ticket: SupportTicket) => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const seventyTwoHours = 72 * 60 * 60 * 1000;
    const age = now - ticket.submittedAt;

    let effectiveStatus = ticket.status;
    
    if (ticket.status === 'New' && age > seventyTwoHours) effectiveStatus = 'Resolved';
    else if (ticket.status === 'New' && age > twentyFourHours) effectiveStatus = 'In Progress';
    else if (ticket.status === 'In Progress' && age > seventyTwoHours) effectiveStatus = 'Resolved';
    
    switch(effectiveStatus) {
        case 'New':
            return { text: 'New', icon: <Circle className="h-5 w-5 text-blue-500" />, color: 'text-blue-500' };
        case 'In Progress':
            return { text: 'In Progress', icon: <Clock className="h-5 w-5 text-yellow-500" />, color: 'text-yellow-500' };
        case 'Resolved':
            return { text: 'Resolved', icon: <CheckCircle className="h-5 w-5 text-green-500" />, color: 'text-green-500' };
        default:
            return { text: 'Unknown', icon: <Circle className="h-5 w-5 text-gray-500" />, color: 'text-gray-500' };
    }
}

export default function StatusChecker() {
    const { state } = useHackathon();
    const { supportTickets } = state;

    const [ticketId, setTicketId] = useState('');
    const [searchedTicket, setSearchedTicket] = useState<SupportTicket | null | undefined>(undefined); // undefined: not searched, null: not found

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const foundTicket = supportTickets.find(t => t.id === ticketId.trim());
        setSearchedTicket(foundTicket || null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Check Ticket Status</CardTitle>
                <CardDescription>Enter your Ticket ID to see the latest update.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
                    <Input 
                        id="ticketId" 
                        value={ticketId} 
                        onChange={e => setTicketId(e.target.value)}
                        placeholder="Enter your ticket ID..."
                        required 
                    />
                    <Button type="submit" className="w-full sm:w-auto">
                        <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                </form>

                {searchedTicket === undefined && (
                    <div className="text-center text-muted-foreground py-8">
                        <Ticket className="h-10 w-10 mx-auto" />
                        <p className="mt-2">Your ticket status will appear here.</p>
                    </div>
                )}
                
                {searchedTicket === null && (
                     <div className="text-center text-destructive py-8">
                        <p>No ticket found with that ID. Please check the ID and try again.</p>
                    </div>
                )}

                {searchedTicket && (
                    <Card className="bg-muted/50 animate-fade-in">
                        <CardHeader>
                            <CardTitle className="text-lg">Status for Ticket #{searchedTicket.id.substring(0, 8)}...</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <p className="text-sm font-semibold text-muted-foreground">Status</p>
                                <div className={`flex items-center gap-2 font-bold text-lg ${getStatusInfo(searchedTicket).color}`}>
                                    {getStatusInfo(searchedTicket).icon}
                                    {getStatusInfo(searchedTicket).text}
                                </div>
                            </div>
                             <div>
                                <p className="text-sm font-semibold text-muted-foreground">Subject</p>
                                <p>{searchedTicket.subject}</p>
                            </div>
                             <div>
                                <p className="text-sm font-semibold text-muted-foreground">Submitted</p>
                                <p>{format(new Date(searchedTicket.submittedAt), "PPP p")}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground">Your Question</p>
                                <p className="text-muted-foreground italic">"{searchedTicket.question}"</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    )
}
