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
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ Đã login mà vào login → đẩy về trang hub (hoặc callbackUrl)
    if (token && pathname === "/login") {
        const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
        const targetUrl = request.nextUrl.clone();
        targetUrl.pathname = callbackUrl || "/hub";
        targetUrl.searchParams.delete("callbackUrl");
        return NextResponse.redirect(targetUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};