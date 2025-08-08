
"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

export default function IntroAnimation() {
    const [isVisible, setIsVisible] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 4000); // Total duration of the animation

        const finishTimer = setTimeout(() => {
            setIsFinished(true);
        }, 5000); // Duration + fade out time

        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, []);

    if (isFinished) {
        return null;
    }

    return (
        <div 
            className={cn(
                "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/95 transition-opacity duration-1000",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
        >
            <div className="z-10 flex flex-col items-center justify-center animate-slide-in-up">
                <Trophy className="h-24 w-24 text-primary animate-pulse" />
                <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tighter text-center font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                    Welcome to HackSprint
                </h1>
            </div>
        </div>
    );
}
