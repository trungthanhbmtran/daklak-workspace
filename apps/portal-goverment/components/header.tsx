"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { resolveMediaUrl } from "@/lib/utils"
import {
  Phone,
  Mail,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Clock,
  Calendar,
  Globe,
  Home,
  User
} from "lucide-react"

// Pure SVG high-fidelity representation of the Vietnam National Emblem
function NationalEmblem({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Golden Border */}
      <circle cx="50" cy="50" r="48" fill="#D32F2F" stroke="#FBC02D" strokeWidth="2" />
      <circle cx="50" cy="50" r="44" stroke="#FBC02D" strokeWidth="1" strokeDasharray="2 2" />

      {/* Star in the center */}
      <path
        d="M50 20 L58 38 L78 38 L62 50 L68 68 L50 56 L32 68 L38 50 L22 38 L42 38 Z"
        fill="#FBC02D"
        stroke="#F57F17"
        strokeWidth="0.5"
      />

      {/* Golden Rice Ears (stylized arches) */}
      <path
        d="M20 65 C15 45 30 25 42 22 M80 65 C85 45 70 25 58 22"
        stroke="#FBC02D"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M23 68 C18 50 32 30 43 27 M77 68 C82 50 68 30 57 27"
        stroke="#FBC02D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Golden Cogwheel at the bottom */}
      <circle cx="50" cy="78" r="10" fill="#FBC02D" />
      <circle cx="50" cy="78" r="6" fill="#D32F2F" />
      <path d="M50 66 L50 90 M38 78 L62 78 M41 69 L59 87 M41 87 L59 69" stroke="#D32F2F" strokeWidth="2" />

      {/* Red ribbon band */}
      <path
        d="M25 76 C35 84 65 84 75 76"
        stroke="#FBC02D"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M25 76 C35 84 65 84 75 76"
        stroke="#D32F2F"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Text banner background strip */}
      <rect x="35" y="80" width="30" height="6" rx="2" fill="#FBC02D" />
      <text x="50" y="85" fontSize="4.5" fontWeight="bold" fill="#D32F2F" textAnchor="middle">
        VIỆT NAM
      </text>
    </svg>
  )
}

// Custom crisp SVG flags for high-fidelity cross-platform rendering (no emoji dependency)
function VietnamFlagSVG({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 3 2"
      className={`${className} shadow-sm border border-slate-200/40 dark:border-slate-800/80 rounded-[2px] object-cover`}
    >
      <rect width="3" height="2" fill="#DA251D" />
      <g transform="translate(1.5, 1) scale(0.6)">
        <polygon
          points="0,-1 0.225,-0.309 0.951,-0.309 0.363,0.118 0.588,0.809 0,0.382 -0.588,0.809 -0.363,0.118 -0.951,-0.309 -0.225,-0.309"
          fill="#FFFF00"
        />
      </g>
    </svg>
  )
}

function UKFlagSVG({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={`${className} shadow-sm border border-slate-200/40 dark:border-slate-800/80 rounded-[2px] object-cover`}
    >
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30" stroke="#c8102e" strokeWidth="2" />
      <path d="M60,0 L0,30" stroke="#c8102e" strokeWidth="2" />
      <path d="M30,0 L30,30 M0,15 L60,15" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 L30,30 M0,15 L60,15" stroke="#c8102e" strokeWidth="6" />
    </svg>
  )
}

interface MenuItem {
  name: string
  path: string
  children?: {
    name: string
    path: string
  }[]
}

// 1. Helper to parse cookies on the client
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[2]) : null
}

