
"use client";

import React from 'react';
import { cn } from "@/lib/utils"
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button';
import { Slot } from '@radix-ui/react-slot';

interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  color?: string;
  speed?: string;
}

const StarButton = React.forwardRef<HTMLButtonElement, StarButtonProps>(
  ({ className, variant, size, asChild = false, color, speed = "6s", children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const defaultColor = color || "hsl(var(--foreground))";

    return (
      <Comp
        ref={ref}
        className={cn(
            buttonVariants({ variant, size, className }),
            "relative overflow-hidden"
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
      </Comp>
    )
});
StarButton.displayName = 'StarButton';

export { StarButton };
