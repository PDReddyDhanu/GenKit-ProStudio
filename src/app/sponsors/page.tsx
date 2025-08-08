import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

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
        name: 'J.P. Morgan',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/J.P._Morgan_logo_2008.svg',
        description: 'A global leader in financial services, offering solutions to corporations, governments and individuals.',
        website: 'https://www.jpmorgan.com/',
        tier: 'Platinum',
        dataAiHint: 'JPMorgan logo'
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
        name: 'Tech Mahindra',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Tech_Mahindra_New_Logo.svg',
        description: 'A multinational company specializing in digital transformation, consulting and business re-engineering services.',
        website: 'https://www.techmahindra.com/',
        tier: 'Gold',
        dataAiHint: 'Tech Mahindra logo'
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
        name: 'EPAM',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Epam_logo.svg',
        description: 'A leading digital transformation services and product engineering company.',
        website: 'https://www.epam.com/',
        tier: 'Silver',
        dataAiHint: 'EPAM logo'
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
        name: 'Eduskills',
        logo: 'https://media.licdn.com/dms/image/D560BAQGw3a32TzGE6w/company-logo_200_200/0/1689230567246/eduskills_foundation_logo?e=2147483647&v=beta&t=Z1eO2sYw8z6q4c8J1kFp3sR-0fB5n8XlP-xKjJ4gY8w',
        description: 'A non-profit organization that enables a skilled and employable workforce in India.',
        website: 'https://eduskillsfoundation.org/',
        tier: 'Silver',
        dataAiHint: 'Eduskills logo'
    },
    {
        name: 'Internshala',
        logo: 'https://upload.wikimedia.org/wikipedia/en/2/2b/Internshala_logo.svg',
        description: 'An internship and online training platform, helping students to find internships with organisations in India.',
        website: 'https://internshala.com/',
        tier: 'Silver',
        dataAiHint: 'Internshala logo'
    },
    {
        name: 'Qlik',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Qlik_Logo.svg',
        description: 'A software company specializing in data visualization, business intelligence, and data analytics.',
        website: 'https://www.qlik.com/',
        tier: 'Silver',
        dataAiHint: 'Qlik logo'
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
        name: 'Talentio',
        logo: 'https://www.talentio.in/assets/images/logo/talentio-logo.png',
        description: 'A platform that helps companies hire the best tech talent with its skills-based assessment platform.',
        website: 'https://www.talentio.in/',
        tier: 'Bronze',
        dataAiHint: 'Talentio logo'
    },
    {
        name: 'TASK',
        logo: 'https://www.task.telangana.gov.in/assets/images/task_logo_new_2.png',
        description: 'Telangana Academy for Skill and Knowledge, enhancing employability quotient of youth in Telangana.',
        website: 'https://www.task.telangana.gov.in/',
        tier: 'Bronze',
        dataAiHint: 'TASK logo'
    },
    {
        name: 'Virtusa',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Virtusa_Logo.svg',
        description: 'A global provider of digital business strategy, digital engineering, and IT services and solutions.',
        website: 'https://www.virtusa.com/',
        tier: 'Bronze',
        dataAiHint: 'Virtusa logo'
    },
    {
        name: 'AWS',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
        description: 'Amazon Web Services offers reliable, scalable, and inexpensive cloud computing services.',
        website: 'https://aws.amazon.com/',
        tier: 'Bronze',
        dataAiHint: 'AWS logo'
    },
    {
        name: 'VJIT Photography Club',
        logo: 'https://vjit.ac.in/wp-content/uploads/2023/12/vjit-logo-1.png',
        description: 'The official photography and videography club of Vidya Jyothi Institute of Technology.',
        website: 'https://vjit.ac.in/campus-life-vjit/student-clubs/photography-club/',
        tier: 'Community',
        dataAiHint: 'camera lens'
    },
    {
        name: 'Instacks',
        logo: 'https://www.instacks.com/images/instacks-logo.svg',
        description: 'A community for developers and tech enthusiasts to learn, share, and grow together.',
        website: 'https://www.instacks.com/',
        tier: 'Community',
        dataAiHint: 'community people'
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
      className={`text-center flex flex-col items-center border-2 transition-all duration-300 transform-gpu hover:scale-105 hover:shadow-xl animate-card-in hover:[transform:rotateX(var(--rotate-x,5deg))_rotateY(var(--rotate-y,5deg))_scale3d(1.05,1.05,1.05)] ${tierStyles[partner.tier as keyof typeof tierStyles]}`}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 [perspective:1000px]">
                {sortedPartners.map((partner, index) => (
                    <PartnerCard key={partner.name} partner={partner} index={index} />
                ))}
            </div>
        </div>
    );
}
