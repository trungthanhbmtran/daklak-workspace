"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer"
import {
  Building2,
  MapPin,
  Users2,
  History,
  UserSquare2,
  ShieldCheck,
  Workflow,
  Phone,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  CalendarDays
} from "lucide-react"

// -------------------------------------------------------------
// TRANSLATION RESOURCE DICTIONARY
// -------------------------------------------------------------
const translations = {
  vi: {
    pageTitle: "GIỚI THIỆU CHUNG & CƠ CẤU TỔ CHỨC",
    pageSubtitle: "Tìm hiểu về lịch sử địa lý, bộ máy vận hành hành chính của xã Dang Kang, huyện Krông Bông",
    historyTitle: "Tổng quan Địa lý & Lịch sử",
    statsArea: "Diện tích tự nhiên",
    statsPop: "Dân số hiện tại",
    statsUnits: "Đơn vị hành chính",
    statsNTM: "Chuẩn nông thôn mới",
    orgTitle: "Sơ đồ Bộ máy hành chính xã Dang Kang",
    orgSubtitle: "Sơ đồ vận hành liên thông, đảm bảo tính thống nhất chỉ đạo từ cấp Đảng ủy đến giám sát của HĐND xã và điều hành hành chính thực thi nhiệm vụ chuyên môn của UBND xã:",
    leaderTitle: "Thông tin Lãnh đạo chủ chốt",
    leaderSubtitle: "Danh sách cán bộ lãnh đạo phụ trách, điều hành, có lịch tiếp nhận phản ánh, kiến nghị trực tiếp từ nhân dân:",
    responsibility: "Phạm vi trách nhiệm",
    workRoom: "Nơi làm việc",
    phone: "Di động",
    email: "Thư điện tử",
    east: "Phía Đông giáp xã Hòa Lễ",
    west: "Phía Tây giáp xã Cư Kty",
    south: "Phía Nam giáp dãy núi Chư Yang Sin",
    north: "Phía Bắc giáp sông Krông Ana",
    loading: "Đang nạp thông tin giới thiệu...",
  },
  en: {
    pageTitle: "GENERAL INTRODUCTION & ORGANIZATION STRUCTURE",
    pageSubtitle: "Learn about the geographic history and administrative system of Dang Kang commune, Krong Bong district",
    historyTitle: "Geographic & Historical Overview",
    statsArea: "Natural Area",
    statsPop: "Current Population",
    statsUnits: "Administrative Units",
    statsNTM: "New Rural Standards",
    orgTitle: "Administrative Machinery of Dang Kang Commune",
    orgSubtitle: "Interconnected operational diagram ensuring unified command from the Party Committee down to the supervision of the People's Council and administration of professional duties of the People's Committee:",
    leaderTitle: "Key Leadership Information",
    leaderSubtitle: "List of leading officials in charge of operations, with fixed hours for direct public feedback and petitions:",
    responsibility: "Scope of Responsibility",
    workRoom: "Office Location",
    phone: "Mobile Phone",
    email: "E-mail Address",
    east: "East borders Hoa Le commune",
    west: "West borders Cu Kty commune",
    south: "South borders Chu Yang Sin mountain range",
    north: "North borders Krong Ana river",
    loading: "Loading introduction details...",
  }
}

const DEFAULT_HISTORY_TEXT = {
  vi: "Xã Dang Kang là một đơn vị hành chính cấp xã nằm ở phía Tây Bắc của huyện Krông Bông, tỉnh Đắk Lắk. Với tổng diện tích đất tự nhiên hơn 2.450 ha, xã sở hữu vị trí địa lý kết nối giao thương nông sản quan trọng của huyện:\n\nĐịa hình của xã chủ yếu là các thung lũng xen lẫn đồi bát úp đặc trưng của vùng Tây Nguyên, đất đai trù phú phù hợp canh tác nông sản hàng hóa giá trị cao như cà phê, sầu riêng, cao su và lúa nước 2 vụ. Dân số toàn xã đạt khoảng 6.800 người với 8 dân tộc anh em cùng sinh sống hòa hợp, tạo nên bản sắc văn hóa vùng miền phong phú, đậm đà bản sắc.",
  en: "Dang Kang commune is a commune-level administrative unit located in the Northwest of Krong Bong district, Dak Lak province. With a total natural land area of more than 2,450 hectares, the commune holds an important trade position for local agricultural products:\n\nThe terrain of the commune mainly consists of valleys mixed with low hills characteristic of the Central Highlands, with fertile land suitable for cultivating high-value commercial crops such as coffee, durian, rubber, and double-crop wet rice. The commune's total population is about 6,800 people, with 8 ethnic groups living harmoniously, creating a rich and vibrant regional cultural identity."
}

