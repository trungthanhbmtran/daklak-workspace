import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || '';

// ⚡ Verify JWT tại Edge — không gọi API, không tốn network
async function verifyJWT(token: string): Promise<{ valid: boolean; userId?: string }> {
  if (!JWT_SECRET || !token) return { valid: false };
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, userId: payload.sub };
  } catch {
    return { valid: false };
  }
}

export async function proxy(request: NextRequest) {
  const token =
    request.cookies.get('session')?.value ||
    request.cookies.get('accessToken')?.value;

  const { pathname } = request.nextUrl;

  // ✅ Public routes — không cần auth
  const publicPaths = ['/login', '/api/admin/auth', '/api/'];
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (isPublic) {
    // Đã login mà cố vào login → redirect hub
    if (token && pathname === '/login') {
      const { valid } = await verifyJWT(token);
      if (valid) {
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
        const target = request.nextUrl.clone();
        target.pathname = callbackUrl || '/hub';
        target.searchParams.delete('callbackUrl');
        return NextResponse.redirect(target);
      }
    }
    return NextResponse.next();
  }

  // ❌ Chưa có token → redirect login ngay tại Edge
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ⚡ Verify JWT signature + expiry — không gọi API
  const { valid, userId } = await verifyJWT(token);

  if (!valid) {
    // Token hỏng/hết hạn → xóa cookie và redirect login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    response.cookies.delete('accessToken');
    return response;
  }

  // ✅ Token hợp lệ — forward userId qua header để Server Components dùng
  const requestHeaders = new Headers(request.headers);
  if (userId) requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Bỏ qua static files, images, favicon
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
