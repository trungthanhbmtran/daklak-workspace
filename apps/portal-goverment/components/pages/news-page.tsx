"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-context"
import { Calendar, Search, ArrowRight, Home, ChevronRight } from "lucide-react"

const ALL_NEWS_VI = [
  {
    id: 1,
    title: "Lãnh đạo huyện làm việc với UBND xã Dang Kang về phát triển KT-XH năm 2026",
    excerpt: "Sáng 29/4, UBND huyện Krông Bông phối hợp cùng các Sở ban ngành làm việc trực tiếp tại UBND xã Dang Kang về kế hoạch chuyển đổi cơ cấu cây trồng nông nghiệp công nghệ cao...",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    date: "29/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "4 phút đọc"
  },
  {
    id: 2,
    title: "Khởi công mở rộng đường liên thôn 3 và thôn 4 nông thôn mới kiểu mẫu",
    excerpt: "Dự án có tổng mức đầu tư hơn 5 tỷ đồng trích từ nguồn ngân sách xã xã hội hóa và người dân tự nguyện hiến đất mở rộng hành lang lộ giới lên 8m...",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80",
    date: "28/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "5 phút đọc"
  },
  {
    id: 3,
    title: "Tập huấn chuyển đổi số và ứng dụng CNTT cho bà con nông dân trồng cà phê",
    excerpt: "Hơn 120 hộ dân tiêu biểu của xã đã tham gia lớp tập huấn sử dụng ứng dụng truy xuất nguồn gốc nông sản và theo dõi diễn biến giá cả thị trường...",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    date: "26/04/2026",
    category: "kinh-te",
    categoryName: "Kinh tế - Xã hội",
    readTime: "3 phút đọc"
  },
  {
    id: 101,
    title: "Đảng ủy UBND tỉnh: Siết chặt kỷ cương, điều hành linh hoạt, phấn đấu tăng trưởng hai con số",
    excerpt: "UBND tỉnh yêu cầu siết chặt kỷ luật kỷ cương hành chính, nâng cao trách nhiệm người đứng đầu, tháo gỡ khó khăn thúc đẩy tăng trưởng kinh tế bền vững.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    date: "29/04/2026",
    category: "dang-uy",
    categoryName: "Hoạt động Đảng",
    readTime: "3 phút đọc"
  },
  {
    id: 102,
    title: "HĐND xã Dang Kang chuẩn bị nội dung cho kỳ họp chuyên đề lần thứ 8 khóa XI",
    excerpt: "Thường trực HĐND xã làm việc thống nhất các tờ trình quy hoạch chi tiết xây dựng trung tâm hành chính và phân bổ ngân sách đầu tư công trung hạn.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
    date: "28/04/2026",
    category: "hdnd",
    categoryName: "Hội đồng nhân dân",
    readTime: "4 phút đọc"
  },
  {
    id: 103,
    title: "UBND xã phát động chiến dịch tổng vệ sinh môi trường, phòng ngừa dịch sốt xuất huyết",
    excerpt: "Đồng loạt 8 thôn buôn trên địa bàn xã ra quân diệt lăng quăng, phát quang bụi rậm, khơi thông cống rãnh tránh nước đọng mùa mưa lũ.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    date: "27/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "3 phút đọc"
  },
  {
    id: 104,
    title: "Phổ biến tập huấn Luật Đất đai sửa đổi bổ sung năm 2026 cho cán bộ địa chính xã",
    excerpt: "Tăng cường năng lực quản lý nhà nước về đất đai, giải quyết tranh chấp đất đai tại cơ sở đúng pháp luật và hài hòa quyền lợi công dân.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    date: "25/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "5 phút đọc"
  },
  {
    id: 105,
    title: "Ngày hội văn hóa thể thao các dân tộc thiểu số xã Dang Kang lần thứ III năm 2026",
    excerpt: "Quy tụ hơn 300 vận động viên, nghệ nhân tranh tài ở các nội dung bắn nỏ, đẩy gậy, kéo co và trình diễn nhạc cụ cồng chiêng Êđê truyền thống.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
    date: "24/04/2026",
    category: "kinh-te",
    categoryName: "Văn hóa - Xã hội",
    readTime: "6 phút đọc"
  },
  {
    id: 106,
    title: "Mô hình nuôi heo rừng lai sinh sản hướng đi phát triển kinh tế hộ buôn Êga",
    excerpt: "Từ nguồn vốn vay ưu đãi giải quyết việc làm của Ngân hàng Chính sách Xã hội, many hộ đồng bào đã thoát nghèo bền vững nhờ nuôi heo lai thương phẩm.",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
    date: "22/04/2026",
    category: "kinh-te",
    categoryName: "Kinh tế - Đời sống",
    readTime: "4 phút đọc"
  }
]