const DEFAULT_ORG_SECTIONS = {
  vi: [
    {
      title: "ĐẢNG ỦY XÃ",
      desc: "Cơ quan lãnh đạo toàn diện mọi hoạt động chính trị, kinh tế, xã hội, an ninh quốc phòng tại địa phương.",
      details: ["Bí thư Đảng ủy xã", "Phó Bí thư Thường trực Đảng ủy", "Ủy viên Ban Thường vụ Đảng ủy", "Các Chi bộ trực thuộc thôn, buôn, trường học"]
    },
    {
      title: "HỘI ĐỒNG NHÂN DÂN",
      desc: "Cơ quan quyền lực nhà nước ở địa phương, đại diện cho ý chí, nguyện vọng và quyền làm chủ của nhân dân.",
      details: ["Chủ tịch Hội đồng nhân dân", "Phó Chủ tịch HĐND xã", "Ban Pháp chế HĐND", "Ban Kinh tế - Xã hội HĐND"]
    },
    {
      title: "ỦY BAN NHÂN DÂN",
      desc: "Cơ quan chấp hành của Hội đồng nhân dân, cơ quan hành chính nhà nước ở địa phương, quản lý điều hành toàn diện.",
      details: ["Chủ tịch Ủy ban nhân dân", "Các Phó Chủ tịch UBND xã", "Bộ phận Tiếp nhận & Trả kết quả (Một cửa)", "Công chức Chuyên môn nghiệp vụ"]
    },
    {
      title: "ỦY BAN MTTQ & ĐOÀN THỂ",
      desc: "Tập hợp lực lượng đại đoàn kết toàn dân tộc, phối hợp cùng chính quyền tổ chức thực hiện các phong trào thi đua.",
      details: ["Ủy ban Mặt trận Tổ quốc xã", "Hội Liên hiệp Phụ nữ xã", "Đoàn Thanh niên Cộng sản Hồ Chí Minh", "Hội Nông dân & Hội Cựu chiến binh"]
    }
  ],
  en: [
    {
      title: "COMMUNE PARTY COMMITTEE",
      desc: "The comprehensive leadership body for all political, economic, social, national security, and defense activities in the locality.",
      details: ["Party Committee Secretary", "Permanent Deputy Secretary", "Standing Committee Members", "Affiliated Party cells in villages and schools"]
    },
    {
      title: "PEOPLE'S COUNCIL",
      desc: "The local state power body representing the will, aspirations, and mastery rights of the citizens.",
      details: ["Chairman of People's Council", "Vice Chairman of People's Council", "Legal Affairs Committee", "Economic and Social Affairs Committee"]
    },
    {
      title: "PEOPLE'S COMMITTEE",
      desc: "The executive branch of the People's Council, acting as the local administrative state organ to manage comprehensive operations.",
      details: ["Chairman of People's Committee", "Vice Chairmen of People's Committee", "One-stop Reception & Result Return Department", "Specialized Professional Officials"]
    },
    {
      title: "FATHERLAND FRONT & ASSOCIATIONS",
      desc: "Rallying the great national unity block, collaborating with authorities to organize emulation movements.",
      details: ["Commune Fatherland Front Committee", "Women's Union", "Youth Union", "Farmers' Association & Veterans' Association"]
    }
  ]
}

