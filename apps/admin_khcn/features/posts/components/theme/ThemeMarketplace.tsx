"use client";

import React, { useState } from "react";
// Import hook để nạp giao diện mẫu vào Preview khi nhấn tùy biến
import { useThemeConfig } from "./ThemeProvider";

interface ThemeItem {
    id: string;
    name: string;
    description: string;
    author: string;
    version: string;
    thumbnail: string;
    isLive: boolean;
    templateKey: string; // Thêm key tương ứng với màu/bảng mạch trong hệ thống
}

const mockThemes: ThemeItem[] = [
    { id: "1", name: "Minimalist Horizon", description: "Giao diện tối giản, tập trung vào trải nghiệm đọc và tốc độ tải trang.", author: "CMS Team", version: "1.2.0", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60", isLive: true, templateKey: "blue" },
    { id: "2", name: "MagazinX Pro", description: "Bố cục tạp chí đa cột, hoàn hảo cho các trang tin tức đồ sộ và nhiều media.", author: "StudioDev", version: "2.0.4", thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&auto=format&fit=crop&q=60", isLive: false, templateKey: "violet" },
    { id: "3", name: "E-Commerce Swift", description: "Tích hợp sẵn bộ lọc sản phẩm, tối ưu tỷ lệ chuyển đổi cho giỏ hàng.", author: "CommerceLab", version: "1.0.1", thumbnail: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=500&auto=format&fit=crop&q=60", isLive: false, templateKey: "emerald" },
];

// Nhận prop điều hướng từ trang cha truyền vào
export function ThemeMarketplace({ onCustomizeClick }: { onCustomizeClick: () => void }) {
    const [themes, setThemes] = useState<ThemeItem[]>(mockThemes);
    const { setTemplate } = useThemeConfig(); // Gọi hàm set template từ context

    const handleActivate = (id: string) => {
        setThemes(themes.map(t => ({ ...t, isLive: t.id === id })));
    };

    const handleCustomize = (templateKey: string) => {
        // 1. Nạp cấu hình giao diện mẫu này vào hệ thống Preview toàn cục
        setTemplate(templateKey);

        // 2. Kích hoạt chuyển tab sang "Bộ tùy biến" ở trang cha
        onCustomizeClick();
    };

    return (
        <div className="space-y-6">
            {/* ... Phần Top Toolbar giữ nguyên ... */}

            {/* Grid Thư viện */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                    <div key={theme.id} className={`group relative rounded-xl border bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all ${theme.isLive ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-200 dark:border-slate-800'}`}>

                        {/* Thumbnail */}
                        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                            <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {theme.isLive && (
                                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold bg-emerald-500 text-white rounded-full shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Đang kích hoạt
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-base line-clamp-1">{theme.name}</h4>
                                <span className="text-xs text-slate-400">v{theme.version}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 min-h-[32px]">{theme.description}</p>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                                <span className="text-xs text-slate-400">Bởi <span className="font-medium text-slate-600 dark:text-slate-300">{theme.author}</span></span>
                                <div className="flex gap-2">
                                    {/* SỬA TẠI ĐÂY: Khi bấm nút Tùy biến sẽ chạy hàm xử lý đổi cấu hình và nhảy Tab */}
                                    <button
                                        onClick={() => handleCustomize(theme.templateKey)}
                                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md transition-colors"
                                    >
                                        Tùy biến
                                    </button>

                                    {!theme.isLive && (
                                        <button onClick={() => handleActivate(theme.id)} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Kích hoạt</button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}