
"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LifeBuoy, ArrowLeft, Circle, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, formatDistanceToNow } from 'date-fns';
import { marked } from 'marked';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { SupportTicket } from '@/lib/types';
import Link from 'next/link';

const TicketItem = ({ ticket }: { ticket: SupportTicket }) => {
    const [statusInfo, setStatusInfo] = useState<{ text: string, icon: JSX.Element, color: string } | null>(null);

    useEffect(() => {
        const getStatus = () => {
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
                    return { text: 'New', icon: <Circle className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
                case 'In Progress':
                    return { text: 'In Progress', icon: <Clock className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-500' };
                case 'Resolved':
                    return { text: 'Resolved', icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'text-green-500' };
                default:
                    return { text: 'Unknown', icon: <Circle className="h-4 w-4 text-gray-500" />, color: 'text-gray-500' };
            }
        };
        setStatusInfo(getStatus());
    }, [ticket]);

    if (!statusInfo) return null;

    return (
        <AccordionItem value={ticket.id}>
            <AccordionTrigger>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full text-left sm:pr-4">
                    <span className="font-semibold">{ticket.subject}</span>
                    <div className={`flex items-center gap-2 text-sm ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.text}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4">
                    <div className="text-xs text-muted-foreground">
                        <p>Ticket ID: <span className="font-mono">{ticket.id}</span></p>
                        <p>Submitted: {format(new Date(ticket.submittedAt), "PPP p")}</p>
                        <p>Category: <Badge variant="secondary">{ticket.category}</Badge></p>
                    </div>
                    <ScrollArea className="h-80 bg-muted/50 p-4 rounded-lg">
                        <div className="space-y-6">
                             <div className="flex gap-3">
                                <div className="font-bold">You:</div>
                                <div className="flex-1 p-3 bg-background rounded-md">
                                    <p className="text-sm">{ticket.question}</p>
                                    <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(ticket.submittedAt), { addSuffix: true })}</p>
                                </div>
                            </div>
                            {ticket.responses?.map(res => (
                                 <div key={res.id} className="flex gap-3">
                                    <div className="font-bold text-primary">{res.adminName}:</div>
                                    <div className="flex-1 p-3 bg-background rounded-md border-primary border">
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: marked(res.message) as string }}
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(res.timestamp), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default function MyTicketsPage() {
    const { state } = useHackathon();
    const { currentUser, supportTickets } = state;
    const router = useRouter();

    const myTickets = useMemo(() => {
        if (!currentUser) return [];
        return supportTickets
            .filter(t => t.studentId === currentUser.id)
            .sort((a, b) => b.submittedAt - a.submittedAt);
    }, [supportTickets, currentUser]);

    if (!currentUser) {
        return (
             <div className="container max-w-md mx-auto py-12">
                 <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You must be logged in to view your support tickets.</p>
                        <Button asChild className="mt-4"><Link href="/support">Go to Support</Link></Button>
                    </CardContent>
                 </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl mx-auto py-12">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Support
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">My Support Tickets</CardTitle>
                    <CardDescription>A complete history of your communication with the admin team.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myTickets.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {myTickets.map(ticket => (
                                <TicketItem key={ticket.id} ticket={ticket} />
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <LifeBuoy className="h-12 w-12 mx-auto" />
                            <p className="mt-4">You haven't submitted any support tickets yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
