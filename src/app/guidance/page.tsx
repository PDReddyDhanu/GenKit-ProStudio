
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Search, Newspaper, Code, Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import { fetchGuidanceInfo } from '@/app/actions';
import type { GuidanceInfo } from '@/ai/flows/fetch-guidance-info';
import Link from 'next/link';

type Category = 'hackathons' | 'tech_news' | 'jobs' | 'internships';

const categoryDetails = {
    hackathons: { icon: <Newspaper />, title: "Live Hackathons", placeholder: "e.g., AI, Web3, HealthTech" },
    tech_news: { icon: <Code />, title: "Latest Tech News", placeholder: "e.g., Google I/O, new frameworks" },
    jobs: { icon: <Briefcase />, title: "Job Opportunities", placeholder: "e.g., Software Engineer, Remote" },
    internships: { icon: <GraduationCap />, title: "Internship Openings", placeholder: "e.g., Summer 2025, Data Science" },
};


export default function GuidancePage() {

    const [activeTab, setActiveTab] = useState<Category>('hackathons');
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<GuidanceInfo[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const data = await fetchGuidanceInfo({ query, category: activeTab });
            setResults(data);
        } catch (err) {
            console.error(err);
            setError("Sorry, we couldn't fetch the information. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const { icon, title, placeholder } = categoryDetails[activeTab];

    return (
        <div className="container max-w-7xl mx-auto py-12 animate-fade-in">
            <section className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
                    Career & Tech Guidance
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                    Your real-time portal for hackathons, tech news, jobs, and internships.
                </p>
            </section>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Category)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="hackathons" className="flex items-center gap-2"><Newspaper /> Hackathons</TabsTrigger>
                    <TabsTrigger value="tech_news" className="flex items-center gap-2"><Code /> Tech News</TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center gap-2"><Briefcase /> Jobs</TabsTrigger>
                    <TabsTrigger value="internships" className="flex items-center gap-2"><GraduationCap /> Internships</TabsTrigger>
                </TabsList>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                            {icon}
                            {title}
                        </CardTitle>
                         <CardDescription>Search for the latest information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-8">
                            <Input 
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholder}
                                required
                                className="flex-grow"
                            />
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? <Loader className="animate-spin" /> : <Search />}
                                <span className="ml-2">Search</span>
                            </Button>
                        </form>

                        {isLoading && (
                             <div className="flex justify-center items-center h-64">
                                <Loader className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        )}

                        {error && <p className="text-destructive text-center">{error}</p>}
                        
                        {results.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((item, index) => (
                                    <Card key={index} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex flex-col">
                                            <p className="text-muted-foreground text-sm flex-grow mb-4">{item.snippet}</p>
                                             <Button asChild variant="outline" size="sm" className="mt-auto">
                                                <Link href={item.link} target="_blank" rel="noopener noreferrer">
                                                    Learn More <ExternalLink className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {!isLoading && !error && results.length === 0 && (
                             <div className="text-center py-16 text-muted-foreground">
                                <p>Enter a query and search to see results.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
