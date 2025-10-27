"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", name: "Home" },
  { path: "/guidance", name: "Guidance" },
  { path: "/gallery", name: "Showcase" },
  { path: "/teams", name: "Teams" },
  { path: "/leaderboard", name: "Leaderboard" },
  { path: "/results", name: "Results" },
  { path: "/support", name: "Support" },
];

export function AnimatedNav() {
  let pathname = usePathname() || "/";
  if (pathname.includes("/student") || pathname.includes("/faculty")) pathname = "/";

  const [hoveredPath, setHoveredPath] = useState(pathname);

  return (
    <div className="relative flex items-center justify-center p-1 border rounded-full bg-muted">
      {navItems.map((item) => {
        const isActive = item.path === pathname;
        return (
          <Link
            key={item.path}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200",
            )}
            href={item.path}
            onMouseOver={() => setHoveredPath(item.path)}
            onMouseLeave={() => setHoveredPath(pathname)}
          >
            <span className={cn("relative z-10", { "text-primary-foreground dark:text-foreground": hoveredPath === item.path, "text-foreground": !(hoveredPath === item.path) })}>{item.name}</span>
            {item.path === hoveredPath && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary light:bg-orange-500 dark:bg-black shadow-sm"
                layoutId="animated-nav-underline"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
