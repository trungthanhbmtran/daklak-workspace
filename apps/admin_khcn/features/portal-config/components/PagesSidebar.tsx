"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./SidebarHeader";
import { PageItem } from "./PageItem";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import { usePagesList } from "./hooks/usePagesList";
import { usePortalBuilderUI } from "./PortalBuilderUIProvider";

interface PagesSidebarProps {
  onOpenAddPage: () => void;
  onOpenEditPage: (page: any) => void;
}

export default function PagesSidebar({
  onOpenAddPage,
  onOpenEditPage,
}: PagesSidebarProps) {
  const { selectedPageId, setSelectedPageId, setShowPagesSidebar } = usePortalBuilderUI();
  const { pagesList, handleDeletePage } = usePagesList(selectedPageId, setSelectedPageId);


  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await handleDeletePage(itemToDelete);
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

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
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa trang"
        description="Bạn có chắc chắn muốn xóa trang này? Hành động này không thể hoàn tác."
      />
    </aside>
  );
}