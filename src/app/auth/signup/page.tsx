
"use client";

import { useTurnkey } from "@turnkey/sdk-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, KeyRound } from "lucide-react";
import Link from "next/link";


export default function SignupPage() {
  const { passkeyClient, authIframeClient } = useTurnkey();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "passkey">("email");

  const [userSubOrgId, setUserSubOrgId] = useState("");
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(true);

  // Check WebAuthn support on component mount
  useEffect(() => {
    const checkWebAuthnSupport = () => {
      const isSupported = 
        typeof window !== 'undefined' && 
        window.PublicKeyCredential && 
        typeof window.PublicKeyCredential === 'function';
      setIsWebAuthnSupported(isSupported);
      
      if (!isSupported) {
        console.warn('WebAuthn not supported in this browser');
      }
    };
    
    checkWebAuthnSupport();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Create sub-organization on backend
      const response = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create account");
      }

      const { subOrgId, walletId, walletAddress, message } = await response.json();
      
      console.log("✅ Sub-organization created:", subOrgId);
      
      // Store the sub-org ID for the next step
      setUserSubOrgId(subOrgId);
      
      // Move to passkey creation step - wallet will be created after auth
      setStep("passkey");
      
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePasskey = async () => {
    if (!userSubOrgId) {
      setError("No organization ID found. Please restart signup.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 2: Create passkey in the user's sub-organization
      const authenticator = await passkeyClient?.createUserPasskey({
        publicKey: {
          rp: {
            id: window.location.hostname,
            name: "StackFund",
          },
          user: {
            // IMPORTANT: Use the sub-org ID as the user ID
            id: new TextEncoder().encode(userSubOrgId),
            name: email,
            displayName: username || email.split("@")[0],
          },
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            residentKey: "required",
            requireResidentKey: true,
            userVerification: "required",
          },
          timeout: 60000,
        },
        // CRITICAL: Specify the sub-organization ID
        organizationId: userSubOrgId,
      });

      if (authenticator) {
        console.log("✅ Passkey created successfully");
        console.log("Credential ID:", authenticator.credentialId);
        
        // Store authentication info
        localStorage.setItem("turnkey_user_sub_org_id", userSubOrgId);
        localStorage.setItem("turnkey_user_email", email);
        
        console.log("✅ Passkey created successfully! Authentication complete.");
        console.log("🎉 Signup complete! Redirecting to wallet dashboard...");
        
        // Redirect to wallet page where user can create wallet in authenticated context
        router.push("/wallet");
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to create passkey");
      console.error("Passkey creation error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkipPasskey = async () => {
    if (userSubOrgId) {
      localStorage.setItem("turnkey_user_sub_org_id", userSubOrgId);
      localStorage.setItem("turnkey_user_email", email);
      
      // Wallet was already created earlier, just redirect to dashboard
      console.log("🎉 Signup complete (passkey skipped)! Redirecting to wallet dashboard...");
    }
    
    router.push("/wallet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
                {step === "email" ? "Create Account" : "Secure with Passkey"}
            </CardTitle>
            <CardDescription className="pt-2">
                {step === "email" ? "Enter your details to get started." : "Your account is created. Now add a passkey."}
            </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
            {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Signup Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step === "email" ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"
                }`}>
                    {step === "email" ? "1" : "✓"}
                </div>
                <div className="w-16 h-1 bg-muted"></div>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step === "passkey" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                    2
                </div>
            </div>

            {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4 pt-4">
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username (optional)"
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                     <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Creating Account..." : "Continue"}
                    </Button>
                </form>
            )}

            {step === 'passkey' && (
                <div className="space-y-4 pt-4 text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                        <p className="text-sm text-green-800 dark:text-green-300">
                            <span className="font-semibold">Account Created! ✓</span>
                            <br />
                            Your secure account is ready. Create a passkey to protect it and access your wallet.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {!isWebAuthnSupported && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    <strong>WebAuthn Not Supported</strong><br />
                                    Your browser doesn't support passkeys. Please try a modern browser like Chrome, Edge, or Firefox, or continue without a passkey.
                                </p>
                            </div>
                        )}
                        
                        <Button 
                            onClick={handleCreatePasskey} 
                            disabled={loading || !isWebAuthnSupported} 
                            className="w-full" 
                            size="lg"
                        >
                            <KeyRound className="mr-2" />
                            {loading ? "Creating Passkey..." : "Create Passkey"}
                        </Button>
                        
                        <div className="text-sm text-muted-foreground">
                            <span>Having trouble with passkeys? </span>
                            <Button onClick={handleSkipPasskey} variant="link" className="h-auto p-0 text-sm font-normal underline">
                                Continue without passkey
                            </Button>
                        </div>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mt-4">
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                <strong>Note:</strong> Passkeys require a modern browser with WebAuthn support. If you're having issues, you can skip this step and set up a passkey later.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <p className="text-xs text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline">
                    Login
                </Link>
            </p>

        </CardContent>
      </Card>
    </div>
  );
}
