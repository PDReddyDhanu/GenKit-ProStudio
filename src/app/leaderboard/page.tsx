"use client";

import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import PageIntro from '@/components/PageIntro';
import { BarChart, TrendingUp } from 'lucide-react';

const chartConfig = {
    score: {
      label: "Score",
    },
    teams: {
      label: "Teams",
      color: "hsl(var(--chart-1))",
    },
}

export default function Leaderboard() {
    const { state } = useHackathon();
    const { projects, teams } = state;
    const [showIntro, setShowIntro] = useState(true);

    const leaderboardData = useMemo(() => {
        return projects
            .map((p, index) => ({
                name: teams.find(t => t.id === p.teamId)?.name || 'Unknown Team',
                score: parseFloat(p.averageScore.toFixed(2)),
                x: index + 1, // position on x-axis
                fill: `hsl(${Math.random() * 360}, 70%, 60%)`
            }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score);
    }, [projects, teams]);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<BarChart className="w-full h-full" />} title="Leaderboard" description="Track team progress in real-time." />;
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 font-headline">Live Leaderboard</h1>
            <Card>
                <CardHeader className="items-center pb-0">
                    <CardTitle>Top Teams</CardTitle>
                    <CardDescription>A real-time look at the leading teams.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                {leaderboardData.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square h-[500px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                         <ScatterChart
                            margin={{
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            }}
                         >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="x" name="team" tick={false} label={{ value: 'Teams', position: 'insideBottom', offset: -10 }} />
                            <YAxis type="number" dataKey="score" name="score" label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                            <ZAxis type="number" dataKey="score" range={[100, 1000]} name="rank" />
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                content={
                                    <ChartTooltipContent
                                        labelKey="name"
                                        formatter={(value, name, props) => (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div style={{ backgroundColor: props.payload.fill, width: '10px', height: '10px', borderRadius: '50%' }} />
                                                    <span className="font-bold">{props.payload.name}</span>
                                                </div>
                                                <span className="text-right">Score: {props.payload.score} / 10</span>
                                            </>
                                        )}
                                    />
                                }
                            />
                            <Scatter name="Teams" data={leaderboardData} fill="fill" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </ChartContainer>
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
