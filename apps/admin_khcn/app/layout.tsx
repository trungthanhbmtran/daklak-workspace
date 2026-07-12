import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Hệ thống quản trị",
  description: "Hệ thống quản trị doanh nghiệp",
  icons: {
    icon: "/QuocHuy.png",
    shortcut: "/QuocHuy.png",
    apple: "/QuocHuy.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning giúp tránh lỗi khi dùng Theme (Light/Dark mode)
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className={`font-sans antialiased overflow-hidden`}>
        <Providers>
          <TooltipProvider delayDuration={200} skipDelayDuration={100}>
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </TooltipProvider>

          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={3000}
          />
        </Providers>
      </body>
    </html>
  );
}
