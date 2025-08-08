import React from 'react';
import { Github } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t py-6">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} HackSprint. All rights reserved.</p>
        <Link href="https://github.com/Firebase-GenAI/HACKATHON-APP" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Github className="h-5 w-5" />
            <span>View on GitHub</span>
        </Link>
      </div>
    </footer>
  );
};
