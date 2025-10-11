// @ts-nocheck
"use client";

import {
  useContext,
  createContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { TWallet, useWallet, useMfa } from "@turnkey/react-wallet-kit";

// A mock implementation of `useTurnkey`
// In a real app, you would use the `@turnkey/react-wallet-kit`
// but for the purpose of this demo, we are using a mock hook.

interface TurnkeyContextType {
  user: TWallet | null;
  isLoggedIn: boolean;
  isConnecting: boolean;
  isCreating: boolean;
  handleLogin: () => void;
  logout: () => void;
}

const TurnkeyContext = createContext<TurnkeyContextType | undefined>(
  undefined
);

export const useTurnkey = (): TurnkeyContextType => {
  const [user, setUser] = useState<TWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleLogin = useCallback(() => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsCreating(true);
      setIsConnecting(false);
      setTimeout(() => {
        setUser({
          id: "w-uuid-123",
          organizationId: "d449a606-898f-4ad6-9e59-ae83e877995f",
          wallets: [
            {
              id: "wl-uuid-456",
              address: "bc1qylp8a2w8u4m9wzfr8qj9p3tqj9n2h8g9g9h9g9",
              path: "m/44'/0'/0'/0/0",
            },
          ],
        });
        setIsCreating(false);
      }, 1500);
    }, 1500);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isConnecting,
    isCreating,
    handleLogin,
    logout,
  };
};
