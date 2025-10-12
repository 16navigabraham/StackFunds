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
      // or will send them a login/signup email.
      await authIframeClient?.injectCredentialBundle(email);

      alert("Check your email to complete the process!");
      // After the user clicks the link in their email, they will be redirected back.
      // The SDK will automatically pick up the authentication token from the URL.
      // A `useEffect` on the homepage handles redirecting to the wallet.

    } catch (err: any) {
      setError(err.message || "Authentication failed");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await passkeyClient?.login();
      if (result) {
        console.log("Passkey login successful");
        router.push("/wallet");
      } else {
        setError("Could not log in with passkey. If you haven't registered, please use the 'Sign Up' tab.");
      }
    } catch (err: any) {
        setError(err.message || "Login failed. If you don't have a passkey, please use the 'Sign Up' tab.");
        console.error("Passkey login error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePasskeySignUp = async () => {
    setLoading(true);
    setError("");

    try {
        const result = await passkeyClient?.createUserPasskey();
        if (result) {
          console.log("Passkey created successfully");
           // After successful creation, the user is logged in.
          router.push("/wallet");
        }
    } catch (signupErr: any) {
        setError(signupErr.message || "Failed to create passkey. You may already have one.");
        console.error("Passkey creation error:", signupErr);
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

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* SIGN IN TAB */}
            <TabsContent value="signin" className="pt-4 space-y-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label htmlFor="email-signin" className="sr-only">
                    Email Address
                  </label>
                  <Input
                    id="email-signin"
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button
                onClick={handlePasskeyLogin}
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                {loading ? "Authenticating..." : "Sign In with Passkey"}
              </Button>
            </TabsContent>

            {/* SIGN UP TAB */}
            <TabsContent value="signup" className="pt-4 space-y-4">
                 <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                    <label htmlFor="email-signup" className="sr-only">
                        Email Address
                    </label>
                    <Input
                        id="email-signup"
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

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                <Button
                    onClick={handlePasskeySignUp}
                    disabled={loading}
                    className="w-full"
                    variant="secondary"
                >
                    {loading ? "Creating..." : "Sign Up with Passkey"}
                </Button>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
    </div>
  );
}
