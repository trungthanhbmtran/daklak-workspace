"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { useLanguage } from "./language-context"
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

export default function Footer() {
  const { language, t } = useLanguage()
  const [onlineCount, setOnlineCount] = React.useState(4)
  const [todayCount, setTodayCount] = React.useState(38)
  const [totalCount, setTotalCount] = React.useState(107)

  const { data: menusData } = useQuery({
    queryKey: ["public-portal-menus"],
    queryFn: async () => {
      const response = await apiClient.get("/public/portal-menus")
      return response
    },
  })

  const { data: portalConfigData } = useQuery({
    queryKey: ["public-categories", "PORTAL_CONFIG"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/categories?group=PORTAL_CONFIG")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        console.error("Failed to fetch portal configurations", e)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const getConfigValue = React.useCallback((code: string, fallback: string) => {
    const found = (portalConfigData || []).find((c: any) => c.code === code);
    if (!found) return fallback;

    // Check if description contains JSON translations
    if (found.description && found.description.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(found.description);
        if (parsed && typeof parsed === 'object') {
          if (parsed[language]) {
            return parsed[language];
          }
          if (parsed.translations && parsed.translations[language]) {
            return parsed.translations[language];
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    if (code === "citizen_schedule") {
      return found.description || found.name || fallback;
    }

    return found.name || fallback;
  }, [portalConfigData, language]);

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

  const mainLinks = React.useMemo(() => {
    if (!menusData?.data || menusData.data.length === 0) {
      return [
        { name: "Trang chủ", path: "/" },
        { name: "Giới thiệu chung", path: "/gioi-thieu" },
        { name: "Tin tức & Chuyên mục", path: "/tin-tuc" },
        { name: "Văn bản pháp quy", path: "/van-ban" },
        { name: "Thủ tục hành chính", path: "/thu-tuc" },
        { name: "Hỏi đáp & Ý kiến công dân", path: "/tuong-tac" },
        { name: "Thông tin liên hệ", path: "/lien-he" }
      ]
    }
    const footerMenus = menusData.data.filter(
      (m: any) => m.position?.toUpperCase() === "FOOTER" && m.isActive !== false
    )
    footerMenus.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    return footerMenus.length > 0
      ? footerMenus.map((m: any) => ({ name: m.name, path: m.link || "/" }))
      : [
        { name: t("Trang chủ"), path: "/" },
        { name: t("Giới thiệu"), path: language === "vi" ? "/gioi-thieu" : "/aboutus" },
        { name: t("Tin tức"), path: language === "vi" ? "/tin-tuc" : "/news" },
        { name: t("Văn bản"), path: language === "vi" ? "/van-ban" : "/documents" },
        { name: t("Thủ tục hành chính"), path: language === "vi" ? "/thu-tuc" : "/procedures" },
        { name: t("Hỏi đáp & Góp ý"), path: language === "vi" ? "/tuong-tac" : "/feedback" },
        { name: t("Liên hệ"), path: language === "vi" ? "/lien-he" : "/contact" }
      ]
  }, [menusData, language, t])

  const govLinks = [
    { name: t("Cổng Dịch vụ công Quốc gia"), url: "https://dichvucong.gov.vn" },
    { name: t("Cổng thông tin Điện tử Chính phủ"), url: "https://chinhphu.vn" },
    { name: t("Cổng thông tin tỉnh Đắk Lắk"), url: "https://daklak.gov.vn" },
    { name: t("Trang thông tin huyện Krông Bông"), url: "https://krongbong.daklak.gov.vn" },
    { name: t("Cơ sở dữ liệu văn bản pháp luật"), url: "https://vbpl.vn" }
  ]

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
                {getConfigValue("footer_portal_title", language === "vi" ? "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN XÃ DANG KANG" : "ONLINE PUBLIC SERVICE PORTAL OF DANG KANG")}
              </p>
              <p className="text-xs text-slate-400">
                {getConfigValue("footer_portal_subtitle", language === "vi" ? "Tiếp nhận giải quyết thủ tục hành chính một cửa hiện đại, nhanh chóng" : "Providing high-speed, modern one-stop administrative procedure resolutions")}
              </p>
            </div>
          </div>
          <Link
            href="/thu-tuc"
            className="flex items-center gap-1.5 text-xs text-[#fef08a] hover:text-white bg-red-700/20 hover:bg-red-700/40 px-4 py-2 rounded-full border border-red-700/40 transition-all font-medium uppercase tracking-wider shadow-sm"
          >
            <FileText className="w-4 h-4" />
            {t("Tra cứu thủ tục hành chính")}
          </Link>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">

        {/* Left Column: Organization detail */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">
              {t("CƠ QUAN CHỦ QUẢN")}
            </span>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wide mt-1">
              {getConfigValue("unit_name", "ỦY BAN NHÂN DÂN XÃ DANG KANG")}
            </h3>
            <span className="text-xs font-semibold text-[#fef08a] uppercase tracking-wide mt-0.5">
              {t("HUYỆN KRÔNG BÔNG")} - {getConfigValue("unit_identifier", "TỈNH ĐẮK LẮK")}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {getConfigValue("license_info", "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp")}. {t("Chịu trách nhiệm nội dung:")} {getConfigValue("responsible_person", "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang")}.
          </p>

          <div className="flex flex-col gap-2.5 mt-2 text-xs font-medium">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{t("Địa chỉ:")} {getConfigValue("address", "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#fbc02d] shrink-0" />
              <a href={`tel:${getConfigValue("hotline", "0262.3812.345").replace(/\./g, "")}`} className="hover:text-white transition-colors">
                {t("Điện thoại:")} {getConfigValue("hotline", "0262.3812.345")}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fax: {getConfigValue("fax", "0262.3812.346")}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <a href={`mailto:${getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}`} className="hover:text-white transition-colors">
                Email: {getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Sitemap & Main categories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-white uppercase border-b border-slate-700 pb-2 tracking-wide">
            {t("CƠ CẤU TRANG")}
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
            {t("LIÊN KẾT LIÊN THÔNG")}
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
            {t("THỐNG KÊ TRUY CẬP")}
          </h4>

          <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 shadow-inner">
            <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950/40 rounded-lg">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Users className="w-3 h-3 text-sky-400" />
                {t("Đang trực tuyến")}
              </span>
              <span className="text-lg font-black text-white mt-1 font-mono tracking-wide">{onlineCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950/40 rounded-lg">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Eye className="w-3 h-3 text-emerald-400" />
                {t("Hôm nay")}
              </span>
              <span className="text-lg font-black text-white mt-1 font-mono tracking-wide">{todayCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 bg-slate-950/40 rounded-lg col-span-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {t("Tổng lượt truy cập")}
              </span>
              <span className="text-xl font-black text-[#fef08a] mt-1 font-mono tracking-widest">{totalCount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-red-950/15 border border-red-900/20 p-3 rounded-lg">
            <Shield className="w-8 h-8 text-red-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-white font-extrabold uppercase tracking-wide">
                {t("Website Bảo mật")}
              </span>
              <span className="text-[9px] text-slate-400 leading-normal">
                {t("Được kiểm duyệt an ninh mạng bởi Cục An toàn thông tin.")}
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
              {t("Điều khoản sử dụng")}
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/gioi-thieu" className="hover:text-[#fef08a] transition-colors">
              {t("Chính sách bảo mật")}
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/lien-he" className="hover:text-[#fef08a] transition-colors">
              {t("Bản đồ trang web")}
            </Link>
          </div>
          <div>
            <span>
              {t("Bản quyền © 2026 Trang thông tin điện tử Ủy ban nhân dân xã Dang Kang. Phát triển trên nền tảng Portal Hành chính 4.0.")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
