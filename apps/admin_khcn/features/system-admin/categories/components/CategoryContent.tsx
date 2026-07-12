"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useGetPaginatedCategoryByGroup, useDeleteCategory, useGetCategoryGroups } from "../hooks/useCategoryApi";
import { useCategoryUI } from "../hooks/useCategoryUI";
import { CategoryTable } from "./CategoryTable";
import { CreateCategoryModal, EditCategoryModal } from "./CategoryModals";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface CategoryContentProps {
  activeGroup: string;
}

export function CategoryContent({ activeGroup }: CategoryContentProps) {
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";

  // Fetch groups to get the group name
  const { data: groups } = useGetCategoryGroups();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeGroup]);

  const { data: queryResult, isLoading: isLoadingData, isError } = useGetPaginatedCategoryByGroup(
    activeGroup,
    { skip: (page - 1) * pageSize, take: pageSize, q: searchTerm || undefined }
  );

  const queryData = queryResult?.data || [];
  const totalItems = queryResult?.meta?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const deleteMutation = useDeleteCategory();
  const ui = useCategoryUI(queryData, groups || []);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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
    <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="hidden sm:block">
          <h3 className="text-lg font-semibold text-foreground">
            {groups?.find((g: any) => g.code === activeGroup)?.name || activeGroup}
          </h3>
          <p className="text-sm text-muted-foreground">Quản lý các giá trị thuộc nhóm này</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search
            placeholder="Tìm mã hoặc tên..."
            className="w-full sm:w-64"
          />
          <Button className="shrink-0" onClick={() => ui.setters.setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Thêm
          </Button>
        </div>
      </div>

      <CategoryTable
        isLoading={isLoadingData}
        isError={isError}
        data={queryData}
        onEdit={(item) => ui.setters.setEditingItem(item)}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="py-4 flex justify-center mt-auto">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={page === pageNum}
                      onClick={() => setPage(pageNum)}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <CreateCategoryModal
        isOpen={ui.state.isCreateOpen}
        onClose={() => ui.setters.setIsCreateOpen(false)}
        activeGroup={activeGroup}
        defaultSort={totalItems + 1}
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
