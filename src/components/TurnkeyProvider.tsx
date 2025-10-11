"use client";

import {
  TurnkeyProvider as ActualTurnkeyProvider,
  TurnkeyProviderConfig,
} from "@turnkey/react-wallet-kit";

const turnkeyConfig: TurnkeyProviderConfig = {
  organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
  authProxyConfigId: process.env.NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID!,
};

export function TurnkeyProvider({ children }: { children: React.ReactNode }) {
  return <ActualTurnkeyProvider
    config={turnkeyConfig}
    callbacks={{
      onError: (error) => console.error("Turnkey error:", error),
    }}
  >{children}</ActualTurnkeyProvider>;
}
