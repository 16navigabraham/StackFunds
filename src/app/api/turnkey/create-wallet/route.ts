import { NextRequest, NextResponse } from 'next/server';
import { Turnkey } from '@turnkey/sdk-server';
import { getAddressFromPublicKey } from '@stacks/transactions';

const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID || process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});

export async function POST(req: NextRequest) {
  try {
    const { subOrgId, walletName } = await req.json();

    if (!subOrgId || !walletName) {
      return NextResponse.json(
        { success: false, error: 'subOrgId and walletName are required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Creating wallet for sub-org: ${subOrgId}`);

    // Get the API client
    const apiClient = turnkey.apiClient();

    // Create a wallet with Stacks-compatible format
    const createWalletResponse = await apiClient.createWallet({
      organizationId: subOrgId,
      walletName,
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

    // Get the public key from the first address
    let publicKey = '';
    let stacksAddress = '';
    
    if (addresses && addresses.length > 0) {
      // For compressed format, we need to get the public key
      // The address response should contain the compressed public key
      const firstAddress = addresses[0];
      
      // Try to get public key from create wallet response
      const getAddressResponse = await apiClient.getWalletAccounts({
        organizationId: subOrgId,
        walletId: walletId,
      });
      
      if (getAddressResponse.accounts && getAddressResponse.accounts.length > 0) {
        const account = getAddressResponse.accounts[0];
        if (account.publicKey) {
          publicKey = account.publicKey;
          // Generate Stacks address from public key
          try {
            stacksAddress = getAddressFromPublicKey(publicKey, 'testnet');
          } catch (error) {
            console.warn('Failed to generate Stacks address:', error);
            stacksAddress = firstAddress; // fallback to the original address
          }
        } else {
          stacksAddress = firstAddress;
        }
      } else {
        stacksAddress = firstAddress;
      }
    }

    return NextResponse.json({
      success: true,
      walletId,
      addresses: [{
        address: stacksAddress,
        publicKey: publicKey,
        format: 'STACKS_TESTNET',
      }],
      publicKey: publicKey,
    });
  } catch (error: any) {
    console.error('❌ Error creating wallet:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create wallet' 
      },
      { status: 500 }
    );
  }
}