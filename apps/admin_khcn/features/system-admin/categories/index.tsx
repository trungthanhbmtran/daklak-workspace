"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { useGetCategories, useDeleteCategory, useGetCategoryGroups } from "./hooks/useCategoryApi";
import { useCategoryUI } from "./hooks/useCategoryUI";
import { CategorySidebar } from "./components/CategorySidebar";
import { CategoryTable } from "./components/CategoryTable";
import { CreateCategoryModal, EditCategoryModal } from "./components/CategoryModals";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import { useState } from "react";

export function CategoryClient() {
  const { data: queryData, isLoading: isLoadingData, isError } = useGetCategories();
  const { data: groups, isLoading: isLoadingGroups } = useGetCategoryGroups();

  const deleteMutation = useDeleteCategory();
  const ui = useCategoryUI(queryData, groups);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const isLoading = isLoadingData || isLoadingGroups;
  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 min-w-0">
      <CategorySidebar
        isLoading={isLoading}
        searchGroupTerm={ui.state.searchGroupTerm}
        setSearchGroupTerm={ui.setters.setSearchGroupTerm}
        filteredGroups={ui.derived.filteredGroups}
        activeGroup={ui.state.activeGroup}
        uniqueGroups={ui.derived.uniqueGroups}
        onSelectGroup={(group) => { ui.setters.setActiveGroup(group); }}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:block">
            <h3 className="text-lg font-semibold text-foreground">{groups?.find(g => g.code === ui.state.activeGroup)?.name || ui.state.activeGroup}</h3>
            <p className="text-sm text-muted-foreground">Quản lý các giá trị thuộc nhóm này</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search placeholder="Tìm mã hoặc tên..." className="w-full sm:w-64" />
            <Button className="shrink-0" onClick={() => ui.setters.setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm
            </Button>
          </div>
        </div>

        <CategoryTable
          isLoading={isLoading}
          isError={isError}
          data={ui.derived.filteredData}
          onEdit={(item) => ui.setters.setEditingItem(item)}
          onDelete={handleDelete}
        />
      </div>

      <CreateCategoryModal
        isOpen={ui.state.isCreateOpen}
        onClose={() => ui.setters.setIsCreateOpen(false)}
        activeGroup={ui.state.activeGroup}
        defaultSort={ui.derived.filteredData.length + 1}
      />

      <EditCategoryModal
        editingItem={ui.state.editingItem}
        onClose={() => ui.setters.setEditingItem(null)}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa "${itemToDelete?.name}"? Hành động này không thể hoàn tác.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
