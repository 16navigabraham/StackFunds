"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface WalletInfo {
  walletId: string;
  walletAddress: string;
  status: string;
}

export default function WalletManagement() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasCheckedWallet, setHasCheckedWallet] = useState(false);

  const checkForExistingWallet = async () => {
    setLoading(true);
    try {
      const storedWalletAddress = localStorage.getItem("turnkey_wallet_address");
      const storedWalletId = localStorage.getItem("turnkey_wallet_id");
      
      if (storedWalletAddress && storedWalletId) {
        setWalletInfo({
          walletId: storedWalletId,
          walletAddress: storedWalletAddress,
          status: "active"
        });
      } else {
        setWalletInfo(null);
      }
    } catch (error: any) {
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
      const storedSubOrgId = localStorage.getItem("turnkey_user_sub_org_id");
      if (!storedSubOrgId) {
        alert("No user session found. Please sign up or log in again.");
        window.location.href = "/auth/signup";
        return;
      }

      const response = await fetch("/api/turnkey/create-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subOrgId: storedSubOrgId,
          walletName: "Default Stacks Wallet",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create wallet");
      }

      const walletResult = await response.json();

      if (walletResult && walletResult.success) {
        const walletId = walletResult.walletId;
        const walletAddress = walletResult.addresses?.[0]?.address || "No address available";
        
        setWalletInfo({
          walletId: walletId,
          walletAddress: walletAddress,
          status: "active"
        });

        localStorage.setItem("turnkey_wallet_id", walletId);
        localStorage.setItem("turnkey_wallet_address", walletAddress);

        alert("Wallet created successfully!");
      } else {
        throw new Error("Wallet creation failed");
      }
      
    } catch (error: any) {
      console.error("Failed to create wallet:", error);
      alert("Failed to create wallet: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkForExistingWallet();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Wallet Management</CardTitle>
          <div className="space-x-2">
            <Button onClick={checkForExistingWallet} disabled={loading} variant="outline">
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Button onClick={createWallet} disabled={loading || !!walletInfo}>
              Create New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !hasCheckedWallet ? (
          <p className="text-muted-foreground text-center py-4">Loading wallet information...</p>
        ) : walletInfo ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">Your Wallet</p>
                  <p className="text-sm text-muted-foreground font-mono mt-1 break-all">
                    {walletInfo.walletAddress}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Status: <span className="capitalize">{walletInfo.status}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : hasCheckedWallet ? (
          <div className="text-center py-8">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Create Your Embedded Wallet</h3>
              <p className="text-green-700 dark:text-green-400 text-sm mb-4">
                Create your embedded wallet to start using Bitcoin testnet addresses with Stacks testnet4 and sBTC.
              </p>
              <Button onClick={createWallet} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Creating Wallet..." : "Create Your Embedded Wallet"}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
