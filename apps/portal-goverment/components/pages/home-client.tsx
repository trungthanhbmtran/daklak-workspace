"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  CheckCircle2,
  FileSearch,
  User,
  Phone,
  Mail,
  Volume2,
  TrendingUp,
  Calendar,
  ThumbsUp,
  ExternalLink,
  Award,
  ChevronDown,
  Info,
  Clock,
  ShieldCheck,
  MapPin,
  Heart,
  Image as ImageIcon,
  Check,
  Smartphone,
  BookOpen,
  FolderOpen,
  AlertCircle,
  Search,
  Sparkles,
  DollarSign,
  Layers,
  HelpCircle
} from "lucide-react"

const FEATURED_SLIDES = [
  {
    id: 1,
    title: "Lãnh đạo huyện Krông Bông làm việc với UBND xã Dang Kang về phát triển KT-XH năm 2026",
    excerpt: "Sáng 29/4, UBND huyện Krông Bông phối hợp cùng các Sở ban ngành làm việc trực tiếp tại UBND xã Dang Kang về kế hoạch chuyển đổi cơ cấu cây trồng nông nghiệp công nghệ cao và thúc đẩy hạ tầng nông thôn mới nâng cao...",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    date: "29/04/2026",
    category: "Chỉ đạo điều hành"
  },
  {
    id: 2,
    title: "Khởi công mở rộng đường liên thôn 3 và thôn 4 nông thôn mới kiểu mẫu",
    excerpt: "Dự án có tổng mức đầu tư hơn 5 tỷ đồng trích từ nguồn ngân sách xã xã hội hóa và người dân tự nguyện hiến đất mở rộng hành lang lộ giới lên 8m, góp phần hiện đại hóa cơ sở hạ tầng giao thông nông thôn...",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1200&q=80",
    date: "28/04/2026",
    category: "Xây dựng nông thôn mới"
  },
  {
    id: 3,
    title: "Tập huấn chuyển đổi số và ứng dụng CNTT cho bà con nông dân trồng cà phê",
    excerpt: "Hơn 120 hộ dân tiêu biểu của xã đã tham gia lớp tập huấn sử dụng ứng dụng truy xuất nguồn gốc nông sản, thanh toán không dùng tiền mặt và theo dõi diễn biến giá cả thị trường nông sản Đắk Lắk...",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    date: "26/04/2026",
    category: "Chuyển đổi số"
  }
]

const LEFT_MENU_ITEMS = [
  { name: "Hoạt động của Đảng Ủy xã", path: "/tin-tuc?category=dang-uy" },
  { name: "Hội đồng nhân dân", path: "/tin-tuc?category=hdnd" },
  { name: "Ủy ban nhân dân", path: "/tin-tuc?category=ubnd" },
  { name: "Ủy ban MTTQ xã & các đoàn thể", path: "/tin-tuc" },
  { name: "Hoạt động Văn phòng HĐND & UBND", path: "/tin-tuc?category=ubnd" },
  { name: "Phòng kinh tế - kỹ thuật xã", path: "/tin-tuc?category=kinh-te" },
  { name: "Phòng Văn hóa - Xã hội", path: "/tin-tuc" },
  { name: "Trung tâm phục vụ hành chính công", path: "/thu-tuc" },
  { name: "Trạm Y tế xã Dang Kang", path: "/lien-he" },
  { name: "Công an xã Dang Kang", path: "/lien-he" },
  { name: "Thư viện video, hình ảnh", path: "/tin-tuc" }
]

const ANNOUNCEMENTS_SIDE = [
  {
    id: 1,
    title: "Chi trả lương hưu và trợ cấp bảo hiểm xã hội tháng 5 từ ngày 4/5 tại Nhà văn hóa xã Dang Kang",
    date: "04/05/2026",
    dept: "LĐ-TB&XH"
  },
  {
    id: 2,
    title: "Tập huấn nhận diện kỹ năng phòng, chống tội phạm cướp ngân hàng, tiệm vàng trên địa bàn",
    date: "02/05/2026",
    dept: "Công An Xã"
  },
  {
    id: 3,
    title: "Thông báo tuyển chọn tổ chức, cá nhân chủ trì thực hiện nhiệm vụ khoa học công nghệ cấp xã năm 2026",
    date: "29/04/2026",
    dept: "VP UBND"
  },
  {
    id: 4,
    title: "Thông báo giao, điều chuyển gỗ cho các đơn vị có nhu cầu sử dụng gỗ tịch thu xây dựng trụ sở công cộng",
    date: "25/04/2026",
    dept: "Địa Chính"
  },
  {
    id: 5,
    title: "Thông báo Kết quả giải thưởng Đợt 1 Cuộc thi trực tuyến tìm hiểu khoa học công nghệ & chuyển đổi số",
    date: "22/04/2026",
    dept: "Đoàn Xã"
  }
]

