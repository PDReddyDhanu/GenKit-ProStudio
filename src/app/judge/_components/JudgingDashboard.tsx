
"use client";

import React from 'react';
import ScoringDashboard from './ScoringDashboard';
import type { Hackathon } from '@/lib/types';

interface JudgingDashboardProps {
    event: Hackathon;
}

export default function JudgingDashboard({ event }: JudgingDashboardProps) {
    return (
        <div className="animate-slide-in-up">
            <ScoringDashboard event={event} />
        </div>
    );
}