const DEFAULT_LEADERS = {
  vi: [
    {
      name: "Nguyễn Văn Hồng",
      role: "Bí thư Đảng ủy - Chủ tịch HĐND xã",
      responsibility: "Chịu trách nhiệm lãnh đạo toàn diện công tác Đảng, công tác chính trị tư tưởng; chỉ đạo toàn bộ hoạt động giám sát, ban hành nghị quyết phát triển của Hội đồng nhân dân xã.",
      phone: "0914.281.xxx",
      email: "nvhong@krongbong.daklak.gov.vn",
      room: "Phòng 201 - Tầng 2, Trụ sở UBND xã"
    },
    {
      name: "Trần Quốc Tuấn",
      role: "Phó Bí thư Đảng ủy - Chủ tịch UBND xã",
      responsibility: "Lãnh đạo, chỉ đạo toàn diện công tác quản lý điều hành hành chính nhà nước; trực tiếp chỉ đạo quy hoạch phát triển kinh tế, thu chi ngân sách, cải cách thủ tục hành chính.",
      phone: "0905.112.xxx",
      email: "tqtuan@krongbong.daklak.gov.vn",
      room: "Phòng 102 - Tầng 1, Trụ sở UBND xã"
    },
    {
      name: "H'Yen Knul",
      role: "Phó Chủ tịch UBND xã",
      responsibility: "Phụ trách khối Văn hóa - Xã hội, Y tế, Giáo dục; trực tiếp chỉ đạo thực hiện các chính sách an sinh xã hội, giảm nghèo bền vững và công tác dân tộc thiểu số địa bàn.",
      phone: "0983.475.xxx",
      email: "hyenknul@krongbong.daklak.gov.vn",
      room: "Phòng 104 - Tầng 1, Trụ sở UBND xã"
    }
  ],
  en: [
    {
      name: "Nguyen Van Hong",
      role: "Party Secretary - Chairman of People's Council",
      responsibility: "Responsible for the comprehensive leadership of Party affairs and political-ideological education; directs all inspection activities and issues development resolutions for the People's Council.",
      phone: "0914.281.xxx",
      email: "nvhong@krongbong.daklak.gov.vn",
      room: "Room 201 - 2nd Floor, Commune HQ"
    },
    {
      name: "Tran Quoc Tuan",
      role: "Deputy Party Secretary - Chairman of People's Committee",
      responsibility: "Leads and comprehensively directs the administrative management of local government; directly oversees economic development planning, budget revenues/expenditures, and administrative procedural reform.",
      phone: "0905.112.xxx",
      email: "tqtuan@krongbong.daklak.gov.vn",
      room: "Room 102 - 1st Floor, Commune HQ"
    },
    {
      name: "H'Yen Knul",
      role: "Vice Chairwoman of People's Committee",
      responsibility: "In charge of Culture - Social affairs, Healthcare, and Education; directly oversees social security policies, sustainable poverty reduction, and ethnic minority affairs in the area.",
      phone: "0983.475.xxx",
      email: "hyenknul@krongbong.daklak.gov.vn",
      room: "Room 104 - 1st Floor, Commune HQ"
    }
  ]
}

