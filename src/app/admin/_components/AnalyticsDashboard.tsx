
"use client"

import React, { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useHackathon } from '@/context/HackathonProvider';
import { INTERNAL_STAGE_1_RUBRIC, INTERNAL_STAGE_2_RUBRIC, INTERNAL_FINAL_RUBRIC, EXTERNAL_FINAL_RUBRIC, INDIVIDUAL_EVALUATION_RUBRIC } from '@/lib/constants';
import type { Hackathon, ProjectSubmission } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart2 } from 'lucide-react';

interface AnalyticsDashboardProps {
    event: Hackathon;
}

const ALL_EVALUATION_RUBRICS = [
    ...INTERNAL_STAGE_1_RUBRIC,
    ...INTERNAL_STAGE_2_RUBRIC,
    ...INTERNAL_FINAL_RUBRIC,
    ...EXTERNAL_FINAL_RUBRIC,
    ...INDIVIDUAL_EVALUATION_RUBRIC,
];

export default function AnalyticsDashboard({ event }: AnalyticsDashboardProps) {
    const { state } = useHackathon();
    const { projects } = state;
    const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

    const eventProjects = useMemo(() => {
        return projects.filter(p => p.hackathonId === event.id && p.scores.length > 0);
    }, [projects, event.id]);

    const criteriaAverages = useMemo(() => {
        const criteriaTotals: { [key: string]: { total: number; count: number } } = {};
        ALL_EVALUATION_RUBRICS.forEach(c => criteriaTotals[c.id] = { total: 0, count: 0 });

        eventProjects.forEach(project => {
            const teamScores = project.scores.filter(s => !s.memberId);
            const scoresByFaculty: { [facultyId: string]: { [criteriaId: string]: number } } = {};
            
            teamScores.forEach(score => {
                if (!scoresByFaculty[score.evaluatorId]) scoresByFaculty[score.evaluatorId] = {};
                scoresByFaculty[score.evaluatorId][score.criteria] = score.value;
            });

            Object.values(scoresByFaculty).forEach(facultyScores => {
                 ALL_EVALUATION_RUBRICS.forEach(criteria => {
                    if (facultyScores[criteria.id] !== undefined) {
                        criteriaTotals[criteria.id].total += (facultyScores[criteria.id] / criteria.max) * 10;
                        criteriaTotals[criteria.id].count += 1;
                    }
                });
            });
        });

        return ALL_EVALUATION_RUBRICS.map(c => ({
            name: c.name,
            average: criteriaTotals[c.id].count > 0 ? (criteriaTotals[c.id].total / criteriaTotals[c.id].count) : 0,
        }));
    }, [eventProjects]);

    const selectedProjectData = useMemo(() => {
        if (!selectedProjectId) return null;
        const project = eventProjects.find(p => p.id === selectedProjectId);
        if (!project) return null;

        return ALL_EVALUATION_RUBRICS.map(criteria => {
            const criteriaScores = project.scores.filter(s => s.criteria === criteria.id && !s.memberId);
            const total = criteriaScores.reduce((sum, s) => sum + s.value, 0);
            const average = criteriaScores.length > 0 ? total / criteriaScores.length : 0;
            return {
                subject: criteria.name,
                A: average,
                fullMark: criteria.max,
            };
        });
    }, [selectedProjectId, eventProjects]);

    if (eventProjects.length === 0) {
        return (
            <Alert>
                <BarChart2 className="h-4 w-4" />
                <AlertTitle>No Data Yet</AlertTitle>
                <AlertDescription>
                    Analytics will be displayed here once projects for "{event.name}" have been scored by faculty.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Average Scores by Criteria</CardTitle>
                    <CardDescription>Overall performance across all submitted projects for "{event.name}".</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={criteriaAverages}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                }}
                            />
                            <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Project Score Breakdown</CardTitle>
                    <CardDescription>Select a project to see its score distribution.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="mb-4">
                        <Select onValueChange={setSelectedProjectId} value={selectedProjectId || ""}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project..." />
                            </SelectTrigger>
                            <SelectContent>
                                {eventProjects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.projectIdeas[0]?.title || 'Untitled Project'}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProjectData ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedProjectData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" fontSize={10} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} fontSize={12} />
                                <Radar name={selectedProjectId} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="flex items-center justify-center h-[300px]">
                            <p className="text-muted-foreground">Please select a project to view its breakdown.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
