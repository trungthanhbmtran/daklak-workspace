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
import { Button } from "@/components/ui/button";

export function AppearanceClient() {
    const [activeTab, setActiveTab] = useState<"library" | "customize" | "advanced">("customize");

    return (
        <ThemeProvider>
            <div className="h-full w-full flex flex-col overflow-hidden bg-background p-4 md:p-8 text-foreground rounded-xl border shadow-sm">

                {/* 1. TOP HEADER BAR (Chuẩn CMS: Tách biệt tiêu đề và thanh action cố định) */}
                <div className="shrink-0 max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-border gap-4">
                    <div>
                        <Heading level="h2" className="font-bold tracking-tight">Quản lý Giao diện</Heading>
                        <Text variant="small" className="text-muted-foreground mt-1 font-normal">
                            Tùy chỉnh diện mạo, màu sắc, font chữ và nhận diện thương hiệu cho CMS.
                        </Text>
                    </div>
                    {/* Nút hành động chính (Save/Publish) */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Text as="span" className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground border border-border">
                            Beta
                        </Text>
                        <ThemeSaveButton />
                    </div>
                </div>

                {/* 2. NAVIGATION TABS (Phân chia luồng công việc của CMS) */}
                <div className="shrink-0 max-w-7xl w-full mx-auto mb-6">
                    <div className="flex border-b border-border space-x-6">
                        <Button
                            variant="ghost"
                            onClick={() => setActiveTab("customize")}
                            className={`pb-3 text-sm font-semibold border-b-2 rounded-none transition-all hover:bg-transparent ${activeTab === "customize" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                        >
                            Bộ tùy biến (Customizer)
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setActiveTab("library")}
                            className={`pb-3 text-sm font-semibold border-b-2 rounded-none transition-all hover:bg-transparent ${activeTab === "library" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                        >
                            Kho giao diện mẫu (12)
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setActiveTab("advanced")}
                            className={`pb-3 text-sm font-semibold border-b-2 rounded-none transition-all hover:bg-transparent ${activeTab === "advanced" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                        >
                            Cài đặt nâng cao (CSS/Code)
                        </Button>
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
                                        <div className="p-5 bg-card rounded-xl border shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-muted-foreground">Chế độ hiển thị</Heading>
                                            <ThemeSelector />
                                        </div>

                                        {/* Phân đoạn 2: Cấu hình Màu sắc chủ đạo & Template */}
                                        <div className="p-5 bg-card rounded-xl border shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-muted-foreground">Bảng màu hệ thống</Heading>
                                            <ThemeTemplateSelector />
                                            <ThemeStageSelector />
                                        </div>

                                        {/* Phân đoạn 3: Typography & Fonts (Tính năng CMS lớn) */}
                                        <div className="p-5 bg-card rounded-xl border shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-muted-foreground">Font chữ & Định dạng</Heading>
                                            <TypographyConfig />
                                        </div>

                                        {/* Phân đoạn 4: Layout & Components Style (Tính năng CMS lớn) */}
                                        <div className="p-5 bg-card rounded-xl border shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-muted-foreground">Bố cục & Bo góc (Radius)</Heading>
                                            <LayoutConfig />
                                        </div>

                                        {/* Phân đoạn 5: Nhận diện thương hiệu (Logo & Favicon) */}
                                        <div className="p-5 bg-card rounded-xl border shadow-sm space-y-4">
                                            <Heading level="h4" className="font-bold uppercase tracking-wider text-muted-foreground">Nhận diện thương hiệu</Heading>
                                            <BrandingConfig />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "advanced" && (
                                    <div className="p-5 bg-card rounded-xl border shadow-sm space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                        <Heading level="h4" className="font-bold uppercase tracking-wider text-muted-foreground">Custom CSS / Tùy biến mã</Heading>
                                        <Text variant="small" className="text-muted-foreground font-normal">Thêm mã CSS tùy chỉnh để ghi đè giao diện mặc định của hệ thống CMS.</Text>
                                        <AdvancedCssEditor />
                                    </div>
                                )}
                            </div>

                            {/* CỘT PHẢI: REAL-TIME LIVE PREVIEW (Chiếm 7/12 cột) */}
                            <div className="lg:col-span-7 h-full flex flex-col space-y-3 pb-2">
                                <div className="shrink-0 flex items-center justify-between px-2">
                                    <Text as="span" className="font-semibold text-muted-foreground flex items-center gap-2">
                                        <Text as="span" className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></Text>
                                        Xem trước thời gian thực
                                    </Text>
                                    {/* Giả lập đổi kích thước màn hình để test Responsive */}
                                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                                        <Button variant="ghost" size="sm" className="h-7 px-3 bg-background shadow-sm text-foreground">Desktop</Button>
                                        <Button variant="ghost" size="sm" className="h-7 px-3 text-muted-foreground">Tablet</Button>
                                        <Button variant="ghost" size="sm" className="h-7 px-3 text-muted-foreground">Mobile</Button>
                                    </div>
                                </div>

                                {/* Khung Preview được bọc trong viền Mockup thiết bị */}
                                <div className="flex-1 rounded-xl border shadow-lg bg-card overflow-hidden transition-all">
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