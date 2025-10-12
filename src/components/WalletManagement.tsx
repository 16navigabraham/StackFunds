"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WalletInfo {
  walletId: string;
  walletAddress: string;
  status: string;
}

export default function WalletManagement() {
  const [loading, setLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [hasCheckedWallet, setHasCheckedWallet] = useState(false);

  // Check if user has a wallet on component mount
  useEffect(() => {
    checkForExistingWallet();
  }, []);

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
      const subOrgId = localStorage.getItem("turnkey_user_sub_org_id");
      if (!subOrgId) {
        alert("No sub-organization found. Please sign up again.");
        return;
      }

      console.log("🔐 Creating wallet for sub-organization:", subOrgId);
      
      const response = await fetch("/api/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subOrgId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create wallet");
      }

      const walletData = await response.json();
      
      setWalletInfo({
        walletId: walletData.walletId,
        walletAddress: walletData.walletAddress,
        status: "active"
      });

      // Store wallet info in localStorage for future reference
      localStorage.setItem("turnkey_wallet_address", walletData.walletAddress);
      localStorage.setItem("turnkey_wallet_id", walletData.walletId);

      console.log("✅ Wallet created successfully:", walletData.walletAddress);
      alert("Wallet created successfully! Your Bitcoin testnet address is ready for Stacks testnet4 and sBTC.");
      
    } catch (error: any) {
      console.error("Failed to create wallet:", error);
      alert("Failed to create wallet: " + error.message);
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">No Wallet Found</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                Create your embedded wallet to start using Bitcoin testnet addresses with Stacks testnet4 and sBTC.
              </p>
              <Button
                onClick={createWallet}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? "Creating Wallet..." : "Create Your Embedded Wallet"}
              </Button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">What you'll get:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                <li>• Bitcoin testnet address</li>
                <li>• Stacks testnet4 compatibility</li>
                <li>• sBTC transaction support</li>
                <li>• Secure key management</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
