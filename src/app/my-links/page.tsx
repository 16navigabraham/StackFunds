'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus,
  ExternalLink,
  Copy,
  Eye,
  MoreVertical,
  Calendar,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CopyButton from '@/components/CopyButton';
import { shortenAddress } from '@/lib/utils';

interface PaymentLink {
  paymentLinkId: string;
  title: string;
  description: string;
  amount: number;
  paymentToken: string;
  creatorAddress: string;
  creatorId: string;
  status: 'active' | 'expired' | 'completed';
  createdAt: string;
  expiresAt: string;
  totalPaid: number;
  paymentCount: number;
}

export default function MyLinksPage() {
  const router = useRouter();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      const storedAddress = localStorage.getItem('turnkey_wallet_address');
      const storedUser = localStorage.getItem('turnkey_user_sub_org_id');
      
      if (!storedAddress || !storedUser) {
        router.push('/auth');
        return false;
      }
      
      setUserAddress(storedAddress);
      return true;
    };

    if (checkAuth()) {
      fetchPaymentLinks();
    }
  }, [router]);

  const fetchPaymentLinks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's wallet address to filter their payment links
      const storedAddress = localStorage.getItem('turnkey_wallet_address');
      if (!storedAddress) {
        throw new Error('No wallet address found');
      }

      const response = await fetch(`/api/payment-links?creatorAddress=${encodeURIComponent(storedAddress)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment links');
      }

      const data = await response.json();
      setPaymentLinks(data.paymentLinks || []);
    } catch (err: any) {
      console.error('Error fetching payment links:', err);
      setError(err.message || 'Failed to load payment links');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (link: PaymentLink) => {
    const now = new Date();
    const expiresAt = new Date(link.expiresAt);
    const isExpired = now > expiresAt;

    if (isExpired) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    
    switch (link.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{link.status}</Badge>;
    }
  };

  const getPaymentUrl = (linkId: string) => {
    return `${window.location.origin}/pay/${linkId}`;
  };

  const handleViewLink = (linkId: string) => {
    window.open(getPaymentUrl(linkId), '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = (link: PaymentLink) => {
    return Math.min((link.totalPaid / link.amount) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={fetchPaymentLinks}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Payment Links</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your payment links. Share them to receive payments.
            </p>
            {userAddress && (
              <p className="text-sm text-muted-foreground mt-1">
                Wallet: {shortenAddress(userAddress)}
              </p>
            )}
          </div>
          <Button onClick={() => router.push('/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Link
          </Button>
        </div>

        {/* Stats Overview */}
        {paymentLinks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Links</span>
                </div>
                <div className="text-2xl font-bold">{paymentLinks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Links</span>
                </div>
                <div className="text-2xl font-bold">
                  {paymentLinks.filter(link => {
                    const isExpired = new Date() > new Date(link.expiresAt);
                    return link.status === 'active' && !isExpired;
                  }).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Raised</span>
                </div>
                <div className="text-2xl font-bold">
                  {paymentLinks.reduce((sum, link) => sum + link.totalPaid, 0).toFixed(4)} sBTC
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Payments</span>
                </div>
                <div className="text-2xl font-bold">
                  {paymentLinks.reduce((sum, link) => sum + link.paymentCount, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Links List */}
        {paymentLinks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Links Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first payment link to start receiving payments.
              </p>
              <Button onClick={() => router.push('/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {paymentLinks.map((link) => {
              const progress = calculateProgress(link);
              const isExpired = new Date() > new Date(link.expiresAt);
              
              return (
                <Card key={link.paymentLinkId} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{link.title}</h3>
                          {getStatusBadge(link)}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {link.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created {formatDate(link.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Expires {formatDate(link.expiresAt)}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewLink(link.paymentLinkId)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Payment Page
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(getPaymentUrl(link.paymentLinkId));
                                // Could add a toast notification here
                              } catch (err) {
                                console.error('Failed to copy:', err);
                              }
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress and Stats */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {link.amount} sBTC
                          </div>
                          <div className="text-sm text-muted-foreground">Goal</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">
                            {link.totalPaid} sBTC
                          </div>
                          <div className="text-sm text-muted-foreground">Raised</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">
                            {link.paymentCount}
                          </div>
                          <div className="text-sm text-muted-foreground">Payments</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          {/* Inline style is appropriate for dynamic progress bar width */}
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewLink(link.paymentLinkId)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(getPaymentUrl(link.paymentLinkId));
                              // Could add a toast notification here
                            } catch (err) {
                              console.error('Failed to copy:', err);
                            }
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}