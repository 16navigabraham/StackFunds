
import { Turnkey } from "@turnkey/sdk-server";
import { NextRequest, NextResponse } from "next/server";

// Initialize Turnkey with correct class name
const turnkey = new Turnkey({
  apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
});

export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("Creating sub-organization for:", email);

    // Get the API client
    const apiClient = turnkey.apiClient();

    // Create sub-organization with embedded wallet
    const response = await apiClient.createSubOrganization({
      subOrganizationName: username || email.split("@")[0],
      rootUsers: [
        {
          userName: email,
          userEmail: email,
          apiKeys: [],
          authenticators: [],
        },
      ],
      rootQuorumThreshold: 1,
      wallet: {
        walletName: "Default Wallet",
        accounts: [
          {
            curve: "CURVE_SECP256K1",
            pathFormat: "PATH_FORMAT_BIP32",
            path: "m/44'/5757'/0'/0/0", // Stacks path
            addressFormat: "ADDRESS_FORMAT_STACKS",
          },
        ],
      },
    });

    console.log("✅ Sub-org created:", response.subOrganizationId);

    return NextResponse.json({
      success: true,
      subOrgId: response.subOrganizationId,
      walletAddress: response.addresses?.[0],
    });
  } catch (error: any) {
    console.error("❌ Failed to create sub-org:", error);
    
    return NextResponse.json(
      {
        error: error.message || "Failed to create user account",
        details: error.details || error.toString(),
      },
      { status: 500 }
    );
  }
}
