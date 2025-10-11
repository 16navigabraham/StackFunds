import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/mock-data';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const progress = Math.min((project.raised / project.goal) * 100, 100);

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            data-ai-hint={project.imageHint}
          />
        </div>
      </CardHeader>
      <div className="flex flex-col flex-grow">
        <CardContent className="p-6 flex-grow">
          <CardTitle className="mb-2 text-xl font-headline">{project.title}</CardTitle>
          <CardDescription className="line-clamp-2">{project.shortDescription}</CardDescription>
          <p className="text-sm text-muted-foreground mt-4">By {project.creatorName}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">
                <span className="text-foreground font-bold">{progress.toFixed(0)}%</span> Funded
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{project.raised}</span> / {project.goal} sBTC
              </p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <Button asChild className="w-full">
            <Link href={`/projects/${project.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};
