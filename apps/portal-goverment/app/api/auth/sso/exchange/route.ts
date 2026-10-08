import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_SSO_CLIENT_ID;
    const clientSecret = process.env.SSO_CLIENT_SECRET;
    const tokenUrl = process.env.NEXT_PUBLIC_SSO_TOKEN_URL;
    const redirectUri = process.env.NEXT_PUBLIC_SSO_REDIRECT_URI;
    const userInfoUrl = process.env.NEXT_PUBLIC_SSO_USERINFO_URL;

    if (!clientId || !clientSecret || !tokenUrl || !redirectUri) {
      return NextResponse.json({ error: 'Server missing SSO configuration' }, { status: 500 });
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
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    }

    return NextResponse.json({
      access_token,
      userInfo,
    });
  } catch (error: any) {
    console.error('SSO Exchange error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}