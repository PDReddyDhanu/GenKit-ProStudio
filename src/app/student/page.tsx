
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import Auth from './_components/Auth';
import Dashboard from './_components/Dashboard';
import PageIntro from '@/components/PageIntro';
import { Code } from 'lucide-react';

export default function StudentPortal() {
    const { state } = useHackathon();
    const { currentUser } = state;
    const [showIntro, setShowIntro] = useState(true);

    if (showIntro && !currentUser) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Code className="w-full h-full" />} title="Student Portal" description="Register, login, and start your hackathon journey." />;
    }
    
    if (showIntro && currentUser) {
        // Don't show intro if already logged in, go straight to dashboard
        setShowIntro(false);
    }

    if (!currentUser) {
        return <Auth />;
    }

    return <Dashboard />;
}
