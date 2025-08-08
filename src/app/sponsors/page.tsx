import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

const sponsors = [
    {
        name: 'TechCorp',
        logo: 'https://placehold.co/300x150.png',
        description: 'Pioneering the future of technology with cutting-edge solutions.',
        website: '#',
        tier: 'Platinum',
        dataAiHint: 'technology circuit'
    },
    {
        name: 'Innovate Inc.',
        logo: 'https://placehold.co/300x150.png',
        description: 'Driving innovation through creative software and hardware.',
        website: '#',
        tier: 'Gold',
        dataAiHint: 'lightbulb gears'
    },
    {
        name: 'DevSolutions',
        logo: 'https://placehold.co/300x150.png',
        description: 'Providing robust development tools for modern programmers.',
        website: '#',
        tier: 'Gold',
        dataAiHint: 'code screen'
    },
    {
        name: 'CloudScale',
        logo: 'https://placehold.co/300x150.png',
        description: 'Scalable cloud infrastructure for applications of any size.',
        website: '#',
        tier: 'Silver',
        dataAiHint: 'cloud server'
    },
    {
        name: 'DataWeavers',
        logo: 'https://placehold.co/300x150.png',
        description: 'Interpreting complex data to provide actionable insights.',
        website: '#',
        tier: 'Silver',
        dataAiHint: 'data chart'
    },
    {
        name: 'StartupFuel',
        logo: 'https://placehold.co/300x150.png',
        description: 'Providing the seed funding that gets great ideas off the ground.',
        website: '#',
        tier: 'Bronze',
        dataAiHint: 'rocket launch'
    },
];

const tierStyles = {
    Platinum: 'border-primary shadow-lg shadow-primary/20',
    Gold: 'border-yellow-500',
    Silver: 'border-gray-400',
    Bronze: 'border-yellow-700'
};

const SponsorCard = ({ sponsor }: { sponsor: typeof sponsors[0] }) => (
    <Card className={`text-center flex flex-col items-center border-2 transition-transform hover:scale-105 ${tierStyles[sponsor.tier as keyof typeof tierStyles]}`}>
        <CardHeader className="w-full">
             <div className="relative w-full h-24 mb-4">
                 <Image 
                    src={sponsor.logo} 
                    alt={`${sponsor.name} logo`} 
                    layout="fill" 
                    objectFit="contain" 
                    data-ai-hint={sponsor.dataAiHint}
                 />
            </div>
            <CardTitle className="font-headline text-2xl">{sponsor.name}</CardTitle>
            <p className="font-semibold text-secondary">{sponsor.tier} Sponsor</p>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center">
            <p className="text-muted-foreground mb-4 flex-grow">{sponsor.description}</p>
            <Link href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Visit Website
            </Link>
        </CardContent>
    </Card>
);

export default function SponsorsPage() {
    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
            <section className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
                    Our Sponsors
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                    This event is made possible by the generous support of our sponsors.
                </p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sponsors.map(sponsor => (
                    <SponsorCard key={sponsor.name} sponsor={sponsor} />
                ))}
            </div>
        </div>
    );
}
