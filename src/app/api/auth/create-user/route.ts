import { TurnkeyServerClient } from "@turnkey/sdk-server";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const turnkeyServer = new TurnkeyServerClient({
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

    // Generate unique user ID
    const userId = `user_${randomBytes(16).toString("hex")}`;

    // Create sub-organization for this user
    const createSubOrgResponse = await turnkeyServer.apiClient().createSubOrganization({
      subOrganizationName: username || email.split("@")[0],
      rootUsers: [
        {
          userName: email,
          userEmail: email,
          apiKeys: [], // Will use passkey instead
          authenticators: [], // Passkey will be added in next step
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

    const subOrgId = createSubOrgResponse.subOrganizationId;

    return NextResponse.json({
      success: true,
      subOrgId,
      userId,
      walletAddress: createSubOrgResponse.addresses?.[0],
    });
  } catch (error: any) {
    console.error("Failed to create user sub-org:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create user account",
        details: error.details 
      },
      { status: 500 }
    );
  }
}
