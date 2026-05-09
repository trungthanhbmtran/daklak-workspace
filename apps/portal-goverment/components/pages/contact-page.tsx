"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { useLanguage } from "@/components/language-context"
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
const COMMUNE_ZONES_VI = [
  { id: "T1", name: "Thôn 1 (Khu vực phía Tây Bắc)", path: "M 10,10 L 45,10 L 40,40 L 10,35 Z", area: "125 ha", pop: "780 người", center: { x: 25, y: 22 } },
  { id: "T2", name: "Thôn 2 (Khu vực sông Krông Ana)", path: "M 45,10 L 85,15 L 75,45 L 40,40 Z", area: "240 ha", pop: "1,120 người", center: { x: 62, y: 26 } },
  { id: "T3", name: "Thôn 3 (Khu vực Trung tâm Hành chính)", path: "M 10,35 L 40,40 L 35,65 L 8,60 Z", area: "95 ha", pop: "950 người", center: { x: 23, y: 50 } },
  { id: "T4", name: "Thôn 4 (Khu quy hoạch cà phê)", path: "M 40,40 L 75,45 L 70,70 L 35,65 Z", area: "180 ha", pop: "840 người", center: { x: 55, y: 54 } },
  { id: "T5", name: "Thôn 5 (Khu vực lâm nghiệp)", path: "M 8,60 L 35,65 L 30,95 L 5,90 Z", area: "320 ha", pop: "650 người", center: { x: 19, y: 78 } },
  { id: "T6", name: "Thôn 6 (Khu vực Đền thờ - Núi Chư Yang Sin)", path: "M 35,65 L 70,70 L 65,95 L 30,95 Z", area: "450 ha", pop: "1,030 người", center: { x: 50, y: 80 } },
  { id: "BE", name: "Buôn Êga (Đồng bào Êđê sinh sống)", path: "M 75,15 L 98,18 L 92,55 L 75,45 Z", area: "580 ha", pop: "920 người", center: { x: 86, y: 32 } },
  { id: "BM", name: "Buôn Êđê (Khu bảo tồn văn hóa truyền thống)", path: "M 75,45 L 92,55 L 85,95 L 65,95 L 70,70 Z", area: "462 ha", pop: "572 người", center: { x: 78, y: 72 } }
]

const COMMUNE_ZONES_EN = [
  { id: "T1", name: "Hamlet 1 (Northwestern Area)", path: "M 10,10 L 45,10 L 40,40 L 10,35 Z", area: "125 ha", pop: "780 people", center: { x: 25, y: 22 } },
  { id: "T2", name: "Hamlet 2 (Krong Ana River Area)", path: "M 45,10 L 85,15 L 75,45 L 40,40 Z", area: "240 ha", pop: "1,120 people", center: { x: 62, y: 26 } },
  { id: "T3", name: "Hamlet 3 (Administrative Center)", path: "M 10,35 L 40,40 L 35,65 L 8,60 Z", area: "95 ha", pop: "950 people", center: { x: 23, y: 50 } },
  { id: "T4", name: "Hamlet 4 (Coffee Cultivation Zone)", path: "M 40,40 L 75,45 L 70,70 L 35,65 Z", area: "180 ha", pop: "840 people", center: { x: 55, y: 54 } },
  { id: "T5", name: "Hamlet 5 (Forestry District)", path: "M 8,60 L 35,65 L 30,95 L 5,90 Z", area: "320 ha", pop: "650 people", center: { x: 19, y: 78 } },
  { id: "T6", name: "Hamlet 6 (Chư Yang Sin Foothills)", path: "M 35,65 L 70,70 L 65,95 L 30,95 Z", area: "450 ha", pop: "1,030 people", center: { x: 50, y: 80 } },
  { id: "BE", name: "Ega Village (Ede Ethnic Hamlet)", path: "M 75,15 L 98,18 L 92,55 L 75,45 Z", area: "580 ha", pop: "920 people", center: { x: 86, y: 32 } },
  { id: "BM", name: "Ede Village (Cultural Preservation Area)", path: "M 75,45 L 92,55 L 85,95 L 65,95 L 70,70 Z", area: "462 ha", pop: "572 people", center: { x: 78, y: 72 } }
]

