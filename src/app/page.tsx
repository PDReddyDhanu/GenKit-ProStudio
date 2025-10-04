
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
import { motion, useInView } from "framer-motion";
import { AppLogo } from "@/components/layout/Header";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { StarButton } from "@/components/ui/star-button";
import { gsap } from 'gsap';
import DisplayCards from "@/components/ui/display-cards";
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";

const AnimatedStat = ({ finalValue }: { finalValue: number }) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView && ref.current) {
            const target = { val: 0 };
            gsap.to(target, {
                val: finalValue,
                duration: 2,
                ease: "power3.out",
                onUpdate: () => {
                    if (ref.current) {
                        const formattedValue = new Intl.NumberFormat('en-US').format(Math.round(target.val));
                        ref.current.textContent = `${formattedValue}+`;
                    }
                }
            });
        }
    }, [isInView, finalValue]);

    return (
        <p ref={ref} className="text-3xl md:text-4xl font-bold text-secondary">
            0+
        </p>
    );
};

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

  const whyCards: BentoItem[] = [
    {
      icon: <BrainCircuit className="w-4 h-4 text-amber-500" />,
      title: "AI-Powered",
      description: "Leverage cutting-edge AI for idea generation, code reviews, and pitch coaching.",
      tags: ["Genkit", "Gemini"],
      colSpan: 2,
      hasPersistentHover: true,
    },
    {
      icon: <UsersRound className="w-4 h-4 text-amber-500" />,
      title: "Collaboration",
      description: "Find teammates easily with our AI-powered matchmaker and manage your team.",
      tags: ["Team Finder", "Chat"],
    },
    {
      icon: <BarChart className="w-4 h-4 text-amber-500" />,
      title: "Real-time Tracking",
      description: "Monitor project approvals and see live leaderboards as scores come in.",
      tags: ["Live Data", "Transparency"],
    },
  ];

  const features: BentoItem[] = [
    {
        title: "Team Formation",
        description: "Easily register, create, and join teams to start collaborating on projects.",
        icon: <Users className="w-4 h-4 text-amber-500" />,
        status: "Active",
        tags: ["Teams", "Collaboration"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "AI Idea Generation",
        description: "Brainstorm project ideas with our intelligent suggestion system.",
        icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
        tags: ["AI", "Creativity"],
    },
    {
        title: "Project Submissions",
        description: "Seamlessly submit your project proposals and track their approval status.",
        icon: <Github className="w-4 h-4 text-amber-500" />,
        tags: ["Proposals", "Workflow"],
        colSpan: 2,
    },
    {
        title: "Live Leaderboard",
        description: "Track project progress and performance with our dynamic leaderboard.",
        icon: <BarChart className="w-4 h-4 text-amber-500" />,
        tags: ["Ranking", "Data"],
    },
    {
        title: "Fair Evaluation",
        description: "A dedicated portal for faculty to evaluate projects with AI summaries.",
        icon: <Scale className="w-4 h-4 text-amber-500" />,
        tags: ["Scoring", "Faculty"],
    },
    {
        title: "Team Finder",
        description: "Discover teams or recruit members based on skills and interests.",
        icon: <Handshake className="w-4 h-4 text-amber-500" />,
        status: "New",
        tags: ["Networking", "AI"],
        hasPersistentHover: true,
    },
  ];

  return (
    <>
      <div className="bg-black">
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center animate-fade-in container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
      </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-hidden">
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
                <BentoGrid items={whyCards} />
            </section>

            <section className="py-24 scroll-m-20" data-animate-on-scroll>
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">How It Works</h2>
                 <HowItWorksAnimation />
            </section>

            <section className="py-24 scroll-m-20" id="roles" data-animate-on-scroll>
                 <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-headline">Tailored for Everyone</h2>
                 <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">A unique set of tools designed for every role in the academic ecosystem.</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <BentoGrid items={features} />
            </section>

            <section className="py-24 scroll-m-20 w-full overflow-hidden" data-animate-on-scroll>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">What People Are Saying</h2>
                <div className="relative w-full">
                    <div className="flex w-max scrolling-wrapper group-hover:pause">
                        {[...testimonials, ...testimonials].map((testimonial, index) => (
                            <Card key={index} className="w-[350px] flex-shrink-0 mx-4">
                                <CardContent className="p-6">
                                    <p className="italic text-foreground">"{testimonial.quote}"</p>
                                    <div className="mt-4 text-right">
                                        <p className="font-bold font-headline">{testimonial.name}</p>
                                        <p className="text-sm text-primary">{testimonial.role}</p>
                                    </div>
                                </CardContent>
                            </Card>
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
    </>
  );
}

    