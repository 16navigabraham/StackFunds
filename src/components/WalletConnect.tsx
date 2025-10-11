"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';
import Link from 'next/link';

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const userBalance = "0.1337";

  if (isConnected) {
    return (
      <Button variant="outline" asChild>
        <Link href="/wallet">
          <Wallet className="mr-2 h-4 w-4" />
          {userBalance} sBTC
        </Link>
      </Button>
    );
  }

  return (
    <Button onClick={() => setIsConnected(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow duration-300 hover:shadow-primary/50 hover:shadow-lg">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
