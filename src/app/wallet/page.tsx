
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTurnkey } from '@turnkey/sdk-react';
import WalletManagement from '@/components/WalletManagement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Copy, 
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Bitcoin,
  Coins
} from 'lucide-react';
import CopyButton from '@/components/CopyButton';

interface WalletData {
  walletId: string;
  walletName: string;
  addresses: Array<{
    address: string;
    publicKey: string;
  }>;
}
export default function WalletPage() {
  const { authIframeClient } = useTurnkey();
  const [user, setUser] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [balance, setBalance] = useState<{
    stx: string;
    btc: string;
    usd: string;
    loading: boolean;
    error: string | null;
  }>({
    stx: '0',
    btc: '0',
    usd: '0',
    loading: false,
    error: null
  });
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [priceData, setPriceData] = useState<{ stx_usd: number; btc_usd: number }>({ stx_usd: 0, btc_usd: 0 });
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  // Check for user session and load wallet data
  useEffect(() => {
    const initializeWallet = async () => {
      setLoading(true);
      
      try {
        // Check localStorage for user session
        const storedSubOrgId = localStorage.getItem('turnkey_user_sub_org_id');
        const storedEmail = localStorage.getItem('turnkey_user_email');
        
        if (storedSubOrgId) {
          setUser({
            organizationId: storedSubOrgId,
            email: storedEmail
          });
          
          // Check if user has a wallet
          const walletId = localStorage.getItem('turnkey_wallet_id');
          const walletAddress = localStorage.getItem('turnkey_wallet_address');
          
          if (walletId && walletAddress) {
            const mockWallet = {
              id: walletId,
              accounts: [{ address: walletAddress }]
            };
            setWallets([mockWallet]);
            await loadWalletData(mockWallet);
          }
          
          await loadPriceData();
        }
      } catch (e) {
        console.error("Error initializing wallet", e);
      } finally {
        setLoading(false);
      }
    };
    
    initializeWallet();
  }, [network]);

  const loadPriceData = async () => {
    try {
      // Fetch current STX and BTC prices from CoinGecko API
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=stacks,bitcoin&vs_currencies=usd'
      );
      const data = await response.json();
      setPriceData({
        stx_usd: data.stacks?.usd || 0,
        btc_usd: data.bitcoin?.usd || 0
      });
    } catch (error) {
      console.error('Error fetching price data:', error);
    }
  };

  const loadWalletData = async (walletData: any) => {
    if (!walletData.accounts || walletData.accounts.length === 0) {
      return;
    }

    const address = walletData.accounts[0].address;
    setBalance(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use your custom sBTC balance API for testnet4
      if (network === 'testnet') {
        console.log('Fetching balance for testnet address:', address);
        const response = await fetch(`/api/sbtc/balance/${address}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch balance: ${response.statusText}`);
        }

        const balanceData = await response.json();
        console.log('Balance data received:', balanceData);

        // Calculate USD values using current prices
        const stxUsdValue = (balanceData.stx_amount * priceData.stx_usd).toFixed(2);
        const btcUsdValue = (balanceData.sbtc_amount * priceData.btc_usd).toFixed(2);
        const totalUsdValue = (parseFloat(stxUsdValue) + parseFloat(btcUsdValue)).toFixed(2);

        console.log('USD calculations:', { 
          stxAmount: balanceData.stx_amount, 
          stxPrice: priceData.stx_usd, 
          stxUsd: stxUsdValue,
          sbtcAmount: balanceData.sbtc_amount, 
          btcPrice: priceData.btc_usd, 
          btcUsd: btcUsdValue,
          total: totalUsdValue 
        });

        setBalance({
          stx: balanceData.formatted_stx || '0.000000 STX',
          btc: balanceData.formatted_balance || '0.00000000 sBTC',
          usd: parseFloat(totalUsdValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          loading: false,
          error: null
        });

        // No transactions from this API, but you could add them later
        setTransactions([]);

      } else {
        // Mainnet - use standard Stacks API
        const stacksApiUrl = 'https://api.hiro.so';
        
        const [balanceResponse, transactionsResponse] = await Promise.all([
          fetch(`${stacksApiUrl}/extended/v1/address/${address}/balances`),
          fetch(`${stacksApiUrl}/extended/v1/address/${address}/transactions?limit=10`)
        ]);

        if (!balanceResponse.ok) {
          throw new Error(`Failed to fetch balance: ${balanceResponse.statusText}`);
        }

        const balanceData = await balanceResponse.json();
        const transactionsData = transactionsResponse.ok ? await transactionsResponse.json() : { results: [] };

        // Convert microSTX to STX (1 STX = 1,000,000 microSTX)
        const stxBalance = (parseInt(balanceData.stx.balance) / 1000000).toFixed(6);
        
        // Get sBTC balance from fungible tokens
        let sbtcBalance = '0';
        if (balanceData.fungible_tokens) {
          const sbtcToken = Object.entries(balanceData.fungible_tokens).find(([contract]) => 
            contract.toLowerCase().includes('sbtc') || contract.toLowerCase().includes('bitcoin')
          );
          if (sbtcToken) {
            const [, tokenData] = sbtcToken as [string, any];
            sbtcBalance = (parseInt(tokenData.balance) / 100000000).toFixed(8);
          }
        }

        // Calculate USD values
        const stxUsdValue = (parseFloat(stxBalance) * priceData.stx_usd).toFixed(2);
        const btcUsdValue = (parseFloat(sbtcBalance) * priceData.btc_usd).toFixed(2);
        const totalUsdValue = (parseFloat(stxUsdValue) + parseFloat(btcUsdValue)).toFixed(2);

        setBalance({
          stx: parseFloat(stxBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
          btc: parseFloat(sbtcBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
          usd: parseFloat(totalUsdValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          loading: false,
          error: null
        });

        setTransactions(transactionsData.results || []);
      }

    } catch (error: any) {
      console.error('Error loading wallet data:', error);
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load wallet data'
      }));
    }
  };

  const handleDeposit = () => {
    setDepositModalOpen(true);
  };

  const handleWithdraw = () => {
    alert('Withdraw feature coming soon! This would open a withdrawal form to send funds to another address.');
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (wallets.length > 0) {
        await loadWalletData(wallets[0]);
        await loadPriceData();
      }
    } catch (err: any) {
      setBalance(prev => ({ ...prev, error: 'Failed to refresh wallet data' }));
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading your wallet...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Welcome to Your Wallet
            </CardTitle>
            <CardDescription>
              Connect your account to access your digital assets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="w-full" 
              size="lg"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure wallet powered by Turnkey infrastructure
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show wallet creation prompt if authenticated but no wallets
  if (wallets.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Your Wallet</h1>
            <p className="text-muted-foreground">
              Your account is connected! Now create your wallet to get started.
            </p>
          </div>
          
          {/* Show wallet creation interface */}
          <WalletManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your digital assets securely
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading || balance.loading}>
              <RefreshCw className={`h-4 w-4 ${(loading || balance.loading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {balance.error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{balance.error}</span>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Network Status */}
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Connected to Stacks {network.charAt(0).toUpperCase() + network.slice(1)} network{network === 'testnet' ? ' (Bitcoin Testnet4 compatible)' : ''}. 
            {!balance.loading && !balance.error && balance.usd !== '0' && (
              <span className="ml-2 text-green-600">✓ Data synced</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Balance Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Balance */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {balance.loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-5 bg-muted rounded w-24"></div>
                    </div>
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-5 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ) : balance.error ? (
                <div className="text-center py-4">
                  <p className="text-destructive text-sm">{balance.error}</p>
                  <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">${balance.usd}</div>
                    {priceData.stx_usd > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        STX: ${priceData.stx_usd.toFixed(4)} | BTC: ${priceData.btc_usd.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Asset Breakdown */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Coins className="h-4 w-4 mr-1" />
                        STX
                      </div>
                      <div className="font-semibold">{balance.stx} STX</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Bitcoin className="h-4 w-4 mr-1" />
                        sBTC
                      </div>
                      <div className="font-semibold">{balance.btc} sBTC</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleDeposit} className="w-full" size="lg">
                    <ArrowDownLeft className="mr-2 h-4 w-4" />
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Deposit to Your Wallet</DialogTitle>
                    <DialogDescription>
                      Important: This is a Stacks address. Bitcoin cannot be sent directly here.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Critical Notice */}
                    <Alert>
                      <Wallet className="h-4 w-4" />
                      <AlertDescription>
                        <strong>⚠️ Address Type Warning:</strong> This is a Stacks address (ST...), not a Bitcoin address (tb1q...). 
                        Your external wallet rejects it because it expects a Bitcoin address format.
                      </AlertDescription>
                    </Alert>

                    {/* Funding Options */}
                    <div className="space-y-4">
                      <h4 className="font-medium">How to Get Funds:</h4>
                      
                      {/* Option 1: STX Tokens */}
                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="font-medium">1. Send STX Tokens (Works)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          If you have STX tokens in another Stacks wallet, you can send them directly:
                        </p>
                        <div className="flex items-center justify-between p-2 bg-muted rounded mt-2">
                          <code className="text-xs font-mono break-all">
                            {wallets[0]?.accounts?.[0]?.address || 'No address available'}
                          </code>
                          {wallets[0]?.accounts?.[0]?.address && (
                            <CopyButton 
                              textToCopy={wallets[0].accounts[0].address} 
                              className="ml-2 flex-shrink-0"
                            />
                          )}
                        </div>
                      </div>

                      {/* Option 2: sBTC Bridge Process */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="h-4 w-4 text-primary" />
                          <span className="font-medium">2. Get sBTC (Bitcoin → sBTC Bridge)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To convert Bitcoin to sBTC on testnet4:
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3">
                          <p className="text-sm font-medium mb-2">Bridge Process:</p>
                          <ol className="text-xs space-y-1 list-decimal list-inside">
                            <li>Go to the sBTC bridge (link below)</li>
                            <li>Connect your Bitcoin wallet (with testnet BTC)</li>
                            <li>Enter your Stacks address: <code className="bg-white/50 px-1 rounded">{wallets[0]?.accounts?.[0]?.address?.substring(0, 10)}...</code></li>
                            <li>Bridge will give you a Bitcoin address to send to</li>
                            <li>Send Bitcoin to that address (not this Stacks address)</li>
                            <li>sBTC appears in your Stacks wallet automatically</li>
                          </ol>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            window.open('https://btc-testnet4.xverse.app/', '_blank');
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open sBTC Bridge (Bitcoin Testnet4)
                        </Button>
                      </div>

                      {/* Option 3: Testnet Faucets */}
                      {network === 'testnet' && (
                        <div className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-medium">3. Get Free Testnet Tokens</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            For testing purposes:
                          </p>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                const address = wallets[0]?.accounts?.[0]?.address;
                                if (address) {
                                  const faucetUrl = `https://explorer.hiro.so/sandbox/faucet?address=${address}`;
                                  window.open(faucetUrl, '_blank');
                                }
                              }}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Get Free STX (Stacks Faucet)
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Note: For sBTC, you need to use the bridge above with testnet Bitcoin
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Option 4: Buy from Exchange */}
                      <div className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <span className="font-medium">4. Buy from Exchange (Mainnet)</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Buy STX on exchanges like Coinbase, then withdraw to your Stacks address above.
                          {network === 'testnet' && ' (Not available for testnet)'}
                        </p>
                      </div>
                    </div>

                    {/* Why Your External Wallet Rejects This */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                      <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                        Why Your External Wallet Says "Invalid Address":
                      </h4>
                      <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                        <li>• Your external wallet expects a Bitcoin address (starts with 'tb1', '1', '3', 'bc1')</li>
                        <li>• This is a Stacks address (starts with 'ST' for testnet, 'SP' for mainnet)</li>
                        <li>• They are different blockchain networks with different address formats</li>
                        <li>• Use the sBTC bridge above to convert Bitcoin → sBTC properly</li>
                      </ul>
                    </div>

                    {/* Current Network */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Current Network</p>
                        <p className="text-xs text-muted-foreground">
                          Stacks {network.charAt(0).toUpperCase() + network.slice(1)}{network === 'testnet' ? ' (Bitcoin Testnet4 compatible)' : ''}
                        </p>
                      </div>
                      <Badge variant={network === 'testnet' ? 'secondary' : 'default'}>
                        Stacks {network.charAt(0).toUpperCase() + network.slice(1)}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          const address = wallets[0]?.accounts?.[0]?.address;
                          if (address) {
                            const explorerUrl = network === 'testnet' 
                              ? `https://explorer.hiro.so/address/${address}?chain=testnet`
                              : `https://explorer.hiro.so/address/${address}`;
                            window.open(explorerUrl, '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View in Explorer
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setDepositModalOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button onClick={handleWithdraw} variant="outline" className="w-full" size="lg">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
              <Button 
                onClick={() => window.location.href = '/create'} 
                variant="outline" 
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Create Payment Link
              </Button>
              <Button 
                onClick={() => window.location.href = '/my-links'} 
                variant="outline" 
                className="w-full"
              >
                <History className="mr-2 h-4 w-4" />
                View My Links
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Your Wallet Address</CardTitle>
            <CardDescription>
              Share this address to receive STX, sBTC, and other Stacks assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <code className="text-sm font-mono break-all">
                {wallets[0]?.accounts?.[0]?.address || 'No address available'}
              </code>
              {wallets[0]?.accounts?.[0]?.address && (
                <CopyButton 
                  textToCopy={wallets[0].accounts[0].address} 
                  className="ml-2 flex-shrink-0"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
                <CardDescription>Your latest wallet activity</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const address = wallets[0]?.accounts?.[0]?.address;
                  if (address) {
                    const explorerUrl = network === 'testnet' 
                      ? `https://explorer.hiro.so/address/${address}?chain=testnet`
                      : `https://explorer.hiro.so/address/${address}`;
                    window.open(explorerUrl, '_blank');
                  }
                }}
              >
                <History className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {balance.loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx, index) => (
                  <div key={tx.tx_id || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {tx.tx_type === 'token_transfer' ? (
                          <ArrowUpRight className="w-4 h-4 text-primary" />
                        ) : (
                          <Coins className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {tx.tx_type === 'token_transfer' ? 'STX Transfer' : 
                           tx.tx_type === 'contract_call' ? 'Contract Call' :
                           tx.tx_type === 'smart_contract' ? 'Contract Deploy' :
                           'Transaction'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.burn_block_time_iso || tx.canonical_block_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {tx.token_transfer?.amount ? 
                          `${(parseInt(tx.token_transfer.amount) / 1000000).toFixed(6)} STX` :
                          tx.tx_status === 'success' ? 'Success' : tx.tx_status
                        }
                      </p>
                      <button
                        onClick={() => {
                          const explorerUrl = network === 'testnet' 
                            ? `https://explorer.hiro.so/txid/${tx.tx_id}?chain=testnet`
                            : `https://explorer.hiro.so/txid/${tx.tx_id}`;
                          window.open(explorerUrl, '_blank');
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-muted-foreground mb-2">No Transactions Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your transaction history will appear here once you start using your wallet
                </p>
                <Button onClick={() => setDepositModalOpen(true)} variant="outline">
                  Make Your First Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Payment Links */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-medium">My Payment Links</CardTitle>
                <CardDescription>Manage your sBTC payment requests</CardDescription>
              </div>
              <Button 
                onClick={() => window.location.href = '/create'} 
                variant="outline" 
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">No Payment Links Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first payment link to start receiving sBTC payments
              </p>
              <Button onClick={() => window.location.href = '/create'} variant="outline">
                Create Payment Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Live Data Sources:</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Balance: {network === 'testnet' ? 'Custom sBTC API (/api/sbtc/balance)' : 'Stacks Blockchain API'}</li>
                  <li>• Prices: CoinGecko API</li>
                  <li>• Transactions: {network === 'testnet' ? 'Limited (testnet4)' : 'Hiro Explorer'}</li>
                  <li>• Network: {network.charAt(0).toUpperCase() + network.slice(1)}{network === 'testnet' ? ' (Bitcoin Testnet4)' : ''}</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Security Features:</h3>
                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <li>• Turnkey infrastructure protection</li>
                  <li>• Read-only API access</li>
                  <li>• No private keys exposed</li>
                  <li>• MongoDB-secured payment links</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
