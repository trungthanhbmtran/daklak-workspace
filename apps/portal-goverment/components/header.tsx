"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-context"
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

interface MenuItem {
  name: string
  path: string
  children?: {
    name: string
    path: string
  }[]
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateTimeStr, setDateTimeStr] = React.useState("")

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

    // Setup time updater
    const updateDateTime = () => {
      const now = new Date()
      const daysVi = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
      const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const dayName = language === "vi" ? daysVi[now.getDay()] : daysEn[now.getDay()]
      const date = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      if (language === "vi") {
        setDateTimeStr(`${dayName}, ${date}/${month}/${year} - ${hours}:${minutes}:${seconds}`)
      } else {
        setDateTimeStr(`${dayName}, ${month}/${date}/${year} - ${hours}:${minutes}:${seconds}`)
      }
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [language])

  const menuItems: MenuItem[] = React.useMemo(() => {
    if (!menusData?.data || menusData.data.length === 0) {
      return [
        { name: t("Trang chủ"), path: "/" },
        {
          name: t("Giới thiệu"),
          path: language === "vi" ? "/gioi-thieu" : "/aboutus",
          children: [
            { name: language === "vi" ? "Giới thiệu chung" : "Overview & History", path: language === "vi" ? "/gioi-thieu#chung" : "/aboutus#chung" },
            { name: language === "vi" ? "Cơ cấu tổ chức" : "Organizational Structure", path: language === "vi" ? "/gioi-thieu#co-cau" : "/aboutus#co-cau" },
            { name: language === "vi" ? "Thông tin lãnh đạo" : "Key Leadership Contacts", path: language === "vi" ? "/gioi-thieu#lanh-dao" : "/aboutus#lanh-dao" }
          ]
        },
        {
          name: t("Tin tức"),
          path: language === "vi" ? "/tin-tuc" : "/news",
          children: [
            { name: language === "vi" ? "Tin hoạt động Đảng Ủy" : "Party Committee News", path: language === "vi" ? "/tin-tuc?category=dang-uy" : "/news?category=dang-uy" },
            { name: language === "vi" ? "Tin Hội đồng nhân dân" : "People's Council News", path: language === "vi" ? "/tin-tuc?category=hdnd" : "/news?category=hdnd" },
            { name: language === "vi" ? "Tin Ủy ban nhân dân" : "People's Committee News", path: language === "vi" ? "/tin-tuc?category=ubnd" : "/news?category=ubnd" },
            { name: language === "vi" ? "Kinh tế - Xã hội" : "Economy & Society", path: language === "vi" ? "/tin-tuc?category=kinh-te" : "/news?category=kinh-te" }
          ]
        },
        { name: t("Văn bản"), path: language === "vi" ? "/van-ban" : "/documents" },
        { name: t("Thủ tục hành chính"), path: language === "vi" ? "/thu-tuc" : "/procedures" },
        { name: t("Hỏi đáp & Góp ý"), path: language === "vi" ? "/tuong-tac" : "/feedback" },
        { name: t("Liên hệ"), path: language === "vi" ? "/lien-he" : "/contact" }
      ]
    }

    const allMenus = menusData.data
    // Filter HORIZONTAL position
    const horizontalMenus = allMenus.filter(
      (m: any) => m.position?.toUpperCase() === "HORIZONTAL" && m.isActive !== false
    )

    // Sort by order ascending
    horizontalMenus.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    // Find root menus (where parentId is null/empty or parent not in horizontal items)
    const roots = horizontalMenus.filter(
      (m: any) => !m.parentId || !horizontalMenus.some((p: any) => p.id === m.parentId)
    )

    return roots.map((root: any) => {
      const children = horizontalMenus.filter((m: any) => m.parentId === root.id)
      return {
        name: root.name,
        path: root.link || "/",
        children: children.length > 0
          ? children.map((c: any) => ({ name: c.name, path: c.link || "/" }))
          : undefined
      }
    })
  }, [menusData, language, t])

  const topBanner = React.useMemo(() => {
    if (!bannersData?.data || bannersData.data.length === 0) {
      return null
    }
    const topBanners = bannersData.data.filter(
      (b: any) => b.position?.toLowerCase() === "top" && b.status !== false
    )
    topBanners.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
    return topBanners[0] || null
  }, [bannersData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tin-tuc?search=${encodeURIComponent(searchQuery.trim())}`)
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

        {/* Centered container wrapping utility bar elements */}
        <div className="max-w-7xl mx-auto w-full px-4 py-2 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              {dateTimeStr || "Thứ Tư, 06/05/2026"} | Đắk Lắk 20°-23° 🌦️
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center font-semibold">
            <a href="mailto:xadangkang@daklak.gov.vn" className="hover:text-[#cc0000] transition-colors">
              xadangkang@daklak.gov.vn
            </a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-2">
              {/* Vietnam Flag SVG */}
              <svg
                onClick={() => setLanguage("vi")}
                viewBox="0 0 30 20"
                className={`w-5 h-3.5 inline-block rounded-sm shadow-sm border cursor-pointer transition-all hover:scale-110 ${language === "vi"
                    ? "border-amber-400 ring-1 ring-amber-400 scale-105"
                    : "border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100"
                  }`}
              >
                <title>Tiếng Việt</title>
                <rect width="30" height="20" fill="#da251d" />
                <polygon points="15,4 15.8,7.6 19.5,7.6 16.3,9.8 17.2,13.4 15,11.2 12.8,13.4 13.7,9.8 10.5,7.6 14.2,7.6" fill="#ffff00" />
              </svg>
              {/* UK Flag SVG */}
              <svg
                onClick={() => setLanguage("en")}
                viewBox="0 0 60 30"
                className={`w-5 h-3.5 inline-block rounded-sm shadow-sm border cursor-pointer transition-all hover:scale-110 ${language === "en"
                    ? "border-amber-400 ring-1 ring-amber-400 scale-105"
                    : "border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100"
                  }`}
              >
                <title>English</title>
                <clipPath id="s_flag"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
                <g clipPath="url(#s_flag)">
                  <rect width="60" height="30" fill="#012169" />
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                  <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4" />
                  <path d="M0,15 H60 M30,0 V30" stroke="#fff" strokeWidth="10" />
                  <path d="M0,15 H60 M30,0 V30" stroke="#c8102e" strokeWidth="6" />
                </g>
              </svg>
            </div>
            {mounted && (
              <>
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

        {/* Repeating Dong Son Bronze Drum watermark background pattern (infinite SVG) */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none select-none z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="drumPattern" width="120" height="120" patternUnits="userSpaceOnUse">
                <g stroke="#cc0000" strokeWidth="0.5" fill="none">
                  {/* Traditional Bronze Drum Motif */}
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

        {/* Centered Container aligning exactly with the menu container below */}
        <div className="max-w-7xl mx-auto w-full px-4 relative flex items-center justify-between min-h-[96px] md:min-h-[115px] py-3.5 z-10">

          {/* Left Side: National Emblem + Logo Text */}
          <div className="flex items-center gap-3.5 sm:gap-4 text-left z-10 select-none max-w-[85%] md:max-w-[55%]">
            <div className="bg-white p-1 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-sm shrink-0">
              <NationalEmblem className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 animate-fade-in" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0056b3] dark:text-blue-400 text-[10px] sm:text-xs md:text-sm font-serif font-black tracking-widest uppercase leading-none">
                {t("TRANG THÔNG TIN ĐIỆN TỬ")}
              </span>
              <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-serif font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide leading-tight my-0.5 sm:my-1">
                {t("UBND XÃ DANG KANG")}
              </h1>
              <span className="text-blue-800 dark:text-blue-400/80 text-[8px] sm:text-[10px] md:text-xs font-serif font-bold tracking-wider leading-none uppercase">
                {t("TỈNH ĐĂK LĂK")}
              </span>
            </div>
          </div>

          {/* Right Side: Seamless Blended Panoramic Scenery Banner aligned to container right edge */}
          <div className="absolute right-4 top-0 bottom-0 h-full w-[45%] lg:w-[50%] hidden md:block select-none z-0">
            {/* Beautiful fading overlay gradient that seamlessly merges the banner scenery into the left parchment color */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fdfbf7] to-transparent dark:from-slate-900 z-10" />
            {topBanner ? (
              <a href={topBanner.customUrl || "#"} target={topBanner.target || "_self"}>
                <img
                  src={resolveMediaUrl(topBanner.imageUrl)}
                  alt={topBanner.name}
                  className="w-full h-full object-cover object-right"
                />
              </a>
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

              if (item.name === "Trang chủ") {
                return (
                  <div key={item.name} className="relative flex items-center justify-center h-12 px-3.5 hover:bg-[#a80000] dark:hover:bg-red-900 transition-colors">
                    <Link href="/" className={`text-white transition-colors ${isActive ? "text-[#fef08a]" : ""}`} title="Trang chủ">
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

          {/* Right Action Icons (Search & User Profile) */}
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => router.push("/tin-tuc")}
              className="p-1 hover:text-[#fef08a] transition-colors"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/tuong-tac")}
              className="p-1 hover:text-[#fef08a] transition-colors"
              title="Cổng tương tác"
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
            UBND XÃ DANG KANG
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-md hover:bg-[#a80000] dark:hover:bg-slate-900 transition-colors text-white"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-100" />
              )}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md bg-[#a80000] border border-[#880000] text-white hover:bg-[#880000] dark:bg-red-900 dark:border-red-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          {/* Mobile Drawer Content */}
          <div
            className="absolute top-0 right-0 w-[280px] h-full bg-[#cc0000] dark:bg-slate-950 border-l border-[#a80000] dark:border-slate-800 shadow-2xl p-5 flex flex-col gap-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <span className="text-sm font-bold text-[#fef08a] uppercase tracking-wider">
                DANH MỤC TRANG
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-[#a80000] border border-[#880000] hover:bg-[#880000] dark:bg-slate-900 dark:border-slate-800 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#a80000] dark:bg-slate-900 border border-[#880000] dark:border-slate-800 rounded-lg py-2 pl-3 pr-9 text-xs text-white placeholder-white/70 focus:outline-none focus:border-white"
              />
              <button type="submit" className="absolute right-2.5 top-2.5 text-white/75">
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
                          className={`flex items-center justify-between text-left text-sm uppercase tracking-wide py-1 border-b border-white/10 hover:text-[#fef08a] ${isActive ? "text-[#fef08a] font-bold" : "text-white/80"
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
                Hotline trực ban: 0262.3812.345
              </span>
              <span className="text-[10px] text-white/70 font-mono block mt-1">
                © 2026 UBND XÃ DANG KANG
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
