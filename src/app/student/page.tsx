"use client";

import React from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import Auth from './_components/Auth';
import Dashboard from './_components/Dashboard';

export default function StudentPortal() {
    const { state } = useHackathon();
    const { currentUser } = state;

    if (!currentUser) {
        return <Auth />;
    }

    return <Dashboard />;
}
