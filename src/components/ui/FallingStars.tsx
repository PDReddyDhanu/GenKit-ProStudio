"use client";

import { useState, useEffect } from 'react';

const FallingStars = () => {
  const [stars, setStars] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 50 }).map((_, i) => {
        const style: React.CSSProperties = {
          top: `calc(${Math.random() * 100}vh - 2500px)`,
          left: `${Math.random() * 100}vw`,
          transform: `translateX(${Math.random() * 100 - 50}vw)`,
          animationName: 'fall',
          animationDuration: `${Math.random() * 10 + 10}s`,
          animationTimingFunction: 'linear',
          animationDelay: `${Math.random() * 10}s`,
          animationIterationCount: 'infinite',
        };
        return (
          <div
            key={i}
            className="absolute h-[5000px] w-1 rounded-full bg-gradient-to-b from-primary/5 to-primary"
            style={style}
          />
        );
      });
      setStars(newStars);
    };

    generateStars();
  }, []);

  return <div className="fixed inset-0 -z-20">{stars}</div>;
};

export default FallingStars;
