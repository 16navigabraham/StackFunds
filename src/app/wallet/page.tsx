"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Download, Loader2 } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { shortenAddress } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Turnkey } from '@turnkey/sdk-browser';
import type { TWallet } from '@turnkey/sdk-browser';

const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
});

export default function WalletDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [wallets, setWallets] = useState<TWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndWallets = async () => {
      setIsLoading(true);
      try {
        const session = await turnkey.getSession();
        if (session) {
          setUser({
            organizationId: session.organizationId,
          });
          const walletData = await turnkey.getWallets();
          setWallets(walletData.wallets);
        }
      } catch (e) {
        console.error("Error fetching user or wallets", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndWallets();
  }, []);

  const walletAddress = wallets[0]?.accounts[0]?.address ?? '';
  const username = user?.organizationId ?? '';
  // TODO: Fetch real balance from Stacks API
  const balance = 0.00;

  return (
    <div className="container max-w-5xl py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Wallet Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Wallet</CardTitle>
              {isLoading ? (
                <Skeleton className="h-5 w-40 mt-1" />
              ) : (
                <CardDescription>Welcome, {shortenAddress(username, 6)}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold font-mono">{balance.toFixed(4)} <span className="text-2xl text-muted-foreground">sBTC</span></div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-mono text-muted-foreground">{shortenAddress(walletAddress, 8)}</span>
                    <CopyButton textToCopy={walletAddress} />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" disabled><Send className="mr-2 h-4 w-4" /> Send</Button>
                    <Button variant="secondary" className="flex-1" disabled><Download className="mr-2 h-4 w-4" /> Receive</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Payment Link */}
        <div className="md:col-span-2">
          <Card className="flex flex-col items-center justify-center text-center h-full p-6">
            <CardHeader>
              <CardTitle className="font-headline">Create Payment Link</CardTitle>
              <CardDescription>
                Generate a unique link to receive sBTC or Stacks payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg" disabled={isLoading}>
                    <Link href="/create">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                      Create New Link
                    </Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
