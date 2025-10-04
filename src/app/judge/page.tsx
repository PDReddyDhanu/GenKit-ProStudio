
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { AuthMessage } from '@/components/AuthMessage';
import PageIntro from '@/components/PageIntro';
import { Scale, Loader, ArrowRight, Shield } from 'lucide-react';
import AdminPortal from '@/app/admin/page';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import type { Faculty } from '@/lib/types';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import AppInput from '@/components/ui/AppInput';
import Image from 'next/image';

const ROLES: Faculty['role'][] = ['guide', 'hod', 'rnd', 'external', 'academic-coordinator', 'class-mentor'];
const ROLE_DISPLAY_NAMES: { [key in Exclude<Faculty['role'], 'admin' | 'sub-admin'>]: string } = {
    'guide': 'Guide',
    'hod': 'HOD',
    'rnd': 'R&D Coordinator',
    'external': 'External',
    'academic-coordinator': 'Academic Coordinator',
    'class-mentor': 'Class Mentor',
};
const DESIGNATIONS: Faculty['designation'][] = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Professor', 'Adjunct Professor', 'Head of Department', 'Dean', 'Principal', 'Director'];
const EDUCATIONS: Faculty['education'][] = ['PhD', 'M.Phil', 'M.Tech', 'M.Sc', 'M.A', 'M.Com', 'MBA', 'MCA', 'B.Tech', 'B.Sc', 'B.A', 'B.Com', 'Diploma', 'Other'];

