"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import PageIntro from '@/components/PageIntro';
import { Handshake } from 'lucide-react';

const partners = [
    {
        name: 'Cognizant',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg',
        description: 'A multinational technology company providing business consulting, IT, and outsourcing services.',
        website: 'https://www.cognizant.com/',
        tier: 'Platinum',
        dataAiHint: 'Cognizant logo'
    },
    {
        name: 'IBM',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
        description: 'A global technology corporation producing and selling computer hardware, middleware, and software.',
        website: 'https://www.ibm.com',
        tier: 'Platinum',
        dataAiHint: 'IBM logo'
    },
    {
        name: 'Infosys',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
        description: 'A global leader in next-generation digital services and consulting.',
        website: 'https://www.infosys.com/',
        tier: 'Gold',
        dataAiHint: 'Infosys logo'
    },
    {
        name: 'Salesforce',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
        description: 'A cloud-based software company specializing in customer relationship management (CRM) service.',
        website: 'https://www.salesforce.com/',
        tier: 'Gold',
        dataAiHint: 'Salesforce logo'
    },
    {
        name: 'SAP',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg',
        description: 'A multinational software corporation that develops enterprise software to manage business operations.',
        website: 'https://www.sap.com/',
        tier: 'Gold',
        dataAiHint: 'SAP logo'
    },
    {
        name: 'Cisco',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg',
        description: 'A worldwide leader in IT and networking that helps companies of all sizes transform how people connect.',
        website: 'https://www.cisco.com/',
        tier: 'Gold',
        dataAiHint: 'Cisco logo'
    },
    {
        name: 'Infosys Springboard',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
        description: 'A digital learning platform by Infosys, providing a plethora of courses for students and professionals.',
        website: 'https://www.infosys.com/springboard/',
        tier: 'Silver',
        dataAiHint: 'Infosys Springboard logo'
    },
    {
        name: 'Oracle',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
        description: 'A multinational computer technology corporation, known for its database software and technology.',
        website: 'https://www.oracle.com/',
        tier: 'Silver',
        dataAiHint: 'Oracle logo'
    },
    {
        name: 'AWS',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
        description: 'Amazon Web Services offers reliable, scalable, and inexpensive cloud computing services.',
        website: 'https://aws.amazon.com/',
        tier: 'Bronze',
        dataAiHint: 'AWS logo'
    }
];

const tierStyles = {
    Platinum: 'border-primary shadow-lg shadow-primary/20',
    Gold: 'border-yellow-500',
    Silver: 'border-gray-400',
    Bronze: 'border-yellow-700',
    Community: 'border-green-500'
};

const PartnerCard = ({ partner, index }: { partner: typeof partners[0], index: number }) => (
    <Card 
      className={`text-center flex flex-col items-center border-2 transition-all duration-300 transform-gpu animate-card-in ${tierStyles[partner.tier as keyof typeof tierStyles]}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
        <CardHeader className="w-full">
             <div className="relative w-full h-24 mb-4">
                 <Image 
                    src={partner.logo} 
                    alt={`${partner.name} logo`} 
                    layout="fill" 
                    objectFit="contain" 
                    data-ai-hint={partner.dataAiHint}
                    unoptimized // Added for SVG compatibility with external sources
                 />
            </div>
            <CardTitle className="font-headline text-2xl">{partner.name}</CardTitle>
            <p className="font-semibold text-secondary">{partner.tier} Partner</p>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center">
            <p className="text-muted-foreground mb-4 flex-grow">{partner.description}</p>
            <Link href={partner.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Visit Website
            </Link>
        </CardContent>
    </Card>
);

export default function PartnersPage() {
    const [showIntro, setShowIntro] = useState(true);

    if (showIntro) {
        return <PageIntro onFinished={() => setShowIntro(false)} icon={<Handshake className="w-full h-full" />} title="Our Partners" description="This event is made possible by the generous support of our partners." />;
    }

    // Sort partners by tier
    const sortedPartners = [...partners].sort((a, b) => {
        const tierOrder = { Platinum: 0, Gold: 1, Silver: 2, Bronze: 3, Community: 4 };
        return tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder];
    });

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
            <section className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
                    Our Partners
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                    This event is made possible by the generous support of our partners.
                </p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sortedPartners.map((partner, index) => (
                    <PartnerCard key={partner.name} partner={partner} index={index} />
                ))}
            </div>
        </div>
    );
}
