"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { usePublicPostBySlug, usePublicPostById } from "@/hooks/usePublicData"
// Ledger #23: article CHỈ từ DB (public posts) — bỏ hoàn toàn ALL_NEWS/ALL_NEWS_EN mock
import { resolveMediaUrl, stripUnsafeHtml } from "@/lib/utils"
import {
  Calendar,
  ArrowLeft,
  Home,
  ChevronRight,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  FileText,
  Newspaper
} from "lucide-react"

function lexicalToHtml(jsonString: string): string {
  if (!jsonString) return "";
  const trimmed = jsonString.trim();
  // If it starts with an HTML tag, treat it as raw HTML
  if (trimmed.startsWith("<") || trimmed.includes("<html") || trimmed.includes("<div") || trimmed.includes("<p")) {
    return jsonString;
  }
  try {
    if (!trimmed.startsWith("{")) return `<p>${jsonString}</p>`;
    const data = JSON.parse(jsonString);
    if (!data.root || !data.root.children) return "";

    const renderNode = (node: any): string => {
      if (node.type === "text") {
        let text = node.text || "";
        if (node.format & 1) text = `<strong>${text}</strong>`;
        if (node.format & 2) text = `<em>${text}</em>`;
        if (node.format & 8) text = `<span style="text-decoration: underline;">${text}</span>`;
        if (node.format & 16) text = `<strike>${text}</strike>`;
        return text;
      }
      if (node.children) {
        const childrenHtml = node.children.map((child: any) => renderNode(child)).join("");
        switch (node.type) {
          case "paragraph": return `<p>${childrenHtml}</p>`;
          case "list": return node.tag === "ol" ? `<ol>${childrenHtml}</ol>` : `<ul>${childrenHtml}</ul>`;
          case "listitem": return `<li>${childrenHtml}</li>`;
          case "heading": return `<${node.tag}>${childrenHtml}</${node.tag}>`;
          case "quote": return `<blockquote>${childrenHtml}</blockquote>`;
          case "link": return `<a href="${node.url}">${childrenHtml}</a>`;
          default: return childrenHtml;
        }
      }
      return "";
    };

    return data.root.children.map((node: any) => renderNode(node)).join("");
  } catch (e) {
    return jsonString;
  }
}

const translations = {
  vi: {
    home: "Trang chủ",
    news: "Tin tức",
    relatedNews: "TIN LIÊN QUAN KHÁC",
    source: "© Cổng thông tin điện tử Đảng bộ & UBND xã Dang Kang",
    sourceDesc: "Nguồn tin chính thức cấp cơ sở.",
    backToList: "QUAY LẠI DANH SÁCH",
    copied: "Đã sao chép!",
    loading: "Đang tải bài viết...",
    notFoundTitle: "Không tìm thấy bài viết",
    notFoundDesc: "Bài viết không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.",
    noImage: "Bài viết không có hình ảnh minh họa"
  },
  en: {
    home: "Home",
    news: "News",
    relatedNews: "OTHER RELATED NEWS",
    source: "© Official Web Portal of Dang Kang Party & People's Committee",
    sourceDesc: "Official grassroots level news source.",
    backToList: "BACK TO LIST",
    copied: "Copied!",
    loading: "Loading article...",
    notFoundTitle: "Article not found",
    notFoundDesc: "The article does not exist or has been removed from the system.",
    noImage: "No cover image available for this article"
  }
}

interface Props {
  id: string
}

