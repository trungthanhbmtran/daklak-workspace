// features/posts/components/BannerList.tsx

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Plus, Edit, Trash2, Image as ImageIcon, 
  ExternalLink, Link as LinkIcon, Loader2, MoreVertical,
  Calendar, MapPin, CheckCircle2, XCircle
} from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { postsApi } from "../api";
import { Banner } from "../types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface BannerListProps {
  onNavigateToCreate: () => void;
  onNavigateToEdit: (id: string) => void;
}

export function BannerList({ onNavigateToCreate, onNavigateToEdit }: BannerListProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await postsApi.getBanners();
      const payload = res?.data;
      if (!payload) return [];
      return payload.data || payload.items || (Array.isArray(payload) ? payload : []);
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

  const filteredBanners = (banners || []).filter((b: Banner) => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Banner/Quảng cáo</h2>
        <Button onClick={onNavigateToCreate} className="shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Thêm banner mới
        </Button>
      </div>

      <Card className="p-4 bg-card border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo tên banner..." 
            className="pl-9 h-10 bg-muted/20 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.length === 0 ? (
          <div className="col-span-full py-10 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
            Không tìm thấy banner nào.
          </div>
        ) : (
          filteredBanners.map((banner: Banner) => (
            <Card key={banner.id} className="group overflow-hidden border shadow-sm hover:shadow-md transition-all flex flex-col bg-card rounded-xl">
              <div className="relative aspect-[21/9] overflow-hidden bg-muted">
                <img 
                  src={banner.imageUrl?.startsWith('http') ? banner.imageUrl : `/api/v1/media/download/${banner.imageUrl}`} 
                  alt={banner.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onNavigateToEdit(banner.id)}>
                        <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
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
                <div className="absolute bottom-2 left-2 flex gap-1">
                   <Badge variant="secondary" className="bg-black/50 text-white text-[10px] backdrop-blur-sm border-none">
                     <MapPin className="h-2 w-2 mr-1" /> {banner.position.toUpperCase()}
                   </Badge>
                   {banner.status ? (
                     <Badge variant="outline" className="bg-emerald-500/80 text-white text-[10px] backdrop-blur-sm border-none">
                       <CheckCircle2 className="h-2 w-2 mr-1" /> ACTIVE
                     </Badge>
                   ) : (
                     <Badge variant="outline" className="bg-rose-500/80 text-white text-[10px] backdrop-blur-sm border-none">
                       <XCircle className="h-2 w-2 mr-1" /> DISABLED
                     </Badge>
                   )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm line-clamp-1">{banner.name}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Order: {banner.orderIndex}</p>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    {banner.linkType === 'external' ? <ExternalLink className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
                    <span className="truncate">{banner.customUrl || '/'+banner.slug}</span>
                  </div>
                  {(banner.startAt || banner.endAt) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{banner.startAt ? new Date(banner.startAt).toLocaleDateString() : '—'} → {banner.endAt ? new Date(banner.endAt).toLocaleDateString() : '—'}</span>
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => onNavigateToEdit(banner.id)}
                >
                  <Edit className="h-3.3 w-3.5 mr-2" /> Quản lý banner
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
