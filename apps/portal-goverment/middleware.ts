import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  // 1. Prioritize explicit URL language parameter (e.g., ?lang=en when clicking flag)
  let lang = searchParams.get("lang")

  // 2. If not specified in URL, look up the "lang" cookie (remembers user preference)
  if (!lang) {
    lang = request.cookies.get("lang")?.value || null
  }

  // 3. First-time visit (no URL param, no cookie): prioritize user's browser/system language (ngôn ngữ máy)
  if (!lang) {
    const acceptLanguage = request.headers.get("accept-language") || ""
    // Detect if English is preferred in the browser system settings
    const isEnSystem = acceptLanguage.toLowerCase().startsWith("en") ||
      (acceptLanguage.toLowerCase().includes("en") && !acceptLanguage.toLowerCase().startsWith("vi"))
    lang = isEnSystem ? "en" : "vi"
  }

  // Force language code fallback safety
  if (lang !== "en" && lang !== "vi") {
    lang = "vi"
  }

  // Clone request headers to inject the resolved language parameters so backend & components receive it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("Accept-Language", lang)
  requestHeaders.set("x-lang", lang)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set or refresh the lang cookie so subsequent requests (and Axios API requests) know the active language
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
