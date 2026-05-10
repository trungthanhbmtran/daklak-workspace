import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Mapping for slug translation
const LANG_MAPPING: Record<string, { vi: string; en: string }> = {
  "gioi-thieu": { vi: "gioi-thieu", en: "aboutus" },
  "aboutus": { vi: "gioi-thieu", en: "aboutus" },
  "lien-he": { vi: "lien-he", en: "contact" },
  "contact": { vi: "lien-he", en: "contact" },
  "thu-tuc": { vi: "thu-tuc", en: "procedures" },
  "procedures": { vi: "thu-tuc", en: "procedures" },
  "tin-tuc": { vi: "tin-tuc", en: "news" },
  "news": { vi: "tin-tuc", en: "news" },
  "tuong-tac": { vi: "tuong-tac", en: "feedback" },
  "feedback": { vi: "tuong-tac", en: "feedback" },
  "van-ban": { vi: "van-ban", en: "documents" },
  "documents": { vi: "van-ban", en: "documents" },
}

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

  // 2. Extract path segments and check for slug mapping
  const segments = pathname.split("/").filter(Boolean)
  let shouldRedirect = false
  let targetPath = pathname

  if (segments.length > 0) {
    const currentSlug = segments[0]
    const mapping = LANG_MAPPING[currentSlug]

    if (mapping) {
      const targetSlug = lang === "en" ? mapping.en : mapping.vi
      if (targetSlug !== currentSlug) {
        segments[0] = targetSlug
        targetPath = "/" + segments.join("/")
        shouldRedirect = true
      }
    }
  }

  // 3. Perform Redirection or Proceed with Response
  if (shouldRedirect) {
    const redirectUrl = new URL(targetPath, request.url)
    
    // Preserve other search parameters, but optionally remove ?lang to keep URLs clean
    searchParams.forEach((value, key) => {
      if (key !== "lang") {
        redirectUrl.searchParams.set(key, value)
      }
    })

    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("lang", lang, { path: "/", maxAge: 31536000, sameSite: "lax" })
    return response
  }

  // If not redirecting, proceed to next handler but ensure the language cookie is set correctly
  const response = NextResponse.next()
  const existingCookie = request.cookies.get("lang")?.value

  // Set cookie if it is missing or different
  if (existingCookie !== lang || queryLang) {
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
