"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('turnkey_user');
    const storedWallet = localStorage.getItem('turnkey_wallet');
    
    if (storedUser && storedWallet) {
      setUser(JSON.parse(storedUser));
      // Redirect to wallet if user is authenticated
      router.push("/wallet");
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, [router]);

  // Don't render anything until we know the user's auth status.
  // This prevents a flicker of the homepage content for logged-in users.
  if (isLoading || user) {
    return (
       <div className="flex flex-col flex-1 items-center justify-center text-center p-4">
          <p>Loading...</p>
       </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="container max-w-3xl px-4 md:px-6 z-10 space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-display">
          Welcome to StackFund
        </h1>
        <p className="mx-auto max-w-prose text-foreground/80 md:text-xl leading-relaxed font-light">
          Transform how you handle payments on Bitcoin's most innovative layer. 
          Create professional payment links instantly, accept STX tokens seamlessly, 
          and manage transactions with enterprise-grade security — all while maintaining complete control of your funds.
        </p>
        <p className="mx-auto max-w-prose text-foreground/70 text-base md:text-lg leading-relaxed">
          Built on Bitcoin's most advanced layer-2 solution, StackFund leverages Turnkey's enterprise-grade 
          wallet infrastructure to deliver instant, secure payment experiences. Generate shareable payment 
          links in seconds and receive STX tokens directly to your self-custody wallet — no technical 
          expertise required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center text-sm md:text-base text-foreground/60 font-medium">
          <span className="flex items-center gap-1.5">
            ✓ Non-custodial security
          </span>
          <span className="hidden sm:block text-foreground/30">•</span>
          <span className="flex items-center gap-1.5">
            ✓ Instant transactions
          </span>
          <span className="hidden sm:block text-foreground/30">•</span>
          <span className="flex items-center gap-1.5">
            ✓ Zero setup required
          </span>
        </div>
        <div className="flex justify-center">
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}
