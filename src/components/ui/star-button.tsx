"use client";

import React from 'react';
import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"
import { Button, buttonVariants } from './button';
import { VariantProps } from 'class-variance-authority';

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
}

const StarButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> &
    StarBorderProps<"button">
>(({ className, variant, size, color, speed = "6s", children, ...props }, ref) => {
    const defaultColor = color || "hsl(var(--foreground))";

    return (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            className={cn(
                "relative overflow-hidden",
                className
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
        </Button>
    )
});
StarButton.displayName = 'StarButton';

export { StarButton };
