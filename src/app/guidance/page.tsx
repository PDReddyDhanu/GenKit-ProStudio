"use client";

import React, { useState } from 'react';
import GuidanceIntro from './_components/GuidanceIntro';
import GuidanceChat from './_components/GuidanceChat';

export default function GuidancePage() {
    const [showIntro, setShowIntro] = useState(true);

    const handleIntroFinish = () => {
        setShowIntro(false);
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            {showIntro && <GuidanceIntro onFinished={handleIntroFinish} />}
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
