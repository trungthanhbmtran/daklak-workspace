"use client"

import * as React from "react"
import { notFound } from "next/navigation"

import NewsDetailPage from "../../../components/pages/news-detail-page"

const NESTED_SLUG_MAPPING: Record<string, React.ComponentType<{ id: string }>> = {
  "tin-tuc": NewsDetailPage,
  "news": NewsDetailPage,
}

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export default function DynamicNestedSlugPage({ params }: PageProps) {
  const { slug, id } = React.use(params)
  const Component = NESTED_SLUG_MAPPING[slug]

  if (!Component) {
    return notFound()
  }

  return <Component id={id} />
}