const ALL_NEWS_EN = [
  {
    id: 1,
    title: "District leadership works with Dang Kang Commune on Socio-Economic Development in 2026",
    excerpt: "On the morning of April 29, Krong Bong District People's Committee held a live meeting at Dang Kang PC regarding high-tech agricultural cultivation crop restructuring...",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    date: "29/04/2026",
    category: "ubnd",
    categoryName: "People's Committee",
    readTime: "4 min read"
  },
  {
    id: 2,
    title: "Commenced expansion of inter-hamlet 3 and hamlet 4 model new countryside roads",
    excerpt: "The project has a total investment of over 5 billion VND funded by commune budget and local citizens' land donations to expand the road width to 8m...",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80",
    date: "28/04/2026",
    category: "ubnd",
    categoryName: "People's Committee",
    readTime: "5 min read"
  },
  {
    id: 3,
    title: "Digital transformation and IT training for coffee farming households",
    excerpt: "Over 120 key households in the commune attended training on utilizing agricultural traceability apps and tracking daily global market coffee prices...",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    date: "26/04/2026",
    category: "kinh-te",
    categoryName: "Socio-Economics",
    readTime: "3 min read"
  },
  {
    id: 101,
    title: "Provincial Party: Enforce operational discipline, flexible policies for double-digit growth",
    excerpt: "The Provincial People's Committee requires strict administrative discipline, raising leaders' responsibility to remove barriers and boost sustainable economic growth.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    date: "29/04/2026",
    category: "dang-uy",
    categoryName: "Party Activity",
    readTime: "3 min read"
  },
  {
    id: 102,
    title: "Dang Kang Commune Council prepares documents for 8th special session",
    excerpt: "The Council standing board works to unify draft blueprints on building the administrative center and allocating mid-term public investment funds.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
    date: "28/04/2026",
    category: "hdnd",
    categoryName: "People's Council",
    readTime: "4 min read"
  },
  {
    id: 103,
    title: "Commune PC launches environmental sanitation campaign to prevent dengue fever",
    excerpt: "Simultaneously, 8 hamlets across the commune took action to eradicate mosquitoes, clear bushes, and drain stagnant water in preparation for the rainy season.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    date: "27/04/2026",
    category: "ubnd",
    categoryName: "People's Committee",
    readTime: "3 min read"
  },
  {
    id: 104,
    title: "Disseminated Land Law 2026 updates training course for commune cadastral officers",
    excerpt: "Enhancing state management capacity in land administration, resolving disputes locally in accordance with regulations and safeguarding citizens' rights.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    date: "25/04/2026",
    category: "ubnd",
    categoryName: "People's Committee",
    readTime: "5 min read"
  },
  {
    id: 105,
    title: "The 3rd Ethnic Minority Cultural and Sports Festival of Dang Kang commune",
    excerpt: "Gathering more than 300 athletes and artisans to compete in archery, stick pushing, tug of war, and traditional Ede gong instrument performances.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
    date: "24/04/2026",
    category: "kinh-te",
    categoryName: "Socio-Economics",
    readTime: "6 min read"
  },
  {
    id: 106,
    title: "Crossbred wild boar farming model represents economic growth for Ega village",
    excerpt: "Using preferential loan funds from the Social Policy Bank, many ethnic minority households successfully escaped poverty by raising boars for food.",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
    date: "22/04/2026",
    category: "kinh-te",
    categoryName: "Socio-Economics",
    readTime: "4 min read"
  }
]

