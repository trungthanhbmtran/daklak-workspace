"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/axiosInstance"
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer"
import { Loader2, ArrowLeft, Home, FileText } from "lucide-react"
import Link from "next/link"

interface CustomBuilderPageProps {
  id: string
}

export default function CustomBuilderPage({ id }: CustomBuilderPageProps) {
  const pathname = usePathname()

  // Resolve current active locale (vi / en)
  const currentLang = React.useMemo(() => {
    if (!pathname) return "vi"
    const segments = pathname.split("/").filter(Boolean)
    if (segments[0] === "en") return "en"
    return "vi"
  }, [pathname])

  // Query configurations dynamically
  const { data: portalConfigData, isLoading } = useQuery({
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

  // Get custom page list metadata
  const pageList = React.useMemo(() => {
    const found = (portalConfigData || []).find((c: any) => c.code === "custom_page_list")
    if (!found || !found.description) return []
    try {
      return JSON.parse(found.description)
    } catch (e) {
      console.error("Failed to parse custom page list", e)
      return []
    }
  }, [portalConfigData])

  // Get current page metadata
  const currentPageMeta = React.useMemo(() => {
    return pageList.find((p: any) => p.id === id)
  }, [pageList, id])

  // Resolve page title
  const pageTitle = React.useMemo(() => {
    if (!currentPageMeta) {
      return id === "about-page" 
        ? (currentLang === "vi" ? "Giới thiệu" : "About Us")
        : (currentLang === "vi" ? "Trang tùy biến" : "Custom Page")
    }
    const titleObj = currentPageMeta.title || {}
    return titleObj[currentLang] || titleObj.vi || currentPageMeta.id
  }, [currentPageMeta, id, currentLang])

  // Resolve layout schema
  const layoutSchema = React.useMemo(() => {
    // If it's about-page, we can also fall back to custom_about_layout for compatibility
    const configCode = id === "about-page" ? "custom_about_layout" : `custom_page_layout_${id}`
    const found = (portalConfigData || []).find((c: any) => c.code === configCode)
    if (!found || !found.description) return null
    try {
      return JSON.parse(found.description)
    } catch (e) {
      console.error(`Failed to parse custom page layout for ${id}`, e)
      return null
    }
  }, [portalConfigData, id])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          {currentLang === "vi" ? "Đang tải trang..." : "Loading page..."}
        </p>
      </div>
    )
  }

  // If page does not exist or layout schema is missing
  if (!layoutSchema) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex p-4 bg-amber-50 text-amber-600 rounded-full">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-800">
          {currentLang === "vi" ? "Trang chưa được thiết kế" : "Page Not Designed Yet"}
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {currentLang === "vi" 
            ? "Trang này hiện chưa có nội dung thiết kế trực quan từ bảng quản trị CMS. Vui lòng liên hệ quản trị viên để thiết kế."
            : "This page does not have any visual design layout from CMS dashboard yet. Please contact your administrator."}
        </p>
        <div className="pt-4">
          <Link 
            href={`/${currentLang}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentLang === "vi" ? "Quay lại Trang chủ" : "Back to Home"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/40 pb-16">
      {/* BREADCRUMBS & HEADER SECTION */}
      <div className="bg-white border-b shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <Link href={`/${currentLang}`} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              {currentLang === "vi" ? "Trang chủ" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-slate-600 truncate">{pageTitle}</span>
          </nav>
          
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* DYNAMIC CONTENTS */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <DynamicPageRenderer layoutSchema={layoutSchema} />
      </div>
    </div>
  )
}
