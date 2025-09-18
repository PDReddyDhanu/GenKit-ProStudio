
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, GalleryVertical, FileText, Github, Lightbulb, Trophy, Users, Handshake, Scale, BrainCircuit, Check, UsersRound, Award, Code, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from 'react';
import { useHackathon } from "@/context/HackathonProvider";

const FeatureCard = ({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) => (
    <div 
        className="group relative rounded-lg border border-border/40 bg-card/20 p-6 text-center transition-all duration-300 transform-gpu animate-card-in will-change-transform hover:[transform:perspective(1000px)_rotateX(var(--rotate-x,0))_rotateY(var(--rotate-y,0))_scale3d(1.05,1.05,1.05)]"
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseMove={(e) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateY = (x / rect.width - 0.5) * 20;
            const rotateX = (0.5 - y / rect.height) * 20;
            card.style.setProperty('--rotate-y', `${rotateY}deg`);
            card.style.setProperty('--rotate-x', `${rotateX}deg`);
        }}
        onMouseLeave={(e) => {
            const card = e.currentTarget;
            card.style.setProperty('--rotate-y', '0deg');
            card.style.setProperty('--rotate-x', '0deg');
        }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
        <div className="relative">
            <div className="mb-4 text-primary w-12 h-12 mx-auto flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))'}}>
                {icon}
            </div>
            <h3 className="text-xl font-bold font-headline text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);


const features = [
    { icon: <Users className="w-8 h-8" />, title: "Team Formation", description: "Easily register, create, and join teams to start collaborating." },
    { icon: <Lightbulb className="w-8 h-8" />, title: "AI Idea Generation", description: "Brainstorm project ideas with our intelligent suggestion system." },
    { icon: <Github className="w-8 h-8" />, title: "Project Submissions", description: "Seamlessly submit your projects with GitHub repository integration." },
    { icon: <BarChart className="w-8 h-8" />, title: "Live Leaderboard", description: "Track team progress in real-time with our dynamic leaderboard." },
    { icon: <FileText className="w-8 h-8" />, title: "AI Code Review", description: "Get instant, AI-powered feedback on your code submissions." },
    { icon: <GalleryVertical className="w-8 h-8" />, title: "Project Showcase", description: "A gallery of all submitted projects to celebrate the work." },
    { icon: <Scale className="w-8 h-8" />, title: "Fair Judging", description: "A dedicated portal for judges to score projects, enhanced with AI summaries." },
    { icon: <Handshake className="w-8 h-8" />, title: "Team Finder", description: "Discover teams or recruit members based on skills and interests." },
];

const partners = [
    { name: 'Cognizant', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg' },
    { name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
    { name: 'Infosys', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg' },
    { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
    { name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
    { name: 'Cisco', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg' },
];

const testimonials = [
  {
    quote: "HackSprint's AI tools gave our team the edge we needed. The code review was like having a senior dev on call 24/7!",
    name: "Aarav Sharma",
    role: "Winning Student, CodeCrafters",
  },
  {
    quote: "As a judge, the AI-generated summaries were a game-changer. I could grasp the core of each project instantly, making the scoring process faster and fairer.",
    name: "Priya Menon",
    role: "Hackathon Judge",
  },
  {
    quote: "Managing the entire event was seamless. The admin dashboard gave me a bird's-eye view of everything, from registrations to final reports.",
    name: "Dr. Rajesh Kumar",
    role: "Faculty Coordinator",
  },
];


export default function Home() {
  const { state } = useHackathon();
  const { selectedCollege } = state;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <section className="text-center min-h-[60vh] flex flex-col justify-center items-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent font-headline animate-slide-in-down">
                Welcome to HackSprint
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-slide-in-up">
                Your all-in-one platform for managing internal college hackathons. From registration to results, we've got you covered.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                <Button size="lg" asChild>
                    <Link href="/student">Get Started as Student</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                   <Link href="/judge">Enter as Judge or Admin</Link>
                </Button>
            </div>
        </section>

        <section className="py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-headline">Why Choose HackSprint?</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">An integrated platform designed to elevate your hackathon experience from start to finish.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center p-6 animate-card-in">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-primary"/>
                    <h3 className="text-xl font-bold font-headline">AI-Powered Assistance</h3>
                    <p className="text-muted-foreground mt-2">Leverage cutting-edge AI for idea generation, code reviews, project summaries, and more.</p>
                </Card>
                <Card className="text-center p-6 animate-card-in" style={{animationDelay: '200ms'}}>
                    <UsersRound className="w-12 h-12 mx-auto mb-4 text-primary"/>
                    <h3 className="text-xl font-bold font-headline">Seamless Collaboration</h3>
                    <p className="text-muted-foreground mt-2">Find teammates, manage your team, and communicate effectively all in one place.</p>
                </Card>
                 <Card className="text-center p-6 animate-card-in" style={{animationDelay: '400ms'}}>
                    <BarChart className="w-12 h-12 mx-auto mb-4 text-primary"/>
                    <h3 className="text-xl font-bold font-headline">Real-time Tracking</h3>
                    <p className="text-muted-foreground mt-2">Stay updated with a live leaderboard, announcements, and clear submission tracking.</p>
                </Card>
            </div>
        </section>

        <section className="py-24">
             <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">How It Works</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center animate-card-in">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/50 mb-4">
                        <span className="text-3xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="font-bold text-lg font-headline">Sign Up</h3>
                    <p className="text-sm text-muted-foreground">Register as a student for your college's event.</p>
                </div>
                 <div className="flex flex-col items-center animate-card-in" style={{animationDelay: '200ms'}}>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/50 mb-4">
                        <span className="text-3xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="font-bold text-lg font-headline">Form Your Team</h3>
                    <p className="text-sm text-muted-foreground">Create a new team or join an existing one with a code.</p>
                </div>
                 <div className="flex flex-col items-center animate-card-in" style={{animationDelay: '400ms'}}>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/50 mb-4">
                        <span className="text-3xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="font-bold text-lg font-headline">Build & Submit</h3>
                    <p className="text-sm text-muted-foreground">Use AI tools, collaborate, and submit your project.</p>
                </div>
                 <div className="flex flex-col items-center animate-card-in" style={{animationDelay: '600ms'}}>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/50 mb-4">
                        <span className="text-3xl font-bold text-primary">4</span>
                    </div>
                    <h3 className="font-bold text-lg font-headline">Compete & Win</h3>
                    <p className="text-sm text-muted-foreground">Get judged, climb the leaderboard, and win prizes!</p>
                </div>
             </div>
        </section>

        <section className="py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">A Feature for Every Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 [perspective:1000px]">
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

        <section className="py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">What People Are Saying</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <Card key={index} className="animate-card-in" style={{animationDelay: `${index * 150}ms`}}>
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
        </section>

        <section className="py-24">
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

         <section className="py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">Ready to Start Hacking?</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                Join your college's next big event. Register as a student or sign in as a judge to begin.
            </p>
             <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/student">I'm a Student</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                   <Link href="/judge">I'm a Judge / Admin</Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
