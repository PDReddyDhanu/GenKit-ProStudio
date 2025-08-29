
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function HackathonManagement() {
    const { state, api } = useHackathon();
    const { hackathons } = state;

    const [name, setName] = useState('');
    const [prizeMoney, setPrizeMoney] = useState('');
    const [rules, setRules] = useState('');
    const [teamSizeLimit, setTeamSizeLimit] = useState(4);
    const [deadline, setDeadline] = useState<Date>();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateHackathon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deadline) {
            alert("Please select a deadline.");
            return;
        }
        setIsLoading(true);
        try {
            await api.createHackathon({
                name,
                prizeMoney,
                rules,
                teamSizeLimit,
                deadline: deadline.getTime(),
            });
            setName('');
            setPrizeMoney('');
            setRules('');
            setTeamSizeLimit(4);
            setDeadline(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Create New Hackathon</CardTitle>
                        <CardDescription>Define a new hackathon event for your college.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateHackathon} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="hackathon-name">Hackathon Name</Label>
                                <Input id="hackathon-name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prize-money">Prize Money</Label>
                                <Input id="prize-money" value={prizeMoney} onChange={e => setPrizeMoney(e.target.value)} required disabled={isLoading} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="team-size">Max Team Size</Label>
                                <Input id="team-size" type="number" value={teamSizeLimit} onChange={e => setTeamSizeLimit(Number(e.target.value))} required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadline">Submission Deadline</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
                                            disabled={isLoading}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rules">Rules & Regulations</Label>
                                <Textarea id="rules" value={rules} onChange={e => setRules(e.target.value)} required disabled={isLoading} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : 'Create Hackathon'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Existing Hackathons ({hackathons.length})</CardTitle>
                        <CardDescription>A list of all hackathons for this college.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hackathons.length > 0 ? (
                            hackathons.map(h => (
                                <Card key={h.id} className="bg-muted/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{h.name}</CardTitle>
                                        <CardDescription>Deadline: {format(new Date(h.deadline), 'PPP')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p><strong>Prize:</strong> {h.prizeMoney}</p>
                                        <p><strong>Team Limit:</strong> {h.teamSizeLimit}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No hackathons have been created yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
