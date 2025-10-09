
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User, Faculty } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useHackathon } from '@/context/HackathonProvider';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS_DATA } from '@/lib/constants';

interface UserListsProps {
    approvedStudents: User[];
    faculty: Faculty[];
}

export default function UserLists({ approvedStudents, faculty }: UserListsProps) {
    const { api, state } = useHackathon();
    const { currentFaculty, selectedBatch } = state;

    const handleRemoveStudent = async (userId: string) => {
        await api.removeStudent(userId);
    };

    const handleRemoveFaculty = async (facultyId: string) => {
        await api.removeFaculty(facultyId);
    };

    const getBranchName = (branchId: string): string => {
        for (const dept of Object.values(DEPARTMENTS_DATA)) {
            const branch = dept.find(b => b.id === branchId);
            if (branch) {
                return branch.name;
            }
        }
        return branchId; // Fallback to ID if not found
    };
    
    const batchText = selectedBatch ? `for batch ${selectedBatch}` : "for all batches";
    const studentDesc = `List of registered students ${batchText}.`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Approved Students ({approvedStudents.length})</CardTitle>
                    <CardDescription>{studentDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-2">
                            {approvedStudents.length > 0 ? approvedStudents.map(user => (
                                <div key={user.id} className="p-2 bg-muted/50 rounded-md flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-sm">{user.name} <Badge variant="outline">{getBranchName(user.branch)}</Badge></div>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => handleRemoveStudent(user.id)}>
                                        Remove
                                    </Button>
                                </div>
                            )) : <p className="text-muted-foreground text-center pt-8">No approved students match the current filters.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Approved Faculty & Admins ({faculty.length})</CardTitle>
                    <CardDescription>List of all approved faculty and admin accounts matching the current filters.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-2">
                            {faculty.length > 0 ? faculty.map(fac => (
                                <div key={fac.id} className="p-2 bg-muted/50 rounded-md flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-sm">
                                            {fac.name} <Badge variant="secondary">{fac.role}</Badge>
                                            {fac.department && <span className="text-xs text-muted-foreground"> from {fac.department}</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{fac.email}</p>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={() => handleRemoveFaculty(fac.id)}
                                        disabled={currentFaculty?.id === fac.id}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )) : <p className="text-muted-foreground text-center pt-8">No faculty or admins match the current filters.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
