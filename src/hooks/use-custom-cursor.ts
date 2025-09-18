
"use client";

import { useEffect } from 'react';

export function useCustomCursor() {
  useEffect(() => {
    // Check if the primary input mechanism is coarse (e.g., touch)
    // This is a reliable way to disable the cursor on most tablets and mobile devices.
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (isTouchDevice) {
      // If it's a touch device, remove the custom-cursor class to hide the pseudo-elements
      document.body.classList.remove('custom-cursor-enabled');
      return;
    }

    // Add a class to enable the cursor styles only on non-touch devices
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
