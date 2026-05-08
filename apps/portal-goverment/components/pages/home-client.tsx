"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { resolveMediaUrl } from "@/lib/utils"
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
  AlertCircle
} from "lucide-react"

// Premium mock images using high-quality administrative/natural patterns
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

// Left side directory menu items - strictly matching the reference portal
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

// Right side announcements - strictly matching the reference portal's Announcements sidebar
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
  },
  {
    id: 6,
    title: "Kế hoạch tổ chức Lễ dâng hương kỷ niệm Ngày Thống nhất Đất nước tại Đài tưởng niệm các Anh hùng Liệt sĩ xã Dang Kang",
    date: "20/04/2026",
    dept: "VP HĐND-UBND"
  },
  {
    id: 7,
    title: "Lịch tiêm chủng mở rộng định kỳ cho trẻ em dưới 5 tuổi và tư vấn dinh dưỡng tháng 5 năm 2026",
    date: "18/04/2026",
    dept: "Trạm Y Tế"
  },
  {
    id: 8,
    title: "Thông báo treo cờ Tổ quốc chào mừng ngày Giải phóng miền Nam 30/4 và Ngày Quốc tế Lao động 1/5",
    date: "15/04/2026",
    dept: "Văn Hóa Xã"
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
    link: "/thu-tuc#tra-cuu"
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

// Category-specific structured news conforming 100% to reference portal
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
  },
  {
    id: 203,
    title: "Kiểm tra tiến độ thi công công trình đường liên huyện kết nối Krông Bông đi xã Dang Kang",
    excerpt: "Đoàn liên ngành tiến hành kiểm tra thực tế, yêu cầu các nhà thầu khẩn trương trải nhựa áp-phan và lắp đặt đầy đủ đèn đường, biển báo an toàn trước mùa mưa lũ.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=80",
    date: "24/04/2026"
  }
]

const CONSTRUCTION_LINKS = [
  { text: "Kế hoạch quy hoạch, xây dựng, kiến trúc; hoạt động đầu tư xây dựng xã", link: "/van-ban" },
  { text: "Báo cáo công tác quản lý hạ tầng kỹ thuật và nâng cấp lộ giới đường nông thôn", link: "/van-ban" },
  { text: "Lịch cúp nước tạm thời phục vụ sửa chữa mạng lưới đường ống xã", link: "/tin-tuc" },
  { text: "Lịch cúp điện và bảo trì lưới điện trung - hạ thế nông thôn huyện Krông Bông", link: "/tin-tuc" },
  { text: "Lịch tắt/mở hệ thống đèn chiếu sáng công cộng tại trục đường chính xã", link: "/tin-tuc" },
  { text: "Tiếp nhận, xử lý, phản ánh, kiến nghị của nhân dân về trật tự xây dựng", link: "/tuong-tac" }
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
  },
  {
    id: 303,
    title: "Hội thảo chuyển giao kỹ thuật phân bón hữu cơ sinh học cao cấp cho hồ tiêu vụ mùa mới",
    excerpt: "Các kỹ sư hướng dẫn bà con phương pháp ủ phân hữu cơ kết hợp nấm đối kháng Trichoderma phòng trừ bệnh chết nhanh chết chậm thường gặp ở hồ tiêu.",
    image: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=400&q=80",
    date: "22/04/2026"
  }
]

const AGRICULTURE_LINKS = [
  { text: "Báo cáo công tác quản lý tài nguyên đất, tài nguyên nước địa phương", link: "/van-ban" },
  { text: "Kế hoạch, chương trình mục tiêu quốc gia xây dựng phát triển nông thôn mới", link: "/van-ban" },
  { text: "Công tác phòng chống thiên tai, tìm kiếm cứu nạn chủ động mùa mưa bão", link: "/tin-tuc" },
  { text: "Kế hoạch và chương trình mục tiêu quốc gia giảm nghèo bền vững xã", link: "/van-ban" },
  { text: "Quản lý chất lượng và an toàn thực phẩm đối với nông sản, lâm sản cấp xã", link: "/thu-tuc" },
  { text: "Chương trình khuyến nông phát triển mô hình kinh tế hộ gia đình, trang trại mới", link: "/tin-tuc" }
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
  },
  {
    id: 3,
    title: "Bà con nông dân buôn Êga thu hoạch hạt cà phê chín mọng",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80",
    tag: "Sản xuất"
  },
  {
    id: 4,
    title: "Toàn cảnh trung tâm hành chính văn hóa mới xã Dang Kang",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    tag: "Quy hoạch"
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
  },
  {
    q: "Tôi muốn làm thủ tục chuyển nhượng quyền sử dụng đất nông nghiệp tại xã thì nộp hồ sơ ở cấp xã hay văn phòng đăng ký đất đai huyện?",
    a: "Chào anh, hồ sơ chuyển nhượng quyền sử dụng đất trước hết cần nộp tại Bộ phận Một cửa của UBND xã Dang Kang để cán bộ địa chính kiểm tra quy hoạch, niêm yết công khai và thực hiện thủ tục hòa giải (nếu có). Sau khi hoàn tất thủ tục cấp xã, hồ sơ sẽ liên thông chuyển lên Chi nhánh Văn phòng Đăng ký đất đai huyện Krông Bông giải quyết theo thẩm quyền.",
    sender: "Y-Nguên Mlô (Buôn Êga)",
    date: "25/04/2026"
  }
]

