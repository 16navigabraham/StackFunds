"use client";

import { useTurnkey } from "@turnkey/sdk-react";
import { hashMessage } from "viem";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";


export default function MessageSigner() {
  const { signRawPayload, getWallets, user } = useTurnkey();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getSignWith = async () => {
    if (!user) throw new Error("No active session");

    const wallets = await getWallets();
    if (!wallets || wallets.wallets.length === 0) {
      throw new Error("No wallet found");
    }

    return wallets.wallets[0].accounts[0].address;
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
      const messageHash = hashMessage(message);

      const result = await signRawPayload({
        payload: messageHash.slice(2), // viem includes 0x, turnkey expects it without
        signWith: signerAddress,
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      });

      setSignature(result.signRawPayloadResult.signature);
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
