"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, FileText, CheckCircle2, Clock, EyeOff, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data & types (Thay bằng API thật của bạn)
type PostStatus = 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'HIDDEN';
interface Post {
  id: string;
  title: string;
  category: string;
  author: string;
  status: PostStatus;
  views: number;
  publishedAt?: string;
}

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; icon: any }> = {
  PUBLISHED: { label: "Đã xuất bản", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  PENDING: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  DRAFT: { label: "Bản nháp", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
  HIDDEN: { label: "Đang ẩn", color: "bg-rose-100 text-rose-700 border-rose-200", icon: EyeOff },
};

export function PostList({ onNavigateToCreate, onNavigateToEdit }: { onNavigateToCreate: () => void, onNavigateToEdit: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Giả lập dữ liệu
  const mockPosts: Post[] = [
    { id: "1", title: "Kế hoạch chuyển đổi số tỉnh Đắk Lắk năm 2026", category: "Chuyển đổi số", author: "Nguyễn Văn A", status: "PUBLISHED", views: 1250, publishedAt: "2026-02-25" },
    { id: "2", title: "Thông báo tổ chức hội thảo ứng dụng AI trong hành chính công", category: "Thông báo", author: "Trần Thị B", status: "PENDING", views: 0 },
    { id: "3", title: "Báo cáo tổng kết quý I năm 2026", category: "Báo cáo", author: "Lê Văn C", status: "DRAFT", views: 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Bộ lọc & Công cụ */}
      <Card className="p-4 bg-card border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center rounded-xl">
        <div className="flex flex-1 w-full flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tiêu đề bài viết..." 
              className="pl-9 h-10 bg-muted/20 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-background">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="ALL">
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-background">
              <SelectValue placeholder="Chuyên mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chuyên mục</SelectItem>
              <SelectItem value="1">Thông báo</SelectItem>
              <SelectItem value="2">Chuyển đổi số</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onNavigateToCreate} className="w-full sm:w-auto h-10 px-6 shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Viết bài mới
        </Button>
      </Card>

      {/* Bảng Dữ liệu */}
      <Card className="border shadow-sm rounded-xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
              <tr>
                <th className="px-5 py-4 font-semibold w-[40%]">Bài viết</th>
                <th className="px-5 py-4 font-semibold">Chuyên mục</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 font-semibold">Tác giả & Ngày đăng</th>
                <th className="px-5 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {mockPosts.map((post) => {
                const StatusIcon = STATUS_CONFIG[post.status].icon;
                return (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-16 bg-muted rounded border flex items-center justify-center shrink-0">
                          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-[14px] line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigateToEdit(post.id)}>
                            {post.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">Lượt xem: <strong className="font-medium">{post.views}</strong></p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="secondary" className="font-medium text-[11px] bg-muted/50">
                        {post.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={`font-medium text-[11px] flex w-fit items-center gap-1 ${STATUS_CONFIG[post.status].color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {STATUS_CONFIG[post.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground text-xs">{post.author}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{post.publishedAt || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onNavigateToEdit(post.id)} title="Sửa bài viết">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
