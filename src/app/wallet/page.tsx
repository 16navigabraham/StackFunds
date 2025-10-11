import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Download } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { shortenAddress } from '@/lib/utils';
import Link from 'next/link';

// Mock data, will be replaced with live data
const mockUser = {
  address: 'bc1qylp8a2w8u4m9wzfr8qj9p3tqj9n2h8g9g9h9g9',
  balance: 0.1337,
};

export default function WalletDashboardPage() {
  return (
    <div className="container max-w-5xl py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Wallet Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Wallet</CardTitle>
              <CardDescription>Your sBTC balance and address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold font-mono">{mockUser.balance} <span className="text-2xl text-muted-foreground">sBTC</span></div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm font-mono text-muted-foreground">{shortenAddress(mockUser.address, 8)}</span>
                <CopyButton textToCopy={mockUser.address} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1"><Send className="mr-2 h-4 w-4" /> Send</Button>
                <Button variant="secondary" className="flex-1"><Download className="mr-2 h-4 w-4" /> Receive</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Payment Link */}
        <div className="md:col-span-2">
          <Card className="flex flex-col items-center justify-center text-center h-full">
            <CardHeader>
              <CardTitle className="font-headline">Create Payment Link</CardTitle>
              <CardDescription>
                Generate a unique link to receive sBTC or Stacks payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg">
                    <Link href="/create">Create New Link</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
