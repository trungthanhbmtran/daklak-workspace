"use client";

import React, { useRef } from "react";
import { ThemeProvider } from "@/features/posts/components/theme/ThemeProvider";
import dynamic from "next/dynamic";
import { useLanguages } from "./hooks/useLanguages";
import { usePortalBuilder, CustomPageMeta } from "./hooks/usePortalBuilder";

import { BuilderHeader } from "./BuilderHeader";
import { BuilderBottomBar } from "./BuilderBottomBar";
import { PageMetaModal, PageMetaModalRef } from "./PageMetaModal";
import PagesSidebar from "./PagesSidebar";

const PageBuilder = dynamic(
  () => import("./PageBuilder").then((mod) => mod.PageBuilder),
  { ssr: false }
);

export function PortalPageBuilderClient() {
  const rawLanguages = useLanguages();
  const builder = usePortalBuilder(rawLanguages);

  // Khởi tạo Ref để tương tác với các phương thức phơi bày của Modal
  const modalRef = useRef<PageMetaModalRef>(null);

  if (builder.isLoading) {
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

  const handleModalSubmit = async (id: string, titles: Record<string, string>, isActive: boolean, mode: "ADD" | "EDIT") => {
    if (mode === "ADD") {
      const newPage: CustomPageMeta = { id, title: titles, isActive };
      await builder.handleSaveLayout(id, [], [...builder.pagesList, newPage]);
      builder.setSelectedPageId(id);
    } else {
      const updatedList = builder.pagesList.map((p) => p.id === id ? { ...p, title: titles, isActive } : p);
      builder.setPagesList(updatedList);
      await builder.handleSaveLayout(id, builder.currentLayout, updatedList);
    }
    builder.refetch();
  };

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">

        {/* 1. HEADER */}
        <BuilderHeader
          selectedPageMeta={builder.selectedPageMeta}
          isSaving={builder.isSaving}
          showPagesSidebar={builder.showPagesSidebar}
          setShowPagesSidebar={builder.setShowPagesSidebar}
          onSync={() => builder.refetch()}
          onPublish={() => builder.handleSaveLayout(builder.selectedPageId, builder.currentLayout)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* 2. SIDEBAR QUẢN LÝ TRANG (ĐÃ SỬA LỖI: Bổ sung 2 props định tuyến Ref điều khiển modal) */}
          {builder.showPagesSidebar && (
            <PagesSidebar
              pagesList={builder.pagesList}
              selectedPageId={builder.selectedPageId}
              setSelectedPageId={builder.setSelectedPageId}
              setShowPagesSidebar={builder.setShowPagesSidebar}
              handleDeletePage={builder.handleDeletePage}
              onOpenAddPage={() => modalRef.current?.openAdd()}
              onOpenEditPage={(page) => modalRef.current?.openEdit(page)}
            />
          )}

          {/* 3. WORKSPACE VISUAL BUILDER */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex-1 bg-[#f8fafc] dark:bg-[#020617] flex flex-col h-full overflow-hidden relative">
              <PageBuilder
                key={builder.selectedPageId}
                layout={builder.currentLayout}
                onChange={builder.setCurrentLayout}
                languages={builder.activeLangs}
              />
            </div>

            {/* 4. THANH TRẠNG THÁI DƯỚI CÙNG */}
            <BuilderBottomBar
              selectedPageMeta={builder.selectedPageMeta}
              onToggleActive={async () => {
                const updatedList = builder.pagesList.map((p) =>
                  p.id === builder.selectedPageId ? { ...p, isActive: !p.isActive } : p
                );
                builder.setPagesList(updatedList);
                await builder.handleSaveLayout(builder.selectedPageId, builder.currentLayout, updatedList);
              }}
            />
          </div>
        </div>

        {/* 5. MODAL ĐA NGÔN NGỮ */}
        <PageMetaModal
          ref={modalRef}
          pagesList={builder.pagesList}
          activeLangs={builder.activeLangs}
          onSaveSuccess={handleModalSubmit}
        />
      </div>
    </ThemeProvider>
  );
}