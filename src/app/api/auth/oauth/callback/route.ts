import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/auth/oauth?error=${error}`, request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/auth/oauth?error=missing_parameters', request.url));
    }

    // Parse state to get provider and nonce
    const stateData = JSON.parse(atob(state));
    const { provider, nonce } = stateData;

    console.log(`🔐 OAuth callback received for ${provider}`);

    // Exchange authorization code for access token and OIDC token
    let tokenResponse;
    let oidcToken;

    switch (provider) {
      case 'google':
        tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/oauth/callback`,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`Google token exchange failed: ${tokenResponse.statusText}`);
        }

        const googleTokenData = await tokenResponse.json();
        oidcToken = googleTokenData.id_token; // Google returns OIDC token as id_token
        break;

      case 'github':
        // GitHub doesn't provide OIDC tokens directly, we need to create one
        tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`GitHub token exchange failed: ${tokenResponse.statusText}`);
        }

        const githubTokenData = await tokenResponse.json();
        
        // Get user info from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${githubTokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (!userResponse.ok) {
          throw new Error(`GitHub user info failed: ${userResponse.statusText}`);
        }

        const githubUser = await userResponse.json();
        
        // Create a simple OIDC-like token for GitHub (in production, use proper JWT)
        oidcToken = btoa(JSON.stringify({
          iss: 'https://github.com',
          sub: githubUser.id.toString(),
          email: githubUser.email,
          name: githubUser.name,
          login: githubUser.login,
          nonce: nonce,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        }));
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!oidcToken) {
      throw new Error('No OIDC token received from provider');
    }

    console.log(`✅ OIDC token obtained from ${provider}`);

    // Redirect back to the OAuth page with the OIDC token
    const redirectUrl = new URL('/auth/oauth', request.url);
    redirectUrl.searchParams.set('oidc_token', oidcToken);
    redirectUrl.searchParams.set('provider', provider);

    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    const redirectUrl = new URL('/auth/oauth', request.url);
    redirectUrl.searchParams.set('error', error.message || 'OAuth authentication failed');
    return NextResponse.redirect(redirectUrl);
  }
}