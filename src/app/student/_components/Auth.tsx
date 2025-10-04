

"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import { Loader, Mail, Lock, User, CheckSquare, Library, BookUser, Building, Phone, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import AccountStatusDialog from '@/components/AccountStatusDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import type { User as UserType } from '@/lib/types';
import { StarButton } from '@/components/ui/star-button';

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
    
    const [showPassword, setShowPassword] = useState(false);


    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
    const [isStatusCheckOpen, setIsStatusCheckOpen] = useState(false);

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
                // On successful registration, switch to login view with a success message
                setIsLoginView(true);
                clearForm();
            } finally {
                setIsLoading(false);
            }
        }
    };

    const departments = Object.keys(DEPARTMENTS_DATA);
    const branches = branch ? DEPARTMENTS_DATA[branch as keyof typeof DEPARTMENTS_DATA] : [];

    return (
        <div className="container max-w-md mx-auto py-12 animate-fade-in">
            <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
            <Dialog open={isStatusCheckOpen} onOpenChange={setIsStatusCheckOpen}>
                <div className="relative group overflow-hidden rounded-lg">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur-lg opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-glowing-border"></div>
                    <Card className="relative">
                        <CardHeader className="text-center">
                             <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                                <Building className="h-4 w-4"/> {selectedCollege}
                            </div>
                            <CardTitle className="text-3xl font-bold font-headline text-primary">
                                {isLoginView ? 'Student Login' : 'Student Signup'}
                            </CardTitle>
                            <CardDescription>
                                {isLoginView ? 'Login to your student account!' : 'Create a new student account to get started.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AuthMessage />
                                {!isLoginView && (
                                    <>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Full Name"
                                                className="pl-10"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                         <div className="relative">
                                            <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Roll Number"
                                                className="pl-10"
                                                value={rollNo}
                                                onChange={e => setRollNo(e.target.value)}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="tel"
                                                placeholder="Contact Number"
                                                className="pl-10"
                                                value={contactNumber}
                                                onChange={e => setContactNumber(e.target.value)}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Select onValueChange={(value) => { setDepartment(value); setBranch(''); }} value={department} required>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map(d => (
                                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="relative">
                                                <Select onValueChange={setBranch} value={branch} required disabled={!department}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Branch" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {branches.map(b => (
                                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    placeholder="Enter Section (e.g., A, B, C)"
                                                    value={section}
                                                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                                                    required
                                                    disabled={isLoading}
                                                    maxLength={2}
                                                />
                                            </div>
                                        </div>
                                        
                                    </>
                                )}
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        type="email" 
                                        placeholder="Email Id" 
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
                                    <div className="flex justify-between items-center text-sm">
                                         <DialogTrigger asChild>
                                             <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground flex items-center gap-1" onClick={() => setIsStatusCheckOpen(true)}>
                                                <CheckSquare className="h-4 w-4" /> Check Status / Verify
                                             </Button>
                                         </DialogTrigger>
                                        <DialogTrigger asChild>
                                            <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground" onClick={() => setIsForgotPassOpen(true)}>Forgot password?</Button>
                                        </DialogTrigger>
                                    </div>
                                )}
                                
                                <StarButton type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Please wait...</> : (isLoginView ? 'Login' : 'Signup')}
                                </StarButton>

                                <div className="text-center text-sm text-muted-foreground">
                                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                                    <Button variant="link" type="button" onClick={toggleView} className="p-1">
                                        {isLoginView ? "Signup" : "Login"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <ForgotPasswordDialog onOpenChange={setIsForgotPassOpen} userEmail={email} />
                <AccountStatusDialog onOpenChange={setIsStatusCheckOpen} />
            </Dialog>
            </Dialog>
        </div>
    );
}
