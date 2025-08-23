
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
                "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background overflow-hidden transition-opacity duration-1000",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
        >
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-primary rounded-full animate-confetti-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 8 + 5}px`,
                            height: `${Math.random() * 8 + 5}px`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${Math.random() * 3 + 2}s`,
                            opacity: Math.random(),
                        }}
                    ></div>
                ))}
                 {Array.from({ length: 50 }).map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-secondary rounded-full animate-confetti-rain"
                        style={{
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 8 + 5}px`,
                            height: `${Math.random() * 8 + 5}px`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${Math.random() * 3 + 2}s`,
                            opacity: Math.random(),
                        }}
                    ></div>
                ))}
            </div>
            
            <div className="z-10 text-center animate-slow-zoom-in">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-primary animate-trophy-shine" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--secondary)))' }}/>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 font-headline animate-title-reveal"
                    style={{ textShadow: '0 0 10px rgba(255,255,255,0.7), 0 0 25px rgba(255, 202, 40, 0.6)'}}
                >
                    HackSprint
                </h1>
                <p className="text-sm text-gray-400 mt-4 opacity-0 animate-credits-fade-in">
                    Developed By Dhanunjay Reddy Palakolanu
                </p>
            </div>
        </div>
    );
}
