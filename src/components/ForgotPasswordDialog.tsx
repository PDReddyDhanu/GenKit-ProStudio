
"use client";

import React, { useState, useEffect } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader } from 'lucide-react';

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
                            disabled={isLoading || !!userEmail}
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