const QUICK_SERVICES = [
  {
    title: "Dịch vụ công trực tuyến",
    description: "Nộp hồ sơ trực tuyến trực tiếp, tinh giản thủ tục hành chính, nộp nhanh 24/7.",
    borderColor: "border-l-blue-600 dark:border-l-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400",
    hoverBg: "hover:bg-blue-50/20 dark:hover:bg-blue-950/10",
    icon: FileText,
    link: "/thu-tuc"
  },
  {
    title: "Tra cứu hồ sơ một cửa",
    description: "Nhập mã số biên nhận để kiểm tra tiến trình giải quyết hồ sơ một cửa chính xác.",
    borderColor: "border-l-emerald-600 dark:border-l-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400",
    hoverBg: "hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10",
    icon: FileSearch,
    link: "#one-stop-widget"
  },
  {
    title: "Phản ánh & Kiến nghị",
    description: "Gửi phản hồi trực tiếp về thủ tục hành chính và thái độ phục vụ của cán bộ.",
    borderColor: "border-l-amber-600 dark:border-l-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400",
    hoverBg: "hover:bg-amber-50/20 dark:hover:bg-amber-950/10",
    icon: MessageSquare,
    link: "/tuong-tac"
  },
  {
    title: "Hỏi đáp pháp luật",
    description: "Giải đáp các thắc mắc pháp lý của công dân về hộ tịch, đất đai, tư pháp cấp xã.",
    borderColor: "border-l-purple-600 dark:border-l-purple-500",
    iconBg: "bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400",
    hoverBg: "hover:bg-purple-50/20 dark:hover:bg-purple-950/10",
    icon: CheckCircle2,
    link: "/tuong-tac#gui-cau-hoi"
  }
]

const CONSTRUCTION_NEWS = [
  {
    id: 201,
    title: "Công bố Quy hoạch chi tiết 1/500 Khu dân cư Trung tâm hành chính mới xã Dang Kang",
    excerpt: "Ủy ban nhân dân xã chính thức công bố bản vẽ chi tiết phân khu đô thị hóa, đầu tư hạ tầng điện đường trường trạm đồng bộ tại trung tâm xã giai đoạn 2026 - 2030.",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80",
    date: "28/04/2026"
  },
  {
    id: 202,
    title: "Khởi công xây dựng Nhà văn hóa cộng đồng đa năng thôn 4 kết hợp sân thể thao xã",
    excerpt: "Công trình có diện tích sử dụng hơn 800m2, phục vụ các hội nghị sinh hoạt cộng đồng, hội diễn văn nghệ quần chúng và phong trào rèn luyện thể chất nhân dân.",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80",
    date: "26/04/2026"
  }
]

const CONSTRUCTION_LINKS = [
  { text: "Kế hoạch quy hoạch, xây dựng, kiến trúc; hoạt động đầu tư xây dựng xã", link: "/van-ban" },
  { text: "Báo cáo công tác quản lý hạ tầng kỹ thuật và nâng cấp lộ giới đường nông thôn", link: "/van-ban" }
]

const AGRICULTURE_NEWS = [
  {
    id: 301,
    title: "Xã Dang Kang đạt tiêu chuẩn vùng trồng Sầu riêng và Cà phê hữu cơ xuất khẩu",
    excerpt: "Sở Nông nghiệp & PTNT đã ký quyết định cấp mã vùng trồng xuất khẩu chính ngạch cho hợp tác xã Dang Kang, mở ra hướng đi đột phá nâng tầm giá trị nông sản.",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=400&q=80",
    date: "29/04/2026"
  },
  {
    id: 302,
    title: "Phát động tuần lễ trồng cây 'Đời đời nhớ ơn Bác' và khơi thông dòng suối tự nhiên",
    excerpt: "Hơn 500 cây phân tán bản địa đã được gieo trồng dọc các tuyến suối Thôn 2 và Thôn 3, góp phần bảo vệ nguồn tài nguyên nước và chống xói mòn đất nông nghiệp.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80",
    date: "27/04/2026"
  }
]

const AGRICULTURE_LINKS = [
  { text: "Báo cáo công tác quản lý tài nguyên đất, tài nguyên nước địa phương", link: "/van-ban" },
  { text: "Kế hoạch, chương trình mục tiêu quốc gia xây dựng phát triển nông thôn mới", link: "/van-ban" }
]

const GALLERY_PHOTOS = [
  {
    id: 1,
    title: "Cánh đồng lúa nước trĩu hạt Thôn 3 - nông nghiệp hiện đại",
    image: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=600&q=80",
    tag: "Nông nghiệp"
  },
  {
    id: 2,
    title: "Hội nghị Ban chỉ đạo xã triển khai chuyển đổi số năm 2026",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
    tag: "Hội nghị"
  }
]

const LEADERS = [
  { name: "Nguyễn Văn Hồng", role: "Bí thư Đảng ủy - Chủ tịch HĐND", phone: "0262.3812.345", email: "nvhong@krongbong.daklak.gov.vn", hasStar: true },
  { name: "Trần Quốc Tuấn", role: "Phó Bí thư - Chủ tịch UBND", phone: "0262.3812.346", email: "tqtuan@krongbong.daklak.gov.vn", hasStar: true },
  { name: "H'Yen Knul", role: "Phó Chủ tịch UBND xã", phone: "0262.3812.347", email: "hyenknul@krongbong.daklak.gov.vn", hasStar: false }
]

