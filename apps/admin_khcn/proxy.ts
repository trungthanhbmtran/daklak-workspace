import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
    const token = request.cookies.get("access_token");
    const { pathname } = request.nextUrl;

    // ✅ Các route KHÔNG cần login (whitelist)
    const publicPaths = [
        "/login",
        "/api/auth",   // login / refresh
    ];

    const isPublic = publicPaths.some((path) =>
        pathname.startsWith(path)
    );

    // ❌ Chưa login → redirect về login (bắt tất cả route)
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // ✅ Đã login mà vào login → đẩy về dashboard (optional)
    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}