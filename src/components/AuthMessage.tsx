"use client";

import React, { useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { cn } from '@/lib/utils';

export function AuthMessage() {
    const { state, dispatch } = useHackathon();
    const { authError, successMessage } = state;

    const message = authError || successMessage;
    const type = authError ? 'error' : 'success';

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                dispatch({ type: 'CLEAR_MESSAGES' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, dispatch]);

    if (!message) return null;
    
    const colors = type === 'success' 
        ? 'bg-green-900/50 text-green-300 border-green-500' 
        : 'bg-red-900/50 text-red-300 border-red-500';

    return (
        <div className={cn("p-3 mb-4 text-sm rounded-md border animate-fade-in", colors)}>
            {message}
        </div>
    );
};
