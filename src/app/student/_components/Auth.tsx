

"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import { Loader, Mail, Lock, User, CheckSquare } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import AccountStatusDialog from '@/components/AccountStatusDialog';

export default function Auth() {
    const { api, dispatch } = useHackathon();
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
    const [isStatusCheckOpen, setIsStatusCheckOpen] = useState(false);

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
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
                await api.registerStudent({ name, email, password });
                // On successful registration, switch to login view with a success message
                setIsLoginView(true);
                clearForm();
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="container max-w-md mx-auto py-12 animate-fade-in">
            <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
            <Dialog open={isStatusCheckOpen} onOpenChange={setIsStatusCheckOpen}>
                <Card className="relative group overflow-hidden">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur-lg opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-glowing-border"></div>
                    <div className="relative bg-card rounded-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-bold font-headline text-primary">
                                {isLoginView ? 'Login' : 'Signup'}
                            </CardTitle>
                            <CardDescription>
                                {isLoginView ? 'Login to your student account!' : 'Create a new student account!'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AuthMessage />
                                {!isLoginView && (
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
                                        type="password" 
                                        placeholder="Password" 
                                        className="pl-10" 
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required 
                                        disabled={isLoading}
                                    />
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
                                
                                <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                    {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Please wait...</> : (isLoginView ? 'Login' : 'Signup')}
                                </Button>

                                <div className="text-center text-sm text-muted-foreground">
                                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                                    <Button variant="link" type="button" onClick={toggleView} className="p-1">
                                        {isLoginView ? "Signup" : "Login"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </div>
                </Card>
                <ForgotPasswordDialog onOpenChange={setIsForgotPassOpen} userEmail={email} />
                <AccountStatusDialog onOpenChange={setIsStatusCheckOpen} />
            </Dialog>
            </Dialog>
        </div>
    );
}
