// features/posts/components/BannerList.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Edit, Trash2, Image as ImageIcon,
  ExternalLink, Link as LinkIcon, Loader2, MoreVertical,
  Calendar, MapPin, CheckCircle2, XCircle, Grid, Layers, Type, PlayCircle, Eye
} from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { postsApi } from "../api";
import { Banner } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useGetCategories } from "@/features/system-admin/categories/hooks/useCategoryApi";

interface BannerListProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: string) => void;
}

export function BannerList({ onNavigateToCreate, onNavigateToEdit }: BannerListProps) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useGetCategories();

  const getFriendlyPositionName = (pos: string) => {
    const found = categories.find((cat: any) => cat.group === "BANNER_POSITION" && cat.code === pos);
    if (found) return found.name;

    const p = pos?.toLowerCase();
    if (p === "top") return "Đầu trang (Header)";
    if (p === "middle_1") return "Giữa trang - Vị trí 1";
    if (p === "middle_2") return "Giữa trang - Vị trí 2";
    if (p === "middle_3") return "Giữa trang - Vị trí 3";
    if (p === "middle") return "Thân trang (Sidebar)";
    if (p === "bottom") return "Cuối trang (Footer)";
    if (p === "custom") return "Khẩu hiệu chính";
    return pos || "Chưa phân loại";
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

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
      alert("Xóa banner thành công!");
    },
    onError: () => alert("Có lỗi xảy ra khi xóa banner."),
  });

  const filteredBanners = (banners?.items || []).filter((b: Banner) => {
    // 1. Search term match
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Position tab filtering
    if (activeTab === "all") return true;
    if (activeTab === "top") return b.position === "top";
    if (activeTab === "middle") {
      return ["middle", "middle_1", "middle_2", "middle_3"].includes(b.position);
    }
    if (activeTab === "bottom") return b.position === "bottom";
    if (activeTab === "custom") return b.position === "custom";
    return true;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Banner/Quảng cáo</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Phân phối banner hình ảnh và thiết kế khẩu hiệu tuyên truyền đồng bộ</p>
        </div>
        <Button onClick={onNavigateToCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-5">
          <Plus className="h-4 w-4 mr-2" /> Thêm banner mới
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Modern Tabs Category Selector */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
          <TabsList className="bg-slate-100/75 p-1 rounded-xl grid grid-cols-2 sm:flex sm:flex-wrap gap-1">
            <TabsTrigger value="all" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg">
              <Grid className="h-3.5 w-3.5" /> Tất cả
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg">
              <Layers className="h-3.5 w-3.5" /> Đầu trang (Header)
            </TabsTrigger>
            <TabsTrigger value="middle" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg">
              <Layers className="h-3.5 w-3.5" /> Thân trang (Body)
            </TabsTrigger>
            <TabsTrigger value="bottom" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg">
              <Layers className="h-3.5 w-3.5" /> Cuối trang (Footer)
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg">
              <Type className="h-3.5 w-3.5" /> Khẩu hiệu chính
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input bar */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo tên banner..."
            className="pl-9 h-10 bg-slate-50/50 focus-visible:ring-blue-500/30 rounded-xl border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            // Check if this banner has slogan style configs in metaDescription
            let isSlogan = false;
            let sloganStyles: any = null;
            if (banner.metaDescription) {
              try {
                const parsed = JSON.parse(banner.metaDescription);
                if (parsed && typeof parsed === "object") {
                  isSlogan = true;
                  sloganStyles = parsed;
                }
              } catch (e) {}
            }

            return (
              <Card key={banner.id} className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col bg-card rounded-2xl relative">
                {/* Visual Thumbnail */}
                <div className="relative aspect-[21/9] overflow-hidden bg-slate-50 border-b border-slate-100/80 flex items-center justify-center">
                  {isSlogan && sloganStyles ? (
                    /* Miniature real-time rendition of slogan styles */
                    <div
                      className="w-full h-full flex flex-col justify-center items-center p-3 text-center relative overflow-hidden"
                      style={{
                        background: sloganStyles.backgroundType === "pattern"
                          ? sloganStyles.gradientColorStart || "#cc0000"
                          : `linear-gradient(to right, ${sloganStyles.gradientColorStart || "#cc0000"}, ${sloganStyles.gradientColorMiddle || "#cc0000"}, ${sloganStyles.gradientColorEnd || "#990000"})`,
                      }}
                    >
                      {/* Concentrate Watermark overlay miniature */}
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
                    /* Standard Image Thumbnail */
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

                  {/* Dropdown controls in top-right */}
                  <div className="absolute top-2 right-2 z-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-md hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => onNavigateToEdit(banner.id)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2 text-slate-500" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa banner "${banner.name}"?`)) {
                              deleteMutation.mutate(banner.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa banner
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                    {sloganStyles?.isSlideshow && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-extrabold px-2 py-0.5 flex items-center gap-1">
                        <PlayCircle className="w-3 h-3 text-amber-600 animate-spin-slow" /> Trình chiếu Slideshow
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

                  {/* Action buttons footer */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
                      onClick={() => onNavigateToEdit(banner.id)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Cấu hình
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold bg-blue-50/50 text-blue-700 border-blue-100 hover:bg-blue-100/70"
                      onClick={() => onNavigateToEdit(banner.id)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5 text-blue-500" /> Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
