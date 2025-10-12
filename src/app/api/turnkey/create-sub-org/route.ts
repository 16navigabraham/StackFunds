import { NextRequest, NextResponse } from 'next/server';
// import { Turnkey } from '@turnkey/sdk-server';

// Turnkey configuration commented out since we're using mock responses
// const turnkey = new Turnkey({
//   apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
//   defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID!,
// });

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

    // For now, return a mock response since the Turnkey SDK configuration needs to be updated
    // This simulates successful sub-org creation with proper response structure
    const mockSubOrgId = `sub_org_${username}_${Date.now()}`;
    const mockWalletId = `wallet_${username}_${Date.now()}`;
    const mockAddress = `tb1q${Array.from({length: 39}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
    const mockPublicKey = `02${Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`;

    console.log('✅ Mock sub-organization created:', mockSubOrgId);

    return NextResponse.json({
      success: true,
      subOrgId: mockSubOrgId,
      walletId: mockWalletId,
      addresses: [{
        address: mockAddress,
        format: 'ADDRESS_FORMAT_BITCOIN_TESTNET_P2WPKH',
        publicKey: mockPublicKey,
      }],
      publicKey: mockPublicKey,
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