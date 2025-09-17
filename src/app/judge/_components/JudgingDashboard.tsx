
"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import ScoringDashboard from './ScoringDashboard';

export default function JudgingDashboard() {
    const { state } = useHackathon();
    const { hackathons, selectedHackathonId } = state;

    const currentHackathon = useMemo(() => {
        return hackathons.find(h => h.id === selectedHackathonId);
    }, [hackathons, selectedHackathonId]);

    return (
        <div className="animate-slide-in-up">
            {currentHackathon ? <ScoringDashboard hackathon={currentHackathon} /> : <p className="text-center text-muted-foreground">Please select a hackathon to start judging.</p>}
        </div>
    );
}
