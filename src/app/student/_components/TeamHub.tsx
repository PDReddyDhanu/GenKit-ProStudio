
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Loader, Trash2, User as UserIcon } from 'lucide-react';
import type { Team, User as UserType } from '@/lib/types';
import TeamChat from './TeamChat';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TeamHubProps {
    team: Team;
}

export default function TeamHub({ team }: TeamHubProps) {
    const { api, state } = useHackathon();
    const { currentUser } = state;
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const isTeamCreator = currentUser?.id === team.creatorId;
    
    const handleRemoveMember = async (member: UserType) => {
        if (!window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) return;
        
        setIsRemoving(member.id);
        try {
            await api.removeTeammate(team.id, member);
        } catch (error) {
            console.error("Failed to remove member:", error);
        } finally {
            setIsRemoving(null);
        }
    }


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users className="text-primary"/> Team Hub: {team.name}
                    </CardTitle>
                    <CardDescription>
                        Share this code to invite members:
                        <span className="font-mono text-lg text-accent bg-muted p-2 rounded-md ml-2">{team.joinCode}</span>
                    </CardDescription>
                </CardHeader>
                
                 <CardContent className="border-t pt-6">
                    <h4 className="font-semibold mb-3">Team Members ({team.members.length})</h4>
                    <ul className="space-y-3">
                        {team.members.map(member => (
                            <li key={member.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <div className="flex flex-col">
                                    <span className="flex items-center gap-2 font-semibold">
                                        <UserIcon className="h-4 w-4" /> {member.name} 
                                        {member.id === team.creatorId && <Badge variant="secondary">Leader</Badge>}
                                    </span>
                                </div>
                                {isTeamCreator && member.id !== currentUser?.id && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member)} disabled={isRemoving === member.id}>
                                        {isRemoving === member.id ? <Loader className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>

                 <CardContent className="border-t pt-0">
                    <TeamChat team={team} />
                 </CardContent>

            </Card>
        </div>
    );
}
