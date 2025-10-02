

"use client";

import React, { useMemo, useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PageIntro from '@/components/PageIntro';
import { TrendingUp, Trophy, Award, Star, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ProjectSubmission, Team } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface LeaderboardEntry {
    rank: number;
    teamName: string;
    projectName: string;
    score: number;
    achievements?: string[];
}

const projectTypes = [
    { id: 'real-time-project', name: 'Real-Time Project' },
    { id: 'mini-project', name: 'Mini Project' },
    { id: 'major-project', name: 'Major Project' },
    { id: 'other-project', name: 'Other Project' }
];

const PodiumCard = ({ entry, rank }: { entry: LeaderboardEntry, rank: number }) => {
    
    const rankStyles = {
        1: {
            card: "border-primary shadow-lg shadow-primary/20 bg-card",
            iconColor: "text-primary",
            icon: <Trophy className="w-12 h-12" />,
            rankText: "1st Place",
            animationDelay: "100ms"
        },
        2: {
            card: "border-yellow-500",
            iconColor: "text-yellow-500",
            icon: <Award className="w-10 h-10" />,
            rankText: "2nd Place",
            animationDelay: "300ms"
        },
        3: {
            card: "border-orange-500",
            iconColor: "text-orange-500",
            icon: <Star className="w-10 h-10" />,
            rankText: "3rd Place",
            animationDelay: "500ms"
        }
    }

    const styles = rankStyles[rank as keyof typeof rankStyles];
    
    return (
        <Card className={cn("text-center flex flex-col items-center border-2 transition-all duration-300 transform-gpu animate-card-in", styles.card)} style={{animationDelay: styles.animationDelay}}>
            <CardHeader className="items-center pb-2">
                <div className={cn("mb-2", styles.iconColor)} style={{ filter: `drop-shadow(0 0 10px currentColor)`}}>
                    {styles.icon}
                </div>
                <CardTitle className="font-headline text-2xl">{styles.rankText}</CardTitle>
                <p className="text-xl font-bold text-secondary">{entry.teamName}</p>
            </CardHeader>
            <CardContent>
                <p className="text-sm italic text-muted-foreground">for "{entry.projectName}"</p>
                <p className="text-3xl font-bold mt-2">{entry.score}</p>
                {entry.achievements && entry.achievements.length > 0 && (
                     <div className="flex justify-center flex-wrap gap-2 mt-3">
                        {entry.achievements.map(achievement => (
                            <Tooltip key={achievement}>
                                <TooltipTrigger asChild>
                                     <Button variant="outline" size="icon" className="border-yellow-400 text-yellow-400 h-8 w-8">
                                        <Award className="w-4 h-4" />
                                     </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{achievement}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function Leaderboard() {
    const { state } = useHackathon();
    const { projects, teams, hackathons } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [selectedProjectType, setSelectedProjectType] = useState<string>('all');

    const leaderboardData = useMemo(() => {
        const selectedHackathonId = selectedProjectType !== 'all' ? (projectTypes.find(p => p.id === selectedProjectType) || hackathons.find(h => h.id === selectedProjectType))?.id : 'all';

        const filteredProjects = selectedHackathonId === 'all'
            ? projects
            : projects.filter(p => p.hackathonId === selectedHackathonId);

        return filteredProjects
            .filter(p => p.totalScore > 0)
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((p, index) => {
                const team = teams.find(t => t.id === p.teamId);
                return {
                    rank: index + 1,
                    teamName: team?.name || 'Unknown Team',
                    projectName: p.projectIdeas[0]?.title || 'Untitled Project',
                    score: parseFloat(p.totalScore.toFixed(2)),
                    achievements: p.achievements,
                };
            });
    }, [projects, teams, selectedProjectType, hackathons]);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<TrendingUp className="w-full h-full" />} title="Leaderboard" description="Track team progress in real-time." />;
    }
    
    const podium = leaderboardData.slice(0, 3);
    const restOfList = leaderboardData.slice(3, 10);
    const allEvents = [...projectTypes, ...hackathons.map(h => ({id: h.id, name: h.name}))];

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
             <TooltipProvider>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-center mb-2 font-headline">Live Leaderboard for {state.selectedCollege}</h1>
                    <p className="text-muted-foreground">A real-time look at the leading teams.</p>
                </div>

                <Card className="p-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <p className="font-semibold">Filter by Project Type:</p>
                        <Select onValueChange={setSelectedProjectType} defaultValue="all">
                            <SelectTrigger className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Filter by Project Type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Project Types</SelectItem>
                                {allEvents.map(pt => <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>
                
                {leaderboardData.length > 0 ? (
                    <div className="space-y-12">
                        {/* Podium Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                            {podium[1] && (
                                <div className="order-2 md:order-1">
                                    <PodiumCard entry={podium[1]} rank={2} />
                                </div>
                            )}
                            {podium[0] && (
                                 <div className="order-1 md:order-2">
                                    <PodiumCard entry={podium[0]} rank={1} />
                                </div>
                            )}
                            {podium[2] && (
                                 <div className="order-3 md:order-3">
                                    <PodiumCard entry={podium[2]} rank={3} />
                                </div>
                            )}
                        </div>
                        
                        {/* Rest of the list */}
                        {restOfList.length > 0 && (
                            <Card className="animate-slide-in-up" style={{animationDelay: '700ms'}}>
                                 <CardHeader>
                                    <CardTitle className="font-headline">Top 10 Teams</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[80px]">Rank</TableHead>
                                                    <TableHead>Team</TableHead>
                                                    <TableHead>Project</TableHead>
                                                    <TableHead>Achievements</TableHead>
                                                    <TableHead className="text-right">Score</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {leaderboardData.map((entry) => (
                                                    <TableRow key={entry.rank}>
                                                        <TableCell className="font-bold text-lg">{entry.rank}</TableCell>
                                                        <TableCell className="font-medium text-primary">{entry.teamName}</TableCell>
                                                        <TableCell className="text-muted-foreground">{entry.projectName}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {entry.achievements?.map(achievement => (
                                                                    <Tooltip key={achievement}>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="text-yellow-400 h-6 w-6">
                                                                                <Award className="w-5 h-5" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{achievement}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-lg">{entry.score}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-16">
                            <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground text-lg">No scored projects found for the selected filter.</p>
                            <p className="text-muted-foreground">The leaderboard will update as judges submit scores.</p>
                        </CardContent>
                    </Card>
                )}
            </TooltipProvider>
        </div>
    );
};
