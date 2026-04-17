"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, Folder, ChevronRight, ChevronDown, Loader2, AlertCircle, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { postsApi } from "../api";
import { Category } from "../types";

export function CategoryList({ 
  onNavigateToCreate, 
  onNavigateToEdit 
}: { 
  onNavigateToCreate: () => void, 
  onNavigateToEdit: (id: string) => void 
}) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories", searchTerm],
    queryFn: async () => {
      const res = await postsApi.getCategories({ search: searchTerm || undefined });
      const payload = res?.data;
      if (!payload) return [];
      
      // If it's already a tree, we use it. If it's flat, we keep it flat for now.
      // API usually returns flat list with parentId or tree structure depending on params
      return Array.isArray(payload) ? payload : (payload.items || []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      alert("Xóa chuyên mục thành công!");
    },
    onError: (err: any) => {
      alert(`Lỗi: ${err?.response?.data?.message || err.message}`);
    }
  });

  const categories = data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Tool Bar */}
      <Card className="p-4 bg-card border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center rounded-xl">
        <div className="flex flex-1 w-full flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên chuyên mục..."
              className="pl-9 h-10 bg-muted/20 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={onNavigateToCreate} className="w-full sm:w-auto h-10 px-6 shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Thêm chuyên mục
        </Button>
      </Card>

      {/* Category Table */}
      <Card className="border shadow-sm rounded-xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-5 py-4 font-semibold">Tên chuyên mục</th>
                <th className="px-5 py-4 font-semibold">Slug</th>
                <th className="px-5 py-4 font-semibold">Thứ tự</th>
                <th className="px-5 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-5 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-xs">Đang tải danh sách chuyên mục...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-destructive">
                      <AlertCircle className="h-8 w-8" />
                      <p className="font-medium">Không thể tải dữ liệu</p>
                      <p className="text-xs">{(error as any)?.message || "Vui lòng thử lại sau"}</p>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center text-muted-foreground italic">
                    Không tìm thấy chuyên mục nào.
                  </td>
                </tr>
              ) : (
                categories.map((cat: Category) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {/* Indentation for hierarchy */}
                        {cat.depth > 0 && (
                          <div 
                            className="flex shrink-0" 
                            style={{ width: `${cat.depth * 20}px` }}
                          >
                            <div className="w-full border-l-2 border-muted h-6 self-start -mt-3 ml-2 rounded-bl-lg" />
                          </div>
                        )}
                        <Folder className="h-4 w-4 text-primary/60 shrink-0" />
                        <span 
                          className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => onNavigateToEdit(cat.id)}
                        >
                          {cat.name}
                        </span>
                        {cat.isGovStandard && (
                          <Badge variant="outline" className="ml-2 text-[10px] bg-blue-50 text-blue-600 border-blue-100">
                            Tiêu chuẩn nhà nước
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-4 text-center w-24">
                      {cat.orderIndex}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${cat.status ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                      >
                        {cat.status ? "Hiển thị" : "Ẩn"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary" 
                          onClick={() => onNavigateToEdit(cat.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Xác nhận xóa chuyên mục này? Các chuyên mục con có thể bị ảnh hưởng.")) {
                              deleteMutation.mutate(cat.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-2">
        <Layers className="h-3 w-3" />
        <span>Ghi chú: Cấu trúc chuyên mục được quản lý theo mô hình Nested Set để tối ưu hiệu năng hiển thị dạng cây.</span>
      </div>
    </div>
  );
}
