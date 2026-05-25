"use client";

import React from "react";
// Import hook chuẩn từ file ThemeProvider nâng cấp của bạn
import { useThemeConfig } from "./ThemeProvider";

export function ThemePreview() {
  // Gọi hook cấu hình CMS
  const {
    theme,
    template,
    typography,
    layout
  } = useThemeConfig();

  // 1. Hàm mapping màu sắc động dựa trên Template được chọn
  const getColorClasses = () => {
    switch (template) {
      case "emerald":
        return {
          bgPrimary: "bg-emerald-600 hover:bg-emerald-700",
          textPrimary: "text-emerald-600 dark:text-emerald-400",
          gradient: "from-emerald-600 to-teal-600",
          ring: "focus:ring-emerald-500"
        };
      case "violet":
        return {
          bgPrimary: "bg-violet-600 hover:bg-violet-700",
          textPrimary: "text-violet-600 dark:text-violet-400",
          gradient: "from-violet-600 to-purple-600",
          ring: "focus:ring-violet-500"
        };
      case "amber":
        return {
          bgPrimary: "bg-amber-600 hover:bg-amber-700",
          textPrimary: "text-amber-600 dark:text-amber-400",
          gradient: "from-amber-600 to-orange-600",
          ring: "focus:ring-amber-500"
        };
      case "blue":
      default:
        return {
          bgPrimary: "bg-blue-600 hover:bg-blue-700",
          textPrimary: "text-blue-600 dark:text-blue-400",
          gradient: "from-blue-600 to-indigo-600",
          ring: "focus:ring-blue-500"
        };
    }
  };

  const colors = getColorClasses();

  // 2. Định nghĩa Class dynamic cho Bo góc (Radius)
  const getRadiusClass = () => {
    switch (layout.radius) {
      case "Sharp": return "rounded-none";
      case "Subtle": return "rounded-sm";
      case "Medium": return "rounded-xl";
      case "Full": return "rounded-3xl";
      default: return "rounded-xl";
    }
  };

  // 3. Định nghĩa Class dynamic cho Font chữ (Hỗ trợ các font cấu hình mới)
  const getFontFamilyClass = () => {
    switch (typography.heading) {
      case "playfair": return "font-serif";
      case "merriweather": return "font-serif tracking-normal";
      case "Geist": return "font-mono";
      case "inter":
      default: return "font-sans";
    }
  };

  return (
    <div
      className={`w-full h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar select-none ${getFontFamilyClass()}`}
      style={{ fontSize: `${typography.size}px` }} // Fix lỗi nhận font-size động
    >

      {/* MOCKUP HEADER WEBSITE */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${colors.bgPrimary} flex items-center justify-center text-white font-bold text-xs transition-colors duration-200`}>
            Ω
          </div>
          <span className="font-bold text-sm tracking-tight">SaaS_CMS Portal</span>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className={`${colors.textPrimary} font-semibold cursor-pointer transition-colors duration-200`}>Tổng quan</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">Bài viết</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">Báo cáo</span>
        </nav>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* MOCKUP BODY CONTENT */}
      <div className={`p-6 space-y-6 max-w-4xl mx-auto transition-all duration-200 ${layout.isCompact ? 'space-y-4 !p-4' : ''}`}>

        {/* Banner Thông báo - Màu chuyển đổi theo gradient của template */}
        <div className={`p-4 bg-gradient-to-r ${colors.gradient} text-white shadow-sm ${getRadiusClass()} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-200`}>
          <div>
            <h4 className="font-bold text-sm">🎉 Phiên bản CMS 5.0 đã sẵn sàng!</h4>
            <p className="text-xs text-slate-100 font-light mt-0.5">Trải nghiệm tốc độ render vượt trội cùng kiến trúc Core mới.</p>
          </div>
          <button className={`px-3 py-1 bg-white text-slate-900 text-xs font-semibold rounded-md shadow-sm whitespace-nowrap hover:bg-slate-50 transition-colors`}>
            Cập nhật ngay
          </button>
        </div>

        {/* Grid Khối số liệu (Widgets/Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Lượt xem trang", value: "142,384", trend: "+12.5%", isPositive: true },
            { title: "Bài viết mới", value: "32", trend: "+4.2%", isPositive: true },
            { title: "Bình luận chờ duyệt", value: "9", trend: "-2.1%", isPositive: false }
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 ${getRadiusClass()} ${layout.isCompact ? '!p-3' : ''}`}>
              <span className="text-xs text-slate-400 font-medium">{stat.title}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold tracking-tight">{stat.value}</span>
                <span className={`text-xs font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Khu vực Danh sách bài viết mẫu */}
        <div className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 ${getRadiusClass()}`}>
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bài viết gần đây</span>
            <span className={`text-xs ${colors.textPrimary} font-medium hover:underline cursor-pointer transition-colors duration-200`}>Xem tất cả</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-900">
            {[
              { title: "Cách tối ưu SEO On-Page cho Website Next.js năm 2026", author: "Alex Nguyễn", status: "Đã xuất bản", date: "2 giờ trước" },
              { title: "Xây dựng hệ thống Design System đồng nhất cho doanh nghiệp lớn", author: "Minh Trần", status: "Bản nháp", date: "1 ngày trước" },
              { title: "Tìm hiểu những tính năng mới trong bản cập nhật Tailwind CSS v4", author: "CMS Editor", status: "Đã xuất bản", date: "3 ngày trước" }
            ].map((post, i) => (
              <div key={i} className={`p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors ${layout.isCompact ? '!p-2.5' : ''}`}>
                <div className="space-y-0.5 max-w-[70%]">
                  <h5 className={`text-xs font-semibold line-clamp-1 hover:${colors.textPrimary} cursor-pointer transition-colors duration-200`}>{post.title}</h5>
                  <p className="text-[11px] text-slate-400">Đăng bởi <span className="font-medium text-slate-500">{post.author}</span> • {post.date}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${post.status === "Đã xuất bản" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Thiết lập Nút bấm & Ô Input động nhận dạng Màu Template */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button className={`px-4 py-2 text-xs font-medium text-white shadow-sm ${colors.bgPrimary} transition-all duration-200 ${getRadiusClass()}`}>
            Nút hành động chính
          </button>
          <button className={`px-4 py-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 ${getRadiusClass()}`}>
            Nút phụ
          </button>
          <input
            type="text"
            placeholder="Thử nghiệm nhập ô text..."
            className={`px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner focus:outline-none focus:ring-1 ${colors.ring} transition-all duration-200 ${getRadiusClass()}`}
          />
        </div>

      </div>
    </div>
  );
}