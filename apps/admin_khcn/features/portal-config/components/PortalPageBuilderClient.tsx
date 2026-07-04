"use client";

import React, { useRef } from "react";
import { ThemeProvider } from "@/features/posts/components/theme/ThemeProvider";
import dynamic from "next/dynamic";
import { useLanguages } from "./hooks/useLanguages";
import { usePagesList } from "./hooks/usePagesList";

import { BuilderHeader } from "./BuilderHeader";
import { BuilderBottomBar } from "./BuilderBottomBar";
import { PageMetaModal, PageMetaModalRef } from "./PageMetaModal";
import PagesSidebar from "./PagesSidebar";

const PageBuilder = dynamic(
  () => import("./PageBuilder").then((mod) => mod.PageBuilder),
  { ssr: false }
);

import { PortalBuilderUIProvider, usePortalBuilderUI } from "./PortalBuilderUIProvider";

export function PortalPageBuilderInner() {
  const { selectedPageId, setSelectedPageId, showPagesSidebar } = usePortalBuilderUI();
  const { pagesList, isLoading, handleSavePageMeta } = usePagesList(selectedPageId, setSelectedPageId);
  const rawLanguages = useLanguages();
  const activeLangs = rawLanguages.length > 0 ? rawLanguages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  const modalRef = useRef<PageMetaModalRef>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-black text-slate-800 uppercase tracking-widest animate-pulse">
          Đang đồng bộ hóa dữ liệu Visual Builder...
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">
        {/* 1. HEADER */}
        <BuilderHeader />

        <div className="flex-1 flex overflow-hidden">
          {/* 2. SIDEBAR QUẢN LÝ TRANG */}
          {showPagesSidebar && (
            <PagesSidebar
              onOpenAddPage={() => modalRef.current?.openAdd()}
              onOpenEditPage={(page) => modalRef.current?.openEdit(page)}
            />
          )}

          {/* 3. WORKSPACE VISUAL BUILDER */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex-1 bg-[#f8fafc] dark:bg-[#020617] flex flex-col h-full overflow-hidden relative">
              <PageBuilder key={selectedPageId} />
            </div>

            {/* 4. THANH TRẠNG THÁI DƯỚI CÙNG */}
            <BuilderBottomBar />
          </div>
        </div>

        {/* 5. MODAL ĐA NGÔN NGỮ */}
        <PageMetaModal
          ref={modalRef}
          pagesList={pagesList}
          activeLangs={activeLangs}
          onSaveSuccess={handleSavePageMeta}
        />
      </div>
    </ThemeProvider>
  );
}

export function PortalPageBuilderClient() {
  return (
    <PortalBuilderUIProvider>
      <PortalPageBuilderInner />
    </PortalBuilderUIProvider>
  );
}