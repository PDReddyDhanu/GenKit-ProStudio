
"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import type { SupportTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, AlertTriangle, Wand2, Loader } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { generateSupportResponse } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { marked } from 'marked';
import { ScrollArea } from '@/components/ui/scroll-area';

const TicketCard = ({ ticket, onUpdateStatus }: { ticket: SupportTicket, onUpdateStatus: (ticketId: string, status: SupportTicket['status']) => void }) => {
    const priorityColors: Record<SupportTicket['priority'], string> = {
        'Low': 'bg-green-500/20 text-green-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'High': 'bg-red-500/20 text-red-300',
    };
    
    const [isHelpLoading, setIsHelpLoading] = useState(false);
    const [helpResponse, setHelpResponse] = useState<string | null>(null);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

    const handleGetHelp = async () => {
        setIsHelpLoading(true);
        setHelpResponse(null);
        try {
            const result = await generateSupportResponse({
                subject: ticket.subject,
                question: ticket.question,
                category: ticket.category,
            });
            if (result) {
                setHelpResponse(result.resolution);
                setIsHelpDialogOpen(true);
            }
        } catch (error) {
            console.error("Failed to get AI help:", error);
            setHelpResponse("Sorry, couldn't get a suggestion at this time.");
            setIsHelpDialogOpen(true);
        } finally {
            setIsHelpLoading(false);
        }
    };


    return (
        <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
            <Card className="mb-4">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-headline">{ticket.subject}</CardTitle>
                        <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                        From: {ticket.studentName} on {format(new Date(ticket.submittedAt), 'PPP')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground mb-4">{ticket.question}</p>
                    
                    <div className="bg-muted/50 p-3 rounded-md space-y-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">AI Triage</p>
                        <p className="text-sm"><strong className="text-foreground">Category:</strong> <Badge variant="secondary">{ticket.category}</Badge></p>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Suggested First Response:</p>
                            <p className="text-sm italic text-muted-foreground p-2 border-l-2 border-primary ml-2">"{ticket.suggestedResponse}"</p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                             <p className="text-sm font-semibold">Status:</p>
                            <Select value={ticket.status} onValueChange={(value) => onUpdateStatus(ticket.id, value as SupportTicket['status'])}>
                                <SelectTrigger className="w-[150px] h-9">
                                    <SelectValue placeholder="Set status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleGetHelp} disabled={isHelpLoading}>
                           {isHelpLoading ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />} Get AI Help
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>AI-Powered Resolution for: "{ticket.subject}"</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-6">
                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: marked(helpResponse || '') as string }}
                    />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default function SupportDashboard() {
    const { state, api } = useHackathon();
    const { supportTickets } = state;

    const sortedTickets = useMemo(() => {
        return [...supportTickets].sort((a, b) => b.submittedAt - a.submittedAt);
    }, [supportTickets]);

    const ticketsByStatus = useMemo(() => {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const seventyTwoHours = 72 * 60 * 60 * 1000;

        const categorized = {
            New: [] as SupportTicket[],
            'In Progress': [] as SupportTicket[],
            Resolved: [] as SupportTicket[],
        };

        sortedTickets.forEach(ticket => {
            const age = now - ticket.submittedAt;
            let effectiveStatus = ticket.status;

            if (ticket.status === 'New' && age > seventyTwoHours) {
                effectiveStatus = 'Resolved';
            } else if (ticket.status === 'New' && age > twentyFourHours) {
                effectiveStatus = 'In Progress';
            } else if (ticket.status === 'In Progress' && age > seventyTwoHours) {
                 effectiveStatus = 'Resolved';
            }
            
            // This is a bit tricky. We want to show the ticket in its *current* state
            // but also allow the admin to see where it *should* be. 
            // For this implementation, we will just use its saved status.
            // The automatic update logic is better handled by a backend cron job, 
            // but this is a client-side simulation. Let's just categorize by DB status.
            categorized[ticket.status].push(ticket);

        });
        
        return categorized;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {(['New', 'In Progress', 'Resolved'] as const).map(status => (
                <div key={status} className="space-y-4">
                    <h2 className="text-xl font-bold font-headline">{status} ({ticketsByStatus[status].length})</h2>
                    <ScrollArea className="h-[calc(100vh-20rem)] bg-muted/30 p-2 rounded-lg">
                        {ticketsByStatus[status].length > 0 ? (
                            ticketsByStatus[status].map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={handleUpdateStatus} />
                            ))
                        ) : (
                             <div className="flex items-center justify-center h-48 text-muted-foreground">
                                <p>No tickets in this category.</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
}
