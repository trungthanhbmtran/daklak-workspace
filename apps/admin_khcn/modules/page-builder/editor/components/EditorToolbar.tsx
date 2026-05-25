"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, Undo, Redo, Columns, Settings, Eye, Sparkles } from "lucide-react";
import { PageLanguage } from "../../core/types";

interface EditorToolbarProps {
    languages: PageLanguage[];
    activeLang: string;
    setActiveLang: (code: string) => void;
    viewport: "desktop" | "tablet" | "mobile";
    setViewport: (v: "desktop" | "tablet" | "mobile") => void;
    history: { past: any[]; future: any[] };
    undo: () => void;
    redo: () => void;
    showLeftPanel: boolean;
    setShowLeftPanel: (show: boolean) => void;
    showRightPanel: boolean;
    setShowRightPanel: (show: boolean) => void;
    brandColorClass: string;
    radiusClass: string;
    onPreview?: () => void;
}

export function EditorToolbar({
    languages,
    activeLang,
    setActiveLang,
    viewport,
    setViewport,
    history,
    undo,
    redo,
    showLeftPanel,
    setShowLeftPanel,
    showRightPanel,
    setShowRightPanel,
    brandColorClass,
    radiusClass,
    onPreview,
}: EditorToolbarProps) {
    return (
        <header className="min-h-[64px] py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-wrap md:flex-nowrap items-center justify-between px-4 lg:px-6 shrink-0 z-30 shadow-sm gap-4 overflow-x-auto scrollbar-hide">

            {/* Cột trái: Logo & Đa ngôn ngữ */}
            <div className="flex items-center gap-3 lg:gap-6 shrink-0">
                <div className="flex items-center gap-2 shrink-0">
                    <div className={cn("w-8 h-8 lg:w-9 lg:h-9 text-white flex items-center justify-center shadow-lg bg-gradient-to-tr shrink-0 transition-all", brandColorClass, radiusClass)}>
                        <Sparkles className="w-4 h-4 lg:w-4.5 lg:h-4.5 animate-pulse" />
                    </div>
                    <div className="flex flex-col hidden sm:flex shrink-0">
                        <span className="text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Headless Visual CMS</span>
                        <span className="text-[10px] lg:text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mt-0.5">Page Builder</span>
                    </div>
                </div>

                <div className="h-6 w-px bg-slate-100 dark:bg-slate-850 shrink-0 hidden sm:block" />

                <div className={cn("flex bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-1 shrink-0", radiusClass)}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setActiveLang(lang.code)}
                            className={cn(
                                "px-2 lg:px-3 py-1 lg:py-1.5转型 text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                radiusClass,
                                activeLang === lang.code
                                    ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-white shadow-sm border border-slate-100/50"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cột giữa: Đổi kích thước khung nhìn Breakpoints */}
            <div className={cn("flex bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-1 shrink-0", radiusClass)}>
                {(["desktop", "tablet", "mobile"] as const).map((v) => {
                    const IconComponent = v === "desktop" ? Monitor : v === "tablet" ? Tablet : Smartphone;
                    return (
                        <button
                            key={v}
                            onClick={() => setViewport(v)}
                            className={cn(
                                "w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center transition-all",
                                radiusClass,
                                viewport === v ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-white shadow-sm border" : "text-slate-400"
                            )}
                        >
                            <IconComponent className="w-4 h-4" />
                        </button>
                    );
                })}
            </div>

            {/* Cột phải: Lịch sử và Ẩn hiện panel */}
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={undo} disabled={history.past.length === 0} className={cn("w-9 h-9 bg-white dark:bg-slate-950", radiusClass)}>
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={redo} disabled={history.future.length === 0} className={cn("w-9 h-9 bg-white dark:bg-slate-950", radiusClass)}>
                        <Redo className="w-4 h-4" />
                    </Button>
                </div>

                <div className="h-6 w-px bg-slate-100 dark:bg-slate-850 shrink-0" />

                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowLeftPanel(!showLeftPanel)}
                        className={cn("w-9 h-9 bg-white dark:bg-slate-950 transition-all", radiusClass, showLeftPanel && "bg-slate-50 border-indigo-200 text-indigo-650")}
                    >
                        <Columns className="w-4.5 h-4.5 rotate-180" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowRightPanel(!showRightPanel)}
                        className={cn("w-9 h-9 bg-white dark:bg-slate-950 transition-all", radiusClass, showRightPanel && "bg-slate-50 border-indigo-200 text-indigo-650")}
                    >
                        <Settings className="w-4.5 h-4.5" />
                    </Button>
                </div>

                {onPreview && (
                    <Button onClick={onPreview} className={cn("h-10 px-4 text-xs font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-850 flex items-center gap-1.5", radiusClass)}>
                        <Eye className="w-4 h-4" /> Xem trước
                    </Button>
                )}
            </div>
        </header>
    );
}