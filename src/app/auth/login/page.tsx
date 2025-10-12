
"use client";

import { useTurnkey } from "@turnkey/sdk-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, KeyRound } from "lucide-react";
import Link from "next/link";


export default function LoginPage() {
  const { passkeyClient } = useTurnkey();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Retrieve the stored sub-organization ID
      const storedSubOrgId = localStorage.getItem("turnkey_user_sub_org_id");

      if (!storedSubOrgId) {
        setError(
          "No account found on this device. Please sign up first or try a different device."
        );
        setLoading(false);
        return;
      }

      console.log("🔐 Attempting login with sub-org:", storedSubOrgId);

      // CRITICAL: Login with the correct sub-organization ID
      const loginResponse = await passkeyClient?.login({
        organizationId: storedSubOrgId,
      });

      if (loginResponse) {
        console.log("✅ Login successful!");
        router.push("/wallet");
      }
      
    } catch (err: any) {
      console.error("❌ Login error:", err);

      if (err.message?.includes("credential ID could not be found")) {
        setError(
          "Passkey not found. This may happen if:\n" +
          "• You're using a different device\n" +
          "• You haven't created a passkey yet\n" +
          "• Your passkey was deleted\n\n" +
          "Please sign up again or use a different device."
        );
      } else if (err.message?.includes("User cancelled")) {
        setError("Login cancelled. Please try again.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="pt-2">
            Login securely with your passkey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                </Alert>
            )}

            <Button onClick={handlePasskeyLogin} disabled={loading} className="w-full" size="lg">
                <KeyRound className="mr-2" />
                {loading ? "Authenticating..." : "Login with Passkey"}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
