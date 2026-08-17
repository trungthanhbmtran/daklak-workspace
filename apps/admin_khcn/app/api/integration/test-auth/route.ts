import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authUrl, clientId, clientSecret, scope } = body;

    if (!authUrl || !clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc (authUrl, clientId, clientSecret)' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    if (scope) {
      params.append('scope', scope);
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      },
      body: params,
      // Đặt timeout hoặc các cấu hình khác nếu cần thiết (mặc định fetch trong Node.js không có timeout)
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = responseText;
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: `HTTP ${response.status}: Lỗi từ máy chủ xác thực.`, 
          details: data 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    console.error('Test Auth Proxy Error:', error);
    return NextResponse.json(
      { success: false, message: `Lỗi kết nối từ server: ${error.message}` },
      { status: 500 }
    );
  }
}
