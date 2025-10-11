"use client";

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { projects, user } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { shortenAddress } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';
import { Clock, Users, Bitcoin, ShieldCheck } from 'lucide-react';
import { FundModal } from '@/components/FundModal';

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const project = projects.find((p) => p.id === params.id);

  const calculateTimeLeft = (days: number): Countdown => {
    const totalSeconds = days * 24 * 60 * 60;
    const [d, h, m, s] = [
      Math.floor(totalSeconds / (3600 * 24)),
      Math.floor((totalSeconds / 3600) % 24),
      Math.floor((totalSeconds / 60) % 60),
      Math.floor(totalSeconds % 60),
    ];
    return { days: d, hours: h, minutes: m, seconds: s };
  };

  const [timeLeft, setTimeLeft] = useState<Countdown>(
    calculateTimeLeft(project?.daysLeft ?? 0)
  );

  useEffect(() => {
    if (!project || project.daysLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const totalSeconds =
          prevTime.days * 86400 +
          prevTime.hours * 3600 +
          prevTime.minutes * 60 +
          prevTime.seconds -
          1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return calculateTimeLeft(totalSeconds / 86400);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [project]);

  if (!project) {
    notFound();
  }

  const progress = Math.min((project.raised / project.goal) * 100, 100);

  const countdownDisplay = useMemo(() => {
    if (project.daysLeft <= 0) return 'Ended';
    return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
  }, [timeLeft, project.daysLeft]);


  return (
    <>
      <div className="container mx-auto max-w-6xl py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
                <div className="relative h-64 md:h-96 w-full">
                    <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                        data-ai-hint={project.imageHint}
                        priority
                    />
                </div>
            </Card>

            <div className="mt-8">
              <h1 className="text-4xl font-bold font-headline mb-2">{project.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <span>Created by {project.creatorName}</span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <span>{shortenAddress(project.creatorAddress)}</span>
                  <CopyButton textToCopy={project.creatorAddress} />
                </div>
              </div>

              <Tabs defaultValue="about" className="w-full">
                <TabsList>
                  <TabsTrigger value="about">About Project</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                  <TabsTrigger value="supporters">Supporters</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-4 text-foreground/80 leading-relaxed">
                  {project.longDescription}
                </TabsContent>
                <TabsContent value="updates" className="mt-4">
                  {project.updates.length > 0 ? (
                     <div className="space-y-4">
                        {project.updates.map((update, i) => (
                            <div key={i}>
                                <p className="font-semibold">{new Date(update.date).toLocaleDateString()}</p>
                                <p className="text-muted-foreground">{update.text}</p>
                            </div>
                        ))}
                    </div>
                  ) : (
                    <p>No updates yet.</p>
                  )}
                </TabsContent>
                <TabsContent value="supporters" className="mt-4">
                   {project.supporters.length > 0 ? (
                     <div className="space-y-3">
                        {project.supporters.map((supporter) => (
                            <div key={supporter.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{supporter.address.slice(2,4)}</AvatarFallback>
                                    </Avatar>
                                    <p>{shortenAddress(supporter.address, 6)}</p>
                                </div>
                                <p className="font-semibold">{supporter.amount} sBTC</p>
                            </div>
                        ))}
                    </div>
                  ) : (
                    <p>Be the first to support this project!</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Funding Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Progress value={progress} className="h-3" />
                 <div>
                    <p className="text-2xl font-bold font-headline text-primary">
                        {project.raised.toLocaleString()} sBTC
                    </p>
                    <p className="text-sm text-muted-foreground">
                        raised of {project.goal} sBTC goal
                    </p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-xl font-bold">{progress.toFixed(0)}%</p>
                        <p className="text-sm text-muted-foreground">Funded</p>
                    </div>
                     <div>
                        <p className="text-xl font-bold">{countdownDisplay}</p>
                        <p className="text-sm text-muted-foreground">Time Left</p>
                    </div>
                 </div>
                 <Button size="lg" className="w-full text-lg h-12 transition-all duration-300 hover:shadow-lg hover:shadow-primary/50" onClick={() => setIsFundModalOpen(true)}>
                    <Bitcoin className="mr-2 h-5 w-5" />
                    Fund this Project
                 </Button>
                 <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <span>Funds locked for 3 days after goal.</span>
                 </div>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>My Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span className="font-bold">{user.balance} sBTC</span>
                </div>
                <Button variant="secondary" className="w-full">Top Up (Demo)</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <FundModal 
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        projectName={project.title}
      />
    </>
  );
}
