"use client";

import React, { useState } from 'react';
import GuidanceChat from './_components/GuidanceChat';
import PageIntro from '@/components/PageIntro';
import { Lightbulb } from 'lucide-react';

export default function GuidancePage() {
    const [showIntro, setShowIntro] = useState(true);

    const handleIntroFinish = () => {
        setShowIntro(false);
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            {showIntro && (
                <PageIntro 
                    onFinished={handleIntroFinish} 
                    icon={<Lightbulb className="w-full h-full" />} 
                    title="Guidance Hub" 
                    description="Your AI-powered career and hackathon coach." 
                />
            )}
            {!showIntro && (
                 <div className="text-center animate-fade-in">
                    <h1 className="text-4xl font-bold mb-2 font-headline">Guidance Hub</h1>
                    <p className="text-lg text-muted-foreground mb-8">Your AI-powered career and hackathon coach.</p>
                    <GuidanceChat />
                </div>
            )}
        </div>
    );
}
