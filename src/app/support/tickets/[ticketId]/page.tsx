
"use client";

// This is a redirect component.
// It exists so that clicking a notification link like /support/tickets/xyz
// will land the user on the main ticket history page and open the correct ticket.

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TicketRedirectPage() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const ticketId = params.ticketId;
        if (ticketId) {
            // Use replace to not add the redirect URL to the browser history
            router.replace(`/support/tickets?open=${ticketId}`);
        } else {
            router.replace('/support/tickets');
        }
    }, [params.ticketId, router]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <p className="text-muted-foreground">Redirecting to your ticket...</p>
        </div>
    );
}
