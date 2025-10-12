"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to StackFund</CardTitle>
          <CardDescription className="pt-2">
            The secure platform for Business payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
                <Link href="/auth/oauth">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in with OAuth
                </Link>
            </Button>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or use traditional method
                    </span>
                </div>
            </div>
            
            <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login with Email
                </Link>
            </Button>
            <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up with Email
                </Link>
            </Button>
             <p className="text-xs text-center text-muted-foreground pt-4">
                OAuth provides the most reliable authentication for wallet creation.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
