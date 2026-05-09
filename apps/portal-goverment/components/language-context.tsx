"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import apiClient from "@/lib/axiosInstance"

export type Language = string

// Lightweight wrapper to maintain compatibility with existing layouts
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Lightweight custom hook that derives language directly from URL / routing state
export function useLanguage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [languages, setLanguages] = React.useState<Array<{ code: string; name: string }>>([
    { code: "vi", name: "Tiếng Việt" },
    { code: "en", name: "English" }
  ])

  React.useEffect(() => {
    const fetchSystemLanguages = async () => {
      try {
        const response: any = await apiClient.get("/public/categories?group=LANGUAGE")
        const list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
        const activeLangs = list
          .filter((item: any) => item.active !== 0 && item.isActive !== false)
          .map((item: any) => ({
            code: item.code,
            name: item.name
          }))
        if (activeLangs.length > 0) {
          setLanguages(activeLangs)
        }
      } catch (error) {
        console.error("Failed to fetch system languages", error)
      }
    }
    fetchSystemLanguages()
  }, [])

  // Derive language purely from pathname or query param
  const isEn = pathname?.startsWith("/aboutus") ||
    pathname?.startsWith("/news") ||
    pathname?.startsWith("/documents") ||
    pathname?.startsWith("/procedures") ||
    pathname?.startsWith("/feedback") ||
    pathname?.startsWith("/contact") ||
    searchParams?.get("lang") === "en"
  const language = isEn ? "en" : "vi"

  const setLanguage = (lang: string) => {
    let targetPath = pathname
    if (lang === "en") {
      if (pathname === "/gioi-thieu") targetPath = "/aboutus"
      else if (pathname === "/tin-tuc") targetPath = "/news"
      else if (pathname === "/van-ban") targetPath = "/documents"
      else if (pathname === "/thu-tuc") targetPath = "/procedures"
      else if (pathname === "/tuong-tac") targetPath = "/feedback"
      else if (pathname === "/lien-he") targetPath = "/contact"
    } else {
      if (pathname === "/aboutus") targetPath = "/gioi-thieu"
      else if (pathname === "/news") targetPath = "/tin-tuc"
      else if (pathname === "/documents") targetPath = "/van-ban"
      else if (pathname === "/procedures") targetPath = "/thu-tuc"
      else if (pathname === "/feedback") targetPath = "/tuong-tac"
      else if (pathname === "/contact") targetPath = "/lien-he"
    }

    if (targetPath !== pathname) {
      router.push(targetPath)
    } else {
      const params = new URLSearchParams(searchParams?.toString() || "")
      if (lang === "vi") {
        params.delete("lang")
      } else {
        params.set("lang", lang)
      }
      const qs = params.toString()
      router.push(qs ? `?${qs}` : pathname)
    }
  }

  // Pure identity function as translation is fully handled on the backend
  const t = React.useCallback((key: string): string => {
    return key || ""
  }, [])

  return { language, setLanguage, t, languages }
}
