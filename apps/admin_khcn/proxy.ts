import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8080/api/v1/admin';

export async function proxy(request: NextRequest) {
    // Theo cấu hình dal.ts, cookie được lưu tên là 'session'
    const token = request.cookies.get("session")?.value || request.cookies.get("accessToken")?.value;
    const { pathname } = request.nextUrl;

    // ✅ Public routes
    const publicPaths = [
        "/login",
        "/api/admin/auth",
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

    // 🔒 Chú ý: Đã chuyển logic kiểm tra quyền (RBAC) bằng API ra khỏi Edge Middleware
    // để tránh tình trạng block request gây chậm/giật trang. Việc bảo mật
    // hiện được giao cho Backend API tự động từ chối (403) và layout kiểm tra.

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