const MOCK_QA = [
  {
    q: "Thủ tục đăng ký khai sinh quá hạn cho trẻ em từ 1-5 tuổi cần những hồ sơ gì, nộp ở đâu?",
    a: "Chào anh/chị, thủ tục đăng ký khai sinh quá hạn được giải quyết trực tiếp tại bộ phận Một cửa UBND xã Dang Kang. Thành phần hồ sơ gồm: (1) Tờ khai đăng ký khai sinh theo mẫu; (2) Giấy chứng sinh của cơ sở y tế, hoặc văn bản xác nhận của người làm chứng. Lệ phí giải quyết: Miễn phí hoàn toàn. Thời gian xử lý: Trong ngày làm việc nếu đầy đủ hồ sơ.",
    sender: "Lê Thị Lan (Thôn 3)",
    date: "29/04/2026"
  }
]

interface HomeClientProps {
  initialPortalMenus?: any
  initialPosts?: any
}

export default function HomeClient({ initialPortalMenus, initialPosts }: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [pollVoted, setPollVoted] = React.useState(false)
  const [pollChoice, setPollChoice] = React.useState<string | null>(null)
  const [pollStats, setPollStats] = React.useState({
    verySatisfied: 45,
    satisfied: 35,
    normal: 15,
    unsatisfied: 5
  })
  const [activeQaIdx, setActiveQaIdx] = React.useState<number | null>(0)
  const [lightboxImg, setLightboxImg] = React.useState<string | null>(null)
  const [lightboxTitle, setLightboxTitle] = React.useState<string | null>(null)
  const [currentGalleryIdx, setCurrentGalleryIdx] = React.useState(0)

  // Một cửa điện tử State
  const [activeTab, setActiveTab] = React.useState<"procedure" | "dossier">("procedure")
  const [procedureSearch, setProcedureSearch] = React.useState("")
  const [dossierCode, setDossierCode] = React.useState("")
  const [selectedProcedure, setSelectedProcedure] = React.useState<any | null>(null)

  // React Query Hooks initialized with pre-fetched ISR data as initialData
  const { data: postsData } = useQuery({
    queryKey: ["public-posts", undefined],
    queryFn: async () => {
      const response = await apiClient.get("/public/posts")
      return response
    },
    initialData: initialPosts,
  })

  const { data: menusData } = useQuery({
    queryKey: ["public-portal-menus"],
    queryFn: async () => {
      const response = await apiClient.get("/public/portal-menus")
      return response
    },
    initialData: initialPortalMenus,
  })

  // Real-time queries for Procedure Search and Dossier status
  const { data: proceduresData, isLoading: searchingProcedures } = useQuery({
    queryKey: ["procedures-search", procedureSearch],
    queryFn: async () => {
      const res: any = await apiClient.get("/public/documents/procedures", {
        params: { search: procedureSearch, limit: 5 }
      })
      return res?.data || []
    },
    enabled: activeTab === "procedure" && procedureSearch.length > 1
  })

  const { data: dossierData, error: dossierError, refetch: searchDossier, isFetching: searchingDossier } = useQuery({
    queryKey: ["dossier-status", dossierCode],
    queryFn: async () => {
      const res: any = await apiClient.get(`/public/documents/dossiers/${dossierCode}`)
      return res?.data || null
    },
    enabled: false, // only trigger on button click
    retry: false
  })

  const menuItems = React.useMemo(() => {
    return menusData?.data && menusData.data.length > 0
      ? menusData.data.map((m: any) => ({ name: m.name, path: m.link || "/tin-tuc" }))
      : LEFT_MENU_ITEMS
  }, [menusData])

  const slides = React.useMemo(() => {
    const dbSlides = postsData?.data
      ? postsData.data.slice(0, 3).map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.description || post.content || "",
          image: post.thumbnail || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
          date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : new Date(post.createdAt).toLocaleDateString("vi-VN"),
          category: post.category?.name || "Tin tức"
        }))
      : []
    return dbSlides.length > 0 ? dbSlides : FEATURED_SLIDES
  }, [postsData])

  React.useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 6000)

    const galleryTimer = setInterval(() => {
      setCurrentGalleryIdx(prev => (prev + 1) % GALLERY_PHOTOS.length)
    }, 5000)

    const savedVote = localStorage.getItem("dangkang_portal_poll_voted")
    const savedChoice = localStorage.getItem("dangkang_portal_poll_choice")
    if (savedVote && savedChoice) {
      setPollVoted(true)
      setPollChoice(savedChoice)
      const savedStats = localStorage.getItem("dangkang_portal_poll_stats")
      if (savedStats) setPollStats(JSON.parse(savedStats))
    }

    return () => {
      clearInterval(slideTimer)
      clearInterval(galleryTimer)
    }
  }, [slides.length])

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)

  const handleVote = (choice: string) => {
    if (pollVoted) return
    let updatedStats = { ...pollStats }
    if (choice === "verySatisfied") updatedStats.verySatisfied += 1
    else if (choice === "satisfied") updatedStats.satisfied += 1
    else if (choice === "normal") updatedStats.normal += 1
    else if (choice === "unsatisfied") updatedStats.unsatisfied += 1

    setPollStats(updatedStats)
    setPollVoted(true)
    setPollChoice(choice)
    localStorage.setItem("dangkang_portal_poll_voted", "true")
    localStorage.setItem("dangkang_portal_poll_choice", choice)
    localStorage.setItem("dangkang_portal_poll_stats", JSON.stringify(updatedStats))
  }

  const handleDossierSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (dossierCode.trim()) {
      searchDossier()
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* 1. National Emblem Banner with high-end administrative style */}
      <div className="bg-[#cc0000] dark:bg-slate-950 text-white rounded-lg shadow-md border-b-4 border-[#ffde59] p-4.5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute inset-0 bg-[radial-gradient(#ffde5906_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute left-1/2 md:left-auto md:right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none z-0">
          <svg className="w-48 h-48 text-[#ffde59]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
          </svg>
        </div>

        <div className="flex items-center gap-4 text-center md:text-left z-10">
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full border-2 border-[#ffde59] flex items-center justify-center shrink-0 shadow">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-[#ffde59]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-base md:text-lg lg:text-xl font-black uppercase tracking-wider text-amber-100 leading-snug drop-shadow-sm">
              ỦY BAN NHÂN DÂN XÃ DANG KANG
            </h1>
            <p className="text-xs md:text-sm font-bold text-slate-100 tracking-wide uppercase drop-shadow-sm">
              CỔNG THÔNG TIN ĐIỆN TỬ - HỆ THỐNG MỘT CỬA LIÊN THÔNG CHÍNH PHỦ
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-[10px] md:text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Huyện Krông Bông, Tỉnh Đắk Lắk</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 0262.3812.345</span>
            </div>
          </div>
        </div>

        <div className="z-10 bg-black/25 px-4.5 py-3 rounded border border-white/10 backdrop-blur-sm self-center text-center">
          <span className="text-[10px] md:text-xs text-amber-200 font-extrabold uppercase tracking-widest block">ĐƯỜNG DÂY NÓNG HỖ TRỢ</span>
          <span className="text-sm md:text-base font-black text-white mt-0.5 block">1900.8686 • 24/7</span>
        </div>
      </div>

      {/* 2. Main Portal Sections Grid (Left Sidebar Menu + Middle Slideshow + Right Announcements) */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-4.5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column 1 (Left, span 3): Public Directory Menus */}
          <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col gap-3 shadow-inner">
            <div className="border-b-2 border-[#cc0000] pb-1.5 flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-[#cc0000] dark:text-red-400 tracking-wide">
                Danh mục điều hướng
              </span>
            </div>
            <nav className="flex flex-col gap-1.5">
              {menuItems.map((menu: any, index: number) => (
                <Link
                  key={index}
                  href={menu.path}
                  className="px-3 py-2 text-xs font-semibold md:font-bold text-slate-700 dark:text-slate-300 hover:text-white hover:bg-[#cc0000] dark:hover:bg-red-700 rounded transition-all flex items-center justify-between group border-b border-slate-100 dark:border-slate-800 last:border-none"
                >
                  <span className="truncate">{menu.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 2 (Middle, span 6): Beautiful Featured News Carousel */}
          <div className="lg:col-span-6 flex flex-col rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[380px] shadow">
            {slides.map((slide: any, idx: number) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 flex flex-col justify-end ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10" />

                <div className="p-5 md:p-6 z-20 flex flex-col gap-2 text-white relative">
                  <span className="px-2 py-0.5 text-[9px] md:text-xs font-black bg-[#cc0000] text-amber-50 uppercase rounded self-start tracking-wide shadow-sm">
                    {slide.category}
                  </span>
                  <h3 className="text-sm md:text-base lg:text-lg font-black tracking-wide leading-snug uppercase text-amber-100 hover:underline">
                    <Link href={`/tin-tuc`}>{slide.title}</Link>
                  </h3>
                  <p className="text-xs font-medium text-slate-200 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {slide.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cập nhật: {slide.date}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/45 hover:bg-black/75 text-white transition-colors z-30 border border-white/10"
              title="Trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/45 hover:bg-black/75 text-white transition-colors z-30 border border-white/10"
              title="Sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slider Indicators */}
            <div className="absolute top-3 right-3 flex items-center gap-1 z-30 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
              {slides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentSlide ? "bg-[#fef08a] w-4" : "bg-white/40 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Column 3 (Right, span 3): Dynamic Administrative Announcements */}
          <div className="lg:col-span-3 bg-[#faf8f2] dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden shadow-sm justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(#cc000004_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />

            <div>
              <div className="border-b border-amber-200/60 dark:border-slate-800 pb-2 mb-3 z-10 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#cc0000]" />
                <span className="text-xs font-black uppercase text-[#cc0000] dark:text-red-400 tracking-wide">
                  Thông báo hành chính
                </span>
              </div>

              <div className="flex flex-col gap-4 z-10 relative">
                {ANNOUNCEMENTS_SIDE.slice(0, 4).map((ann) => (
                  <div key={ann.id} className="group border-b border-dashed border-amber-200/30 dark:border-slate-800/50 pb-2.5 last:border-none last:pb-0">
                    <Link
                      href="/tin-tuc"
                      className="flex gap-2 items-start text-xs md:text-[13px] font-semibold md:font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#cc0000] dark:group-hover:text-red-400 transition-colors leading-relaxed"
                    >
                      <span className="text-[#cc0000] text-xs shrink-0 select-none group-hover:translate-x-0.5 transition-transform mt-0.5">
                        🔴
                      </span>
                      <span className="line-clamp-2">{ann.title}</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-1 pl-4 text-[10px] md:text-xs text-slate-400 font-bold uppercase">
                      <span>{ann.dept}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {ann.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Support Quick Info Box */}
            <div className="p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-amber-200/30 dark:border-slate-800/60 flex items-center gap-3 z-10 shrink-0 shadow-sm mt-3">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#cc0000] dark:text-red-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#cc0000] dark:text-red-400 font-extrabold uppercase tracking-wide">LỊCH TIẾP CÔNG DÂN</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">Thứ 5 hàng tuần • 08:00 - 11:30</span>
              </div>
            </div>

            <Link
              href="/tin-tuc"
              className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-slate-800 text-center text-[10px] md:text-xs text-[#cc0000] dark:text-red-400 font-extrabold uppercase tracking-widest hover:underline z-10 flex items-center justify-center gap-1 shrink-0"
            >
              Xem tất cả thông báo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

      {/* 3. Horizontal Decorative Patriotic Promotion Banner */}
      <div className="w-full bg-gradient-to-r from-[#990000] via-[#cc0000] to-[#800000] text-white py-4.5 px-6 md:px-8 rounded-xl shadow border-y border-[#ffde59]/25 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative overflow-hidden">
        <div className="absolute inset-x-0 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />

        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none select-none z-0">
          <svg className="w-56 h-56 text-[#ffff00]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
          </svg>
        </div>

        <div className="z-10 flex flex-col gap-1">
          <span className="text-[#fbc02d] text-xs font-black tracking-widest uppercase flex items-center justify-center md:justify-start gap-1.5 drop-shadow-sm">
            <span>⭐</span> HỌC TẬP VÀ LÀM THEO TƯ TƯỞNG, ĐẠO ĐỨC, PHONG CÁCH HỒ CHÍ MINH
          </span>
          <h3 className="text-sm md:text-base font-black tracking-wide leading-snug uppercase text-amber-50 drop-shadow">
            &quot;ĐOÀN KẾT - ĐOÀN KẾT - ĐẠI ĐOÀN KẾT • THÀNH CÔNG - THÀNH CÔNG - ĐẠI THÀNH CÔNG&quot;
          </h3>
        </div>
        <div className="z-10 shrink-0">
          <Link
            href="/gioi-thieu"
            className="inline-flex items-center gap-1.5 bg-[#ffde59] hover:bg-[#f1c40f] text-slate-950 text-xs font-black tracking-wider uppercase px-4 py-2.5 rounded shadow-md border border-amber-300 transition-all transform hover:scale-105"
          >
            Tìm hiểu Lịch sử Xã
            <Info className="w-4 h-4 text-slate-900" />
          </Link>
        </div>
      </div>

      {/* 4. Quick Services Administrative Icons Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2">
          <span className="text-[#f1c40f] text-lg">⭐</span>
          <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
            CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN MỘT CỬA
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {QUICK_SERVICES.map((serv) => {
            const Icon = serv.icon
            return (
              <Link
                key={serv.title}
                href={serv.link}
                className={`p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${serv.borderColor} ${serv.hoverBg} shadow-sm hover:shadow-md hover:border-[#cc0000] dark:hover:border-red-600 transition-all transform hover:-translate-y-1 flex flex-col gap-3.5 relative group overflow-hidden`}
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-slate-500/5 dark:bg-white/5 rounded-full blur-xl translate-x-8 -translate-y-8 scale-75 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                <div className={`w-11 h-11 rounded-lg ${serv.iconBg} flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-[#cc0000] dark:group-hover:text-red-400 transition-colors">
                    {serv.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                    {serv.description}
                  </p>
                </div>

                <span className="mt-1 text-xs font-bold tracking-wider text-slate-400 group-hover:text-[#cc0000] dark:group-hover:text-red-400 uppercase flex items-center gap-1 group-hover:underline">
                  Truy cập dịch vụ
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 5. INTERACTIVE ONE-STOP SEARCH & DOSSIER TRACKING WIDGET (NEW PREMIUM ADDITION) */}
      <div id="one-stop-widget" className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 p-6 shadow-md flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#cc0000]/5 dark:bg-red-900/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#cc0000] text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                TRA CỨU HÀNH CHÍNH & MỘT CỬA ĐIỆN TỬ LIÊN THÔNG
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tra cứu nhanh thành phần hồ sơ và tiến trình xử lý hồ sơ công dân thời gian thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
            <button
              onClick={() => setActiveTab("procedure")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors ${
                activeTab === "procedure"
                  ? "bg-[#cc0000] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Thủ tục hành chính
            </button>
            <button
              onClick={() => setActiveTab("dossier")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors ${
                activeTab === "dossier"
                  ? "bg-[#cc0000] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Theo dõi hồ sơ một cửa
            </button>
          </div>
        </div>

        {/* Tab 1: Administrative Procedure Search */}
        {activeTab === "procedure" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nhập tên thủ tục, từ khóa (ví dụ: khai sinh, chứng thực, kết hôn, đất đai...)"
                  value={procedureSearch}
                  onChange={(e) => setProcedureSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-slate-800 dark:text-slate-100 shadow-sm"
                />
              </div>
              {procedureSearch && (
                <button
                  onClick={() => setProcedureSearch("")}
                  className="px-3 text-xs font-bold text-slate-500 hover:text-[#cc0000]"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Results Grid */}
            {searchingProcedures ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cc0000]" />
              </div>
            ) : procedureSearch.length > 1 ? (
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
                {proceduresData && proceduresData.length > 0 ? (
                  proceduresData.map((proc: any) => (
                    <div
                      key={proc.id}
                      onClick={() => setSelectedProcedure(proc)}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-[#cc0000] dark:hover:border-red-600 cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{proc.code}</span>
                        <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{proc.name}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold"><Clock className="w-3 h-3 text-[#cc0000]" /> {proc.duration}</span>
                          <span className="flex items-center gap-1 font-semibold"><DollarSign className="w-3 h-3 text-emerald-600" /> {proc.fee}</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#cc0000] dark:text-red-400 uppercase tracking-wider flex items-center gap-0.5 shrink-0 hover:underline">
                        Xem hướng dẫn hồ sơ
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs font-bold text-slate-400">
                    Không tìm thấy thủ tục nào khớp với từ khóa tìm kiếm.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-100/65 dark:bg-slate-900/65 rounded-lg p-5 flex items-center gap-4.5 border border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-[#cc0000] rounded-full shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">Tính năng tra cứu thông tin thủ tục</span>
                  <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Hỗ trợ công dân tìm kiếm nhanh các giấy tờ bắt buộc, biểu mẫu đi kèm, trình tự thực hiện các thủ tục hành chính thuộc thẩm quyền giải quyết của UBND xã (đất đai, hộ khẩu, chứng thực...).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dossier Tracking Status */}
        {activeTab === "dossier" && (
          <div className="flex flex-col gap-4.5">
            <form onSubmit={handleDossierSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã số hồ sơ biên nhận một cửa (ví dụ: DK-2026-101, DK-2026-102...)"
                value={dossierCode}
                onChange={(e) => setDossierCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:border-transparent text-slate-800 dark:text-slate-100 shadow-sm"
              />
              <button
                type="submit"
                disabled={searchingDossier || !dossierCode.trim()}
                className="px-5 py-2.5 bg-[#cc0000] text-white rounded-lg text-xs font-extrabold uppercase tracking-wider hover:bg-red-700 transition-colors shrink-0 flex items-center gap-1 shadow disabled:opacity-50"
              >
                {searchingDossier ? "Đang tra cứu..." : "Tra cứu"}
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Timelines Display */}
            {dossierData ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-3 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Hồ sơ công dân</span>
                    <h4 className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                      {dossierData.code} <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold">{dossierData.status}</span>
                    </h4>
                  </div>
                  <div className="flex flex-col text-left sm:text-right text-[11px] text-slate-500 font-semibold">
                    <span>Người nộp: {dossierData.senderName}</span>
                    <span className="flex items-center sm:justify-end gap-1"><Clock className="w-3.5 h-3.5 text-red-500" /> Ngày hẹn trả: {new Date(dossierData.dueDate).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div className="grid grid-cols-4 gap-2 relative mt-2 pb-2">
                  {/* Pipeline line */}
                  <div className="absolute top-4 left-1/8 right-1/8 h-1 bg-slate-200 dark:bg-slate-800 z-0" />
                  <div
                    className="absolute top-4 left-1/8 h-1 bg-emerald-500 z-0 transition-all duration-700"
                    style={{ width: `${((dossierData.currentStep - 1) / 3) * 75}%` }}
                  />

                  {/* Step Nodes */}
                  {[
                    { step: 1, name: "Tiếp nhận" },
                    { step: 2, name: "Thụ lý & Thẩm định" },
                    { step: 3, name: "Phê duyệt" },
                    { step: 4, name: "Trả kết quả" }
                  ].map((s) => {
                    const isActive = s.step <= dossierData.currentStep
                    const isCurrent = s.step === dossierData.currentStep
                    return (
                      <div key={s.step} className="flex flex-col items-center gap-1.5 z-10 text-center relative min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCurrent
                              ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950 scale-110"
                              : isActive
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400"
                          }`}
                        >
                          {isActive && !isCurrent ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{s.step}</span>}
                        </div>
                        <span
                          className={`text-[10px] md:text-xs font-bold leading-tight ${
                            isCurrent
                              ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                              : isActive
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400"
                          }`}
                        >
                          {s.name}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Status message */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-850 p-3 mt-1 flex items-start gap-2.5">
                  <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Chi tiết tiến trình xử lý:</span>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold italic">{dossierData.stepDetails || "Hồ sơ đang ở trạng thái xử lý nghiệp vụ theo trình tự quy định."}</p>
                  </div>
                </div>
              </div>
            ) : dossierError ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-lg flex items-center gap-2.5 text-red-700 dark:text-red-400 text-xs font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Không thể tìm thấy mã biên nhận hồ sơ một cửa này trong hệ thống. Vui lòng kiểm tra lại chính xác mã số trên biên nhận giấy của quý khách.</span>
              </div>
            ) : (
              <div className="bg-slate-100/65 dark:bg-slate-900/65 rounded-lg p-5 flex items-center gap-4.5 border border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-[#cc0000] rounded-full shrink-0">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">Tiến trình giải quyết hồ sơ công dân trực tuyến</span>
                  <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Nhập chính xác mã biên nhận ghi trên phiếu hẹn trả kết quả để giám sát từng bước thực thi công vụ: Thụ lý hồ sơ, thẩm định hồ sơ của chuyên viên phòng ban, ký phê duyệt lãnh đạo xã, và trạng thái sẵn sàng nhận kết quả.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. News category blocks and links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: News lists */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2">
            <span className="text-[#f1c40f] text-lg">⭐</span>
            <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
              Tin tức lĩnh vực xây dựng và công thương
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONSTRUCTION_NEWS.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                <div>
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-[#cc0000] uppercase tracking-wider">{item.date}</span>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#cc0000] transition-colors leading-snug">
                      <Link href="/tin-tuc">{item.title}</Link>
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4.5 pt-1">
                  <Link href="/tin-tuc" className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#cc0000] dark:text-red-400 flex items-center gap-1 hover:underline">
                    Xem chi tiết
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#faf8f2] dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-lg flex flex-col gap-2.5">
            {CONSTRUCTION_LINKS.map((link, idx) => (
              <Link
                key={idx}
                href={link.link}
                className="text-xs md:text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-[#cc0000] flex items-start gap-1.5 leading-normal"
              >
                <span className="text-[#cc0000] shrink-0 mt-0.5">•</span>
                <span className="hover:underline">{link.text}</span>
              </Link>
            ))}
          </div>

          {/* Agriculture Section */}
          <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2 mt-2">
            <span className="text-[#f1c40f] text-lg">⭐</span>
            <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
              Tin tức nông nghiệp & phát triển nông thôn mới
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGRICULTURE_NEWS.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
                <div>
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-[#cc0000] uppercase tracking-wider">{item.date}</span>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#cc0000] transition-colors leading-snug">
                      <Link href="/tin-tuc">{item.title}</Link>
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4.5 pt-1">
                  <Link href="/tin-tuc" className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#cc0000] dark:text-red-400 flex items-center gap-1 hover:underline">
                    Xem chi tiết
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#faf8f2] dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-lg flex flex-col gap-2.5">
            {AGRICULTURE_LINKS.map((link, idx) => (
              <Link
                key={idx}
                href={link.link}
                className="text-xs md:text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-[#cc0000] flex items-start gap-1.5 leading-normal"
              >
                <span className="text-[#cc0000] shrink-0 mt-0.5">•</span>
                <span className="hover:underline">{link.text}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar Widgets (Leaders, Polls, QA) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Leaders Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="border-b-2 border-[#cc0000] pb-1.5 mb-3 flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-[#cc0000] tracking-wide">Lãnh đạo UBND xã Dang Kang</span>
            </div>
            <div className="flex flex-col gap-3">
              {LEADERS.map((ldr, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg flex items-start gap-3 relative overflow-hidden group">
                  <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-full text-[#cc0000]">
                    <User className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h5 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1">
                      {ldr.name} {ldr.hasStar && <span className="text-yellow-500 text-xs">⭐</span>}
                    </h5>
                    <span className="text-[11px] font-bold text-[#cc0000] dark:text-red-400 mt-0.5">{ldr.role}</span>
                    <div className="flex flex-col gap-0.5 mt-2 text-[10px] md:text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 shrink-0" /> {ldr.phone}</span>
                      <span className="flex items-center gap-1 shrink-0"><Mail className="w-3.5 h-3.5 shrink-0" /> {ldr.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Q&A Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="border-b-2 border-[#cc0000] pb-1.5 mb-3 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#cc0000] tracking-wide">Giải đáp công dân</span>
              <Link href="/tuong-tac" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#cc0000] hover:underline">Tất cả</Link>
            </div>
            <div className="flex flex-col gap-3.5">
              {MOCK_QA.map((qa, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="p-3 bg-blue-50/45 dark:bg-blue-950/15 border border-blue-100/50 dark:border-blue-900/50 rounded-lg flex flex-col gap-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#cc0000] flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> HỎI • {qa.sender}
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">&quot;{qa.q}&quot;</p>
                  </div>
                  <div className="p-3 bg-emerald-50/45 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/50 rounded-lg flex flex-col gap-1.5 ml-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> UBND TRẢ LỜI
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed line-clamp-3">{qa.a}</p>
                    <Link href="/tuong-tac" className="text-[10px] font-extrabold uppercase text-emerald-600 hover:underline mt-1 self-start">Xem câu trả lời đầy đủ</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Poll Opinion Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
            <div className="border-b-2 border-[#cc0000] pb-1.5 mb-3 flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-[#cc0000] tracking-wide">Khảo sát ý kiến người dân</span>
            </div>
            <div className="flex flex-col gap-3 relative overflow-hidden">
              <p className="text-xs md:text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">
                Quý vị đánh giá thế nào về thái độ phục vụ và năng lực nghiệp vụ của công chức làm việc tại Bộ phận Một cửa UBND xã?
              </p>

              {pollVoted ? (
                <div className="flex flex-col gap-2.5 mt-2 animate-fade-in">
                  <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded text-center mb-1">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Cảm ơn bạn đã tham gia bình chọn!
                    </span>
                  </div>
                  {[
                    { key: "verySatisfied", label: "Rất hài lòng", val: pollStats.verySatisfied },
                    { key: "satisfied", label: "Hài lòng", val: pollStats.satisfied },
                    { key: "normal", label: "Trung bình", val: pollStats.normal },
                    { key: "unsatisfied", label: "Chưa hài lòng", val: pollStats.unsatisfied }
                  ].map((stat) => {
                    const total = Object.values(pollStats).reduce((a, b) => a + b, 0)
                    const percent = total > 0 ? Math.round((stat.val / total) * 100) : 0
                    const isUserChoice = pollChoice === stat.key
                    return (
                      <div key={stat.key} className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className={`${isUserChoice ? "text-[#cc0000] dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>
                            {stat.label} {isUserChoice && "✅"}
                          </span>
                          <span>{percent}% ({stat.val} phiếu)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden border border-slate-200/50 dark:border-slate-700">
                          <div
                            className={`h-full transition-all duration-1000 ${isUserChoice ? "bg-[#cc0000]" : "bg-slate-400 dark:bg-slate-600"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => handleVote("verySatisfied")} className="w-full text-left p-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded hover:border-[#cc0000] hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all flex items-center justify-between">
                    <span>1. Rất hài lòng</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button onClick={() => handleVote("satisfied")} className="w-full text-left p-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded hover:border-[#cc0000] hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all flex items-center justify-between">
                    <span>2. Hài lòng</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button onClick={() => handleVote("normal")} className="w-full text-left p-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded hover:border-[#cc0000] hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all flex items-center justify-between">
                    <span>3. Bình thường / Tạm hài lòng</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button onClick={() => handleVote("unsatisfied")} className="w-full text-left p-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded hover:border-[#cc0000] hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all flex items-center justify-between">
                    <span>4. Chưa hài lòng / Cần cải tiến thêm</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Gallery Slideshow Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4.5 shadow-sm">
        <div className="border-b-2 border-[#cc0000] pb-1.5 mb-4 flex items-center gap-1.5">
          <ImageIcon className="w-5 h-5 text-[#cc0000]" />
          <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">Hình ảnh hoạt động nổi bật</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GALLERY_PHOTOS.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => {
                setLightboxImg(photo.image)
                setLightboxTitle(photo.title)
              }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg overflow-hidden group cursor-pointer hover:shadow transition-shadow relative"
            >
              <img src={photo.image} alt={photo.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[10px] text-white font-extrabold uppercase">{photo.tag}</div>
              <div className="p-3.5">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed group-hover:text-[#cc0000] dark:group-hover:text-red-400 transition-colors">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => {
            setLightboxImg(null)
            setLightboxTitle(null)
          }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4 animate-fade-in select-none cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center">
            <img src={lightboxImg} alt={lightboxTitle || ""} className="max-w-full max-h-[80vh] rounded shadow-2xl object-contain border border-white/10" />
            <button
              onClick={() => {
                setLightboxImg(null)
                setLightboxTitle(null)
              }}
              className="absolute -top-12 right-0 p-2 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors text-xs font-bold"
            >
              Đóng (ESC)
            </button>
          </div>
          {lightboxTitle && (
            <p className="text-slate-200 text-xs md:text-sm font-bold uppercase tracking-wide mt-4 max-w-2xl text-center bg-black/40 px-4 py-2 rounded-full border border-white/5">{lightboxTitle}</p>
          )}
        </div>
      )}

      {/* Administrative Procedure Details Modal */}
      {selectedProcedure && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#cc0000] font-black uppercase tracking-widest">{selectedProcedure.code}</span>
                <h3 className="text-xs md:text-sm lg:text-base font-black text-slate-800 dark:text-white uppercase leading-snug">{selectedProcedure.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProcedure(null)}
                className="px-2.5 py-1 text-slate-400 hover:text-[#cc0000] text-xs font-bold uppercase border border-slate-200 dark:border-slate-800 hover:border-[#cc0000] rounded transition-all"
              >
                Đóng
              </button>
            </div>

            <div className="flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-850">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Thời hạn giải quyết</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5"><Clock className="w-3.5 h-3.5 text-[#cc0000]" /> {selectedProcedure.duration}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Lệ phí nhà nước</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {selectedProcedure.fee}</span>
                </div>
              </div>

              {selectedProcedure.description && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#cc0000] font-extrabold uppercase tracking-wide">Mô tả thủ tục</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{selectedProcedure.description}</p>
                </div>
              )}

              {/* Required Documents */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-[#cc0000] font-extrabold uppercase tracking-wide flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Thành phần hồ sơ bắt buộc
                </span>
                <ul className="flex flex-col gap-1.5 pl-1">
                  {selectedProcedure.requiredDocs && selectedProcedure.requiredDocs.length > 0 ? (
                    selectedProcedure.requiredDocs.map((doc: string, index: number) => (
                      <li key={index} className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed flex items-start gap-2">
                        <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded mt-0.5"><Check className="w-3 h-3 shrink-0" /></span>
                        <span>{doc}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-400 italic">Liên hệ trực tiếp bộ phận một cửa để biết thêm chi tiết.</li>
                  )}
                </ul>
              </div>

              {/* Action steps */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-[#cc0000] font-extrabold uppercase tracking-wide flex items-center gap-1">
                  <Layers className="w-4 h-4" /> Trình tự các bước thực hiện
                </span>
                <div className="flex flex-col gap-3 pl-1.5 border-l border-slate-200 dark:border-slate-800 ml-2">
                  {selectedProcedure.steps && selectedProcedure.steps.length > 0 ? (
                    selectedProcedure.steps.map((step: string, index: number) => (
                      <div key={index} className="flex gap-3 items-start relative">
                        <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-[#cc0000]" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Bước {index + 1}</span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">Thực hiện theo hướng dẫn của công chức tiếp nhận tại bộ phận một cửa.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
