import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { get } from 'lodash';

// Shared HTTPS agent — bỏ qua chứng chỉ tự ký (self-signed / CA nội bộ)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function POST(req: NextRequest) {
  try {
    const { authUrl, clientId, clientSecret, scope, tokenPath } = await req.json();

    if (!authUrl?.trim() || !clientId?.trim() || !clientSecret?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc: authUrl, clientId, clientSecret' },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
    });

    if (scope?.trim()) {
      params.append('scope', scope.trim());
    }

    const startTime = Date.now();

    const tokenRes = await axios.post(authUrl.trim(), params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      timeout: 10_000,
      httpsAgent,
    });

    const time = Date.now() - startTime;

    const extractedToken = get(tokenRes.data, tokenPath || 'access_token');

    return NextResponse.json({
      success: true,
      data: tokenRes.data,
      extractedToken,
      status: tokenRes.status,
      time,
    });
  } catch (error: any) {
    console.error('[test-auth] error:', error.message);

    const status = error.response?.status;
    // Tránh trả 401/403 về client để không trigger global auth interceptor
    const safeStatus = status === 401 || status === 403 ? 400 : (status || 502);

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.error_description ||
          error.response?.data?.message ||
          error.message ||
          'Lỗi kết nối đến máy chủ xác thực',
        status,
        data: error.response?.data,
      },
      { status: safeStatus },
    );
  }
}
