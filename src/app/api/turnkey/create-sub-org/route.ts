import { NextRequest, NextResponse } from 'next/server';
import { Turnkey } from '@turnkey/sdk-server';

const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID || process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});

export async function POST(req: NextRequest) {
  try {
    const { username, credentialId, challenge, attestation } = await req.json();

    if (!username || !credentialId || !attestation) {
      return NextResponse.json(
        { success: false, error: 'Username, credentialId, and attestation are required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Creating sub-organization for user: ${username}`);

    // Get the API client
    const apiClient = turnkey.apiClient();

    // Create sub-organization
    const createSubOrgResponse = await apiClient.createSubOrganization({
      subOrganizationName: username,
      rootUsers: [
        {
          userName: username,
          userEmail: username + '@example.com',
          apiKeys: [],
          authenticators: [{
            authenticatorName: 'Passkey',
            challenge: Buffer.from(challenge).toString('hex'),
            attestation: {
              credentialId,
              clientDataJson: attestation.clientDataJson,
              attestationObject: attestation.attestationObject.map((b: number) => b.toString(16).padStart(2, '0')).join(''),
              transports: ['AUTHENTICATOR_TRANSPORT_INTERNAL']
            }
          }],
          oauthProviders: [],
        },
      ],
      rootQuorumThreshold: 1,
    });

    const subOrgId = createSubOrgResponse.subOrganizationId;
    console.log('✅ Sub-organization created:', subOrgId);

    // Create a wallet with Stacks address format
    const createWalletResponse = await apiClient.createWallet({
      organizationId: subOrgId,
      walletName: 'Default Stacks Wallet',
      accounts: [{
        curve: 'CURVE_SECP256K1',
        pathFormat: 'PATH_FORMAT_BIP32',
        path: "m/44'/5757'/0'/0/0",
        addressFormat: 'ADDRESS_FORMAT_COMPRESSED',
      }]
    });

    const walletId = createWalletResponse.walletId;
    const addresses = createWalletResponse.addresses;

    console.log('✅ Wallet created:', walletId);
    console.log('✅ Addresses:', addresses);

    return NextResponse.json({
      success: true,
      subOrgId,
      walletId,
      addresses: addresses.map(addr => ({
        address: addr,
        format: 'ADDRESS_FORMAT_COMPRESSED',
        publicKey: '',
      })),
      publicKey: '',
    });
  } catch (error: any) {
    console.error('❌ Error creating sub-organization:', error);
    
    // Check if it's a specific Turnkey API error
    if (error.message?.includes('organization') || error.status === 400) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create organization. Please check your Turnkey credentials.' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process signup request' 
      },
      { status: 500 }
    );
  }
}