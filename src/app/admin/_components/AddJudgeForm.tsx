
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

export default function AddJudgeForm() {
    const { api } = useHackathon();
    const [judgeName, setJudgeName] = useState('');
    const [judgeEmail, setJudgeEmail] = useState('');
    const [judgePassword, setJudgePassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState('');
    const [bio, setBio] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAddJudge = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.addJudge({ 
                name: judgeName, 
                email: judgeEmail, 
                password: judgePassword,
                gender,
                contactNumber,
                bio
            });
            setJudgeName('');
            setJudgeEmail('');
            setJudgePassword('');
            setContactNumber('');
            setGender('');
            setBio('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Add New Judge</CardTitle>
                <CardDescription>Create a new judge account with their details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddJudge} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="judge-name">Full Name</Label>
                            <Input id="judge-name" value={judgeName} onChange={e => setJudgeName(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="judge-email">Judge Email</Label>
                            <Input id="judge-email" type="email" placeholder="name@judge.com" value={judgeEmail} onChange={e => setJudgeEmail(e.target.value)} required disabled={isLoading} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="contact-number">Contact Number</Label>
                            <Input id="contact-number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required disabled={isLoading} />
                        </div>
                         <div className="space-y-2">
                            <Label>Gender</Label>
                            <RadioGroup onValueChange={setGender} value={gender} className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label htmlFor="male">Male</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="female" />
                                    <Label htmlFor="female">Female</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="other" />
                                    <Label htmlFor="other">Other</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Short Bio / Expertise</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g., Senior Software Engineer at Google, specialized in AI." disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="judge-password">Temporary Password</Label>
                        <Input id="judge-password" type="password" value={judgePassword} onChange={e => setJudgePassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Adding Judge...</> : 'Add Judge'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
