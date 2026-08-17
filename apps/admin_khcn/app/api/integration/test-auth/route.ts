import { NextRequest, NextResponse } from 'next/server';
// undici là HTTP client mà Next.js sử dụng nội bộ, không cần cài thêm
import { Agent, fetch as undiciFetch } from 'undici';

interface TestAuthBody {
  authUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
}

function parseUrl(raw: string): URL {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('URL phải bắt đầu bằng http:// hoặc https://');
  }
  return url;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'Lỗi không xác định';
  const cause = (error as NodeJS.ErrnoException).cause as Error | undefined;
  return cause?.message ? `${error.message} (Nguyên nhân: ${cause.message})` : error.message;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: TestAuthBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Request body không hợp lệ (phải là JSON)' },
      { status: 400 },
    );
  }

  const { authUrl, clientId, clientSecret, scope } = body;

  if (!authUrl?.trim() || !clientId?.trim() || !clientSecret?.trim()) {
    return NextResponse.json(
      { success: false, message: 'Thiếu thông tin bắt buộc: authUrl, clientId, clientSecret' },
      { status: 400 },
    );
  }

  let targetUrl: URL;
  try {
    targetUrl = parseUrl(authUrl.trim());
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `URL không hợp lệ: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ grant_type: 'client_credentials' });
  if (scope?.trim()) params.set('scope', scope.trim());

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  let upstream: Response;
  try {
    // Dùng undici với rejectUnauthorized: false để hỗ trợ server dùng
    // chứng chỉ tự ký (self-signed) hoặc CA nội bộ
    const agent = new Agent({ connect: { rejectUnauthorized: false } });
    upstream = await undiciFetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
      },
      body: params.toString(),
      dispatcher: agent,
    }) as unknown as Response;
  } catch (err) {
    console.error('[test-auth] fetch error:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi kết nối đến máy chủ xác thực: ${buildErrorMessage(err)}` },
      { status: 502 },
    );
  }

  const responseText = await upstream.text();
  const data = parseJson(responseText);

  if (!upstream.ok) {
    return NextResponse.json(
      {
        success: false,
        message: `HTTP ${upstream.status} từ máy chủ xác thực`,
        details: data,
      },
      { status: upstream.status },
    );
  }

  return NextResponse.json({ success: true, data });
}
