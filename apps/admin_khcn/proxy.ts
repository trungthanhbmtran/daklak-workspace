import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Proxy (Next.js Middleware)
 *
 * Nhiệm vụ DUY NHẤT tại Edge: kiểm tra cookie có tồn tại → cho qua / redirect login.
 *
 * Không verify JWT signature ở đây vì:
 * 1. JWT_SECRET không available tại build time trong Docker → verifyJWT luôn fail
 * 2. Không cần thiết — Server Component requireMenuAccess() đã verify đầy đủ
 * 3. Edge chỉ nên làm việc O(1), không I/O, không crypto nặng
 *
 * Mô hình phòng thủ đúng:
 *   Edge: có cookie? → next() | redirect login
 *   Server Layout: requireMenuAccess() → verify JWT + RBAC qua backend (cache 5 phút)
 *   Backend API: always enforce 403
 */
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
        // Đã có token mà cố vào /login → redirect về hub
        if (token && pathname === '/login') {
            const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
            const target = request.nextUrl.clone();
            target.pathname = callbackUrl || '/hub';
            target.searchParams.delete('callbackUrl');
            return NextResponse.redirect(target);
        }
        return NextResponse.next();
    }

    // ❌ Không có token → redirect login ngay tại Edge (nhanh, không cần verify)
    if (!token) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ Có token → forward pathname để Server Components dùng, JWT verify ở server
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);

    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: [
        // Bỏ qua static files, images, favicon
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
