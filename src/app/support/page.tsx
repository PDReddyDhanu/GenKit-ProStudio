
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader, LifeBuoy } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import { AuthMessage } from '@/components/AuthMessage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SupportPage() {
    const { state, api, dispatch } = useHackathon();
    const { currentUser, hackathons } = state;
    const [showIntro, setShowIntro] = useState(true);
    
    const [subject, setSubject] = useState('');
    const [question, setQuestion] = useState('');
    const [hackathonId, setHackathonId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsLoading(true);
        try {
            await api.submitSupportTicket({
                studentId: currentUser.id,
                studentName: currentUser.name,
                studentEmail: currentUser.email,
                subject,
                question,
                hackathonId: hackathonId || null,
            });
            setSubject('');
            setQuestion('');
            setHackathonId(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<LifeBuoy className="w-full h-full" />} title="Support Center" description="Have a question or need help? Submit a ticket here." />;
    }

    if (!currentUser) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center font-headline">Support Center</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">Please log in as a student to submit a support ticket.</p>
                        <AuthMessage />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 animate-fade-in">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold font-headline">Support Center</h1>
                <p className="text-muted-foreground">Submit a ticket and an admin will assist you shortly.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">New Support Ticket</CardTitle>
                    <CardDescription>Please provide as much detail as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuthMessage />
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required disabled={isLoading} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hackathon">Related Hackathon (Optional)</Label>
                             <Select onValueChange={setHackathonId} value={hackathonId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a hackathon if applicable" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {hackathons.map(h => (
                                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="question">Question / Issue</Label>
                            <Textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} required disabled={isLoading} rows={8} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Submit Ticket'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
