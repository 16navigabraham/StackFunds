import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { user, transactions, myCampaigns } from '@/lib/mock-data';
import { ArrowUpRight, ArrowDownLeft, Send, Download } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { shortenAddress } from '@/lib/utils';
import Link from 'next/link';

export default function WalletDashboardPage() {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default">Active</Badge>;
      case 'Goal Reached':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">Goal Reached</Badge>;
      case 'Funds Released':
        return <Badge variant="secondary" className="bg-accent/20 text-accent-foreground hover:bg-accent/30">Funds Released</Badge>;
      default:
        return <Badge variant="outline">Expired</Badge>;
    }
  };

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
              <div className="text-4xl font-bold font-mono">{user.balance} <span className="text-2xl text-muted-foreground">sBTC</span></div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm font-mono text-muted-foreground">{shortenAddress(user.address, 8)}</span>
                <CopyButton textToCopy={user.address} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1"><Send className="mr-2 h-4 w-4" /> Send</Button>
                <Button variant="secondary" className="flex-1"><Download className="mr-2 h-4 w-4" /> Receive</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.type === 'Sent' ? (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-accent" />
                          )}
                          {tx.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{tx.amount} sBTC</TableCell>
                       <TableCell>
                        <Badge variant={tx.status === 'Completed' ? 'secondary' : 'default'} className={tx.status === 'Completed' ? 'bg-accent/20 text-accent-foreground' : ''}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

       {/* My Campaigns Section */}
      <div className="mt-12">
        <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">My Campaigns</CardTitle>
              <CardDescription>
                An overview of the projects you've created.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {myCampaigns.length > 0 ? (
                    myCampaigns.map(campaign => (
                        <div key={campaign.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1 mb-4 md:mb-0">
                                <Link href={`/projects/${campaign.id}`} className="font-semibold hover:underline">{campaign.title}</Link>
                                <p className="text-sm text-muted-foreground">{campaign.raised} / {campaign.goal} sBTC raised</p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {getStatusBadge(campaign.status)}
                                {campaign.status === 'Goal Reached' && (
                                    <Button variant="outline">Release Funds (in 3d)</Button>
                                )}
                                {campaign.status === 'Funds Released' && (
                                     <span className="text-sm text-accent-foreground">Funds in wallet</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">You haven't created any campaigns yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/create">Create Your First Campaign</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
