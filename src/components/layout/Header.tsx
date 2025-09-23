

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Trophy, Rss, LogOut, Building2, UserCircle, Bell, ChevronsUpDown, Menu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes";
import Link from 'next/link';
import { AnimatedNav } from './AnimatedNav';
import { ThemeToggle } from './ThemeToggle';


function AuthButtons({ onLinkClick }: { onLinkClick?: () => void }) {
    const { state, api, dispatch } = useHackathon();
    const { currentUser, currentJudge, currentAdmin, selectedCollege } = state;
    const router = useRouter();

    const handleAction = (action: () => void) => {
        if (onLinkClick) onLinkClick();
        action();
    };

    const handleLogout = async () => {
        await api.signOut();
        router.push('/');
    };
    
    const loggedInUser = currentUser || currentJudge || currentAdmin;
    const userDisplayName = currentJudge?.name || currentUser?.name || 'Admin';

    const handleChangeCollege = () => {
        dispatch({ type: 'SET_SELECTED_COLLEGE', payload: null });
        localStorage.removeItem('selectedCollege');
        router.push('/');
    };
    
    return (
        <>
            {selectedCollege && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-1 text-muted-foreground">
                            <Building2 className="h-4 w-4"/> 
                            <span className="w-28 truncate text-left">{selectedCollege}</span>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction(handleChangeCollege)}>
                           Change College
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {loggedInUser ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5"/>
                            <span className="hidden sm:inline">{userDisplayName}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {currentAdmin ? (
                            <>
                                <DropdownMenuItem asChild><Link href="/admin" onClick={onLinkClick}>Dashboard</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/profile" onClick={onLinkClick}>Profile</Link></DropdownMenuItem>
                            </>
                        ) : currentJudge ? (
                            <>
                                <DropdownMenuItem asChild><Link href="/admin" onClick={onLinkClick}>Dashboard</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/judge/profile" onClick={onLinkClick}>Profile</Link></DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem asChild><Link href="/student" onClick={onLinkClick}>Dashboard</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/profile" onClick={onLinkClick}>Profile</Link></DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction(handleLogout)}>
                            <LogOut className="mr-2 h-4 w-4"/> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex items-center gap-2">
                    <Button size="sm" asChild>
                        <Link href="/student" onClick={onLinkClick}>Student</Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                        <Link href="/judge" onClick={onLinkClick}>Judge/Admin</Link>
                    </Button>
                </div>
            )}
        </>
    );
}

const MobileNavMenu = ({ onLinkClick }: { onLinkClick: () => void }) => {
    return (
        <div className="flex flex-col gap-4 pt-8">
            <Link href="/" className="text-lg font-medium" onClick={onLinkClick}>Home</Link>
            <Link href="/guidance" className="text-lg font-medium" onClick={onLinkClick}>Guidance</Link>
            <Link href="/gallery" className="text-lg font-medium" onClick={onLinkClick}>Gallery</Link>
            <Link href="/teams" className="text-lg font-medium" onClick={onLinkClick}>Teams</Link>
            <Link href="/leaderboard" className="text-lg font-medium" onClick={onLinkClick}>Leaderboard</Link>
            <Link href="/results" className="text-lg font-medium" onClick={onLinkClick}>Results</Link>
            <Link href="/partners" className="text-lg font-medium" onClick={onLinkClick}>Partners</Link>
            <Link href="/support" className="text-lg font-medium" onClick={onLinkClick}>Support</Link>
        </div>
    )
}

export function Header() {
    const { state, api } = useHackathon();
    const { announcements, currentUser, currentJudge, currentAdmin } = state;
    const router = useRouter();

    const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
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
    
    const loggedInUser = currentUser || currentJudge;
    const notifications = loggedInUser?.notifications || [];
    const unreadNotifications = useMemo(() => {
        return notifications.filter(n => !n.isRead);
    }, [notifications]);

    useEffect(() => {
        const lastViewed = localStorage.getItem('lastViewedAnnouncement');
        if (activeAnnouncements.length > 0 && activeAnnouncements[0].id !== lastViewed) {
            setHasUnreadAnnouncements(true);
        }
    }, [activeAnnouncements]);

    const handleAnnouncementsOpen = () => {
        setHasUnreadAnnouncements(false);
        if (activeAnnouncements.length > 0) {
            localStorage.setItem('lastViewedAnnouncement', activeAnnouncements[0].id);
        }
        setIsAnnouncementsOpen(true);
    };

    const handleNotificationsOpen = async () => {
        if (unreadNotifications.length > 0 && loggedInUser) {
            const ids = unreadNotifications.map(n => n.id);
            const role = currentUser ? 'user' : 'judge';
            await api.markNotificationsAsRead(loggedInUser.id, ids, role);
        }
        setIsNotificationsOpen(true);
    };
    
    const handleNotificationClick = (link: string) => {
        setIsNotificationsOpen(false);
        router.push(link);
    };

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => b.timestamp - a.timestamp);
    }, [notifications]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container flex h-14 max-w-screen-2xl items-center">
                     <div className="mr-4 flex items-center gap-2">
                         <Link href="/" className="flex items-center gap-2">
                             <Trophy className="h-6 w-6 text-primary" />
                             <span className="font-bold font-headline">HackSprint</span>
                         </Link>
                     </div>

                     <div className="flex-1 hidden md:flex justify-center">
                         <AnimatedNav />
                     </div>

                     <div className="flex flex-1 items-center justify-end space-x-2 md:flex-none">
                        <Button variant="ghost" size="icon" onClick={handleAnnouncementsOpen} className="relative">
                            <Rss className="h-4 w-4" />
                            {hasUnreadAnnouncements && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                        </Button>
                        {(currentUser || currentJudge || currentAdmin) && (
                             <Button variant="ghost" size="icon" onClick={handleNotificationsOpen} className="relative">
                                <Bell className="h-4 w-4" />
                                {unreadNotifications.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
                            </Button>
                        )}
                        <ThemeToggle />
                        
                        <div className="hidden md:flex items-center gap-2">
                            <AuthButtons />
                        </div>
                        
                         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                 <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5"/>
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <div className="py-4">
                                     <MobileNavMenu onLinkClick={() => setIsMobileMenuOpen(false)} />
                                     <div className="mt-8 pt-4 border-t">
                                        <AuthButtons onLinkClick={() => setIsMobileMenuOpen(false)}/>
                                     </div>
                                </div>
                            </SheetContent>
                        </Sheet>
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
                                <button key={n.id} onClick={() => handleNotificationClick(n.link)} className={`block w-full text-left p-3 rounded-md ${!n.isRead ? 'bg-muted' : ''}`}>
                                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                                </button>
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
