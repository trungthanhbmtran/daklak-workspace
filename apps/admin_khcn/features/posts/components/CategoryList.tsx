/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Folder,
  MoreHorizontal, Loader2, FileText
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        items: res.data || [],
        meta: res.meta || {},
      };
    },
  });

  const categories = categoriesData?.items || [];
  const totalItems = Number(categoriesData?.meta?.total) || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      toast.success("Xóa chuyên mục thành công!");
    },
  });

  const handleDelete = (id: string) => {
    setDeletingCategoryId(id);
  };

  // Filter is handled by backend now


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Heading level="h1" className="font-bold tracking-tight">Chuyên mục bài viết</Heading>
            <Text className="text-muted-foreground">Quản lý cấu trúc phân cấp các bài viết trên hệ thống.</Text>
          </div>
          <Button onClick={onNavigateToCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm chuyên mục
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 px-6 border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Search
                placeholder="Tìm tên chuyên mục..."
                className="flex-1 max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/30">
                  <TableHead className="w-[80px] pl-6 text-xs font-bold uppercase tracking-wider">Ảnh</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Tên chuyên mục</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Slug</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Văn bản</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Thứ tự</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider">Bài viết</TableHead>
                  <TableHead className="w-[100px] text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((cat: Category) => (
                    <TableRow key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border overflow-hidden flex items-center justify-center">
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
                            <Folder className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          {cat.name}
                          {cat.parentId && <Badge variant="outline" className="text-[10px] py-0">Con</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{cat.slug}</TableCell>
                      <TableCell>
                        {cat.attachmentId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                            onClick={() => window.open(`/api/v1/admin/media/download/${cat.attachmentId}`, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-1" /> Xem
                          </Button>
                        ) : (
                          <Text as="span" variant="small" className="text-slate-400 italic font-normal">N/A</Text>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">{cat.orderIndex}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-100">
                          {cat._count?.posts || 0} bài
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="group-hover:bg-white border-transparent">
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                      Chưa có chuyên mục nào được tạo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-950/20 rounded-b-xl">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Hiển thị từ{" "}
            <Text as="span" className="text-slate-700 dark:text-slate-300 font-normal">
              {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
            </Text>{" "}
            đến{" "}
            <Text as="span" className="text-slate-700 dark:text-slate-300 font-normal">
              {Math.min(page * pageSize, totalItems)}
            </Text>{" "}
            trong tổng số{" "}
            <Text as="span" className="text-slate-700 dark:text-slate-300 font-normal">{totalItems}</Text>{" "}
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
