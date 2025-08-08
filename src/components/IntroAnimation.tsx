
"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

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
                "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black transition-opacity duration-1000",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
        >
            {/* Background static/glitch effect */}
            <div className="absolute inset-0 z-0 opacity-10 animate-electric-bg"></div>

            {/* Title and Icon */}
            <div className="z-10 flex flex-col items-center justify-center animate-text-reveal">
                <Bot className="h-24 w-24 text-primary animate-icon-glow" />
                <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tighter text-center font-headline animate-electric-glitch bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                    Welcome to HackSprint
                </h1>
            </div>
        </div>
    );
}
