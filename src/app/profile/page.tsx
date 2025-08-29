
"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Github, Linkedin, Pencil, UserCircle, Loader } from 'lucide-react';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';

export default function ProfilePage() {
    const { state, api } = useHackathon();
    const { currentUser } = state;
    const [showIntro, setShowIntro] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentUser?.name || '');
    const [skills, setSkills] = useState(currentUser?.skills?.join(', ') || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [github, setGithub] = useState(currentUser?.github || '');
    const [linkedin, setLinkedin] = useState(currentUser?.linkedin || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      if(currentUser) {
        setName(currentUser.name);
        setSkills(currentUser.skills?.join(', ') || '');
        setBio(currentUser.bio || '');
        setGithub(currentUser.github || '');
        setLinkedin(currentUser.linkedin || '');
      }
    }, [currentUser])

    const handleIntroFinish = () => {
        setShowIntro(false);
    };

    if (showIntro) {
        return <PageIntro onFinished={handleIntroFinish} icon={<UserCircle className="w-full h-full" />} title="Your Profile" description="Manage your personal details and skills." />;
    }

    if (!currentUser) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Profile Page</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-center text-muted-foreground">Please log in as a student to view and edit your profile.</p>
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
            await api.updateProfile(currentUser.id, {
                name,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
                bio,
                github,
                linkedin
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container max-w-3xl mx-auto py-12 animate-fade-in">
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                            <User className="h-8 w-8 text-primary" /> My Profile
                        </CardTitle>
                        <CardDescription>View and edit your personal information.</CardDescription>
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
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={isSaving} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skills">Skills (comma-separated)</Label>
                                <Input id="skills" value={skills} onChange={e => setSkills(e.target.value)} disabled={isSaving} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Short Bio</Label>
                                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} disabled={isSaving} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="github">GitHub Profile URL</Label>
                                <Input id="github" type="url" placeholder="https://github.com/username" value={github} onChange={e => setGithub(e.target.value)} disabled={isSaving} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                                <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/username" value={linkedin} onChange={e => setLinkedin(e.target.value)} disabled={isSaving} />
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
                                <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                            </div>
                             {currentUser.bio && (
                                <div>
                                    <h4 className="font-semibold text-muted-foreground">Bio</h4>
                                    <p>{currentUser.bio}</p>
                                </div>
                            )}
                            {currentUser.skills && currentUser.skills.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-muted-foreground mb-2">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {currentUser.skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-6">
                                {currentUser.github && (
                                    <a href={currentUser.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                                        <Github className="h-5 w-5" /> GitHub
                                    </a>
                                )}
                                {currentUser.linkedin && (
                                    <a href={currentUser.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                                        <Linkedin className="h-5 w-5" /> LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
