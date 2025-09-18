
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader, LifeBuoy, Wand2 } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import { AuthMessage } from '@/components/AuthMessage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusChecker from './_components/StatusChecker';
import { generateSupportResponse } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { marked } from 'marked';

export default function SupportPage() {
    const { state, api, dispatch } = useHackathon();
    const { currentUser, hackathons } = state;
    const [showIntro, setShowIntro] = useState(true);
    
    const [subject, setSubject] = useState('');
    const [question, setQuestion] = useState('');
    const [hackathonId, setHackathonId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

    const [isAiHelping, setIsAiHelping] = useState(false);
    const [aiHelpResponse, setAiHelpResponse] = useState<string | null>(null);
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsLoading(true);
        setSubmittedTicketId(null);
        try {
            const result = await api.submitSupportTicket({
                studentId: currentUser.id,
                studentName: currentUser.name,
                studentEmail: currentUser.email,
                subject,
                question,
                hackathonId: hackathonId && hackathonId !== 'none' ? hackathonId : null,
            });
            setSubmittedTicketId(result.id);
            setSubject('');
            setQuestion('');
            setHackathonId(undefined);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGetAiHelp = async () => {
        if (!subject && !question) {
            alert("Please enter a subject or question to get AI help.");
            return;
        }
        setIsAiHelping(true);
        setAiHelpResponse(null);
        try {
            const result = await generateSupportResponse({
                subject,
                question,
                category: "General Inquiry",
            });
            if (result) {
                setAiHelpResponse(result.resolution);
                setIsHelpDialogOpen(true);
            }
        } catch (error) {
            console.error("Failed to get AI help:", error);
            setAiHelpResponse("Sorry, couldn't get a suggestion at this time.");
            setIsHelpDialogOpen(true);
        } finally {
            setIsAiHelping(false);
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
        <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
            <div className="container max-w-2xl mx-auto py-12 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-headline">Support Center</h1>
                    <p className="text-muted-foreground">Get help or check the status of an existing ticket.</p>
                </div>
                
                <Tabs defaultValue="submit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="submit">Submit a Ticket</TabsTrigger>
                        <TabsTrigger value="status">Check Status</TabsTrigger>
                    </TabsList>
                    <TabsContent value="submit" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">New Support Ticket</CardTitle>
                                <CardDescription>Please provide as much detail as possible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AuthMessage />
                                {submittedTicketId && (
                                    <div className="mb-4 p-4 bg-green-900/50 text-green-300 border border-green-500 rounded-md">
                                        <p className="font-bold">Your ticket has been submitted successfully!</p>
                                        <p className="text-sm mt-1">Your Ticket ID is: <strong className="font-mono bg-background text-foreground px-2 py-1 rounded">{submittedTicketId}</strong></p>
                                        <p className="text-xs mt-2">Please save this ID to check the status of your ticket later.</p>
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required disabled={isLoading || isAiHelping} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hackathon">Related Hackathon (Optional)</Label>
                                        <Select onValueChange={setHackathonId} value={hackathonId} disabled={isLoading || isAiHelping}>
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
                                        <Textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} required disabled={isLoading || isAiHelping} rows={8} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button type="button" variant="outline" className="w-full" disabled={isAiHelping || isLoading} onClick={handleGetAiHelp}>
                                            {isAiHelping ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Getting Help...</> : <><Wand2 className="mr-2 h-4 w-4"/>Get Instant AI Help</>}
                                        </Button>
                                        <Button type="submit" className="w-full" disabled={isLoading || isAiHelping}>
                                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : 'Submit Ticket to Admin'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="status" className="mt-6">
                        <StatusChecker />
                    </TabsContent>
                </Tabs>
            </div>
             <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Wand2 className="text-primary"/> AI-Powered Suggestion</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-6">
                    {aiHelpResponse ? (
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: marked(aiHelpResponse) as string }}
                        />
                    ) : (
                        <p>No response generated.</p>
                    )}
                </ScrollArea>
                 <p className="text-sm text-muted-foreground mt-4">If this resolves your issue, you can simply close this window. Otherwise, feel free to submit the ticket to an admin.</p>
            </DialogContent>
        </Dialog>
    );
}
