/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
// features/posts/components/BannerList.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit, Trash2,
  ExternalLink, Link as LinkIcon, Loader2,
  Calendar, MapPin, CheckCircle2, XCircle, Grid, Layers, PlayCircle, Sliders
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heading, Text } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { useSearchParams } from "next/navigation";

interface BannerListProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: string) => void;
}

export function BannerList({ onNavigateToCreate, onNavigateToEdit }: BannerListProps) {
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
  const pageSize = 12;

  // The import should be at the top, I will just add useEffect to the imports if missing, but it is missing, so I'll add React.useEffect
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners", page, searchTerm, activeTab],
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <Text as="span" className="ml-3 text-muted-foreground font-normal">Đang tải danh sách banner...</Text>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-background">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <Heading level="h2" className="font-bold tracking-tight">Quản lý Banner/Quảng cáo</Heading>
            <Text variant="small" className="text-muted-foreground mt-0.5 font-normal">Phân phối banner hình ảnh và thiết kế khẩu hiệu tuyên truyền đồng bộ</Text>
          </div>
          <Button onClick={onNavigateToCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-5 font-bold transition-all transform hover:scale-[1.02]">
            <Plus className="h-4 w-4 mr-2" /> Thêm banner mới
          </Button>
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
                        <Text as="span" className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${isSlideshow ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted" }`}>
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
          <Search placeholder="Tìm theo tên banner..." className="w-full lg:w-80 shrink-0" />
        </div>

        {/* Grid of Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 shadow-sm col-span-full">
              <Layers className="h-12 w-12 text-slate-200 mb-3" />
              <Text variant="small" className="font-bold text-foreground">Không tìm thấy banner nào</Text>
              <Text variant="small" className="text-muted-foreground mt-1 font-normal">Vui lòng thử đổi từ khóa tìm kiếm hoặc đổi danh mục phân loại</Text>
            </div>
          ) : (
            filteredBanners.map((banner: Banner) => {
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

              const posCat = categories.find((cat: any) => cat.group === "BANNER_POSITION" && cat.code?.toLowerCase() === banner.position?.toLowerCase());
              const isPositionSlideshow = posCat?.description === "slideshow";

              return (
                <Card key={banner.id} className="group overflow-hidden border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col bg-card rounded-2xl relative p-0">
                  {/* Visual Thumbnail */}
                  <div className="relative aspect-[21/9] overflow-hidden bg-muted/30 border-b border-border flex items-center justify-center w-full">
                    {isSlogan && sloganStyles ? (
                      <div
                        className="w-full h-full flex flex-col justify-center items-center p-3 text-center relative overflow-hidden"
                        style={{
                          background: sloganStyles.backgroundType === "pattern"
                            ? sloganStyles.gradientColorStart || "#cc0000"
                            : `linear-gradient(to right, ${sloganStyles.gradientColorStart || "#cc0000"}, ${sloganStyles.gradientColorMiddle || "#cc0000"}, ${sloganStyles.gradientColorEnd || "#990000"})`,
                        }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Text as="span" className="text-amber-300 select-none">★</Text>
                        </div>
                        <Text as="span"
                          style={{ color: sloganStyles.titleColor || "#fef08a" }}
                          className="text-[9px] font-black uppercase tracking-widest line-clamp-1 z-10 select-none opacity-90"
                        >
                          {banner.name}
                        </Text>
                        <Text
                          style={{ color: sloganStyles.textColor || "#ffffff" }}
                          className="text-[11px] font-serif font-black leading-snug line-clamp-2 mt-1 px-4 z-10"
                        >
                          {banner.description || "Khẩu hiệu cổ động"}
                        </Text>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.imageUrl?.startsWith('http') ? banner.imageUrl : `/api/v1/admin/media/download/${banner.imageUrl}`}
                        alt={banner.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('/api/v1/media/download/')) {
                            target.src = `/api/v1/media/download/${banner.imageUrl}`;
                          }
                        }}
                      />
                    )}

                    {/* Quick Delete button in top-right */}
                    <div className="absolute top-2 right-2 z-20">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-background/80 hover:bg-destructive/10 hover:text-destructive border border-border hover:scale-105 shadow-sm transition-all duration-200"
                        onClick={() => {
                          setDeletingBannerId(banner.id);
                        }}
                        title="Xóa banner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Overlay placement and status badges in bottom-left */}
                    <div className="absolute bottom-2 left-2 flex gap-1.5 z-10 select-none">
                      <Badge variant="secondary" className="bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm border-none shadow-sm px-2 py-0.5">
                        <MapPin className="h-2.5 w-2.5 mr-1 text-slate-300" /> {getFriendlyPositionName(banner.position)}
                      </Badge>
                      {banner.status ? (
                        <Badge variant="outline" className="bg-emerald-600/85 text-white text-[10px] font-bold backdrop-blur-sm border-none shadow-sm px-2 py-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1 text-emerald-200" /> HOẠT ĐỘNG
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-500/85 text-white text-[10px] font-bold backdrop-blur-sm border-none shadow-sm px-2 py-0.5">
                          <XCircle className="h-2.5 w-2.5 mr-1 text-slate-300" /> ĐANG TẮT
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content description area */}
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <Heading level="h3" className="font-bold text-[14px] text-foreground leading-snug line-clamp-1">{banner.name}</Heading>
                        <Badge variant="outline" className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/50 px-1.5 py-0 border-border">
                          Thứ tự: {banner.orderIndex}
                        </Badge>
                      </div>
                      {banner.description && (
                        <Text variant="small" className="text-muted-foreground line-clamp-1 font-normal">{banner.description}</Text>
                      )}
                    </div>

                    {/* Type Category and Slideshow features */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSlogan ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-extrabold px-2 py-0.5">
                          🏵️ Khẩu hiệu Tuyên truyền
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-extrabold px-2 py-0.5">
                          🖼️ Đồ họa Thiết kế
                        </Badge>
                      )}
                      {isPositionSlideshow ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-extrabold px-2.5 py-0.5 flex items-center gap-1">
                          <PlayCircle className="w-3 h-3 text-primary animate-spin" /> Trình chiếu Slideshow
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-extrabold px-2.5 py-0.5 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-muted-foreground" /> Chiến dịch
                        </Badge>
                      )}
                    </div>

                    {/* Date and link info row */}
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground flex-1 border-t border-border pt-3.5">
                      <div className="flex items-center gap-2">
                        {banner.linkType === "external" ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/70" /> : <LinkIcon className="h-3.5 w-3.5 text-muted-foreground/70" />}
                        <Text as="span" className="truncate text-[11px] font-mono text-muted-foreground/70 font-normal" title={banner.customUrl || "/" + banner.slug}>
                          {banner.customUrl || "/" + banner.slug}
                        </Text>
                      </div>
                      {(banner.startAt || banner.endAt) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <Text as="span" className="text-[11px] text-muted-foreground/70 font-normal">
                            {banner.startAt ? new Date(banner.startAt).toLocaleDateString("vi-VN") : "—"} → {banner.endAt ? new Date(banner.endAt).toLocaleDateString("vi-VN") : "—"}
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* Action button footer */}
                    <div className="pt-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs font-bold border-input bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 shadow-sm transition-all duration-200 py-4"
                        onClick={() => onNavigateToEdit(banner.id)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5 text-slate-500 group-hover:text-blue-600" /> Chỉnh sửa & Cấu hình
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="py-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
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
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
