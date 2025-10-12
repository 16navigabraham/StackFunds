"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";

export default function MessageSigner() {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    // Check for stored user and wallet data
    const storedUser = localStorage.getItem('turnkey_user');
    const storedWallet = localStorage.getItem('turnkey_wallet');
    
    if (storedUser && storedWallet) {
      setUser(JSON.parse(storedUser));
      setWallet(JSON.parse(storedWallet));
    }
  }, []);

  const getSignWith = async () => {
    if (!user) throw new Error("No active session");
    if (!wallet || !wallet.addresses || wallet.addresses.length === 0) {
      throw new Error("No wallet found");
    }
    return wallet.addresses[0].address;
  };

  const signMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError("");
    setSignature("");

    try {
      const signerAddress = await getSignWith();
      
      // Mock signing implementation since Turnkey SDK methods aren't available
      const mockSignature = `0x${Array.from(crypto.getRandomValues(new Uint8Array(64))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      console.log('Message signed with address:', signerAddress);
      console.log('Message:', message);
      console.log('Mock signature:', mockSignature);

      setSignature(mockSignature);
    } catch (err: any) {
      setError(err.message || "Failed to sign message");
      console.error("Signing error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Message to Sign
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows={4}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Signing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={signMessage}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Signing..." : "Sign Message"}
        </Button>

        {signature && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Signature
            </label>
            <div className="p-3 bg-muted/50 rounded-md border break-all font-mono text-sm">
              {signature}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
