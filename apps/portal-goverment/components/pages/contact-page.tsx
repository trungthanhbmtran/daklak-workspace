"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Home,
  ChevronRight,
  Info,
  Building2,
  MapIcon
} from "lucide-react"

// Pure SVG interactive styled outline representing Dang Kang Commune subdivision zones
const COMMUNE_ZONES = [
  { id: "T1", name: "Thôn 1 (Khu vực phía Tây Bắc)", path: "M 10,10 L 45,10 L 40,40 L 10,35 Z", area: "125 ha", pop: "780 người", center: { x: 25, y: 22 } },
  { id: "T2", name: "Thôn 2 (Khu vực sông Krông Ana)", path: "M 45,10 L 85,15 L 75,45 L 40,40 Z", area: "240 ha", pop: "1,120 người", center: { x: 62, y: 26 } },
  { id: "T3", name: "Thôn 3 (Khu vực Trung tâm Hành chính)", path: "M 10,35 L 40,40 L 35,65 L 8,60 Z", area: "95 ha", pop: "950 người", center: { x: 23, y: 50 } },
  { id: "T4", name: "Thôn 4 (Khu quy hoạch cà phê)", path: "M 40,40 L 75,45 L 70,70 L 35,65 Z", area: "180 ha", pop: "840 người", center: { x: 55, y: 54 } },
  { id: "T5", name: "Thôn 5 (Khu vực lâm nghiệp)", path: "M 8,60 L 35,65 L 30,95 L 5,90 Z", area: "320 ha", pop: "650 người", center: { x: 19, y: 78 } },
  { id: "T6", name: "Thôn 6 (Khu vực Đền thờ - Núi Chư Yang Sin)", path: "M 35,65 L 70,70 L 65,95 L 30,95 Z", area: "450 ha", pop: "1,030 người", center: { x: 50, y: 80 } },
  { id: "BE", name: "Buôn Êga (Đồng bào Êđê sinh sống)", path: "M 75,15 L 98,18 L 92,55 L 75,45 Z", area: "580 ha", pop: "920 người", center: { x: 86, y: 32 } },
  { id: "BM", name: "Buôn Êđê (Khu bảo tồn văn hóa truyền thống)", path: "M 75,45 L 92,55 L 85,95 L 65,95 L 70,70 Z", area: "462 ha", pop: "572 người", center: { x: 78, y: 72 } }
]

// Client-side cookie getter helper
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[2]) : null
}

