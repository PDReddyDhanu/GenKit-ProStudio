
"use client";

import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import { HackathonProvider, useHackathon } from '@/context/HackathonProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import IntroAnimation from '@/components/IntroAnimation';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import CollegeLogin from '@/components/CollegeLogin';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { useCustomCursor } from '@/hooks/use-custom-cursor';
import FallingStars from '@/components/ui/FallingStars';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

function AppContent({ children }: { children: React.ReactNode }) {
    const { state } = useHackathon();
    const { selectedCollege, isInitialized, isLoading } = state;
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
      if (isInitialized) {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }, [isInitialized]);
    
    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-animate-on-scroll', 'true');
          }
        });
      }, { threshold: 0.1 });

      const elements = document.querySelectorAll('[data-animate-on-scroll]');
      elements.forEach(el => observer.observe(el));

      return () => elements.forEach(el => observer.unobserve(el));
    }, [children]);

    if (!isInitialized || (showIntro && !selectedCollege)) {
        return <IntroAnimation />;
    }

    if (isLoading && selectedCollege) {
         return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
                <Loader className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading {selectedCollege} data...</p>
            </div>
        )
    }
    
    if (!selectedCollege) {
        return <CollegeLogin />;
    }

    return (
         <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pb-24">
                {children}
            </main>
            <Footer />
        </div>
    );
}

function AppWrapper({ children }: { children: React.ReactNode }) {
    useCustomCursor();

    return (
        <>
            <FallingStars />
            <div className="custom-cursor" />
            <AppContent>{children}</AppContent>
        </>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <title>GenKit ProStudio - Project Management Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FFC700'/%3E%3Cstop offset='100%25' stop-color='%23FF9A00'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='hsl(222 8% 12%)' d='M0 0h100v100H0z'/%3E%3Cpath fill='url(%23a)' d='M50 85 L15 62.5 V37.5 L50 15 L85 37.5 V62.5 Z' /%3E%3Cpath fill='none' stroke='hsl(222 8% 12%)' stroke-width='5' d='M50 85 L15 62.5 V37.5 L50 15 L85 37.5 V62.5 Z' /%3E%3Cpath fill='none' stroke='white' stroke-width='4' stroke-linecap='round' d='M50 65 V50 M35 57.5 L50 50 L65 57.5 M50 50 L50 35' /%3E%3Ccircle cx='50' cy='65' r='5' fill='white'/%3E%3Ccircle cx='35' cy='57.5' r='5' fill='white'/%3E%3Ccircle cx='65' cy='57.5' r='5' fill='white'/%3E%3Ccircle cx='50' cy='35' r='5' fill='white'/%3E%3C/svg%3E" />
      </head>
      <body className={cn("font-body antialiased", inter.variable, spaceGrotesk.variable)}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <HackathonProvider>
              <AppWrapper>{children}</AppWrapper>
              <Toaster />
          </HackathonProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
