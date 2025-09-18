"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageIntroProps {
    onFinished: () => void;
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function PageIntro({ onFinished, icon, title, description }: PageIntroProps) {
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
                <div className="h-16 w-16 mx-auto mb-4 text-primary animate-trophy-shine" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--primary)))' }}>
                    {icon}
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground font-headline animate-title-reveal">
                    {title}
                </h1>
                <p className="text-sm text-muted-foreground mt-4 opacity-0 animate-credits-fade-in">
                    {description}
                </p>
            </div>
        </div>
    );
}
