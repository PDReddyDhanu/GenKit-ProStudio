
"use client";

import React, { useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Archive } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Github, FileText, Link as LinkIcon, Tags } from 'lucide-react';
import { ProjectIdea } from '@/lib/types';


const IdeaDisplay = ({ idea }: { idea: ProjectIdea }) => {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Description</h4>
                <p>{idea.description}</p>
            </div>
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Abstract</h4>
                <p className="whitespace-pre-wrap">{idea.abstractText}</p>
            </div>
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><Tags className="h-4 w-4" /> Keywords</h4>
                <p>{idea.keywords}</p>
            </div>
            <div>
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</h4>
                <Link href={idea.githubUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{idea.githubUrl}</Link>
            </div>
            {idea.abstractFileUrl && (
                <div>
                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Abstract Document</h4>
                    <Link href={idea.abstractFileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">View Uploaded File</Link>
                </div>
            )}
        </div>
    )
}

export default function DiscardedIdeas() {
    const { state } = useHackathon();
    const { currentUser, projects, teams } = state;

    const discardedIdeas = useMemo(() => {
        if (!currentUser) return [];
        const myTeamIds = new Set(teams.filter(t => t.members.some(m => m.id === currentUser.id)).map(t => t.id));
        
        return projects
            .filter(p => myTeamIds.has(p.teamId))
            .flatMap(p => 
                p.projectIdeas.filter(idea => idea.status === 'discarded').map(idea => ({
                    ...idea,
                    teamName: teams.find(t => t.id === p.teamId)?.name || 'Unknown Team',
                }))
            );
    }, [currentUser, projects, teams]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Archive className="text-primary"/> Discarded Project Ideas
                </CardTitle>
                <CardDescription>A record of your team's project ideas that were not selected for approval.</CardDescription>
            </CardHeader>
            <CardContent>
                {discardedIdeas.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {discardedIdeas.map(idea => (
                            <AccordionItem value={idea.id} key={idea.id}>
                                <AccordionTrigger>
                                    <div className="flex flex-col text-left">
                                        <span className="font-semibold">{idea.title}</span>
                                        <span className="text-sm text-muted-foreground">From Team: {idea.teamName}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <IdeaDisplay idea={idea} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <Archive className="mx-auto h-12 w-12"/>
                        <p className="mt-4">No discarded ideas found.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
