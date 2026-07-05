// features/posts/components/BannerList.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit, Trash2,
  ExternalLink, Link as LinkIcon, Loader2,
  Calendar, MapPin, CheckCircle2, XCircle, Grid, Layers, PlayCircle, Sliders
} from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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

  const positionCategories = categories
    .filter((cat: any) => cat.group === "BANNER_POSITION" && cat.active !== 0)
    .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));

  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await postsApi.getBanners();
      return {
        items: res.data || [],
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
    onError: () => toast.error("Có lỗi xảy ra khi xóa banner."),
  });

  const filteredBanners = (banners?.items || []).filter((b: Banner) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    return b.position?.toLowerCase() === activeTab?.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải danh sách banner...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quản lý Banner/Quảng cáo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Phân phối banner hình ảnh và thiết kế khẩu hiệu tuyên truyền đồng bộ</p>
          </div>
          <Button onClick={onNavigateToCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-5 font-bold transition-all transform hover:scale-[1.02]">
            <Plus className="h-4 w-4 mr-2" /> Thêm banner mới
          </Button>
        </div>

        {/* Elegant Slideshow Configuration Panel */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
          <div
            onClick={() => setShowConfig(!showConfig)}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shadow-inner">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Cấu hình chế độ Trình chiếu (Slideshow) theo Vị trí</h3>
                <p className="text-xs text-muted-foreground/90 mt-0.5">
                  Bật để tự động xoay vòng (slideshow) các banner hoạt động tại vị trí, tắt để hiển thị cố định theo chiến dịch (banner ưu tiên cao nhất)
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs text-blue-600 hover:text-blue-700 bg-blue-50/20 hover:bg-blue-50/60 dark:bg-slate-900">
              {showConfig ? "Thu gọn" : "Thiết lập"}
            </Button>
          </div>

          {showConfig && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/40 dark:bg-slate-950/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
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
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{cat.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{cat.code}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${isSlideshow
                          ? "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/50"
                          : "text-slate-400 bg-slate-100 dark:text-slate-300 dark:bg-slate-800"
                          }`}>
                          {isSlideshow ? "Slideshow" : "Chiến dịch"}
                        </span>
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
            <TabsList className="bg-slate-100/75 p-1 rounded-xl flex flex-wrap gap-1">
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
            <div className="col-span-full py-16 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-100 p-3.5 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Layers className="h-5 w-5" />
              </div>
              <p className="font-bold text-slate-700">Không tìm thấy banner nào</p>
              <p className="text-xs text-slate-400 mt-1">Vui lòng thử đổi từ khóa tìm kiếm hoặc đổi danh mục phân loại</p>
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
                } catch (e) { }
              }

              const posCat = categories.find((cat: any) => cat.group === "BANNER_POSITION" && cat.code?.toLowerCase() === banner.position?.toLowerCase());
              const isPositionSlideshow = posCat?.description === "slideshow";

              return (
                <Card key={banner.id} className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col bg-card rounded-2xl relative">
                  {/* Visual Thumbnail */}
                  <div className="relative aspect-[21/9] overflow-hidden bg-slate-50 border-b border-slate-100/80 flex items-center justify-center">
                    {isSlogan && sloganStyles ? (
                      <div
                        className="w-full h-full flex flex-col justify-center items-center p-3 text-center relative overflow-hidden"
                        style={{
                          background: sloganStyles.backgroundType === "pattern"
                            ? sloganStyles.gradientColorStart || "#cc0000"
                            : `linear-gradient(to right, ${sloganStyles.gradientColorStart || "#cc0000"}, ${sloganStyles.gradientColorMiddle || "#cc0000"}, ${sloganStyles.gradientColorEnd || "#990000"})`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                          <span className="text-5xl text-amber-300 select-none">★</span>
                        </div>
                        <span
                          style={{ color: sloganStyles.titleColor || "#fef08a" }}
                          className="text-[9px] font-black uppercase tracking-widest line-clamp-1 z-10 select-none opacity-90"
                        >
                          {banner.name}
                        </span>
                        <p
                          style={{ color: sloganStyles.textColor || "#ffffff" }}
                          className="text-[11px] font-serif font-black leading-snug line-clamp-2 mt-1 px-4 z-10"
                        >
                          {banner.description || "Khẩu hiệu cổ động"}
                        </p>
                      </div>
                    ) : (
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
                        className="h-7 w-7 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 border border-slate-100 hover:scale-105 shadow-sm transition-all duration-200"
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
                        <h3 className="font-bold text-[14px] text-slate-800 dark:text-slate-200 leading-snug line-clamp-1">{banner.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50/50 px-1.5 py-0">
                          Thứ tự: {banner.orderIndex}
                        </Badge>
                      </div>
                      {banner.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{banner.description}</p>
                      )}
                    </div>

                    {/* Type Category and Slideshow features */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSlogan ? (
                        <Badge variant="outline" className="bg-red-50 text-[#cc0000] border-red-100 text-[10px] font-extrabold px-2 py-0.5">
                          🏵️ Khẩu hiệu Tuyên truyền
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-extrabold px-2 py-0.5">
                          🖼️ Đồ họa Thiết kế
                        </Badge>
                      )}
                      {isPositionSlideshow ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-extrabold px-2.5 py-0.5 flex items-center gap-1">
                          <PlayCircle className="w-3 h-3 text-blue-600 animate-spin" /> Trình chiếu Slideshow
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-extrabold px-2.5 py-0.5 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-500" /> Chiến dịch
                        </Badge>
                      )}
                    </div>

                    {/* Date and link info row */}
                    <div className="flex flex-col gap-1.5 text-xs text-slate-500 flex-1 border-t border-slate-50 pt-3.5">
                      <div className="flex items-center gap-2">
                        {banner.linkType === "external" ? <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> : <LinkIcon className="h-3.5 w-3.5 text-slate-400" />}
                        <span className="truncate text-[11px] font-mono text-slate-400" title={banner.customUrl || "/" + banner.slug}>
                          {banner.customUrl || "/" + banner.slug}
                        </span>
                      </div>
                      {(banner.startAt || banner.endAt) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-[11px] text-slate-400">
                            {banner.startAt ? new Date(banner.startAt).toLocaleDateString("vi-VN") : "—"} → {banner.endAt ? new Date(banner.endAt).toLocaleDateString("vi-VN") : "—"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action button footer */}
                    <div className="pt-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs font-bold border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm transition-all duration-200 py-4"
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
