"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

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

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg font-headline">HackSprint</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <NavLink href="/leaderboard">Leaderboard</NavLink>
                    <NavLink href="/results">Results</NavLink>
                    <NavLink href="/admin">Admin</NavLink>
                </nav>
                <div className="flex items-center gap-4">
                    {!state.currentUser && !state.currentJudge && !state.currentAdmin && (
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/student">Student Portal</Link>
                            </Button>
                            <Button variant="default" asChild>
                                <Link href="/judge">Judge Portal</Link>
                            </Button>
                        </div>
                    )}
                    {state.currentUser && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {state.currentUser.name.split(' ')[0]}</span>
                            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                        </div>
                    )}
                     {state.currentJudge && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Judge: {state.currentJudge.name}</span>
                            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                        </div>
                    )}
                     {state.currentAdmin && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, Admin</span>
                            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
