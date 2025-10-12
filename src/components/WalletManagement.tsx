"use client";

import { useTurnkey } from "@turnkey/sdk-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { TWallet } from "@turnkey/sdk-browser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WalletManagement() {
  const { getWallets, createWallet, exportWallet } = useTurnkey();
  const [wallets, setWallets] = useState<TWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportedKey, setExportedKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const loadWallets = async () => {
    setLoading(true);
    try {
      const walletData = await getWallets();
      setWallets(walletData.wallets || []);
    } catch (error) {
      console.error("Failed to load wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportWallet = async (walletId: string) => {
    if (!confirm("Are you sure? Exporting your private key is sensitive!")) {
      return;
    }

    setLoading(true);
    try {
      // Note: This requires proper backend implementation
      // and additional Turnkey API configuration for targetPublicKey
      alert("Export functionality requires additional backend setup for key encryption. See console for details.");
      console.log("To implement export, you need a mechanism to provide a 'targetPublicKey' for encryption.");
      
      /*
      const result = await exportWallet({
        walletId,
        targetPublicKey: "user-encryption-key", // User's public encryption key
      });

      setExportedKey(result.exportWalletResult.exportBundle);
      setShowKey(true);
      */

    } catch (error: any) {
      alert("Export failed: " + error.message);
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewWallet = async () => {
    setLoading(true);
    try {
      await createWallet({
        name: `Wallet ${wallets.length + 1}`,
        accounts: [{
          path: "m/44'/5757'/0'/0/0",
          curve: "CURVE_SECP256K1",
          format: "ADDRESS_FORMAT_STACKS",
        }]
      });

      alert("New wallet created!");
      await loadWallets();
    } catch (error: any) {
      alert("Failed to create wallet: " + error.message);
      console.error("Create wallet error:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasWallet = wallets.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Wallet Management</CardTitle>
            <div className="space-x-2">
            <Button
                onClick={loadWallets}
                disabled={loading}
                variant="outline"
            >
                {loading ? "Loading..." : "Refresh"}
            </Button>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0}>
                            <Button
                                onClick={createNewWallet}
                                disabled={loading || hasWallet}
                            >
                                Create New
                            </Button>
                        </span>
                    </TooltipTrigger>
                    {hasWallet && (
                        <TooltipContent>
                            <p>Only one wallet is allowed per user.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {wallets.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No wallets found. Click "Refresh" to load wallets or "Create New" to create one.
          </p>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{wallet.name || "Unnamed Wallet"}</p>
                    {wallet.accounts.map(acc => (
                         <p key={acc.address} className="text-sm text-muted-foreground font-mono mt-1 break-all">
                            {acc.address}
                        </p>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleExportWallet(wallet.id)}
                    variant="secondary"
                    size="sm"
                  >
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showKey && exportedKey && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-300">⚠️ Private Key Export</h3>
              <Button
                onClick={() => {
                  setShowKey(false);
                  setExportedKey("");
                }}
                variant="ghost"
                size="sm"
              >
                Close
              </Button>
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
              Keep this secure! Never share your private key.
            </p>
            <div className="p-3 bg-white dark:bg-black/20 rounded-md border border-yellow-300 dark:border-yellow-500 break-all font-mono text-xs">
              {exportedKey}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
