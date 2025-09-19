
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const FallingStars = () => {
  const [stars, setStars] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 50 }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          top: `calc(${Math.random() * 100}vh - 2500px)`,
          animationDuration: `${Math.random() * 5 + 10}s`, // Random duration
          animationDelay: `${Math.random() * 5}s`, // Random delay
        };
        return (
            <div
                key={i}
                className="absolute h-[5000px] w-1 rounded-full bg-gradient-to-b from-primary/5 to-primary animate-fall"
                style={style}
            />
        );
      });
      setStars(newStars);
    };

    generateStars();
  }, []);

  return <div className="fixed inset-0 -z-20 overflow-hidden">{stars}</div>;
};

export default FallingStars;
