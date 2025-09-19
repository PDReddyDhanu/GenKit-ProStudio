
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const VerticalLines = () => {
  const [lines, setLines] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const generateLines = () => {
      const newLines: React.JSX.Element[] = Array.from({ length: 50 }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`,
          animationDuration: `${Math.random() * 5 + 5}s`, // Slower duration
          animationDelay: `${Math.random() * 10}s`,
          opacity: Math.random() * 0.3 + 0.1, // Softer opacity
        };
        return (
          <div
            key={i}
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-line-fall"
            style={style}
          />
        );
      });
      setLines(newLines);
    };

    generateLines();
  }, []);

  return <div className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden">{lines}</div>;
};

export default VerticalLines;
