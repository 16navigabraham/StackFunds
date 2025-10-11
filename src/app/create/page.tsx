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
import { CheckCircle, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { Turnkey } from "@turnkey/sdk-browser";

const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
});

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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await turnkey.getSession();
      if (session) {
        setUser({
          organizationId: session.organizationId,
          wallets: [{ address: 'ST...placeholder'}]
        });
      }
    };
    fetchUser();
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSuccessModalOpen(true);
  }

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    router.push('/wallet');
  }

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
                
                 {user && user.wallets[0] && (
                    <div className="space-y-2 rounded-lg border p-4">
                        <h4 className="text-sm font-medium">Creator Details</h4>
                         <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Creator Name:</span> {user.organizationId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Wallet Address:</span> {user.wallets[0].address}
                        </p>
                        <p className="text-xs text-muted-foreground pt-2">
                            These details are automatically filled from your connected wallet.
                        </p>
                    </div>
                )}


                <Button type="submit" size="lg" className="w-full">
                  Create Payment Link
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isSuccessModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="rounded-full bg-accent/10 p-3">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-bold">Payment Link Created!</DialogTitle>
            <DialogDescription>
              Your link is now live. Start sharing it to get paid.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-muted/50 rounded-lg">
            <QrCode className="h-24 w-24" />
            <p className="text-sm font-mono break-all text-muted-foreground">
                stack.fund/pay/new-payment-id
            </p>
          </div>
          <Button onClick={handleModalClose} className="w-full">
            View My Wallet
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
