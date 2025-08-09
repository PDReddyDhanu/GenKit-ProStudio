import React, { useState, useEffect } from 'react';
import { useHackathon } from '../context/HackathonContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card } from '../components/ui/Card';
import { Textarea } from '../components/ui/Textarea';
import { Team, Project } from '../types';

const AuthMessage = ({ message, type }: { message: string | null, type: 'success' | 'error' }) => {
    if (!message) return null;
    const colors = type === 'success' ? 'bg-green-900/50 text-green-300 border-green-500' : 'bg-red-900/50 text-red-300 border-red-500';
    return (
        <div className={`p-3 mb-4 text-sm rounded-md border ${colors} animate-fade-in`}>
            {message}
        </div>
    )
}


const StudentPortal: React.FC = () => {
    const { state, dispatch } = useHackathon();
    const { currentUser, teams, projects, authError, successMessage } = state;

    const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    
    useEffect(() => {
        if(authError || successMessage){
            const timer = setTimeout(() => {
                dispatch({type: 'CLEAR_MESSAGES'});
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [authError, successMessage, dispatch]);

    const currentTeam: Team | undefined = teams.find(t => t.id === currentUser?.teamId);
    const currentProject: Project | undefined = projects.find(p => p.id === currentTeam?.projectId);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'REGISTER_STUDENT', payload: { name, email, password } });
        setName('');
        setEmail('');
        setPassword('');
    };
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'LOGIN_STUDENT', payload: { email, password } });
    }

    const switchMode = (mode: 'register' | 'login') => {
        dispatch({type: 'CLEAR_MESSAGES'});
        setAuthMode(mode);
        setName('');
        setEmail('');
        setPassword('');
    }

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'CREATE_TEAM', payload: { teamName } });
    };

    const handleJoinTeam = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'JOIN_TEAM', payload: { joinCode } });
    };
    
    const handleSubmitProject = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_PROJECT', payload: { name: projectName, description: projectDesc, githubUrl } });
    };

    if (!currentUser) {
        return (
            <div className="container max-w-md mx-auto py-12 animate-fade-in">
                <Card>
                    <div className="flex justify-center border-b border-dark-border mb-6">
                        <button
                            onClick={() => switchMode('register')}
                            className={`px-4 py-2 text-lg font-semibold transition-colors ${authMode === 'register' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-medium-text hover:text-light-text'}`}
                        >
                            Register
                        </button>
                        <button
                            onClick={() => switchMode('login')}
                            className={`px-4 py-2 text-lg font-semibold transition-colors ${authMode === 'login' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-medium-text hover:text-light-text'}`}
                        >
                            Login
                        </button>
                    </div>

                    <AuthMessage message={authError} type="error" />
                    <AuthMessage message={successMessage} type="success" />

                    {authMode === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                            <h2 className="text-2xl font-bold text-center">Student Registration</h2>
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                             <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Register</Button>
                        </form>
                    ) : (
                         <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                            <h2 className="text-2xl font-bold text-center">Student Login</h2>
                            <div>
                                <Label htmlFor="login-email">Email Address</Label>
                                <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up">
            <AuthMessage message={successMessage} type="success" />
            {!currentTeam ? (
                <div className="container max-w-4xl mx-auto py-12 grid md:grid-cols-2 gap-8">
                    <Card>
                        <h2 className="text-2xl font-bold mb-4">Create a New Team</h2>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <Label htmlFor="teamName">Team Name</Label>
                                <Input id="teamName" type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Create Team</Button>
                        </form>
                    </Card>
                    <Card>
                        <h2 className="text-2xl font-bold mb-4">Join an Existing Team</h2>
                        <form onSubmit={handleJoinTeam} className="space-y-4">
                            <div>
                                <Label htmlFor="joinCode">Team Join Code</Label>
                                <Input id="joinCode" type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} required />
                            </div>
                            <Button type="submit" variant="secondary" className="w-full">Join Team</Button>
                        </form>
                    </Card>
                </div>
            ) : !currentProject ? (
                 <div className="container max-w-3xl mx-auto py-12">
                    <Card>
                        <h2 className="text-3xl font-bold mb-2">Team: {currentTeam.name}</h2>
                        <p className="text-medium-text mb-1">Share this code to invite members: </p>
                        <p className="font-mono text-2xl text-brand-accent bg-dark-bg p-2 rounded-md inline-block mb-6">{currentTeam.joinCode}</p>
                        
                        <h3 className="text-2xl font-bold mb-4 border-t border-dark-border pt-6">Submit Your Project</h3>
                        <form onSubmit={handleSubmitProject} className="space-y-4">
                            <div>
                                <Label htmlFor="projectName">Project Name</Label>
                                <Input id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="projectDesc">Project Description</Label>
                                <Textarea id="projectDesc" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                                <Input id="githubUrl" type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Submit Project</Button>
                        </form>
                    </Card>
                </div>
            ) : (
                 <div className="container max-w-3xl mx-auto py-12">
                    <Card>
                        <h2 className="text-3xl font-bold text-brand-secondary">{currentProject.name}</h2>
                        <p className="text-lg text-medium-text mb-4">Submission successful!</p>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-bold">Team:</span> {currentTeam.name}</p>
                            <p><span className="font-bold">Description:</span> {currentProject.description}</p>
                            <p><span className="font-bold">GitHub:</span> <a href={currentProject.githubUrl} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">{currentProject.githubUrl}</a></p>
                        </div>
                        <div className="mt-6 border-t border-dark-border pt-4">
                            <h4 className="font-bold">Team Members:</h4>
                            <ul className="list-disc list-inside text-medium-text">
                                {currentTeam.members.map(m => <li key={m.id}>{m.name}</li>)}
                            </ul>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default StudentPortal;
