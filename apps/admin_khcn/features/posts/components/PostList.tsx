"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, FileText, CheckCircle2, Clock, EyeOff, Image as ImageIcon, Loader2, AlertCircle, Globe, X, Send } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postsApi } from "../api";
import { Post, PostStatus } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// types are imported from ../types

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Bản nháp", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
  SUBMITTED: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  UNDER_REVIEW: { label: "Đang thẩm định", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Search },
  APPROVED: { label: "Đã phê duyệt", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: CheckCircle2 },
  REJECTED: { label: "Từ chối", color: "bg-rose-100 text-rose-700 border-rose-200", icon: X },
  PUBLISHED: { label: "Đã xuất bản", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  UNPUBLISHED: { label: "Đã gỡ bài", color: "bg-orange-100 text-orange-700 border-orange-200", icon: EyeOff },
  ARCHIVED: { label: "Lưu trữ", color: "bg-gray-100 text-gray-700 border-gray-200", icon: FileText },
};


export function PostList({ onNavigateToCreate, onNavigateToEdit }: { onNavigateToCreate: () => void, onNavigateToEdit: (id: string) => void }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts", searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = {
        search: searchTerm || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        categoryId: categoryFilter === "ALL" ? undefined : categoryFilter,
      };
      const res = await postsApi.getPosts(params);
      // Bóc tách data từ Gateway Transformer
      const payload = res?.data;
      if (!payload) return { items: [], meta: {} };

      return {
        items: payload.items || payload.data || (Array.isArray(payload) ? payload : []),
        meta: payload.meta || {}
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert("Xóa bài viết thành công!");
    },
  });

  const workflowMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: string, action: string, note?: string }) => {
      switch (action) {
        case 'submit': return postsApi.submitPost(id, { note });
        case 'approve': return postsApi.approvePost(id, { note });
        case 'reject': return postsApi.rejectPost(id, { note });
        case 'publish': return postsApi.publishPost(id, { note });
        case 'unpublish': return postsApi.unpublishPost(id, { note });
        case 'review': return postsApi.reviewPost(id, { note });
        default: throw new Error("Invalid action");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      alert(`Thực hiện thao tác ${variables.action} thành công!`);
    },
  });


  const posts = data?.items || [];

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
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="SUBMITTED">Chờ duyệt</SelectItem>
              <SelectItem value="UNDER_REVIEW">Đang thẩm định</SelectItem>
              <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
              <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
              <SelectItem value="UNPUBLISHED">Đã gỡ bài</SelectItem>
            </SelectContent>

          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-background">
              <SelectValue placeholder="Chuyên mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chuyên mục</SelectItem>
              {/* Thêm API fetch categories nếu cần list động */}
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
                <th className="px-5 py-4 font-semibold">Trạng thái & Phiên bản</th>
                <th className="px-5 py-4 font-semibold">Tác giả & Ngày đăng</th>
                <th className="px-5 py-4 font-semibold text-right">Thao tác</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-xs">Đang tải danh sách bài viết...</p>
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
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center text-muted-foreground italic">
                    Không tìm thấy bài viết nào.
                  </td>
                </tr>
              ) : (
                posts.map((post: Post) => {
                  const StatusIcon = STATUS_CONFIG[post.status]?.icon || FileText;
                  const statusLabel = STATUS_CONFIG[post.status]?.label || post.status;
                  const statusColor = STATUS_CONFIG[post.status]?.color || "bg-slate-100 text-slate-700";

                  return (
                    <tr key={post.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-16 bg-muted rounded border overflow-hidden flex items-center justify-center shrink-0">
                            {post.thumbnail ? (
                              <img
                                src={`/api/v1/admin/media/download/${post.thumbnail}`}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.src.includes('/api/v1/media/download/')) {
                                    target.src = `/api/v1/media/download/${post.thumbnail}`;
                                  }
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-[14px] line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigateToEdit(post.id)}>
                              {post.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 font-mono">ID: {post.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="secondary" className="font-medium text-[11px] bg-muted/50">
                          {post.category?.name || '—'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5 w-fit">
                          <Badge variant="outline" className={`font-medium text-[10px] flex items-center gap-1 ${statusColor}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusLabel}
                          </Badge>

                          <Badge variant="outline" className="text-[9px] font-mono border-slate-200 text-slate-500">
                            v{post.currentVersion || 1}
                          </Badge>

                          {/* Automated Moderation Badge */}
                          {post.autoModerationStatus && (
                            <Badge variant="outline" className={`font-medium text-[10px] flex items-center gap-1 ${post.autoModerationStatus === 'SAFE'
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                              }`}>
                              <AlertCircle className="h-2.5 w-2.5" />
                              {post.autoModerationStatus === 'SAFE' ? 'An toàn' : 'Bị nghi ngờ'}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground text-xs">{post.authorId.substring(0, 8)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {post.publishedAt ? format(new Date(post.publishedAt), 'dd/MM/yyyy', { locale: vi }) : (post.createdAt ? format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: vi }) : '—')}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Workflow Actions */}
                          {post.status === 'DRAFT' && (
                            <Button variant="outline" size="sm" className="h-8 text-[10px] px-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => workflowMutation.mutate({ id: post.id, action: 'submit' })}>
                              <Send className="h-3 w-3 mr-1" /> Gửi duyệt
                            </Button>
                          )}
                          
                          {(post.status === 'SUBMITTED' || post.status === 'UNDER_REVIEW') && (
                            <>
                              <Button variant="outline" size="sm" className="h-8 text-[10px] px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => workflowMutation.mutate({ id: post.id, action: 'approve' })}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Duyệt
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 text-[10px] px-2 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => {
                                const note = prompt("Nhập lý do từ chối:");
                                if (note) workflowMutation.mutate({ id: post.id, action: 'reject', note });
                              }}>
                                <X className="h-3 w-3 mr-1" /> Từ chối
                              </Button>
                            </>
                          )}

                          {post.status === 'APPROVED' && (
                            <Button variant="outline" size="sm" className="h-8 text-[10px] px-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => workflowMutation.mutate({ id: post.id, action: 'publish' })}>
                              <Globe className="h-3 w-3 mr-1" /> Xuất bản
                            </Button>
                          )}

                          {post.status === 'PUBLISHED' && (
                            <Button variant="outline" size="sm" className="h-8 text-[10px] px-2 text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => workflowMutation.mutate({ id: post.id, action: 'unpublish' })}>
                              <EyeOff className="h-3 w-3 mr-1" /> Gỡ bài
                            </Button>
                          )}

                          <div className="w-px h-4 bg-border mx-1" />

                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onNavigateToEdit(post.id)} title="Sửa bài viết">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Xóa"
                            onClick={() => {
                              if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
                                deleteMutation.mutate(post.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
