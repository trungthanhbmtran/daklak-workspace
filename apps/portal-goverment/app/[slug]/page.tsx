import * as React from "react"
import { notFound } from "next/navigation"

import AboutPage from "@/components/pages/about-page"
import ContactPage from "@/components/pages/contact-page"
import ProceduresPage from "@/components/pages/procedures-page"
import NewsPage from "@/components/pages/news-page"
import InteractionsPage from "@/components/pages/feedback-page"
import DocumentsPage from "@/components/pages/documents-page"

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

// Cấu hình ISR: tự động revalidate lại trang tĩnh sau mỗi 60 giây
export const revalidate = 60;

// SSG: Đăng ký tất cả các tham số tĩnh cho các trang danh mục cổng dịch vụ công
export async function generateStaticParams() {
  return Object.keys(SLUG_MAPPING).map((slug) => ({
    slug: slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DynamicSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const Component = SLUG_MAPPING[slug];

  if (!Component) {
    return notFound();
  }

  return <Component />;
}
