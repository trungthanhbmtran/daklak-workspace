import * as React from "react"
import { notFound, redirect } from "next/navigation"
import { serverFetch } from "@/lib/serverFetch"

import HomeClient from "@/components/pages/home-client"
import AboutPage from "@/components/pages/about-page"
import ContactPage from "@/components/pages/contact-page"
import ProceduresPage from "@/components/pages/procedures-page"
import NewsPage from "@/components/pages/news-page"
import InteractionsPage from "@/components/pages/feedback-page"
import DocumentsPage from "@/components/pages/documents-page"
import NewsDetailPage from "@/components/pages/news-detail-page"
import CustomBuilderPage from "@/components/pages/custom-builder-page"

const SLUG_MAPPING: Record<string, React.ComponentType<any>> = {
  // English Routes
  aboutus: AboutPage,
  contact: ContactPage,
  procedures: ProceduresPage,
  news: NewsPage,
  feedback: InteractionsPage,
  documents: DocumentsPage,

  // Vietnamese Routes
  "gioi-thieu": AboutPage,
  "lien-he": ContactPage,
  "thu-tuc": ProceduresPage,
  "tin-tuc": NewsPage,
  "tuong-tac": InteractionsPage,
  "van-ban": DocumentsPage,
}

const DETAIL_MAPPING: Record<string, React.ComponentType<{ id: string }>> = {
  "tin-tuc": NewsDetailPage,
  "news": NewsDetailPage,
  "trang": NewsDetailPage,
  "page": NewsDetailPage,
  "tuy-bien": CustomBuilderPage,
}

// ISR configuration
export const revalidate = 60

export async function generateStaticParams() {
  const params: Array<{ lang: string; content?: string[] }> = []
  
  // Register home pages for both languages
  params.push({ lang: "vi", content: [] })
  params.push({ lang: "en", content: [] })

  // Register categories for both languages
  Object.keys(SLUG_MAPPING).forEach((slug) => {
    const isEn = ["aboutus", "contact", "procedures", "news", "feedback", "documents"].includes(slug)
    params.push({
      lang: isEn ? "en" : "vi",
      content: [slug],
    })
  })

  return params
}

interface PageProps {
  params: Promise<{
    lang: string
    content?: string[]
  }>
}

export default async function CatchAllCMSPage({ params }: PageProps) {
  const { lang, content } = await params

  // 1. Validate Language
  if (lang !== "vi" && lang !== "en") {
    return notFound()
  }

  // 2. Home Page Route: /vi or /en
  if (!content || content.length === 0) {
    console.log(`[CMS Root] Fetching Home Page Data for lang: ${lang}`)
    const [portalMenus, posts, banners] = await Promise.all([
      serverFetch("public/portal-menus?lang=" + lang),
      serverFetch("public/posts?lang=" + lang),
      serverFetch("public/banners?lang=" + lang)
    ])

    return (
      <HomeClient
        initialPortalMenus={portalMenus || { success: true, data: [] }}
        initialPosts={posts || { success: true, data: [] }}
        initialBanners={banners || { success: true, data: [] }}
      />
    )
  }

  // 3. Slug / Category Page Route: /vi/[slug] or /en/[slug]
  if (content.length === 1) {
    const slug = content[0]
    const Component = SLUG_MAPPING[slug]
    if (!Component) {
      return notFound()
    }
    return <Component />
  }

  // 4. Detail Page Route: /vi/[slug]/[id] or /en/[slug]/[id]
  if (content.length === 2) {
    const [slug, id] = content
    const Component = DETAIL_MAPPING[slug]
    if (!Component) {
      return notFound()
    }
    return <Component id={id} />
  }

  return notFound()
}
