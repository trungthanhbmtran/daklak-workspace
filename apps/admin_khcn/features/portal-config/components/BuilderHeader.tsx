"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, Loader2, Columns } from "lucide-react";
import { usePortalBuilderUI } from "./PortalBuilderUIProvider";
import { usePagesList } from "./hooks/usePagesList";
import { usePageLayout } from "./hooks/usePageLayout";
import { cn } from "@/lib/utils";

export function BuilderHeader() {
    const { selectedPageId, showPagesSidebar, setShowPagesSidebar } = usePortalBuilderUI();
    const { pagesList } = usePagesList(selectedPageId, () => {});
    
    const selectedPageMeta = pagesList.find(p => p.id === selectedPageId) || pagesList[0];
    
    const { isSaving, handleSaveLayout, refetch } = usePageLayout(
        selectedPageId, 
        selectedPageMeta?.isActive ?? false, 
        selectedPageMeta?.title?.vi || selectedPageId
    );


    return (
        <header className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div>
                <h1 className="text-base lg:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Visual Portal Builder</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Administrative Design Suite</span>
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPagesSidebar(!showPagesSidebar)}
                    className={cn(
                        "w-9 h-9 lg:w-10 lg:h-10 rounded-2xl border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all",
                        showPagesSidebar && "bg-slate-50 dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                    )}
                >
                    <Columns className={cn("w-4 h-4 transition-transform duration-300", !showPagesSidebar && "rotate-180")} />
                </Button>

                <div className="hidden xl:flex items-center gap-6 py-2 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trang đang mở</span>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight truncate max-w-[150px]">{selectedPageMeta?.title?.vi}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trạng thái</span>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedPageMeta?.isActive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                            {selectedPageMeta?.isActive ? "Đã xuất bản" : "Bản nháp"}
                        </div>
                    </div>
                </div>

                <Button onClick={() => refetch()} variant="outline" size="sm" className="h-10 lg:h-11 px-3 lg:px-6 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold tracking-wide rounded-2xl text-[10px] uppercase gap-1.5 shadow-sm transition-all">
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Đồng bộ</span>
                </Button>

                <Button onClick={handleSaveLayout} disabled={isSaving} className="h-10 lg:h-11 px-4 lg:px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] gap-1.5 shadow-xl">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Xuất bản Portal</span>
                </Button>
            </div>
        </header>
    );
}