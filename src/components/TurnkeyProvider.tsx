"use client";

import {
  TurnkeyProvider as ActualTurnkeyProvider,
  type TurnkeyProviderProps,
} from "@turnkey/react-wallet-kit";
import { useRouter } from "next/navigation";

const turnkeyConfig: TurnkeyProviderProps["config"] = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  // This is your Turnkey Organization ID
  organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
  // This is your Turnkey Auth Proxy Config ID
  authProxyConfigId: process.env.NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID!,
};

export function TurnkeyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ActualTurnkeyProvider
      config={turnkeyConfig}
      callbacks={{
        onAuthenticationSuccess: () => {
          // By default, the wallet kit will redirect to the redirectUri set in your config.
          // You can override this behavior here.
          router.push("/wallet");
        },
        onError: (error) => {
          console.error("Turnkey error:", error);
        },
      }}
    >
      {children}
    </ActualTurnkeyProvider>
  );
}
