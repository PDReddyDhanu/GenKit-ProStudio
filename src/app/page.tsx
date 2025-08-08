import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, FileText, Github, Lightbulb, Trophy, Users } from "lucide-react";
import Link from "next/link";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center flex flex-col items-center border-border/60 transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 animate-card-in hover:[transform:rotateX(var(--rotate-x,5deg))_rotateY(var(--rotate-y,5deg))_scale3d(1.05,1.05,1.05)]">
        <CardHeader>
            <div className="mb-4 text-primary">{icon}</div>
            <CardTitle className="font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
        <section className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent font-headline animate-slide-in-down">
                Welcome to HackSprint
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-slide-in-up">
                Your all-in-one platform for managing internal college hackathons. From registration to results, we&apos;ve got you covered.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                <Button size="lg" asChild>
                    <Link href="/student">Get Started as Student</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                   <Link href="/judge">Enter as Judge</Link>
                </Button>
            </div>
        </section>

        <section className="py-24">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 [perspective:1000px]">
                <FeatureCard
                    icon={<Users className="w-12 h-12" />}
                    title="Team Formation"
                    description="Easily register, create, and join teams to start collaborating."
                />
                <FeatureCard
                    icon={<Github className="w-12 h-12" />}
                    title="Project Submissions"
                    description="Seamlessly submit your projects with GitHub repository integration."
                />
                 <FeatureCard
                    icon={<FileText className="w-12 h-12" />}
                    title="AI Code Review"
                    description="Get instant, AI-powered feedback on your code submissions."
                />
                <FeatureCard
                    icon={<Lightbulb className="w-12 h-12" />}
                    title="AI Idea Generation"
                    description="Brainstorm project ideas with our intelligent suggestion system."
                />
                <FeatureCard
                    icon={<Trophy className="w-12 h-12" />}
                    title="Fair Judging"
                    description="A dedicated portal for judges to score projects, enhanced with AI summaries."
                />
                <FeatureCard
                    icon={<BarChart className="w-12 h-12" />}
                    title="Live Leaderboard"
                    description="Track team progress in real-time with our dynamic leaderboard."
                />
                 <FeatureCard
                    icon={<Users className="w-12 h-12" />}
                    title="Team Finder"
                    description="Discover teams or recruit members based on skills and interests."
                />
                 <FeatureCard
                    icon={<Trophy className="w-12 h-12" />}
                    title="Project Showcase"
                    description="A gallery of all submitted projects to celebrate the work."
                />
            </div>
        </section>
    </div>
  );
}
