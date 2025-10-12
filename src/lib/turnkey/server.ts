import { Turnkey } from '@turnkey/sdk-server';
// import { ApiKeyStamper } from '@turnkey/api-key-stamper';

// Turnkey server configuration commented out due to SDK API changes
// Will be updated when proper Turnkey integration is implemented
export const turnkeyServerClient = null;

/*
export const turnkeyServerClient = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});
*/