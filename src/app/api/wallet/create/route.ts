import { Turnkey } from "@turnkey/sdk-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { subOrgId } = await req.json();

    if (!subOrgId) {
      return NextResponse.json(
        { error: "Sub-organization ID is required" },
        { status: 400 }
      );
    }

    // Get parent organization credentials
    const defaultOrganizationId = process.env.TURNKEY_ORGANIZATION_ID ?? process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID;

    if (!defaultOrganizationId) {
      console.error("Missing Turnkey organization id for wallet creation.");
      return NextResponse.json({ error: "Server misconfiguration: missing Turnkey organization id" }, { status: 500 });
    }

    console.log("🔐 Creating wallet for sub-organization:", subOrgId);

    // Initialize Turnkey with parent organization credentials
    const turnkey = new Turnkey({
      apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
      apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
      apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
      defaultOrganizationId: defaultOrganizationId,
    });

    const apiClient = turnkey.apiClient();

    // Create wallet in the sub-organization
    // Note: This approach creates the wallet using parent org credentials
    // targeting the sub-organization
    const createWalletResponse = await apiClient.createWallet({
      organizationId: subOrgId,
      walletName: "Default Stacks Wallet",
      accounts: [
        {
          curve: "CURVE_SECP256K1",
          pathFormat: "PATH_FORMAT_BIP32",
          path: "m/44'/5757'/0'/0/0", // Stacks derivation path
          addressFormat: "ADDRESS_FORMAT_BITCOIN_TESTNET_P2WPKH",
        }
      ]
    });

    const walletId = createWalletResponse.walletId;
    const walletAddress = createWalletResponse.addresses?.[0];

    console.log("✅ Wallet created:", walletId);
    console.log("✅ Address:", walletAddress);

    return NextResponse.json({
      success: true,
      walletId: walletId,
      walletAddress: walletAddress,
    });

  } catch (error: any) {
    console.error("❌ Failed to create wallet:", error);
    
    let errorMessage = error.message || "Failed to create wallet";
    let errorDetails = null;

    if (error.details && Array.isArray(error.details)) {
      errorDetails = error.details.map((detail: any) => {
        if (detail.fieldViolations) {
          return detail.fieldViolations.map((v: any) => 
            `${v.field}: ${v.description}`
          ).join(", ");
        }
        return JSON.stringify(detail);
      }).join("; ");
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails || error.toString(),
      },
      { status: 500 }
    );
  }
}