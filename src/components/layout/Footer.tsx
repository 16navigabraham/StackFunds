import { Github, Book } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-5 md:h-16 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built on Stacks | Powered by Turnkey Wallets
        </p>
        <div className="flex items-center gap-4">
          <Link href="#" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="#" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            <Book className="h-5 w-5" />
            <span className="sr-only">Docs</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
