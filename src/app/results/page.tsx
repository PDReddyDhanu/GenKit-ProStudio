

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCertificate } from '@/lib/pdf';
import { cn } from '@/lib/utils';
import type { Project, Team, User } from '@/lib/types';
import PageIntro from '@/components/PageIntro';

interface Winner {
    project: Project;
    team?: Team;
    rank: number;
}

interface ConfettiParticle {
    id: number;
    style: React.CSSProperties;
    colorClass: string;
}


const WinnerCard = ({ winner, collegeName }: { winner: Winner, collegeName: string | null }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadCertificate = async () => {
        if (winner.team && winner.project && !isGenerating && collegeName) {
            setIsGenerating(true);
            try {
                const teamMembers = winner.team.members.map((m: User) => m.name);
                await generateCertificate(winner.team.name, winner.project.name, teamMembers, winner.project.id, winner.project.averageScore, collegeName, winner.rank);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    if (!winner || !winner.team || !winner.project) return null;

    const { rank } = winner;
    const podiumClass = rank === 1 ? 'border-amber-400' : rank === 2 ? 'border-slate-400' : 'border-orange-400';
    const trophyColor = rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-400' : 'text-orange-400';
    const rankText = rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd';

    return (
        <Card className={cn("border-2 relative transition-all duration-300 transform-gpu hover:[transform:rotateX(var(--rotate-x,5deg))_rotateY(var(--rotate-y,5deg))_scale3d(1.05,1.05,1.05)]", podiumClass)}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
                <Trophy className={cn("w-16 h-16 mb-4", trophyColor)} />
                <h2 className="text-3xl font-bold font-headline">{rankText} Place</h2>
                <h3 className="text-2xl font-bold text-secondary mt-4 font-headline">{winner.team.name}</h3>
                <p className="text-lg italic text-muted-foreground mt-1 mb-4">for "{winner.project.name}"</p>
                <p className="font-bold text-xl text-foreground">Score: {winner.project.averageScore.toFixed(2)}</p>
                <Button onClick={handleDownloadCertificate} className="mt-6" disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Download Certificate of Achievement'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default function Results() {
    const { state } = useHackathon();
    const { projects, teams, selectedCollege } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [particles, setParticles] = useState<ConfettiParticle[]>([]);

     useEffect(() => {
        const generateParticles = () => {
            const newParticles: ConfettiParticle[] = Array.from({ length: 150 }).map((_, i) => ({
                id: i,
                style: {
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 8 + 5}px`,
                    height: `${Math.random() * 8 + 5}px`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 3 + 4}s`,
                    opacity: Math.random(),
                },
                colorClass: ['bg-primary', 'bg-secondary', 'bg-accent'][i % 3],
            }));
            setParticles(newParticles);
        };
        generateParticles();
    }, []);

    const winners: Winner[] = useMemo(() => {
        return projects
            .filter(p => p.averageScore > 0)
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 3)
            .map((p, index) => ({
                project: p,
                team: teams.find(t => t.id === p.teamId),
                rank: index + 1
            }));
    }, [projects, teams]);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Trophy className="w-full h-full" />} title="Final Results" description="Announcing the winners of the project evaluations." />;
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in relative overflow-hidden">
             <div className="absolute inset-0 pointer-events-none">
                {particles.map((p) => (
                    <div 
                        key={p.id}
                        className={cn("absolute rounded-full animate-confetti-rain", p.colorClass)}
                        style={p.style}
                    ></div>
                ))}
            </div>

            <div className="text-center mb-8 relative z-10">
                 <Trophy className="h-16 w-16 mx-auto mb-4 text-primary animate-trophy-shine" />
                <h1 className="text-4xl font-bold font-headline">Final Results for {selectedCollege}</h1>
            </div>
            
            {winners.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end [perspective:1000px] relative z-10">
                    {winners[1] && (
                        <div className="mt-8 lg:mt-16 animate-slide-in-up" style={{ animationDelay: '200ms'}}>
                            <WinnerCard winner={winners[1]} collegeName={selectedCollege} />
                        </div>
                    )}
                    {winners[0] && (
                        <div className="animate-slide-in-up">
                             <WinnerCard winner={winners[0]} collegeName={selectedCollege} />
                        </div>
                    )}
                    {winners[2] && (
                         <div className="mt-8 lg:mt-24 animate-slide-in-up" style={{ animationDelay: '400ms'}}>
                           <WinnerCard winner={winners[2]} collegeName={selectedCollege} />
                        </div>
                    )}
                </div>
            ) : (
                <Card className="relative z-10">
                    <CardContent className="py-16">
                        <p className="text-center text-muted-foreground text-lg">The results are not yet announced. Stay tuned!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
