
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

    console.log("📝 Creating sub-organization for:", email);

    // Get the API client
    const apiClient = turnkey.apiClient();

    // Create sub-organization first, without wallet details
    const createSubOrgResponse = await apiClient.createSubOrganization({
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
    });

    const subOrgId = createSubOrgResponse.subOrganizationId;
    console.log("✅ Sub-org created:", subOrgId);

    // Now, create a wallet (private key) for this new sub-organization
    const createKeyResponse = await apiClient.createPrivateKeys({
        organizationId: subOrgId,
        privateKeys: [
            {
                privateKeyName: "Default Stacks Key",
                curve: "CURVE_SECP256K1",
                addressFormats: ["ADDRESS_FORMAT_STACKS"], 
                privateKeyTags: [],
            }
        ]
    });

    const walletAddress = createKeyResponse.privateKeys[0]?.addresses?.[0]?.address;
    console.log("✅ Wallet created with address:", walletAddress);

    return NextResponse.json({
      success: true,
      subOrgId: subOrgId,
      walletAddress: walletAddress,
    });
  } catch (error: any) {
    console.error("❌ Failed to create sub-org:", error);
    
    let errorMessage = error.message || "Failed to create user account";
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
