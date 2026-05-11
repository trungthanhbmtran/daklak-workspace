import { Inter } from "next/font/google"
import "../globals.css"
import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/providers"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ZoomController from "@/components/zoom-controller"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: "Cổng thông tin điện tử xã Dang Kang - Huyện Krông Bông, Tỉnh Đắk Lắk",
  description: "Trang thông tin điện tử chính thức của Ủy ban nhân dân xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk. Cung cấp tin tức chính trị, kinh tế, xã hội, thủ tục hành chính và dịch vụ công trực tuyến.",
  keywords: "cổng thông tin điện tử, xã dang kang, uỷ ban nhân dân, dịch vụ công trực tuyến, huyện krông bông, đắk lắk, thủ tục hành chính",
  icons: {
    icon: "/QuocHuy.png",
    shortcut: "/QuocHuy.png",
    apple: "/QuocHuy.png",
  },
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function LocaleLayout({
  children,
  params
}: LayoutProps) {
  const { lang } = await params

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", inter.className)}
    >
      <body className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <Providers>
            <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
              <Header />
              <main className="flex-1 w-full max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-8">
                {children}
              </main>
              <Footer />
              <ZoomController />
            </React.Suspense>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
