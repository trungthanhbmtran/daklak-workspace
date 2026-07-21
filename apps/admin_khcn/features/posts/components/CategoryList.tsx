/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Folder,
  MoreHorizontal, FileText
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { ColumnDef } from "@/components/shared/responsive-table/types";
import { postsApi } from "../api";
import { Category } from "../types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSearchParams } from "next/navigation";

interface CategoryListProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: string) => void;
}

export function CategoryList({ onNavigateToCreate, onNavigateToEdit }: CategoryListProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["posts-categories", page, searchTerm],
    queryFn: async () => {
      const res = await postsApi.getCategories({
        page,
        limit: pageSize,
        search: searchTerm || undefined,
        mode: 'flat',
      });
      return {
        items: res.data,
        meta: res.meta || {},
      };
    },
  });

  const categories = categoriesData?.items || [];
  const totalItems = Number(categoriesData?.meta?.total) || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const deleteMutation = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (id: string) => postsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      toast.success("Xóa chuyên mục thành công!");
    },
  });

  const handleDelete = (id: string) => {
    setDeletingCategoryId(id);
  };

  const columns: ColumnDef<Category>[] = [
    {
      header: "Ảnh",
      cell: (cat) => (
        <div className="w-12 h-12 rounded-lg bg-muted border overflow-hidden flex items-center justify-center">
          {cat.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/v1/admin/media/download/${cat.thumbnail}`}
              alt={cat.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('/api/v1/media/download/')) {
                  target.src = `/api/v1/media/download/${cat.thumbnail}`;
                }
              }}
            />
          ) : (
            <Folder className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      )
    },
    {
      header: "Tên chuyên mục",
      cell: (cat) => (
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Text as="span">{cat.name}</Text>
          {cat.parentId && <Badge variant="outline" className="text-[10px] py-0">Con</Badge>}
        </div>
      )
    },
    {
      header: "Slug",
      cell: (cat) => (
        <Text as="span" className="font-mono text-xs text-muted-foreground">{cat.slug}</Text>
      )
    },
    {
      header: "Văn bản",
      cell: (cat) => (
        cat.attachmentId ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
            onClick={() => window.open(`/api/v1/admin/media/download/${cat.attachmentId}`, '_blank')}
          >
            <FileText className="h-4 w-4 mr-1" /> Xem
          </Button>
        ) : (
          <Text as="span" className="text-muted-foreground italic font-normal text-xs">N/A</Text>
        )
      )
    },
    {
      header: "Thứ tự",
      cell: (cat) => (
        <Text as="span" className="text-sm font-medium text-foreground">{cat.orderIndex}</Text>
      )
    },
    {
      header: "Bài viết",
      cell: (cat) => (
        <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-100">
          {cat._count?.posts || 0} bài
        </Badge>
      )
    },
    {
      header: "",
      className: "text-right pr-6",
      cell: (cat) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="group-hover:bg-background border-transparent transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onNavigateToEdit(cat.id)}>
              <Edit2 className="mr-2 h-3.5 w-3.5" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(cat.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Heading level="h1" className="font-bold tracking-tight">Chuyên mục bài viết</Heading>
            <Text className="text-muted-foreground">Quản lý cấu trúc phân cấp các bài viết trên hệ thống.</Text>
          </div>
          <Button onClick={onNavigateToCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Thêm chuyên mục
          </Button>
        </div>

        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 px-6 border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <Search
                placeholder="Tìm tên chuyên mục..."
                className="flex-1 max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveTable
              loading={isLoading}
              data={categories}
              columns={columns}
              keyExtractor={(cat) => cat.id}
              emptyMessage="Chưa có chuyên mục nào được tạo."
              footer={
                <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div className="text-xs font-bold text-muted-foreground">
                    Hiển thị từ{" "}
                    <Text as="span" className="text-foreground font-normal">
                      {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
                    </Text>{" "}
                    đến{" "}
                    <Text as="span" className="text-foreground font-normal">
                      {Math.min(page * pageSize, totalItems)}
                    </Text>{" "}
                    trong tổng số{" "}
                    <Text as="span" className="text-foreground font-normal">{totalItems}</Text>{" "}
                    chuyên mục
                  </div>

                  <div className="flex flex-wrap items-center gap-4.5">
                    <PageSizeSelector value={pageSize} onValueChange={setPageSize} options={[5, 10, 15, 20, 50]} />

                    <Pagination className="w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className={page === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalPages || 1) }).map((_, i) => {
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
                            onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                            className={page >= totalPages || totalPages === 0 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deletingCategoryId} onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chuyên mục này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deletingCategoryId) {
                  deleteMutation.mutate(deletingCategoryId);
                  setDeletingCategoryId(null);
                }
              }}
            >
              Xóa chuyên mục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
