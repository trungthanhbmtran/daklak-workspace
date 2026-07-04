"use client";

import React from "react";
import { usePortalBuilderUI } from "./PortalBuilderUIProvider";
import { usePagesList } from "./hooks/usePagesList";

export function BuilderBottomBar() {
    const { selectedPageId } = usePortalBuilderUI();
    const { pagesList, togglePageActive } = usePagesList(selectedPageId, () => {});
    const selectedPageMeta = pagesList.find(p => p.id === selectedPageId) || pagesList[0];

    const onToggleActive = async () => {
        if (!selectedPageId) return;
        await togglePageActive(selectedPageId);
    };


    return (
        <div className="min-h-[56px] py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between shrink-0 overflow-x-auto gap-4">
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Đang sửa:</span>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase truncate max-w-[200px]">{selectedPageMeta?.title?.vi}</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Public Route:</span>
                    <code className="text-[9px] lg:text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">/tuy-bien/{selectedPageMeta?.id}</code>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedPageMeta?.isActive ? "text-emerald-600" : "text-amber-600"}`}>
                    {selectedPageMeta?.isActive ? "Trang đang hoạt động" : "Trang đang bảo trì"}
                </span>
                <button
                    onClick={onToggleActive}
                    className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-all shadow-inner ${selectedPageMeta?.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-all ${selectedPageMeta?.isActive ? "translate-x-5" : "translate-x-1"}`} />
                </button>
            </div>
        </div>
    );
}