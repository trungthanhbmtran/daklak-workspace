import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
    const token = request.cookies.get("accessToken")?.value;
    const { pathname } = request.nextUrl;

    // ✅ Các route công khai không cần login
    // Lưu ý: pathname trong middleware của Next.js (khi có basePath) 
    // thường đã được xử lý để không bao gồm basePath trong so khớp, 
    // hoặc ta có thể kiểm tra trực tiếp.
    const publicPaths = [
        "/login",
        "/api/auth", // Cho phép các route login/refresh của gateway
    ];

    const isPublic = publicPaths.some((path) =>
        pathname === path || pathname.startsWith(path + "/")
    );

    // ❌ Trường hợp chưa đăng nhập: 
    // Redirect về trang login nếu đang truy cập các route bảo mật
    if (!token && !isPublic) {
        const loginUrl = new URL("/admin/login", request.url);
        // Nếu muốn quay lại trang cũ sau khi login, có thể thêm callbackUrl
        // loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ Trường hợp đã đăng nhập mà cố vào trang login:
    // Đẩy về hub (trang chính của admin)
    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL("/admin/hub", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}