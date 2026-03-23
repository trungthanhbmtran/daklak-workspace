// proxy.ts (đặt ở thư mục gốc)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // TRÁNH VÒNG LẶP: Nếu đang ở trang login thì không check auth nữa
  // Lưu ý: path ở đây là pathname sau domain, không bao gồm basePath
  if (path === '/login') {
    return NextResponse.next()
  }

  // Kiểm tra nếu request đi vào bất kỳ route nào bắt đầu bằng /admin
  const isAdminRoute = path.startsWith('/admin')

  if (isAdminRoute) {
    const accessToken = request.cookies.get('accessToken')?.value
    const refreshToken = request.cookies.get('refreshToken')?.value

    // 1. Nếu không có bất kỳ token nào -> Khóa cổng, đẩy về login ngay lập tức
    // Cần redirect về /admin/login (do basePath là /admin)
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // 2. Nếu chỉ còn Refresh Token (Access Token đã hết hạn) -> Xử lý cấp lại token
    if (!accessToken && refreshToken) {
      try {
        const API_URL = process.env.API_URL || 'http://api-gateway:8080/api/v1/admin'
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (!res.ok) throw new Error('Refresh failed')

        const data = await res.json()

        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-new-access-token', data.accessToken)

        const response = NextResponse.next({
          request: { headers: requestHeaders },
        })

        response.cookies.set('accessToken', data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60,
          path: '/',
        })

        return response
      } catch (error) {
        // Cấp lại token thất bại -> Buộc đăng nhập lại
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')
        return response
      }
    }
  }

  // Cho phép đi tiếp đối với các route không phải /admin (như /login, trang chủ công khai...)
  return NextResponse.next()
}

export const config = {
  // Config matcher để proxy chỉ chạy trên các request cần thiết, tối ưu hiệu năng
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
