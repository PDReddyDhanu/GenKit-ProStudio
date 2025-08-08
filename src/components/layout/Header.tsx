"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Trophy, Rss, X } from 'lucide-react';
import { getAnnouncements } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Announcement {
    id: string;
    message: string;
    timestamp: {
        seconds: number;
    };
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {children}
        </Link>
    );
};

export function Header() {
    const { state, dispatch } = useHackathon();
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        async function fetchAnnouncements() {
            const data = await getAnnouncements() as Announcement[];
            setAnnouncements(data);

            const lastViewed = localStorage.getItem('lastViewedAnnouncement');
            if (data.length > 0 && data[0].id !== lastViewed) {
                setHasUnread(true);
            }
        }
        fetchAnnouncements();
    }, []);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        router.push('/');
    };
    
    const handleAnnouncementsOpen = () => {
        setHasUnread(false);
        if (announcements.length > 0) {
            localStorage.setItem('lastViewedAnnouncement', announcements[0].id);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg font-headline">HackSprint</span>
                </Link>
                <nav className="hidden md:flex items-center gap-4">
                    <NavLink href="/guidance">Guidance</NavLink>
                    <NavLink href="/teams">Teams</NavLink>
                    <NavLink href="/gallery">Showcase</NavLink>
                    <NavLink href="/leaderboard">Leaderboard</NavLink>
                    <NavLink href="/results">Results</NavLink>
                    <NavLink href="/partners">Partners</NavLink>
                    <NavLink href="/admin">Admin</NavLink>
                </nav>
                <div className="flex items-center gap-4">
                     <Sheet onOpenChange={(open) => open && handleAnnouncementsOpen()}>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="relative">
                                <Rss className="h-5 w-5" />
                                {hasUnread && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
                                <span className="sr-only">View Announcements</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Announcements</SheetTitle>
                            </SheetHeader>
                            <div className="py-4 space-y-4">
                                {announcements.length > 0 ? announcements.map(ann => (
                                    <div key={ann.id} className="p-3 bg-muted rounded-md">
                                        <p className="text-sm text-foreground">{ann.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {formatDistanceToNow(new Date(ann.timestamp.seconds * 1000), { addSuffix: true })}
                                        </p>
                                    </div>
                                )) : <p className="text-muted-foreground text-center pt-8">No announcements yet.</p>}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {state.currentUser ? (
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="sm" asChild><Link href="/profile">Profile</Link></Button>
                            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                        </div>
                    ) : state.currentJudge ? (
                        <div className="flex items-center gap-2">
                             <span className="text-sm text-muted-foreground hidden sm:inline">Judge: {state.currentJudge.name}</span>
                             <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                        </div>
                    ): state.currentAdmin ? (
                         <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, Admin</span>
                            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/student">Student Portal</Link>
                            </Button>
                            <Button variant="default" asChild>
                                <Link href="/judge">Judge Portal</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
