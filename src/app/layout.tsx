
"use client";

import type { Metadata } from 'next';
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

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

// Since metadata needs to be static, we can't use hooks here. 
// However, we'll manage the title dynamically in the AppWrapper if needed.
// export const metadata: Metadata = {
//   title: 'HackSprint - Hackathon Management',
//   description: 'A comprehensive SaaS platform to streamline the management of internal college hackathons.',
//   icons: {
//     icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>"
//   }
// };

function AppWrapper({ children }: { children: React.ReactNode }) {
    const { state } = useHackathon();
    const { selectedCollege, isInitialized } = state;
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
      // The IntroAnimation component controls its own duration.
      // After it finishes, we can proceed. This timeout simulates that.
      const timer = setTimeout(() => {
          if (isInitialized) {
              setShowIntro(false);
          }
      }, 4000); // Should match the duration in IntroAnimation

      return () => clearTimeout(timer);
    }, [isInitialized]);

    if (showIntro || !isInitialized) {
        return <IntroAnimation />;
    }
    
    if (!selectedCollege) {
        return <CollegeLogin />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </div>
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
        <title>HackSprint - Hackathon Management</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>" />
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
