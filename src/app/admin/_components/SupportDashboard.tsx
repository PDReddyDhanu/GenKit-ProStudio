
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import type { SupportTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const TicketCard = ({ ticket, onUpdateStatus }: { ticket: SupportTicket, onUpdateStatus: (ticketId: string, status: SupportTicket['status']) => void }) => {
    const priorityColors: Record<SupportTicket['priority'], string> = {
        'Low': 'bg-green-500/20 text-green-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'High': 'bg-red-500/20 text-red-300',
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-headline">{ticket.subject}</CardTitle>
                    <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                </div>
                <CardDescription>
                    From: {ticket.studentName} ({ticket.studentEmail}) on {format(new Date(ticket.submittedAt), 'PPP')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground mb-4">{ticket.question}</p>
                
                <div className="bg-muted/50 p-3 rounded-md space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">AI Triage</p>
                    <p className="text-sm"><strong className="text-foreground">Category:</strong> <Badge variant="secondary">{ticket.category}</Badge></p>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Suggested Response:</p>
                        <p className="text-sm italic text-muted-foreground p-2 border-l-2 border-primary ml-2">"{ticket.suggestedResponse}"</p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                    <p className="text-sm font-semibold">Status:</p>
                    <Select value={ticket.status} onValueChange={(value) => onUpdateStatus(ticket.id, value as SupportTicket['status'])}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}

export default function SupportDashboard() {
    const { state, api } = useHackathon();
    const { supportTickets } = state;

    const sortedTickets = useMemo(() => {
        return [...supportTickets].sort((a, b) => b.submittedAt - a.submittedAt);
    }, [supportTickets]);

    const ticketsByStatus = useMemo(() => {
        return {
            New: sortedTickets.filter(t => t.status === 'New'),
            'In Progress': sortedTickets.filter(t => t.status === 'In Progress'),
            Resolved: sortedTickets.filter(t => t.status === 'Resolved'),
        }
    }, [sortedTickets]);
    
    const handleUpdateStatus = async (ticketId: string, status: SupportTicket['status']) => {
        try {
            await api.updateSupportTicketStatus(ticketId, status);
        } catch (error) {
            console.error("Failed to update ticket status:", error);
        }
    };

    if (supportTickets.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No support tickets have been submitted yet.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {(['New', 'In Progress', 'Resolved'] as const).map(status => (
                <div key={status} className="space-y-4">
                    <h2 className="text-xl font-bold font-headline">{status} ({ticketsByStatus[status].length})</h2>
                    <div className="bg-muted/30 p-2 rounded-lg min-h-[200px]">
                        {ticketsByStatus[status].map(ticket => (
                            <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={handleUpdateStatus} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
