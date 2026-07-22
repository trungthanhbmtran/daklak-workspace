"use client";

import React from "react";
import { Plus, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
    onAddPageClick: () => void;
}

export function SidebarHeader({ onAddPageClick }: SidebarHeaderProps) {
    return (
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Quản lý trang
                </h2>
            </div>
            <Button
                size="icon"
                onClick={onAddPageClick}
                className="w-8 h-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:rotate-90"
             iconStart={<Plus className="w-4 h-4" />}></Button>
        </div>
    );
}