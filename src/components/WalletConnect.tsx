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
import { useFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function WalletConnect() {
  const {
    user,
    isLoggedIn,
    handleLogin,
    logout,
    isConnecting,
    isCreating,
  } = useTurnkey();

  const { firestore, user: firebaseUser } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && user && user.wallets[0] && firestore && firebaseUser) {
      const turnkeyWallet = user.wallets[0];
      const userWalletRef = doc(firestore, `users/${firebaseUser.uid}/wallets/${turnkeyWallet.id}`);

      const walletData = {
        id: turnkeyWallet.id,
        userId: firebaseUser.uid,
        username: user.organizationId, // Using organizationId as username
        embeddedWalletAddress: turnkeyWallet.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setDocumentNonBlocking(userWalletRef, walletData, { merge: true });

      toast({
        title: "Wallet Connected",
        description: `Your wallet ${shortenAddress(turnkeyWallet.address)} has been connected and saved.`,
      });
      router.push("/wallet");
    }
  }, [isLoggedIn, user, firestore, firebaseUser, toast, router]);

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
      onClick={handleLogin}
      disabled={isConnecting || isCreating}
      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow duration-300 hover:shadow-primary/50 hover:shadow-lg"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
}
