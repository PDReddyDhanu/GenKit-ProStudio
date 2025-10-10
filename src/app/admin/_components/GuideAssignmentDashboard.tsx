
"use client";

import React, { useMemo, useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User, Users, Wand2, Loader, Library } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Team, Faculty } from '@/lib/types';
import { DEPARTMENTS_DATA } from '@/lib/constants';

const projectEvents = [
    { id: 'real-time-project', name: 'Real-Time Project' },
    { id: 'mini-project', name: 'Mini Project' },
    { id: 'major-project', name: 'Major Project' },
    { id: 'other-project', name: 'Other Project' }
];

const TeamGuideCard = ({ team, availableGuides }: { team: Team, availableGuides: Faculty[] }) => {
    const { api } = useHackathon();
    const [selectedGuideId, setSelectedGuideId] = useState(team.guide?.id || '');
    const [isAssigning, setIsAssigning] = useState(false);

    const handleAssignGuide = async () => {
        const selectedGuide = availableGuides.find(g => g.id === selectedGuideId);
        if (!selectedGuide) return;
        
        setIsAssigning(true);
        try {
            await api.assignGuideToTeam(team.id, selectedGuide);
        } catch (error) {
            console.error("Failed to assign guide:", error);
        } finally {
            setIsAssigning(false);
        }
    };
    
     const handleRemoveGuide = async () => {
        setIsAssigning(true);
        try {
            // Pass an empty object or a specific signal to unassign
            await api.assignGuideToTeam(team.id, {} as Faculty);
            setSelectedGuideId('');
        } catch (error) {
            console.error("Failed to remove guide:", error);
        } finally {
            setIsAssigning(false);
        }
    };
    
    const handleSelectChange = (value: string) => {
        if (value === 'unassign') {
            handleRemoveGuide();
        } else {
            setSelectedGuideId(value);
        }
    };

    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <CardDescription className="flex items-center gap-2"><Users className="h-4 w-4"/> {team.members.length} members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-1">Assigned Guide:</h4>
                    {team.guide?.name ? (
                        <Badge variant="secondary" className="text-base">{team.guide.name}</Badge>
                    ) : (
                        <Badge variant="outline">Not Assigned</Badge>
                    )}
                </div>
                 <div className="space-y-2">
                    <Select onValueChange={handleSelectChange} value={selectedGuideId}>
                        <SelectTrigger disabled={isAssigning}>
                            <SelectValue placeholder="Select a guide to assign..." />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="unassign">-- Unassign --</SelectItem>
                             {availableGuides.length > 0 ? availableGuides.map(guide => (
                                <SelectItem key={guide.id} value={guide.id}>{guide.name}</SelectItem>
                            )) : <p className="p-2 text-xs text-muted-foreground">No guides available.</p>}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={handleAssignGuide} disabled={isAssigning || !selectedGuideId || selectedGuideId === 'unassign'} size="sm">
                        {isAssigning ? <Loader className="animate-spin mr-2 h-4 w-4"/> : null}
                        {team.guide?.id === selectedGuideId ? 'Re-assign' : 'Assign Guide'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


export default function GuideAssignmentDashboard() {
    const { state, api } = useHackathon();
    const { teams, faculty, currentFaculty, users } = state;
    const [selectedProjectType, setSelectedProjectType] = useState<string>('all');
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    const { departmentTeams, departmentGuides } = useMemo(() => {
        if (!currentFaculty?.department) return { departmentTeams: [], departmentGuides: [] };

        const hodDepartment = currentFaculty.department;
        const departmentBranches = DEPARTMENTS_DATA[hodDepartment as keyof typeof DEPARTMENTS_DATA]?.map(b => b.id) || [];

        const guides = faculty.filter(f => 
            f.role === 'guide' &&
            f.status === 'approved' &&
            departmentBranches.includes(f.branch || '')
        );
        
        const allTeamsInEvent = teams.filter(t => {
            return selectedProjectType === 'all' || t.hackathonId === selectedProjectType;
        });

        const teamsInDepartment = allTeamsInEvent.filter(team => {
            return team.members.some(member => {
                const user = users.find(u => u.id === member.id);
                return user && departmentBranches.includes(user.branch);
            });
        });
        
        return { departmentTeams: teamsInDepartment, departmentGuides: guides };
    }, [teams, faculty, currentFaculty, selectedProjectType, users]);
    
    const handleAutoAssign = async () => {
        if (departmentGuides.length === 0) {
            alert("No available guides in this department to assign.");
            return;
        }

        setIsAutoAssigning(true);
        try {
            const unassignedTeams = departmentTeams.filter(t => !t.guide?.id);
            if (unassignedTeams.length === 0) {
                alert("All teams in this category already have guides assigned.");
                setIsAutoAssigning(false);
                return;
            }

            for (let i = 0; i < unassignedTeams.length; i++) {
                const team = unassignedTeams[i];
                const guide = departmentGuides[i % departmentGuides.length];
                await api.assignGuideToTeam(team.id, guide);
            }
        } catch (error) {
            console.error("Auto-assignment failed:", error);
        } finally {
            setIsAutoAssigning(false);
        }
    };


    if (currentFaculty?.role !== 'hod') {
        return (
            <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                    You do not have permission to view this page. This is for HODs only.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3"><User className="text-primary"/> Guide Assignment Dashboard</CardTitle>
                    <CardDescription>Assign internal guides to student project teams in the <strong>{currentFaculty.department}</strong> department.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Select onValueChange={setSelectedProjectType} defaultValue="all">
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Filter by Project Type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Project Types</SelectItem>
                            {projectEvents.map(pt => <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Button onClick={handleAutoAssign} disabled={isAutoAssigning || departmentTeams.filter(t => !t.guide?.id).length === 0}>
                        {isAutoAssigning ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                        Auto-Assign Remaining Guides
                    </Button>
                </CardContent>
            </Card>

            <ScrollArea className="h-[calc(100vh-25rem)] pr-4">
                {departmentTeams.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departmentTeams.map(team => <TeamGuideCard key={team.id} team={team} availableGuides={departmentGuides} />)}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Library className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">No teams found for the selected project type in your department.</p>
                        </CardContent>
                    </Card>
                )}
            </ScrollArea>
        </div>
    );
}
