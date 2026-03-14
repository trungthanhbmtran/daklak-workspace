import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { TooltipProvider } from "@/components/ui/tooltip"; // Nên mở lại để dùng cho các icon gợi ý

export const dynamic = "force-dynamic";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Font Inter hỗ trợ tiếng Việt cực tốt cho hệ thống quản trị
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hệ thống quản trị",
  description: "Hệ thống quản trị doanh nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning giúp tránh lỗi khi dùng Theme (Light/Dark mode)
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          {/* TooltipProvider rất quan trọng cho UX của các nút icon nhỏ (như nút Xóa, Sửa) */}
          <TooltipProvider delayDuration={200}>
            {children}
          </TooltipProvider>

          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
            theme="light" // Hoặc "dark" tùy project
          />
        </Providers>
      </body>
    </html>
  );
}
