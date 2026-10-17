"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { usePublicPosts } from "@/hooks/usePublicData"
import { resolveMediaUrl } from "@/lib/utils"
import { Calendar, Search, ArrowRight, Home, ChevronRight, Newspaper } from "lucide-react"

const newsPageTranslations = {
  vi: {
    home: "Trang chủ",
    newsCategory: "Tin tức - Chuyên mục",
    title: "KÊNH TIN TỨC CHÍNH THỨC",
    subtitle: "Theo dõi các hoạt động chính trị, kinh tế, đời sống xã hội tại xã Dang Kang",
    placeholder: "Tìm theo tiêu đề, nội dung bài viết...",
    categoryTitle: "CHUYÊN MỤC TIN",
    noNewsTitle: "Không tìm thấy bài viết phù hợp",
    noNewsDesc: "Vui lòng nhập từ khóa tìm kiếm khác hoặc lựa chọn chuyên mục khác.",
    loading: "Đang tải danh sách bài viết...",
    detailText: "Chi tiết bài viết",
    allNews: "Tất cả tin tức",
    dangUy: "Hoạt động Đảng Ủy",
    hdnd: "Hội đồng nhân dân",
    ubnd: "Ủy ban nhân dân",
    kinhTe: "Kinh tế - Đời sống",
  },
  en: {
    home: "Home",
    newsCategory: "News - Categories",
    title: "OFFICIAL NEWS PORTAL",
    subtitle: "Follow political, economic, and social life events in Dang Kang Commune",
    placeholder: "Search by title, content of the article...",
    categoryTitle: "NEWS CATEGORIES",
    noNewsTitle: "No matching articles found",
    noNewsDesc: "Please enter a different search keyword or select another category.",
    loading: "Loading articles...",
    detailText: "Article Details",
    allNews: "All News",
    dangUy: "Party Committee Activities",
    hdnd: "People's Council",
    ubnd: "People's Committee",
    kinhTe: "Economy - Life",
  }
}

// Map chuyên mục UI -> từ khóa nhận diện category thật từ BE (slug/code/name)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "dang-uy": ["đảng", "dang"],
  "hdnd": ["hội đồng nhân dân", "hdnd"],
  "ubnd": ["ủy ban nhân dân", "ubnd"],
  "kinh-te": ["kinh tế", "kinh-te"]
}

function NewsListPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentLang = React.useMemo(() => {
    if (!pathname) return "vi"
    const segments = pathname.split("/").filter(Boolean)
    if (segments[0] === "en") return "en"
    return "vi"
  }, [pathname])

  const t = newsPageTranslations[currentLang] || newsPageTranslations.vi

  const initialCategory = searchParams.get("category") || "all"
  const initialSearch = searchParams.get("search") || ""

  const [activeCategory, setActiveCategory] = React.useState(initialCategory)
  const [searchQuery, setSearchQuery] = React.useState(initialSearch)

  const CATEGORIES = React.useMemo(() => [
    { label: t.allNews, value: "all" },
    { label: t.dangUy, value: "dang-uy" },
    { label: t.hdnd, value: "hdnd" },
    { label: t.ubnd, value: "ubnd" },
    { label: t.kinhTe, value: "kinh-te" }
  ], [t])

  React.useEffect(() => {
    setActiveCategory(searchParams.get("category") || "all")
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  // Wire thật BE (ledger #23): /public/posts qua usePublicPosts — không còn ALL_NEWS mock
  const { data: postsData, isFetching: postsLoading } = usePublicPosts({ limit: 50 })

  const newsList = React.useMemo(() => {
    const response: any = postsData
    const body = response?.data ?? response
    return Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])
  }, [postsData])

  const getLocalizedField = (obj: any, baseField: string, lang: string): string => {
    if (!obj) return ""
    if (lang === "en") {
      const enValue = obj[baseField + "En"] || obj[baseField + "_en"]
      if (enValue) return enValue
    }
    return obj[baseField] || ""
  }

  const matchesCategory = React.useCallback((post: any, category: string) => {
    if (category === "all") return true
    const slugOrCode = (post.category?.slug || post.category?.code || "").toLowerCase()
    const name = (post.category?.name || "").toLowerCase()
    if (slugOrCode === category) return true
    const keywords = CATEGORY_KEYWORDS[category] || []
    return keywords.some((kw) => name.includes(kw))
  }, [])

  const filteredNews = React.useMemo(() => {
    return newsList.filter((post: any) => {
      const title = (getLocalizedField(post, "title", currentLang) || "").toLowerCase()
      const excerpt = (getLocalizedField(post, "description", currentLang) || "").toLowerCase()
      const matchesSearch = !searchQuery.trim() ||
        title.includes(searchQuery.toLowerCase()) ||
        excerpt.includes(searchQuery.toLowerCase())
      return matchesCategory(post, activeCategory) && matchesSearch
    })
  }, [newsList, activeCategory, searchQuery, matchesCategory, currentLang])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    const routePath = currentLang === "en" ? "/news" : "/tin-tuc"
    if (query) {
      router.push(`${routePath}?search=${encodeURIComponent(query)}&category=${activeCategory}`)
    } else {
      router.push(`${routePath}?category=${activeCategory}`)
    }
  }

  const handleCategorySelect = (val: string) => {
    setActiveCategory(val)
    const routePath = currentLang === "en" ? "/news" : "/tin-tuc"
    if (searchQuery.trim()) {
      router.push(`${routePath}?category=${val}&search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push(`${routePath}?category=${val}`)
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in select-none">

      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-portal-primary flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {t.home}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300">
          {t.newsCategory}
        </span>
      </div>

      {/* Page Title & Search area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            {t.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic Inner Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md flex items-center">
          <input
            type="text"
            placeholder={t.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 focus:text-slate-900 text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-red-600 transition-all shadow-inner dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-1 p-2 rounded-lg text-slate-400 hover:text-portal-primary"
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
            {t.categoryTitle}
          </h4>
          <div className="flex flex-col gap-1.5 font-semibold text-xs text-slate-500">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`text-left px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-between group ${activeCategory === cat.value
                  ? "bg-red-50 text-portal-primary dark:bg-red-950/20 dark:text-yellow-500"
                  : "hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-950"
                  }`}
              >
                <span>{cat.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeCategory === cat.value ? "opacity-100 text-portal-primary dark:text-yellow-500" : "text-slate-400"
                  }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Listings grid */}
        <div className="lg:col-span-9 flex flex-col gap-4 sm:gap-6">
          {postsLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
              <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.loading}</p>
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredNews.map((post: any) => {
                const articlePath = currentLang === "en"
                  ? `/news/${post.slug || post.id}`
                  : `/tin-tuc/${post.slug || post.id}`
                const image = post.thumbnail ? resolveMediaUrl(post.thumbnail) : ""
                const postDate = post.publishedAt || post.createdAt
                const dateFormatted = postDate
                  ? new Date(postDate).toLocaleDateString(currentLang === "en" ? "en-US" : "vi-VN")
                  : ""
                const categoryName = getLocalizedField(post.category, "name", currentLang)
                  || (currentLang === "en" ? "News" : "Tin tức")
                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group h-full"
                  >
                    <div className="h-44 overflow-hidden relative shrink-0">
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm z-10 border border-white/5">
                        {categoryName}
                      </div>
                      {image ? (
                        <img
                          src={image}
                          alt={titleText(post, currentLang)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold tracking-wider">
                        <span className="flex items-center gap-1 font-mono">
                          {dateFormatted ? (
                            <>
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {dateFormatted}
                            </>
                          ) : null}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-portal-primary transition-colors tracking-wide">
                        <Link href={articlePath}>{titleText(post, currentLang)}</Link>
                      </h4>
                      {excerptText(post, currentLang) ? (
                        <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                          {excerptText(post, currentLang)}
                        </p>
                      ) : null}
                      <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
                        <Link
                          href={articlePath}
                          className="text-[10px] text-slate-900 dark:text-yellow-500 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:underline"
                        >
                          {t.detailText}
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
                {t.noNewsTitle}
              </h5>
              <p className="text-xs text-slate-400 font-medium">
                {t.noNewsDesc}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

function titleText(post: any, lang: string): string {
  if (!post) return ""
  if (lang === "en") {
    const en = post.titleEn || (post.translations?.en?.title)
    if (en) return en
  }
  const value = typeof post.title === "object" && post.title ? post.title[lang] || post.title.vi : post.title
  return value || ""
}

function excerptText(post: any, lang: string): string {
  if (!post) return ""
  let desc = post.description
  if (lang === "en") {
    const en = post.descriptionEn || post.translations?.en?.description
    if (en) return en
  }
  if (typeof desc === "object" && desc) desc = desc[lang] || desc.vi || ""
  if (!desc && typeof post.content === "string") {
    return post.content.replace(/<[^>]+>/g, " ").trim().slice(0, 160)
  }
  return desc || ""
}

export default function NewsListPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-12 text-slate-400 font-bold">Đang tải...</div>}>
      <NewsListPageContent />
    </React.Suspense>
  )
}
