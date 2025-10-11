"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Turnkey } from "@turnkey/sdk-browser";

const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
});

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const session = await turnkey.getSession();
      if (session && session.expiry * 1000 > Date.now()) {
        setIsLoggedIn(true);
        router.push("/wallet");
      }
    };
    checkLoginStatus();
  }, [router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="container max-w-3xl px-4 md:px-6 z-10 space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
          Welcome to StackFund
        </h1>
        <p className="mx-auto max-w-prose text-foreground/80 md:text-lg">
          Welcome to StackFund — Your Gateway to Seamless Web3 Payments.
          StackFund makes it effortless to receive crypto payments on Stacks Testnet.
          With Turnkey’s embedded wallet SDK, every payment link creator gets an instant wallet — no setup required.
          Simply create a payment link, share it, and receive funds directly to your wallet when payments are made.
          No custodians. No delays. Just fast, secure, decentralized payments.
        </p>
        <div className="flex justify-center">
          {!isLoggedIn && <WalletConnect />}
        </div>
      </div>
    </div>
  );
}
