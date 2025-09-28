
"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

interface ConfettiParticle {
    id: number;
    style: React.CSSProperties;
    colorClass: string;
}

export default function IntroAnimation() {
    const [isVisible, setIsVisible] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [particles, setParticles] = useState<ConfettiParticle[]>([]);

    useEffect(() => {
        // Generate particles only on the client-side
        const generateParticles = () => {
            const newParticles: ConfettiParticle[] = Array.from({ length: 100 }).map((_, i) => ({
                id: i,
                style: {
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 8 + 5}px`,
                    height: `${Math.random() * 8 + 5}px`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                    opacity: Math.random(),
                },
                colorClass: i % 2 === 0 ? 'bg-primary' : 'bg-secondary',
            }));
            setParticles(newParticles);
        };
        
        generateParticles();

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
                {particles.map((p) => (
                    <div 
                        key={p.id}
                        className={cn("absolute rounded-full animate-confetti-rain", p.colorClass)}
                        style={p.style}
                    ></div>
                ))}
            </div>
            
            <div className="z-10 text-center animate-slow-zoom-in">
                <BrainCircuit className="h-16 w-16 mx-auto mb-4 text-primary animate-trophy-shine" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--secondary)))' }}/>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-gray-400 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-gray-100 dark:to-gray-400 font-headline animate-title-reveal"
                    style={{ textShadow: 'var(--intro-text-shadow, none)' }}
                >
                    GenKit ProStudio
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 opacity-0 animate-credits-fade-in">
                    AI-Powered Academic Project Management
                </p>
            </div>
        </div>
    );
}
