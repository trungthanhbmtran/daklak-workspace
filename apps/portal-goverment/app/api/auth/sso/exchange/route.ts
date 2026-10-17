import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || 'CiA_7dKL3zw7JnhhliTMwyU_Wssa';
    // Fail-fast: KHÔNG fallback secret. Thiếu env → trả 500, không lộ secret cứng.
    const clientSecret = process.env.SSO_CLIENT_SECRET;
    const tokenUrl = process.env.NEXT_PUBLIC_SSO_TOKEN_URL || 'https://lifesso.lifetex.vn:9445/oauth2/token';
    const redirectUri = process.env.NEXT_PUBLIC_SSO_REDIRECT_URI || (request.headers.get('origin') || 'http://localhost:3000') + '/auth/callback';
    const userInfoUrl = process.env.NEXT_PUBLIC_SSO_USERINFO_URL || 'https://lifesso.lifetex.vn:9445/oauth2/userinfo';

    if (!clientId || !clientSecret || !tokenUrl || !redirectUri) {
      const missing = [
        !clientId && 'NEXT_PUBLIC_SSO_CLIENT_ID',
        !clientSecret && 'SSO_CLIENT_SECRET',
        !tokenUrl && 'NEXT_PUBLIC_SSO_TOKEN_URL',
        !redirectUri && 'NEXT_PUBLIC_SSO_REDIRECT_URI',
      ].filter(Boolean).join(', ');
      return NextResponse.json(
        { error: `Server missing SSO configuration: ${missing}` },
        { status: 500 }
      );
    }

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);
    body.append('redirect_uri', redirectUri);

    const tokenResponse = await axios.post(tokenUrl, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;
    let userInfo = { sub: 'unknown' };

    if (userInfoUrl) {
      try {
        const userResponse = await axios.get(userInfoUrl, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        userInfo = userResponse.data;
      } catch {
        // Fallback user info handled
      }
    }

    return NextResponse.json({
      access_token,
      userInfo,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}