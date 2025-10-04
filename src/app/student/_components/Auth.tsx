

"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { AuthMessage } from '@/components/AuthMessage';
import { Loader, CheckSquare, Sparkles, BookOpen } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import AccountStatusDialog from '@/components/AccountStatusDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import AppInput from '@/components/ui/AppInput';
import Image from 'next/image';

export default function Auth() {
    const { state, api, dispatch } = useHackathon();
    const { selectedCollege } = state;
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [branch, setBranch] = useState('');
    const [department, setDepartment] = useState('');
    const [section, setSection] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
    const [isStatusCheckOpen, setIsStatusCheckOpen] = useState(false);
    
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        const leftSection = e.currentTarget.getBoundingClientRect();
        setMousePosition({
        x: e.clientX - leftSection.left,
        y: e.clientY - leftSection.top
        });
    };

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRollNo('');
        setBranch('');
        setDepartment('');
        setSection('');
        setContactNumber('');
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
                await api.loginStudent({ email, password });
            } finally {
                setIsLoading(false);
            }
        } else {
            try {
                await api.registerStudent({ name, email, password, rollNo, branch, department, section, contactNumber });
                setIsLoginView(true);
                clearForm();
            } finally {
                setIsLoading(false);
            }
        }
    };

    const departments = Object.keys(DEPARTMENTS_DATA);
    const branches = department ? DEPARTMENTS_DATA[department as keyof typeof DEPARTMENTS_DATA] : [];

    return (
        <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
        <Dialog open={isStatusCheckOpen} onOpenChange={setIsStatusCheckOpen}>
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
                        <form className='text-center grid gap-2 h-full' onSubmit={handleSubmit}>
                            <div className='grid gap-4 md:gap-6 mb-2'>
                                <h1 className='text-3xl md:text-4xl font-extrabold text-[var(--color-heading)]'>{isLoginView ? 'Student Login' : 'Student Signup'}</h1>
                                <p className="text-sm text-[var(--color-text-secondary)]">{selectedCollege}</p>
                            </div>
                            <AuthMessage />
                             {!isLoginView && (
                                <div className='grid gap-4 items-center'>
                                    <AppInput placeholder="Full Name" type="text" value={name} onChange={(e:any) => setName(e.target.value)} required disabled={isLoading} />
                                    <AppInput placeholder="Roll Number" type="text" value={rollNo} onChange={(e:any) => setRollNo(e.target.value)} required disabled={isLoading}/>
                                    <AppInput placeholder="Contact Number" type="tel" value={contactNumber} onChange={(e:any) => setContactNumber(e.target.value)} required disabled={isLoading}/>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Select onValueChange={(value) => { setDepartment(value); setBranch(''); }} value={department} required>
                                            <SelectTrigger className="bg-[var(--color-surface)] border-2 border-[var(--color-border)]"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                            <SelectContent>{departments.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <Select onValueChange={setBranch} value={branch} required disabled={!department}>
                                            <SelectTrigger className="bg-[var(--color-surface)] border-2 border-[var(--color-border)]"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                            <SelectContent>{branches.map(b => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <AppInput placeholder="Enter Section (e.g., A, B, C)" value={section} onChange={(e:any) => setSection(e.target.value.toUpperCase())} required disabled={isLoading} maxLength={2} />
                                </div>
                            )}

                            <div className='grid gap-4 items-center'>
                                <AppInput placeholder="Email" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} required disabled={isLoading}/>
                                <AppInput placeholder="Password" type="password" value={password} onChange={(e:any) => setPassword(e.target.value)} required disabled={isLoading}/>
                            </div>
                            {isLoginView && (
                                <div className="flex justify-between items-center text-sm px-2">
                                     <DialogTrigger asChild>
                                         <Button variant="link" size="sm" className="p-0 h-auto text-[var(--color-text-secondary)] flex items-center gap-1" onClick={() => setIsStatusCheckOpen(true)}>
                                            <CheckSquare className="h-4 w-4" /> Check Status
                                         </Button>
                                     </DialogTrigger>
                                    <DialogTrigger asChild>
                                        <Button variant="link" size="sm" className="p-0 h-auto text-[var(--color-text-secondary)]" onClick={() => setIsForgotPassOpen(true)}>Forgot password?</Button>
                                    </DialogTrigger>
                                </div>
                            )}
                            <div className='flex gap-4 justify-center items-center mt-4'>
                                <button className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-primary px-8 py-2.5 text-md font-bold text-primary-foreground transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary/50 cursor-pointer" disabled={isLoading}>
                                    <span className="text-sm px-2 py-1">{isLoading ? <Loader className="animate-spin"/> : (isLoginView ? 'Sign In' : 'Sign Up')}</span>
                                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                                        <div className="relative h-full w-8 bg-white/20" />
                                    </div>
                                </button>
                            </div>
                            <div className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
                                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                                <Button variant="link" type="button" onClick={toggleView} className="p-1 text-primary">
                                    {isLoginView ? "Signup" : "Login"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='hidden lg:flex w-1/2 right h-full items-center justify-center overflow-hidden rounded-r-lg bg-cover bg-center relative' style={{backgroundImage: "url('https://picsum.photos/seed/students/1000/1000')"}} data-ai-hint="students collaborating">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                    <div className="relative z-10 p-12 text-white">
                        <Sparkles className="h-10 w-10 text-primary mb-4" />
                        <h1 className="font-headline text-4xl font-bold mb-2">Build Your Future</h1>
                        <p className="text-slate-300 mb-8">From idea to implementation, GenKit ProStudio is your partner in academic innovation.</p>
                        <ul className="space-y-4 text-left">
                            <li className="flex items-center gap-3"><BookOpen className="h-6 w-6 text-secondary"/> Turn concepts into reality.</li>
                            <li className="flex items-center gap-3"><BookOpen className="h-6 w-6 text-secondary"/> Collaborate with peers.</li>
                            <li className="flex items-center gap-3"><BookOpen className="h-6 w-6 text-secondary"/> Showcase your talent.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <ForgotPasswordDialog onOpenChange={setIsForgotPassOpen} userEmail={email} />
        <AccountStatusDialog onOpenChange={setIsStatusCheckOpen} />
        </Dialog>
        </Dialog>
    );
}
