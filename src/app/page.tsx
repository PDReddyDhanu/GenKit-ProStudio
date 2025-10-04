
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, GalleryVertical, FileText, Github, Lightbulb, Trophy, Users, Handshake, Scale, BrainCircuit, Check, UsersRound, Award, Code, CheckCircle, Shield, Server, Search, CodeXml, User, Sun, Briefcase, University, FolderGit2, Building, Bot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHackathon } from "@/context/HackathonProvider";
import { COLLEGES } from "@/lib/colleges";
import GradientText from "@/components/ui/GradientText";
import { motion } from "framer-motion";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { AppLogo } from "@/components/layout/Header";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { StarButton } from "@/components/ui/star-button";
import AnimatedStat from "@/components/AnimatedStat";

const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) => (
    <ElectricBorder
        color="orange"
        speed={0.3}
        chaos={0.2}
        thickness={2}
        style={{ borderRadius: '0.5rem' }}
    >
        <div 
            className="group rounded-lg bg-card/80 p-6 text-center transition-all duration-300 transform-gpu animate-card-in will-change-transform h-full"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="relative">
                <div className="relative">
                    <div className="mb-4 text-primary w-12 h-12 mx-auto flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))'}}>
                        {icon}
                    </div>
                </div>
                <h3 className="text-xl font-bold font-headline text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    </ElectricBorder>
);


const features = [
    { icon: <Users className="w-8 h-8" />, title: "Team Formation", description: "Easily register, create, and join teams to start collaborating on projects." },
    { icon: <Lightbulb className="w-8 h-8" />, title: "AI Idea Generation", description: "Brainstorm project ideas with our intelligent suggestion system." },
    { icon: <Github className="w-8 h-8" />, title: "Project Submissions", description: "Seamlessly submit your project proposals and track their approval status." },
    { icon: <BarChart className="w-8 h-8" />, title: "Live Leaderboard", description: "Track project progress and performance with our dynamic leaderboard." },
    { icon: <FileText className="w-8 h-8" />, title: "AI Code Review", description: "Get instant, AI-powered feedback on your code." },
    { icon: <GalleryVertical className="w-8 h-8" />, title: "Project Showcase", description: "A gallery of all submitted projects to celebrate student work." },
    { icon: <Scale className="w-8 h-8" />, title: "Fair Evaluation", description: "A dedicated portal for faculty to evaluate projects with AI summaries." },
    { icon: <Handshake className="w-8 h-8" />, title: "Team Finder", description: "Discover teams or recruit members based on skills and interests." },
];

