"use client";

import React, { useState } from "react";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ThemeTemplateSelector } from "./theme/ThemeTemplateSelector";
import { ThemeStageSelector } from "./theme/ThemeStageSelector";
import { ThemeSelector } from "./theme/ThemeSelector";
import { ThemePreview } from "./theme/ThemePreview";
import { ThemeSaveButton } from "./theme/ThemeSaveButton";

// Giả định thêm các Sub-component mới cho CMS lớn
// Bạn có thể tự tách các component này ra file riêng sau
import { ThemeMarketplace } from "./theme/ThemeMarketplace";
import { TypographyConfig } from "./theme/TypographyConfig";
import { LayoutConfig } from "./theme/LayoutConfig";
import { BrandingConfig } from "./theme/BrandingConfig";
import { AdvancedCssEditor } from "./theme/AdvancedCssEditor";

export function AppearanceClient() {
    const [activeTab, setActiveTab] = useState<"library" | "customize" | "advanced">("customize");

    return (
        <ThemeProvider>
            <div className="h-full w-full overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">

                {/* 1. TOP HEADER BAR (Chuẩn CMS: Tách biệt tiêu đề và thanh action cố định) */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Quản lý Giao diện</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Cấu hình, tùy chỉnh thiết kế hệ thống và quản lý kho giao diện CMS của bạn.
                        </p>
                    </div>
                    {/* Nút hành động chính (Save/Publish) */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                        <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                            Có thay đổi chưa lưu
                        </span>
                        <ThemeSaveButton />
                    </div>
                </div>

                {/* 2. NAVIGATION TABS (Phân chia luồng công việc của CMS) */}
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
                        <button
                            onClick={() => setActiveTab("customize")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === "customize" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                        >
                            Bộ tùy biến (Customizer)
                        </button>
                        <button
                            onClick={() => setActiveTab("library")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === "library" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                        >
                            Kho giao diện mẫu ({`12`})
                        </button>
                        <button
                            onClick={() => setActiveTab("advanced")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === "advanced" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                        >
                            Cài đặt nâng cao (CSS/Code)
                        </button>
                    </div>
                </div>

                {/* 3. MAIN WORKSPACE */}
                <div className="max-w-7xl mx-auto">
                    {activeTab === "library" ? (
                        /* KHO GIAO DIỆN (Dạng Lưới - Toàn màn hình) */
                        <div className="animate-in fade-in duration-300">
                            <ThemeMarketplace onCustomizeClick={() => setActiveTab("customize")} />
                        </div>
                    ) : (
                        /* BỘ TÙY BIẾN & THIẾT LẬP NÂNG CAO (Bố cục 2 cột Split-Screen chuẩn Studio) */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* CỘT TRÁI: TẤT CẢ CONFIGURATION PANEL (Chiếm 5/12 cột) */}
                            <div className="lg:col-span-5 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">

                                {activeTab === "customize" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {/* Phân đoạn 1: Theme Mode cơ bản */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chế độ hiển thị</h3>
                                            <ThemeSelector />
                                        </div>

                                        {/* Phân đoạn 2: Cấu hình Màu sắc chủ đạo & Template */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bảng màu hệ thống</h3>
                                            <ThemeTemplateSelector />
                                            <ThemeStageSelector />
                                        </div>

                                        {/* Phân đoạn 3: Typography & Fonts (Tính năng CMS lớn) */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Font chữ & Định dạng</h3>
                                            <TypographyConfig />
                                        </div>

                                        {/* Phân đoạn 4: Layout & Components Style (Tính năng CMS lớn) */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bố cục & Bo góc (Radius)</h3>
                                            <LayoutConfig />
                                        </div>

                                        {/* Phân đoạn 5: Nhận diện thương hiệu (Logo & Favicon) */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Nhận diện thương hiệu</h3>
                                            <BrandingConfig />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "advanced" && (
                                    <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom CSS / Tùy biến mã</h3>
                                        <p className="text-xs text-slate-500">Thêm mã CSS tùy chỉnh để ghi đè giao diện mặc định của hệ thống CMS.</p>
                                        <AdvancedCssEditor />
                                    </div>
                                )}
                            </div>

                            {/* CỘT PHẢI: REAL-TIME LIVE PREVIEW (Chiếm 7/12 cột) */}
                            <div className="lg:col-span-7 lg:sticky lg:top-8 space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Xem trước thời gian thực
                                    </span>
                                    {/* Giả lập đổi kích thước màn hình để test Responsive */}
                                    <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-lg text-xs">
                                        <button className="px-2 py-1 rounded bg-white dark:bg-slate-700 shadow-sm">Desktop</button>
                                        <button className="px-2 py-1 rounded text-slate-400 hover:text-slate-600">Tablet</button>
                                        <button className="px-2 py-1 rounded text-slate-400 hover:text-slate-600">Mobile</button>
                                    </div>
                                </div>

                                {/* Khung Preview được bọc trong viền Mockup thiết bị */}
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden h-[650px] transition-all">
                                    <ThemePreview />
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </ThemeProvider>
    );
}