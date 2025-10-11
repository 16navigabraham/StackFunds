// @ts-nocheck
"use client";
import {
  TurnkeyClient,
  getWebAuthnAttestation,
} from "@turnkey/http";
import { WebAuthnStamper } from "@turnkey/webauthn-stamper";
import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useWallet,
  useMfa,
  TurnkeyWalletProvider,
  type TWallet,
  type TAttestation,
  type TMfa,
} from "@turnkey/react-wallet-kit";

// This is a PUBLIC key. You can find it in the Turnkey dashboard
// on the settings page.
const turnkeyOrganizationId = "d449a606-898f-4ad6-9e59-ae83e877995f";
const turnkeyApiPublicKey = "02258b343110248473e6a41f6923c6a46d8f8d689b6999a4c849103c809181c0c1";
const turnkeyApiPrivateKey = "4b5d63351d3b079717757b328a6f4e85743d833989c93cb562e8418b763e2646";


const stamper = new WebAuthnStamper({
  rpId: "localhost",
});

const passkeyHttpClient = new TurnkeyClient(
  {
    baseUrl: "https://api.turnkey.com",
  },
  stamper
);

const turnkeyWalletContext = {
  apiPublicKey: turnkeyApiPublicKey,
  apiPrivateKey: turnkeyApiPrivateKey,
  organizationId: turnkeyOrganizationId,
};

export const TurnkeyProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TurnkeyWalletProvider
      stamper={stamper}
      turnkeyWalletContext={turnkeyWalletContext}
    >
      {children}
    </TurnkeyWalletProvider>
  );
};
