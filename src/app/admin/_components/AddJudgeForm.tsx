
"use client";

import React, { useState } from 'react';
import { useHackathon } from '@/context/HackathonProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader, Eye, EyeOff } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS_DATA } from '@/lib/constants';
import type { Faculty } from '@/lib/types';

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

export default function AddFacultyForm() {
    const { api } = useHackathon();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Faculty['role']>('guide');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState<Faculty['gender'] | ''>('');
    const [bio, setBio] = useState('');
    const [designation, setDesignation] = useState<Faculty['designation'] | ''>('');
    const [education, setEducation] = useState<Faculty['education'] | ''>('');
    const [branch, setBranch] = useState('');
    const [department, setDepartment] = useState('');
    const [collegeName, setCollegeName] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const isExternal = role === 'external';

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setContactNumber('');
        setGender('');
        setBio('');
        setDesignation('');
        setEducation('');
        setBranch('');
        setDepartment('');
        setCollegeName('');
    }
    
    const handleAddFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const facultyData: Partial<Faculty> & { password?: string } = {
                name,
                email,
                password,
                role,
                gender: gender as Faculty['gender'],
                contactNumber,
                bio,
            };

            if (isExternal) {
                facultyData.collegeName = collegeName;
            } else {
                facultyData.designation = designation as Faculty['designation'];
                facultyData.education = education as Faculty['education'];
                facultyData.branch = branch;
                facultyData.department = department;
            }

            await api.addFaculty(facultyData);
            clearForm();
        } finally {
            setIsLoading(false);
        }
    };
    
    const departments = Object.keys(DEPARTMENTS_DATA);
    const branches = department ? DEPARTMENTS_DATA[department as keyof typeof DEPARTMENTS_DATA] : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Add New Faculty/Admin</CardTitle>
                <CardDescription>Create a new account for a faculty member.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddFaculty} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select onValueChange={(value) => setRole(value as any)} value={role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{ROLE_DISPLAY_NAMES[r]}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="faculty-name">Full Name</Label>
                            <Input id="faculty-name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="faculty-email">Email</Label>
                            <Input id="faculty-email" type="email" placeholder="name@college.edu" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="contact-number">Contact Number</Label>
                            <Input id="contact-number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required disabled={isLoading} />
                        </div>
                         <div className="space-y-2">
                            <Label>Gender</Label>
                            <RadioGroup onValueChange={(v) => setGender(v as any)} value={gender} className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Male" id="male" />
                                    <Label htmlFor="male">Male</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Female" id="female" />
                                    <Label htmlFor="female">Female</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Other" id="other" />
                                    <Label htmlFor="other">Other</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {isExternal ? (
                             <div className="space-y-2">
                                <Label htmlFor="college-name">College Name</Label>
                                <Input id="college-name" value={collegeName} onChange={e => setCollegeName(e.target.value)} required disabled={isLoading} />
                            </div>
                        ) : (
                            <>
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
                                    <Label>Department</Label>
                                    <Select onValueChange={(value) => { setDepartment(value); setBranch(''); }} value={department} required>
                                        <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                        <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Branch</Label>
                                     <Select onValueChange={setBranch} value={branch} required disabled={!department}>
                                        <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                        <SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Short Bio / Expertise</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g., Senior Professor, specialized in AI." disabled={isLoading} />
                    </div>
                    <div className="space-y-2 relative">
                        <Label htmlFor="faculty-password">Temporary Password</Label>
                        <Input id="faculty-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Adding Account...</> : 'Add Faculty'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
