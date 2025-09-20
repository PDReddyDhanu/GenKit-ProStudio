
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
          top: `calc(${Math.random() * 100}vh - 100px)`,
          animationDuration: `${Math.random() * 5 + 10}s`, // Random duration
          animationDelay: `${Math.random() * 15}s`, // Random delay
        };
        
        // Let's create a mix of bubbles and stars
        if (i % 3 === 0) {
            // It's a bubble
            const size = Math.random() * 5 + 2;
            return (
                <div
                    key={`particle-${i}`}
                    className="absolute rounded-full bg-primary/30 animate-fall"
                    style={{
                        ...style,
                        width: `${size}px`,
                        height: `${size}px`,
                    }}
                />
            );
        } else {
            // It's a star (line)
            return (
                <div
                    key={`particle-${i}`}
                    className="absolute h-12 w-0.5 rounded-full bg-gradient-to-b from-primary/10 to-primary/80 animate-fall"
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
