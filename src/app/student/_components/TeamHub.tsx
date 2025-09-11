
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Loader, Trash2, User as UserIcon, Check } from 'lucide-react';
import type { Team, TeamMember } from '@/lib/types';
import TeamChat from './TeamChat';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEAM_ROLES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamHubProps {
    team: Team;
}

export default function TeamHub({ team }: TeamHubProps) {
    const { api, state } = useHackathon();
    const { currentUser } = state;
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

    const isTeamCreator = currentUser?.id === team.creatorId;
    
    const handleRemoveMember = async (member: TeamMember) => {
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

    const handleRoleChange = async (memberId: string, newRole: string) => {
        setIsUpdatingRole(memberId);
        try {
            await api.updateMemberRole(team.id, memberId, newRole);
        } catch (error) {
            console.error("Failed to update role", error);
        } finally {
            setIsUpdatingRole(null);
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
                            <li key={member.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-2 bg-muted/50 rounded-md">
                                <div className="flex flex-col">
                                    <span className="flex items-center gap-2 font-semibold">
                                        <UserIcon className="h-4 w-4" /> {member.name} 
                                        {member.role && <Badge variant={member.role === 'Leader' ? 'default' : 'secondary'}>{member.role}</Badge>}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                     {isTeamCreator && (
                                         <div className="flex items-center gap-1">
                                            <Select 
                                                defaultValue={member.role || 'Member'}
                                                onValueChange={(newRole) => handleRoleChange(member.id, newRole)}
                                                disabled={isUpdatingRole === member.id}
                                            >
                                                <SelectTrigger className="h-8 w-[150px] text-xs">
                                                    <SelectValue placeholder="Assign Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TEAM_ROLES.map(role => (
                                                        <SelectItem key={role} value={role} className="text-xs">{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {isUpdatingRole === member.id && <Loader className="h-4 w-4 animate-spin"/>}
                                         </div>
                                     )}
                                    {isTeamCreator && member.id !== currentUser?.id && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveMember(member)} disabled={isRemoving === member.id}>
                                            {isRemoving === member.id ? <Loader className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                    )}
                                </div>
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
