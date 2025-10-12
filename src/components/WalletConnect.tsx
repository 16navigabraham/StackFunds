"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function WalletConnect() {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('turnkey_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    // Clear stored data
    localStorage.removeItem('turnkey_user');
    localStorage.removeItem('turnkey_wallet');
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  if (user) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
             <Wallet className="mr-2 h-4 w-4" />
             {user.username ? shortenAddress(user.username, 6) : "Wallet"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
             <Link href="/wallet">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow duration-300 hover:shadow-primary/50 hover:shadow-lg">
      <Link href="/auth">
        <Wallet className="mr-2 h-4 w-4" />
        Get Started
      </Link>
    </Button>
  );
}
