"use client";

import React, { useState, useEffect } from 'react';
import { postAnnouncement, getAnnouncements } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Rss } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Announcement {
    id: string;
    message: string;
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
}

export default function Announcements() {
    const [message, setMessage] = useState('');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setIsFetching(true);
            const data = await getAnnouncements();
            setAnnouncements(data as Announcement[]);
            setIsFetching(false);
        };
        fetchAnnouncements();
    }, []);

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        const result = await postAnnouncement(message);
        if (result.success) {
            toast({ title: 'Success', description: 'Announcement posted successfully.' });
            setMessage('');
            // Refresh announcements
            const data = await getAnnouncements();
            setAnnouncements(data as Announcement[]);
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
        setIsLoading(false);
    };

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
                    {isFetching ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader className="animate-spin text-primary" />
                        </div>
                    ) : announcements.length > 0 ? (
                        <ul className="space-y-4 h-96 overflow-y-auto pr-2">
                            {announcements.map(ann => (
                                <li key={ann.id} className="p-3 bg-muted/50 rounded-md">
                                    <p className="text-sm text-foreground">{ann.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(new Date(ann.timestamp.seconds * 1000), { addSuffix: true })}
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
