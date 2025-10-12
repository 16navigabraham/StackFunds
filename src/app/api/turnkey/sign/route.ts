import { TurnkeyServerClient } from "@turnkey/sdk-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Determine server organization id (prefer TURNKEY_ORGANIZATION_ID)
    const defaultOrganizationId = process.env.TURNKEY_ORGANIZATION_ID ?? process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID;

    if (!defaultOrganizationId) {
      console.error("Missing Turnkey organization id for server signing route. Set TURNKEY_ORGANIZATION_ID or NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID.");
      return NextResponse.json({ error: "Server misconfiguration: missing Turnkey organization id" }, { status: 500 });
    }

    const turnkeyServer = new TurnkeyServerClient({
      apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
      apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
      apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
      defaultOrganizationId: defaultOrganizationId,
    } as any);

    const body = await req.json();
    // This is a simplified example. In a real application, you would
    // want to add more validation and security checks.
    const { signedRequest } = await turnkeyServer.stamp(body);
    return NextResponse.json(signedRequest);
  } catch (error: any) {
    console.error("Failed to sign request:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to sign request" },
      { status: 500 }
    );
  }
}
