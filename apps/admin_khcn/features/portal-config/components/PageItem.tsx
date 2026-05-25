"use client";

import React from "react";
import { Globe, Settings2, Trash2 } from "lucide-react";

interface PageMeta {
    id: string;
    title: Record<string, string>;
    isActive: boolean;
}

interface PageItemProps {
    page: PageMeta;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onEdit: (page: PageMeta) => void;
    onDelete: (id: string) => void;
}

export function PageItem({ page, isSelected, onSelect, onEdit, onDelete }: PageItemProps) {
    // Lấy tiêu đề chính (Ưu tiên tiếng Việt, nếu không có thì lấy ngôn ngữ đầu tiên tìm thấy)
    const primaryTitle = page.title.vi || page.title[Object.keys(page.title)[0]] || "Không có tiêu đề";

    // Lọc và nối các chuỗi ngôn ngữ phụ (ví dụ: English, French...) để hiển thị dưới dạng sub-text
    const secondaryLanguagesText = Object.entries(page.title)
        .filter(([key]) => key !== "vi")
        .map(([_, value]) => value)
        .join(" / ");

    // Kiểm tra xem có phải trang hệ thống cố định không (Không cho phép xóa)
    const isSystemPage = page.id === "about-page" || page.id === "contact-page";

    return (
        <div
            onClick={() => onSelect(page.id)}
            className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${isSelected
                    ? "bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm"
                    : "border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
        >
            {/* Header thông tin chính của Item */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col min-w-0">
                    <span className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"
                        }`}>
                        {primaryTitle}
                    </span>
                    <span className="text-[8px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                        Slug: /{page.id}
                    </span>
                </div>
                {/* Chấm tròn báo trạng thái Đã xuất bản / Bản nháp */}
                <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${page.isActive ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-slate-300 dark:bg-slate-700"
                    }`} />
            </div>

            {/* Footer chứa thông tin đa ngôn ngữ và các nút Action */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Globe className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                    <span className="text-[9px] font-bold italic text-slate-400 truncate max-w-[120px]">
                        {secondaryLanguagesText || "Không có ngôn ngữ phụ"}
                    </span>
                </div>

                {/* Bộ nút Action xuất hiện mượt mà khi hover vào item */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(page);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                    </button>

                    {!isSystemPage && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(page.id);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Vạch kẻ chỉ thị vị trí trang đang chọn bên cạnh trái */}
            {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-600 rounded-r-full shadow-lg shadow-indigo-500/50" />
            )}
        </div>
    );
}