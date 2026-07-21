/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";
import { MultiLangTitleSlug } from "@/components/shared/MultiLangTitleSlug";
import { useMultiLangTitleSlugState } from "@/components/shared/hooks/useMultiLangTitleSlugState";
import { toast } from "sonner";
import { CustomPageMeta } from "./hooks/usePagesList";

export interface PageMetaModalRef {
    openAdd: () => void;
    openEdit: (page: CustomPageMeta) => void;
}

interface PageMetaModalProps {
    pagesList: CustomPageMeta[];
    activeLangs: any[];
    onSaveSuccess: (id: string, titles: Record<string, string>, isActive: boolean, mode: "ADD" | "EDIT") => Promise<void>;
}

export const PageMetaModal = forwardRef<PageMetaModalRef, PageMetaModalProps>(({ pagesList, activeLangs, onSaveSuccess }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");

    // Thay vì tự quản lý state thủ công, ta gọi công cụ dùng chung
    const { titles, slug: pageId, multiLangValue, handleMultiLangChange, setTitles, setSlug } = useMultiLangTitleSlugState({
        activeLangs,
        isEditMode: mode === "EDIT"
    });

    const [isActive, setIsActive] = useState(true);

    useImperativeHandle(ref, () => ({
        openAdd: () => {
            setMode("ADD");
            setSlug("");
            setTitles({});
            setIsActive(true);
            setIsOpen(true);
        },
        openEdit: (page) => {
            setMode("EDIT");
            setSlug(page.id);
            setTitles(page.title || {});
            setIsActive(page.isActive ?? true);
            setIsOpen(true);
        }
    }));

    const handleSave = async () => {
        if (!pageId.trim()) return toast.error("Vui lòng nhập slug định danh trang");
        const defaultLang = activeLangs[0]?.code || "vi";
        if (!titles[defaultLang]?.trim()) {
            return toast.error(`Vui lòng nhập tiêu đề (${activeLangs[0]?.name || "Mặc định"})`);
        }

        const cleanId = pageId.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");

        if (mode === "ADD" && pagesList.some((p) => p.id === cleanId)) {
            return toast.error("Mã định danh trang này đã tồn tại!");
        }

        setIsOpen(false);
        await onSaveSuccess(cleanId, titles, isActive, mode);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md rounded-[32px] border-none p-0 overflow-hidden shadow-2xl">
                <div className="p-8 bg-white dark:bg-slate-900">
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
                            onChange={handleMultiLangChange}
                            disabledSlug={mode === "EDIT"}
                        />

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Kích hoạt hiển thị</span>
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Mở trang cho người dùng cuối truy cập</span>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isActive ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-[10px] font-black uppercase text-slate-400">Hủy bỏ</Button>
                    <Button onClick={handleSave} className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                        {mode === "ADD" ? "Tạo Trang" : "Lưu Thay Đổi"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
});

PageMetaModal.displayName = "PageMetaModal";