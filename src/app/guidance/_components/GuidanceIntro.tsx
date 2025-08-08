
"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb } from 'lucide-react';

export default function GuidanceIntro({ onFinished }: { onFinished: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000); // Total duration of the animation

        const finishTimer = setTimeout(() => {
            onFinished();
        }, 3000); // Duration + fade out time

        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [onFinished]);

    return (
        <div 
            className={cn(
                "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden transition-opacity duration-1000",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
        >
            <div className="z-10 text-center animate-slow-zoom-in">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 text-primary animate-trophy-shine" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--primary)))' }}/>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 font-headline animate-title-reveal"
                    style={{ textShadow: '0 0 10px rgba(255,255,255,0.7), 0 0 25px rgba(192, 192, 255, 0.6)'}}
                >
                    Guidance Hub
                </h1>
                <p className="text-sm text-gray-400 mt-4 opacity-0 animate-credits-fade-in">
                    Your AI-powered career and hackathon coach.
                </p>
            </div>
        </div>
    );
}
