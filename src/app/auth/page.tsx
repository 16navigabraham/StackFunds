"use client";

import { useTurnkey } from "@turnkey/sdk-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AuthPage() {
  const { authIframeClient, passkeyClient } = useTurnkey();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // This will trigger a cross-origin iframe to be rendered.
      // This iframe will prompt the user to either authenticate (if they have an existing session)
      // or will send them a login email.
      const response = await authIframeClient?.injectCredentialBundle(
        email
      );

      if (response) {
        console.log("Email auth initiated:", response);
        // The user will receive an email to complete authentication.
        // The most common UX is to show a modal here, instructing the user to check their email.
        // For this example, we'll use a simple alert.
        alert("Check your email to complete sign in!");
      }
      
      // After the user clicks the link in their email, they will be redirected back to your app.
      // The SDK will automatically pick up the authentication token from the URL,
      // and the user will be logged in. The `useTurnkey` hook's `user` object
      // will be populated, and you can redirect them to the dashboard.
      // A simple way to handle this is a `useEffect` on the homepage that checks for a user.

    } catch (err: any) {
      setError(err.message || "Authentication failed");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyAuth = async () => {
    setLoading(true);
    setError("");

    try {
      // Try to login with an existing passkey
      const result = await passkeyClient?.login();
      if (result) {
        console.log("Passkey login successful");
        router.push("/wallet");
        return;
      }
    } catch (err: any) {
      console.log("No existing passkey found, proceeding to create one...");
      
      try {
        // If login fails, it's because the user doesn't have a passkey yet.
        // We can now create one for them.
        const result = await passkeyClient?.createUserPasskey();

        if (result) {
          console.log("Passkey created successfully");
           // After successful creation, the user is logged in.
          router.push("/wallet");
        }
      } catch (signupErr: any) {
        setError(signupErr.message || "Failed to create passkey");
        console.error("Passkey creation error:", signupErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign in or create your account
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="passkey">Passkey</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="pt-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Continue with Email"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="passkey" className="pt-4">
                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                    Sign in securely with your device's biometric authentication or security key.
                    </p>

                    <Button
                    onClick={handlePasskeyAuth}
                    disabled={loading}
                    className="w-full"
                    >
                    {loading ? "Authenticating..." : "Continue with Passkey"}
                    </Button>
                </div>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
    </div>
  );
}
