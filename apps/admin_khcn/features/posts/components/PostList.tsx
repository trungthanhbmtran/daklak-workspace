"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, FileText, CheckCircle2, Clock, EyeOff, Image as ImageIcon, Loader2, AlertCircle, Globe, X, Send, Star, Eye, TrendingUp, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postsApi } from "../api";
import { categoryApi } from "@/features/system-admin/categories/api";
import { Post, PostStatus } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// types are imported from ../types

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
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
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Tải danh sách chuyên mục động từ API
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.fetchAll();
      return res || [];
    }
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts", searchTerm, statusFilter, categoryFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = {
        search: searchTerm || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        categoryId: categoryFilter === "ALL" ? undefined : categoryFilter,
        sortBy,
        sortOrder,
      };
      const res = await postsApi.getPosts(params);
      return {
        items: res.data || [],
        meta: res.meta || {}
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


  const posts = (data?.items || []) as Post[];
  const totalPostsCount = posts.length;
  const publishedCount = posts.filter((p: Post) => p.status === 'PUBLISHED').length;
  const totalViewsCount = posts.reduce((sum: number, p: Post) => sum + (p.viewCount || 0), 0);
  const featuredCount = posts.filter((p: Post) => p.isFeatured).length;

  return (
    <div className="flex flex-col gap-6">
      {/* CMS Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng bài viết</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalPostsCount}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 border bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã xuất bản</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 border bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng lượt xem</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{totalViewsCount.toLocaleString('vi-VN')}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-600">
            <BarChart3 className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 border bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nổi bật (Featured)</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">{featuredCount}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-500">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
        </Card>
      </div>

      {/* Bộ lọc & Công cụ */}
      <Card className="p-4 bg-card border shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center rounded-xl">
        <div className="flex flex-1 w-full flex-col sm:flex-row flex-wrap gap-3">
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
              {categories?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sắp xếp động */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(val) => {
            const [by, order] = val.split("-");
            setSortBy(by);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Mới nhất trước</SelectItem>
              <SelectItem value="createdAt-asc">Cũ nhất trước</SelectItem>
              <SelectItem value="viewCount-desc">Lượt xem nhiều nhất</SelectItem>
              <SelectItem value="publishedAt-desc">Ngày xuất bản mới nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onNavigateToCreate} className="w-full lg:w-auto h-10 px-6 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold">
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
                      <p className="text-xs">{(error as Error)?.message || "Vui lòng thử lại sau"}</p>
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
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground text-[14px] line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={() => onNavigateToEdit(post.id)}>
                                {post.title}
                              </p>
                              {post.isFeatured && (
                                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 shrink-0" title="Bài viết nổi bật">
                                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Nổi bật
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1.5 font-mono flex items-center gap-3">
                              <span className="flex items-center gap-1">ID: {post.id?.substring(0, 8)}...</span>
                              <span className="flex items-center gap-1 font-sans text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                <Eye className="h-3.5 w-3.5 text-slate-500" /> {post.viewCount || 0} lượt xem
                              </span>
                              {(() => {
                                let translationsObj = {};
                                try {
                                  translationsObj = typeof post.translations === 'string'
                                    ? JSON.parse(post.translations)
                                    : (post.translations || {});
                                } catch (e) {
                                  translationsObj = {};
                                }
                                const langKeys = Object.keys(translationsObj);
                                if (langKeys.length === 0) return null;
                                return (
                                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-sans font-bold uppercase text-[9px]">
                                    <Globe className="h-2.5 w-2.5" />
                                    {langKeys.join(", ")}
                                  </span>
                                );
                              })()}
                            </p>
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
                        <p className="font-medium text-foreground text-xs">{post.authorId?.substring(0, 8) || 'Unknown'}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {(() => {
                            try {
                              const dateStr = post.publishedAt || post.createdAt;
                              if (!dateStr) return "—";
                              return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
                            } catch (e) {
                              return "—";
                            }
                          })()}
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
