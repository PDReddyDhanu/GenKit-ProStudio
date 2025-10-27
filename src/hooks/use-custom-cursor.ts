
"use client";

import { useEffect } from 'react';

export function useCustomCursor() {
  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (isTouchDevice) {
      document.body.classList.remove('custom-cursor-enabled');
      return;
    }

    document.body.classList.add('custom-cursor-enabled');
    
    const updateCursor = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', updateCursor);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, []);
}
