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
            The secure platform for Bitcoin crowdfunding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
                <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                </Link>
            </Button>
            <Button asChild className="w-full" variant="secondary" size="lg">
                <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                </Link>
            </Button>
             <p className="text-xs text-center text-muted-foreground pt-4">
                Login or create an account to start funding and creating projects.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