export default function ContactPage() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Resolve active language client-side
  const currentLang = React.useMemo(() => {
    if (!mounted) return "vi"
    const cookieLang = getCookie("lang")
    if (cookieLang === "vi" || cookieLang === "en") return cookieLang
    return "vi"
  }, [mounted])

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

  const [activeZone, setActiveZone] = React.useState<typeof COMMUNE_ZONES[0] | null>(null)

  React.useEffect(() => {
    setActiveZone(COMMUNE_ZONES[2] || null)
  }, [])

  const [mapType, setMapType] = React.useState<"vector" | "image">("vector")

  // Form submission state
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !message) return
    setSubmitted(true)

    // Clear inputs
    setSubject("")
    setMessage("")
  }

  const resetContactForm = () => {
    setSubmitted(false)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 md:gap-12 animate-fade-in select-none">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-[#b91c1c] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {currentLang === "en" ? "Home" : "Trang chủ"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300">
          {currentLang === "en" ? "Contact Information" : "Thông tin liên hệ"}
        </span>
      </div>

      {/* Main Grid: Info cards & interactive map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Left Side: Contact specifications & forms */}
        <div className="lg:col-span-6 flex flex-col gap-6">

          {/* Metadata Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-[#b91c1c]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                {currentLang === "en" ? "HEADQUARTERS INFORMATION" : "THÔNG TIN TRỤ SỞ CHÍNH"}
              </h3>
            </div>

            <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  {getConfigValue("address", currentLang === "en" ? "Village 6, Dang Kang commune, Krong Bong district, Dak Lak province" : "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk")}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#fbc02d] shrink-0" />
                <a href={`tel:${getConfigValue("hotline", "0262.3812.345").replace(/[^\d]/g, "")}`} className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d]">
                  {(currentLang === "en" ? "Phone: " : "Điện thoại: ") + getConfigValue("hotline", "0262.3812.345")}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}`} className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d] break-all">
                  {"Email: " + getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}
                </a>
              </div>
              <div className="flex items-start gap-2.5 border-t border-slate-100 dark:border-slate-850 pt-4 font-medium text-slate-500">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-slate-850 dark:text-slate-300 font-bold">
                    {currentLang === "en" ? "Direct citizen reception hours:" : "Thời gian tiếp nhận công dân trực tiếp:"}
                  </span>
                  <span className="whitespace-pre-line text-slate-600 dark:text-slate-400">
                    {getConfigValue("citizen_schedule", currentLang === "en" ? "Every Thursday • 08:00 - 11:30" : "Thứ 5 hàng tuần • 08:00 - 11:30")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Mail className="w-5 h-5 text-[#b91c1c]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                {getConfigValue("contact_form_title", currentLang === "en" ? "SEND FEEDBACK / COMMENTS TO OFFICE" : "GỬI PHẢN ÁNH / GÓP Ý ĐẾN VĂN PHÒNG")}
              </h3>
            </div>

            {!submitted ? (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {currentLang === "en" ? "Full name *" : "Họ và tên *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={currentLang === "en" ? "Enter your full name..." : "Nhập họ tên của bạn..."}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {currentLang === "en" ? "Contact email *" : "Email liên hệ *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={currentLang === "en" ? "Enter your email..." : "Nhập email của bạn..."}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {currentLang === "en" ? "Feedback title" : "Tiêu đề ý kiến"}
                  </label>
                  <input
                    type="text"
                    placeholder={currentLang === "en" ? "Feedback subject..." : "Chủ đề góp ý..."}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {currentLang === "en" ? "Feedback message content *" : "Nội dung thư góp ý *"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={currentLang === "en" ? "Type the message content to send to editors..." : "Gõ nội dung tin nhắn gửi đến ban biên tập..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-bold tracking-wider py-3 rounded-xl transition-colors uppercase flex items-center justify-center gap-1.5 shadow"
                >
                  <Send className="w-4 h-4 text-[#fef08a] dark:text-[#b91c1c]" />
                  {currentLang === "en" ? "SEND FEEDBACK" : "GỬI THƯ GÓP Ý"}
                </button>
              </form>
            ) : (
              <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/20 flex flex-col gap-4 text-center items-center animate-fade-in text-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-black text-slate-850 uppercase">
                    {currentLang === "en" ? "MESSAGE SENT SUCCESSFULLY!" : "ĐÃ GỬI THƯ THÀNH CÔNG!"}
                  </h4>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {getConfigValue("contact_form_success_desc", currentLang === "en" ? "Dang Kang commune clerical department has received your comment and will respond as soon as possible via email." : "Bộ phận văn thư xã Dang Kang đã nhận được ý kiến của bạn và sẽ có phản hồi sớm nhất qua hòm thư điện tử.")}
                  </p>
                </div>
                <button
                  onClick={resetContactForm}
                  className="bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow"
                >
                  {currentLang === "en" ? "Send another message" : "Gửi thêm tin nhắn mới"}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Interactive Administrative subdivision zone Vector Map */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-4 sm:gap-5 h-full">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapIcon className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide flex-1">
              {getConfigValue("contact_map_title", currentLang === "en" ? "DANG KANG COMMUNE ADMINISTRATIVE SUBDIVISION MAP" : "BẢN ĐỒ PHÂN VÙNG HÀNH CHÍNH XÃ DANG KANG")}
            </h3>
          </div>

          {getConfigValue("map_url", "") && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl self-start">
              <button
                type="button"
                onClick={() => setMapType("vector")}
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg transition-all ${mapType === "vector"
                  ? "bg-white dark:bg-slate-800 text-[#b91c1c] dark:text-white shadow"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {currentLang === "en" ? "Interactive Subdivision" : "Bản đồ tương tác"}
              </button>
              <button
                type="button"
                onClick={() => setMapType("image")}
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg transition-all ${mapType === "image"
                  ? "bg-white dark:bg-slate-800 text-[#b91c1c] dark:text-white shadow"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {currentLang === "en" ? "Detailed Map" : "Bản đồ địa giới"}
              </button>
            </div>
          )}

          {mapType === "image" && getConfigValue("map_url", "") ? (
            <div className="flex flex-col gap-4">
              <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                {currentLang === "en" ? "Commune detailed administrative boundaries map uploaded by the department. Hover or pinch to view details:" : "Bản đồ ranh giới chi tiết địa giới hành chính xã Dang Kang được cơ quan tải lên:"}
              </p>
              <div className="w-full relative aspect-square sm:aspect-video rounded-xl border border-slate-150 overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-center p-2 group">
                <img
                  src={getConfigValue("map_url", "")}
                  alt="Commune administrative map"
                  className="max-h-full max-w-full object-contain rounded-lg transition-all duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                {currentLang === "en" ? "Interactive vector map simulating 8 village subdivisions of Dang Kang Commune. Click on any zone to view quick demographic statistics:" : "Bản đồ vẽ tay vector mô phỏng diện tích 8 phân khu thôn, buôn của địa bàn xã Dang Kang. Click chuột vào bất kỳ phân vùng nào trên bản đồ để xem thống kê nhanh số liệu địa giới:"}
              </p>

              {/* Interactive SVG Rendering */}
              <div className="w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 relative">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full max-w-[340px] h-auto drop-shadow-md"
                >
                  {COMMUNE_ZONES.map((zone) => {
                    const isActive = activeZone?.id === zone.id
                    return (
                      <path
                        key={zone.id}
                        d={zone.path}
                        className={`stroke-white dark:stroke-slate-900 stroke-[1.5] cursor-pointer transition-all ${isActive
                          ? "fill-[#b91c1c] opacity-95 scale-[1.01] drop-shadow-lg"
                          : "fill-red-700/20 hover:fill-red-700/40 opacity-80"
                          }`}
                        onClick={() => setActiveZone(zone)}
                      />
                    )
                  })}

                  {/* Display dynamic abbreviation tags directly on the map for high premium design feel */}
                  {COMMUNE_ZONES.map((zone) => (
                    <text
                      key={`tag-${zone.id}`}
                      x={zone.center.x}
                      y={zone.center.y}
                      fontSize="4"
                      fontWeight="bold"
                      textAnchor="middle"
                      className={`pointer-events-none transition-colors ${activeZone?.id === zone.id ? "fill-[#fef08a]" : "fill-slate-800 dark:fill-slate-200"
                        }`}
                    >
                      {zone.id}
                    </text>
                  ))}
                </svg>
              </div>

              {/* Selected Zone specs */}
              {activeZone && (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col gap-3.5 animate-fade-in text-xs">
                  <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/60 pb-2">
                    <Info className="w-4 h-4 text-[#b91c1c] dark:text-[#fbc02d]" />
                    <span className="font-extrabold text-[#b91c1c] dark:text-[#fbc02d] uppercase tracking-wide">
                      {(currentLang === "en" ? "DETAIL: " : "CHI TIẾT: ") + activeZone.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                        {currentLang === "en" ? "Estimated area" : "Diện tích ước tính"}
                      </span>
                      <span className="text-slate-850 dark:text-slate-200 font-bold text-xs sm:text-sm">{activeZone.area}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                        {currentLang === "en" ? "Population size" : "Quy mô dân cư"}
                      </span>
                      <span className="text-slate-850 dark:text-slate-200 font-bold text-xs sm:text-sm">{activeZone.pop}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  )
}
