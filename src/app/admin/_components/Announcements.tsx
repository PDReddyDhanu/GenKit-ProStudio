
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader, Rss, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { Announcement } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AnnouncementForm({ announcement, onFinished }: { announcement?: Announcement, onFinished: () => void }) {
    const { api } = useHackathon();
    const [message, setMessage] = useState(announcement?.message || '');
    const [publishAt, setPublishAt] = useState<Date | undefined>(announcement?.publishAt ? new Date(announcement.publishAt) : undefined);
    const [expiresAt, setExpiresAt] = useState<Date | undefined>(announcement?.expiresAt ? new Date(announcement.expiresAt) : undefined);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        try {
            const data = {
                message,
                publishAt: publishAt?.getTime(),
                expiresAt: expiresAt?.getTime(),
            };

            if (announcement) {
                await api.updateAnnouncement(announcement.id, data);
            } else {
                await api.postAnnouncement(data);
            }
            onFinished();
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea 
                placeholder="Enter your announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="publish-date">Publish At (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !publishAt && "text-muted-foreground")} disabled={isLoading}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {publishAt ? format(publishAt, "PPP p") : <span>Pick a date & time</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={publishAt} onSelect={setPublishAt} initialFocus />
                             <div className="p-2 border-t border-border">
                                <Input type="time" defaultValue={publishAt ? format(publishAt, "HH:mm") : ""} onChange={(e) => {
                                    const [h, m] = e.target.value.split(':').map(Number);
                                    setPublishAt(d => { const newDate = d ? new Date(d) : new Date(); newDate.setHours(h, m); return newDate; });
                                }}/>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="expires-date">Expires At (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiresAt && "text-muted-foreground")} disabled={isLoading}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expiresAt ? format(expiresAt, "PPP p") : <span>Pick a date & time</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={expiresAt} onSelect={setExpiresAt} initialFocus />
                             <div className="p-2 border-t border-border">
                                <Input type="time" defaultValue={expiresAt ? format(expiresAt, "HH:mm") : ""} onChange={(e) => {
                                    const [h, m] = e.target.value.split(':').map(Number);
                                    setExpiresAt(d => { const newDate = d ? new Date(d) : new Date(); newDate.setHours(h, m); return newDate; });
                                }}/>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> {announcement ? 'Saving...' : 'Posting...'}</> : (announcement ? 'Save Changes' : 'Post Announcement')}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function Announcements() {
    const { state, api } = useHackathon();
    const { announcements } = state;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    const sortedAnnouncements = useMemo(() => {
        return [...announcements].sort((a, b) => (b.publishAt || b.timestamp) - (a.publishAt || a.timestamp));
    }, [announcements]);

    const getStatus = (ann: Announcement) => {
        const now = Date.now();
        if (ann.expiresAt && ann.expiresAt < now) return { text: 'Expired', color: 'text-red-400' };
        if (ann.publishAt && ann.publishAt > now) return { text: `Scheduled`, color: 'text-yellow-400' };
        return { text: 'Active', color: 'text-green-400' };
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>Post a New Announcement</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Announcement</DialogTitle>
                            <DialogDescription>This message will be broadcast to all participants.</DialogDescription>
                        </DialogHeader>
                        <AnnouncementForm onFinished={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Announcement Management</CardTitle>
                    <CardDescription>A log of all past and scheduled announcements.</CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedAnnouncements.length > 0 ? (
                        <ul className="space-y-4">
                            {sortedAnnouncements.map(ann => {
                                const status = getStatus(ann);
                                return (
                                    <li key={ann.id} className="p-4 bg-muted/50 rounded-md flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                        <div className="flex-grow">
                                            <p className="text-sm text-foreground">{ann.message}</p>
                                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                                <p><strong className={status.color}>{status.text}</strong></p>
                                                {ann.publishAt && <p>Published: {format(new Date(ann.publishAt), 'PPP p')}</p>}
                                                {ann.expiresAt && <p>Expires: {format(new Date(ann.expiresAt), 'PPP p')}</p>}
                                                <p>Created: {formatDistanceToNow(new Date(ann.timestamp), { addSuffix: true })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingAnnouncement(ann)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the announcement.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => api.deleteAnnouncement(ann.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <Rss className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No announcements have been posted yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {editingAnnouncement && (
                 <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && setEditingAnnouncement(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Announcement</DialogTitle>
                        </DialogHeader>
                        <AnnouncementForm 
                            announcement={editingAnnouncement} 
                            onFinished={() => setEditingAnnouncement(null)} 
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
