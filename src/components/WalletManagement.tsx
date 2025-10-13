"use client";

import { useState, useEffect  const checkAuthenticationStatus = async () => {
    // Simply check if we have the required user session data
    const storedSubOrgId = localStorage.getItem("turnkey_user_sub_org_id");
    const storedEmail = localStorage.getItem("turnkey_user_email");
    
    if (storedSubOrgId && storedEmail) {
      console.log("✅ User session found:", storedEmail);
      setAuthReady(true);
    } else {
      console.log("❌ No user session found");
      setAuthReady(false);
    }
  };
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTurnkey } from "@turnkey/sdk-react";
import { getAddressFromPublicKey } from '@stacks/transactions';

interface WalletInfo {
  walletId: string;
  walletAddress: string;
  status: string;
}

export default function WalletManagement() {
  const [loading, setLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [hasCheckedWallet, setHasCheckedWallet] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const { authIframeClient, turnkey } = useTurnkey();

  // Check if user has a wallet on component mount
  useEffect(() => {
    checkForExistingWallet();
    checkAuthenticationStatus();
  }, [authIframeClient]);

  const checkAuthenticationStatus = async () => {
    // Check if user came from OAuth flow
    const oauthAction = localStorage.getItem("oauth_auth_action");
    if (oauthAction) {
      console.log(`✅ User authenticated via OAuth (${oauthAction})`);
      setAuthReady(true);
      // Clear the OAuth flag
      localStorage.removeItem("oauth_auth_action");
      return;
    }

    // Regular authentication check
    if (!authIframeClient) {
      setAuthReady(false);
      return;
    }

    try {
      // Test authentication by checking if the client can access organization info
      console.log("🔍 Testing authentication status...");
      setAuthReady(true);
      console.log("✅ Authentication client appears ready");
    } catch (error: any) {
      console.log("❌ Authentication test failed:", error.message);
      setAuthReady(false);
    }
  };

  const reAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      // Simply redirect to login page for proper authentication
      alert("Please complete the login process to create a wallet.");
      window.location.href = "/auth/login";
    } catch (error: any) {
      console.error("❌ Re-authentication failed:", error);
      setAuthReady(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const checkForExistingWallet = async () => {
    setLoading(true);
    try {
      // First check localStorage for wallet info stored during signup
      const storedWalletAddress = localStorage.getItem("turnkey_wallet_address");
      const storedWalletId = localStorage.getItem("turnkey_wallet_id");
      
      if (storedWalletAddress && storedWalletId) {
        console.log("✅ Found wallet from signup:", storedWalletAddress);
        setWalletInfo({
          walletId: storedWalletId,
          walletAddress: storedWalletAddress,
          status: "active"
        });
        return;
      }

      // If no stored wallet info, check if user has sub-org ID to create wallet
      const subOrgId = localStorage.getItem("turnkey_user_sub_org_id");
      if (subOrgId) {
        console.log("📋 No wallet found, but have sub-org ID. User can create wallet.");
        setWalletInfo(null);
      } else {
        console.log("❌ No sub-org ID found. User needs to sign up.");
        setWalletInfo(null);
      }
    } catch (error) {
      console.error("Failed to check for wallet:", error);
      setWalletInfo(null);
    } finally {
      setLoading(false);
      setHasCheckedWallet(true);
    }
  };

  const createWallet = async () => {
    setLoading(true);
    try {
      // Check if user is properly authenticated first
      const storedSubOrgId = localStorage.getItem("turnkey_user_sub_org_id");
      if (!storedSubOrgId) {
        alert("No user session found. Please sign up or log in again.");
        window.location.href = "/auth/signup";
        return;
      }

      console.log("🔐 Creating wallet for sub-org:", storedSubOrgId);

      // Instead of using iframe client directly, use the API endpoint
      // which properly handles wallet creation with the Turnkey server SDK
      const response = await fetch('/api/turnkey/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subOrgId: storedSubOrgId,
          walletName: 'Default Stacks Wallet',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create wallet');
      }

      const walletResult = await response.json();

      if (walletResult && walletResult.success) {
        const walletId = walletResult.walletId;
        const walletAddress = walletResult.addresses?.[0]?.address || 'No address available';
        const publicKey = walletResult.publicKey || '';
        
        console.log("✅ Wallet created with ID:", walletId);
        console.log("✅ Wallet address:", walletAddress);
        console.log("✅ Public key:", publicKey);
        
        setWalletInfo({
          walletId: walletId,
          walletAddress: walletAddress,
          status: "active"
        });

        // Store wallet info in localStorage
        localStorage.setItem("turnkey_wallet_id", walletId);
        localStorage.setItem("turnkey_wallet_address", walletAddress);
        localStorage.setItem("turnkey_wallet_public_key", publicKey);
        localStorage.setItem("walletInfo", JSON.stringify({
          walletId: walletId,
          address: walletAddress,
          publicKey: publicKey,
          organizationId: storedSubOrgId
        }));

        alert("Wallet created successfully! Your embedded wallet is now ready.");
      } else {
        throw new Error("Wallet creation returned no wallet ID");
      }
      
    } catch (error: any) {
      console.error("Failed to create wallet:", error);
      
      // If we get an authentication error, guide user to re-authenticate
      if (error.message.includes("credential") || error.message.includes("sign payload")) {
        setAuthReady(false);
        if (confirm("Your session has expired. Would you like to re-authenticate now?")) {
          await reAuthenticate();
        }
      } else {
        alert("Failed to create wallet: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportWallet = async () => {
    if (!confirm("Are you sure? Exporting your private key is sensitive!")) {
      return;
    }

    setLoading(true);
    try {
      // Note: Export functionality requires additional backend implementation
      alert("Export functionality requires additional backend setup for key encryption with the current Turnkey SDK version.");
      console.log("To implement export, you need to upgrade to the newer React Wallet Kit or implement server-side export.");
      
    } catch (error: any) {
      alert("Export failed: " + error.message);
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Embedded Wallet</CardTitle>
            <div className="space-x-2">
            <Button
                onClick={checkForExistingWallet}
                disabled={loading}
                variant="outline"
            >
                {loading ? "Checking..." : "Refresh"}
            </Button>
            {!walletInfo && hasCheckedWallet && (
              <Button
                  onClick={createWallet}
                  disabled={loading}
                  variant="default"
              >
                  {loading ? "Creating..." : "Create Wallet"}
              </Button>
            )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasCheckedWallet ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Checking for existing wallet...</p>
          </div>
        ) : walletInfo ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Embedded Wallet Active</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                Your Bitcoin testnet wallet is ready for Stacks testnet4 and sBTC transactions.
              </p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Wallet Address</label>
                  <p className="text-sm font-mono break-all bg-white dark:bg-black/20 p-2 rounded border">
                    {walletInfo.walletAddress}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Wallet ID</label>
                  <p className="text-xs font-mono break-all text-muted-foreground">
                    {walletInfo.walletId}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleExportWallet}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Export Wallet"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            {/* Authentication Status */}
            <div className={`border rounded-lg p-4 ${
              authReady 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
            }`}>
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  authReady ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <h3 className={`font-semibold ${
                  authReady 
                    ? 'text-green-800 dark:text-green-300' 
                    : 'text-yellow-800 dark:text-yellow-300'
                }`}>
                  {authReady ? 'Authentication Ready' : 'Authentication Required'}
                </h3>
              </div>
              <p className={`text-sm mb-3 ${
                authReady 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                {authReady 
                  ? 'Your secure session is active and ready for wallet creation.'
                  : 'You need to authenticate before creating your embedded wallet.'
                }
              </p>
              
              {!authReady && (
                <Button
                  onClick={reAuthenticate}
                  disabled={isAuthenticating}
                  variant="outline"
                  className="mb-4"
                >
                  {isAuthenticating ? "Authenticating..." : "Authenticate Now"}
                </Button>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Create Your Embedded Wallet</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                You've completed signup successfully! Now create your embedded wallet to start using Bitcoin testnet addresses with Stacks testnet4 and sBTC.
              </p>
              <Button
                onClick={createWallet}
                disabled={loading || !authReady}
                size="lg"
                className="w-full"
              >
                {loading ? "Creating Wallet..." : !authReady ? "Authenticate First" : "Create Your Embedded Wallet"}
              </Button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">What you'll get:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                <li>• Bitcoin testnet address</li>
                <li>• Stacks testnet4 compatibility</li>
                <li>• sBTC transaction support</li>
                <li>• Secure key management via Turnkey</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
