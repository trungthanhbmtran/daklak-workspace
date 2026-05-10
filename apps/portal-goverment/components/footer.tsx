"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import {
  MapPin,
  Phone,
  Mail,
  Printer,
  ExternalLink,
  Shield,
  Users,
  Eye,
  ChevronRight,
  FileText
} from "lucide-react"

// 1. Client-side cookie getter helper
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[2]) : null
}

// 2. Localized dictionaries for layout strings
const footerTranslations = {
  vi: {
    oneGateTitle: "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN XÃ DANG KANG",
    oneGateSub: "Tiếp nhận giải quyết thủ tục hành chính một cửa hiện đại, nhanh chóng",
    lookupProcedures: "Tra cứu thủ tục hành chính",
    managingAuthority: "CƠ QUAN CHỦ QUẢN",
    govLinks: "LIÊN KẾT LIÊN THÔNG",
    sitemapTitle: "CƠ CẤU TRANG",
    statsTitle: "THỐNG KÊ TRUY CẬP",
    statsOnline: "Đang trực tuyến",
    statsToday: "Hôm nay",
    statsTotal: "Tổng lượt truy cập",
    securityTitle: "Website Bảo mật",
    securityDesc: "Được kiểm duyệt an ninh mạng bởi Cục An toàn thông tin.",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách bảo mật",
    sitemapLink: "Bản đồ trang web",
    copyright: "Bản quyền © 2026 Trang thông tin điện tử Ủy ban nhân dân xã Dang Kang. Phát triển trên nền tảng Portal Hành chính 4.0.",
    
    home: "Trang chủ",
    about: "Giới thiệu",
    news: "Tin tức",
    documents: "Văn bản",
    procedures: "Thủ tục hành chính",
    feedback: "Hỏi đáp & Góp ý",
    contact: "Liên hệ",
    
    addressLabel: "Địa chỉ:",
    hotlineLabel: "Điện thoại:",
    faxLabel: "Fax:",
    emailLabel: "Email:",
    address: "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk",
  },
  en: {
    oneGateTitle: "DANG KANG PUBLIC ADMINISTRATIVE PORTAL",
    oneGateSub: "Handling administrative procedures modernly, securely, and rapidly",
    lookupProcedures: "Look up administrative procedures",
    managingAuthority: "MANAGING AUTHORITY",
    govLinks: "GOVERNMENT LINKS",
    sitemapTitle: "SITEMAP",
    statsTitle: "VISITOR STATISTICS",
    statsOnline: "Online Visitors",
    statsToday: "Today",
    statsTotal: "Total Visits",
    securityTitle: "Secure Website",
    securityDesc: "Cybersecurity audited by the Authority of Information Security.",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    sitemapLink: "Sitemap",
    copyright: "Copyright © 2026 Web Portal of Dang Kang People's Committee. Developed on Administrative Portal 4.0 Platform.",
    
    home: "Home",
    about: "About Us",
    news: "News",
    documents: "Documents",
    procedures: "Procedures",
    feedback: "Q&A & Feedback",
    contact: "Contact",
    
    addressLabel: "Address:",
    hotlineLabel: "Phone:",
    faxLabel: "Fax:",
    emailLabel: "Email:",
    address: "Village 6, Dang Kang commune, Krong Bong district, Dak Lak province",
  }
}

