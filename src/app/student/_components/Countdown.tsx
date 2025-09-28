
"use client";

import React, { useState, useEffect } from 'react';

interface CountdownProps {
    deadline: number;
}

export function Countdown({ deadline }: CountdownProps) {
    const calculateTimeLeft = () => {
        const difference = +new Date(deadline) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents: JSX.Element[] = [];

    Object.keys(timeLeft).forEach(interval => {
        if (!timeLeft[interval as keyof typeof timeLeft] && timerComponents.length === 0 && interval !== 'days') {
            // Don't show 0d unless it's the only thing left.
            return;
        }

        timerComponents.push(
            <span key={interval} className="text-secondary font-semibold">
                {timeLeft[interval as keyof typeof timeLeft]}{interval.charAt(0)}{" "}
            </span>
        );
    });

    return (
        <p>
            <strong>Time Left:</strong>{" "}
            {timerComponents.length ? timerComponents : <span className="text-red-500">Deadline Passed</span>}
        </p>
    );
}
