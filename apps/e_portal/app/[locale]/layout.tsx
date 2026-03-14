// File: src/app/[locale]/layout.tsx

import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { notFound } from "next/navigation"; // Import notFound
import { NextIntlClientProvider } from "next-intl"; // Import Provider
import { getMessages } from "next-intl/server"; // Import getMessages

// Import cấu hình routing của bạn (đảm bảo đường dẫn đúng)
import { routing } from "@/i18n/routing"; 

import { Providers } from "@/app/[locale]/providers"; // Lưu ý: chỉnh lại đường dẫn import nếu cần
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

// Components
import StickyCustomerCare from "@/app/[locale]/_components/stickycustomercare"; // Chỉnh lại import alias nếu cần
import StickyRingPhone from "@/app/[locale]/_components/stickyringphone";
import ScrollOnTop from "@/app/[locale]/_components/ScrollOnTop";
import Footer from "@/app/[locale]/_components/Footer";
import Header from "@/app/[locale]/_components/Header";
import RightScreen from "@/components/RightScreen"; // Kiểm tra lại đường dẫn
import LeftScreen from "@/components/LeftScreen";   // Kiểm tra lại đường dẫn
import { Card } from "@heroui/card";
import SlideBar from "@/app/[locale]/_components/SlideBar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// Cấu hình để Next.js build tĩnh các trang (SSG) cho tất cả ngôn ngữ
export function generateStaticParams() {
  return routing.locales.map((locale: any) => ({ locale }));
}

// Props interface cập nhật cho Next.js 15
interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  // 1. Await params (Bắt buộc trong Next.js 15)
  const { locale } = await params;

  // 2. Validate locale. Nếu user nhập /de mà không hỗ trợ -> 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 3. Lấy nội dung ngôn ngữ từ server
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale}>
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {/* 4. Bọc NextIntlClientProvider ngoài cùng hoặc trong body */}
        <NextIntlClientProvider messages={messages}>
          <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
            <div className="relative flex flex-col min-h-screen">
              {/* Header */}
              <Header />

              {/* SlideBar luôn hiển thị */}
              <div>
                <SlideBar />
              </div>

              {/* Layout chia 3 cột */}
              <div className="container mx-auto py-4 flex flex-col lg:flex-row gap-4">
                {/* LeftScreen */}
                <div className="w-full md:w-64 hidden md:block">
                  <LeftScreen />
                </div>

                {/* Main Content */}
                <Card className="flex-1 p-4 sm:p-6 w-full">
                  {children}
                </Card>

                {/* RightScreen */}
                <div className="hidden xl:block xl:w-72">
                  <RightScreen />
                </div>
              </div>

              {/* Các thành phần cố định */}
              <StickyRingPhone />
              {/* <StickyCustomerCare />  */}
              <ScrollOnTop />
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}