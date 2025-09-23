

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Trophy, Rss, LogOut, Building2, UserCircle, Bell, Lightbulb, GalleryVertical, Users, TrendingUp, Handshake, LifeBuoy, Moon, Sun, Home, User, Scale, LayoutDashboard, Menu, ChevronsUpDown } from 'lucide-react';
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

function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
    return (
        <>
            <li><Link href="/" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Home className="h-4 w-4"/> Home</Link></li>
            <li><Link href="/guidance" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Lightbulb className="h-4 w-4"/> Guidance</Link></li>
            <li><Link href="/gallery" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><GalleryVertical className="h-4 w-4"/> Gallery</Link></li>
            <li><Link href="/teams" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Users className="h-4 w-4"/> Teams</Link></li>
            <li><Link href="/leaderboard" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><TrendingUp className="h-4 w-4"/> Leaderboard</Link></li>
            <li><Link href="/results" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Trophy className="h-4 w-4"/> Results</Link></li>
            <li><Link href="/partners" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><Handshake className="h-4 w-4"/> Partners</Link></li>
            <li><Link href="/support" onClick={onLinkClick} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"><LifeBuoy className="h-4 w-4"/> Support</Link></li>
        </>
    );
}

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
                        <Button variant="ghost" className="hidden md:flex items-center gap-1 text-muted-foreground">
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
                                <DropdownMenuItem asChild><Link href="/admin">Dashboard</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/admin/profile">Profile</Link></DropdownMenuItem>
                            </>
                        ) : currentJudge ? (
                            <>
                                <DropdownMenuItem asChild><Link href="/admin">Dashboard</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/judge/profile">Profile</Link></DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem asChild><Link href="/student">Dashboard</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
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
                        <Link href="/student">Student</Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                        <Link href="/judge">Judge/Admin</Link>
                    </Button>
                </div>
            )}
        </>
    );
}

// Mobile specific auth buttons
function MobileAuthButtons({ onLinkClick }: { onLinkClick?: () => void }) {
     const { state, api, dispatch } = useHackathon();
    const { currentUser, currentJudge, currentAdmin, selectedCollege } = state;
    const router = useRouter();

    const handleAction = (action: () => void) => {
        if (onLinkClick) onLinkClick();
        action();
    }

    const handleLogout = async () => {
        await api.signOut();
        router.push('/');
    };

    const handleChangeCollege = () => {
        dispatch({ type: 'SET_SELECTED_COLLEGE', payload: null });
        localStorage.removeItem('selectedCollege');
        router.push('/');
    };
    
    const loggedInUser = currentUser || currentJudge || currentAdmin;
    const userDisplayName = currentJudge?.name || currentUser?.name || 'Admin';

    return (
        <>
             <div className="border-t pt-4 mt-4 space-y-2">
                {selectedCollege && (
                    <div className="px-2 py-1.5 text-center">
                        <p className="text-sm font-semibold text-foreground">{selectedCollege}</p>
                    </div>
                )}
                 <Button variant="ghost" size="sm" onClick={() => handleAction(handleChangeCollege)} className="w-full justify-center text-muted-foreground">
                    <Building2 className="mr-2 h-4 w-4"/> Change College
                </Button>
            </div>
            <div className="border-t pt-4 mt-2 space-y-2">
            {loggedInUser ? (
                <>
                    <p className="px-3 text-sm font-semibold text-foreground">{userDisplayName}</p>
                    {currentAdmin ? (
                        <>
                             <Button asChild variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleAction(() => router.push('/admin'))}><Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4"/> Dashboard</Link></Button>
                             <Button asChild variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleAction(() => router.push('/admin/profile'))}><Link href="/admin/profile"><User className="mr-2 h-4 w-4"/> Profile</Link></Button>
                        </>
                    ) : currentJudge ? (
                        <>
                            <Button asChild variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleAction(() => router.push('/admin'))}><Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4"/> Dashboard</Link></Button>
                            <Button asChild variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleAction(() => router.push('/judge/profile'))}><Link href="/judge/profile"><User className="mr-2 h-4 w-4"/> Profile</Link></Button>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleAction(() => router.push('/student'))}><Link href="/student"><LayoutDashboard className="mr-2 h-4 w-4"/> Dashboard</Link></Button>
                            <Button asChild variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleAction(() => router.push('/profile'))}><Link href="/profile"><User className="mr-2 h-4 w-4"/> Profile</Link></Button>
                        </>
                    )}
                     <Button variant="ghost" size="sm" onClick={() => handleAction(handleLogout)} className="w-full justify-start"><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
                </>
            ) : (
                <>
                    <Button size="sm" asChild className="w-full justify-start" onClick={() => handleAction(() => {})}>
                        <Link href="/student"><User className="mr-2 h-4 w-4"/> Student Login</Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild className="w-full justify-start" onClick={() => handleAction(() => {})}>
                        <Link href="/judge"><Scale className="mr-2 h-4 w-4"/> Judge/Admin Login</Link>
                    </Button>
                </>
            )}
            </div>
        </>
    )
}


export function Header() {
    const { state, api } = useHackathon();
    const { announcements, currentUser } = state;
    const { theme, setTheme } = useTheme();

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
    
    const unreadNotifications = useMemo(() => {
        return currentUser?.notifications?.filter(n => !n.isRead) || [];
    }, [currentUser?.notifications]);

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
        if (unreadNotifications.length > 0 && currentUser) {
            const ids = unreadNotifications.map(n => n.id);
            await api.markNotificationsAsRead(currentUser.id, ids);
        }
        setIsNotificationsOpen(true);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };
    
    const sortedNotifications = useMemo(() => {
        return [...(currentUser?.notifications || [])].sort((a, b) => b.timestamp - a.timestamp);
    }, [currentUser?.notifications]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container flex h-14 max-w-screen-2xl items-center">
                     <div className="mr-4 flex">
                         <Link href="/" className="flex items-center gap-2">
                             <Trophy className="h-6 w-6 text-primary" />
                             <span className="font-bold font-headline">HackSprint</span>
                         </Link>
                     </div>
                     <nav className="hidden md:flex flex-1 justify-center">
                         <ul className="flex items-center justify-center space-x-6 text-sm font-medium">
                            <NavLinks />
                         </ul>
                     </nav>
                     <div className="flex flex-1 items-center justify-end space-x-2">
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
                        
                        <div className="hidden md:flex items-center gap-2">
                            <AuthButtons />
                        </div>
                        
                        <div className="md:hidden">
                             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                 <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle Menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px] flex flex-col">
                                     <SheetHeader>
                                        <SheetTitle>
                                             <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2">
                                                 <Trophy className="h-6 w-6 text-primary" />
                                                 <span className="font-bold font-headline">HackSprint</span>
                                             </Link>
                                        </SheetTitle>
                                    </SheetHeader>
                                    <nav className="mt-8 flex-grow">
                                        <ul className="flex flex-col space-y-4 text-lg">
                                            <NavLinks onLinkClick={closeMobileMenu} />
                                        </ul>
                                    </nav>
                                    <div className="mt-auto pt-4">
                                        <MobileAuthButtons onLinkClick={closeMobileMenu} />
                                    </div>
                                </SheetContent>
                             </Sheet>
                        </div>
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
