// features/posts/components/CategoryList.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Edit, Trash2, Loader2, MoreVertical,
  ChevronRight, ChevronDown, CheckCircle2, XCircle, Layout
} from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { postsApi } from "../api";
import { Category } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CategoryListProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: string) => void;
}

export function CategoryList({ onNavigateToCreate, onNavigateToEdit }: CategoryListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories_all"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      const payload = res?.data;
      if (!payload) return [];
      // Gateway might return nested or flat. We handle flat for the table display.
      return payload.data || payload.items || (Array.isArray(payload) ? payload : []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories_all"] });
      alert("Xóa chuyên mục thành công!");
    },
    onError: (err: any) => {
      alert("Lỗi: " + (err.response?.data?.message || "Có lỗi xảy ra khi xóa chuyên mục."));
    },
  });

  const filteredCategories = (categories || []).filter((c: Category) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải danh sách chuyên mục...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Chuyên mục</h2>
          <p className="text-muted-foreground">Tổ chức nội dung bài viết theo cấu trúc phân cấp.</p>
        </div>
        <Button onClick={onNavigateToCreate} className="shadow-md bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Thêm chuyên mục mới
        </Button>
      </div>

      <Card className="p-4 bg-card border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên chuyên mục..."
            className="pl-9 h-10 bg-muted/20 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="border shadow-sm overflow-hidden rounded-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[400px]">Tên chuyên mục</TableHead>
              <TableHead>Mã định danh (Slug)</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tiêu chuẩn NN</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  Không tìm thấy chuyên mục nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category: Category) => (
                <TableRow key={category.id} className="hover:bg-muted/10">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {/* Thụt lề dựa trên độ sâu (depth) nếu có */}
                      {Array.from({ length: category.depth || 0 }).map((_, i) => (
                        <div key={i} className="w-6 h-px border-l-2 border-muted-foreground/20 ml-3 first:ml-0" />
                      ))}
                      {category.depth > 0 && <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground/50" />}
                      <span className={category.depth === 0 ? "font-bold text-primary" : ""}>
                        {category.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{category.slug}</code>
                  </TableCell>
                  <TableCell>{category.orderIndex}</TableCell>
                  <TableCell>
                    {category.status ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1 px-2">
                        <CheckCircle2 className="h-3 w-3" /> Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-200 gap-1 px-2">
                        <XCircle className="h-3 w-3" /> Tạm khóa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.isGovStandard ? (
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200">
                        Chuẩn NN
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onNavigateToEdit(category.id)}>
                          <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/5"
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa chuyên mục "${category.name}"?`)) {
                              deleteMutation.mutate(category.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
        <Layout className="h-4 w-4 text-primary" />
        <span>Gợi ý: Bạn có thể tạo cấu trúc chuyên mục đa cấp để phân loại nội dung bài viết tốt hơn.</span>
      </div>
    </div>
  );
}
