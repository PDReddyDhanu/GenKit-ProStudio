
"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader, MailCheck } from 'lucide-react';

interface ForgotPasswordDialogProps {
    onOpenChange: (open: boolean) => void;
    userEmail?: string;
}

export default function ForgotPasswordDialog({ onOpenChange, userEmail }: ForgotPasswordDialogProps) {
    const { api } = useHackathon();
    const [email, setEmail] = useState(userEmail || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    useEffect(() => {
        if(userEmail) {
            setEmail(userEmail);
        }
    }, [userEmail]);

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
                <DialogTitle className="font-headline text-2xl">Forgot Your Password?</DialogTitle>
                 <DialogDescription>
                    {isSent 
                        ? "A password reset link has been sent. Please check your inbox."
                        : "No problem. Enter your email address and we'll send you a link to reset it."
                    }
                </DialogDescription>
            </DialogHeader>
            {isSent ? (
                <div className="py-8 text-center">
                    <MailCheck className="h-16 w-16 mx-auto text-green-500" />
                    <p className="mt-4 text-lg">Email Sent!</p>
                    <p className="text-muted-foreground">Please follow the instructions in the email to reset your password.</p>
                </div>
            ) : (
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
                            disabled={isLoading || !!userEmail}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Sending...</> : 'Send Reset Link'}
                        </Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
    );
}
