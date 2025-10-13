
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, QrCode, Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { shortenAddress } from "@/lib/utils";
import CopyButton from "@/components/CopyButton";

// Commented out problematic Turnkey imports
// import { Turnkey } from "@turnkey/sdk-browser";
// import type { TWallet } from '@turnkey/sdk-browser';

// const turnkey = new Turnkey({
//   apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
//   defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
// });

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters.")
    .max(150, "Short description can't exceed 150 characters."),
  goal: z.coerce.number().positive("Funding goal must be a positive number."),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 day."),
});

export default function CreateCampaignPage() {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [paymentLinkId, setPaymentLinkId] = useState<string>('');
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string>('');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndWallets = async () => {
      try {
        // Use localStorage instead of Turnkey SDK
        const storedUser = localStorage.getItem('turnkey_user');
        const storedWallet = localStorage.getItem('turnkey_wallet');
        
        if (storedUser && storedWallet) {
          const userData = JSON.parse(storedUser);
          const walletData = JSON.parse(storedWallet);
          
          console.log('Stored user data:', userData);
          console.log('Stored wallet data:', walletData);
          
          setUser({
            organizationId: userData.subOrgId || userData.organizationId,
          });
          
          // Create mock wallet structure that matches the access pattern
          const mockWallets = [{
            walletId: walletData.walletId,
            addresses: walletData.addresses || [{ address: 'No address available' }],
            walletName: 'Default Wallet'
          }];
          
          console.log('Mock wallets:', mockWallets);
          setWallets(mockWallets);
        } else {
          console.log('No stored user or wallet data found');
        }
      } catch (e) {
        console.error("Error fetching user or wallets", e);
      }
    };
    fetchUserAndWallets();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      goal: 1,
      duration: 30,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || wallets.length === 0) {
      alert('Please connect your wallet first');
      return;
    }

    setIsCreatingLink(true);

    try {
      const paymentLinkData = {
        title: values.title,
        description: values.shortDescription,
        amount: values.goal,
        duration: values.duration,
        paymentToken: 'sBTC',
        creatorAddress: walletAddress,
        creatorId: user.organizationId,
        expiresAt: new Date(Date.now() + values.duration * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentLinkData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }

      const result = await response.json();
      const linkId = result.paymentLinkId;
      const fullUrl = `${window.location.origin}/pay/${linkId}`;
      
      setPaymentLinkId(linkId);
      setPaymentLinkUrl(fullUrl);
      setIsSuccessModalOpen(true);
      
      console.log('Payment link created:', result);
    } catch (error) {
      console.error('Error creating payment link:', error);
      alert('Failed to create payment link. Please try again.');
    } finally {
      setIsCreatingLink(false);
    }
  }

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    router.push('/wallet');
  }

  // Fix the wallet address access to match the actual data structure
  const walletAddress = wallets.length > 0 && wallets[0]?.addresses?.length > 0 
    ? wallets[0].addresses[0].address 
    : 'No wallet address available';


  return (
    <>
      <div className="container max-w-3xl py-12 md:py-20">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Create a Payment Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. My Awesome Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A quick summary of what this link is for."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                       <FormDescription>
                        This will be shown on the payment page. Max 150 characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount (sBTC)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Link Expiration (days)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                 {user && wallets.length > 0 && walletAddress !== 'No wallet address available' && (
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="text-sm font-medium">Creator Details</h4>
                         <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Creator Name:</span> {shortenAddress(user.organizationId || 'Unknown', 6)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Wallet Address:</span> {walletAddress}
                        </p>
                        <p className="text-xs text-muted-foreground pt-2">
                            These details are automatically filled from your connected wallet.
                        </p>
                    </div>
                )}


                <Button type="submit" size="lg" className="w-full" disabled={isCreatingLink || !user || wallets.length === 0}>
                  {isCreatingLink ? 'Creating Link...' : 'Create Payment Link'}
                </Button>
                
                {(!user || wallets.length === 0) && (
                  <p className="text-center text-sm text-muted-foreground">
                    Please connect your wallet to create payment links
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isSuccessModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-lg text-center">
          <DialogHeader className="items-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl font-bold">Payment Link Created!</DialogTitle>
            <DialogDescription>
              Your sBTC payment link is now live and ready to share.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Payment Link Details */}
            <div className="p-4 bg-muted/50 rounded-lg text-left">
              <h4 className="font-medium mb-2">Link Details:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Amount:</span> {form.getValues('goal')} sBTC</p>
                <p><span className="font-medium">Token:</span> sBTC (Synthetic Bitcoin)</p>
                <p><span className="font-medium">Expires:</span> {form.getValues('duration')} days</p>
                <p><span className="font-medium">Link ID:</span> {paymentLinkId}</p>
              </div>
            </div>

            {/* Shareable URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Payment Link:</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-xs font-mono text-left break-all">
                  {paymentLinkUrl}
                </code>
                <CopyButton 
                  textToCopy={paymentLinkUrl}
                  className="flex-shrink-0"
                />
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-muted/30 rounded-lg">
              <QrCode className="h-20 w-20 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">QR Code for easy sharing</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  window.open(paymentLinkUrl, '_blank');
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview Link
              </Button>
              <Button onClick={handleModalClose} className="flex-1">
                Back to Wallet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
