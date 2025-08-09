"use client";

import React, { useMemo, useState } from 'react';
import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis, Tooltip } from 'recharts';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import PageIntro from '@/components/PageIntro';
import { BarChart, TrendingUp } from 'lucide-react';
import { PolarGrid } from 'recharts';

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
        const topTeams = projects
            .map(p => ({
                name: teams.find(t => t.id === p.teamId)?.name || 'Unknown Team',
                score: parseFloat(p.averageScore.toFixed(2)),
                fill: `hsl(${Math.random() * 360}, 70%, 50%)`
            }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        return topTeams;
    }, [projects, teams]);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<BarChart className="w-full h-full" />} title="Leaderboard" description="Track team progress in real-time." />;
    }

    return (
        <div className="container max-w-6xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-8 font-headline">Live Leaderboard</h1>
            <Card>
                <CardHeader className="items-center pb-0">
                    <CardTitle>Top 10 Teams</CardTitle>
                    <CardDescription>A real-time look at the leading teams.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                {leaderboardData.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square h-[500px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                         <RadialBarChart
                            data={leaderboardData}
                            startAngle={-90}
                            endAngle={270}
                            innerRadius="10%"
                            outerRadius="80%"
                            cx="50%"
                            cy="50%"
                            barSize={20}
                        >
                            <PolarGrid gridType="circle" />
                            <PolarAngleAxis type="number" domain={[0, 10]} angleAxisId={0} tick={false} />
                            <RadialBar
                                background
                                dataKey="score"
                                angleAxisId={0}
                                name="Score"
                            />
                             <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name, props) => (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div style={{ backgroundColor: props.payload.fill, width: '10px', height: '10px', borderRadius: '50%' }} />
                                                    <span className="font-bold">{props.payload.name}</span>
                                                </div>
                                                <span className="text-right">{value} / 10</span>
                                            </>
                                        )}
                                        
                                    />
                                }
                             />
                        </RadialBarChart>
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
