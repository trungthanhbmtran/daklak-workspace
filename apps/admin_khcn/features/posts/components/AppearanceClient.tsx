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
import { Heading, Text } from "@/components/ui/typography";

export function AppearanceClient() {
    const [activeTab, setActiveTab] = useState<"library" | "customize" | "advanced">("customize");

    return (
        <ThemeProvider>
            <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">

                {/* 1. TOP HEADER BAR (Chuẩn CMS: Tách biệt tiêu đề và thanh action cố định) */}
                <div className="shrink-0 max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                    <div>
                        <Heading level="h2" className="font-bold tracking-tight">Quản lý Giao diện</Heading>
                        <Text variant="small" className="text-slate-500 dark:text-slate-400 mt-1 font-normal">
                            Tùy chỉnh diện mạo, màu sắc, font chữ và nhận diện thương hiệu cho CMS.
                        </Text>
                    </div>
                    {/* Nút hành động chính (Save/Publish) */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Text as="span" className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 font-medium text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                            Beta
                        </Text>
                        <ThemeSaveButton />
                    </div>
                </div>

                {/* 2. NAVIGATION TABS (Phân chia luồng công việc của CMS) */}
                <div className="shrink-0 max-w-7xl w-full mx-auto mb-6">
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
                <div className="flex-1 overflow-hidden max-w-7xl w-full mx-auto">
                    {activeTab === "library" ? (
                        /* KHO GIAO DIỆN (Dạng Lưới - Toàn màn hình) */
                        <div className="h-full overflow-y-auto animate-in fade-in duration-300 custom-scrollbar pr-2">
                            <ThemeMarketplace onCustomizeClick={() => setActiveTab("customize")} />
                        </div>
                    ) : (
                        /* BỘ TÙY BIẾN & THIẾT LẬP NÂNG CAO (Bố cục 2 cột Split-Screen chuẩn Studio) */
                        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* CỘT TRÁI: TẤT CẢ CONFIGURATION PANEL (Chiếm 5/12 cột) */}
                            <div className="lg:col-span-5 h-full overflow-y-auto space-y-6 pr-2 custom-scrollbar">

                                {activeTab === "customize" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {/* Phân đoạn 1: Theme Mode cơ bản */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-slate-400">Chế độ hiển thị</Heading>
                                            <ThemeSelector />
                                        </div>

                                        {/* Phân đoạn 2: Cấu hình Màu sắc chủ đạo & Template */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-slate-400">Bảng màu hệ thống</Heading>
                                            <ThemeTemplateSelector />
                                            <ThemeStageSelector />
                                        </div>

                                        {/* Phân đoạn 3: Typography & Fonts (Tính năng CMS lớn) */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-slate-400">Font chữ & Định dạng</Heading>
                                            <TypographyConfig />
                                        </div>

                                        {/* Phân đoạn 4: Layout & Components Style (Tính năng CMS lớn) */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-slate-400">Bố cục & Bo góc (Radius)</Heading>
                                            <LayoutConfig />
                                        </div>

                                        {/* Phân đoạn 5: Nhận diện thương hiệu (Logo & Favicon) */}
                                        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-slate-400">Nhận diện thương hiệu</Heading>
                                            <BrandingConfig />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "advanced" && (
                                    <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                        <Heading level="h4" className="font-bold uppercase tracking-wider text-slate-400">Custom CSS / Tùy biến mã</Heading>
                                        <Text variant="small" className="text-slate-500 font-normal">Thêm mã CSS tùy chỉnh để ghi đè giao diện mặc định của hệ thống CMS.</Text>
                                        <AdvancedCssEditor />
                                    </div>
                                )}
                            </div>

                            {/* CỘT PHẢI: REAL-TIME LIVE PREVIEW (Chiếm 7/12 cột) */}
                            <div className="lg:col-span-7 h-full flex flex-col space-y-3 pb-2">
                                <div className="shrink-0 flex items-center justify-between px-2">
                                    <Text as="span" className="font-semibold text-slate-400 flex items-center gap-2">
                                        <Text as="span" className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></Text>
                                        Xem trước thời gian thực
                                    </Text>
                                    {/* Giả lập đổi kích thước màn hình để test Responsive */}
                                    <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-lg text-xs">
                                        <button className="px-2 py-1 rounded bg-white dark:bg-slate-700 shadow-sm">Desktop</button>
                                        <button className="px-2 py-1 rounded text-slate-400 hover:text-slate-600">Tablet</button>
                                        <button className="px-2 py-1 rounded text-slate-400 hover:text-slate-600">Mobile</button>
                                    </div>
                                </div>

                                {/* Khung Preview được bọc trong viền Mockup thiết bị */}
                                <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden transition-all">
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