// 2. Static layout translation dictionary
const translations = {
  vi: {
    hotline: "Đường dây nóng",
    searchPlaceholder: "Tìm kiếm nhanh...",
    sitemapTitle: "DANH MỤC TRANG",
    home: "Trang chủ",
    about: "Giới thiệu",
    news: "Tin tức",
    documents: "Văn bản",
    procedures: "Thủ tục hành chính",
    feedback: "Hỏi đáp & Góp ý",
    contact: "Liên hệ",
    days: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
    selectLanguage: "Chọn ngôn ngữ",
  },
  en: {
    hotline: "Hotline",
    searchPlaceholder: "Quick search...",
    sitemapTitle: "SITEMAP",
    home: "Home",
    about: "About Us",
    news: "News",
    documents: "Documents",
    procedures: "Procedures",
    feedback: "Q&A & Feedback",
    contact: "Contact",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    selectLanguage: "Select language",
  }
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateTimeStr, setDateTimeStr] = React.useState("")
  const [langOpen, setLangOpen] = React.useState(false)

  // 3. Resolve the active language client-side
  const currentLang = React.useMemo(() => {
    if (!mounted) return "vi"
    const cookieLang = getCookie("lang")
    if (cookieLang === "vi" || cookieLang === "en") return cookieLang
    return "vi"
  }, [mounted])

  const t = translations[currentLang] || translations.vi

  // 5. Fetch dynamic list of system languages from api-gateway (/public/categories?group=LANGUAGE)
  const { data: languagesData } = useQuery({
    queryKey: ["public-categories", "LANGUAGE"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/categories?group=LANGUAGE")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        console.error("Failed to fetch languages", e)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: menusData } = useQuery({
    queryKey: ["public-portal-menus"],
    queryFn: async () => {
      const response = await apiClient.get("/public/portal-menus")
      return response
    },
  })

  const { data: bannersData } = useQuery({
    queryKey: ["public-banners"],
    queryFn: async () => {
      const response = await apiClient.get("/public/banners")
      return response
    },
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 6. Localized clock updater
  React.useEffect(() => {
    if (!mounted) return

    const updateDateTime = () => {
      const now = new Date()
      const activeDays = t.days
      const dayName = activeDays[now.getDay()]
      const date = String(now.getDate()).padStart(2, "0")
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, "0")
      const minutes = String(now.getMinutes()).padStart(2, "0")
      const seconds = String(now.getSeconds()).padStart(2, "0")

      if (currentLang === "en") {
        setDateTimeStr(`${dayName}, ${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
      } else {
        setDateTimeStr(`${dayName}, ${date}/${month}/${year} - ${hours}:${minutes}:${seconds}`)
      }
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [mounted, currentLang, t.days])

  // Helper to dynamically resolve CMS Menu links based on standard CMS types
  const resolveMenuLink = React.useCallback((item: any) => {
    if (!item) return "/"
    const type = (item.type || "URL").toUpperCase()
    const refId = item.referenceId
    const directLink = item.link

    if (type === "CATEGORY") {
      const basePath = currentLang === "en" ? "/news" : "/tin-tuc"
      return refId ? `${basePath}?category=${refId}` : (directLink || basePath)
    }

    if (type === "POST") {
      const basePath = currentLang === "en" ? "/news" : "/tin-tuc"
      return refId ? `${basePath}/${refId}` : (directLink || basePath)
    }

    if (type === "STATIC_PAGE") {
      const pageCode = (refId || directLink || "").toLowerCase().replace(/^\//, "")
      const pageMap: Record<string, { vi: string, en: string }> = {
        aboutus: { vi: "/gioi-thieu", en: "/aboutus" },
        "gioi-thieu": { vi: "/gioi-thieu", en: "/aboutus" },
        contact: { vi: "/lien-he", en: "/contact" },
        "lien-he": { vi: "/lien-he", en: "/contact" },
        procedures: { vi: "/thu-tuc", en: "/procedures" },
        "thu-tuc": { vi: "/thu-tuc", en: "/procedures" },
        feedback: { vi: "/tuong-tac", en: "/feedback" },
        "tuong-tac": { vi: "/tuong-tac", en: "/feedback" },
        documents: { vi: "/van-ban", en: "/documents" },
        "van-ban": { vi: "/van-ban", en: "/documents" },
      }
      
      const mapped = pageMap[pageCode]
      if (mapped) {
        return currentLang === "en" ? mapped.en : mapped.vi
      }
      return directLink || "/"
    }

    return directLink || "/"
  }, [currentLang])

  // 7. Memoize and translate menu items
  const menuItems: MenuItem[] = React.useMemo(() => {
    if (!menusData?.data || menusData.data.length === 0) {
      return [
        { name: t.home, path: "/" },
        {
          name: t.about,
          path: "/gioi-thieu",
          children: [
            { name: currentLang === "en" ? "Overview" : "Giới thiệu chung", path: "/gioi-thieu#chung" },
            { name: currentLang === "en" ? "Organizational Structure" : "Cơ cấu tổ chức", path: "/gioi-thieu#co-cau" },
            { name: currentLang === "en" ? "Leadership Info" : "Thông tin lãnh đạo", path: "/gioi-thieu#lanh-dao" }
          ]
        },
        {
          name: t.news,
          path: "/tin-tuc",
          children: [
            { name: currentLang === "en" ? "Party Activity" : "Tin hoạt động Đảng Ủy", path: "/tin-tuc?category=dang-uy" },
            { name: currentLang === "en" ? "People's Council" : "Tin Hội đồng nhân dân", path: "/tin-tuc?category=hdnd" },
            { name: currentLang === "en" ? "People's Committee" : "Tin Ủy ban nhân dân", path: "/tin-tuc?category=ubnd" },
            { name: currentLang === "en" ? "Socio-Economic" : "Kinh tế - Xã hội", path: "/tin-tuc?category=kinh-te" }
          ]
        },
        { name: t.documents, path: "/van-ban" },
        { name: t.procedures, path: "/thu-tuc" },
        { name: t.feedback, path: "/tuong-tac" },
        { name: t.contact, path: "/lien-he" }
      ]
    }

    const allMenus = menusData.data
    const horizontalMenus = allMenus.filter(
      (m: any) => m.position?.toUpperCase() === "HORIZONTAL" && m.isActive !== false
    )

    horizontalMenus.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    const roots = horizontalMenus.filter(
      (m: any) => !m.parentId || !horizontalMenus.some((p: any) => p.id === m.parentId)
    )

    return roots.map((root: any) => {
      const children = horizontalMenus.filter((m: any) => m.parentId === root.id)
      return {
        name: root.name,
        path: resolveMenuLink(root),
        children: children.length > 0
          ? children.map((c: any) => ({ name: c.name, path: resolveMenuLink(c) }))
          : undefined
      }
    })
  }, [menusData, currentLang, t, resolveMenuLink])

  const { data: positionsData } = useQuery({
    queryKey: ["public-categories", "BANNER_POSITION"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/categories?group=BANNER_POSITION")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        console.error("Failed to fetch banner positions configurations", e)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: portalConfigData } = useQuery({
    queryKey: ["public-portal-configs"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/portal-configs")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        console.error("Failed to fetch portal configurations", e)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  // 8. Localize and render unit details configuration values dynamically
  const getConfigValue = React.useCallback((code: string, fallback: string) => {
    const found = (portalConfigData || []).find((c: any) => c.code === code)
    if (!found) return fallback

    if (found.description && found.description.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(found.description)
        if (parsed && typeof parsed === "object") {
          const trans = parsed.translations || parsed
          if (trans[currentLang]) {
            return trans[currentLang]
          }
          if (trans.vi) {
            return trans.vi
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    if (code === "citizen_schedule") {
      return found.description || found.name || fallback
    }

    return found.name || fallback
  }, [portalConfigData, currentLang])

  const topBanners = React.useMemo(() => {
    if (!bannersData?.data || bannersData.data.length === 0) {
      return []
    }
    const filtered = bannersData.data.filter(
      (b: any) => b.position?.toLowerCase() === "top" && b.status !== false
    )
    filtered.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
    return filtered
  }, [bannersData])

  const [topActiveIdx, setTopActiveIdx] = React.useState(0)

  const shouldTopSlide = React.useMemo(() => {
    if (topBanners.length <= 1) return false
    const posCat = (positionsData || []).find((cat: any) => cat.code?.toLowerCase() === "top")
    return posCat?.description === "slideshow"
  }, [topBanners, positionsData])

  React.useEffect(() => {
    if (!shouldTopSlide) return
    const interval = setInterval(() => {
      setTopActiveIdx((prev) => (prev + 1) % topBanners.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [shouldTopSlide, topBanners.length])

  // 9. Process URL mapping on language change
  const handleLanguageChange = (langCode: string) => {
    document.cookie = `lang=${langCode}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const targetSearchPath = "/tin-tuc"
      router.push(`${targetSearchPath}?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(name)
    }
  }

  return (
    <header className="w-full flex flex-col z-50 relative select-none">
      {/* 1. Top Utility Bar */}
      <div className="w-full bg-[#f1f3f5] dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto w-full px-4 py-2 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              {dateTimeStr || (currentLang === "en" ? "Wednesday, 05/06/2026" : "Thứ Tư, 06/05/2026")} | Đắk Lắk 20°-23° 🌦️
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center font-semibold">
            <a href="mailto:xadangkang@daklak.gov.vn" className="hover:text-[#cc0000] transition-colors">
              xadangkang@daklak.gov.vn
            </a>
            {mounted && (
              <>
                {/* PREMIUM INLINE LANG SELECTOR (DESKTOP) */}
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center">
                  <button
                    onClick={() => handleLanguageChange(currentLang === "en" ? "vi" : "en")}
                    className="transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center p-0.5 rounded-[3px] ring-1 ring-slate-200/50 dark:ring-slate-800/50 shadow-sm"
                    title={currentLang === "en" ? "Switch to Tiếng Việt" : "Switch to English"}
                  >
                    {currentLang === "en" ? (
                      <UKFlagSVG className="w-[24px] h-[16px]" />
                    ) : (
                      <VietnamFlagSVG className="w-[24px] h-[16px]" />
                    )}
                  </button>
                </div>

                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-300"
                  title="Đổi giao diện Sáng/Tối"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Admin Portal Banner */}
      <div className="w-full bg-[#fdfbf7] dark:bg-slate-900 border-b-2 border-[#cc0000] dark:border-red-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none select-none z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="drumPattern" width="120" height="120" patternUnits="userSpaceOnUse">
                <g stroke="#cc0000" strokeWidth="0.5" fill="none">
                  <circle cx="60" cy="60" r="54" />
                  <circle cx="60" cy="60" r="48" />
                  <circle cx="60" cy="60" r="40" strokeDasharray="1 1" />
                  <circle cx="60" cy="60" r="32" />
                  <circle cx="60" cy="60" r="24" strokeDasharray="2 1" />
                  <circle cx="60" cy="60" r="14" />
                  <path d="M60 4 L60 116 M4 60 L116 60 M20 20 L100 100 M20 100 L100 20 M38 10 L82 110 M38 110 L82 10 M10 38 L110 82 M10 82 L110 38" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#drumPattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 relative flex items-center justify-between min-h-[96px] md:min-h-[115px] py-3.5 z-10">
          <div className="flex items-center gap-3.5 sm:gap-4 text-left z-10 select-none max-w-[85%] md:max-w-[55%]">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 flex items-center justify-center">
              {getConfigValue("logo_url", "") ? (
                <img src={resolveMediaUrl(getConfigValue("logo_url", ""))} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <NationalEmblem className="w-full h-full animate-fade-in" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[#0056b3] dark:text-blue-400 text-[10px] sm:text-xs md:text-sm font-serif font-black tracking-widest uppercase leading-none">
                {getConfigValue("unit_title", "TRANG THÔNG TIN ĐIỆN TỬ")}
              </span>
              <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-serif font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide leading-tight my-0.5 sm:my-1">
                {getConfigValue("unit_name", "UBND XÃ DANG KANG")}
              </h1>
              <span className="text-blue-800 dark:text-blue-400/80 text-[8px] sm:text-[10px] md:text-xs font-serif font-bold tracking-wider leading-none uppercase">
                {getConfigValue("unit_identifier", "TỈNH ĐẮK LẮK")}
              </span>
            </div>
          </div>

          <div className="absolute right-4 top-0 bottom-0 h-full w-[45%] lg:w-[50%] hidden md:block select-none z-0">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fdfbf7] to-transparent dark:from-slate-900 z-10" />
            {topBanners.length > 0 ? (
              <div className="relative w-full h-full overflow-hidden">
                {shouldTopSlide ? (
                  topBanners.map((banner: any, idx: number) => {
                    const isActive = idx === topActiveIdx
                    return (
                      <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                          }`}
                      >
                        <a href={banner.customUrl || "#"} target={banner.target || "_self"} className="block w-full h-full">
                          <img
                            src={resolveMediaUrl(banner.imageUrl)}
                            alt={banner.name}
                            className="w-full h-full object-cover object-right"
                          />
                        </a>
                      </div>
                    )
                  })
                ) : (
                  <div className="absolute inset-0">
                    <a href={topBanners[0].customUrl || "#"} target={topBanners[0].target || "_self"} className="block w-full h-full">
                      <img
                        src={resolveMediaUrl(topBanners[0].imageUrl)}
                        alt={topBanners[0].name}
                        className="w-full h-full object-cover object-right"
                      />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <img
                src="/banner_scenery.png"
                alt="Cảnh quan nông thôn mới xã Dang Kang"
                className="w-full h-full object-cover object-right"
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Navigation Bar */}
      <nav className="w-full bg-[#cc0000] dark:bg-red-950 border-b border-[#a80000] dark:border-slate-900 text-white font-medium sticky top-0 shadow-md z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="flex items-center gap-0.5 flex-wrap h-full">
            {menuItems.map((item: MenuItem) => {
              const hasChildren = !!item.children
              const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path))

              if (item.name === t.home) {
                return (
                  <div key={item.name} className="relative flex items-center justify-center h-12 px-3.5 hover:bg-[#a80000] dark:hover:bg-red-900 transition-colors">
                    <Link href="/" className={`text-white transition-colors ${isActive ? "text-[#fef08a]" : ""}`} title={t.home}>
                      <Home className="w-4 h-4 fill-current stroke-current" />
                    </Link>
                  </div>
                )
              }

              return (
                <div
                  key={item.name}
                  className="relative group flex items-center h-12 px-3.5 hover:bg-[#a80000] dark:hover:bg-red-900 transition-colors"
                  onMouseEnter={() => hasChildren && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {hasChildren ? (
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center gap-1 text-[13px] font-bold tracking-wide uppercase transition-colors hover:text-[#fef08a] ${isActive ? "text-[#fef08a] font-black" : "text-white/90"
                        }`}
                    >
                      {item.name}
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      className={`text-[13px] font-bold tracking-wide uppercase transition-colors hover:text-[#fef08a] ${isActive ? "text-[#fef08a] font-black" : "text-white/90"
                        }`}
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Desktop Dropdown */}
                  {hasChildren && (
                    <div className="absolute top-full left-0 bg-[#b91c1c] dark:bg-slate-950 border border-[#991313] dark:border-slate-800 rounded-b-lg shadow-xl py-1 min-w-[220px] transition-all transform opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                      {item.children?.map((child: { name: string; path: string }) => (
                        <Link
                          key={child.name}
                          href={child.path}
                          className="block px-4 py-2.5 text-xs text-white/90 hover:text-[#fef08a] hover:bg-[#a81c1c]/50 dark:hover:bg-slate-900/60 transition-colors border-b border-white/5 last:border-0"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => router.push(currentLang === "en" ? "/news" : "/tin-tuc")}
              className="p-1 hover:text-[#fef08a] transition-colors"
              title={currentLang === "en" ? "Search" : "Tìm kiếm"}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push(currentLang === "en" ? "/feedback" : "/tuong-tac")}
              className="p-1 hover:text-[#fef08a] transition-colors"
              title={currentLang === "en" ? "Interactive Portal" : "Cổng tương tác"}
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Button & Drawer */}
      <div className="md:hidden w-full bg-[#cc0000] dark:bg-red-950 border-b border-[#a80000] dark:border-slate-800 text-white py-3.5 px-4 flex items-center justify-between z-40 sticky top-0 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white p-0.5 rounded-full flex items-center justify-center border border-slate-200">
            <NationalEmblem className="w-full h-full" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#fef08a]">
            {getConfigValue("unit_name", "UBND XÃ DANG KANG")}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {mounted && (
            <>

              {/* PREMIUM INLINE MOBILE LANG SELECTOR */}
              <div className="flex items-center">
                <button
                  onClick={() => handleLanguageChange(currentLang === "en" ? "vi" : "en")}
                  className="transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center p-0.5 rounded-[3px] ring-1 ring-white/30 shadow-sm"
                  title={currentLang === "en" ? "Switch to Tiếng Việt" : "Switch to English"}
                >
                  {currentLang === "en" ? (
                    <UKFlagSVG className="w-[22px] h-[15px]" />
                  ) : (
                    <VietnamFlagSVG className="w-[22px] h-[15px]" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-1.5 rounded-md hover:bg-[#a80000] dark:hover:bg-slate-900 transition-colors text-white cursor-pointer"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-100" />
                )}
              </button>
            </>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md bg-[#a80000] border border-[#880000] text-white hover:bg-[#880000] dark:bg-red-900 dark:border-red-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-0 right-0 w-[280px] h-full bg-[#cc0000] dark:bg-slate-950 border-l border-[#a80000] dark:border-slate-800 shadow-2xl p-5 flex flex-col gap-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <span className="text-sm font-bold text-[#fef08a] uppercase tracking-wider">
                {t.sitemapTitle}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-[#a80000] border border-[#880000] hover:bg-[#880000] dark:bg-slate-900 dark:border-slate-800 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#a80000] dark:bg-slate-900 border border-[#880000] dark:border-slate-800 rounded-lg py-2 pl-3 pr-9 text-xs text-white placeholder-white/70 focus:outline-none focus:border-white"
              />
              <button type="submit" className="absolute right-2.5 top-2.5 text-white/75 cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
              {menuItems.map((item: MenuItem) => {
                const hasChildren = !!item.children
                const isDropdownActive = activeDropdown === item.name
                const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path))

                return (
                  <div key={item.name} className="flex flex-col">
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`flex items-center justify-between text-left text-sm uppercase tracking-wide py-1 border-b border-white/10 hover:text-[#fef08a] cursor-pointer ${isActive ? "text-[#fef08a] font-bold" : "text-white/80"
                            }`}
                        >
                          {item.name}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownActive ? "rotate-180" : ""}`} />
                        </button>
                        {isDropdownActive && (
                          <div className="pl-4 mt-2 border-l border-white/25 flex flex-col gap-2 bg-[#a80000]/50 dark:bg-slate-900/40 p-2 rounded-lg">
                            {item.children?.map((child: { name: string; path: string }) => (
                              <Link
                                key={child.name}
                                href={child.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-xs text-white/90 hover:text-[#fef08a] py-1 block"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-sm uppercase tracking-wide py-1 border-b border-white/10 hover:text-[#fef08a] block ${isActive ? "text-[#fef08a] font-bold" : "text-white/80"
                          }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-auto border-t border-white/25 pt-4 text-center">
              <span className="text-[10px] text-white/70 font-mono block">
                {t.hotline}: {getConfigValue("hotline", "0262.3812.345")}
              </span>
              <span className="text-[10px] text-white/70 font-mono block mt-1">
                © 2026 {getConfigValue("unit_name", "UBND XÃ DANG KANG")}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
