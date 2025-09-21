

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Trophy, Rss, LogOut, Building2, UserCircle, Bell, Lightbulb, GalleryVertical, Users, TrendingUp, Handshake, LifeBuoy, Moon, Sun, Home, User, Scale, LayoutDashboard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes";
import Link from 'next/link';

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

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container flex h-14 max-w-screen-2xl items-center">
                     <div className="mr-4 hidden md:flex">
                         <Link href="/" className="flex items-center gap-2">
                             <Trophy className="h-6 w-6 text-primary" />
                             <span className="font-bold font-headline">HackSprint</span>
                         </Link>
                     </div>
                     <nav className="flex-1">
                         <ul className="flex items-center justify-center space-x-6 text-sm font-medium">
                            <li><Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Home className="h-4 w-4"/> Home</Link></li>
                            <li><Link href="/guidance" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Lightbulb className="h-4 w-4"/> Guidance</Link></li>
                            <li><Link href="/gallery" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><GalleryVertical className="h-4 w-4"/> Gallery</Link></li>
                            <li><Link href="/teams" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Users className="h-4 w-4"/> Teams</Link></li>
                            <li><Link href="/leaderboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><TrendingUp className="h-4 w-4"/> Leaderboard</Link></li>
                            <li><Link href="/results" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Trophy className="h-4 w-4"/> Results</Link></li>
                            <li><Link href="/partners" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Handshake className="h-4 w-4"/> Partners</Link></li>
                            <li><Link href="/support" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><LifeBuoy className="h-4 w-4"/> Support</Link></li>
                         </ul>
                     </nav>
                     <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={handleAnnouncementsOpen} className="relative">
                            <Rss className="h-4 w-4" />
                            {hasUnreadAnnouncements && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                        </Button>
                        {currentUser && (
                             <Button variant="ghost" size="icon" onClick={handleNotificationsOpen} className="relative">
                                <Bell className="h-4 w-4" />
                                {unreadNotifications.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                        {loggedInUser ? (
                            <>
                                {currentAdmin ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/admin"><UserCircle className="mr-2 h-4 w-4"/> Admin Dashboard</Link>
                                    </Button>
                                ) : currentJudge ? (
                                     <Button variant="outline" size="sm" asChild>
                                        <Link href="/judge/profile"><UserCircle className="mr-2 h-4 w-4"/> {currentJudge.name}</Link>
                                    </Button>
                                ) : currentUser ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <UserCircle className="mr-2 h-4 w-4"/> {currentUser.name}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem asChild><Link href="/student"><LayoutDashboard className="mr-2 h-4 w-4"/> Dashboard</Link></DropdownMenuItem>
                                            <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4"/> Profile</Link></DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : null}
                                 <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
                                 <Button variant="ghost" size="sm" onClick={handleChangeCollege}><Building2 className="mr-2 h-4 w-4"/> Change College</Button>
                            </>
                        ) : (
                             <>
                                 <Button size="sm" asChild>
                                     <Link href="/student"><User className="mr-2 h-4 w-4"/> Get Started as Student</Link>
                                 </Button>
                                 <Button variant="secondary" size="sm" asChild>
                                     <Link href="/judge"><Scale className="mr-2 h-4 w-4"/> Enter as Judge/Admin</Link>
                                 </Button>
                            </>
                        )}
                        
                     </div>
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