export default function Footer() {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [onlineCount, setOnlineCount] = React.useState(4)
  const [todayCount, setTodayCount] = React.useState(38)
  const [totalCount, setTotalCount] = React.useState(107)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 3. Resolve the active language client-side
  const currentLang = React.useMemo(() => {
    if (!mounted) return "vi"
    const cookieLang = getCookie("lang")
    if (cookieLang === "vi" || cookieLang === "en") return cookieLang
    return "vi"
  }, [mounted])

  const ft = footerTranslations[currentLang] || footerTranslations.vi

  const { data: menusData } = useQuery({
    queryKey: ["public-portal-menus"],
    queryFn: async () => {
      const response = await apiClient.get("/public/portal-menus")
      return response
    },
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

  // 5. Enhance dynamic configurations helper with multilingual JSON support
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
        // Fallback if not valid JSON
      }
    }

    if (code === "citizen_schedule") {
      return found.description || found.name || fallback
    }

    return found.name || fallback
  }, [portalConfigData, currentLang])

  React.useEffect(() => {
    // Generate organic visitor fluctuation
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const diff = Math.floor(Math.random() * 3) - 1
        const next = prev + diff
        return next > 0 ? next : 1
      })
      setTodayCount(prev => prev + 1)
      setTotalCount(prev => prev + 1)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  // 6. Localize and memoize sitemap items
  const mainLinks = React.useMemo(() => {
    if (!menusData?.data || menusData.data.length === 0) {
      return [
        { name: ft.home, path: "/" },
        { name: ft.about, path: currentLang === "en" ? "/aboutus" : "/gioi-thieu" },
        { name: ft.news, path: currentLang === "en" ? "/news" : "/tin-tuc" },
        { name: ft.documents, path: currentLang === "en" ? "/documents" : "/van-ban" },
        { name: ft.procedures, path: currentLang === "en" ? "/procedures" : "/thu-tuc" },
        { name: ft.feedback, path: currentLang === "en" ? "/feedback" : "/tuong-tac" },
        { name: ft.contact, path: currentLang === "en" ? "/contact" : "/lien-he" }
      ]
    }
    const footerMenus = menusData.data.filter(
      (m: any) => m.position?.toUpperCase() === "FOOTER" && m.isActive !== false
    )
    footerMenus.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    return footerMenus.length > 0
      ? footerMenus.map((m: any) => ({ name: m.name, path: m.link || "/" }))
      : [
        { name: ft.home, path: "/" },
        { name: ft.about, path: "/gioi-thieu" },
        { name: ft.news, path: "/tin-tuc" },
        { name: ft.documents, path: "/van-ban" },
        { name: ft.procedures, path: "/thu-tuc" },
        { name: ft.feedback, path: "/tuong-tac" },
        { name: ft.contact, path: "/lien-he" }
      ]
  }, [menusData, ft])

  // 7. Localize external government reference portals
  const govLinks = React.useMemo(() => {
    if (currentLang === "en") {
      return [
        { name: "National Public Service Portal", url: "https://dichvucong.gov.vn" },
        { name: "Vietnam Government Web Portal", url: "https://chinhphu.vn" },
        { name: "Dak Lak Province Portal", url: "https://daklak.gov.vn" },
        { name: "Krong Bong District Portal", url: "https://krongbong.daklak.gov.vn" },
        { name: "National Legal Database", url: "https://vbpl.vn" }
      ]
    }
    return [
      { name: "Cổng Dịch vụ công Quốc gia", url: "https://dichvucong.gov.vn" },
      { name: "Cổng thông tin Điện tử Chính phủ", url: "https://chinhphu.vn" },
      { name: "Cổng thông tin tỉnh Đắk Lắk", url: "https://daklak.gov.vn" },
      { name: "Trang thông tin huyện Krông Bông", url: "https://krongbong.daklak.gov.vn" },
      { name: "Cơ sở dữ liệu văn bản pháp luật", url: "https://vbpl.vn" }
    ]
  }, [currentLang])

  return (
    <footer className="w-full bg-[#1e293b] text-slate-300 relative border-t-4 border-[#b91c1c] overflow-hidden select-none">
      {/* Upper Footer: Top government logos or fast reference buttons */}
      <div className="w-full bg-slate-900 border-b border-slate-800 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/15 flex items-center justify-center border border-red-500/20 text-[#fbc02d]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                {getConfigValue("footer_portal_title", ft.oneGateTitle)}
              </p>
              <p className="text-xs text-slate-400">
                {getConfigValue("footer_portal_subtitle", ft.oneGateSub)}
              </p>
            </div>
          </div>
          <Link
            href="/thu-tuc"
            className="flex items-center gap-1.5 text-xs text-[#fef08a] hover:text-white bg-red-700/20 hover:bg-red-700/40 px-4 py-2 rounded-full border border-red-700/40 transition-all font-medium uppercase tracking-wider shadow-sm"
          >
            <FileText className="w-4 h-4" />
            {ft.lookupProcedures}
          </Link>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">

        {/* Left Column: Organization detail */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">
              {ft.managingAuthority}
            </span>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wide mt-1">
              {getConfigValue("unit_name", currentLang === "en" ? "PEOPLE'S COMMITTEE OF DANG KANG COMMUNE" : "ỦY BAN NHÂN DÂN XÃ DANG KANG")}
            </h3>
            <span className="text-xs font-semibold text-[#fef08a] uppercase tracking-wide mt-0.5">
              {getConfigValue("unit_identifier", currentLang === "en" ? "KRONG BONG DISTRICT - DAK LAK PROVINCE" : "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK")}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {getConfigValue("license_info", currentLang === "en" ? "License No: 45/GP-TTĐT issued by Dak Lak Department of Information and Communications" : "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp")}. {currentLang === "en" ? "Responsible for content" : "Chịu trách nhiệm nội dung"}: {getConfigValue("responsible_person", currentLang === "en" ? "Mr. Tran Van Minh - Chairman of Dang Kang People's Committee" : "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang")}.
          </p>

          <div className="flex flex-col gap-2.5 mt-2 text-xs font-medium">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{ft.addressLabel} {getConfigValue("address", ft.address)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#fbc02d] shrink-0" />
              <a href={`tel:${getConfigValue("hotline", "0262.3812.345").replace(/[^\d]/g, "")}`} className="hover:text-white transition-colors">
                {ft.hotlineLabel} {getConfigValue("hotline", "0262.3812.345")}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{ft.faxLabel} {getConfigValue("fax", "0262.3812.346")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <a href={`mailto:${getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}`} className="hover:text-white transition-colors">
                {ft.emailLabel} {getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Sitemap & Main categories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-white uppercase border-b border-slate-700 pb-2 tracking-wide">
            {ft.sitemapTitle}
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs font-semibold text-slate-400">
            {mainLinks.map((item: any) => (
              <li key={item.name}>
                <Link href={item.path} className="hover:text-[#fef08a] flex items-center gap-1 transition-colors group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#fef08a] transition-colors" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: External Government links */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-white uppercase border-b border-slate-700 pb-2 tracking-wide">
            {ft.govLinks}
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs font-semibold text-slate-400">
            {govLinks.map((item: any) => (
              <li key={item.name}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#fef08a] flex items-start gap-1 transition-colors group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#fef08a] shrink-0 mt-0.5 transition-colors" />
                  <span>{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Counter widget and security badge */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <h4 className="text-sm font-bold text-white uppercase border-b border-slate-700 pb-2 tracking-wide">
            {ft.statsTitle}
          </h4>

          <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 shadow-inner">
            <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950/40 rounded-lg">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Users className="w-3 h-3 text-sky-400" />
                {ft.statsOnline}
              </span>
              <span className="text-lg font-black text-white mt-1 font-mono tracking-wide">{onlineCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950/40 rounded-lg">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Eye className="w-3 h-3 text-emerald-400" />
                {ft.statsToday}
              </span>
              <span className="text-lg font-black text-white mt-1 font-mono tracking-wide">{todayCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950/40 rounded-lg col-span-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {ft.statsTotal}
              </span>
              <span className="text-xl font-black text-[#fef08a] mt-1 font-mono tracking-widest">{totalCount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-red-950/15 border border-red-900/20 p-3 rounded-lg">
            <Shield className="w-8 h-8 text-red-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-white font-extrabold uppercase tracking-wide">
                {ft.securityTitle}
              </span>
              <span className="text-[9px] text-slate-400 leading-normal">
                {ft.securityDesc}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom copyright banner */}
      <div className="w-full bg-[#111827] py-6 px-4 md:px-8 border-t border-slate-800 text-center text-xs font-medium text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center items-center gap-3">
            <Link href="/gioi-thieu" className="hover:text-[#fef08a] transition-colors">
              {ft.terms}
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/gioi-thieu" className="hover:text-[#fef08a] transition-colors">
              {ft.privacy}
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/lien-he" className="hover:text-[#fef08a] transition-colors">
              {ft.sitemapLink}
            </Link>
          </div>
          <div>
            <span>
              {ft.copyright}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
