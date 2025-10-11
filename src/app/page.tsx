import { Button } from '@/components/ui/button';
import { Bitcoin, Wallet } from 'lucide-react';
import { WalletConnect } from '@/components/WalletConnect';

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
              <WalletConnect />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
