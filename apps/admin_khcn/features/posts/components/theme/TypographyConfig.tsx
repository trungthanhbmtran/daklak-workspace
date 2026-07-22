"use client";

import React from "react";
import { useThemeConfig } from "./ThemeProvider";
import { Text } from "@/components/ui/typography";


export function TypographyConfig() {
    // Lấy state hiện tại và hàm setter thông minh từ Context toàn cục
    const { typography, setTypography } = useThemeConfig();

    return (
        <div className="space-y-4">
            {/* 1. Bộ chọn Font Tiêu Đề */}
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Font chữ Tiêu đề (Headings)
                </label>
                <select
                    value={typography.heading}
                    onChange={(e) => setTypography({ heading: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                    <option value="inter">Inter (Mặc định hiện đại)</option>
                    <option value="playfair">Playfair Display (Báo chí/Cổ điển)</option>
                    <option value="plus-jakarta">Plus Jakarta Sans (Công nghệ)</option>
                    <option value="roboto">Roboto (Cơ bản/Rõ ràng)</option>
                </select>
            </div>

            {/* 2. Bộ chọn Font Nội Dung */}
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Font chữ Nội dung (Body Text)
                </label>
                <select
                    value={typography.body}
                    onChange={(e) => setTypography({ body: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                    <option value="inter">Inter Sans-Serif</option>
                    <option value="merriweather">Merriweather Serif (Dễ đọc truyện/tin tức)</option>
                    <option value="Geist">Geist Mono (Kỹ thuật/Mã nguồn)</option>
                </select>
            </div>

            {/* 3. Thanh trượt Kích thước chữ nền (Font Size Scale) */}
            <div>
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
                    <Text as="span">Kích thước chữ mặc định</Text>
                    <Text as="span" className="font-bold text-primary dark:text-blue-400">
                        {typography.size}px
                    </Text>
                </div>
                <input
                    type="range"
                    min="12"
                    max="18"
                    value={typography.size}
                    onChange={(e) => setTypography({ size: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
}