function NewsListPageContent() {
  const { language, t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialCategory = searchParams.get("category") || "all"
  const initialSearch = searchParams.get("search") || ""

  const [activeCategory, setActiveCategory] = React.useState(initialCategory)
  const [searchQuery, setSearchQuery] = React.useState(initialSearch)

  const ALL_NEWS = language === "vi" ? ALL_NEWS_VI : ALL_NEWS_EN

  const CATEGORIES = [
    { label: language === "vi" ? "Tất cả tin tức" : "All News", value: "all" },
    { label: language === "vi" ? "Hoạt động Đảng Ủy" : "Commune Party", value: "dang-uy" },
    { label: language === "vi" ? "Hội đồng nhân dân" : "People's Council", value: "hdnd" },
    { label: language === "vi" ? "Ủy ban nhân dân" : "People's Committee", value: "ubnd" },
    { label: language === "vi" ? "Kinh tế - Đời sống" : "Socio-Economics", value: "kinh-te" }
  ]

  React.useEffect(() => {
    setActiveCategory(searchParams.get("category") || "all")
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    const routePath = language === "vi" ? "/tin-tuc" : "/news"
    if (query) {
      router.push(`${routePath}?search=${encodeURIComponent(query)}&category=${activeCategory}`)
    } else {
      router.push(`${routePath}?category=${activeCategory}`)
    }
  }

  const handleCategorySelect = (val: string) => {
    setActiveCategory(val)
    const routePath = language === "vi" ? "/tin-tuc" : "/news"
    if (searchQuery.trim()) {
      router.push(`${routePath}?category=${val}&search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push(`${routePath}?category=${val}`)
    }
  }

  // Filter posts logic
  const filteredNews = ALL_NEWS.filter(post => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory
    const matchesSearch = !searchQuery.trim() || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in select-none">
      
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-[#b91c1c] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {t("Trang chủ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300">
          {language === "vi" ? "Tin tức - Chuyên mục" : "News & Portals"}
        </span>
      </div>

      {/* Page Title & Search area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            {language === "vi" ? "KÊNH TIN TỨC CHÍNH THỨC" : "OFFICIAL NEWS PORTAL"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {language === "vi" 
              ? "Theo dõi các hoạt động chính trị, kinh tế, đời sống xã hội tại xã Dang Kang" 
              : "Follow political, economic, and social life events in Dang Kang Commune"}
          </p>
        </div>

        {/* Dynamic Inner Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md flex items-center">
          <input
            type="text"
            placeholder={language === "vi" ? "Tìm theo tiêu đề, nội dung bài viết..." : "Search by article title or keyword..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 focus:text-slate-900 text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-red-600 transition-all shadow-inner dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          />
          <button 
            type="submit" 
            className="absolute right-1 p-2 rounded-lg text-slate-400 hover:text-[#b91c1c]"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main Content Layout (Sidebar Categories vs Listings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Sidebar Category Filter List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-3 sm:gap-4">
          <h4 className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            {language === "vi" ? "CHUYÊN MỤC TIN" : "NEWS CATEGORIES"}
          </h4>
          <div className="flex flex-col gap-1.5 font-semibold text-xs text-slate-500">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`text-left px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-between group ${
                  activeCategory === cat.value
                    ? "bg-red-50 text-[#b91c1c] dark:bg-red-950/20 dark:text-[#fbc02d]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-950"
                }`}
              >
                <span>{cat.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                  activeCategory === cat.value ? "opacity-100 text-[#b91c1c] dark:text-[#fbc02d]" : "text-slate-400"
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Listings grid */}
        <div className="lg:col-span-9 flex flex-col gap-4 sm:gap-6">
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredNews.map((post) => {
                const articlePath = language === "vi" ? `/tin-tuc/${post.id}` : `/news/${post.id}`
                return (
                  <div 
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group h-full"
                  >
                    <div className="h-44 overflow-hidden relative shrink-0">
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm z-10 border border-white/5">
                        {post.categoryName}
                      </div>
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold tracking-wider">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {post.date}
                        </span>
                        <span>{post.readTime}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-[#b91c1c] transition-colors tracking-wide">
                        <Link href={articlePath}>{post.title}</Link>
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
                        <Link 
                          href={articlePath}
                          className="text-[10px] text-slate-900 dark:text-[#fbc02d] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:underline"
                        >
                          {language === "vi" ? "Chi tiết bài viết" : "Read Full Article"}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:text-white rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <h5 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                {language === "vi" ? "Không tìm thấy bài viết phù hợp" : "No matching articles found"}
              </h5>
              <p className="text-xs text-slate-400 font-medium">
                {language === "vi" 
                  ? "Vui lòng nhập từ khóa tìm kiếm khác hoặc lựa chọn chuyên mục khác." 
                  : "Please input a different search keyword or select another news category."}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

export default function NewsListPage() {
  const { language } = useLanguage()
  return (
    <React.Suspense fallback={<div className="text-center py-12 text-slate-400 font-bold">{language === "vi" ? "Đang tải..." : "Loading..."}</div>}>
      <NewsListPageContent />
    </React.Suspense>
  )
}
