"use client";

import { useTurnkey } from "@/hooks/useTurnkey";
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shortenAddress } from "@/lib/utils";

export function WalletConnect() {
  const {
    user,
    isLoggedIn,
    login,
    logout,
    isConnecting,
    isCreating,
  } = useTurnkey();

  const buttonText = isConnecting
    ? 'Connecting...'
    : isCreating
    ? 'Creating Wallet...'
    : 'Connect Wallet';

  if (isLoggedIn && user) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
             <Wallet className="mr-2 h-4 w-4" />
             {user.wallets[0] ? shortenAddress(user.wallets[0].address) : "Wallet"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
             <Link href="/wallet">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={login}
      disabled={isConnecting || isCreating}
      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow duration-300 hover:shadow-primary/50 hover:shadow-lg"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
}
