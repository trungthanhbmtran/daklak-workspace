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

    let targetUrl: URL;
    try {
      targetUrl = new URL(authUrl);
      if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        throw new Error('URL phải bắt đầu bằng http:// hoặc https://');
      }
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: `URL không hợp lệ: ${err.message}` },
        { status: 400 }
      );
    }

    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      },
      body: params,
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
    let errorMessage = error.message;
    if (error.cause) {
      errorMessage += ` (Nguyên nhân: ${error.cause.message || JSON.stringify(error.cause)})`;
    }
    return NextResponse.json(
      { success: false, message: `Lỗi kết nối từ server: ${errorMessage}` },
      { status: 500 }
    );
  }
}
