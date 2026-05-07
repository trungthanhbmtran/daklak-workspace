"use client"

import * as React from "react"
import { notFound } from "next/navigation"

import AboutPage from "../../components/pages/about-page"
import ContactPage from "../../components/pages/contact-page"
import ProceduresPage from "../../components/pages/procedures-page"
import NewsPage from "../../components/pages/news-page"
import InteractionsPage from "../../components/pages/feedback-page"
import DocumentsPage from "../../components/pages/documents-page"

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

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function DynamicSlugPage({ params }: PageProps) {
  const { slug } = React.use(params)
  const Component = SLUG_MAPPING[slug]

  if (!Component) {
    return notFound()
  }

  return <Component />
}