export default function NewsDetailPage({ id }: Props) {
  const [fontSize, setFontSize] = React.useState<"sm" | "md" | "lg">("md")
  const [isCopied, setIsCopied] = React.useState(false)

  const pathname = usePathname()

  const currentLang = React.useMemo(() => {
    if (!pathname) return "vi"
    const segments = pathname.split("/").filter(Boolean)
    if (segments[0] === "en") return "en"
    return "vi"
  }, [pathname])

  const t = translations[currentLang] || translations.vi

  const isNumericId = /^\d+$/.test(id);
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  const isDatabaseId = isNumericId || isUuid;

  const slugQuery = usePublicPostBySlug(isDatabaseId ? "" : id);
  const idQuery = usePublicPostById(isDatabaseId ? id : "");

  const isLoading = slugQuery.isFetching || idQuery.isFetching
  const dbPostRaw = slugQuery.data || idQuery.data;
  const dbPost = dbPostRaw?.data || dbPostRaw;

  const getLocalizedField = (obj: any, baseField: string, lang: string): string => {
    if (!obj) return ""
    if (lang === "en") {
      const enValue = obj[baseField + "En"] || obj[baseField + "_en"]
      if (enValue) return enValue
    }
    return obj[baseField] || ""
  }

  // Chuẩn hoá ledger#35: queryFn trả MẢNG (unwrap .data) — dùng cho panel tin liên quan
  const { data: relatedPostsRaw } = useQuery({
    queryKey: ["public-posts", currentLang],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/public/posts", { params: { limit: 10 } })
        const body = response?.data ?? response
        return Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : [])
      } catch (e) {
        return []
      }
    },
  })

  const article = React.useMemo(() => {
    if (!dbPost) return null

    let title = dbPost.title || "";
    let content = dbPost.contentHtml || lexicalToHtml(dbPost.content || "");
    let excerpt = dbPost.description || "";

    let translationsObj = dbPost.translations || {};
    if (typeof translationsObj === "string") {
      try {
        translationsObj = JSON.parse(translationsObj);
      } catch (e) {
        translationsObj = {};
      }
    }

    if (currentLang === "en" && translationsObj.en) {
      title = translationsObj.en.title || title;
      content = translationsObj.en.contentHtml || lexicalToHtml(translationsObj.en.content || "");
      excerpt = translationsObj.en.description || excerpt;
    }

    const postDate = dbPost.publishedAt || dbPost.createdAt;
    return {
      id: dbPost.id,
      slug: dbPost.slug || "",
      title,
      excerpt,
      image: dbPost.thumbnail ? resolveMediaUrl(dbPost.thumbnail) : "",
      date: postDate ? new Date(postDate).toLocaleDateString(currentLang === "en" ? "en-US" : "vi-VN") : "",
      categoryName: getLocalizedField(dbPost.category, "name", currentLang) || (currentLang === "en" ? "News" : "Tin tức"),
      content: content || ""
    };
  }, [dbPost, currentLang])

  const otherNews = React.useMemo(() => {
    const list = Array.isArray(relatedPostsRaw) ? relatedPostsRaw : []
    return list
      .filter((post: any) => post && String(post.id) !== String(article?.id) && post.slug !== article?.slug)
      .slice(0, 3)
      .map((post: any) => ({
        id: post.id,
        slug: post.slug || "",
        title: getLocalizedField(post, "title", currentLang),
        image: post.thumbnail ? resolveMediaUrl(post.thumbnail) : "",
        date: (post.publishedAt || post.createdAt) ? new Date(post.publishedAt || post.createdAt).toLocaleDateString(currentLang === "en" ? "en-US" : "vi-VN") : "",
        categoryName: getLocalizedField(post.category, "name", currentLang) || (currentLang === "en" ? "News" : "Tin tức")
      }))
      .filter((item: any) => item.title)
  }, [relatedPostsRaw, article?.id, article?.slug, currentLang])

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-sm leading-relaxed"
      case "lg": return "text-lg md:text-xl leading-relaxed"
      case "md":
      default:
        return "text-base leading-relaxed"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-7xl mx-auto px-4 animate-fade-in">
        <Newspaper className="w-10 h-10 text-slate-300 dark:text-slate-700" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.loading}</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 max-w-7xl mx-auto px-4 animate-fade-in">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
        <h5 className="text-sm font-bold text-slate-850 dark:text-slate-200">{t.notFoundTitle}</h5>
        <p className="text-xs text-slate-400 font-medium">{t.notFoundDesc}</p>
        <Link
          href={currentLang === "en" ? "/news" : "/tin-tuc"}
          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToList}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in select-none max-w-7xl mx-auto px-4 md:px-0">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-portal-primary flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {t.home}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={currentLang === "en" ? "/news" : "/tin-tuc"} className="hover:text-portal-primary">
          {t.news}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px] md:max-w-md">
          {article.title}
        </span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Left Column: Article Body */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">

          {/* Cover image — chỉ render khi BE có thumbnail thật, không fabric ảnh placeholder */}
          {article.image ? (
            <div className="h-56 sm:h-72 md:h-96 relative overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8">
                <span className="self-start mb-3 bg-portal-primary dark:bg-[#fbc02d] dark:text-slate-950 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
                  {article.categoryName}
                </span>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-wide">
                  {article.title}
                </h1>
              </div>
            </div>
          ) : (
            <div className="px-4 sm:px-6 md:px-8 py-8 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <span className="self-start bg-portal-primary dark:bg-[#fbc02d] dark:text-slate-950 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
                {article.categoryName}
              </span>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-wide">
                {article.title}
              </h1>
            </div>
          )}

          {/* Article Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-bold">
            <div className="flex flex-wrap items-center gap-4">
              {article.date ? (
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {article.date}
                </span>
              ) : null}
            </div>

            {/* Accessibility Controls & Action Tools */}
            <div className="flex items-center gap-3">

              {/* FontSize adjustment group */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setFontSize("sm")}
                  title="Thu nhỏ chữ"
                  className={`p-1.5 rounded transition-colors ${fontSize === "sm" ? "bg-red-50 text-portal-primary dark:bg-red-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  title="Cỡ chữ mặc định"
                  className={`p-1.5 rounded transition-colors ${fontSize === "md" ? "bg-red-50 text-portal-primary dark:bg-red-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  title="Phóng to chữ"
                  className={`p-1.5 rounded transition-colors ${fontSize === "lg" ? "bg-red-50 text-portal-primary dark:bg-red-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrint}
                  title="In bài viết"
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-portal-primary rounded-lg transition-colors text-slate-400"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShare}
                  title={isCopied ? t.copied : "Share"}
                  className={`p-2 border rounded-lg transition-colors ${isCopied
                    ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-950/20 dark:border-green-900"
                    : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-slate-400 hover:text-portal-primary"
                    }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Article Main Content Body — sanitized (item 7: stripUnsafeHtml) */}
          <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-8">
            <div className={`prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 ${getFontSizeClass()} flex flex-col gap-5`}>
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: stripUnsafeHtml(article.content) }} className="w-full text-justify leading-relaxed" />
              ) : article.excerpt ? (
                <p className="text-justify font-medium leading-relaxed">{article.excerpt}</p>
              ) : (
                <p className="text-slate-400 font-medium leading-relaxed">
                  {currentLang === "en" ? "Full content is being updated." : "Nội dung đầy đủ đang được cập nhật."}
                </p>
              )}
            </div>

            {/* Bottom Signature / Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-bold">
                <span className="text-portal-primary dark:text-yellow-500">{t.source}</span>
                <p className="mt-0.5 font-medium">{t.sourceDesc}</p>
              </div>

              <Link
                href={currentLang === "en" ? "/news" : "/tin-tuc"}
                className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.backToList}
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Related News Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-3 sm:gap-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-portal-primary dark:text-yellow-500" />
              {t.relatedNews}
            </h4>

            <div className="flex flex-col gap-4">
              {otherNews.length > 0 ? otherNews.map((post: any) => {
                const itemPath = currentLang === "en" ? `/news/${post.slug || post.id}` : `/tin-tuc/${post.slug || post.id}`
                return (
                  <Link
                    key={post.id}
                    href={itemPath}
                    className="flex gap-3 group items-start border-b border-slate-50 dark:border-slate-950/40 pb-3 last:border-0 last:pb-0"
                  >
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg shrink-0 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase text-portal-primary dark:text-yellow-500 tracking-wider">
                        {post.categoryName}
                      </span>
                      <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-portal-primary transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h5>
                      {post.date ? (
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          {post.date}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                )
              }) : (
                <p className="text-[11px] text-slate-400 font-semibold">
                  {currentLang === "en" ? "No related articles available yet." : "Chưa có bài viết liên quan."}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
