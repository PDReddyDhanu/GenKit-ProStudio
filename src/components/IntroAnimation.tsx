
"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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
                "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gray-900 overflow-hidden transition-opacity duration-1000",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
        >
            <div className="absolute inset-0 animate-lightning-flash opacity-0" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 animate-lightning-flash opacity-0" style={{ animationDelay: '2.5s' }}></div>
            <div className="absolute inset-0 animate-lightning-flash opacity-0" style={{ animationDelay: '3.5s' }}></div>
            
            <h1 className="z-10 text-5xl md:text-7xl font-extrabold tracking-tighter text-center font-headline text-white animate-title-reveal"
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(192, 192, 255, 0.5)'}}
            >
                Welcome to HackSprint
            </h1>
        </div>
    );
}
