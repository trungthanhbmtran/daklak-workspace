// features/posts/components/CategoryList.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Plus, Edit, Trash2, FolderTree, 
  CheckCircle2, XCircle, ArrowRight, Loader2, MoreVertical
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
      const payload = res.data;
      return payload.data || payload.items || (Array.isArray(payload) ? payload : []);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      alert("Xóa chuyên mục thành công!");
    },
    onError: () => alert("Có lỗi xảy ra khi xóa chuyên mục."),
  });

  const filteredCategories = (categories || []).filter((cat: Category) => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-2xl font-bold tracking-tight">Quản lý chuyên mục</h2>
        <Button onClick={onNavigateToCreate} className="shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Thêm chuyên mục
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

      <Card className="border shadow-sm rounded-xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-5 py-4 font-semibold">Tên chuyên mục</th>
                <th className="px-5 py-4 font-semibold">Slug</th>
                <th className="px-5 py-4 font-semibold">Thứ tự</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Không tìm thấy chuyên mục nào.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat: Category) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                          <FolderTree className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground">
                      /{cat.slug}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {cat.orderIndex}
                    </td>
                    <td className="px-5 py-4">
                      {cat.status ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 gap-1 py-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 gap-1 py-0.5">
                          <XCircle className="h-3 w-3" /> Tạm dừng
                        </Badge>
                      )}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa chuyên mục "${cat.name}"?`)) {
                                  deleteMutation.mutate(cat.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Xóa chuyên mục
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
