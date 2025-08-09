"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Team } from '@/lib/types';

interface ProjectSubmissionProps {
    team: Team;
}

export default function ProjectSubmission({ team }: ProjectSubmissionProps) {
    const { dispatch } = useHackathon();
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    const handleSubmitProject = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_PROJECT', payload: { name: projectName, description: projectDesc, githubUrl } });
    };

    return (
        <div className="container max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">Team: {team.name}</CardTitle>
                    <CardDescription>
                        Share this code to invite members:
                        <span className="font-mono text-lg text-accent bg-muted p-2 rounded-md ml-2">{team.joinCode}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="border-t pt-6">
                    <h3 className="text-2xl font-bold mb-4 font-headline">Submit Your Project</h3>
                    <form onSubmit={handleSubmitProject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="projectDesc">Project Description</Label>
                            <Textarea id="projectDesc" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                            <Input id="githubUrl" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Submit Project</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
