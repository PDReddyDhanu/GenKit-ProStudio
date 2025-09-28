
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
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FFC700'/%3E%3Cstop offset='100%25' stop-color='%23FF9A00'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='%231E293B' d='M50 0 L95 15 L95 50 L50 95 L5 50 L5 15 Z'/%3E%3Cpath fill='url(%23a)' d='M50 5 L90 20 L90 50 L50 90 L10 50 L10 20 Z'/%3E%3Cpath fill='%231E293B' d='M30 20 h20 v15 h15 v20 h-15 v15 h-20 z'/%3E%3Cpath fill='white' d='M50 20 l-10 10 l10 10 l-10 10' stroke='white' stroke-width='4'/%3E%3Cpath fill='none' stroke='white' stroke-width='5' d='M30 25 v40'/%3E%3C/svg%3E" />
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
