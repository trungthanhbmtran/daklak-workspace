import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api-gateway:8080/api/v1/admin';

export async function proxy(request: NextRequest) {
    // Theo cấu hình dal.ts, cookie được lưu tên là 'session'
    const token = request.cookies.get("session")?.value;
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

    // 🔒 Chặn quyền truy cập Admin UI (dựa trên API phân quyền Backend)
    if (token && pathname.startsWith('/services/admin')) {
      try {
        const res = await fetch(`${INTERNAL_API_URL}/menus/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: 'no-store' // Không dùng cache ở Edge middleware
        });
  
        if (!res.ok) {
          // Token hỏng hoặc bị chặn
          return NextResponse.redirect(new URL('/login', request.url));
        }
  
        const json = await res.json();
        const menus = json?.data || [];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractPaths = (items: any[]): string[] => {
          const paths: string[] = [];
          for (const item of items) {
            if (item.path) paths.push(item.path);
            if (item.children && Array.isArray(item.children)) {
              paths.push(...extractPaths(item.children));
            }
          }
          return paths;
        };
        
        const allowedPaths = extractPaths(menus);
        // Kiểm tra xem user có path menu này không
        const hasAccess = allowedPaths.some(p => p && p.length > 1 && pathname.startsWith(p));
        
        if (!hasAccess) {
          // Bắt buộc Rewrite (đánh lạc hướng) về Not Found nếu không có quyền!
          request.nextUrl.pathname = '/not-found';
          return NextResponse.rewrite(request.nextUrl);
        }
      } catch (error) {
        console.error('Middleware check auth error:', error);
      }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
