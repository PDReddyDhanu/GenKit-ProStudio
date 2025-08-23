"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Rss } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Announcement } from '@/lib/types';

export default function Announcements() {
    const { state, dispatch } = useHackathon();
    const { announcements } = state;
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePostAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        dispatch({ type: 'POST_ANNOUNCEMENT', payload: message });
        setMessage('');
        setIsLoading(false);
    };

    const sortedAnnouncements = [...announcements].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Post a New Announcement</CardTitle>
                    <CardDescription>This message will be broadcast to all participants.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePostAnnouncement} className="space-y-4">
                        <Textarea 
                            placeholder="Enter your announcement here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Posting...</> : 'Post Announcement'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Announcements</CardTitle>
                    <CardDescription>A log of all past announcements.</CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedAnnouncements.length > 0 ? (
                        <ul className="space-y-4 h-96 overflow-y-auto pr-2">
                            {sortedAnnouncements.map(ann => (
                                <li key={ann.id} className="p-3 bg-muted/50 rounded-md">
                                    <p className="text-sm text-foreground">{ann.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(new Date(ann.timestamp), { addSuffix: true })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <Rss className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No announcements have been posted yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
