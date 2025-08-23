
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User, Judge } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useHackathon } from '@/context/HackathonProvider';

interface UserListsProps {
    approvedStudents: User[];
    judges: Judge[];
}

export default function UserLists({ approvedStudents, judges }: UserListsProps) {
    const { dispatch } = useHackathon();

    const handleRemoveStudent = (userId: string) => {
        dispatch({ type: 'REMOVE_STUDENT', payload: { userId } });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Approved Students ({approvedStudents.length})</CardTitle>
                    <CardDescription>List of all registered students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-2">
                            {approvedStudents.length > 0 ? approvedStudents.map(user => (
                                <div key={user.id} className="p-2 bg-muted/50 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => handleRemoveStudent(user.id)}>
                                        Remove
                                    </Button>
                                </div>
                            )) : <p className="text-muted-foreground text-center pt-8">No students have been approved.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Judges ({judges.length})</CardTitle>
                    <CardDescription>List of all registered judges.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-2">
                            {judges.length > 0 ? judges.map(judge => (
                                <div key={judge.id} className="p-2 bg-muted/50 rounded-md">
                                    <p className="font-semibold text-sm">{judge.name}</p>
                                    <p className="text-xs text-muted-foreground">{judge.email}</p>
                                </div>
                            )) : <p className="text-muted-foreground text-center pt-8">No judges have been added yet.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
