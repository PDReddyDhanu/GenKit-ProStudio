
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddFacultyForm() {
    const { api } = useHackathon();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'guide' | 'hod' | 'rnd' | 'external' | 'admin'>('guide');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState('');
    const [bio, setBio] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAddFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.addFaculty({ 
                name, 
                email, 
                password,
                role,
                gender,
                contactNumber,
                bio
            });
            setName('');
            setEmail('');
            setPassword('');
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
                <CardTitle className="font-headline text-2xl">Add New Faculty/Admin</CardTitle>
                <CardDescription>Create a new faculty or administrator account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddFaculty} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="faculty-name">Full Name</Label>
                            <Input id="faculty-name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="faculty-email">Email</Label>
                            <Input id="faculty-email" type="email" placeholder="name@college.edu" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
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
                         <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select onValueChange={(value) => setRole(value as any)} value={role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guide">Guide</SelectItem>
                                    <SelectItem value="rnd">R&D Coordinator</SelectItem>
                                    <SelectItem value="hod">HoD</SelectItem>
                                    <SelectItem value="external">External Faculty</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Short Bio / Expertise</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g., Senior Professor, specialized in AI." disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="faculty-password">Temporary Password</Label>
                        <Input id="faculty-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Adding Account...</> : 'Add Faculty/Admin'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
