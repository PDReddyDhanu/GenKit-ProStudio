

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Trophy, Rss, Menu, LogOut, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} onClick={onClick} className={`block sm:inline-block text-sm font-medium transition-colors ${isActive ? 'text-secondary' : 'text-muted-foreground hover:text-foreground'}`}>
            {children}
        </Link>
    );
};

export function Header() {
    const { state, dispatch } = useHackathon();
    const { announcements } = state.collegeData;
    const router = useRouter();
    const [hasUnread, setHasUnread] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sortedAnnouncements = [...announcements].sort((a, b) => b.timestamp - a.timestamp);

    useEffect(() => {
        const lastViewed = localStorage.getItem('lastViewedAnnouncement');
        if (sortedAnnouncements.length > 0 && sortedAnnouncements[0].id !== lastViewed) {
            setHasUnread(true);
        }
    }, [sortedAnnouncements]);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        setIsMobileMenuOpen(false);
        router.push('/');
    };

    const handleChangeCollege = () => {
        dispatch({ type: 'SELECT_COLLEGE', payload: "" }); // Effectively logs out from the college
        router.push('/');
    }
    
    const handleAnnouncementsOpen = () => {
        setHasUnread(false);
        if (sortedAnnouncements.length > 0) {
            localStorage.setItem('lastViewedAnnouncement', sortedAnnouncements[0].id);
        }
    };
    
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                    <Trophy className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg font-headline">HackSprint</span>
                </Link>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4">
                    <NavLink href="/guidance">Guidance</NavLink>
                    <NavLink href="/teams">Teams</NavLink>
                    <NavLink href="/gallery">Showcase</NavLink>
                    <NavLink href="/leaderboard">Leaderboard</NavLink>
                    <NavLink href="/results">Results</NavLink>
                    <NavLink href="/partners">Partners</NavLink>
                    <NavLink href="/admin">Admin</NavLink>
                </nav>
                
                <div className="flex items-center gap-2">
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
                                {sortedAnnouncements.length > 0 ? sortedAnnouncements.map(ann => (
                                    <div key={ann.id} className="p-3 bg-muted rounded-md">
                                        <p className="text-sm text-foreground">{ann.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {formatDistanceToNow(new Date(ann.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                )) : <p className="text-muted-foreground text-center pt-8">No announcements yet.</p>}
                            </div>
                        </SheetContent>
                    </Sheet>
                    
                    <ThemeToggle />

                     <Button variant="outline" size="sm" onClick={handleChangeCollege} className="hidden sm:flex">
                        <Building2 className="mr-2 h-4 w-4" /> Change College
                    </Button>

                    <div className="hidden sm:flex items-center gap-2">
                        {state.currentUser ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost">Welcome, {state.currentUser.name.split(' ')[0]}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : state.currentJudge ? (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost">Judge: {state.currentJudge.name.split(' ')[0]}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Judge Menu</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ): state.currentAdmin ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost">Admin Menu</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="secondary" asChild>
                                    <Link href="/student">Student Portal</Link>
                                </Button>
                                <Button variant="default" asChild>
                                    <Link href="/judge">Judge Portal</Link>
                                </Button>
                            </>
                        )}
                    </div>
                    
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[280px]">
                                <SheetHeader>
                                    <SheetTitle>
                                         <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                                            <Trophy className="h-6 w-6 text-primary" />
                                            <span className="font-bold text-lg font-headline">HackSprint</span>
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-4 py-8">
                                    <NavLink href="/guidance" onClick={closeMobileMenu}>Guidance</NavLink>
                                    <NavLink href="/teams" onClick={closeMobileMenu}>Teams</NavLink>
                                    <NavLink href="/gallery" onClick={closeMobileMenu}>Showcase</NavLink>
                                    <NavLink href="/leaderboard" onClick={closeMobileMenu}>Leaderboard</NavLink>
                                    <NavLink href="/results" onClick={closeMobileMenu}>Results</NavLink>
                                    <NavLink href="/partners" onClick={closeMobileMenu}>Partners</NavLink>
                                    <NavLink href="/admin" onClick={closeMobileMenu}>Admin</NavLink>
                                </nav>
                                <div className="border-t pt-4 space-y-2">
                                    <Button variant="outline" className="w-full" onClick={() => {handleChangeCollege(); closeMobileMenu();}}>
                                        Change College
                                    </Button>
                                    {state.currentUser ? (
                                        <div className="flex flex-col gap-2">
                                           <Button variant="ghost" asChild><Link href="/profile" onClick={closeMobileMenu}>Profile</Link></Button>
                                            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                                        </div>
                                    ) : state.currentJudge ? (
                                        <div className="flex flex-col gap-2">
                                             <span className="text-sm text-muted-foreground text-center py-2">Judge: {state.currentJudge.name}</span>
                                             <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                                        </div>
                                    ): state.currentAdmin ? (
                                         <div className="flex flex-col gap-2">
                                            <span className="text-sm text-muted-foreground text-center py-2">Welcome, Admin</span>
                                            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Button variant="secondary" asChild>
                                                <Link href="/student" onClick={closeMobileMenu}>Student Portal</Link>
                                            </Button>
                                            <Button variant="default" asChild>
                                                <Link href="/judge" onClick={closeMobileMenu}>Judge Portal</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
};
