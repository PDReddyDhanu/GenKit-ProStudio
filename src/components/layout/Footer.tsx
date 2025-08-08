import React from 'react';
import { Github, Linkedin, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);


export function Footer() {
  return (
    <footer className="w-full border-t py-8">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} HackSprint. All rights reserved.</p>
        
        <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Connect with Me</p>
            <div className="flex items-center gap-4">
                <Link href="https://github.com/PDReddyDhanu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="h-6 w-6" />
                    <span className="sr-only">GitHub</span>
                </Link>
                <Link href="https://www.linkedin.com/in/dhanunjay-reddy-palakolanu-pdr/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="h-6 w-6" />
                    <span className="sr-only">LinkedIn</span>
                </Link>
                <Link href="https://www.instagram.com/p.d.reddy_dhanu04_08/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                </Link>
                <Link href="https://x.com/PDReddyDhanu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <XIcon className="h-5 w-5" />
                    <span className="sr-only">X</span>
                </Link>
                <Link href="https://www.youtube.com/@pdreddy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Youtube className="h-6 w-6" />
                    <span className="sr-only">YouTube</span>
                </Link>
            </div>
        </div>

        <Link href="https://github.com/Firebase-GenAI/HACKATHON-APP" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Github className="h-5 w-5" />
            <span className="text-sm">View on GitHub</span>
        </Link>
      </div>
    </footer>
  );
};
