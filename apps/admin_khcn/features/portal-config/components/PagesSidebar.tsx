"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./SidebarHeader";
import { PageItem } from "./PageItem";

interface PagesSidebarProps {
  pagesList: any[];
  selectedPageId: string;
  setSelectedPageId: (id: string) => void;
  setShowPagesSidebar: (show: boolean) => void;
  handleDeletePage: (pageId: string) => void;
  onOpenAddPage: () => void;
  onOpenEditPage: (page: any) => void;
}

export default function PagesSidebar({
  pagesList,
  selectedPageId,
  setSelectedPageId,
  setShowPagesSidebar,
  handleDeletePage,
  onOpenAddPage,
  onOpenEditPage,
}: PagesSidebarProps) {
  return (
    <aside
      className={cn(
        "border-r border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col z-30 shrink-0 transition-all duration-300",
        "w-80"
      )}
    >
      {/* Kích hoạt mở modal thêm trang qua Ref từ cha gửi xuống */}
      <SidebarHeader onAddPageClick={onOpenAddPage} />

      {/* Danh sách các trang quản lý */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {pagesList.map((page) => (
          <PageItem
            key={page.id}
            page={page}
            isSelected={page.id === selectedPageId}
            onSelect={(id) => {
              setSelectedPageId(id);
              setShowPagesSidebar(false); // Đóng sidebar trên responsive mobile
            }}
            onEdit={onOpenEditPage}
            onDelete={handleDeletePage}
          />
        ))}
      </div>
    </aside>
  );
}