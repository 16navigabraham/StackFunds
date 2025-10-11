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
import { useEffect, useState }from 'react';
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

  const { toast } = useToast();
  const router = useRouter();

  const checkSession = async () => {
    const session = await turnkey.getSession();
    if (session && session.expiry * 1000 > Date.now()) {
      setIsLoggedIn(true);
      setUser({
        organizationId: session.organizationId,
        // In a real app, you would fetch more user/wallet details here
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

      if (session) {
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        await checkSession();
        router.push("/wallet");
      }
    } catch (loginError) {
      console.log("Login failed, attempting signup:", loginError);
      // If login fails, it might be because the user is new. Let's try signup.
      try {
        const passkeyClient = turnkey.passkeyClient();
        const indexedDbClient = await turnkey.indexedDbClient();
        await indexedDbClient.init();
        const publicKey = await indexedDbClient.getPublicKey();

        // This requires a server-side endpoint to create a sub-organization.
        // For now, we assume the passkey is for the main org.
        // In a real multi-tenant app, you'd create a sub-org first.
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
            await checkSession();
            router.push("/wallet");
        }

      } catch (signupError) {
         console.error("Signup also failed:", signupError);
         toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: "Could not sign up or log in. Please try again.",
        });
      }
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
