"use client";

import { Turnkey } from "@turnkey/sdk-browser";
import { Button } from "@/components/ui/button";
import { Wallet, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { shortenAddress } from "@/lib/utils";
import { useState, useEffect } from 'react';
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const checkSession = async () => {
    const session = await turnkey.getSession();
    if (session && session.expiry * 1000 > Date.now()) {
      setIsLoggedIn(true);
      setUser({
        organizationId: session.organizationId,
      })
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const onAuthSuccess = async () => {
    await checkSession();
    router.push("/wallet");
  }

  const handleLogin = async () => {
    setIsConnecting(true);
    setIsAuthModalOpen(false);
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

      if (session) {
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Could not log you in. Do you need to sign up instead?",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignup = async () => {
    setIsConnecting(true);
    setIsAuthModalOpen(false);
    try {
      const passkeyClient = turnkey.passkeyClient();
      const indexedDbClient = await turnkey.indexedDbClient();
      await indexedDbClient.init();
      const publicKey = await indexedDbClient.getPublicKey();

      const passkey = await passkeyClient.createUserPasskey({
         publicKey: {
           rp: { name: "StackFund" },
           user: { 
             name: `user-${Date.now()}`,
             displayName: `User ${Date.now()}`
           },
         },
       });

      const session = await passkeyClient.loginWithPasskey({
          sessionType: "SESSION_TYPE_READ_WRITE",
          publicKey,
          expirationSeconds: 900,
      });

      if (session) {
          toast({
              title: "Signup Successful",
              description: "Welcome to StackFund!",
          });
          onAuthSuccess();
      }
    } catch (error) {
       console.error("Signup failed:", error);
       toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Could not sign you up. Please try again.",
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
    <>
      <Button 
        onClick={() => setIsAuthModalOpen(true)}
        disabled={isConnecting}
        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow duration-300 hover:shadow-primary/50 hover:shadow-lg"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Get Started
      </Button>

      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Welcome to StackFund</DialogTitle>
            <DialogDescription className="text-center">
              Create a new account or sign in to your existing one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 pt-4">
            <Button onClick={handleSignup} disabled={isConnecting} size="lg">
              <UserPlus className="mr-2" /> Create New Account
            </Button>
            <Button onClick={handleLogin} disabled={isConnecting} variant="secondary" size="lg">
              <LogIn className="mr-2" /> Access Existing Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}