

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Github, Linkedin, Pencil, Loader, Download, Award, KeyRound, X } from 'lucide-react';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { generateCertificate } from '@/lib/pdf';
import { format } from 'date-fns';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WORK_STYLE_TAGS } from '@/lib/constants';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


function ChangePasswordCard() {
    const { api, dispatch } = useHackathon();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        dispatch({ type: 'CLEAR_MESSAGES' });
        try {
            await api.changePassword({ oldPassword, newPassword });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
             setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                        Change Your Password
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && <p className="text-sm text-red-500">{error}</p>}
                         <AuthMessage />
                        <div className="space-y-2">
                            <Label htmlFor="oldPassword">Old Password</Label>
                            <Input id="oldPassword" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={isLoading} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Changing...</> : 'Change Password'}
                        </Button>
                        <DialogTrigger asChild>
                            <Button variant="link" size="sm" className="p-0 h-auto">I forgot my password</Button>
                        </DialogTrigger>
                    </CardFooter>
                </form>
            </Card>
            <ForgotPasswordDialog onOpenChange={setIsForgotPassOpen} userEmail={''} />
        </Dialog>
    );
}


export default function ProfilePage() {
    const { state, api } = useHackathon();
    const { currentUser, projects, teams, hackathons, selectedCollege } = state;
    const [showIntro, setShowIntro] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentUser?.name || '');
    const [skills, setSkills] = useState(currentUser?.skills?.join(', ') || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [github, setGithub] = useState(currentUser?.github || '');
    const [linkedin, setLinkedin] = useState(currentUser?.linkedin || '');
    const [workStyle, setWorkStyle] = useState<string[]>(currentUser?.workStyle || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingCert, setIsGeneratingCert] = useState<string | null>(null);

    const userProjects = useMemo(() => {
        if (!currentUser) return [];
        // Find all teams the user is a member of
        const userTeamIds = teams.filter(t => t.members.some(m => m.id === currentUser.id)).map(t => t.id);
        // Find all projects submitted by those teams
        return projects.filter(p => userTeamIds.includes(p.teamId));
    }, [currentUser, teams, projects]);

    useEffect(() => {
      if(currentUser) {
        setName(currentUser.name);
        setSkills(currentUser.skills?.join(', ') || '');
        setBio(currentUser.bio || '');
        setGithub(currentUser.github || '');
        setLinkedin(currentUser.linkedin || '');
        setWorkStyle(currentUser.workStyle || []);
      }
    }, [currentUser]);

    const handleIntroFinish = () => {
        setShowIntro(false);
    };
    
     const handleDownloadCertificate = async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        const team = teams.find(t => t.id === project?.teamId);
        if (team && project && selectedCollege) {
            setIsGeneratingCert(projectId);
            try {
                const teamMembers = team.members.map(m => m.name);
                await generateCertificate(team.name, project.name, teamMembers, project.id, project.averageScore, selectedCollege);
            } catch (error) {
                console.error("Failed to generate certificate:", error);
                alert("Could not generate certificate. Please try again.");
            } finally {
                setIsGeneratingCert(null);
            }
        }
    };


    if (showIntro) {
        return <PageIntro onFinished={handleIntroFinish} icon={<User className="w-full h-full" />} title="Your Profile" description="Manage your personal details and skills." />;
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
                linkedin,
                workStyle
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };
    
    const toggleWorkStyleTag = (tag: string) => {
        setWorkStyle(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 animate-fade-in">
            <h1 className="text-4xl font-bold mb-8 font-headline">My Profile</h1>
             <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile"><User className="mr-2"/> Profile</TabsTrigger>
                    <TabsTrigger value="security"><KeyRound className="mr-2"/> Security</TabsTrigger>
                    <TabsTrigger value="certificates"><Award className="mr-2"/> My Certificates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
                     <Card>
                        <CardHeader className="flex flex-row justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                                    {currentUser.name}
                                </CardTitle>
                                <CardDescription>{currentUser.email}</CardDescription>
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
                                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                                        <Input id="skills" value={skills} onChange={e => setSkills(e.target.value)} required placeholder="React, Node.js, Python..." disabled={isSaving} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Work Style</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {WORK_STYLE_TAGS.map(tag => (
                                                <Badge
                                                    key={tag}
                                                    variant={workStyle.includes(tag) ? "default" : "secondary"}
                                                    onClick={() => toggleWorkStyleTag(tag)}
                                                    className="cursor-pointer"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Short Bio</Label>
                                        <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Passionate full-stack developer..." disabled={isSaving} />
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
                                    {currentUser.workStyle && currentUser.workStyle.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-muted-foreground mb-2">Work Style</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {currentUser.workStyle.map(style => (
                                                    <Badge key={style} variant="default">{style}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-6 pt-4 border-t">
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
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                    <ChangePasswordCard />
                </TabsContent>

                <TabsContent value="certificates" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                                My Certificates
                            </CardTitle>
                            <CardDescription>Download your certificates of participation and achievement.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {userProjects.length > 0 ? userProjects.map(p => {
                                    const hackathon = hackathons.find(h => h.id === p.hackathonId);
                                    return (
                                        <div key={p.id} className="p-4 bg-muted/50 rounded-md flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{p.name}</p>
                                                <p className="text-sm text-muted-foreground">{hackathon?.name} - {format(new Date(hackathon?.deadline || Date.now()), 'PPP')}</p>
                                            </div>
                                            <Button onClick={() => handleDownloadCertificate(p.id)} disabled={!!isGeneratingCert}>
                                                {isGeneratingCert === p.id ? <Loader className="animate-spin" /> : <Download />}
                                            </Button>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-muted-foreground text-center py-4">You have not submitted any projects yet. No certificates to show.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    
