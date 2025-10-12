
import { Turnkey } from "@turnkey/sdk-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json();

    // Determine the organization id to use on the server.
    // Prefer a server-only env var (TURNKEY_ORGANIZATION_ID) and fall back to the
    // public client env var if present. This prevents initializing Turnkey with
    // an empty organization id (which produced ORGANIZATION_NOT_FOUND).
    const defaultOrganizationId = process.env.TURNKEY_ORGANIZATION_ID ?? process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID;

    if (!defaultOrganizationId) {
      console.error("Missing Turnkey organization id. Set TURNKEY_ORGANIZATION_ID or NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID in your environment.");
      return NextResponse.json({ error: "Server misconfiguration: missing Turnkey organization id" }, { status: 500 });
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("📝 Creating sub-organization for:", email);
    console.log("🔑 Using parent organization ID:", defaultOrganizationId);

    // Initialize Turnkey server client with validated organization id
    const turnkey = new Turnkey({
      apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
      apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
      apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
      defaultOrganizationId: defaultOrganizationId,
    });

    // Get the API client
    const apiClient = turnkey.apiClient();

    // Verify organization access first
    try {
      console.log("🔍 Verifying organization access...");
      const orgInfo = await apiClient.getOrganization({
        organizationId: defaultOrganizationId,
      });
      console.log("✅ Organization verified:", orgInfo.organizationData?.name);
    } catch (orgError) {
      console.error("❌ Failed to verify organization:", orgError);
      return NextResponse.json({
        error: "Invalid organization configuration. Please check your API keys and organization ID match.",
        details: "Organization ID and API keys don't match"
      }, { status: 500 });
    }

    // Create sub-organization first
    const createSubOrgResponse = await apiClient.createSubOrganization({
      subOrganizationName: username || email.split("@")[0],
      rootUsers: [
        {
          userName: email,
          userEmail: email,
          apiKeys: [],
          authenticators: [],
          oauthProviders: [],
        },
      ],
      rootQuorumThreshold: 1,
    });

    const subOrgId = createSubOrgResponse.subOrganizationId;
    console.log("✅ Sub-org created:", subOrgId);

    return NextResponse.json({
      success: true,
      subOrgId: subOrgId,
      walletId: null,
      walletAddress: null,
      message: "Account created successfully.",
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
