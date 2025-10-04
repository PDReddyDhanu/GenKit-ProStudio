
"use client";

import React, { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { gsap } from 'gsap';

interface AnimatedStatProps {
    finalValue: number;
}

const AnimatedStat = ({ finalValue }: AnimatedStatProps) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const isInView = useInView(ref, { margin: "-50px" });

    useEffect(() => {
        if (isInView && ref.current) {
            const target = { val: 0 };
            gsap.to(target, {
                val: finalValue,
                duration: 2,
                ease: "power3.out",
                onUpdate: () => {
                    if (ref.current) {
                        const formattedValue = new Intl.NumberFormat('en-US').format(Math.round(target.val));
                        ref.current.textContent = `${formattedValue}+`;
                    }
                }
            });
        }
    }, [isInView, finalValue]);

    return (
        <p ref={ref} className="text-3xl md:text-4xl font-bold text-secondary">
            0+
        </p>
    );
};

export default AnimatedStat;
