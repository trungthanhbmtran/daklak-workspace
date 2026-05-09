import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  // Determine active language from URL pathname or search parameters
  const isEn = pathname.startsWith("/aboutus") ||
               pathname.startsWith("/news") ||
               pathname.startsWith("/documents") ||
               pathname.startsWith("/procedures") ||
               pathname.startsWith("/feedback") ||
               pathname.startsWith("/contact") ||
               searchParams.get("lang") === "en"
  const lang = isEn ? "en" : "vi"

  const response = NextResponse.next()

  // Set the lang cookie so both client, server and backend API can read it easily
  response.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - banner_scenery.png or other static images
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
}
