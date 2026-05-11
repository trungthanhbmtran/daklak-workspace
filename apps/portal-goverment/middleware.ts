import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Define supported locales
  const locales = ["vi", "en"]

  // Check if pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Redirect if pathname does not have locale prefix
  let targetLang = "vi"

  // Check if the path belongs to known English pages
  const enSlugs = ["aboutus", "news", "documents", "procedures", "feedback", "contact"]
  const pathFirstSegment = pathname.split("/").filter(Boolean)[0] || ""

  if (enSlugs.includes(pathFirstSegment.toLowerCase())) {
    targetLang = "en"
  }

  // Construct target redirect URL
  const redirectUrl = new URL(`/${targetLang}${pathname}`, request.url)
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value)
  })

  return NextResponse.redirect(redirectUrl)
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
