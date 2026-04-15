"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Edit, Trash2, FolderTree,
  CheckCircle2, XCircle, Loader2, MoreVertical,
  ChevronRight, Subtitles
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
      // Quá trình unwrap đã diễn ra ở layer API (api.ts)
      return res.data as Category[];
    },
  });

  console.log("categories", categories);


  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-categories"] });
      alert("Xóa chuyên mục và các nhánh con thành công!");
    },
  });

  const filteredCategories = (categories || []).filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Đang đồng bộ cấu trúc Nested Set...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cấu trúc chuyên mục</h2>
          <p className="text-sm text-muted-foreground">Quản lý phân cấp theo mô hình Nested Set</p>
        </div>
        <Button onClick={onNavigateToCreate} className="bg-primary hover:bg-primary/90 shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> Thêm chuyên mục
        </Button>
      </div>

      <Card className="p-4 border-none shadow-sm bg-muted/30 flex gap-4 items-center rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm trong cây chuyên mục..."
            className="pl-9 bg-background focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="border shadow-md rounded-xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Cấu trúc phân cấp</th>
                <th className="px-6 py-4 font-semibold w-[120px]">Chỉ số (L-R)</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                    Chưa có dữ liệu chuyên mục.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {/* Đường kẻ phân cấp */}
                        {[...Array(cat.depth)].map((_, i) => (
                          <div key={i} className="w-6 h-10 border-r border-border/60 mr-2 flex-shrink-0" />
                        ))}

                        <div className="flex items-center gap-3">
                          {cat.depth > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50 -ml-1" />}
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                            ${cat.depth === 0 ? 'bg-primary text-primary-foreground' : 'bg-background border text-muted-foreground'}`}>
                            <FolderTree className="h-4 w-4" />
                          </div>
                          <div>
                            <p className={`font-medium ${cat.depth === 0 ? 'text-base' : 'text-sm'}`}>
                              {cat.name}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground italic">/{cat.slug}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">{cat.lft}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100">{cat.rgt}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={cat.status ? "default" : "secondary"} className={cat.status ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200" : ""}>
                        {cat.status ? "Hoạt động" : "Ẩn"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => onNavigateToEdit(cat.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => {
                                if (confirm(`CẢNH BÁO: Xóa "${cat.name}" sẽ xóa TẤT CẢ chuyên mục con bên trong. Bạn chắc chắn chứ?`)) {
                                  deleteMutation.mutate(cat.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Xóa toàn bộ nhánh
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