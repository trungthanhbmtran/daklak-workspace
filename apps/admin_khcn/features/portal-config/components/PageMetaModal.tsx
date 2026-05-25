"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";
import { MultiLangTitleSlug } from "@/components/shared/MultiLangTitleSlug";
import { CustomPageMeta } from "./hooks/usePortalBuilder";

interface PageMetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "ADD" | "EDIT";
    pageMeta?: CustomPageMeta;
    activeLangs: any[];
    onSubmit: (id: string, titles: Record<string, string>, isActive: boolean) => void;
}

export function PageMetaModal({ isOpen, onClose, mode, pageMeta, activeLangs, onSubmit }: PageMetaModalProps) {
    const [pageId, setPageId] = useState("");
    const [titles, setTitles] = useState<Record<string, string>>({});
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setPageId(mode === "EDIT" ? pageMeta?.id || "" : "");
            setTitles(mode === "EDIT" ? pageMeta?.title || {} : {});
            setIsActive(mode === "EDIT" ? pageMeta?.isActive ?? true : true);
        }
    }, [isOpen, mode, pageMeta]);

    const multiLangValue = useMemo(() => {
        const result: Record<string, any> = {};
        for (const lang of activeLangs) {
            result[lang.code] = { title: titles[lang.code] || "", slug: "" };
        }
        return result;
    }, [titles, activeLangs]);

    const handleSave = () => {
        onSubmit(pageId, titles, isActive);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-[32px] border-none p-0 overflow-hidden shadow-2xl">
                <div className="p-8 bg-white dark:bg-[#0f172a]">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/50">
                            <Layout className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {mode === "ADD" ? "Tạo Trang Mới" : "Cấu Hình Meta Trang"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-400 dark:text-slate-500">
                            Đăng ký thông tin định danh và tiêu đề trang để bắt đầu thiết kế layout.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <MultiLangTitleSlug
                            value={multiLangValue}
                            onChange={(newVal: any) => {
                                const newTitles: Record<string, string> = {};
                                for (const code in newVal) {
                                    newTitles[code] = newVal[code].title;
                                }
                                setTitles(newTitles);
                                if (mode === "ADD" && newVal['vi']?.slug) {
                                    setPageId(newVal['vi'].slug);
                                }
                            }}
                            disabledSlug={mode === "EDIT"}
                        />

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Kích hoạt hiển thị</span>
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Mở trang cho người dùng cuối truy cập</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isActive ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl text-[10px] font-black uppercase text-slate-400">Hủy bỏ</Button>
                    <Button onClick={handleSave} className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                        {mode === "ADD" ? "Tạo Trang" : "Lưu Thay Đổi"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}