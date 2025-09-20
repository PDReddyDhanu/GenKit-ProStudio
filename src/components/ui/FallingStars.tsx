
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const FallingStars = () => {
  const [particles, setParticles] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 150 }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 30 + 15}s`, // Slower, longer duration
          animationDelay: `${Math.random() * 15}s`,
        };
        
        if (i % 3 === 0) {
            const size = Math.random() * 5 + 2;
            return (
                <div
                    key={`particle-${i}`}
                    className="absolute rounded-full bg-primary/30 animate-slow-float"
                    style={{
                        ...style,
                        width: `${size}px`,
                        height: `${size}px`,
                    }}
                />
            );
        } else {
            return (
                <div
                    key={`particle-${i}`}
                    className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-primary/10 to-primary/80 animate-slow-float"
                    style={style}
                />
            );
        }
      });
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return <div className="fixed inset-0 -z-20 overflow-hidden">{particles}</div>;
};

export default FallingStars;