export default function FacultyPortal() {
    const { state, api, dispatch } = useHackathon();
    const { currentFaculty, currentAdmin } = state;
    const [showIntro, setShowIntro] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
    
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Faculty['role'] | ''>('');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState<Faculty['gender'] | ''>('');
    const [designation, setDesignation] = useState<Faculty['designation'] | ''>('');
    const [education, setEducation] = useState<Faculty['education'] | ''>('');
    const [branch, setBranch] = useState('');
    const [department, setDepartment] = useState('');
    const [collegeName, setCollegeName] = useState('');

    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        const leftSection = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - leftSection.left, y: e.clientY - leftSection.top });
    };

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
                console.error("Login failed:", error);
            }
            finally {
                setIsLoading(false);
            }
        } else {
            try {
                 const facultyData: Partial<Faculty> & { password?: string } = {
                    name, email, password, role: role as Faculty['role'], gender: gender as Faculty['gender'], contactNumber,
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
                toggleView();
            } catch (error) {
                console.error("Registration failed:", error);
            }
            finally {
                setIsLoading(false);
            }
        }
    };
    
    const departments = Object.keys(DEPARTMENTS_DATA);
    const branches = department ? DEPARTMENTS_DATA[department as keyof typeof DEPARTMENTS_DATA] : [];

    if (showIntro && !currentFaculty && !currentAdmin) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Scale className="w-full h-full" />} title="Faculty Portal" description="Evaluate submissions, manage users, and run the project hub." />;
    }
    
    if (currentAdmin || currentFaculty) {
        return <AdminPortal/>
    }

    return (
        <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
            <div className="h-screen w-[100%] bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center p-4">
                <div className='card w-full lg:w-[70%] md:w-[85%] flex justify-between h-auto lg:h-[700px] shadow-xl rounded-lg bg-[var(--color-surface)]'>
                     <div
                        className='w-full lg:w-1/2 px-4 md:px-8 lg:px-12 py-10 left h-full relative overflow-hidden'
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}>
                        <div
                            className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-3xl transition-opacity duration-200 ${
                            isHovering ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                            transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
                            transition: 'transform 0.1s ease-out'
                            }}
                        />
                         <div className="form-container h-full z-10">
                            <form onSubmit={handleSubmit} className="text-center grid gap-2 h-full">
                                 <div className='grid gap-4 md:gap-6 mb-2'>
                                    <h1 className='text-3xl md:text-4xl font-extrabold text-[var(--color-heading)]'>{isLoginView ? 'Faculty/Admin Login' : 'Faculty Registration'}</h1>
                                </div>
                                <AuthMessage />
                                {!isLoginView && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="role">Your Role</Label>
                                                <Select onValueChange={(v) => setRole(v as any)} value={role} required>
                                                    <SelectTrigger className="bg-[var(--color-surface)] border-2 border-[var(--color-border)]"><SelectValue placeholder="Select Role" /></SelectTrigger>
                                                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{ROLE_DISPLAY_NAMES[r]}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <AppInput label="Full Name" value={name} onChange={(e:any) => setName(e.target.value)} required disabled={isLoading} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <RadioGroup onValueChange={(v) => setGender(v as any)} value={gender} className="flex gap-4 pt-2">
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="Male" id="male" /><Label htmlFor="male">Male</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="Female" id="female" /><Label htmlFor="female">Female</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="Other" id="other" /><Label htmlFor="other">Other</Label></div>
                                            </RadioGroup>
                                        </div>
                                         <AppInput label="Contact Number" value={contactNumber} onChange={(e:any) => setContactNumber(e.target.value)} required disabled={isLoading} />
                                         {role === 'external' ? (
                                            <AppInput label="Your College Name" value={collegeName} onChange={(e:any) => setCollegeName(e.target.value)} required disabled={isLoading} />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Designation</Label>
                                                    <Select onValueChange={(v) => setDesignation(v as any)} value={designation} required>
                                                        <SelectTrigger className="bg-[var(--color-surface)] border-2 border-[var(--color-border)]"><SelectValue placeholder="Select Designation" /></SelectTrigger>
                                                        <SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Education</Label>
                                                    <Select onValueChange={(v) => setEducation(v as any)} value={education} required>
                                                        <SelectTrigger className="bg-[var(--color-surface)] border-2 border-[var(--color-border)]"><SelectValue placeholder="Select Education" /></SelectTrigger>
                                                        <SelectContent>{EDUCATIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Department</Label>
                                                    <Select onValueChange={(value) => { setDepartment(value); setBranch(''); }} value={department} required>
                                                        <SelectTrigger className="bg-[var(--color-surface)] border-2 border-[var(--color-border)]"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                        <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Branch</Label>
                                                     <Select onValueChange={setBranch} value={branch} required disabled={!department}>
                                                        <SelectTrigger className="bg-[var(--color-surface)] border-2 border-[var(--color-border)]"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                                        <SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className='grid gap-4 items-center'>
                                  <AppInput placeholder="Email" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} required disabled={isLoading} />
                                  <AppInput placeholder="Password" type="password" value={password} onChange={(e:any) => setPassword(e.target.value)} required disabled={isLoading} />
                                </div>
                                {isLoginView && (
                                    <div className="text-right text-sm px-2">
                                        <DialogTrigger asChild>
                                            <Button variant="link" size="sm" className="p-0 h-auto text-[var(--color-text-secondary)]" onClick={() => setIsForgotPassOpen(true)}>Forgot password?</Button>
                                        </DialogTrigger>
                                    </div>
                                )}
                                <div className='flex gap-4 justify-center items-center mt-4'>
                                    <button className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-primary px-8 py-2.5 text-md font-bold text-primary-foreground transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary/50 cursor-pointer" disabled={isLoading}>
                                        <span className="text-sm px-2 py-1">{isLoading ? <Loader className="animate-spin"/> : (isLoginView ? 'Login' : 'Register')}</span>
                                        <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                                            <div className="relative h-full w-8 bg-white/20" />
                                        </div>
                                    </button>
                                </div>
                                <div className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
                                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                                    <Button variant="link" type="button" onClick={toggleView} className="p-1 text-primary">
                                        {isLoginView ? "Register" : "Login"}
                                    </Button>
                                </div>
                                <div className="pt-6 border-t border-[var(--color-border)]">
                                     <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                                         <div>
                                            <p className="text-sm text-[var(--color-text-secondary)]">Are you a student?</p>
                                             <Button variant="link" asChild className="px-0 -mt-1 h-auto text-secondary"><Link href="/student">Student Portal <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                                         </div>
                                          <div>
                                            <p className="text-sm text-[var(--color-text-secondary)]">Main Developer?</p>
                                             <Button variant="link" asChild className="px-0 -mt-1 h-auto text-secondary"><Link href="/admin">Main Admin Login <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                                         </div>
                                     </div>
                                </div>
                            </form>
                        </div>
                    </div>
                     <div className='hidden lg:block w-1/2 right h-full overflow-hidden rounded-r-lg'>
                        <Image
                        src='https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                        loader={({ src }) => src}
                        width={1000}
                        height={1000}
                        priority
                        alt="Team working in an office"
                        className="w-full h-full object-cover transition-transform duration-300 opacity-30"
                        />
                    </div>
                </div>
            </div>
            <ForgotPasswordDialog onOpenChange={setIsForgotPassOpen} userEmail={email} />
        </Dialog>
    );
}
