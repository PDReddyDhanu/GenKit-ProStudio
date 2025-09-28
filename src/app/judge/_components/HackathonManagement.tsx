
"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader, CalendarIcon, RefreshCcw, X, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import type { Hackathon } from '@/lib/types';

const sampleRules = [
    // Sample 1: General Purpose
    "1. All team members must be current students of this college.\n2. Teams can have a maximum of 4 members.\n3. All code must be written during the project timeline.\n4. Use of open-source libraries is permitted.\n5. Projects will be evaluated on innovation, technical execution, and presentation.",
    // Sample 2: Focus on Originality
    "1. Your project must be a new idea, not a continuation of a previous project.\n2. Plagiarism is strictly forbidden and will result in immediate disqualification.\n3. All assets (code, design, sound) must be created during the event or be properly licensed.\n4. Teams must be prepared to show their commit history to verify work.",
    // Sample 3: Code of Conduct Focus
    "1. A positive and respectful attitude is required at all times.\n2. We have a zero-tolerance policy for harassment, discrimination, or any form of abuse.\n3. Be kind, be collaborative, and help each other.\n4. Report any issues to the organizing committee immediately.",
    // Sample 4: Submission Focused
    "1. All submissions must be made through the official portal before the deadline.\n2. A link to a public GitHub repository is mandatory.\n3. A short video demonstration (max 3 minutes) must be included in your submission.\n4. Late submissions will not be accepted under any circumstances.",
    // Sample 5: API Usage Rules
    "1. All teams are encouraged to use the sponsored APIs.\n2. Usage must adhere to the API provider's terms of service.\n3. Special prizes are available for the best use of specific APIs.\n4. Keys and tokens should be stored securely and not hardcoded.",
    // Sample 6: Hardware Track Rules
    "1. Teams are responsible for their own hardware.\n2. The organizers are not liable for any damage to personal equipment.\n3. A separate demonstration area will be provided for hardware projects.\n4. Safety first: all projects must be electrically safe.",
    // Sample 7: Beginner-Friendly Rules
    "1. This is a learning event! All skill levels are welcome.\n2. Mentors are available to help you. Don't be afraid to ask questions.\n3. The goal is to learn and build something you're proud of, not necessarily to win.\n4. Evaluation will consider the learning curve and effort of the team.",
    // Sample 8: Themed Event
    "1. All projects must adhere to this year's theme: [Insert Theme Here].\n2. The connection to the theme should be clearly explained in your project description and presentation.\n3. Creativity in interpreting the theme is highly encouraged.",
    // Sample 9: IP Rights
    "1. All intellectual property (IP) rights to the projects are retained by the participating teams.\n2. By submitting, you grant the organizers rights to showcase your project for promotional purposes.\n3. You are responsible for ensuring your project does not infringe on existing patents or copyrights.",
    // Sample 10: Detailed Evaluation Criteria
    "1. Evaluation will be based on: Technical Difficulty (30%), Creativity (30%), Impact (20%), and Presentation (20%).\n2. Each team will have 5 minutes to present, followed by a 3-minute Q&A with the faculty.\n3. The faculty's decisions are final.",
    // Sample 11: Team Formation Rules
    "1. You can form your team before or during the event.\n2. Individuals looking for a team can join the 'Team Finder' channel on our communication platform.\n3. Changes to team members are not allowed after the first 6 hours of the event.",
    // Sample 12: Minimalist Rules
    "1. Be excellent to each other.\n2. Build something cool.\n3. Submit on time.\n4. Have fun and learn something new.",
    // Sample 13: Corporate/Internal Project Rules
    "1. All participants must be employees of [Company Name].\n2. Projects should aim to solve an existing business problem or propose a new internal tool.\n3. Use of internal company APIs and data is encouraged, following security protocols.\n4. Top projects may be considered for further development and integration.",
    // Sample 14: Data Science/AI Project
    "1. All teams must use the provided dataset.\n2. External datasets can be used but must be publicly available and declared.\n3. Models must be trained during the project period.\n4. Your submission must include your model, training code, and a detailed report of your methodology.",
    // Sample 15: Health Tech Project
    "1. All projects must comply with data privacy standards (like HIPAA, if applicable).\n2. Solutions should address a real-world problem in healthcare or wellness.\n3. Consultation with medical professional mentors is highly recommended.\n4. Prototypes should be user-friendly for patients or healthcare providers."
];


