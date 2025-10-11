import { ProjectCard } from '@/components/ProjectCard';
import { projects } from '@/lib/mock-data';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative w-full text-center py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent -z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

        <div className="container px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                Fund Ideas. Empower Innovation.
              </h1>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
              StackFund is a decentralized crowdfunding platform built on Bitcoin. 
              Support the next wave of innovation with sBTC.
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-12 md:py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10 font-headline">Active Campaigns</h2>
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
