"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Loader, Trash2, User as UserIcon, PlusCircle, Search } from 'lucide-react';
import type { Team, TeamMember, User as UserType } from '@/lib/types';
import TeamChat from './TeamChat';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEAM_ROLES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface TeamHubProps {
    team: Team;
}

export default function TeamHub({ team }: TeamHubProps) {
    const { api, state } = useHackathon();
    const { currentUser, users, teams, selectedHackathonId } = state;
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const isTeamCreator = currentUser?.id === team.creatorId;

    const availableUsersToAdd = useMemo(() => {
        if (!selectedHackathonId) return [];

        const allTeamedUserIds = new Set<string>();
        teams.filter(t => t.hackathonId === selectedHackathonId).forEach(t => {
            t.members.forEach(m => allTeamedUserIds.add(m.id));
        });

        return users.filter(u => 
            !allTeamedUserIds.has(u.id) &&
            u.email.toLowerCase().includes(searchEmail.toLowerCase())
        ).slice(0, 5);
    }, [users, teams, selectedHackathonId, searchEmail]);

    const handleAddMember = async (user: UserType) => {
        setIsAdding(true);
        try {
            await api.addTeammate(team.id, user);
            setSearchEmail('');
        } catch (error) {
            console.error("Failed to add member:", error);
        } finally {
            setIsAdding(false);
        }
    };
    
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
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        setIsUpdatingRole(memberId);
        try {
            await api.updateMemberRole(team.id, memberId, newRole);
        } catch (error) {
            console.error("Failed to update role", error);
        } finally {
            setIsUpdatingRole(null);
        }
    };

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
                    <div className="flex justify-between items-center mb-3">
                         <h4 className="font-semibold">Team Members ({team.members.length} / 6)</h4>
                         {isTeamCreator && team.members.length < 6 && (
                             <Popover>
                                <PopoverTrigger asChild>
                                     <Button variant="outline" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4"/> Add Member
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Add Team Member</h4>
                                            <p className="text-sm text-muted-foreground">Search for registered students by email.</p>
                                        </div>
                                        <div className="relative">
                                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="search-email"
                                                placeholder="student@email.com"
                                                value={searchEmail}
                                                onChange={(e) => setSearchEmail(e.target.value)}
                                                className="pl-9"
                                                disabled={isAdding}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            {availableUsersToAdd.map(user => (
                                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                                                    <div>
                                                        <p className="text-sm font-medium">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                    <Button size="sm" onClick={() => handleAddMember(user)} disabled={isAdding}>Add</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                         )}
                    </div>
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
