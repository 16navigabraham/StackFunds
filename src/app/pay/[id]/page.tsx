'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Bitcoin, 
  ExternalLink,
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { shortenAddress } from '@/lib/utils';
import CopyButton from '@/components/CopyButton';
import { useTurnkey } from '@turnkey/sdk-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentLink {
  paymentLinkId: string;
  title: string;
  description: string;
  amount: number;
  paymentToken: string;
  creatorAddress: string;
  creatorId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  totalPaid: number;
  paymentCount: number;
}

export default function PaymentPage() {
  const params = useParams();
  const paymentId = params.id as string;
  const { authIframeClient } = useTurnkey();
  const { toast } = useToast();
  
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const checkUserWallet = () => {
      // Check if user has a wallet address stored
      const storedAddress = localStorage.getItem('turnkey_wallet_address');
      if (storedAddress) {
        setUserWallet(storedAddress);
      }
    };
    
    checkUserWallet();
  }, []);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!paymentId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/payment-links?id=${paymentId}`);
        
        if (!response.ok) {
          throw new Error('Payment link not found');
        }

        const data = await response.json();
        setPaymentLink(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load payment link');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentLink();
  }, [paymentId]);

  const handleConnectWallet = () => {
    window.location.href = '/auth';
  };

  const handleMakePayment = async () => {
    if (!paymentLink || !userWallet) return;
    
    setIsProcessingPayment(true);
    
    try {
      // For now, show a detailed payment modal since we need to implement actual sBTC transactions
      // In a real implementation, you would:
      // 1. Create an sBTC transaction
      // 2. Sign it with Turnkey
      // 3. Broadcast it to the network
      // 4. Update the payment link status
      
      const confirmed = confirm(
        `Confirm Payment Details:\n\n` +
        `Amount: ${paymentLink.amount} sBTC\n` +
        `To: ${paymentLink.creatorAddress}\n` +
        `From: ${userWallet}\n\n` +
        `Note: This is a demo. In production, this would create and broadcast a real sBTC transaction.`
      );
      
      if (confirmed) {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "Payment Initiated",
          description: `Successfully initiated payment of ${paymentLink.amount} sBTC`,
        });
        
        // In real implementation, update the payment status in database
        console.log('Payment would be processed:', {
          from: userWallet,
          to: paymentLink.creatorAddress,
          amount: paymentLink.amount,
          paymentLinkId: paymentLink.paymentLinkId
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const isExpired = paymentLink ? new Date() > new Date(paymentLink.expiresAt) : false;
  const isActive = paymentLink?.status === 'active' && !isExpired;
  const isConnected = !!userWallet;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading payment link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Payment Link Not Found</CardTitle>
            <CardDescription>
              {error || 'This payment link does not exist or has been removed.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Payment Request</h1>
          <p className="text-muted-foreground mt-2">
            Complete your sBTC payment securely
          </p>
        </div>

        {/* Status Alert */}
        {!isActive && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isExpired 
                ? 'This payment link has expired.' 
                : 'This payment link is no longer active.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{paymentLink.title}</CardTitle>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
              </Badge>
            </div>
            <CardDescription>{paymentLink.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bitcoin className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Amount Requested</span>
              </div>
              <div className="text-3xl font-bold">
                {paymentLink.amount} sBTC
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Synthetic Bitcoin on Stacks
              </p>
            </div>

            {/* Creator Info */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Payment Recipient
              </h3>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Creator ID:</span>
                  <span className="text-sm font-mono">
                    {shortenAddress(paymentLink.creatorId, 8)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {shortenAddress(paymentLink.creatorAddress, 8)}
                    </span>
                    <CopyButton 
                      textToCopy={paymentLink.creatorAddress}
                      className="h-6 w-6"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expiration */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Expires on {new Date(paymentLink.expiresAt).toLocaleDateString()}
              </span>
            </div>

            {/* Payment Stats */}
            {paymentLink.paymentCount > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Payment Activity
                  </span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-400">
                  {paymentLink.paymentCount} payment(s) • Total: {paymentLink.totalPaid} sBTC
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Action */}
        <Card>
          <CardContent className="pt-6">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Stacks wallet to make sBTC payments
                  </p>
                </div>
                <div className="space-y-3">
                  <Button onClick={handleConnectWallet} size="lg" className="w-full">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Pay
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    You'll be redirected to create or login to your Stacks wallet
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Connected: {shortenAddress(userWallet || '', 8)}</span>
                      <CopyButton textToCopy={userWallet || ''} className="h-6 w-6" />
                    </div>
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleMakePayment} 
                  size="lg" 
                  className="w-full"
                  disabled={!isActive || isProcessingPayment}
                >
                  <Bitcoin className="mr-2 h-4 w-4" />
                  {isProcessingPayment 
                    ? 'Processing Payment...'
                    : isActive 
                      ? `Pay ${paymentLink.amount} sBTC` 
                      : 'Payment Unavailable'
                  }
                </Button>

                {isActive && (
                  <p className="text-xs text-center text-muted-foreground">
                    This will open your wallet to confirm the sBTC transaction
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by StackFunds • Secure sBTC Payments on Stacks</p>
        </div>
      </div>
    </div>
  );
}