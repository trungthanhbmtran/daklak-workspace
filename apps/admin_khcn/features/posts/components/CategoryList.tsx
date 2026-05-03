"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Edit2, Trash2, Folder,
  MoreHorizontal, ChevronRight, Loader2, Image as ImageIcon, FileText, Download
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { postsApi } from "../api";
import { Category } from "../types";

interface CategoryListProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: string) => void;
}

export function CategoryList({ onNavigateToCreate, onNavigateToEdit }: CategoryListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["posts-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res.data;
    },
  });

  console.log("categories", categories)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      alert("Xóa chuyên mục thành công!");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyên mục này?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCategories = categories?.filter((cat: Category) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chuyên mục bài viết</h1>
          <p className="text-muted-foreground">Quản lý cấu trúc phân cấp các bài viết trên hệ thống.</p>
        </div>
        <Button onClick={onNavigateToCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Thêm chuyên mục
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 px-6 border-b bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên chuyên mục..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
              {(filteredCategories?.length ?? 0) > 0 ? (
                (filteredCategories ?? []).map((cat: Category) => (
                  <TableRow key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border overflow-hidden flex items-center justify-center">
                        {cat.thumbnail ? (
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
                        <span className="text-xs text-slate-400 italic">N/A</span>
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
    </div>
  );
}
