"use client";

import React, { useMemo } from 'react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export default function Leaderboard() {
    const { state } = useHackathon();
    const { projects, teams } = state;

    const leaderboardData = useMemo(() => {
        return projects
            .map(p => ({
                name: teams.find(t => t.id === p.teamId)?.name || 'Unknown Team',
                score: parseFloat(p.averageScore.toFixed(2))
            }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }, [projects, teams]);

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 font-headline">Live Leaderboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Teams</CardTitle>
                </CardHeader>
                <CardContent>
                {leaderboardData.length > 0 ? (
                    <ChartContainer config={{}} className="h-[500px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                             <RechartsBarChart
                                data={leaderboardData}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={[0, 10]}/>
                                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={150} tick={{ fill: 'hsl(var(--foreground))' }} />
                                <Tooltip
                                    cursor={{ fill: 'hsla(var(--primary), 0.2)' }}
                                    content={<ChartTooltipContent />}
                                />
                                <Bar dataKey="score" fill="hsl(var(--primary))" name="Average Score" radius={[0, 4, 4, 0]}/>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg">No scores have been submitted yet.</p>
                        <p className="text-muted-foreground">The leaderboard will update in real-time as judges submit scores.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    );
};
