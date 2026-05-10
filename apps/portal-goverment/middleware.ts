import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 1. Determine the preferred language
  let lang = "vi" // Default locale

  // Priority 1: Query parameter ?lang=
  const queryLang = searchParams.get("lang")
  if (queryLang === "vi" || queryLang === "en") {
    lang = queryLang
  } else {
    // Priority 2: Cookie 'lang'
    const cookieLang = request.cookies.get("lang")?.value
    if (cookieLang === "vi" || cookieLang === "en") {
      lang = cookieLang
    } else {
      // Priority 3: Accept-Language Header
      const acceptLang = request.headers.get("accept-language") || ""
      if (acceptLang.toLowerCase().includes("en")) {
        lang = "en"
      }
    }
  }

  // 2. Perform Redirection to remove ?lang query param if present, keeping URLs beautiful and clean
  if (queryLang) {
    const redirectUrl = new URL(pathname, request.url)
    searchParams.forEach((value, key) => {
      if (key !== "lang") {
        redirectUrl.searchParams.set(key, value)
      }
    })
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("lang", lang, { path: "/", maxAge: 31536000, sameSite: "lax" })
    return response
  }

  // 3. Set cookie if missing or different, then proceed
  const response = NextResponse.next()
  const existingCookie = request.cookies.get("lang")?.value

  if (existingCookie !== lang) {
    response.cookies.set("lang", lang, { path: "/", maxAge: 31536000, sameSite: "lax" })
  }

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
     * - QuocHuy.png (national emblem image)
     * - public files (having extensions)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|QuocHuy.png|.*\\..*).*)",
  ],
}