export default function AboutPage() {
  const pathname = usePathname()

  // Resolve current active locale (vi / en)
  const currentLang = React.useMemo(() => {
    if (!pathname) return "vi"
    const segments = pathname.split("/").filter(Boolean)
    if (segments[0] === "en") return "en"
    return "vi"
  }, [pathname])

  const t = translations[currentLang] || translations.vi

  // Query configurations dynamically
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
    staleTime: 30 * 1000,
  })

  // Localized configuration fetchers
  const getConfigValue = React.useCallback((code: string, fallback: string) => {
    const found = (portalConfigData).find((c: any) => c.code === code)
    if (!found) return fallback

    if (found.name === "true" || found.name === "false") {
      return found.name
    }

    const trimmed = found.description ? found.description.trim() : ""
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed)
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
        // Parse issue fallback
      }
    }
    return found.description || found.name || fallback
  }, [portalConfigData, currentLang])

  const getConfigObject = React.useCallback((code: string, fallback: any) => {
    const found = (portalConfigData).find((c: any) => c.code === code)
    if (!found || !found.description) return fallback

    const trimmed = found.description.trim()
    if (!trimmed) return fallback

    // 1. JSON Array (starts with '[')
    if (trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed)
      } catch (e) {
        console.error(`Failed to parse array portal config ${code}:`, e)
        return fallback
      }
    }

    // 2. JSON Object (starts with '{')
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed === "object") {
          const trans = parsed.translations || parsed
          const val = trans[currentLang] || trans.vi || trans.en
          if (val !== undefined && val !== null) {
            if (typeof val === "string") {
              try {
                return JSON.parse(val)
              } catch (e) {
                return val
              }
            }
            return val
          }
          return parsed
        }
      } catch (e) {
        console.error(`Failed to parse object portal config ${code}:`, e)
        return fallback
      }
    }

    return fallback
  }, [portalConfigData, currentLang])

  // Resolve dynamic values
  const historyText = getConfigValue("about_history", "")
  const areaStat = getConfigValue("about_area", "")
  const popStat = getConfigValue("about_population", "")
  const subdivisionsStat = getConfigValue("about_subdivisions", "")
  const standardStat = getConfigValue("about_standard", "")

  const orgSections = getConfigObject("about_org_sections", [])
  const detailLeaders = getConfigObject("about_leaders", [])

  const useCustomAboutLayout = getConfigValue("use_custom_about_layout", "false") === "true"
  const customAboutLayout = getConfigObject("custom_about_layout", [])

  // Split historyText by double newlines for paragraph separation
  const historyParagraphs = React.useMemo(() => {
    return historyText.split("\n\n").filter(Boolean)
  }, [historyText])

  if (useCustomAboutLayout && Array.isArray(customAboutLayout) && customAboutLayout.length > 0) {
    return (
      <div className="flex flex-col gap-6 sm:gap-10 md:gap-14 animate-fade-in select-none">
        {/* Page Title Header banner */}
        <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-[#b91c1c] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-wide">
            {t.pageTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {t.pageSubtitle}
          </p>
        </div>

        <DynamicPageRenderer layoutSchema={customAboutLayout} currentLang={currentLang} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-10 md:gap-14 animate-fade-in select-none">

      {/* Page Title Header banner */}
      <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-[#b91c1c] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-wide">
          {t.pageTitle}
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          {t.pageSubtitle}
        </p>
      </div>

      {/* Section 1: Giới thiệu chung (#chung) */}
      {historyText && (
        <section id="chung" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <History className="w-5 h-5 text-[#b91c1c]" />
              <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                {t.historyTitle}
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold flex flex-col gap-4">
              {historyParagraphs.map((paragraph: string, index: number) => (
                <React.Fragment key={index}>
                  <p>{paragraph}</p>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Demographic statistics sidebar */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {areaStat && (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-[#b91c1c] flex items-center justify-center border border-red-100 dark:border-red-900/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
                  {t.statsArea}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">{areaStat}</span>
              </div>
            )}

            {popStat && (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
                  {t.statsPop}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">{popStat}</span>
              </div>
            )}

            {subdivisionsStat && (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 flex items-center justify-center border border-sky-100 dark:border-sky-900/30">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
                  {t.statsUnits}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  {subdivisionsStat}
                </span>
              </div>
            )}

            {standardStat && (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center border border-amber-100 dark:border-amber-900/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
                  {t.statsNTM}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  {standardStat}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section 2: Cơ cấu tổ chức (#co-cau) */}
      {orgSections && orgSections.length > 0 && (
        <section id="co-cau" className="scroll-mt-24 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Workflow className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
              {t.orgTitle}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-semibold leading-relaxed">
            {t.orgSubtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {orgSections.map((section: any, index: number) => (
              <div
                key={section.title || index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-3 sm:gap-4 group hover:border-[#b91c1c] hover:shadow-md transition-all"
              >
                <div className="flex flex-col">
                  <h4 className="text-xs sm:text-sm font-black text-[#b91c1c] dark:text-[#fbc02d] tracking-wide uppercase">{section.title}</h4>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1">{section.desc}</p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex flex-col gap-2">
                  {Array.isArray(section.details) && section.details.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Thông tin lãnh đạo (#lanh-dao) */}
      {detailLeaders && detailLeaders.length > 0 && (
        <section id="lanh-dao" className="scroll-mt-24 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <UserSquare2 className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
              {t.leaderTitle}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-semibold leading-relaxed">
            {t.leaderSubtitle}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
            {detailLeaders.map((leader: any, index: number) => (
              <div
                key={leader.name || index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-4 sm:p-5 border-b border-slate-150 dark:border-slate-850 flex items-center gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-950/45 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#b91c1c]/10 text-[#b91c1c] dark:text-[#fbc02d] flex items-center justify-center font-bold text-lg shadow-inner">
                    {(leader.name || "A").split(' ').pop()?.[0]}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{leader.name}</h4>
                    <span className="text-[10px] text-[#b91c1c] dark:text-[#fbc02d] font-bold uppercase tracking-wider truncate">{leader.role}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      {t.responsibility}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      {leader.responsibility}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-2.5 font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{t.workRoom}: {leader.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`tel:${leader.phone}`} className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d]">{t.phone}: {leader.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${leader.email}`} className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d] break-all">{t.email}: {leader.email}</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!historyText && (!orgSections || orgSections.length === 0) && (!detailLeaders || detailLeaders.length === 0) && (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs font-semibold">
          Chưa có thông tin giới thiệu từ máy chủ CMS.
        </div>
      )}

    </div>
  )
}
