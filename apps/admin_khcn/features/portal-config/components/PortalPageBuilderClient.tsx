"use client";

import React, { useState } from "react";
import { ThemeProvider } from "@/features/posts/components/theme/ThemeProvider";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { useLanguages } from "./hooks/useLanguages";
import { usePortalBuilder, CustomPageMeta } from "./hooks/usePortalBuilder";

import { BuilderHeader } from "./BuilderHeader";
import { BuilderBottomBar } from "./BuilderBottomBar";
import { PageMetaModal } from "./PageMetaModal";
import PagesSidebar from "./PagesSidebar";

const PageBuilder = dynamic(
  () => import("./PageBuilder").then((mod) => mod.PageBuilder),
  { ssr: false }
);

export function PortalPageBuilderClient() {
  const rawLanguages = useLanguages();

  // Khởi tạo các trạng thái và nghiệp vụ thông qua custom hook
  const builder = usePortalBuilder(rawLanguages);

  // Quản lý trạng thái mở Modal cục bộ
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "ADD" | "EDIT";
    pageData?: CustomPageMeta;
  }>({ isOpen: false, mode: "ADD" });

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

  const handleModalSubmit = async (id: string, titles: Record<string, string>, isActive: boolean) => {
    if (!id.trim()) return toast.error("Vui lòng nhập slug định danh trang");

    const cleanId = id.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");

    if (modalState.mode === "ADD") {
      if (builder.pagesList.some((p) => p.id === cleanId)) {
        return toast.error("Mã định danh trang này đã tồn tại!");
      }
      const newPage: CustomPageMeta = { id: cleanId, title: titles, isActive };
      setModalState({ isOpen: false, mode: "ADD" });
      await builder.handleSaveLayout(cleanId, [], [...builder.pagesList, newPage]);
      builder.setSelectedPageId(cleanId);
    } else {
      const updatedList = builder.pagesList.map((p) =>
        p.id === cleanId ? { ...p, title: titles, isActive } : p
      );
      builder.setPagesList(updatedList);
      setModalState({ isOpen: false, mode: "EDIT" });
      await builder.handleSaveLayout(cleanId, builder.currentLayout, updatedList);
    }
    builder.refetch();
  };

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">

        {/* 1. HEADER COMPONENT */}
        <BuilderHeader
          selectedPageMeta={builder.selectedPageMeta}
          isSaving={builder.isSaving}
          showPagesSidebar={builder.showPagesSidebar}
          setShowPagesSidebar={builder.setShowPagesSidebar}
          onSync={() => builder.refetch()}
          onPublish={() => builder.handleSaveLayout(builder.selectedPageId, builder.currentLayout)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* 2. SIDEBAR QUẢN LÝ DANH SÁCH TRANG */}
          {builder.showPagesSidebar && (
            <PagesSidebar
              pagesList={builder.pagesList}
              selectedPageId={builder.selectedPageId}
              setSelectedPageId={builder.setSelectedPageId}
              setShowPagesSidebar={builder.setShowPagesSidebar}
              openAddPageModal={() => setModalState({ isOpen: true, mode: "ADD" })}
              openEditPageModal={(page) => setModalState({ isOpen: true, mode: "EDIT", pageData: page })}
              handleDeletePage={builder.handleDeletePage}
            />
          )}

          {/* 3. KHU VỰC THIẾT KẾ TRỰC QUAN (WORKFLOW VISUAL BUILDER) */}
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

        {/* 5. MODAL METADATA ĐA NGÔN NGỮ */}
        <PageMetaModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          mode={modalState.mode}
          pageMeta={modalState.pageData}
          activeLangs={builder.activeLangs}
          onSubmit={handleModalSubmit}
        />
      </div>
    </ThemeProvider>
  );
}