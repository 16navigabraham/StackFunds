'use client';

import { useState, useEffect } from 'react';
import { useTurnkey } from '@turnkey/sdk-react';
import { getAddressFromPublicKey } from '@stacks/transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Wallet, Plus, RefreshCw, LogOut, Send } from 'lucide-react';
import StacksSigner from './StacksSigner';

// Stacks-compatible wallet creation parameters
const STACKS_ACCOUNT_PARAMS = {
  curve: "CURVE_SECP256K1" as const,
  pathFormat: "PATH_FORMAT_BIP32" as const,
  addressFormat: "ADDRESS_FORMAT_COMPRESSED" as const,
};

interface StacksAccount {
  accountId: string;
  publicKey: string;
  path: string;
  address: string;
  index: number;
}

interface StacksWalletData {
  walletId: string;
  walletName: string;
  accounts: StacksAccount[];
}

export default function StacksWallet() {
  const { passkeyClient } = useTurnkey();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stacksWallets, setStacksWallets] = useState<StacksWalletData[]>([]);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [selectedAccount, setSelectedAccount] = useState<{
    walletId: string;
    accountId: string;
  } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

  // Check if user is authenticated by checking localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('turnkey_user');
    const storedWallet = localStorage.getItem('turnkey_wallet');
    
    if (storedUser && storedWallet) {
      setUser(JSON.parse(storedUser));
      setWallet(JSON.parse(storedWallet));
      loadStacksWallets(JSON.parse(storedWallet));
    }
  }, []);

  const isAuthenticated = !!user && !!wallet;

  const loadStacksWallets = async (walletData?: any) => {
    try {
      const currentWallet = walletData || wallet;
      if (!currentWallet) return;

      const stacksWalletData: StacksWalletData[] = [];
      
      // Convert the stored wallet data to our StacksWalletData format
      if (currentWallet.addresses && currentWallet.addresses.length > 0) {
        const accounts: StacksAccount[] = currentWallet.addresses.map((addr: any, index: number) => ({
          accountId: `account-${index}`,
          publicKey: addr.publicKey || currentWallet.publicKey || '',
          path: "m/44'/5757'/0'/0/0",
          address: addr.address,
          index: index,
        }));

        stacksWalletData.push({
          walletId: currentWallet.walletId,
          walletName: `Stacks Wallet`,
          accounts,
        });
      }

      setStacksWallets(stacksWalletData);
    } catch (err: any) {
      console.error('Error loading Stacks wallets:', err);
      setError('Failed to load wallet data');
    }
  };

  const handleLogin = () => {
    // Redirect to auth page
    window.location.href = '/auth/oauth';
  };

  const handleLogout = () => {
    localStorage.removeItem('turnkey_user');
    localStorage.removeItem('turnkey_wallet');
    setUser(null);
    setWallet(null);
    setStacksWallets([]);
    setSelectedAccount(null);
  };

  const handleCreateWallet = async () => {
    // Redirect to auth page for wallet creation
    window.location.href = '/auth/oauth';
  };

  const handleCreateAccount = async (walletId: string) => {
    setError('Additional account creation not yet implemented. Please create a new wallet instead.');
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadStacksWallets();
    } catch (err: any) {
      setError('Failed to refresh wallets');
    } finally {
      setLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Stacks Wallet
            </CardTitle>
            <CardDescription>
              Connect with Turnkey to access your Stacks wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogin} className="w-full" size="lg">
              <Wallet className="mr-2 h-4 w-4" />
              Connect with Turnkey
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure embedded wallet powered by Turnkey
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold">Stacks Wallet</CardTitle>
                <CardDescription>Manage your Stacks accounts and transactions</CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Network Toggle */}
                <div className="flex rounded-lg border p-1">
                  <button
                    onClick={() => setNetwork('testnet')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      network === 'testnet'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Testnet
                  </button>
                  <button
                    onClick={() => setNetwork('mainnet')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      network === 'mainnet'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Mainnet
                  </button>
                </div>
                
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={handleLogout} variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Wallet Button */}
        {stacksWallets.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                  <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    No Stacks Wallets Found
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                    Create your first Stacks wallet to get started with STX, sBTC, and Stacks DeFi.
                  </p>
                  <Button onClick={handleCreateWallet} disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Stacks Wallet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallets Display */}
        {stacksWallets.map((wallet) => (
          <Card key={wallet.walletId}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{wallet.walletName}</CardTitle>
                  <CardDescription>
                    {wallet.accounts.length} account{wallet.accounts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleCreateAccount(wallet.walletId)}
                  disabled={loading}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wallet.accounts.map((account) => (
                  <div key={account.accountId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Account {account.index}</h4>
                        <p className="text-sm text-muted-foreground">
                          {account.path}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Network</p>
                        <p className="text-sm font-medium capitalize">{network}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Stacks Address</p>
                        <p className="text-sm font-mono break-all bg-muted p-2 rounded">
                          {account.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Public Key</p>
                        <p className="text-xs font-mono break-all text-muted-foreground">
                          {account.publicKey}
                        </p>
                      </div>
                      <div className="pt-2">
                        <Button
                          onClick={() => setSelectedAccount({
                            walletId: wallet.walletId,
                            accountId: account.accountId,
                          })}
                          variant={
                            selectedAccount?.walletId === wallet.walletId && 
                            selectedAccount?.accountId === account.accountId 
                              ? "default" 
                              : "outline"
                          }
                          size="sm"
                          className="w-full"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {selectedAccount?.walletId === wallet.walletId && 
                           selectedAccount?.accountId === account.accountId 
                            ? "Selected for Signing" 
                            : "Select for Signing"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create Additional Wallet */}
        {stacksWallets.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Button onClick={handleCreateWallet} disabled={loading} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Another Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stacks Transaction Signing */}
        <StacksSigner
          walletId={selectedAccount?.walletId}
          accountId={selectedAccount?.accountId}
          network={network}
        />

        {/* Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">Ready for Stacks:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• STX token transfers and stacking</li>
                <li>• sBTC (Bitcoin on Stacks) transactions</li>
                <li>• Smart contract interactions</li>
                <li>• DeFi protocols on Stacks</li>
                <li>• NFT trading and collections</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}