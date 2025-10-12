"use client";

import { useTurnkey } from "@turnkey/sdk-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MessageSigner from "@/components/MessageSigner";
import WalletManagement from "@/components/WalletManagement";
import type { TWallet } from "@turnkey/sdk-browser";


interface UserSession {
  userId: string;
  organizationId: string;
  walletAddress?: string;
  email?: string;
}

export default function WalletDashboardPage() {
  const { user, isUserLoading, logout, getWallets } = useTurnkey();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }
    if (!user) {
      router.push("/auth");
      return;
    }

    const loadUserDetails = async () => {
      try {
        const wallets = await getWallets();
        const primaryWallet = wallets?.wallets?.[0];

        setUserInfo({
          userId: user.id,
          organizationId: user.organization.id,
          walletAddress: primaryWallet?.accounts[0]?.address,
          email: user.email,
        });
      } catch (error) {
        console.error("Failed to load user details:", error);
        // Optional: handle error state in UI
      } finally {
        setLoading(false);
      }
    };
    
    loadUserDetails();
  }, [user, isUserLoading, router, getWallets]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="mt-1 text-sm font-mono break-all">
                {userInfo?.userId}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Organization ID
              </label>
              <p className="mt-1 text-sm font-mono break-all">
                {userInfo?.organizationId}
              </p>
            </div>

            {userInfo?.email && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="mt-1 text-sm">{userInfo.email}</p>
              </div>
            )}

            {userInfo?.walletAddress && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Primary Wallet
                </label>
                <p className="mt-1 text-sm font-mono break-all">
                  {userInfo.walletAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Signing */}
        <MessageSigner />

        {/* Wallet Management */}
        <WalletManagement />
      </div>
    </div>
  );
}