const partners = [
    { name: 'Cognizant', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg' },
    { name: 'Infosys', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg' },
    { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
    { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
    { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
    { name: 'Cisco', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg' },
];

const testimonials = [
  {
    quote: "GenKit ProStudio's AI tools gave our team the edge we needed. The abstract summarizer was a lifesaver!",
    name: "Ravi Kumar",
    role: "Student, CodeCrafters",
  },
  {
    quote: "As a guide, the AI-generated summaries were a game-changer. I could grasp the core of each project instantly.",
    name: "Dr. Priya Sharma",
    role: "Faculty Guide",
  },
  {
    quote: "Managing the entire project lifecycle was seamless. The admin dashboard gave me a bird's-eye view of everything.",
    name: "Prof. Arjun Mehra",
    role: "Head of Department",
  },
  {
    quote: "The AI Teammate Matchmaker is genius! It connected me with a team that had the exact skills we were missing.",
    name: "Ananya Reddy",
    role: "Student, Data Dynamos",
  },
  {
    quote: "I've never seen a student project platform this comprehensive. It handles everything from A to Z.",
    name: "Ben Carter",
    role: "Industry Mentor, Cognizant",
  },
  {
    quote: "Generating a presentation outline with the AI coach saved us hours. We could focus on building instead of worrying about slides.",
    name: "Fatima Al-Jamil",
    role: "Student, Cloud Nine",
  },
];


const faqItems = [
    {
        question: "How do I register as a student?",
        answer: "To register, navigate to the Student Portal, click 'Signup', fill in your details, and wait for admin approval. Once approved, you can start creating or joining project teams."
    },
    {
        question: "Can I join a project without a team?",
        answer: "Yes! You can register as an individual and then use our 'Team Finder' page. You can browse existing teams that are looking for members or use the AI Matchmaker to find students with complementary skills."
    },
    {
        question: "What kind of AI assistance does GenKit ProStudio offer?",
        answer: "The platform integrates AI at multiple stages, including an AI Idea Generator, an AI Code Reviewer, an AI Pitch Coach to create presentation outlines, and an AI Teammate Matchmaker to help you find collaborators."
    },
    {
        question: "Is GenKit ProStudio free for our college?",
        answer: "Yes, GenKit ProStudio is provided free of charge for internal college project management. Our goal is to foster innovation and streamline the academic project process for educational institutions."
    },
];

const HowItWorksAnimation = () => {
    const steps = [
        { title: "Sign Up", description: "Register as a student for your college's portal.", icon: <User className="w-6 h-6" />, position: { top: '8%', left: '10%' } },
        { title: "Form Team", description: "Create a new team or join an existing one with a code.", icon: <Users className="w-6 h-6" />, position: { top: '40%', left: '85%' } },
        { title: "Build & Submit", description: "Use AI tools, collaborate, and submit your project proposal.", icon: <Code className="w-6 h-6" />, position: { top: '70%', left: '5%' } },
        { title: "Get Evaluated", description: "Receive feedback and grades from faculty on the platform.", icon: <Trophy className="w-6 h-6" />, position: { top: '92%', left: '90%' } },
    ];
    
    const roadPath = "M 50 20 C 200 80, 200 120, 350 180 S 200 280, 50 320 S 200 420, 350 380";
    
    const arrowPath = "M2,2 L10,6 L2,10 L4,6 Z";
    const archerPath = "M45,15 C40,15 35,20 35,25 M45,15 C50,15 55,20 55,25 M45,15 L45,5 M35,25 L45,35 L55,25";

    return (
        <div className="relative w-full max-w-lg mx-auto h-[450px] md:h-[500px] md:max-w-2xl lg:max-w-4xl">
            <motion.svg 
                viewBox="0 0 400 400" 
                className="absolute inset-0 w-full h-full" 
                preserveAspectRatio="none"
            >
                <defs>
                    <radialGradient id="fireGradient">
                        <stop offset="0%" stopColor="hsl(var(--secondary))" />
                        <stop offset="50%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsla(var(--primary), 0)" />
                    </radialGradient>
                    <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--secondary))" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" />
                    </linearGradient>
                </defs>
                <path 
                    id="road-path"
                    d={roadPath}
                    fill="none" 
                    stroke="url(#roadGradient)" 
                    strokeWidth="3" 
                    strokeDasharray="10 5"
                    className="animate-road-draw"
                />
                
                <path d={archerPath} stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
                
                <g>
                    <motion.path
                        d={arrowPath}
                        fill="url(#fireGradient)"
                        className="drop-shadow-[0_0_4px_hsl(var(--primary))]"
                        style={{ scale: 1.5 }}
                    >
                        <animateMotion
                            dur="10s"
                            repeatCount="indefinite"
                            rotate="auto"
                            keyPoints="0;1"
                            keyTimes="0;1"
                        >
                            <mpath href="#road-path" />
                        </animateMotion>
                    </motion.path>
                     <motion.path
                        d={roadPath}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="1.5"
                        strokeDasharray="1000"
                        className="animate-flame-trail"
                    >
                     </motion.path>
                </g>

            </motion.svg>

            {steps.map((step, index) => (
                <div 
                    key={index}
                    className="absolute p-3 sm:p-4 max-w-[150px] sm:max-w-[200px] rounded-lg bg-card/80 backdrop-blur-sm border border-border shadow-lg animate-step-fade-in"
                    style={{ 
                        top: step.position.top, 
                        left: step.position.left, 
                        animationDelay: `${index * 2 + 1}s` 
                    }}
                >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                           {step.icon}
                        </div>
                        <h4 className="font-bold font-headline text-base sm:text-lg">{step.title}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                </div>
            ))}
        </div>
    );
};

const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
    <div className="text-center" data-animate-on-scroll>
        <div className="text-primary w-12 h-12 mx-auto mb-2 flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))'}}>
            {icon}
        </div>
        <AnimatedStat finalValue={value} />
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
);


export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center animate-fade-in">
            <div className="absolute inset-0 -z-10">
                <SpiralAnimation />
            </div>
            <GradientText
                colors={['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))']}
                animationSpeed={5}
                className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 font-headline animate-slide-in-down"
            >
                Welcome to GenKit ProStudio
            </GradientText>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-slide-in-up">
                Your all-in-one platform for managing academic projects. From proposals to final evaluations, we've got you covered.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                <StarButton asChild size="lg">
                    <Link href="/student">Get Started as Student</Link>
                </StarButton>
                <StarButton asChild size="lg" variant="secondary">
                   <Link href="/judge">Enter as Faculty or Admin</Link>
                </StarButton>
            </div>
        </section>

        <section className="py-24 scroll-m-20" data-animate-on-scroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-headline">Our Platform by the Numbers</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">Powering innovation and collaboration across leading academic institutions.</p>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                <StatItem icon={<Building className="w-8 h-8" />} value={643} label="Institutions" />
                <StatItem icon={<Users className="w-8 h-8" />} value={15700} label="Users Engaged" />
                <StatItem icon={<CodeXml className="w-8 h-8" />} value={3200} label="Projects Submitted" />
                <StatItem icon={<UsersRound className="w-8 h-8" />} value={1200} label="Faculty & Staff" />
                <StatItem icon={<University className="w-8 h-8" />} value={850} label="Departments Active" />
                <StatItem icon={<Bot className="w-8 h-8" />} value={25000} label="AI Reviews" />
            </div>
        </section>

        <section className="py-24 scroll-m-20" data-animate-on-scroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-headline">Why GenKit ProStudio?</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">An integrated platform designed to elevate your academic project experience from start to finish.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ElectricBorder
                    color="orange"
                    speed={0.3}
                    chaos={0.2}
                    thickness={2}
                    style={{ borderRadius: '0.75rem' }}
                >
                    <Card className="text-center p-6 h-full">
                        <div className="w-12 h-12 mx-auto mb-4 text-primary"><BrainCircuit /></div>
                        <h3 className="text-xl font-bold font-headline">AI-Powered Assistance</h3>
                        <p className="text-muted-foreground mt-2">Leverage cutting-edge AI for idea generation, code reviews, abstract summaries, and more.</p>
                    </Card>
                </ElectricBorder>
                <ElectricBorder
                    color="orange"
                    speed={0.3}
                    chaos={0.2}
                    thickness={2}
                    style={{ borderRadius: '0.75rem' }}
                >
                    <Card className="text-center p-6 h-full">
                        <UsersRound className="w-12 h-12 mx-auto mb-4 text-primary"/>
                        <h3 className="text-xl font-bold font-headline">Seamless Collaboration</h3>
                        <p className="text-muted-foreground mt-2">Find teammates, manage your team, and communicate effectively all in one place.</p>
                    </Card>
                </ElectricBorder>
                 <ElectricBorder
                    color="orange"
                    speed={0.3}
                    chaos={0.2}
                    thickness={2}
                    style={{ borderRadius: '0.75rem' }}
                 >
                    <Card className="text-center p-6 h-full">
                        <BarChart className="w-12 h-12 mx-auto mb-4 text-primary"/>
                        <h3 className="text-xl font-bold font-headline">Transparent Tracking</h3>
                        <p className="text-muted-foreground mt-2">Stay updated with a live leaderboard, announcements, and clear project approval tracking.</p>
                    </Card>
                </ElectricBorder>
            </div>
        </section>

        <section className="py-24 scroll-m-20" data-animate-on-scroll>
             <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">How It Works</h2>
             <HowItWorksAnimation />
        </section>

        <section className="py-24 scroll-m-20" id="roles" data-animate-on-scroll>
             <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-headline">Tailored for Everyone</h2>
             <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">A unique set of tools designed for every role in the academic ecosystem.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <ElectricBorder
                    color="orange"
                    speed={0.3}
                    chaos={0.2}
                    thickness={2}
                    style={{ borderRadius: '0.75rem' }}
                 >
                     <Card className="flex flex-col h-full">
                         <CardHeader>
                             <CardTitle className="flex items-center gap-3 font-headline text-2xl"><User className="text-primary"/> For Students</CardTitle>
                         </CardHeader>
                         <CardContent className="flex-grow space-y-3">
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Join teams or use the AI Matchmaker to find collaborators.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Brainstorm ideas with the AI Idea Generator.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Submit project proposals easily.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Get instant AI-powered code reviews.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Track your project's approval and evaluation status.</span></p>
                         </CardContent>
                     </Card>
                 </ElectricBorder>
                 <ElectricBorder
                    color="orange"
                    speed={0.3}
                    chaos={0.2}
                    thickness={2}
                    style={{ borderRadius: '0.75rem' }}
                 >
                     <Card className="flex flex-col h-full">
                         <CardHeader>
                             <CardTitle className="flex items-center gap-3 font-headline text-2xl"><Scale className="text-primary"/> For Faculty</CardTitle>
                         </CardHeader>
                         <CardContent className="flex-grow space-y-3">
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Access all student submissions in one dashboard.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Read AI-generated abstracts for quick evaluation.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Use a standardized rubric for fair and consistent scoring.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Follow a multi-level approval workflow (Guide → R&amp;D → HoD).</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Score both teams and individual contributions.</span></p>
                         </CardContent>
                     </Card>
                 </ElectricBorder>
                 <ElectricBorder
                    color="orange"
                    speed={0.3}
                    chaos={0.2}
                    thickness={2}
                    style={{ borderRadius: '0.75rem' }}
                 >
                     <Card className="flex flex-col h-full">
                         <CardHeader>
                             <CardTitle className="flex items-center gap-3 font-headline text-2xl"><Shield className="text-primary"/> For Admins</CardTitle>
                         </CardHeader>
                         <CardContent className="flex-grow space-y-3">
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Manage departments, users, and faculty roles.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Approve student and faculty registrations.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Broadcast announcements to all participants.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Monitor real-time analytics and generate reports.</span></p>
                             <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"/><span>Manage support tickets with AI triage.</span></p>
                         </CardContent>
                     </Card>
                 </ElectricBorder>
             </div>
         </section>

         <section className="py-24 scroll-m-20" data-animate-on-scroll>
             <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-headline">Meet Your AI Co-pilot</h2>
             <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">GenKit ProStudio integrates powerful AI tools at every stage of your project journey, acting as your personal assistant to help you succeed.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div className="relative flex justify-center items-center">
                    <svg width="250" height="250" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_hsl(var(--primary))]">
                        <defs>
                            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" style={{stopColor: 'hsl(var(--secondary))', stopOpacity: 1}} />
                                <stop offset="70%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0.9}} />
                                <stop offset="100%" style={{stopColor: 'hsl(var(--background))', stopOpacity: 0}} />
                            </radialGradient>
                            <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <g filter="url(#sunGlow)" transform="translate(50 50)">
                            {[...Array(12)].map((_, i) => (
                                <g key={i} transform={`rotate(${i * 30})`}>
                                    <path d="M 0 -40 C 10 -30, 10 -10, 0 -2" stroke="hsl(var(--primary) / 0.8)" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}/>
                                    <path d="M 0 -40 C -10 -30, -10 -10, 0 -2" stroke="hsl(var(--primary) / 0.8)" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDelay: `${i * 100}ms`}}/>
                                </g>
                            ))}
                            <circle cx="0" cy="0" r="22" fill="url(#sunGradient)" />
                            <circle cx="0" cy="0" r="18" fill="hsl(var(--background))" />
                            <text
                                x="0"
                                y="4"
                                fontFamily="monospace"
                                fontSize="12"
                                fill="hsl(var(--secondary))"
                                textAnchor="middle"
                                fontWeight="bold"
                            >
                                PDR
                            </text>
                        </g>
                    </svg>
                 </div>
                 <div className="space-y-8">
                     <div className="flex gap-4 items-start">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                             <Lightbulb className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                            <h4 className="font-bold text-lg font-headline">Ideate &amp; Plan</h4>
                            <p className="text-muted-foreground mt-1">Stuck for an idea? Use the AI Idea Generator. Need a presentation structure? The AI Pitch Coach has you covered.</p>
                         </div>
                     </div>
                      <div className="flex gap-4 items-start">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                             <UsersRound className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                            <h4 className="font-bold text-lg font-headline">Find Your Team</h4>
                            <p className="text-muted-foreground mt-1">Our AI Matchmaker analyzes skills and work styles to suggest the most compatible teammates for you.</p>
                         </div>
                     </div>
                      <div className="flex gap-4 items-start">
                         <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                             <CodeXml className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                            <h4 className="font-bold text-lg font-headline">Review &amp; Refine</h4>
                            <p className="text-muted-foreground mt-1">Get instant, automated feedback on your code quality with our AI Code Reviewer, helping you fix issues before submission.</p>
                         </div>
                     </div>
                 </div>
             </div>
        </section>
        <section className="py-24 scroll-m-20" data-animate-on-scroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">A Feature for Every Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {features.map((feature, index) => (
                    <FeatureCard 
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        index={index}
                    />
                 ))}
            </div>
        </section>

        <section className="py-24 scroll-m-20 w-full overflow-hidden" data-animate-on-scroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">What People Are Saying</h2>
            <div className="relative w-full">
                <div className="flex w-max scrolling-wrapper group-hover:pause">
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <ElectricBorder
                          key={index}
                          style={{ borderRadius: '0.75rem', margin: '0 1rem' }}
                          color="orange"
                          speed={0.3}
                          chaos={0.2}
                          thickness={2}
                        >
                            <Card className="w-[350px] flex-shrink-0 h-full">
                                <CardContent className="p-6">
                                    <p className="italic text-foreground">"{testimonial.quote}"</p>
                                    <div className="mt-4 text-right">
                                        <p className="font-bold font-headline">{testimonial.name}</p>
                                        <p className="text-sm text-primary">{testimonial.role}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </ElectricBorder>
                    ))}
                </div>
            </div>
        </section>


        <section className="py-24 scroll-m-20" data-animate-on-scroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Our Esteemed Partners</h2>
            <div className="bg-muted/50 rounded-lg p-8">
                 <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
                    {partners.map((partner) => (
                        <div key={partner.name} className="relative h-12 w-32 filter grayscale hover:filter-none transition-all duration-300">
                             <Image
                                src={partner.logo}
                                alt={`${partner.name} logo`}
                                fill
                                style={{ objectFit: 'contain' }}
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
         <section className="py-24 scroll-m-20" data-animate-on-scroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent>
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>


         <section className="py-24 text-center scroll-m-20" data-animate-on-scroll>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">Ready to Start Building?</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                Join your college's project hub. Register as a student or sign in as a faculty member to begin.
            </p>
             <div className="flex justify-center gap-4">
                <StarButton asChild size="lg">
                    <Link href="/student">I'm a Student</Link>
                </StarButton>
                <StarButton asChild size="lg" variant="secondary">
                   <Link href="/judge">I'm a Faculty / Admin</Link>
                </StarButton>
            </div>
        </section>
    </div>
  );
}








    

    
