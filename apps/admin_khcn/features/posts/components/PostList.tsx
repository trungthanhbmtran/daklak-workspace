"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Globe,
  X,
  Send,
  Star,
  Eye,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
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
import { toast } from "sonner";

const STATUS_CONFIG: Record<PostStatus, { label: string; bg: string; text: string; dot: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: {
    label: "Bản nháp",
    bg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
    icon: FileText
  },
  SUBMITTED: {
    label: "Chờ duyệt",
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: Clock
  },
  UNDER_REVIEW: {
    label: "Đang thẩm định",
    bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    icon: Search
  },
  APPROVED: {
    label: "Đã phê duyệt",
    bg: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-500",
    icon: CheckCircle2
  },
  REJECTED: {
    label: "Từ chối",
    bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-900/30",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    icon: X
  },
  PUBLISHED: {
    label: "Đã xuất bản",
    bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse",
    icon: CheckCircle2
  },
  UNPUBLISHED: {
    label: "Đã gỡ bài",
    bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-100/50 dark:border-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
    icon: EyeOff
  },
  ARCHIVED: {
    label: "Lưu trữ",
    bg: "bg-gray-50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
    icon: FileText
  },
};

export function PostList({ onNavigateToCreate, onNavigateToEdit }: { onNavigateToCreate: () => void, onNavigateToEdit: (id: string) => void }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tải danh sách danh mục dùng chung từ API (cho trạng thái bài viết)
  const { data: systemCategories } = useQuery({
    queryKey: ["system-categories"],
    queryFn: async () => {
      const res = await categoryApi.fetchAll();
      return res || [];
    }
  });

  // Tải danh sách chuyên mục bài viết (Post Categories)
  const { data: postCategories } = useQuery({
    queryKey: ["post-categories"],
    queryFn: async () => {
      const res = await postsApi.getCategories();
      return res?.data || [];
    }
  });

  const postStatusCategories = systemCategories?.filter((c: any) => c.group === "POST_STATUS" && c.active === 1) || [];

  const getStatusLabel = (status: PostStatus) => {
    const matched = systemCategories?.find((c: any) => c.group === "POST_STATUS" && c.code === status);
    return matched ? matched.name : (STATUS_CONFIG[status]?.label || status);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts", searchTerm, statusFilter, categoryFilter, sortBy, sortOrder, page, pageSize],
    queryFn: async () => {
      const params = {
        search: searchTerm || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        categoryId: categoryFilter === "ALL" ? undefined : categoryFilter,
        sortBy,
        sortOrder,
        page,
        limit: pageSize,
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
      toast.success("Đã xóa bài viết thành công!");
    },
    onError: (err: any) => {
      toast.error(`Xóa bài viết thất bại: ${err?.message || "Lỗi không xác định"}`);
    }
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
        default: throw new Error("Thao tác không hợp lệ");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      const actionLabels: Record<string, string> = {
        submit: "gửi duyệt",
        approve: "phê duyệt",
        reject: "từ chối duyệt",
        publish: "xuất bản",
        unpublish: "gỡ bài",
        review: "thẩm định"
      };
      toast.success(`Thực hiện thao tác ${actionLabels[variables.action] || variables.action} thành công!`);
    },
    onError: (err: any) => {
      toast.error(`Thao tác thất bại: ${err?.message || "Vui lòng thử lại sau"}`);
    }
  });

  const posts = (data?.items || []) as Post[];

  // Tải danh sách tất cả bài viết để hiển thị thống kê chính xác tổng thể hệ thống (không bị ảnh hưởng bởi bộ lọc/phân trang)
  const { data: statsData } = useQuery({
    queryKey: ["posts-all-stats"],
    queryFn: async () => {
      const res = await postsApi.getPosts({ limit: 1000 });
      return res.data || [];
    }
  });

  const statsPosts = (statsData || []) as Post[];
  const totalPostsCount = statsPosts.length;
  const publishedCount = statsPosts.filter((p: Post) => p.status === 'PUBLISHED').length;
  const totalViewsCount = statsPosts.reduce((sum: number, p: Post) => sum + (p.viewCount || 0), 0);
  const featuredCount = statsPosts.filter((p: Post) => p.isFeatured).length;
  const submittedCount = statsPosts.filter((p: Post) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length;
  const draftCount = statsPosts.filter((p: Post) => p.status === 'DRAFT').length;

  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const getPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* CMS Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-blue-500 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng bài viết</p>
              <p className="text-3xl font-black text-slate-850 dark:text-white tracking-tight">{totalPostsCount}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-100/30 dark:border-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 font-bold">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> Bản nháp: {draftCount}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Chờ duyệt: {submittedCount}</span>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-emerald-500 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Đã xuất bản</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{publishedCount}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>Tỷ lệ xuất bản: {totalPostsCount > 0 ? Math.round((publishedCount / totalPostsCount) * 100) : 0}%</span>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-indigo-500 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng lượt xem</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{totalViewsCount.toLocaleString('vi-VN')}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100/30 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span>Trung bình: {totalPostsCount > 0 ? Math.round(totalViewsCount / totalPostsCount).toLocaleString('vi-VN') : 0} lượt/bài</span>
          </div>
        </Card>

        {/* Card 4 */}
        <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between group border-l-4 border-l-amber-500 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bài viết nổi bật</p>
              <p className="text-3xl font-black text-amber-500 dark:text-amber-400 tracking-tight">{featuredCount}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-100/30 dark:border-amber-900/20 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 text-[10.5px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Được đánh dấu ưu tiên hiển thị</span>
          </div>
        </Card>
      </div>

      {/* Bộ lọc & Công cụ */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center rounded-2xl">
        <div className="flex flex-1 w-full flex-col sm:flex-row flex-wrap gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tiêu đề bài viết..."
              className="pl-9 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 focus-visible:ring-blue-500/20 rounded-xl text-xs font-semibold"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs font-semibold">Tất cả trạng thái</SelectItem>
              {postStatusCategories.length > 0 ? (
                postStatusCategories.map((cat: any) => (
                  <SelectItem key={cat.code} value={cat.code} className="text-xs font-semibold">
                    {cat.name}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="DRAFT" className="text-xs font-semibold">Bản nháp</SelectItem>
                  <SelectItem value="SUBMITTED" className="text-xs font-semibold">Chờ duyệt</SelectItem>
                  <SelectItem value="UNDER_REVIEW" className="text-xs font-semibold">Đang thẩm định</SelectItem>
                  <SelectItem value="APPROVED" className="text-xs font-semibold">Đã phê duyệt</SelectItem>
                  <SelectItem value="PUBLISHED" className="text-xs font-semibold">Đã xuất bản</SelectItem>
                  <SelectItem value="UNPUBLISHED" className="text-xs font-semibold">Đã gỡ bài</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold">
              <SelectValue placeholder="Chuyên mục" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs font-semibold">Tất cả chuyên mục</SelectItem>
              {postCategories?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs font-semibold">{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sắp xếp động */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(val) => {
            const [by, order] = val.split("-");
            setSortBy(by);
            setSortOrder(order);
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="createdAt-desc" className="text-xs font-semibold">Mới nhất trước</SelectItem>
              <SelectItem value="createdAt-asc" className="text-xs font-semibold">Cũ nhất trước</SelectItem>
              <SelectItem value="viewCount-desc" className="text-xs font-semibold">Lượt xem nhiều nhất</SelectItem>
              <SelectItem value="publishedAt-desc" className="text-xs font-semibold">Ngày xuất bản mới nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onNavigateToCreate}
          className="w-full lg:w-auto h-10 px-6 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold uppercase text-[11px] tracking-wide rounded-xl transition-all duration-300 hover:shadow-indigo-500/10 hover:shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2 stroke-[3px]" /> Viết bài mới
        </Button>
      </Card>

      {/* Bảng Dữ liệu */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th className="px-6 py-4 font-black w-[45%]">Bài viết</th>
                <th className="px-6 py-4 font-black">Chuyên mục</th>
                <th className="px-6 py-4 font-black">Trạng thái & Phiên bản</th>
                <th className="px-6 py-4 font-black">Tác giả & Ngày đăng</th>
                <th className="px-6 py-4 font-black text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                      <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Đang tải danh sách bài viết...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-rose-600 dark:text-rose-400">
                      <AlertCircle className="h-10 w-10" />
                      <p className="font-black uppercase tracking-wider text-sm">Không thể tải dữ liệu</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{(error as Error)?.message || "Vui lòng thử lại sau"}</p>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-slate-400 dark:text-slate-500 italic font-medium text-xs">
                    Không tìm thấy bài viết nào thỏa mãn bộ lọc.
                  </td>
                </tr>
              ) : (
                posts.map((post: Post) => {
                  const statusObj = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
                  const StatusIcon = statusObj.icon;

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors group">

                      {/* Cột 1: Thumbnail & Chi tiết bài viết */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="flex items-center gap-4.5">
                          {/* Thumbnail */}
                          <div className="h-14 w-20 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover:scale-[1.03] transition-transform duration-300">
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
                              <ImageIcon className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                            )}
                          </div>

                          {/* Chi tiết */}
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => onNavigateToEdit(post.id)}
                                className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              >
                                {post.title}
                              </span>
                              {post.isFeatured && (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 shrink-0 flex items-center gap-0.5">
                                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500 shrink-0" /> Nổi bật
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold flex-wrap">
                              <span className="font-mono bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                                ID: {post.id?.substring(0, 8)}
                              </span>

                              <span className="flex items-center gap-1 font-sans text-slate-500 bg-slate-100 dark:bg-slate-950 dark:border dark:border-slate-850 px-2 py-0.5 rounded-lg text-[9.5px]">
                                <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {post.viewCount || 0} lượt xem
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
                                  <span className="flex items-center gap-1 bg-blue-50/60 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-100/40 dark:border-blue-900/30 text-[9px] uppercase tracking-wide">
                                    <Globe className="h-3 w-3 shrink-0 text-blue-500" />
                                    {langKeys.join(", ")}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Chuyên mục */}
                      <td className="px-6 py-4.5 align-middle">
                        <Badge variant="secondary" className="font-bold text-[10px] bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-slate-600 dark:text-slate-400 py-1 px-2.5 rounded-lg">
                          {post.category?.name || 'Chưa phân loại'}
                        </Badge>
                      </td>

                      {/* Cột 3: Trạng thái & Phiên bản */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="flex flex-col gap-1.5 w-fit">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10.5px] font-bold ${statusObj.bg} ${statusObj.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot} shrink-0`} />
                            <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                            {getStatusLabel(post.status)}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-400 dark:text-slate-500 font-extrabold uppercase px-2">
                            Phiên bản v{post.currentVersion || 1}
                          </span>

                          {/* Automated Moderation Badge */}
                          {post.autoModerationStatus && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9.5px] font-bold ${post.autoModerationStatus === 'SAFE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10'
                              }`}>
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              {post.autoModerationStatus === 'SAFE' ? 'AI An toàn' : 'AI Nghi ngờ'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 4: Tác giả & Ngày đăng */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {post.authorId?.substring(0, 8) || 'Ẩn danh'}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
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
                        </div>
                      </td>

                      {/* Cột 5: Thao tác */}
                      <td className="px-6 py-4.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Workflow Actions */}
                          {post.status === 'DRAFT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] px-2.5 font-bold rounded-lg text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                              onClick={() => workflowMutation.mutate({ id: post.id, action: 'submit' })}
                            >
                              <Send className="h-3 w-3 mr-1 shrink-0" /> Gửi duyệt
                            </Button>
                          )}

                          {(post.status === 'SUBMITTED' || post.status === 'UNDER_REVIEW') && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] px-2.5 font-bold rounded-lg text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => workflowMutation.mutate({ id: post.id, action: 'approve' })}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" /> Duyệt
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] px-2.5 font-bold rounded-lg text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                onClick={() => {
                                  const note = prompt("Nhập lý do từ chối:");
                                  if (note) workflowMutation.mutate({ id: post.id, action: 'reject', note });
                                }}
                              >
                                <X className="h-3 w-3 mr-1 shrink-0" /> Từ chối
                              </Button>
                            </div>
                          )}

                          {post.status === 'APPROVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] px-2.5 font-bold rounded-lg text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                              onClick={() => workflowMutation.mutate({ id: post.id, action: 'publish' })}
                            >
                              <Globe className="h-3 w-3 mr-1 shrink-0" /> Xuất bản
                            </Button>
                          )}

                          {post.status === 'PUBLISHED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] px-2.5 font-bold rounded-lg text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                              onClick={() => workflowMutation.mutate({ id: post.id, action: 'unpublish' })}
                            >
                              <EyeOff className="h-3 w-3 mr-1 shrink-0" /> Gỡ bài
                            </Button>
                          )}

                          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1.5" />

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8.5 w-8.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                            onClick={() => onNavigateToEdit(post.id)}
                            title="Sửa bài viết"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8.5 w-8.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
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

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-950/20">
          {/* Info */}
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Hiển thị từ{" "}
            <span className="text-slate-700 dark:text-slate-300">
              {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            đến{" "}
            <span className="text-slate-700 dark:text-slate-300">
              {Math.min(page * pageSize, totalItems)}
            </span>{" "}
            trong tổng số{" "}
            <span className="text-slate-700 dark:text-slate-300">{totalItems}</span>{" "}
            bài viết
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4.5">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Số hàng:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1); // Reset to first page
                }}
              >
                <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs font-extrabold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl min-w-[70px]">
                  <SelectItem value="5" className="text-xs font-bold">5</SelectItem>
                  <SelectItem value="10" className="text-xs font-bold">10</SelectItem>
                  <SelectItem value="20" className="text-xs font-bold">20</SelectItem>
                  <SelectItem value="50" className="text-xs font-bold">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/20">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-500"
                disabled={page === 1}
                onClick={() => setPage(1)}
                title="Trang đầu"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-500"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                title="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((pNum) => (
                <Button
                  key={pNum}
                  variant={page === pNum ? "default" : "ghost"}
                  className={`h-7 px-3 text-xs font-extrabold rounded-lg ${page === pNum
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                    : "text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                    }`}
                  onClick={() => setPage(pNum)}
                >
                  {pNum}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-500"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                title="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-500"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(totalPages)}
                title="Trang cuối"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
