"use client";

import React from 'react';
import ScoringDashboard from './ScoringDashboard';
import type { Hackathon } from '@/lib/types';

interface JudgingDashboardProps {
    hackathon: Hackathon;
}

export default function JudgingDashboard({ hackathon }: JudgingDashboardProps) {
    return (
        <div className="animate-slide-in-up">
            <ScoringDashboard hackathon={hackathon} />
        </div>
    );
}
