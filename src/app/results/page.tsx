
"use client";

import React, { useMemo, useState } from 'react';
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
}

const WinnerCard = ({ winner, rank, collegeName }: { winner: Winner, rank: number, collegeName: string | null }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadCertificate = async () => {
        if (winner.team && winner.project && !isGenerating && collegeName) {
            setIsGenerating(true);
            try {
                const teamMembers = winner.team.members.map((m: User) => m.name);
                await generateCertificate(winner.team.name, winner.project.name, teamMembers, winner.project.id, winner.project.averageScore, collegeName);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    if (!winner || !winner.team || !winner.project) return null;

    const podiumClass = rank === 1 ? 'border-amber-400' : rank === 2 ? 'border-slate-400' : 'border-orange-400';
    const trophyColor = rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-400' : 'text-orange-400';
    const rankText = rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd';

    return (
        <Card className={cn("border-2 relative", podiumClass)}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
                <Trophy className={cn("w-16 h-16 mb-4", trophyColor)} />
                <h2 className="text-3xl font-bold font-headline">{rankText} Place</h2>
                <h3 className="text-2xl font-bold text-secondary mt-4 font-headline">{winner.team.name}</h3>
                <p className="text-lg italic text-muted-foreground mt-1 mb-4">for "{winner.project.name}"</p>
                <p className="font-bold text-xl text-foreground">Score: {winner.project.averageScore.toFixed(2)}</p>
                <Button onClick={handleDownloadCertificate} className="mt-6" disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Download Certificate'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default function Results() {
    const { state } = useHackathon();
    const { projects, teams } = state.collegeData;
    const { selectedCollege } = state;
    const [showIntro, setShowIntro] = useState(true);

    const winners: Winner[] = useMemo(() => {
        return projects
            .filter(p => p.averageScore > 0)
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 3)
            .map(p => ({
                project: p,
                team: teams.find(t => t.id === p.teamId)
            }));
    }, [projects, teams]);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Trophy className="w-full h-full" />} title="Final Results" description="Announcing the winners of the hackathon." />;
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 font-headline">Final Results for {selectedCollege}</h1>
            
            {winners.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                    {winners[1] && (
                        <div className="mt-8 lg:mt-16 animate-slide-in-up" style={{ animationDelay: '200ms'}}>
                            <WinnerCard winner={winners[1]} rank={2} collegeName={selectedCollege} />
                        </div>
                    )}
                    {winners[0] && (
                        <div className="animate-slide-in-up">
                             <WinnerCard winner={winners[0]} rank={1} collegeName={selectedCollege} />
                        </div>
                    )}
                    {winners[2] && (
                         <div className="mt-8 lg:mt-24 animate-slide-in-up" style={{ animationDelay: '400ms'}}>
                           <WinnerCard winner={winners[2]} rank={3} collegeName={selectedCollege} />
                        </div>
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16">
                        <p className="text-center text-muted-foreground text-lg">The results are not yet announced. Stay tuned!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    