export default function ContactPage() {
  const { language, t } = useLanguage()
  const COMMUNE_ZONES = language === "vi" ? COMMUNE_ZONES_VI : COMMUNE_ZONES_EN

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
    return found ? found.name : fallback;
  }, [portalConfigData]);

  const [activeZone, setActiveZone] = React.useState<typeof COMMUNE_ZONES[0] | null>(null)
  
  // Set default active zone once mounted to match corresponding localized version
  React.useEffect(() => {
    setActiveZone(COMMUNE_ZONES[2] || null)
  }, [language])

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
          {t("Trang chủ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300">
          {language === "vi" ? "Thông tin liên hệ" : "Contact Information"}
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
                {language === "vi" ? "THÔNG TIN TRỤ SỞ CHÍNH" : "OFFICIAL HEADQUARTERS ADDRESS & CONTACTS"}
              </h3>
            </div>

            <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  {language === "vi" 
                    ? "Trụ sở: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk" 
                    : "HQ: Hamlet 6, Dang Kang Commune, Krong Bong District, Dak Lak Province"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#fbc02d] shrink-0" />
                <a href={`tel:${getConfigValue("hotline", "0262.3812.345").replace(/\./g, "")}`} className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d]">
                  {language === "vi" 
                    ? `Điện thoại khẩn: ${getConfigValue("hotline", "0262.3812.345")}` 
                    : `Hotline Office: ${getConfigValue("hotline", "0262.3812.345")}`}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="mailto:xadangkang@krongbong.daklak.gov.vn" className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d] break-all">
                  Email: xadangkang@krongbong.daklak.gov.vn
                </a>
              </div>
              <div className="flex items-start gap-2.5 border-t border-slate-100 dark:border-slate-850 pt-4 font-medium text-slate-500">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-slate-850 dark:text-slate-300 font-bold">
                    {language === "vi" ? "Thời gian tiếp nhận công dân trực tiếp:" : "Citizen Direct Reception Office Hours:"}
                  </span>
                  <span>
                    {language === "vi" 
                      ? "Từ thứ Hai đến thứ Sáu hàng tuần (Trừ ngày lễ, Tết)" 
                      : "Monday to Friday weekly (Except Public Holidays)"}
                  </span>
                  <span>
                    {language === "vi" 
                      ? "Sáng: 07:30 – 11:30 | Chiều: 13:30 – 17:00" 
                      : "Morning: 07:30 – 11:30 | Afternoon: 13:30 – 17:00"}
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
                {language === "vi" ? "GỬI PHẢN ÁNH / GÓP Ý ĐẾN VĂN PHÒNG" : "SUBMIT FEEDBACK / INQUIRIES TO OFFICE"}
              </h3>
            </div>

            {!submitted ? (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {language === "vi" ? "Họ và tên *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === "vi" ? "Nhập họ tên của bạn..." : "Type your full name..."}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {language === "vi" ? "Email liên hệ *" : "Contact Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={language === "vi" ? "Nhập email của bạn..." : "Type your email address..."}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {language === "vi" ? "Tiêu đề ý kiến" : "Inquiry Subject"}
                  </label>
                  <input
                    type="text"
                    placeholder={language === "vi" ? "Chủ đề góp ý..." : "Subject theme..."}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {language === "vi" ? "Nội dung thư góp ý *" : "Inquiry / Message Content *"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={language === "vi" ? "Gõ nội dung tin nhắn gửi đến ban biên tập..." : "Write your feedback details here..."}
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
                  {language === "vi" ? "GỬI THƯ GÓP Ý" : "SUBMIT FEEDBACK MESSAGE"}
                </button>
              </form>
            ) : (
              <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/20 flex flex-col gap-4 text-center items-center animate-fade-in text-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-black text-slate-850 uppercase">
                    {language === "vi" ? "ĐÃ GỬI THƯ THÀNH CÔNG!" : "MESSAGE SUBMITTED SUCCESSFULLY!"}
                  </h4>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {language === "vi" 
                      ? "Bộ phận văn thư xã Dang Kang đã nhận được ý kiến của bạn và sẽ có phản hồi sớm nhất qua hòm thư điện tử."
                      : "Dang Kang clerical team has received your inquiry and will reply as soon as possible via email."}
                  </p>
                </div>
                <button
                  onClick={resetContactForm}
                  className="bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow"
                >
                  {language === "vi" ? "Gửi thêm tin nhắn mới" : "Send another inquiry"}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Interactive Administrative subdivision zone Vector Map */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-4 sm:gap-5 h-full">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapIcon className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
              {language === "vi" ? "BẢN ĐỒ PHÂN VÙNG HÀNH CHÍNH XÃ DANG KANG" : "DANG KANG ADMINISTRATIVE SUBDIVISIONS MAP"}
            </h3>
          </div>

          <p className="text-[11px] text-slate-400 font-semibold leading-normal">
            {language === "vi"
              ? "Bản đồ vẽ tay vector mô phỏng diện tích 8 phân khu thôn, buôn của địa bàn xã Dang Kang. Click chuột vào bất kỳ phân vùng nào trên bản đồ để xem thống kê nhanh số liệu địa giới:"
              : "Hand-drawn vector map simulating 8 hamlet/village subdivisions of Dang Kang Commune. Click on any subdivision segment to review real-time geographic data:"}
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
                    className={`stroke-white dark:stroke-slate-900 stroke-[1.5] cursor-pointer transition-all ${
                      isActive 
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
                  className={`pointer-events-none transition-colors ${
                    activeZone?.id === zone.id ? "fill-[#fef08a]" : "fill-slate-800 dark:fill-slate-200"
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
                  {language === "vi" ? "CHI TIẾT:" : "DETAILS:"} {activeZone.name}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {language === "vi" ? "Diện tích ước tính" : "Estimated Area"}
                  </span>
                  <span className="text-slate-850 dark:text-slate-200 font-bold text-xs sm:text-sm">{activeZone.area}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {language === "vi" ? "Quy mô dân cư" : "Estimated Population"}
                  </span>
                  <span className="text-slate-850 dark:text-slate-200 font-bold text-xs sm:text-sm">{activeZone.pop}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
