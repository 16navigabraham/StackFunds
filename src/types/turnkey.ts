export interface User {
  id: string;
  userId: string;
  username: string;
  subOrgId: string;
  organizationId: string;
  credentialId: string;
  createdAt: string;
  walletAddress?: string;
}

export interface WalletCreationResult {
  walletId: string;
  publicKey: string;
  subOrgId: string;
  addresses: {
    address: string;
    format: string;
    path?: string;
    publicKey?: string;
  }[];
}