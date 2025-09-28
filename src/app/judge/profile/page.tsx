
"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { User, Pencil, Loader, LayoutDashboard } from 'lucide-react';
import { AuthMessage } from '@/components/AuthMessage';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

export default function FacultyProfilePage() {
    const { state, api } = useHackathon();
    const { currentFaculty } = state;

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentFaculty?.name || '');
    const [gender, setGender] = useState(currentFaculty?.gender || '');
    const [contactNumber, setContactNumber] = useState(currentFaculty?.contactNumber || '');
    const [bio, setBio] = useState(currentFaculty?.bio || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      if(currentFaculty) {
        setName(currentFaculty.name);
        setGender(currentFaculty.gender || '');
        setContactNumber(currentFaculty.contactNumber || '');
        setBio(currentFaculty.bio || '');
      }
    }, [currentFaculty]);

    if (!currentFaculty) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Faculty Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-center text-muted-foreground">Please log in as a faculty member to view and edit your profile.</p>
                         <AuthMessage />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.updateFacultyProfile(currentFaculty.id, {
                name,
                gender,
                contactNumber,
                bio
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="container max-w-2xl mx-auto py-12 animate-fade-in">
             <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                            <User className="h-8 w-8 text-primary"/>
                            {currentFaculty.name}
                        </CardTitle>
                        <CardDescription>{currentFaculty.email} <Badge variant="outline">{currentFaculty.role}</Badge></CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                        <Pencil className="h-5 w-5" />
                        <span className="sr-only">Edit Profile</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled={isSaving} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactNumber">Contact Number</Label>
                                <Input id="contactNumber" value={contactNumber} onChange={e => setContactNumber(e.target.value)} disabled={isSaving} />
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
                                <Label htmlFor="bio">Short Bio / About</Label>
                                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="e.g., Senior Professor, passionate about AI." disabled={isSaving} />
                            </div>
                            
                            <div className="flex gap-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                             <div>
                                <h4 className="font-semibold text-muted-foreground">Contact Number</h4>
                                <p>{currentFaculty.contactNumber || 'Not provided'}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-muted-foreground">Gender</h4>
                                <p className="capitalize">{currentFaculty.gender || 'Not specified'}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-muted-foreground">About</h4>
                                <p>{currentFaculty.bio || 'No bio added yet.'}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button asChild variant="outline">
                        <Link href="/admin">
                            <LayoutDashboard className="mr-2 h-4 w-4"/> Go to Dashboard
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
