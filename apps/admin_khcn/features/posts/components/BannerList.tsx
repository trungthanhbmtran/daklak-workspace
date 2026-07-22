/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
// features/posts/components/BannerList.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit, Trash2,
  ExternalLink, Link as LinkIcon,
  Calendar, MapPin, CheckCircle2, XCircle, Grid, Layers, PlayCircle, Sliders,
  MoreHorizontal
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heading, Text } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { ColumnDef } from "@/components/shared/responsive-table/types";

import { postsApi } from "../api";
import { Banner } from "../types";
import { useGetCategoryByGroup, useUpdateCategory } from "@/features/system-admin/categories/hooks/useCategoryApi";
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
import { useSearchParams, useRouter } from "next/navigation";

interface BannerListProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: string) => void;
}

export function BannerList({ onNavigateToCreate, onNavigateToEdit }: BannerListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useGetCategoryByGroup("BANNER_POSITION");
  const updateCategoryMutation = useUpdateCategory();

  const [showConfig, setShowConfig] = useState(false);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [activeTab, setActiveTab] = useState<string>("all");
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);

  const getFriendlyPositionName = (pos: string) => {
    const found = categories.find((cat: any) => cat.group === "BANNER_POSITION" && cat.code?.toLowerCase() === pos?.toLowerCase());
    return found ? found.name : (pos || "Chưa phân loại");
  };

  const positionCategories = categories;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab, pageSize]);

  const { data: banners, isLoading, isError, error } = useQuery({
    queryKey: ["banners", page, pageSize, searchTerm, activeTab],
    queryFn: async () => {
      const res = await postsApi.getBanners({
        page,
        limit: pageSize,
        search: searchTerm || undefined,
        position: activeTab === "all" ? undefined : activeTab,
      });
      return {
        items: res.data,
        meta: res.meta || {}
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Xóa banner thành công!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Có lỗi xảy ra khi xóa banner.";
      toast.error(message);
    },
  });

  const filteredBanners = banners?.items || [];
  const totalItems = Number(banners?.meta?.total) || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const columns: ColumnDef<Banner>[] = [
    {
      header: "Hình ảnh/Khẩu hiệu",
      cell: (banner) => {
        let isSlogan = false;
        let sloganStyles: any = null;
        if (banner.metaDescription) {
          try {
            const parsed = JSON.parse(banner.metaDescription);
            if (parsed && typeof parsed === "object") {
              isSlogan = true;
              sloganStyles = parsed;
            }
            // eslint-disable-next-line unused-imports/no-unused-vars
          } catch (e) { }
        }

        return (
          <div className="w-32 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 shadow-inner border border-border">
            {isSlogan && sloganStyles ? (
              <div
                className="w-full h-full flex flex-col justify-center items-center p-1 text-center relative"
                style={{
                  background: sloganStyles.backgroundType === "pattern"
                    ? sloganStyles.gradientColorStart || "#cc0000"
                    : `linear-gradient(to right, ${sloganStyles.gradientColorStart || "#cc0000"}, ${sloganStyles.gradientColorMiddle || "#cc0000"}, ${sloganStyles.gradientColorEnd || "#990000"})`,
                }}
              >
                <Text as="span"
                  style={{ color: sloganStyles.titleColor || "#fef08a" }}
                  className="text-[7px] font-black uppercase tracking-widest line-clamp-1 select-none"
                >
                  {banner.name}
                </Text>
                <Text
                  style={{ color: sloganStyles.textColor || "#ffffff" }}
                  className="text-[8px] font-serif font-black leading-snug line-clamp-2 mt-0.5"
                >
                  {banner.description || "Khẩu hiệu"}
                </Text>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.imageUrl?.startsWith('http') ? banner.imageUrl : `/api/v1/admin/media/download/${banner.imageUrl}`}
                alt={banner.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('/api/v1/media/download/')) {
                    target.src = `/api/v1/media/download/${banner.imageUrl}`;
                  }
                }}
              />
            )}
          </div>
        );
      }
    },
    {
      header: "Thông tin Banner",
      cell: (banner) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Text className="font-bold text-foreground line-clamp-1">{banner.name}</Text>
            <Badge variant="outline" className="text-[9px] font-mono font-bold text-muted-foreground bg-muted/50 px-1.5 py-0">
              Thứ tự: {banner.orderIndex}
            </Badge>
          </div>
          {banner.description && (
            <Text variant="small" className="text-muted-foreground line-clamp-1 font-normal text-[11px]">{banner.description}</Text>
          )}
        </div>
      )
    },
    {
      header: "Phân loại",
      cell: (banner) => {
        let isSlogan = false;
        if (banner.metaDescription) {
          try {
            const parsed = JSON.parse(banner.metaDescription);
            if (parsed && typeof parsed === "object") isSlogan = true;
            // eslint-disable-next-line unused-imports/no-unused-vars
          } catch (e) { }
        }
        const posCat = categories.find((cat: any) => cat.group === "BANNER_POSITION" && cat.code?.toLowerCase() === banner.position?.toLowerCase());
        const isPositionSlideshow = posCat?.description === "slideshow";

        return (
          <div className="flex flex-col gap-1.5 w-fit">
            <Badge variant="secondary" className="bg-muted text-foreground text-[10px] font-bold border-none px-2 py-0.5 w-fit">
              <MapPin className="h-2.5 w-2.5 mr-1 text-muted-foreground" /> {getFriendlyPositionName(banner.position)}
            </Badge>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isSlogan ? (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-extrabold px-1.5 py-0">Khẩu hiệu</Badge>
              ) : (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-extrabold px-1.5 py-0">Đồ họa</Badge>
              )}
              {isPositionSlideshow ? (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-extrabold px-1.5 py-0 flex items-center gap-0.5">
                  <PlayCircle className="w-2.5 h-2.5 animate-spin" /> Slideshow
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[9px] font-extrabold px-1.5 py-0 flex items-center gap-0.5">
                  <Layers className="w-2.5 h-2.5" /> Chiến dịch
                </Badge>
              )}
            </div>
          </div>
        )
      }
    },
    {
      header: "Liên kết & Thời gian",
      cell: (banner) => (
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {banner.linkType === "external" ? <ExternalLink className="h-3 w-3 shrink-0" /> : <LinkIcon className="h-3 w-3 shrink-0" />}
            <Text as="span" className="truncate text-[10px] font-mono font-normal max-w-[150px]" title={banner.customUrl || "/" + banner.slug}>
              {banner.customUrl || "/" + banner.slug}
            </Text>
          </div>
          {(banner.startAt || banner.endAt) && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 shrink-0" />
              <Text as="span" className="text-[10px] font-normal">
                {banner.startAt ? new Date(banner.startAt).toLocaleDateString("vi-VN") : "—"} → {banner.endAt ? new Date(banner.endAt).toLocaleDateString("vi-VN") : "—"}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      header: "Trạng thái",
      cell: (banner) => (
        banner.status ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-bold px-2 py-0.5">
            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> HOẠT ĐỘNG
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] font-bold px-2 py-0.5">
            <XCircle className="h-2.5 w-2.5 mr-1" /> ĐANG TẮT
          </Badge>
        )
      )
    },
    {
      header: "",
      className: "text-right pr-6",
      cell: (banner) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="group-hover:bg-background border-transparent transition-colors" iconStart={<MoreHorizontal className="h-4 w-4" />}></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onNavigateToEdit(banner.id)}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeletingBannerId(banner.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <>
      <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-6 bg-background">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <Heading level="h2" className="font-bold tracking-tight">Quản lý Banner/Quảng cáo</Heading>
            <Text variant="small" className="text-muted-foreground mt-0.5 font-normal">Phân phối banner hình ảnh và thiết kế khẩu hiệu tuyên truyền đồng bộ</Text>
          </div>
          <Button onClick={onNavigateToCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl px-5 font-bold transition-all" iconStart={<Plus className="h-4 w-4" />}>Thêm banner mới</Button>
        </div>

        {/* Elegant Slideshow Configuration Panel */}
        <Card className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
          <div
            onClick={() => setShowConfig(!showConfig)}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-inner">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <Heading level="h3" className="font-bold text-foreground">Cấu hình chế độ Trình chiếu (Slideshow) theo Vị trí</Heading>
                <Text variant="small" className="text-muted-foreground/90 mt-0.5 font-normal">
                  Chỉ các Banner (có trạng thái Hiển thị) thuộc cùng 1 Danh mục phân loại mới được gộp vào cùng Slide.
                </Text>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs text-primary hover:text-primary bg-primary/10 hover:bg-primary/20">
              {showConfig ? "Thu gọn" : "Thiết lập"}
            </Button>
          </div>

          {showConfig && (
            <div className="border-t border-border p-6 bg-muted/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {positionCategories.length === 0 ? (
                <div className="col-span-full text-center py-4 text-xs text-muted-foreground">
                  Đang tải danh sách vị trí hiển thị từ hệ thống...
                </div>
              ) : (
                positionCategories.map((cat: any) => {
                  const isSlideshow = cat.description === "slideshow";
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow transition-shadow"
                    >
                      <div>
                        <Text variant="small" className="font-bold text-foreground">{cat.name}</Text>
                        <Text variant="small" className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{cat.code}</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <Text as="span" className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${isSlideshow ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted"}`}>
                          {isSlideshow ? "Slideshow" : "Chiến dịch"}
                        </Text>
                        <Switch
                          checked={isSlideshow}
                          onCheckedChange={(checked) => {
                            updateCategoryMutation.mutate({
                              id: cat.id,
                              payload: {
                                ...cat,
                                description: checked ? "slideshow" : "campaign"
                              }
                            });
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </Card>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Modern Tabs Category Selector */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
            <TabsList className="bg-muted p-1 rounded-xl flex flex-wrap gap-1">
              <TabsTrigger value="all" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg">
                <Grid className="h-3.5 w-3.5" /> Tất cả
              </TabsTrigger>
              {positionCategories.map((cat: any) => (
                <TabsTrigger key={cat.code} value={cat.code?.toLowerCase()} className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg">
                  <Layers className="h-3.5 w-3.5" /> {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Search Input bar */}
          <Search
            placeholder="Tìm theo tên banner..."
            className="w-full lg:w-80 shrink-0"
          />
        </div>

        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
          <ResponsiveTable
            loading={isLoading}
            data={filteredBanners}
            columns={columns}
            keyExtractor={(banner) => banner.id}
            emptyMessage={isError ? ((error as Error)?.message || "Không thể tải dữ liệu") : "Không tìm thấy banner nào thỏa mãn bộ lọc."}
            footer={
              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                <div className="text-xs font-bold text-muted-foreground">
                  Hiển thị từ{" "}
                  <Text as="span" className="text-foreground font-normal">
                    {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
                  </Text>{" "}
                  đến{" "}
                  <Text as="span" className="text-foreground font-normal">
                    {Math.min(page * pageSize, totalItems)}
                  </Text>{" "}
                  trong tổng số{" "}
                  <Text as="span" className="text-foreground font-normal">{totalItems}</Text>{" "}
                  banner
                </div>

                <div className="flex flex-wrap items-center gap-4.5">
                  <PageSizeSelector value={pageSize} onValueChange={setPageSize} options={[5, 10, 15, 20, 50]} />

                  <Pagination className="w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages || 1) }).map((_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && page > 3) {
                          pageNum = page - 2 + i;
                          if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={page === pageNum}
                              onClick={() => setPage(pageNum)}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                          className={page >= totalPages || totalPages === 0 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            }
          />
        </Card>
      </div>

      <AlertDialog open={!!deletingBannerId} onOpenChange={(open) => !open && setDeletingBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Banner này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deletingBannerId) {
                  deleteMutation.mutate(deletingBannerId);
                  setDeletingBannerId(null);
                }
              }}
            >
              Xóa banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
