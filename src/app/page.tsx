import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/lib/mock-data';
import { Bitcoin } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="relative w-full text-center py-24 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent -z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

        <div className="container px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Bitcoin className="absolute -top-4 -left-12 text-primary/50 animate-bounce w-10 h-10" />
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                Fund Ideas. Empower Innovation.
              </h1>
            </div>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
              StackFund lets you support creative projects directly with sBTC —
              no barriers, no custodians.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                <Link href="/create">Create Campaign</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="transition-transform duration-300 hover:scale-105">
                <Link href="#projects">Explore Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="w-full py-16 lg:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-10 font-headline">
            Active Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
