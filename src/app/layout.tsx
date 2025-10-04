
"use client";

import './globals.css';
import { PT_Sans, Playfair_Display } from 'next/font/google';
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

const ptSans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pt-sans' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display' });

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
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='hsl(38 100% 50%)'/%3E%3Cstop offset='100%25' stop-color='hsl(45 100% 58%)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg transform='translate(50 50) scale(0.9)'%3E%3Cpath d='M50,0 L25,43.3 L-25,43.3 L-50,0 L-25,-43.3 L25,-43.3 Z' stroke='url(%23a)' stroke-width='5' fill='none'/%3E%3Cpath d='M0,0 L-25,43.3 M0,0 L25,43.3 M0,0 L-25,-43.3 M0,0 L25,-43.3 M-25,43.3 L-50,0 M25,43.3 L50,0' stroke='url(%23a)' stroke-width='2' fill='none' /%3E%3Ccircle cx='0' cy='0' r='12' fill='url(%23a)' /%3E%3C/g%3E%3C/svg%3E" />
      </head>
      <body className={cn("font-body antialiased", ptSans.variable, playfairDisplay.variable)}>
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
