
"use client";

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PageIntro from '@/components/PageIntro';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
    const { state } = useHackathon();
    const { projects, teams } = state;
    const [showIntro, setShowIntro] = useState(true);

    const leaderboardData = useMemo(() => {
        return projects
            .filter(p => p.averageScore > 0)
            .sort((a, b) => b.averageScore - a.score)
            .slice(0, 10)
            .map((p, index) => {
                const teamName = teams.find(t => t.id === p.teamId)?.name || 'Unknown Team';
                const rank = index + 1;
                let color;
                if (rank === 1) color = 'hsl(var(--chart-1))'; // Gold
                else if (rank === 2) color = 'hsl(var(--chart-2))'; // Silver
                else if (rank === 3) color = 'hsl(var(--chart-3))'; // Bronze
                else color = 'hsl(var(--chart-4))';

                return {
                    rank,
                    name: teamName,
                    score: parseFloat(p.averageScore.toFixed(2)),
                    fill: color,
                };
            })
            .reverse(); // Reverse for horizontal bar chart display
    }, [projects, teams]);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<TrendingUp className="w-full h-full" />} title="Leaderboard" description="Track team progress in real-time." />;
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="rounded-lg border bg-background p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  Team
                </span>
                <span className="font-bold text-muted-foreground">
                  {label}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[0.70rem] uppercase text-muted-foreground">
                  Score
                </span>
                <span className="font-bold">
                  {payload[0].value}
                </span>
              </div>
            </div>
          </div>
        )
      }
      return null
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 font-headline">Live Leaderboard for {state.selectedCollege}</h1>
            <Card>
                <CardHeader className="items-center pb-0">
                    <CardTitle>Top 10 Teams</CardTitle>
                    <CardDescription>A real-time look at the leading teams.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                {leaderboardData.length > 0 ? (
                    <div className="h-[500px] w-full p-4">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart 
                                layout="vertical" 
                                data={leaderboardData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                            >
                                <defs>
                                    {leaderboardData.map((entry) => (
                                        <linearGradient key={`gradient-${entry.rank}`} id={`gradient-${entry.rank}`} x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor={entry.fill} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={entry.fill} stopOpacity={0.2}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border) / 0.5)"/>
                                <XAxis type="number" domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={150} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fill: 'hsl(var(--foreground))' }}
                                />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<CustomTooltip />} />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                    {leaderboardData.map((entry, index) => (
                                        <LabelList
                                            key={`label-${entry.rank}`}
                                            dataKey="name"
                                            position="insideLeft"
                                            offset={10}
                                            className="fill-background font-bold"
                                            formatter={(value: string) => `${entry.rank}. ${value}`}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                     <div className="text-center py-16">
                        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground text-lg">No scores have been submitted yet.</p>
                        <p className="text-muted-foreground">The leaderboard will update in real-time as judges submit scores.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    );
};
