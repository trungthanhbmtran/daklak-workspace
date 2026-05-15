"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { resolveMediaUrl } from "@/lib/utils"
import {
  Building2,
  MapPin,
  Users2,
  ShieldCheck,
  FileSpreadsheet,
  Workflow,
  CheckCircle2,
  UserSquare2,
  CalendarDays,
  Phone,
  Mail,
  MapIcon,
  Info,
  ChevronRight,
  Send,
  Clock,
  Home,
  Images,
  Newspaper,
  Landmark,
  FolderOpen,
  Film,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRight,
  Star,
  AlertCircle,
  Play,
  FileSearch,
  MessageSquare
} from "lucide-react"
import * as lucideIcons from "lucide-react"

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

const getLocalizedField = (obj: any, baseField: string, lang: string): string => {
  if (!obj) return ""
  if (lang === "en") {
    const enValue = obj[baseField + "En"] || obj[baseField + "_en"]
    if (enValue) return enValue
  }
  return obj[baseField] || ""
}

// ----------------------------------------------------------------------
// NEW SUB-COMPONENTS FOR PORTAL BLOCKS
// ----------------------------------------------------------------------
function HeroSliderWidget({ banners, currentLang, data }: { banners: any[], currentLang: string, data?: any }) {
  const [activeIdx, setActiveIdx] = React.useState(0)
  const displayBanners = React.useMemo(() => {
    if (banners && banners.length > 0) {
      const activeBanners = banners.filter(b => b.status !== false).slice(0, 5)
      if (activeBanners.length > 0) return activeBanners
    }
    return [
      {
        id: "mock-1",
        name: currentLang === "en" ? "WELCOME TO DANG KANG COMMUNE PORTAL" : "CHÀO MỪNG ĐẾN VỚI CỔNG THÔNG TIN XÃ DANG KANG",
        description: currentLang === "en" ? "Solidarity - Innovation - Rapid & Sustainable Development" : "Đoàn kết - Đổi mới - Phát triển nhanh và bền vững",
        imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
        customUrl: "/gioi-thieu"
      },
      {
        id: "mock-2",
        name: currentLang === "en" ? "NATIONAL DIGITAL TRANSFORMATION" : "ĐẨY MẠNH CHUYỂN ĐỔI SỐ QUỐC GIA",
        description: currentLang === "en" ? "Serving citizens and enterprises with integrity and professionalism" : "Phục vụ người dân và doanh nghiệp minh bạch, chuyên nghiệp",
        imageUrl: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80",
        customUrl: "/thu-tuc"
      }
    ]
  }, [banners, currentLang, data])

  React.useEffect(() => {
    if (displayBanners.length <= 1) return
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % displayBanners.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [displayBanners.length])

  if (displayBanners.length === 0) return null

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-200/20 group select-none bg-slate-900">
      {displayBanners.map((banner: any, idx: number) => {
        const isActive = idx === activeIdx
        return (
          <div
            key={banner.id || idx}
            className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center ${isActive ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
            <img
              src={resolveMediaUrl(banner.imageUrl)}
              alt={banner.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-6 sm:p-10 md:p-14 max-w-3xl">
              <span className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-widest uppercase mb-2 flex items-center gap-1.5 drop-shadow">
                <Star className="w-4 h-4 fill-amber-400" /> {currentLang === "en" ? "Featured Campaign" : "Chiến dịch trọng điểm"}
              </span>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight uppercase drop-shadow-md">
                {banner.name}
              </h2>
              {banner.description && (
                <p className="text-slate-200 font-medium text-xs sm:text-base mt-3 line-clamp-2 max-w-xl drop-shadow">
                  &quot;{banner.description}&quot;
                </p>
              )}
              <div className="mt-6">
                <Link
                  href={banner.customUrl || "/tin-tuc"}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all transform hover:scale-105"
                >
                  {currentLang === "en" ? "Explore Details" : "Xem chi tiết"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )
      })}

      {/* Carousel dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
        {displayBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeIdx ? "bg-amber-400 w-6" : "bg-white/50 hover:bg-white"}`}
          />
        ))}
      </div>
    </div>
  )
}

function FeaturedNewsWidget({ posts, currentLang, data }: { posts: any[], currentLang: string, data?: any }) {
  const displayPosts = React.useMemo(() => {
    let filtered = posts || []

    // Filter by category if selectedCategory is set in data
    if (data?.selectedCategory) {
      filtered = filtered.filter((p: any) =>
        p.category?.slug === data.selectedCategory ||
        p.category?.code === data.selectedCategory ||
        p.categoryId === data.selectedCategory
      )
    }

    // If empty (either no posts at all, or none in this category), provide default mocks
    if (filtered.length === 0) {
      return [
        {
          id: "news-1",
          title: currentLang === "en" ? "Implementation of sustainable agricultural programs in Dang Kang" : "Triển khai chương trình phát triển nông nghiệp bền vững tại xã Dang Kang",
          description: currentLang === "en" ? "Supporting local farmers with high-yield coffee and pepper cultivation techniques." : "Hỗ trợ bà con nông dân kỹ thuật canh tác cà phê và hồ tiêu đạt năng suất cao.",
          thumbnail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
          publishedAt: new Date().toISOString()
        },
        {
          id: "news-2",
          title: currentLang === "en" ? "Notice on registration of one-stop administrative records via digital portal" : "Thông báo về việc đăng ký hồ sơ hành chính một cửa qua cổng điện tử",
          description: currentLang === "en" ? "Streamlining paperwork verification and reducing physical waiting queues." : "Tối ưu hóa quy trình xác minh giấy tờ và giảm bớt thời gian chờ đợi tại trụ sở.",
          thumbnail: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80",
          publishedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }

    return filtered.slice(0, data?.limit || 4)
  }, [posts, currentLang, data])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {displayPosts.map((post: any) => {
        const title = getLocalizedField(post, "title", currentLang) || post.title || ""
        const excerpt = getLocalizedField(post, "description", currentLang) || post.description || ""
        const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(currentLang === "en" ? "en-US" : "vi-VN") : "14/05/2026"

        return (
          <Link
            key={post.id}
            href={`/tin-tuc/${post.slug || post.id}`}
            className="group bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-red-500/50 transition-all flex flex-col sm:flex-row"
          >
            <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
              <img
                src={post.thumbnail ? resolveMediaUrl(post.thumbnail) : "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80"}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-[9px] px-2 py-1 rounded shadow uppercase tracking-wider">
                {currentLang === "en" ? "News" : "Tin tức"}
              </div>
            </div>
            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dateStr}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white leading-snug group-hover:text-red-600 transition-colors line-clamp-2 text-xs sm:text-sm">
                  {title}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                  {excerpt}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-red-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>{currentLang === "en" ? "Read more" : "Đọc tiếp"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function PublicServicesWidget({ currentLang }: { currentLang: string }) {
  const services = [
    {
      title: currentLang === "en" ? "Online Public Services" : "Dịch vụ công trực tuyến",
      desc: currentLang === "en" ? "Submit administrative procedural dossiers online 24/7." : "Nộp hồ sơ thủ tục hành chính trực tuyến 24/7.",
      icon: FileText,
      link: "/thu-tuc",
      color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
    },
    {
      title: currentLang === "en" ? "Dossier Status Lookup" : "Tra cứu hồ sơ một cửa",
      desc: currentLang === "en" ? "Check the handling progress of submitted documents." : "Kiểm tra tiến độ giải quyết hồ sơ đã nộp.",
      icon: FileSearch,
      link: "/thu-tuc#tra-cuu",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900"
    },
    {
      title: currentLang === "en" ? "Citizen Feedback" : "Phản ánh kiến nghị",
      desc: currentLang === "en" ? "Submit formal recommendations and service evaluations." : "Gửi ý kiến đóng góp và đánh giá thái độ phục vụ.",
      icon: MessageSquare,
      link: "/tuong-tac",
      color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
    },
    {
      title: currentLang === "en" ? "Legal Assistance" : "Hỏi đáp pháp luật",
      desc: currentLang === "en" ? "Get authoritative legal explanations regarding land and civil status." : "Giải đáp thắc mắc về đất đai, hộ tịch, quy hoạch.",
      icon: ShieldCheck,
      link: "/tuong-tac#gui-cau-hoi",
      color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {services.map((svc, idx) => {
        const Icon = svc.icon
        return (
          <Link
            key={idx}
            href={svc.link}
            className={`p-5 rounded-2xl border transition-all hover:scale-[102%] hover:shadow-md flex flex-col justify-between gap-4 ${svc.color}`}
          >
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-900 dark:text-white uppercase text-xs tracking-wide">
                {svc.title}
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                {svc.desc}
              </p>
            </div>
            <div className="flex items-center gap-1 font-black text-[10px] tracking-wider uppercase opacity-80">
              <span>{currentLang === "en" ? "Access Feature" : "Truy cập ngay"}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function LegalDocumentsWidget({ posts, currentLang, data }: { posts: any[], currentLang: string, data?: any }) {
  const docs = React.useMemo(() => {
    let filtered = posts || []

    // Filter by specific category or general 'van-ban'
    if (data?.selectedCategory) {
      filtered = filtered.filter((p: any) => p.category?.slug === data.selectedCategory)
    } else {
      filtered = filtered.filter((p: any) => p.category?.slug === "van-ban" || p.category?.name?.toLowerCase().includes("văn bản"))
    }

    if (filtered.length > 0) {
      return filtered.slice(0, data?.limit || 5)
    }
    return [
      { id: "doc-1", title: currentLang === "en" ? "Resolution on communal economic targets for 2026" : "Nghị quyết về chỉ tiêu phát triển kinh tế - xã hội xã Dang Kang năm 2026", codeNum: "12/NQ-HĐND", dateStr: "10/01/2026" },
      { id: "doc-2", title: currentLang === "en" ? "Decision promulgating regulations on one-stop office workflow" : "Quyết định ban hành quy chế hoạt động của bộ phận một cửa cấp xã", codeNum: "45/QĐ-UBND", dateStr: "15/02/2026" },
      { id: "doc-3", title: currentLang === "en" ? "Plan for disease prevention in livestock and poultry" : "Kế hoạch phòng chống dịch bệnh gia súc, gia cầm trên địa bàn xã", codeNum: "08/KH-UBND", dateStr: "22/03/2026" }
    ]
  }, [posts, currentLang, data])

  return (
    <div className="space-y-3">
      {docs.map((doc: any, idx: number) => {
        const title = getLocalizedField(doc, "title", currentLang) || doc.title || ""
        const codeNum = doc.codeNum || "QĐ/UBND"
        const dateStr = doc.dateStr || (doc.publishedAt ? new Date(doc.publishedAt).toLocaleDateString() : "14/05/2026")

        return (
          <div
            key={doc.id || idx}
            className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between gap-4 hover:border-red-500 transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0 font-extrabold text-xs">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-black tracking-wider">
                    {codeNum}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {dateStr}
                  </span>
                </div>
                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug truncate">
                  {title}
                </h5>
              </div>
            </div>

            <Link
              href={`/van-ban/${doc.slug || doc.id}`}
              className="inline-flex items-center justify-center font-extrabold text-[10px] tracking-wider uppercase border border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/40 dark:text-slate-200 dark:hover:text-red-400 px-3 py-1.5 rounded-lg shrink-0 transition-colors shadow-sm bg-white dark:bg-slate-900"
            >
              {currentLang === "en" ? "View Doc" : "Xem văn bản"}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

function MediaGalleryWidget({ posts, currentLang, data }: { posts: any[], currentLang: string, data?: any }) {
  const mediaItems = [
    { title: "Hội nghị tổng kết phong trào thi đua toàn dân đoàn kết", img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80", type: "photo" },
    { title: "Ra quân dọn dẹp vệ sinh môi trường đường làng ngõ xóm", img: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80", type: "photo" },
    { title: "Phóng sự: Nông dân Dang Kang vươn lên làm giàu từ cây tiêu", img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80", type: "video" },
    { title: "Hướng dẫn thực hiện dịch vụ công trực tuyến mức độ 4", img: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80", type: "video" }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {mediaItems.map((item, idx) => (
        <div key={idx} className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 aspect-video shadow-sm">
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
            <div className="flex items-center gap-1.5 mb-1 text-[9px] font-black uppercase tracking-wider text-amber-400">
              {item.type === "video" ? <Play className="w-3 h-3 fill-amber-400" /> : <Images className="w-3 h-3" />}
              <span>{item.type === "video" ? "Video Clip" : "Album Ảnh"}</span>
            </div>
            <h5 className="text-white text-xs font-bold line-clamp-2 leading-snug drop-shadow">
              {item.title}
            </h5>
          </div>
        </div>
      ))}
    </div>
  )
}

function FaqAccordionWidget({ questions, currentLang, data }: { questions: any[], currentLang: string, data?: any }) {
  const [expandedIdx, setExpandedIdx] = React.useState<number | null>(0)
  const displayQa = React.useMemo(() => {
    if (questions && questions.length > 0) {
      return questions.slice(0, 5)
    }
    return [
      { q: currentLang === "en" ? "What documents are required to register birth registration for newborn?" : "Thủ tục đăng ký khai sinh cho trẻ sơ sinh cần chuẩn bị những giấy tờ gì?", a: currentLang === "en" ? "Parents need to bring Certificate of Birth from hospital, marriage certificate, and identity cards to commune one-stop desk." : "Cha mẹ cần mang theo Giấy chứng sinh của bệnh viện, Giấy đăng ký kết hôn và CCCD đến bộ phận một cửa UBND xã để được giải quyết ngay." },
      { q: currentLang === "en" ? "How many days does it take to process land use right transfer?" : "Thời gian giải quyết thủ tục chuyển nhượng quyền sử dụng đất là bao lâu?", a: currentLang === "en" ? "According to regulations, standard verification takes 10-15 working days from valid dossier submission." : "Theo quy định, thời gian thẩm định hồ sơ chuẩn là từ 10-15 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ." },
      { q: currentLang === "en" ? "What is the schedule for commune leadership direct citizen reception?" : "Lịch tiếp công dân trực tiếp của lãnh đạo UBND xã vào ngày nào?", a: currentLang === "en" ? "Commune chairman directly receives citizens every Thursday morning from 08:00 to 11:30 at Room 102." : "Chủ tịch UBND xã trực tiếp tiếp công dân định kỳ vào sáng Thứ 5 hàng tuần từ 08:00 đến 11:30 tại Phòng 102 trụ sở." }
    ]
  }, [questions, currentLang, data])

  return (
    <div className="space-y-3">
      {displayQa.map((qa: any, idx: number) => {
        const isExpanded = expandedIdx === idx
        const qText = getLocalizedField(qa, "title", currentLang) || qa.q || ""
        const aText = getLocalizedField(qa, "answerContent", currentLang) || qa.a || ""

        return (
          <div
            key={idx}
            className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 transition-all"
          >
            <button
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <HelpCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="truncate">{qText}</span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium animate-fade-in">
                {aText}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ExternalLinksWidget({ currentLang }: { currentLang: string }) {
  const links = [
    { title: "Cổng Dịch vụ công Quốc gia", url: "https://dichvucong.gov.vn", logo: "🏛️" },
    { title: "Cổng thông tin Chính phủ", url: "https://chinhphu.vn", logo: "🇻🇳" },
    { title: "UBND Tỉnh Đắk Lắk", url: "https://daklak.gov.vn", logo: "🐘" },
    { title: "Huyện Krông Bông", url: "https://krongbong.daklak.gov.vn", logo: "🌲" }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((lnk, idx) => (
        <a
          key={idx}
          href={lnk.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center gap-3 group hover:border-red-500 hover:shadow-sm transition-all"
        >
          <span className="text-2xl shrink-0 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">{lnk.logo}</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
              {lnk.title}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
              <span>{lnk.url.replace("https://", "")}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}

// ----------------------------------------------------------------------
// RECURSIVE LEXICAL RENDERER
// ----------------------------------------------------------------------
function renderLexicalNode(node: any, index: number, currentLang: string): React.ReactNode {
  if (!node) return null

  // Text Nodes
  if (node.type === "text") {
    let element: React.ReactNode = node.text || ""

    // Format bits matching Lexical styles
    const isBold = (node.format & 1) !== 0
    const isItalic = (node.format & 2) !== 0
    const isUnderline = (node.format & 8) !== 0
    const isStrikethrough = (node.format & 4) !== 0
    const isCode = (node.format & 16) !== 0

    if (isBold) element = <strong className="font-bold">{element}</strong>
    if (isItalic) element = <em className="italic">{element}</em>
    if (isUnderline) element = <u className="underline">{element}</u>
    if (isStrikethrough) element = <span className="line-through">{element}</span>
    if (isCode) element = <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">{element}</code>

    return <span key={index}>{element}</span>
  }

  const renderChildren = () => {
    return (node.children || []).map((child: any, idx: number) => renderLexicalNode(child, idx, currentLang))
  }

  // Structural Blocks
  switch (node.type) {
    case "root":
      return <div key={index} className="space-y-4">{renderChildren()}</div>
    case "paragraph":
      return <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">{renderChildren()}</p>
    case "heading": {
      const Tag = (node.tag || "h2") as any
      const headingClasses: Record<string, string> = {
        h1: "text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide border-b pb-2",
        h2: "text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide",
        h3: "text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 uppercase",
      }
      return (
        <Tag key={index} className={`${headingClasses[node.tag] || headingClasses.h2} mt-4 mb-2`}>
          {renderChildren()}
        </Tag>
      )
    }
    case "list": {
      const Tag = node.tag === "ol" || node.listType === "number" ? "ol" : "ul"
      const listClass = Tag === "ol" ? "list-decimal pl-5 space-y-1.5" : "list-disc pl-5 space-y-1.5"
      return <Tag key={index} className={`${listClass} text-slate-700 dark:text-slate-300 text-xs sm:text-sm`}>{renderChildren()}</Tag>
    }
    case "listitem":
      return <li key={index} className="leading-relaxed">{renderChildren()}</li>
    case "link":
      return (
        <a
          key={index}
          href={node.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 dark:text-[#fbc02d] hover:underline font-bold"
        >
          {renderChildren()}
        </a>
      )
    case "quote":
      return (
        <blockquote key={index} className="border-l-4 border-red-600/20 dark:border-red-600/40 pl-4 italic my-4 text-slate-600 dark:text-slate-400">
          {renderChildren()}
        </blockquote>
      )
    case "image":
      return (
        <div key={index} className="my-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
          <img
            src={resolveMediaUrl(node.src)}
            alt={node.altText || ""}
            className="w-full h-auto object-cover"
          />
          {node.caption && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 text-center text-[11px] font-medium text-slate-500 border-t border-slate-100 dark:border-slate-850">
              {typeof node.caption === "object" ? node.caption.text : node.caption}
            </div>
          )}
        </div>
      )
    case "linebreak":
      return <br key={index} />
    default:
      if (node.children && node.children.length > 0) {
        return <div key={index}>{renderChildren()}</div>
      }
      return null
  }
}

interface DynamicPageRendererProps {
  layoutSchema: any[]
  currentLang: string
}

export function DynamicPageRenderer({ layoutSchema, currentLang }: DynamicPageRendererProps) {
  const { data: portalConfigData } = useQuery({
    queryKey: ["public-portal-configs"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/portal-configs")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        console.error("Failed to fetch portal configurations in renderer", e)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fetch Banners & Posts for dynamic new widgets
  const { data: bannersData } = useQuery({
    queryKey: ["public-banners"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/banners")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: postsData } = useQuery({
    queryKey: ["public-posts"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/posts")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: questionsData } = useQuery({
    queryKey: ["public-questions", currentLang],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/interactions/questions?limit=10")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: employeesData } = useQuery({
    queryKey: ["public-employees"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/employees")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: orgUnitsData } = useQuery({
    queryKey: ["public-org-units"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/org-units")
        return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      } catch (e) {
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
  })

  // Localized configuration fetchers
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
    return found.description || found.name || fallback
  }, [portalConfigData, currentLang])

  const getConfigObject = React.useCallback((code: string, fallback: any) => {
    const found = (portalConfigData || []).find((c: any) => c.code === code)
    if (!found) return fallback

    if (found.description && found.description.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(found.description)
        if (parsed && typeof parsed === "object") {
          const trans = parsed.translations || parsed
          const val = trans[currentLang] || trans.vi
          if (val) {
            if (typeof val === "string") {
              try {
                return JSON.parse(val)
              } catch (e) {
                console.error("Inner array parse issue", e)
              }
            } else if (Array.isArray(val)) {
              return val
            }
          }
        }
      } catch (e) {
        console.error("Outer translation list parse issue", e)
      }
    }
    return fallback
  }, [portalConfigData, currentLang])

  // Map state
  const activeCommuneZones = React.useMemo(() => {
    const cmsZones = getConfigObject("commune_zones", [])
    if (!Array.isArray(cmsZones) || cmsZones.length === 0) {
      return COMMUNE_ZONES
    }
    return COMMUNE_ZONES.map(staticZone => {
      const cmsZone = cmsZones.find((z: any) => z.id === staticZone.id)
      if (cmsZone) {
        return {
          ...staticZone,
          name: cmsZone.name || staticZone.name,
          area: cmsZone.area || staticZone.area,
          pop: cmsZone.pop || staticZone.pop
        }
      }
      return staticZone
    })
  }, [portalConfigData, currentLang, getConfigObject])

  const [selectedZoneId, setSelectedZoneId] = React.useState<string>("T3")
  const activeZone = React.useMemo(() => {
    return activeCommuneZones.find(z => z.id === selectedZoneId) || activeCommuneZones[2] || null
  }, [activeCommuneZones, selectedZoneId])

  // Form states
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !message) return
    setSubmitted(true)
    setSubject("")
    setMessage("")
  }

  // Safe JSON Lexical Parsing & Render
  const renderLexicalRichText = (rawJson: string | undefined) => {
    if (!rawJson) return null
    try {
      const parsed = JSON.parse(rawJson)
      if (parsed && parsed.root) {
        return renderLexicalNode(parsed.root, 0, currentLang)
      }
    } catch (e) {
      // Return raw fallback text split into lines
      return (
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
          {rawJson.split("\n\n").map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )
    }
    return null
  }

  const bannersList = Array.isArray(bannersData) ? bannersData : (bannersData?.data || [])
  const postsList = Array.isArray(postsData) ? postsData : (postsData?.data || [])
  const questionsList = Array.isArray(questionsData) ? questionsData : (questionsData?.data || [])
  const allEmployees = Array.isArray(employeesData) ? employeesData : (employeesData?.data || [])
  const allOrgUnits = Array.isArray(orgUnitsData) ? orgUnitsData : (orgUnitsData?.data || [])

  const finalLayout = Array.isArray(layoutSchema) ? layoutSchema : (layoutSchema && typeof layoutSchema === 'object' && (layoutSchema as any).rows ? (layoutSchema as any).rows : [])

  if (finalLayout.length === 0) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {finalLayout.map((row: any, rIdx: number) => (
        <div 
          key={row.rowId || rIdx} 
          className={`grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start transition-all ${row.settings?.paddingTop || 'py-8'} ${row.settings?.paddingBottom || ''} ${row.settings?.borderRadius || 'rounded-none'}`}
          style={{
            backgroundColor: row.settings?.backgroundColor,
            backgroundImage: row.settings?.backgroundImage ? `url(${resolveMediaUrl(row.settings.backgroundImage)})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: row.settings?.textColor,
          }}
        >
          {row.columns?.map((col: any, cIdx: number) => (
            <div key={col.id || cIdx} className={col.colSpan || "lg:col-span-12"}>
              <div className="space-y-6">
                {col.widgets?.map((widget: any, wIdx: number) => {
                  const widgetTitle = widget.title?.[currentLang] || widget.title?.vi || ""
                  const showTitle = widget.data?.showTitle ?? true
                  const isFullWidth = widget.data?.fullWidth ?? false

                  return (
                    <div
                      key={widget.id || wIdx}
                      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${isFullWidth ? 'p-0 border-none bg-transparent dark:bg-transparent' : 'p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm'} flex flex-col gap-4`}
                    >
                      {/* Widget Header Banner */}
                      {widgetTitle && showTitle && (
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="w-1.5 h-4 bg-red-600 rounded-sm" />
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                            {widgetTitle}
                          </h4>
                        </div>
                      )}

                      {/* LEXICAL RICH TEXT WIDGET */}
                      {widget.type === "LEXICAL_RICH_TEXT" && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {renderLexicalRichText(widget.content?.[currentLang] || widget.content?.vi)}
                        </div>
                      )}

                      {/* HERO SLIDER WIDGET */}
                      {widget.type === "HERO_SLIDER" && (
                        <HeroSliderWidget banners={bannersList} currentLang={currentLang} data={widget.data} />
                      )}

                      {/* FEATURED NEWS WIDGET */}
                      {widget.type === "FEATURED_NEWS" && (
                        <FeaturedNewsWidget posts={postsList} currentLang={currentLang} data={widget.data} />
                      )}

                      {/* PUBLIC SERVICES WIDGET */}
                      {widget.type === "PUBLIC_SERVICES" && (
                        <PublicServicesWidget currentLang={currentLang} />
                      )}

                      {/* LEGAL DOCUMENTS WIDGET */}
                      {widget.type === "LEGAL_DOCUMENTS" && (
                        <LegalDocumentsWidget posts={postsList} currentLang={currentLang} data={widget.data} />
                      )}

                      {/* PHOTO & VIDEO GALLERY WIDGET */}
                      {widget.type === "PHOTO_VIDEO_GALLERY" && (
                        <MediaGalleryWidget posts={postsList} currentLang={currentLang} data={widget.data} />
                      )}

                      {/* FAQ ACCORDION WIDGET */}
                      {widget.type === "FAQ_ACCORDION" && (
                        <FaqAccordionWidget questions={questionsList} currentLang={currentLang} data={widget.data} />
                      )}

                      {/* EXTERNAL LINKS WIDGET */}
                      {widget.type === "EXTERNAL_LINKS" && (
                        <ExternalLinksWidget currentLang={currentLang} />
                      )}

                      {/* STATISTICS GRID WIDGET */}
                      {widget.type === "STATISTICS_GRID" && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {(widget.data?.items || [
                            { label: currentLang === "en" ? "Natural Area" : "Diện tích tự nhiên", value: getConfigValue("about_area", "2,452.8 Ha"), icon: "Building2", color: "text-red-600" },
                            { label: currentLang === "en" ? "Population" : "Dân cư", value: getConfigValue("about_population", "6.842"), icon: "Users2", color: "text-blue-600" },
                            { label: currentLang === "en" ? "Subdivisions" : "Đơn vị hành chính", value: getConfigValue("about_subdivisions", "8 Thôn, Buôn"), icon: "FileSpreadsheet", color: "text-sky-600" },
                            { label: currentLang === "en" ? "Standards" : "Chuẩn nông thôn mới", value: getConfigValue("about_standard", "Đạt 19/19"), icon: "ShieldCheck", color: "text-amber-600" }
                          ]).map((item: any, i: number) => {
                            const Icon = (lucideIcons as any)[item.icon] || Building2
                            return (
                              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex flex-col items-center text-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color || 'text-slate-600'} bg-white dark:bg-slate-900 shadow-sm`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-2 tracking-wide">
                                  {item.label}
                                </span>
                                <span className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                  {item.value}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* ORG SECTIONS DIRECTORY WIDGET */}
                      {widget.type === "ORG_SECTIONS_DIRECTORY" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(widget.data?.selectedUnits && widget.data.selectedUnits.length > 0 ? widget.data.selectedUnits : getConfigObject("about_org_sections", DEFAULT_ORG_SECTIONS[currentLang as "vi" | "en" || "vi"])).map((section: any, idx: number) => (
                            <div
                              key={section.title || idx}
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex flex-col gap-3 group hover:border-[#b91c1c] transition-all"
                            >
                              <div>
                                <h5 className="text-xs font-black text-red-600 dark:text-[#fbc02d] uppercase tracking-wide">
                                  {section.title}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">
                                  {section.desc}
                                </p>
                              </div>
                              <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex flex-col gap-1.5">
                                {Array.isArray(section.details) && section.details.map((item: string, i: number) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* LEADERSHIP LIST WIDGET */}
                      {widget.type === "LEADERSHIP_LIST" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(() => {
                            let leaders = []
                            if (Array.isArray(widget.data?.selectedEmployeeIds) && widget.data.selectedEmployeeIds.length > 0) {
                              leaders = allEmployees.filter((emp: any) => widget.data.selectedEmployeeIds.includes(emp.id)).map((emp: any) => ({
                                name: getLocalizedField(emp, "fullName", currentLang),
                                role: getLocalizedField(emp, "roleName", currentLang),
                                responsibility: getLocalizedField(emp, "jobDescription", currentLang),
                                phone: emp.phoneNumber || "09xx.xxx.xxx",
                                email: emp.email || "cán bộ@daklak.gov.vn",
                                room: emp.officeRoom || "Trụ sở UBND xã"
                              }))
                            } else if (widget.data?.selectedLeaders && widget.data.selectedLeaders.length > 0) {
                              leaders = widget.data.selectedLeaders
                            } else {
                              leaders = getConfigObject("about_leaders", DEFAULT_LEADERS[currentLang as "vi" | "en" || "vi"])
                            }

                            return leaders.map((leader: any, idx: number) => (
                              <div
                                key={leader.name || idx}
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden flex flex-col"
                              >
                                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5 bg-slate-100/30 dark:bg-slate-900/40">
                                  <div className="w-9 h-9 rounded-full bg-red-600/10 text-red-600 dark:text-[#fbc02d] flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                                    {(leader.name || "A").split(' ').pop()?.[0]}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">{leader.name}</h5>
                                    <span className="text-[9px] text-red-600 dark:text-[#fbc02d] font-bold uppercase tracking-wider truncate mt-0.5">{leader.role}</span>
                                  </div>
                                </div>

                                <div className="p-3.5 flex-1 flex flex-col gap-3 text-[11px]">
                                  <div className="flex flex-col gap-1 flex-1">
                                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                                      <CalendarDays className="w-3 h-3 text-slate-400" />
                                      {currentLang === "en" ? "Scope of Responsibility" : "Phạm vi trách nhiệm"}
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                                      {leader.responsibility}
                                    </p>
                                  </div>

                                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex flex-col gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>{currentLang === "en" ? "Office Location" : "Nơi làm việc"}: {leader.room}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <a href={`tel:${leader.phone}`} className="hover:text-red-600">{currentLang === "en" ? "Mobile" : "Di động"}: {leader.phone}</a>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <a href={`mailto:${leader.email}`} className="hover:text-red-600 break-all">{currentLang === "en" ? "E-mail Address" : "Thư điện tử"}: {leader.email}</a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                      {/* ORG SECTIONS DIRECTORY WIDGET */}
                      {widget.type === "ORG_SECTIONS_DIRECTORY" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(() => {
                            let sections = []
                            if (Array.isArray(widget.data?.selectedUnitIds) && widget.data.selectedUnitIds.length > 0) {
                              sections = allOrgUnits.filter((unit: any) => widget.data.selectedUnitIds.includes(unit.id)).map((unit: any) => ({
                                title: getLocalizedField(unit, "name", currentLang),
                                desc: getLocalizedField(unit, "description", currentLang),
                                details: [
                                  `${currentLang === 'en' ? 'Address' : 'Địa chỉ'}: ${unit.address || 'UBND Xã'}`,
                                  `${currentLang === 'en' ? 'Email' : 'Email'}: ${unit.email || 'xadangkang@daklak.gov.vn'}`,
                                ]
                              }))
                            } else {
                              sections = DEFAULT_ORG_SECTIONS[currentLang as "vi" | "en" || "vi"]
                            }

                            return sections.map((section: any, idx: number) => (
                              <div
                                key={section.title || idx}
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-xl flex flex-col gap-3"
                              >
                                <div className="flex flex-col gap-1.5 min-w-0">
                                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate tracking-wide">
                                    {section.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                                    {section.desc}
                                  </p>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex flex-col gap-1.5">
                                  {Array.isArray(section.details) && section.details.map((item: string, i: number) => (
                                    <div key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}



                      {/* COMMUNE INTERACTIVE MAP WIDGET */}
                      {widget.type === "COMMUNE_INTERACTIVE_MAP" && (
                        <div className="flex flex-col gap-4">
                          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                            {currentLang === "en"
                              ? "Interactive vector map simulating 8 village subdivisions of Dang Kang Commune. Click on any zone to view stats:"
                              : "Bản đồ tương tác 8 thôn, buôn của địa bàn xã Dang Kang. Click vào phân vùng để xem chi tiết:"}
                          </p>

                          <div className="w-full flex flex-col sm:flex-row gap-6 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                            <div className="flex-1 w-full max-w-[420px] relative">
                              <svg viewBox="0 0 100 100" className="w-full h-auto drop-shadow-md">
                                {activeCommuneZones.map((zone) => {
                                  const isActive = activeZone?.id === zone.id
                                  return (
                                    <path
                                      key={zone.id}
                                      d={zone.path}
                                      className={`stroke-white dark:stroke-slate-900 stroke-[1.5] cursor-pointer transition-all ${isActive
                                        ? "fill-red-600 opacity-95 scale-[1.01] drop-shadow-lg"
                                        : "fill-red-700/20 hover:fill-red-700/40 opacity-80"
                                        }`}
                                      onClick={() => setSelectedZoneId(zone.id)}
                                    />
                                  )
                                })}

                                {activeCommuneZones.map((zone) => (
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

                            {activeZone && (
                              <div className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 flex flex-col gap-2.5 text-[11px] self-stretch justify-center">
                                <div className="flex items-center gap-1.5 border-b pb-1.5">
                                  <Info className="w-3.5 h-3.5 text-red-600 dark:text-[#fbc02d]" />
                                  <span className="font-extrabold text-red-600 dark:text-[#fbc02d] uppercase tracking-wide">
                                    {activeZone.name}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 font-semibold text-slate-500 dark:text-slate-400">
                                  <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 uppercase tracking-widest">{currentLang === "en" ? "Area" : "Diện tích"}</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{activeZone.area}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 uppercase tracking-widest">{currentLang === "en" ? "Population" : "Dân cư"}</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{activeZone.pop}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CONTACT INFO SIDEBAR WIDGET */}
                      {widget.type === "CONTACT_INFO_SIDEBAR" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <div className="space-y-3.5">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Headquarters Address" : "Địa chỉ trụ sở"}</span>
                                <span className="leading-relaxed">{getConfigValue("address", "Địa chỉ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk")}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <Phone className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Hotline Support" : "Đường dây nóng"}</span>
                                <a href={`tel:${getConfigValue("hotline", "0262.3812.345")}`} className="hover:text-red-600">{getConfigValue("hotline", "0262.3812.345")}</a>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            <div className="flex items-start gap-2.5">
                              <Mail className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Official Email" : "Thư điện tử"}</span>
                                <a href={`mailto:${getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}`} className="hover:text-red-600 break-all">{getConfigValue("email", "xadangkang@krongbong.daklak.gov.vn")}</a>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">{currentLang === "en" ? "Reception Schedule" : "Lịch tiếp công dân"}</span>
                                <span className="leading-relaxed">{getConfigValue("citizen_schedule", "Thứ 5 hàng tuần • 08:00 - 11:30")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CONTACT FORM WIDGET */}
                      {widget.type === "CONTACT_FORM" && (
                        <div className="w-full">
                          {!submitted ? (
                            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                  <label className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                                    {currentLang === "en" ? "Your full name *" : "Họ và tên của bạn *"}
                                  </label>
                                  <input
                                    required
                                    type="text"
                                    placeholder={currentLang === "en" ? "Enter full name..." : "Nhập họ và tên..."}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                                    {currentLang === "en" ? "Email Address *" : "Địa chỉ Email của bạn *"}
                                  </label>
                                  <input
                                    required
                                    type="email"
                                    placeholder={currentLang === "en" ? "yourname@email.com" : "nhap@email.com"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                                  {currentLang === "en" ? "Feedback title" : "Tiêu đề ý kiến"}
                                </label>
                                <input
                                  type="text"
                                  placeholder={currentLang === "en" ? "Feedback subject..." : "Chủ đề góp ý..."}
                                  value={subject}
                                  onChange={(e) => setSubject(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                                  {currentLang === "en" ? "Feedback message content *" : "Nội dung thư góp ý *"}
                                </label>
                                <textarea
                                  required
                                  rows={4}
                                  placeholder={currentLang === "en" ? "Type the message content..." : "Gõ nội dung tin nhắn gửi đến ban biên tập..."}
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors leading-relaxed"
                                />
                              </div>

                              <button
                                type="submit"
                                className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-extrabold tracking-wider py-3 rounded-xl transition-colors uppercase flex items-center justify-center gap-1.5 shadow"
                              >
                                <Send className="w-4 h-4 text-yellow-300 dark:text-red-600 shrink-0" />
                                {currentLang === "en" ? "SEND FEEDBACK" : "GỬI THƯ GÓP Ý"}
                              </button>
                            </form>
                          ) : (
                            <div className="p-5 rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/10 flex flex-col gap-4 text-center items-center animate-fade-in text-xs">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                              <div className="flex flex-col gap-1">
                                <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">
                                  {currentLang === "en" ? "MESSAGE SENT SUCCESSFULLY!" : "ĐÃ GỬI THƯ THÀNH CÔNG!"}
                                </h5>
                                <p className="text-slate-450 font-medium leading-relaxed">
                                  {getConfigValue("contact_form_success_desc", currentLang === "en" ? "Dang Kang commune clerical department has received your comment and will respond as soon as possible via email." : "Bộ phận văn thư xã Dang Kang đã nhận được ý kiến của bạn và sẽ có phản hồi sớm nhất qua hòm thư điện tử.")}
                                </p>
                              </div>
                              <button
                                onClick={() => setSubmitted(false)}
                                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[9px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow"
                              >
                                {currentLang === "en" ? "Send another message" : "Gửi thêm tin nhắn mới"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
