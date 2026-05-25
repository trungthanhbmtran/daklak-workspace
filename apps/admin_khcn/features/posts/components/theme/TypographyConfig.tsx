"use client";

import React from "react";
import { useThemeConfig } from "./ThemeProvider";

export function TypographyConfig() {
    // Lấy state hiện tại và hàm setter thông minh từ Context toàn cục
    const { typography, setTypography } = useThemeConfig();

    return (
        <div className="space-y-4">
            {/* 1. Bộ chọn Font Tiêu Đề */}
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Font chữ Tiêu đề (Headings)
                </label>
                <select
                    value={typography.heading}
                    onChange={(e) => setTypography({ heading: e.target.value })}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                >
                    <option value="inter">Inter (Mặc định hiện đại)</option>
                    <option value="playfair">Playfair Display (Báo chí/Cổ điển)</option>
                    <option value="plus-jakarta">Plus Jakarta Sans (Công nghệ)</option>
                    <option value="roboto">Roboto (Cơ bản/Rõ ràng)</option>
                </select>
            </div>

            {/* 2. Bộ chọn Font Nội Dung */}
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Font chữ Nội dung (Body Text)
                </label>
                <select
                    value={typography.body}
                    onChange={(e) => setTypography({ body: e.target.value })}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                >
                    <option value="inter">Inter Sans-Serif</option>
                    <option value="merriweather">Merriweather Serif (Dễ đọc truyện/tin tức)</option>
                    <option value="Geist">Geist Mono (Kỹ thuật/Mã nguồn)</option>
                </select>
            </div>

            {/* 3. Thanh trượt Kích thước chữ nền (Font Size Scale) */}
            <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>Kích thước chữ mặc định</span>
                    <span className="font-bold text-blue-500 dark:text-blue-400">
                        {typography.size}px
                    </span>
                </div>
                <input
                    type="range"
                    min="12"
                    max="18"
                    value={typography.size}
                    onChange={(e) => setTypography({ size: Number(e.target.value) })}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
}