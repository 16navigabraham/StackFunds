'use client';

import { useState, useEffect } from 'react';
import { useTurnkey } from "@turnkey/sdk-react";
import { useRouter } from 'next/navigation';
import { User, WalletCreationResult } from '@/types/turnkey';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Key, Wallet, LogOut } from 'lucide-react';

export default function TurnkeyAuth() {
  const { passkeyClient } = useTurnkey();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletCreationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('turnkey_user');
    const storedWallet = localStorage.getItem('turnkey_wallet');
    
    if (storedUser && storedWallet) {
      setUser(JSON.parse(storedUser));
      setWallet(JSON.parse(storedWallet));
    }
  }, []);

  // Handle user signup using our API endpoint
  const handleSignup = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!passkeyClient) {
      setError('Passkey client not available. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Starting signup process for:', username);

      // Generate a proper challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      // Create passkey credential with proper WebAuthn parameters
      const credential = await navigator.credentials.create({
        publicKey: {
          rp: {
            id: window.location.hostname,
            name: "StackFund",
          },
          user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            residentKey: "required",
            requireResidentKey: true,
            userVerification: "required",
          },
          challenge: challenge,
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential || !credential.response) {
        throw new Error("Failed to create passkey");
      }

      console.log('✅ Passkey created successfully');

      // Extract attestation data
      const attestationResponse = credential.response as AuthenticatorAttestationResponse;
      const clientDataJSON = new TextDecoder().decode(attestationResponse.clientDataJSON);
      const attestationObject = Array.from(new Uint8Array(attestationResponse.attestationObject));

      // Call our API to create sub-org and wallet
      const response = await fetch('/api/turnkey/create-sub-org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          credentialId: credential.id,
          challenge: Array.from(challenge),
          attestation: {
            credentialId: credential.id,
            clientDataJson: clientDataJSON,
            attestationObject: attestationObject,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create organization: ${response.statusText}`);
      }

      const result = await response.json();
      
      const newUser: User = {
        id: result.subOrgId,
        userId: result.subOrgId,
        username,
        subOrgId: result.subOrgId,
        organizationId: result.subOrgId,
        credentialId: credential.id,
        createdAt: new Date().toISOString(),
      };

      const newWallet: WalletCreationResult = {
        walletId: result.walletId,
        addresses: result.addresses,
        publicKey: result.publicKey,
        subOrgId: result.subOrgId,
      };

      // Store in localStorage
      localStorage.setItem('turnkey_user', JSON.stringify(newUser));
      localStorage.setItem('turnkey_wallet', JSON.stringify(newWallet));

      setUser(newUser);
      setWallet(newWallet);

      console.log('✅ Signup completed successfully');

    } catch (err) {
      console.error('❌ Signup failed:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle user login using passkey
  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!passkeyClient) {
      setError('Passkey client not available. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Starting login process for:', username);

      // Use passkey for authentication
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [], // Allow any stored credential
          userVerification: "required",
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Authentication failed");
      }

      console.log('✅ Passkey authentication successful');

      // In a real implementation, you would:
      // 1. Send the credential to your backend for verification
      // 2. Retrieve the user's wallet data from your database
      // 3. Initialize the wallet in the client
      
      // For now, we'll try to load from localStorage
      const storedUser = localStorage.getItem('turnkey_user');
      const storedWallet = localStorage.getItem('turnkey_wallet');
      
      if (storedUser && storedWallet) {
        setUser(JSON.parse(storedUser));
        setWallet(JSON.parse(storedWallet));
        console.log('✅ User data loaded from localStorage');
      } else {
        throw new Error('No stored wallet data found. Please sign up first.');
      }

    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('turnkey_user');
    localStorage.removeItem('turnkey_wallet');
    setUser(null);
    setWallet(null);
    setUsername('');
    setError('');
  };

  // Handle wallet navigation
  const goToWallet = () => {
    router.push('/wallet');
  };

  // If user is authenticated, show wallet interface
  if (user && wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
            <CardDescription>
              Your embedded wallet is ready for Bitcoin testnet and Stacks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Username:</span>
                <span className="text-sm text-gray-900">{user.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Sub-Org ID:</span>
                <span className="text-xs text-gray-900 font-mono">{user.subOrgId.slice(0, 16)}...</span>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">Wallet ID:</span>
                <span className="text-xs text-blue-900 font-mono">{wallet.walletId.slice(0, 16)}...</span>
              </div>
              {wallet.addresses && wallet.addresses.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-blue-600">Bitcoin Testnet Address:</span>
                  <div className="text-xs text-blue-900 font-mono break-all bg-white p-2 rounded border">
                    {wallet.addresses[0].address}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={goToWallet} className="w-full" size="lg">
                <Wallet className="mr-2 h-4 w-4" />
                Go to Wallet
              </Button>
              
              <Button onClick={handleLogout} variant="outline" className="w-full" size="lg">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Info */}
            <div className="text-center text-xs text-muted-foreground">
              <p>Your wallet supports Bitcoin testnet, Stacks testnet4, and sBTC operations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authentication form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {mode === 'signup' 
              ? 'Create your embedded wallet with passkey authentication'
              : 'Login to your embedded wallet account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signup' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={mode === 'signup' ? handleSignup : handleLogin}
            disabled={loading || !username.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                {mode === 'signup' ? 'Sign Up with Passkey' : 'Login with Passkey'}
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              {mode === 'signup'
                ? 'Sign up creates a passkey and embedded wallet automatically'
                : 'Login using your existing passkey'}
            </p>
            <p className="text-xs">
              Your wallet will be ready for Bitcoin testnet, Stacks testnet4, and sBTC
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}