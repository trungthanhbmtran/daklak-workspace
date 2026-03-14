"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useGetCategories, useDeleteCategory } from "./hooks/useCategoryApi";
import { useCategoryUI } from "./hooks/useCategoryUI";
import { GROUP_LABELS } from "./constants";
import { CategorySidebar } from "./components/CategorySidebar";
import { CategoryTable } from "./components/CategoryTable";
import { CreateCategoryModal, EditCategoryModal } from "./components/CategoryModals";

export function CategoryClient() {
  const { data: serverData = [], isLoading, isError } = useGetCategories();
  const deleteMutation = useDeleteCategory();
  const ui = useCategoryUI(serverData);

  const handleDelete = (item: any) => {
    if (confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <CategorySidebar 
        isLoading={isLoading}
        searchGroupTerm={ui.state.searchGroupTerm}
        setSearchGroupTerm={ui.setters.setSearchGroupTerm}
        filteredGroupKeys={ui.derived.filteredGroupKeys}
        activeGroup={ui.state.activeGroup}
        uniqueGroups={ui.derived.uniqueGroups}
        onSelectGroup={(group) => { ui.setters.setActiveGroup(group); ui.setters.setSearchTerm(""); }}
      />

      <div className="flex-1 w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:block">
            <h3 className="text-lg font-semibold text-foreground">{GROUP_LABELS[ui.state.activeGroup] || ui.state.activeGroup}</h3>
            <p className="text-sm text-muted-foreground">Quản lý các giá trị thuộc nhóm này</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm mã hoặc tên..." 
                className="pl-8 bg-background" 
                value={ui.state.searchTerm} 
                onChange={(e) => ui.setters.setSearchTerm(e.target.value)} 
              />
            </div>
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
    </div>
  );
}
