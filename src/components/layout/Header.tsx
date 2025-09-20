
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Trophy, Rss, LogOut, Building2, UserCircle, Bell, Lightbulb, GalleryVertical, Users, TrendingUp, Handshake, LifeBuoy, Moon, Sun } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import Link from 'next/link';
import Dock, { DockItemData } from '@/components/ui/Dock';

export function Header() {
    const { state, api, dispatch } = useHackathon();
    const { announcements, currentUser, currentJudge, currentAdmin } = state;
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);

    const activeAnnouncements = useMemo(() => {
        const now = Date.now();
        return announcements
            .filter(ann => {
                const isPublished = ann.publishAt ? ann.publishAt <= now : true;
                const isNotExpired = ann.expiresAt ? ann.expiresAt > now : true;
                return isPublished && isNotExpired;
            })
            .sort((a, b) => (b.publishAt || b.timestamp) - (a.publishAt || a.timestamp));
    }, [announcements]);
    
    const unreadNotifications = useMemo(() => {
        return currentUser?.notifications?.filter(n => !n.isRead) || [];
    }, [currentUser?.notifications]);

    useEffect(() => {
        const lastViewed = localStorage.getItem('lastViewedAnnouncement');
        if (activeAnnouncements.length > 0 && activeAnnouncements[0].id !== lastViewed) {
            setHasUnreadAnnouncements(true);
        }
    }, [activeAnnouncements]);

    const handleLogout = async () => {
        await api.signOut();
        router.push('/');
    };

    const handleChangeCollege = () => {
        dispatch({ type: 'SET_SELECTED_COLLEGE', payload: null });
        localStorage.removeItem('selectedCollege');
        router.push('/');
    }
    
    const handleAnnouncementsOpen = () => {
        setHasUnreadAnnouncements(false);
        if (activeAnnouncements.length > 0) {
            localStorage.setItem('lastViewedAnnouncement', activeAnnouncements[0].id);
        }
        setIsAnnouncementsOpen(true);
    };

    const handleNotificationsOpen = async () => {
        if (unreadNotifications.length > 0 && currentUser) {
            const ids = unreadNotifications.map(n => n.id);
            await api.markNotificationsAsRead(currentUser.id, ids);
        }
        setIsNotificationsOpen(true);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };
    
    const loggedInUser = currentUser || currentJudge || currentAdmin;
    const sortedNotifications = useMemo(() => {
        return [...(currentUser?.notifications || [])].sort((a, b) => b.timestamp - a.timestamp);
    }, [currentUser?.notifications]);

    const dockItems: DockItemData[] = [
        { icon: <Trophy size={24} />, label: 'Home', onClick: () => router.push('/') },
        { icon: <Lightbulb size={24} />, label: 'Guidance', onClick: () => router.push('/guidance') },
        { icon: <GalleryVertical size={24} />, label: 'Gallery', onClick: () => router.push('/gallery') },
        { icon: <Users size={24} />, label: 'Teams', onClick: () => router.push('/teams') },
        { icon: <TrendingUp size={24} />, label: 'Leaderboard', onClick: () => router.push('/leaderboard') },
        { icon: <Trophy size={24} />, label: 'Results', onClick: () => router.push('/results') },
        { icon: <Handshake size={24} />, label: 'Partners', onClick: () => router.push('/partners') },
        { icon: <LifeBuoy size={24} />, label: 'Support', onClick: () => router.push('/support') },
    ];

    const actionItems: DockItemData[] = [
        {
            icon: <div className="relative"><Rss size={24} />{hasUnreadAnnouncements && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />}</div>,
            label: 'Announcements',
            onClick: handleAnnouncementsOpen,
        },
    ];

    if (currentUser) {
        actionItems.push({
            icon: <div className="relative"><Bell size={24} />{unreadNotifications.length > 0 && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />}</div>,
            label: 'Notifications',
            onClick: handleNotificationsOpen,
        });
    }

    actionItems.push({
        icon: theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />,
        label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
        onClick: toggleTheme,
    });
    
    if (loggedInUser) {
        actionItems.push({
            icon: <UserCircle size={24} />,
            label: 'Profile',
            onClick: () => router.push('/profile'),
        });
        actionItems.push({
            icon: <LogOut size={24} />,
            label: 'Logout',
            onClick: handleLogout,
        });
    } else {
        actionItems.push({
            icon: <Building2 size={24} />,
            label: 'Change College',
            onClick: handleChangeCollege,
        });
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm">
                <div className="container flex h-14 items-center justify-between">
                    <div className="flex items-center">
                         <Link href="/" className="flex items-center gap-2">
                             <Trophy className="h-6 w-6 text-primary" />
                             <span className="font-bold font-headline">HackSprint</span>
                         </Link>
                    </div>
                     <nav className="flex-1 flex justify-center">
                        <Dock items={[...dockItems, ...actionItems]} panelHeight={68} baseItemSize={40} magnification={60} />
                    </nav>
                     <div className="w-[120px]"></div>
                </div>
            </header>

            {/* Sheets for Announcements and Notifications */}
            <Sheet open={isAnnouncementsOpen} onOpenChange={setIsAnnouncementsOpen}>
                <SheetContent className="w-full sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>Announcements</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                        {activeAnnouncements.length > 0 ? activeAnnouncements.map(ann => (
                            <div key={ann.id} className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-foreground">{ann.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(ann.publishAt || ann.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        )) : <p className="text-muted-foreground text-center pt-8">No announcements yet.</p>}
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <SheetContent className="w-full sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>Notifications</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-2">
                        {sortedNotifications.length > 0 ? (
                            sortedNotifications.slice(0, 10).map(n => (
                                <Link key={n.id} href={n.link} className={`block p-3 rounded-md ${!n.isRead ? 'bg-muted' : ''}`} onClick={() => setIsNotificationsOpen(false)}>
                                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                                </Link>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center pt-8">No notifications yet.</p>
                        )}
                         <div className="text-center pt-4">
                            <Button variant="link" asChild onClick={() => setIsNotificationsOpen(false)}>
                                <Link href="/support/tickets">View All Tickets</Link>
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};
