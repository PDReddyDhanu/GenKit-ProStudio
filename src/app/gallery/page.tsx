"use client";

import React, { useState, useMemo } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import Image from 'next/image';
import { Github, GalleryVertical, Users, CheckCircle, Clock, Search } from 'lucide-react';
import PageIntro from '@/components/PageIntro';
import { AuthMessage } from '@/components/AuthMessage';
import { ProjectSubmission, Team, User } from '@/lib/types';
import { DEPARTMENTS_DATA } from '@/lib/constants';

const projectTypes = [
    { id: 'real-time-project', name: 'Real-Time Project' },
    { id: 'mini-project', name: 'Mini Project' },
    { id: 'major-project', name: 'Major Project' },
    { id: 'other-project', name: 'Other Project' }
];

const TeamProjectCard = ({ team, projects }: { team: Team, projects: ProjectSubmission[] }) => {
    if (projects.length === 0) return null;

    const primaryProject = projects[0];
    const teamProjects = projects.flatMap(p => p.projectIdeas.map(idea => ({ ...idea, submissionStatus: p.status })));
    
    return (
        <Card className="group relative flex flex-col transition-all duration-300 transform-gpu hover:scale-[1.02] hover:shadow-xl">
            {primaryProject.imageUrl && (
                <div className="relative h-48 w-full">
                    <Image 
                        src={primaryProject.imageUrl} 
                        alt={`${teamProjects[0].title} visualization`} 
                        fill 
                        className="object-cover rounded-t-lg"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                </div>
            )}
            <CardHeader className="pt-4">
                <CardTitle className="font-headline text-xl">{team.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> {team.members.length} members
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <Tabs defaultValue="idea-0" className="w-full">
                    <TabsList className={`grid w-full grid-cols-${teamProjects.length}`}>
                        {teamProjects.map((idea, index) => (
                            <TabsTrigger key={idea.id} value={`idea-${index}`}>Idea {index + 1}</TabsTrigger>
                        ))}
                    </TabsList>
                    {teamProjects.map((idea, index) => (
                        <TabsContent key={idea.id} value={`idea-${index}`} className="mt-4">
                             <div className="space-y-2">
                                <h4 className="font-bold text-primary">{idea.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">{idea.description}</p>
                                <div className="flex items-center gap-2 text-xs">
                                    {idea.submissionStatus === 'Approved' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}
                                    <span>Status: {idea.submissionStatus}</span>
                                </div>
                                {idea.githubUrl && (
                                     <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                        <Link href={idea.githubUrl} target="_blank" rel="noopener noreferrer">
                                            <Github className="mr-2 h-4 w-4" /> View on GitHub
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default function ProjectGallery() {
    const { state } = useHackathon();
    const { projects, teams, users, currentUser, currentFaculty } = state;
    const [showIntro, setShowIntro] = useState(true);

    const [selectedProjectType, setSelectedProjectType] = useState<string>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedSection, setSelectedSection] = useState<string>('all');

    const loggedInUser = currentUser || currentFaculty;

    const { filteredTeams, sections } = useMemo(() => {
        if (!loggedInUser) return { filteredTeams: [], sections: [] };

        const userDepartment = (loggedInUser as User).department || (loggedInUser as any).branch || 'all';

        const departmentFilter = selectedDepartment === 'all' ? userDepartment : selectedDepartment;

        const allSections = Array.from(new Set(users.filter(u => u.department === departmentFilter || u.branch === departmentFilter).map(u => u.section).filter(Boolean)));

        const teamsWithProjects = teams.filter(team => projects.some(p => p.teamId === team.id));

        const filtered = teamsWithProjects.filter(team => {
            const teamMembers = team.members.map(m => users.find(u => u.id === m.id)).filter(Boolean) as User[];
            if (teamMembers.length === 0) return false;

            const teamDepartment = teamMembers[0].department || teamMembers[0].branch;
            const teamSection = teamMembers[0].section;
            const teamProjectType = projects.find(p => p.teamId === team.id)?.hackathonId;

            const departmentMatch = departmentFilter === 'all' || teamDepartment === departmentFilter;
            const sectionMatch = selectedSection === 'all' || teamSection === selectedSection;
            const projectTypeMatch = selectedProjectType === 'all' || teamProjectType === selectedProjectType;

            return departmentMatch && sectionMatch && projectTypeMatch;
        });

        return { filteredTeams: filtered, sections: allSections };
    }, [loggedInUser, teams, projects, users, selectedDepartment, selectedSection, selectedProjectType]);
    
    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<GalleryVertical className="w-full h-full" />} title="Project Showcase" description="A gallery of all submitted projects to celebrate student work." />;
    }

    if (!loggedInUser) {
        return (
            <div className="container max-w-2xl mx-auto py-12 animate-fade-in text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Access Restricted</CardTitle>
                        <CardDescription>You must be logged in to view the project showcase.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AuthMessage />
                        <div className="flex gap-4 justify-center">
                             <Button asChild><Link href="/student">Student Portal</Link></Button>
                             <Button asChild variant="secondary"><Link href="/judge">Faculty Portal</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container max-w-7xl mx-auto py-12 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 font-headline">Project Showcase</h1>
                <p className="text-lg text-muted-foreground">Explore projects from {state.selectedCollege}</p>
            </div>

            <Card className="p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select onValueChange={setSelectedProjectType} defaultValue="all">
                        <SelectTrigger><SelectValue placeholder="Filter by Project Type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Project Types</SelectItem>
                            {projectTypes.map(pt => <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setSelectedDepartment} defaultValue={(loggedInUser as User).department || (loggedInUser as any).branch || 'all'}>
                        <SelectTrigger><SelectValue placeholder="Filter by Department..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {Object.keys(DEPARTMENTS_DATA).map(branch => (
                                <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select onValueChange={setSelectedSection} defaultValue="all" disabled={selectedDepartment === 'all'}>
                        <SelectTrigger><SelectValue placeholder="Filter by Section..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sections</SelectItem>
                            {sections.map(sec => <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </Card>
            
            {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTeams.map((team) => {
                        const teamProjects = projects.filter(p => p.teamId === team.id);
                        return <TeamProjectCard key={team.id} team={team} projects={teamProjects} />;
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto" />
                            <p className="mt-4 text-lg">No projects found for the selected filters.</p>
                            <p>Try adjusting your search criteria.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
