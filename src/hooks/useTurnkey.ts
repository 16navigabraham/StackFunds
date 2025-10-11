"use client";

import { useWallet, useMfa } from "@turnkey/react-wallet-kit";

// Re-exporting the official hooks
// This allows us to potentially add more custom logic or mocks here in the future
// without changing all the import sites.
export const useTurnkey = useWallet;
export const useTurnkeyMfa = useMfa;
