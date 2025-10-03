
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { Scale, Loader, Mail, Lock, Building, ArrowRight, Shield, UserCheck, Briefcase, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import AdminPortal from '@/app/admin/page';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import type { Faculty } from '@/lib/types';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';

const ROLES: Faculty['role'][] = ['guide', 'hod', 'rnd', 'external', 'academic-coordinator', 'class-mentor'];
const ROLE_DISPLAY_NAMES: { [key in Exclude<Faculty['role'], 'admin' | 'sub-admin'>]: string } = {
    'guide': 'Guide',
    'hod': 'HOD',
    'rnd': 'R&D Coordinator',
    'external': 'External',
    'academic-coordinator': 'Academic Coordinator',
    'class-mentor': 'Class Mentor',
};
const DESIGNATIONS: Faculty['designation'][] = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Professor', 'Adjunct Professor', 'Head of Department', 'Dean'];
const EDUCATIONS: Faculty['education'][] = ['PhD', 'M.Phil', 'M.Tech', 'M.Sc', 'M.A', 'M.Com', 'MBA', 'B.Tech', 'B.Sc', 'B.A', 'B.Com', 'Diploma', 'Other'];

export default function FacultyPortal() {
    const { state, api, dispatch } = useHackathon();
    const { currentFaculty, currentAdmin } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
    
    // Unified state for both login and registration
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Faculty['role'] | ''>('');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState<Faculty['gender'] | ''>('');
    const [designation, setDesignation] = useState<Faculty['designation'] | ''>('');
    const [education, setEducation] = useState<Faculty['education'] | ''>('');
    const [branch, setBranch] = useState('');
    const [department, setDepartment] = useState('');
    const [collegeName, setCollegeName] = useState('');

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
        setContactNumber('');
        setGender('');
        setDesignation('');
        setEducation('');
        setBranch('');
        setDepartment('');
        setCollegeName('');
        dispatch({ type: 'CLEAR_MESSAGES' });
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        clearForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (isLoginView) {
            try {
                await api.loginFaculty({ email, password });
            } catch (error) {
                // The provider will set the error message, so we just need to catch it here to prevent a crash
                console.error("Login failed:", error);
            }
            finally {
                setIsLoading(false);
            }
        } else {
            try {
                 const facultyData: Partial<Faculty> & { password?: string } = {
                    name,
                    email,
                    password,
                    role: role as Faculty['role'],
                    gender: gender as Faculty['gender'],
                    contactNumber,
                };
                if (role === 'external') {
                    facultyData.collegeName = collegeName;
                } else {
                    facultyData.designation = designation as Faculty['designation'];
                    facultyData.education = education as Faculty['education'];
                    facultyData.branch = branch;
                    facultyData.department = department;
                }
                await api.registerFaculty(facultyData);
                toggleView(); // Switch to login view on success
            } catch (error) {
                console.error("Registration failed:", error);
            }
            finally {
                setIsLoading(false);
            }
        }
    };
    
    const branches = Object.keys(DEPARTMENTS_DATA);
    const departments = branch ? DEPARTMENTS_DATA[branch as keyof typeof DEPARTMENTS_DATA] : [];

    if (showIntro && !currentFaculty && !currentAdmin) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Scale className="w-full h-full" />} title="Faculty Portal" description="Evaluate submissions, manage users, and run the project hub." />;
    }
    
    if (currentAdmin || currentFaculty) {
        return <AdminPortal/>
    }

    return (
        <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
            <div className="container max-w-4xl mx-auto py-12 animate-fade-in">
                 <div className="relative group overflow-hidden rounded-lg">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur-lg opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-glowing-border"></div>
                    <Card className="relative grid md:grid-cols-2">
                         <div className="p-8 bg-muted/30 rounded-l-lg">
                            <CardHeader className="p-0">
                                <CardTitle className="text-3xl font-bold font-headline text-primary">Faculty Portal</CardTitle>
                                <CardDescription>
                                    A unified entry point for all faculty and administrative roles.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 mt-6 space-y-4">
                                 <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-center gap-3"><UserCheck className="h-5 w-5 text-secondary"/> Guides & Mentors</li>
                                    <li className="flex items-center gap-3"><Building className="h-5 w-5 text-secondary"/> HoDs & R&amp;D Coordinators</li>
                                    <li className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-secondary"/> External Evaluators</li>
                                    <li className="flex items-center gap-3"><Shield className="h-5 w-5 text-secondary"/> College Sub-Admins</li>
                                </ul>
                                <div className="pt-6 border-t">
                                     <div className="flex flex-wrap gap-x-4 gap-y-2">
                                         <div>
                                            <p className="text-sm text-muted-foreground">Are you a student?</p>
                                             <Button variant="link" asChild className="px-0 -mt-1 h-auto">
                                                <Link href="/student">Go to Student Portal <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                             </Button>
                                         </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Main Developer?</p>
                                             <Button variant="link" asChild className="px-0 -mt-1 h-auto">
                                                <Link href="/admin">Main Admin Login <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                             </Button>
                                         </div>
                                     </div>
                                </div>
                            </CardContent>
                         </div>
                         <div className="p-8">
                            <CardHeader className="p-0 text-center">
                                <CardTitle className="text-2xl font-bold font-headline">{isLoginView ? 'Faculty Login' : 'Faculty Registration'}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <AuthMessage />
                                    {!isLoginView && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="role">Your Role</Label>
                                                    <Select onValueChange={(v) => setRole(v as any)} value={role} required>
                                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                                        <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{ROLE_DISPLAY_NAMES[r]}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="faculty-name">Full Name</Label>
                                                    <Input id="faculty-name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                                                </div>
                                            </div>
                                             <div className="space-y-2">
                                                <Label>Gender</Label>
                                                <RadioGroup onValueChange={(v) => setGender(v as any)} value={gender} className="flex gap-4 pt-2">
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Male" id="male" /><Label htmlFor="male">Male</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Female" id="female" /><Label htmlFor="female">Female</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Other" id="other" /><Label htmlFor="other">Other</Label></div>
                                                </RadioGroup>
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="contact-number">Contact Number</Label>
                                                <Input id="contact-number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required disabled={isLoading} />
                                            </div>
                                             {role === 'external' ? (
                                                <div className="space-y-2">
                                                    <Label htmlFor="college-name">Your College Name</Label>
                                                    <Input id="college-name" value={collegeName} onChange={e => setCollegeName(e.target.value)} required disabled={isLoading} />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Designation</Label>
                                                        <Select onValueChange={(v) => setDesignation(v as any)} value={designation} required>
                                                            <SelectTrigger><SelectValue placeholder="Select Designation" /></SelectTrigger>
                                                            <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Education</Label>
                                                        <Select onValueChange={(v) => setEducation(v as any)} value={education} required>
                                                            <SelectTrigger><SelectValue placeholder="Select Education" /></SelectTrigger>
                                                            <SelectContent>{EDUCATIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Branch</Label>
                                                        <Select onValueChange={(value) => { setBranch(value); setDepartment(''); }} value={branch} required>
                                                            <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                                            <SelectContent>{branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Department</Label>
                                                        <Select onValueChange={setDepartment} value={department} required disabled={!branch}>
                                                            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                            <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input 
                                            type="email" 
                                            placeholder="Email" 
                                            className="pl-10" 
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required 
                                            disabled={isLoading} 
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input 
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password" 
                                            className="pl-10 pr-10"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required 
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                    
                                     {isLoginView && (
                                        <div className="text-right text-sm">
                                            <DialogTrigger asChild>
                                                <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground" onClick={() => setIsForgotPassOpen(true)}>Forgot password?</Button>
                                            </DialogTrigger>
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                        {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Please wait...</> : (isLoginView ? 'Login' : 'Register')}
                                    </Button>
                                     <div className="text-center text-sm text-muted-foreground">
                                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                                        <Button variant="link" type="button" onClick={toggleView} className="p-1">
                                            {isLoginView ? "Register" : "Login"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </div>
                    </Card>
                </div>
                <ForgotPasswordDialog onOpenChange={setIsForgotPassOpen} userEmail={email} />
            </div>
        </Dialog>
    );
}

  