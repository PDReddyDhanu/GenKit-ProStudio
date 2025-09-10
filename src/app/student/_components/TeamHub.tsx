
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users } from 'lucide-react';
import type { Team } from '@/lib/types';
import TeamChat from './TeamChat';

interface TeamHubProps {
    team: Team;
}

export default function TeamHub({ team }: TeamHubProps) {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users className="text-primary"/> Your Team
                    </CardTitle>
                    <CardDescription>
                        Share this code to invite members:
                        <span className="font-mono text-lg text-accent bg-muted p-2 rounded-md ml-2">{team.joinCode}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <h4 className="font-semibold mb-3">Members ({team.members.length}/{team.members.length})</h4>
                    <ul className="space-y-3">
                        {team.members.map(member => (
                            <li key={member.id} className="flex flex-col p-2 bg-muted/50 rounded-md">
                                <span className="flex items-center gap-2 font-semibold">
                                    <User className="h-4 w-4" /> {member.name}
                                </span>
                                {member.skills && member.skills.length > 0 && (
                                     <div className="flex flex-wrap gap-1 mt-2 pl-6">
                                        {member.skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <TeamChat team={team} />
        </div>
    );
}

    