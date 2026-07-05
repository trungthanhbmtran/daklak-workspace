"use client";
import { useState, useMemo, useCallback } from "react";
import {
  Edit,
  Trash2,
  Globe,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Star,
  Send,
  CheckCircle2,
  X,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal
} from "lucide-react";
import { safeParseJSON, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Post } from "../../types";
import { getStatusStyle } from "./PostListStyles";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { postsApi } from "../../api";
import { categoryApi } from "@/features/system-admin/categories/api";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PostListTableProps {
  onNavigateToEdit: (id: string) => void;
}

export function PostListTable({ onNavigateToEdit }: PostListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const searchTerm = searchParams.get('search') || "";
  const statusFilter = searchParams.get('status') || "ALL";
  const categoryFilter = searchParams.get('categoryId') || "ALL";
  const sortBy = searchParams.get('sortBy') || "createdAt";
  const sortOrder = searchParams.get('sortOrder') || "desc";
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('limit')) || 10;

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const setPage = useCallback((newPage: number) => {
    updateParams({ page: String(newPage) });
  }, [updateParams]);

  const setPageSize = useCallback((newSize: number) => {
    updateParams({ limit: String(newSize), page: '1' });
  }, [updateParams]);

  const { data: systemCategories = [] } = useQuery({
    queryKey: ["system-categories"],
    queryFn: async () => {
      const res = await categoryApi.fetchByGroup('POST_STATUS');
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const statusMap = useMemo(() => {
    const map: Record<string, string> = {};
    systemCategories.forEach((c: any) => {
      map[c.code] = c.name;
    });
    return map;
  }, [systemCategories]);

  const getStatusLabel = useCallback((status: string) => {
    return statusMap[status] || status;
  }, [statusMap]);

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
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const posts = (data?.items || []) as Post[];
  const totalItems = Number((data?.meta as any)?.total || 0);
  const totalPages = Number((data?.meta as any)?.totalPages || 1);

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

  const getPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-950/40">
            <TableRow className="border-b border-slate-100 dark:border-slate-850">
              <TableHead className="px-6 py-4 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest w-[45%]">Bài viết</TableHead>
              <TableHead className="px-6 py-4 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chuyên mục</TableHead>
              <TableHead className="px-6 py-4 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái & Phiên bản</TableHead>
              <TableHead className="px-6 py-4 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tác giả & Ngày đăng</TableHead>
              <TableHead className="px-6 py-4 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-slate-850">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Đang tải danh sách bài viết...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-10 w-10" />
                    <p className="font-black uppercase tracking-wider text-sm">Không thể tải dữ liệu</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{(error as Error)?.message || "Vui lòng thử lại sau"}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-24 text-center text-slate-400 dark:text-slate-500 italic font-medium text-xs">
                  Không tìm thấy bài viết nào thỏa mãn bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post: Post) => {
                const statusObj = getStatusStyle(post.status);
                const StatusIcon = statusObj.icon;

                return (
                  <TableRow key={post.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors group">
                    <TableCell className="px-6 py-4.5 align-middle">
                      <div className="flex items-center gap-4.5">
                        <div className="h-14 w-20 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover:scale-[1.03] transition-transform duration-300">
                          {post.thumbnail ? (
                            <img
                              src={`/api/v1/admin/media/download/${post.thumbnail}`}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
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
                              const translationsObj = safeParseJSON(post.translations);
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
                    </TableCell>

                    <TableCell className="px-6 py-4.5 align-middle">
                      <Badge variant="secondary" className="font-bold text-[10px] bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-slate-600 dark:text-slate-400 py-1 px-2.5 rounded-lg">
                        {post.category?.name || 'Chưa phân loại'}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-4.5 align-middle">
                      <div className="flex flex-col gap-1.5 w-fit">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10.5px] font-bold ${statusObj.bg} ${statusObj.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot} shrink-0`} />
                          <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                          {getStatusLabel(post.status)}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-400 dark:text-slate-500 font-extrabold uppercase px-2">
                          Phiên bản v{post.currentVersion || 1}
                        </span>

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
                    </TableCell>

                    <TableCell className="px-6 py-4.5 align-middle">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {post.authorId?.substring(0, 8) || 'Ẩn danh'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                          {formatDate(post.publishedAt || post.createdAt)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4.5 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                                setRejectingPostId(post.id);
                                setRejectionNote("");
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
                            setDeletingPostId(post.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-950/20">
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

          <div className="flex flex-wrap items-center gap-4.5">
            <PageSizeSelector value={pageSize} onValueChange={setPageSize} />

            <Pagination className="w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={`cursor-pointer ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() => setPage(Math.max(1, page - 1))}
                  />
                </PaginationItem>

                {getPageNumbers().map((pNum) => (
                  <PaginationItem key={pNum}>
                    <PaginationLink
                      isActive={page === pNum}
                      onClick={() => setPage(pNum)}
                      className="cursor-pointer"
                    >
                      {pNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {totalPages > 5 && page < totalPages - 2 && (
                  <PaginationItem>
                    <div className="flex h-9 w-9 items-center justify-center">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    className={`cursor-pointer ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài viết này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deletingPostId) {
                  deleteMutation.mutate(deletingPostId);
                  setDeletingPostId(null);
                }
              }}
            >
              Xóa bài viết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!rejectingPostId} onOpenChange={(open) => !open && setRejectingPostId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white">Từ chối bài viết</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Vui lòng nhập lý do từ chối phê duyệt bài viết này. Thông tin này sẽ được lưu lại trong lịch sử duyệt bài.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                id="rejectionNote"
                placeholder="Nhập lý do từ chối..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 focus:bg-white text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-xs rounded-xl font-bold h-9"
              onClick={() => setRejectingPostId(null)}
            >
              Hủy
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-bold h-9"
              disabled={!rejectionNote.trim()}
              onClick={() => {
                if (rejectingPostId && rejectionNote.trim()) {
                  workflowMutation.mutate({ id: rejectingPostId, action: 'reject', note: rejectionNote });
                  setRejectingPostId(null);
                }
              }}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
