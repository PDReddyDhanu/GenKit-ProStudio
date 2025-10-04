
"use client";

import React from 'react';
import { cn } from "@/lib/utils"
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button';

interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  color?: string
  speed?: string
}

const StarButton = React.forwardRef<HTMLButtonElement, StarButtonProps>(
  ({ className, variant, size, color, speed = "6s", children, ...props }, ref) => {
    const defaultColor = color || "hsl(var(--foreground))";

    return (
      <button
        ref={ref}
        className={cn(
            buttonVariants({ variant, size, className }),
            "relative overflow-hidden" // Add relative positioning for the animation elements
        )}
        {...props}
      >
        <div
          className={cn(
          "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
          "opacity-20 dark:opacity-70" 
          )}
          style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
          }}
        />
        <div
          className={cn(
          "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
          "opacity-20 dark:opacity-70"
          )}
          style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
          }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    )
});
StarButton.displayName = 'StarButton';

export { StarButton };
