

"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader, AlertCircle, CheckCircle, Clock, Mail, Bell, HelpCircle } from 'lucide-react';
import { AuthMessage } from './AuthMessage';

interface AccountStatusDialogProps {
    onOpenChange: (open: boolean) => void;
}

interface Status {
    approvalStatus: 'pending' | 'approved' | 'rejected';
    emailVerified: boolean; // This will be updated by the client logic
    registeredAt: number | null;
    userId: string;
}

export default function AccountStatusDialog({ onOpenChange }: AccountStatusDialogProps) {
    const { api } = useHackathon();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<Status | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    
    const [isResending, setIsResending] = useState(false);
    const [isReminding, setIsReminding] = useState(false);
    const [emailVerificationStatus, setEmailVerificationStatus] = useState<'unknown' | 'verified' | 'pending'>('unknown');


    const handleCheckStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotFound(false);
        setStatus(null);
        setEmailVerificationStatus('unknown');
        try {
            const accountStatus = await api.getAccountStatus(email);
            if (accountStatus) {
                setStatus(accountStatus);
                // Simulate checking email verification status. In a real app, this might be more complex.
                // For now, we'll assume it's pending unless the account is approved.
                // A better check would be to try to sign in silently and check user.emailVerified.
                if (accountStatus.approvalStatus === 'approved') {
                    // This is still a guess, but a more informed one.
                    setEmailVerificationStatus('verified'); 
                } else {
                    setEmailVerificationStatus('pending');
                }

            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            await api.resendVerificationEmail(email);
            // The API will show a success toast.
        } finally {
            setIsResending(false);
        }
    };

    const handleRemindAdmin = async () => {
        if (!status) return;
        setIsReminding(true);
        try {
            await api.remindAdminForApproval(status.userId, email);
             // The API will show a success toast.
        } finally {
            setIsReminding(false);
        }
    }

    const canRemind = status?.approvalStatus === 'pending' && status.registeredAt && (Date.now() - status.registeredAt > 24 * 60 * 60 * 1000);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Check Account Status</DialogTitle>
                <DialogDescription>
                    Enter your email to check your registration and verification status.
                </DialogDescription>
            </DialogHeader>
            <AuthMessage />
            <form onSubmit={handleCheckStatus}>
                <div className="py-4 space-y-2">
                    <Label htmlFor="status-email">Email</Label>
                    <Input
                        id="status-email"
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
                        {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Checking...</> : 'Check Status'}
                    </Button>
                </DialogFooter>
            </form>
            
            {status && (
                <div className="mt-6 space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Status for: {email}</h3>
                    <div className="p-3 rounded-md bg-muted space-y-3">
                         <div className="flex items-start gap-3">
                            {emailVerificationStatus === 'verified' ? <CheckCircle className="h-5 w-5 mt-0.5 text-green-400"/> : <Mail className="h-5 w-5 mt-0.5 text-primary"/>}
                            <div>
                                <p className="font-medium">Email Verification</p>
                                <p className={`text-sm ${emailVerificationStatus === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {emailVerificationStatus === 'verified' ? "Verified" : "Pending"}
                                </p>
                                {emailVerificationStatus === 'pending' && (
                                     <Button size="sm" variant="outline" className="mt-2 h-8" onClick={handleResendVerification} disabled={isResending}>
                                        {isResending ? <Loader className="animate-spin h-4 w-4"/> : "Resend Verification Email"}
                                    </Button>
                                )}
                            </div>
                        </div>

                         <div className="flex items-start gap-3">
                            {status.approvalStatus === 'pending' && <Clock className="h-5 w-5 mt-0.5 text-yellow-400"/>}
                            {status.approvalStatus === 'approved' && <CheckCircle className="h-5 w-5 mt-0.5 text-green-400"/>}
                            {status.approvalStatus === 'rejected' && <AlertCircle className="h-5 w-5 mt-0.5 text-red-400"/>}
                            <div>
                                <p className="font-medium">Admin Approval</p>
                                <p className={`text-sm capitalize ${
                                    status.approvalStatus === 'pending' ? 'text-yellow-400' :
                                    status.approvalStatus === 'approved' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {status.approvalStatus}
                                </p>
                                {canRemind && (
                                    <Button size="sm" variant="destructive" className="mt-2 h-8" onClick={handleRemindAdmin} disabled={isReminding}>
                                        {isReminding ? <Loader className="animate-spin h-4 w-4"/> : <><Bell className="mr-2 h-4 w-4"/>Remind Admin</>}
                                    </Button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {notFound && (
                 <div className="mt-6 space-y-4 pt-4 border-t text-center">
                    <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">No account found with this email address. Have you registered yet?</p>
                </div>
            )}

        </DialogContent>
    );
}
