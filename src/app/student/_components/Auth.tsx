
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AuthMessage } from '@/components/AuthMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Loader } from 'lucide-react';

function ForgotPasswordDialog({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
    const { api } = useHackathon();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSent(false);
        try {
            await api.sendPasswordResetEmail(email);
            setIsSent(true);
        } catch (error) {
            // Error is handled by the provider's toast
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogDescription>
                    {isSent 
                        ? "A password reset link has been sent to your email address. Please check your inbox."
                        : "Enter your student email address, and we'll send you a link to reset your password."
                    }
                </DialogDescription>
            </DialogHeader>
            {!isSent ? (
                <form onSubmit={handlePasswordReset}>
                    <div className="py-4">
                        <Label htmlFor="reset-email" className="sr-only">Email</Label>
                        <Input
                            id="reset-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Sending...</> : 'Send Reset Link'}
                        </Button>
                    </DialogFooter>
                </form>
            ) : (
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            )}
        </DialogContent>
    );
}


export default function Auth() {
    const { api, dispatch } = useHackathon();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.registerStudent({ name, email, password });
            setName('');
            setEmail('');
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.loginStudent({ email, password });
        } finally {
            setIsLoading(false);
        }
    }

    const onTabChange = () => {
        dispatch({ type: 'CLEAR_MESSAGES' });
        setName('');
        setEmail('');
        setPassword('');
    }

    return (
        <div className="container max-w-md mx-auto py-12 animate-fade-in">
             <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
                <Tabs defaultValue="register" className="w-full" onValueChange={onTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="register">Register</TabsTrigger>
                        <TabsTrigger value="login">Login</TabsTrigger>
                    </TabsList>
                    <AuthMessage />
                    <TabsContent value="register">
                        <Card>
                            <CardHeader>
                                <h2 className="text-2xl font-bold text-center font-headline">Student Registration</h2>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Registering...</> : 'Register'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <h2 className="text-2xl font-bold text-center font-headline">Student Login</h2>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email Address</Label>
                                        <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                                    </div>
                                    <div className="text-right">
                                        <DialogTrigger asChild>
                                            <Button variant="link" size="sm" className="p-0 h-auto">Forgot Password?</Button>
                                        </DialogTrigger>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Logging in...</> : 'Login'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <ForgotPasswordDialog onOpenChange={setIsForgotPassOpen} />
            </Dialog>
        </div>
    );
}
