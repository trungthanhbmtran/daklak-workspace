import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const token = request.cookies.get("accessToken")?.value;
    const { pathname } = request.nextUrl;

    // ✅ Public routes
    const publicPaths = [
        "/login",
        "/api/admin/auth", // ✔ sửa lại theo chuẩn mới (đã thêm admin)
    ];

    const isPublic = publicPaths.some((path) =>
        pathname === path || pathname.startsWith(path + "/")
    );

    // ❌ Chưa login → redirect login
    if (!token && !isPublic) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ Đã login mà vào login → đẩy về hub
    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL("/admin/hub", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};