function EditEventDialog({ event, onOpenChange, open }: { event: Hackathon, onOpenChange: (open: boolean) => void, open: boolean }) {
    const { api } = useHackathon();
    const [name, setName] = useState(event.name);
    const [prizeMoney, setPrizeMoney] = useState(event.prizeMoney);
    const [rules, setRules] = useState(event.rules);
    const [teamSizeLimit, setTeamSizeLimit] = useState(event.teamSizeLimit);
    const [deadline, setDeadline] = useState<Date | undefined>(new Date(event.deadline));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName(event.name);
            setPrizeMoney(event.prizeMoney);
            setRules(event.rules);
            setTeamSizeLimit(event.teamSizeLimit);
            setDeadline(new Date(event.deadline));
        }
    }, [open, event]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deadline) return;
        setIsLoading(true);
        try {
            await api.updateHackathon(event.id, {
                name,
                prizeMoney,
                rules,
                teamSizeLimit,
                deadline: deadline.getTime(),
            });
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Project Event</DialogTitle>
                    <DialogDescription>Make changes to the "{event.name}" event.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-event-name">Event Name</Label>
                        <Input id="edit-event-name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-prize-money">Prize/Award</Label>
                        <Input id="edit-prize-money" value={prizeMoney} onChange={e => setPrizeMoney(e.target.value)} required disabled={isLoading} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="edit-team-size">Max Team Size</Label>
                        <Input id="edit-team-size" type="number" value={teamSizeLimit} onChange={e => setTeamSizeLimit(Number(e.target.value))} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-deadline">Submission Deadline</Label>
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
                        <Label htmlFor="edit-rules">Rules & Regulations</Label>
                        <Textarea id="edit-rules" value={rules} onChange={e => setRules(e.target.value)} required disabled={isLoading} rows={6} />
                    </div>
                     <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function EventManagement() {
    const { state, api } = useHackathon();
    const { hackathons } = state;

    const [name, setName] = useState('');
    const [prizeMoney, setPrizeMoney] = useState('');
    const [rules, setRules] = useState('');
    const [teamSizeLimit, setTeamSizeLimit] = useState(4);
    const [deadline, setDeadline] = useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const [sampleIndex, setSampleIndex] = useState(-1);

    const [editingEvent, setEditingEvent] = useState<Hackathon | null>(null);

    const handleCreateEvent = async (e: React.FormEvent) => {
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
            setSampleIndex(-1);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUseSample = () => {
        const nextIndex = (sampleIndex + 1) % sampleRules.length;
        setSampleIndex(nextIndex);
        setRules(sampleRules[nextIndex]);
    };
    
    const handleClearRules = () => {
        setRules('');
        setSampleIndex(-1);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Create New Project Event</CardTitle>
                        <CardDescription>Define a new project event for your college.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="event-name">Event Name</Label>
                                <Input id="event-name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prize-money">Prize/Award</Label>
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
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="rules">Rules & Regulations</Label>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={handleUseSample} disabled={isLoading}>
                                            <RefreshCcw className="mr-2 h-3 w-3" /> Use Sample
                                        </Button>
                                         <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleClearRules} disabled={isLoading}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <Textarea id="rules" value={rules} onChange={e => setRules(e.target.value)} required disabled={isLoading} rows={8} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : 'Create Event'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Existing Project Events ({hackathons.length})</CardTitle>
                        <CardDescription>A list of all project events for this college.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hackathons.length > 0 ? (
                            hackathons.map(h => (
                                <Card key={h.id} className="bg-muted/50 flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{h.name}</CardTitle>
                                        <CardDescription>Deadline: {format(new Date(h.deadline), 'PPP')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p><strong>Prize/Award:</strong> {h.prizeMoney}</p>
                                        <p><strong>Team Limit:</strong> {h.teamSizeLimit}</p>
                                    </CardContent>
                                     <CardFooter className="bg-muted/80 px-6 py-3">
                                        <Button variant="outline" size="sm" onClick={() => setEditingEvent(h)}>
                                            <Pencil className="mr-2 h-4 w-4"/> Edit
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No project events have been created yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            {editingEvent && (
                <EditEventDialog 
                    event={editingEvent} 
                    open={!!editingEvent}
                    onOpenChange={(open) => !open && setEditingEvent(null)}
                />
            )}
        </div>
    );
}