interface HomeClientProps {
  initialPortalMenus?: any
  initialPosts?: any
  initialBanners?: any
}

export default function HomeClient({ initialPortalMenus, initialPosts, initialBanners }: HomeClientProps) {
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

  const { data: bannersData } = useQuery({
    queryKey: ["public-banners"],
    queryFn: async () => {
      const response = await apiClient.get("/public/banners")
      return response
    },
    initialData: initialBanners,
  })

  const menuItems = React.useMemo(() => {
    if (!menusData?.data || menusData.data.length === 0) {
      return LEFT_MENU_ITEMS
    }
    const verticalMenus = menusData.data.filter(
      (m: any) => m.position?.toUpperCase() === "VERTICAL" && m.isActive !== false
    )
    verticalMenus.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    return verticalMenus.length > 0
      ? verticalMenus.map((m: any) => ({ name: m.name, path: m.link || "/tin-tuc" }))
      : LEFT_MENU_ITEMS
  }, [menusData])

  const middleBanners = React.useMemo(() => {
    if (!bannersData?.data || bannersData.data.length === 0) {
      return []
    }
    const list = bannersData.data.filter(
      (b: any) => (b.position?.toLowerCase() === "middle" || b.position?.toLowerCase() === "bottom") && b.status !== false
    )
    list.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
    return list
  }, [bannersData])

  const customPatrioticBanners = React.useMemo(() => {
    if (!bannersData?.data || bannersData.data.length === 0) {
      return []
    }
    const list = bannersData.data.filter(
      (b: any) => b.position?.toLowerCase() === "custom" && b.status !== false
    )
    list.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
    return list
  }, [bannersData])

  const slides = React.useMemo(() => {
    const dbSlides = postsData?.data
      ? postsData.data.slice(0, 3).map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.description || post.content || "",
          image: post.thumbnail ? resolveMediaUrl(post.thumbnail) : "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
          date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : new Date(post.createdAt).toLocaleDateString("vi-VN"),
          category: post.category?.name || "Tin tức"
        }))
      : []
    return dbSlides.length > 0 ? dbSlides : FEATURED_SLIDES
  }, [postsData])

  const tickerText = React.useMemo(() => {
    if (postsData?.data) {
      const notices = postsData.data.filter((p: any) => p.isNotification || p.category?.slug === "thong-bao").slice(0, 5)
      if (notices.length > 0) {
        return notices.map((n: any) => `🌟 ${n.title}`).join(" | ")
      }
    }
    return "🌟 Chi trả lương hưu và trợ cấp bảo hiểm xã hội tháng 5 từ ngày 4/5 | 🌟 Tập huấn nhận diện kỹ năng phòng, chống tội phạm cướp ngân hàng, tiệm vàng | 🌟 Lãnh đạo tỉnh dâng hương, viếng Nghĩa trang Liệt sĩ tỉnh khu vực phía Đông | 🌟 Lãnh đạo Đảng, Nhà nước vào Lăng viếng Chủ tịch Hồ Chí Minh nhân ngày Thống nhất Đất nước | 🌟 Xã Dang Kang đạt tiêu chuẩn xuất khẩu sầu riêng và cà phê hữu cơ sang thị trường Châu Âu"
  }, [postsData])

  const announcements = React.useMemo(() => {
    if (postsData?.data) {
      const filtered = postsData.data.filter((p: any) => p.isNotification || p.category?.slug === "thong-bao").slice(0, 6).map((post: any) => ({
        id: post.id,
        title: post.title,
        date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : new Date(post.createdAt).toLocaleDateString("vi-VN"),
        dept: post.category?.name || "Thông báo"
      }))
      if (filtered.length > 0) return filtered
    }
    return ANNOUNCEMENTS_SIDE
  }, [postsData])

  const constructionNews = React.useMemo(() => {
    if (postsData?.data) {
      const filtered = postsData.data.filter((p: any) => 
        p.category?.slug === "xay-dung" || 
        p.category?.name?.toLowerCase().includes("xây dựng") ||
        p.category?.name?.toLowerCase().includes("công thương")
      ).slice(0, 3).map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.description || post.content || "",
        image: post.thumbnail ? resolveMediaUrl(post.thumbnail) : "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80",
        date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : new Date(post.createdAt).toLocaleDateString("vi-VN")
      }))
      if (filtered.length > 0) return filtered
    }
    return CONSTRUCTION_NEWS
  }, [postsData])

  const agricultureNews = React.useMemo(() => {
    if (postsData?.data) {
      const filtered = postsData.data.filter((p: any) => 
        p.category?.slug === "nong-nghiep" || 
        p.category?.name?.toLowerCase().includes("nông nghiệp") ||
        p.category?.name?.toLowerCase().includes("nông thôn")
      ).slice(0, 3).map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.description || post.content || "",
        image: post.thumbnail ? resolveMediaUrl(post.thumbnail) : "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=400&q=80",
        date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : new Date(post.createdAt).toLocaleDateString("vi-VN")
      }))
      if (filtered.length > 0) return filtered
    }
    return AGRICULTURE_NEWS
  }, [postsData])

  const galleryPhotos = React.useMemo(() => {
    if (postsData?.data) {
      const withImages = postsData.data.filter((p: any) => p.thumbnail).slice(0, 4).map((post: any) => ({
        id: post.id,
        title: post.title,
        image: resolveMediaUrl(post.thumbnail),
        tag: post.category?.name || "Hình ảnh"
      }))
      if (withImages.length > 0) return withImages
    }
    return GALLERY_PHOTOS
  }, [postsData])

  React.useEffect(() => {
    // Setup automatic slide transition
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 6000)

    // Setup automatic gallery slideshow transition
    const galleryTimer = setInterval(() => {
      setCurrentGalleryIdx(prev => (prev + 1) % galleryPhotos.length)
    }, 5000)

    // Check if user has already voted
    const savedVote = localStorage.getItem("dangkang_portal_poll_voted")
    const savedChoice = localStorage.getItem("dangkang_portal_poll_choice")
    if (savedVote && savedChoice) {
      setPollVoted(true)
      setPollChoice(savedChoice)

      const savedStats = localStorage.getItem("dangkang_portal_poll_stats")
      if (savedStats) {
        setPollStats(JSON.parse(savedStats))
      }
    }

    return () => {
      clearInterval(slideTimer)
      clearInterval(galleryTimer)
    }
  }, [slides.length, galleryPhotos.length])

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)
  }

  const handleVoteSubmit = () => {
    if (!pollChoice) return

    const updatedStats = { ...pollStats }
    if (pollChoice === "verySatisfied") updatedStats.verySatisfied += 1
    else if (pollChoice === "satisfied") updatedStats.satisfied += 1
    else if (pollChoice === "normal") updatedStats.normal += 1
    else if (pollChoice === "unsatisfied") updatedStats.unsatisfied += 1

    setPollStats(updatedStats)
    setPollVoted(true)

    localStorage.setItem("dangkang_portal_poll_voted", "true")
    localStorage.setItem("dangkang_portal_poll_choice", pollChoice)
    localStorage.setItem("dangkang_portal_poll_stats", JSON.stringify(updatedStats))
  }

  const totalVotes = pollStats.verySatisfied + pollStats.satisfied + pollStats.normal + pollStats.unsatisfied

  return (
    <div className="flex flex-col gap-8 md:gap-10 animate-fade-in select-none">

      {/* Dynamic Keyframe Injection for Marquee and Aesthetic Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes verticalMarquee {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-vertical-marquee {
          animation: verticalMarquee 24s linear infinite;
        }
        .animate-vertical-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. Horizontal Scrolling Ticker: Chạy TIN NỔI BẬT (Under the Header) */}
      <div className="w-full bg-[#fff9db] dark:bg-amber-950/20 border border-[#ffe066] dark:border-amber-900/30 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm select-none">
        <div className="flex items-center gap-1.5 text-[#cc0000] dark:text-red-400 font-black shrink-0 text-xs tracking-wider uppercase animate-pulse">
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>TIN NỔI BẬT:</span>
        </div>
        <div className="overflow-hidden relative flex-1 h-5 flex items-center">
          <div className="absolute whitespace-nowrap text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer animate-marquee">
            <span>{tickerText}</span>
            <span className="pl-20">{tickerText}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Main Portal News Layout: 3-Column Structured Layout (Left Menu, Middle Slideshow, Right Announcements) */}
      <div className="flex flex-col gap-4">
        {/* Unified Star Accent Section Header */}
        <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2">
          <span className="text-[#f1c40f] text-lg animate-pulse">⭐</span>
          <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
            TIN TỨC SỰ KIỆN NỔI BẬT & CHỈ ĐẠO ĐIỀU HÀNH
          </h2>
        </div>

        {/* The 3-Column layout: Left menu links, Middle main slider, Right Announcements sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Column 1 (Left, span 3): Danh mục chuyên mục (Internal wing navigation links) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-3 shadow-sm justify-between">
            <div>
              <div className="bg-[#cc0000] text-white py-2 px-3 rounded font-bold text-xs uppercase tracking-wide text-center mb-2 shadow-sm">
                Danh mục chuyên mục
              </div>
              <div className="flex flex-col">
                {menuItems.map((item: any, idx: number) => (
                  <Link
                    key={idx}
                    href={item.path}
                    className="flex gap-2 items-center p-2 rounded text-xs md:text-[13px] font-semibold md:font-bold text-slate-700 dark:text-slate-300 hover:text-[#cc0000] dark:hover:text-red-400 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all group"
                  >
                    <span className="text-[#cc0000]/70 text-[11px] shrink-0 group-hover:translate-x-0.5 transition-transform">
                      🔸
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold block uppercase tracking-wide">ĐƯỜNG DÂY NÓNG UBND XÃ</span>
              <a href="tel:02623812345" className="text-sm text-[#cc0000] dark:text-red-400 font-black tracking-widest mt-0.5 block font-mono">0262.3812.345</a>
            </div>
          </div>

          {/* Column 2 (Middle, span 6): Large Featured Image Slider with Overlay Block */}
          <div className="lg:col-span-6 flex flex-col relative bg-slate-900 rounded-lg overflow-hidden shadow border border-slate-200/5 min-h-[350px] md:h-auto">
            {slides.map((slide: any, idx: number) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-105"
                  }`}
              >
                {/* Slide Background Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/15 z-10" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />

                {/* Semi-transparent Overlay Bottom Block */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col gap-2 bg-gradient-to-t from-black/95 to-black/60 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#cc0000] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      {slide.category}
                    </span>
                    <span className="text-white/80 text-[10px] font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {slide.date}
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-extrabold text-[#fef08a] leading-snug tracking-wide">
                    <Link href={`/tin-tuc`}>{slide.title}</Link>
                  </h3>
                  <p className="text-white/80 text-[11px] line-clamp-2 leading-relaxed">
                    {slide.excerpt}
                  </p>
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
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentSlide ? "bg-[#fef08a] w-4" : "bg-white/40 hover:bg-white/75"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Column 3 (Right, span 3): Thông báo (Announcements Box on side of slider) */}
          <div className="lg:col-span-3 bg-[#faf8f2] dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden shadow-sm justify-between">
            {/* Subtle administrative bronze pattern watermark */}
            <div className="absolute inset-0 bg-[radial-gradient(#cc000004_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />

            <div>
              <div className="border-b border-amber-200/60 dark:border-slate-800 pb-2 mb-3 z-10 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#cc0000]" />
                <span className="text-xs font-black uppercase text-[#cc0000] dark:text-red-400 tracking-wide">
                  Thông báo hành chính
                </span>
              </div>

              {/* The scrolling container gets fixed height to display exactly 4 items at a time */}
              <div className="h-[260px] overflow-hidden relative z-10 select-none mb-2">
                <div className="animate-vertical-marquee flex flex-col gap-4">
                  {/* First set of announcements */}
                  {announcements.map((ann: any) => (
                    <div key={`${ann.id}-1`} className="group border-b border-dashed border-amber-200/30 dark:border-slate-800/50 pb-2.5 last:border-none last:pb-0">
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
                  {/* Second set of announcements for seamless vertical loop */}
                  {announcements.map((ann: any) => (
                    <div key={`${ann.id}-2`} className="group border-b border-dashed border-amber-200/30 dark:border-slate-800/50 pb-2.5 last:border-none last:pb-0">
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
            </div>

            {/* Citizen Support Quick Info Box */}
            <div className="p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-amber-200/30 dark:border-slate-800/60 flex items-center gap-3 z-10 shrink-0 shadow-sm mb-1">
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
              className="mt-1 pt-2.5 border-t border-amber-200/60 dark:border-slate-800 text-center text-xs text-[#cc0000] dark:text-red-400 font-extrabold uppercase tracking-widest hover:underline z-10 flex items-center justify-center gap-1 shrink-0"
            >
              Xem tất cả thông báo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

      {/* 3. Horizontal Decorative Patriotic Promotion Banner 1 */}
      {customPatrioticBanners.length > 0 ? (
        customPatrioticBanners.map((banner: any) => {
          let styles = {
            bgType: "gradient",
            bgGradientStart: "#990000",
            bgGradientMiddle: "#cc0000",
            bgGradientEnd: "#800000",
            titleColor: "#fbc02d",
            textColor: "#fff7ed",
            alignment: "left",
            showStar: true,
            starColor: "#ffff00",
            starOpacity: 0.08,
            buttonBg: "#ffde59",
            buttonTextColor: "#0f172a",
            buttonText: "Tìm hiểu thêm"
          };
          if (banner.metaDescription) {
            try {
              const parsed = JSON.parse(banner.metaDescription);
              if (parsed && typeof parsed === "object") {
                styles = { ...styles, ...parsed };
              }
            } catch (e) {
              // fallback
            }
          }

          const bgStyle = {
            background: `linear-gradient(to right, ${styles.bgGradientStart}, ${styles.bgGradientMiddle || styles.bgGradientStart}, ${styles.bgGradientEnd})`
          };

          return (
            <div 
              key={banner.id} 
              style={bgStyle}
              className={`w-full text-white py-4.5 px-6 md:px-8 rounded-xl shadow border-y border-[#ffde59]/25 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all duration-300 ${
                styles.alignment === "center" ? "text-center md:items-center" : 
                styles.alignment === "right" ? "text-right md:flex-row-reverse" : "text-left"
              }`}
            >
              {/* Intricate Gold Borders */}
              <div className="absolute inset-x-0 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />

              {/* Traditional Gold Star Watermark */}
              {styles.showStar && (
                <div 
                  className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
                  style={{ opacity: styles.starOpacity }}
                >
                  <svg className="w-56 h-56" style={{ color: styles.starColor }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
                  </svg>
                </div>
              )}

              <div className="z-10 flex flex-col gap-1 flex-1">
                <span 
                  style={{ color: styles.titleColor }}
                  className={`text-xs font-black tracking-widest uppercase flex items-center gap-1.5 drop-shadow-sm ${
                    styles.alignment === "center" ? "justify-center" : 
                    styles.alignment === "right" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>⭐</span> {banner.name}
                </span>
                {banner.description && (
                  <h3 
                    style={{ color: styles.textColor }}
                    className="text-sm md:text-base font-black tracking-wide leading-snug uppercase drop-shadow"
                  >
                    &quot;{banner.description}&quot;
                  </h3>
                )}
              </div>
              {banner.customUrl && (
                <div className="z-10 shrink-0">
                  <a
                    href={banner.customUrl}
                    target={banner.target || "_self"}
                    rel={banner.target === "_blank" ? "noopener noreferrer" : undefined}
                    style={{ backgroundColor: styles.buttonBg, color: styles.buttonTextColor }}
                    className="inline-flex items-center gap-1.5 text-slate-950 text-xs font-black tracking-wider uppercase px-4 py-2.5 rounded shadow-md border border-amber-300/30 transition-all transform hover:scale-105"
                  >
                    {styles.buttonText || "Tìm hiểu thêm"}
                    <Info className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="w-full bg-gradient-to-r from-[#990000] via-[#cc0000] to-[#800000] text-white py-4.5 px-6 md:px-8 rounded-xl shadow border-y border-[#ffde59]/25 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative overflow-hidden">
          {/* Intricate Gold Borders */}
          <div className="absolute inset-x-0 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#ffde59]/50 to-transparent" />

          {/* Traditional Gold Star Watermark */}
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
      )}

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
                {/* Micro hover shadow glow decoration */}
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

      {/* 5. Cloned Category Section 1: LĨNH VỰC XÂY DỰNG & CÔNG THƯƠNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: News list */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2">
            <span className="text-[#f1c40f] text-lg">⭐</span>
            <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
              Tin tức lĩnh vực xây dựng và công thương
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {constructionNews.map((news: any) => (
              <div
                key={news.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-sm hover:shadow-md hover:border-[#cc0000] transition-all flex flex-col sm:flex-row gap-4 group"
              >
                <div className="w-full sm:w-44 h-28 overflow-hidden rounded relative shrink-0">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-slate-400 text-[9px] font-bold tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {news.date}
                  </span>
                  <h4 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-[#cc0000] dark:group-hover:text-red-400 transition-colors tracking-wide line-clamp-2">
                    <Link href={`/tin-tuc`}>{news.title}</Link>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed font-semibold">
                    {news.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Category navigation links on light textured background */}
        <div className="lg:col-span-4 bg-[#faf8f2] dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden shadow-sm h-full self-stretch justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(#cc000004_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />

          <div>
            <div className="border-b border-amber-200/60 dark:border-slate-800 pb-2 mb-3.5 z-10 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-[#cc0000]" />
              <span className="text-xs font-black uppercase text-[#cc0000] dark:text-red-400 tracking-wide">
                Chuyên mục xây dựng
              </span>
            </div>

            <div className="flex flex-col gap-3 z-10">
              {CONSTRUCTION_LINKS.map((link, idx) => (
                <div key={idx} className="group border-b border-dashed border-amber-200/30 dark:border-slate-800/50 pb-2.5 last:border-none last:pb-0">
                  <Link
                    href={link.link}
                    className="flex gap-2 items-start text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#cc0000] dark:group-hover:text-red-400 transition-colors leading-relaxed"
                  >
                    <span className="text-[#cc0000] text-xs shrink-0 select-none group-hover:translate-x-0.5 transition-transform mt-0.5">
                      🔴
                    </span>
                    <span>{link.text}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/tin-tuc"
            className="mt-6 pt-3.5 border-t border-amber-200/60 dark:border-slate-800 text-center text-[10px] text-[#cc0000] dark:text-red-400 font-extrabold uppercase tracking-widest hover:underline z-10 flex items-center justify-center gap-1"
          >
            Xem tất cả chuyên đề
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6. Cloned Category Section 2: LĨNH VỰC NÔNG NGHIỆP & TÀI NGUYÊN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: News list */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2">
            <span className="text-[#f1c40f] text-lg">⭐</span>
            <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
              Tin tức lĩnh vực nông nghiệp và môi trường
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {agricultureNews.map((news: any) => (
              <div
                key={news.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-sm hover:shadow-md hover:border-[#cc0000] transition-all flex flex-col sm:flex-row gap-4 group"
              >
                <div className="w-full sm:w-44 h-28 overflow-hidden rounded relative shrink-0">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-slate-400 text-[9px] font-bold tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {news.date}
                  </span>
                  <h4 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-[#cc0000] dark:group-hover:text-red-400 transition-colors tracking-wide line-clamp-2">
                    <Link href={`/tin-tuc`}>{news.title}</Link>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed font-semibold">
                    {news.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Category navigation links on light textured background */}
        <div className="lg:col-span-4 bg-[#faf8f2] dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden shadow-sm h-full self-stretch justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(#cc000004_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />

          <div>
            <div className="border-b border-amber-200/60 dark:border-slate-800 pb-2 mb-3.5 z-10 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-[#cc0000]" />
              <span className="text-xs font-black uppercase text-[#cc0000] dark:text-red-400 tracking-wide">
                Chuyên mục nông nghiệp
              </span>
            </div>

            <div className="flex flex-col gap-3 z-10">
              {AGRICULTURE_LINKS.map((link, idx) => (
                <div key={idx} className="group border-b border-dashed border-amber-200/30 dark:border-slate-800/50 pb-2.5 last:border-none last:pb-0">
                  <Link
                    href={link.link}
                    className="flex gap-2 items-start text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#cc0000] dark:group-hover:text-red-400 transition-colors leading-relaxed"
                  >
                    <span className="text-[#cc0000] text-xs shrink-0 select-none group-hover:translate-x-0.5 transition-transform mt-0.5">
                      🔴
                    </span>
                    <span>{link.text}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/tin-tuc"
            className="mt-6 pt-3.5 border-t border-amber-200/60 dark:border-slate-800 text-center text-[10px] text-[#cc0000] dark:text-red-400 font-extrabold uppercase tracking-widest hover:underline z-10 flex items-center justify-center gap-1"
          >
            Xem tất cả chuyên đề
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 7. Commune Photo Gallery Section - "THƯ VIỆN ẢNH HOẠT ĐỘNG DANG KANG" */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2">
          <span className="text-[#f1c40f] text-lg">⭐</span>
          <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
            THƯ VIỆN ẢNH HOẠT ĐỘNG & QUÊ HƯƠNG DANG KANG
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 md:p-6 shadow-sm">

          {/* Left Column: Large Highlight Image Slide */}
          <div className="lg:col-span-8 relative h-64 sm:h-[420px] rounded-xl overflow-hidden group/slide bg-slate-950 shadow-inner">
            {galleryPhotos.map((photo: any, idx: number) => {
              const isActive = idx === currentGalleryIdx
              return (
                <div
                  key={photo.id}
                  onClick={() => {
                    setLightboxImg(photo.image)
                    setLightboxTitle(photo.title)
                  }}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-zoom-in ${isActive ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-105 pointer-events-none"
                    }`}
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover/slide:scale-105 transition-transform duration-700"
                  />
                  {/* Tag and Title Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-4 sm:p-6 z-10">
                    <span className="self-start bg-[#cc0000] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded shadow border border-white/5">
                      {photo.tag}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm sm:text-lg font-black text-white leading-snug tracking-wide drop-shadow">
                        {photo.title}
                      </h3>
                      <span className="text-[10px] text-slate-300 font-bold tracking-wider flex items-center gap-1.5 uppercase">
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                        Xem ảnh lớn phóng to
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Slider Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentGalleryIdx((currentGalleryIdx - 1 + galleryPhotos.length) % galleryPhotos.length)
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/75 text-white transition-colors z-20 border border-white/5 opacity-0 group-hover/slide:opacity-100"
              title="Trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentGalleryIdx((currentGalleryIdx + 1) % galleryPhotos.length)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/75 text-white transition-colors z-20 border border-white/5 opacity-0 group-hover/slide:opacity-100"
              title="Sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Thumbnail Selector List */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
            {galleryPhotos.map((photo: any, idx: number) => {
              const isActive = idx === currentGalleryIdx
              return (
                <button
                  key={photo.id}
                  onClick={() => setCurrentGalleryIdx(idx)}
                  className={`flex gap-3 items-center p-2.5 rounded-xl border text-left transition-all ${isActive
                    ? "bg-red-50/50 dark:bg-red-950/20 border-[#cc0000] shadow-sm"
                    : "bg-slate-50/50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-800/80 hover:bg-slate-100/50"
                    }`}
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 relative border border-slate-200/20">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-[#cc0000]/25 flex items-center justify-center">
                        <span className="text-white text-xs animate-pulse">⭐</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-[#cc0000] dark:text-red-400" : "text-slate-400"
                      }`}>
                      {photo.tag}
                    </span>
                    <h4 className={`text-[11px] font-extrabold truncate ${isActive ? "text-[#cc0000] dark:text-red-400" : "text-slate-700 dark:text-slate-300"
                      }`}>
                      {photo.title}
                    </h4>
                  </div>
                </button>
              )
            })}
          </div>

        </div>
      </div>

      {/* Lightbox / Modal for Photo Gallery */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-4 animate-fade-in cursor-zoom-out select-none"
          onClick={() => {
            setLightboxImg(null)
            setLightboxTitle(null)
          }}
        >
          <div className="relative max-w-4xl w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-lg bg-slate-950 border border-white/10 shadow-2xl">
            <img
              src={lightboxImg}
              alt={lightboxTitle || "Ảnh"}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white font-black text-sm px-3 py-1.5 rounded-full border border-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxImg(null)
                setLightboxTitle(null)
              }}
            >
              Đóng ✕
            </button>
          </div>
          {lightboxTitle && (
            <p className="mt-4 text-center text-xs md:text-sm font-bold text-white max-w-2xl px-6 py-2.5 bg-black/50 rounded-full backdrop-blur border border-white/5 drop-shadow-md">
              📌 {lightboxTitle}
            </p>
          )}
        </div>
      )}

      {/* 8. Dedicated Interactive Dashboard: Gathered Civic and Sidebar Widgets in elegant 4-column row */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b-2 border-[#cc0000] pb-2">
          <span className="text-[#f1c40f] text-lg">⭐</span>
          <h2 className="text-base md:text-lg font-black text-[#cc0000] dark:text-red-500 uppercase tracking-wide">
            CỔNG TƯƠNG TÁC CÔNG DÂN & TIỆN ÍCH DỊCH VỤ SỐ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">

          {/* Dashboard Item 1: Key leadership directory */}
          <div className="bg-gradient-to-br from-[#990000] via-[#5c0000] to-slate-950 p-4.5 rounded-lg border border-[#ff0000]/10 shadow text-white relative overflow-hidden h-full animate-fade-in">
            <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <Award className="w-4.5 h-4.5 text-[#fbc02d]" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-100">
                Lãnh đạo UBND Xã
              </h4>
            </div>

            <div className="flex flex-col gap-3.5">
              {LEADERS.map((leader) => (
                <div key={leader.name} className="flex gap-2.5 items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 group">
                  <div className="w-9 h-9 rounded-full bg-white/10 shrink-0 border border-white/15 flex items-center justify-center text-[#fbc02d] font-bold text-xs shadow-inner relative">
                    {leader.hasStar ? (
                      <span className="absolute -top-1 -right-1 text-[9px] bg-amber-500 rounded-full p-0.5 leading-none shadow-sm border border-slate-900 select-none">
                        ⭐
                      </span>
                    ) : null}
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h5 className="text-xs md:text-sm font-extrabold text-[#ffde59] group-hover:text-white transition-colors truncate">{leader.name}</h5>
                    <span className="text-[10.5px] md:text-xs text-slate-300 font-semibold tracking-wide truncate">{leader.role}</span>
                    <a
                      href={`tel:${leader.phone}`}
                      className="text-[10.5px] md:text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors font-mono font-semibold mt-0.5"
                    >
                      <Phone className="w-2.5 h-2.5 text-[#fbc02d]" /> {leader.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Item 2: Satisfaction Survey Poll */}
          <div id="khao-sat" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-lg shadow-sm flex flex-col gap-3 h-full justify-between animate-fade-in">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                  Khảo sát Một Cửa
                </h4>
              </div>

              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                Ý kiến của bạn về chất lượng giải quyết thủ tục hành chính tại bộ phận Một cửa xã Dang Kang?
              </p>

              {!pollVoted ? (
                <div className="flex flex-col gap-2">
                  {[
                    { value: "verySatisfied", label: "🤩 Rất hài lòng" },
                    { value: "satisfied", label: "😊 Hài lòng" },
                    { value: "normal", label: "😐 Bình thường" },
                    { value: "unsatisfied", label: "😞 Không hài lòng" }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer transition-all text-xs font-semibold ${pollChoice === option.value
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/75 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/45 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="satisfaction-poll"
                        value={option.value}
                        checked={pollChoice === option.value}
                        onChange={(e) => setPollChoice(e.target.value)}
                        className="w-3.5 h-3.5 text-emerald-600 bg-slate-100 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-1 animate-fade-in text-xs font-semibold">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">
                    CẢM ƠN BẠN ĐÃ BÌNH CHỌN!
                  </span>

                  <div className="flex flex-col gap-2">
                    {[
                      { key: "verySatisfied", label: "🤩 Rất hài lòng", count: pollStats.verySatisfied },
                      { key: "satisfied", label: "😊 Hài lòng", count: pollStats.satisfied },
                      { key: "normal", label: "😐 Bình thường", count: pollStats.normal },
                      { key: "unsatisfied", label: "😞 Không hài lòng", count: pollStats.unsatisfied }
                    ].map((stat) => {
                      const percent = Math.round((stat.count / totalVotes) * 100) || 0
                      const isUserChoice = pollChoice === stat.key

                      return (
                        <div key={stat.key} className="flex flex-col gap-0.5">
                          <div className="flex justify-between">
                            <span className={isUserChoice ? "font-black text-emerald-600 dark:text-emerald-400" : "text-slate-700"}>
                              {stat.label}
                            </span>
                            <span className="font-mono text-xs">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${isUserChoice ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-700"
                                }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {!pollVoted && (
              <button
                onClick={handleVoteSubmit}
                disabled={!pollChoice}
                className="w-full mt-2 bg-[#cc0000] hover:bg-[#a80000] disabled:bg-slate-200 text-white text-xs font-black tracking-widest uppercase py-2.5 rounded shadow-sm transition-all"
              >
                GỬI BÌNH CHỌN
              </button>
            )}
          </div>

          {/* Dashboard Item 3: Live Citizen Ask & Answer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-lg shadow-sm flex flex-col gap-3 h-full justify-between animate-fade-in">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                  Phản hồi công dân
                </h4>
              </div>

              <div className="flex flex-col gap-2">
                {MOCK_QA.map((qa, index) => {
                  const isOpen = activeQaIdx === index
                  return (
                    <div
                      key={index}
                      className="border border-slate-150 dark:border-slate-800/40 rounded overflow-hidden text-xs bg-slate-50/40 dark:bg-slate-950/10"
                    >
                      <button
                        onClick={() => setActiveQaIdx(isOpen ? null : index)}
                        className="w-full p-2.5 text-left font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex justify-between items-start gap-1 transition-colors"
                      >
                        <span className="line-clamp-1 leading-snug font-extrabold">{qa.q}</span>
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed text-slate-600 dark:text-slate-400 font-semibold flex flex-col gap-1.5 text-xs">
                          <p className="line-clamp-3 leading-relaxed text-slate-700 dark:text-slate-300">{qa.a}</p>
                          <div className="flex items-center gap-1 text-[10.5px] font-black text-emerald-600 uppercase">
                            <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" strokeWidth={3} />
                            <span>Đã phản hồi</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <Link
              href="/tuong-tac"
              className="text-center bg-[#cc0000] hover:bg-[#a80000] text-white text-xs font-black tracking-widest py-2.5 rounded shadow transition-all block uppercase"
            >
              GỬI CÂU HỎI MỚI
            </Link>
          </div>

          {/* Dashboard Item 4: Administrative Link Banners */}
          <div className="flex flex-col gap-2 h-full animate-fade-in justify-start">
            {middleBanners.length > 0 ? (
              middleBanners.map((banner: any) => (
                <a
                  key={banner.id}
                  href={banner.customUrl || "#"}
                  target={banner.target || "_blank"}
                  rel="noopener noreferrer"
                  className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#cc0000] hover:shadow-md transition-all flex flex-col group flex-1"
                >
                  <div className="w-full h-24 overflow-hidden relative">
                    <img 
                      src={resolveMediaUrl(banner.imageUrl)} 
                      alt={banner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-2 flex flex-col justify-center">
                    <span className="text-[9px] text-[#cc0000] dark:text-red-400 font-extrabold tracking-wider uppercase">LIÊN THÔNG BAN NGÀNH</span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate mt-0.5 group-hover:text-[#cc0000] transition-colors">
                      {banner.name}
                    </span>
                  </div>
                </a>
              ))
            ) : (
              [
                { label: "CỔNG DỊCH VỤ CÔNG QUỐC GIA", sub: "dichvucong.gov.vn", url: "https://dichvucong.gov.vn" },
                { label: "CỔNG THÔNG TIN TỈNH ĐẮK LẮK", sub: "daklak.gov.vn", url: "https://daklak.gov.vn" },
                { label: "CỔNG THÔNG TIN HUYỆN KRÔNG BÔNG", sub: "krongbong.daklak.gov.vn", url: "https://krongbong.daklak.gov.vn" }
              ].map((banner) => (
                <a
                  key={banner.label}
                  href={banner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#cc0000] hover:shadow-sm shadow-sm transition-all flex items-center justify-between group flex-1"
                >
                  <div className="flex flex-col">
                    <span className="text-[10.5px] text-[#cc0000] dark:text-red-400 font-extrabold tracking-wider">LIÊN THÔNG BAN NGÀNH</span>
                    <span className="text-xs md:text-[13px] font-black text-slate-800 dark:text-slate-100 mt-0.5 tracking-wide group-hover:text-[#cc0000] transition-colors">{banner.label}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#cc0000] transition-colors shrink-0" />
                </a>
              ))
            )}
          </div>

        </div>
      </div>

      {/* 9. Horizontal Decorative Patriotic Sea/Island Promotion Banner 2 */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-sky-800 to-teal-800 text-white py-4.5 px-6 md:px-8 rounded-xl shadow border-y border-sky-300/25 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative overflow-hidden">
        {/* Intricate Gold Borders */}
        <div className="absolute inset-x-0 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0.5 h-[1px] bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />

        {/* Lighthouse/Map styling overlay */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none z-0">
          <svg className="w-40 h-40 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div className="z-10 flex flex-col gap-1">
          <span className="text-[#ffde59] text-xs font-black tracking-widest uppercase flex items-center justify-center md:justify-start gap-1.5 drop-shadow-sm">
            <span>⚓</span> BẢO VỆ CHỦ QUYỀN BIỂN ĐẢO QUÊ HƯƠNG VIỆT NAM
          </span>
          <h3 className="text-sm md:text-base font-black tracking-wide leading-snug uppercase text-sky-50 drop-shadow">
            &quot;HOÀNG SA - TRƯỜNG SA LÀ CỦA VIỆT NAM • QUYẾT TÂM GIỮ VỮNG BIÊN CƯƠNG TOÀN VẸN LÃNH THỔ!&quot;
          </h3>
        </div>
        <div className="z-10 shrink-0">
          <a
            href="https://dichvucong.gov.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-blue-900 text-xs font-black tracking-wider uppercase px-4 py-2.5 rounded shadow-md border border-white transition-all transform hover:scale-105"
          >
            Nền tảng một cửa Quốc Gia
            <ExternalLink className="w-4 h-4 text-blue-900" />
          </a>
        </div>
      </div>

    </div>
  )
}
