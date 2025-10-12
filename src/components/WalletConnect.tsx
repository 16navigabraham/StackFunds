"use client";

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
import { useTurnkey } from "@turnkey/sdk-react";


export function WalletConnect() {
  const { user, logout } = useTurnkey();
  const { toast } = useToast();
  const router = useRouter();


  const handleLogout = async () => {
    await logout();
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
             {user.organization.organizationName ? shortenAddress(user.organization.organizationName, 6) : "Wallet"}
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
