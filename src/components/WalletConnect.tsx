"use client";

import { Turnkey } from "@turnkey/sdk-browser";
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
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";


const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
});

export function WalletConnect() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { firestore, user: firebaseUser } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const checkSession = async () => {
    const session = await turnkey.getSession();
    if (session && session.expiry * 1000 > Date.now()) {
      setIsLoggedIn(true);
      setUser({
        organizationId: session.organizationId,
        wallets: [{ address: "Loading..."}] // Placeholder
      })
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
      const passkeyClient = turnkey.passkeyClient();
      const indexedDbClient = await turnkey.indexedDbClient();
      await indexedDbClient.init();
      const publicKey = await indexedDbClient.getPublicKey();
      
      const session = await passkeyClient.loginWithPasskey({
        sessionType: "SESSION_TYPE_READ_WRITE",
        publicKey,
        expirationSeconds: 900,
      });

      if (session && firebaseUser) {
        // This part would need adjustment as we don't have wallet details right away
        // For now, let's just log in and redirect
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        router.push("/wallet");
      }
      checkSession();
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Could not log in with passkey.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const logout = async () => {
    await turnkey.logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/");
  };


  const buttonText = isConnecting
    ? 'Connecting...'
    : 'Get Started';

  if (isLoggedIn && user) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
             <Wallet className="mr-2 h-4 w-4" />
             {user.organizationId ? shortenAddress(user.organizationId) : "Wallet"}
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
      disabled={isConnecting}
      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow duration-300 hover:shadow-primary/50 hover:shadow-lg"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
}
