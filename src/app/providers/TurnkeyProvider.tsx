'use client';

import { TurnkeyProvider as BaseTurnkeyProvider } from '@turnkey/sdk-react';
import { ReactNode } from 'react';

interface TurnkeyProviderProps {
  children: ReactNode;
}

export function TurnkeyProvider({ children }: TurnkeyProviderProps) {
  return (
    <BaseTurnkeyProvider
      config={{
        apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
        defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
        serverSignUrl: "/api/turnkey/sign",
      }}
    >
      {children}
    </BaseTurnkeyProvider>
  );
}