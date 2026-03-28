import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { TooltipProvider } from "@/components/ui/tooltip";

export const dynamic = "force-dynamic";


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
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <TooltipProvider delayDuration={200} skipDelayDuration={100}>
            {children}
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
