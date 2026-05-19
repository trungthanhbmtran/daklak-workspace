"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Palette,
  Sparkles,
  Type,
  Layout,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Eye,
  Settings2,
  FileImage,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Home,
  Clock,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { ThemeAppearanceConfig } from "../types";

// ============================================================================
// THEME PRESETS DEFINITIONS
// ============================================================================
const THEME_PRESETS: Record<string, ThemeAppearanceConfig> = {
  government: {
    theme: "government",
    colors: {
      primary: "#cc0000",
      primaryHover: "#a80000",
      secondary: "#fdfbf7",
      background: "#faf9f6"
    },
    typography: {
      fontFamily: "'Times New Roman', Times, serif"
    },
    layout: {
      headerStyle: "standard",
      footerStyle: "standard",
      homepageLayout: "grid"
    },
    branding: {
      logo: "",
      favicon: "",
      borderRadius: "6px"
    }
  },
  news: {
    theme: "news",
    colors: {
      primary: "#005BAC",
      primaryHover: "#004580",
      secondary: "#E2ECF6",
      background: "#F8FAFC"
    },
    typography: {
      fontFamily: "'Inter', sans-serif"
    },
    layout: {
      headerStyle: "centered",
      footerStyle: "corporate",
      homepageLayout: "magazine"
    },
    branding: {
      logo: "",
      favicon: "",
      borderRadius: "8px"
    }
  },
  education: {
    theme: "education",
    colors: {
      primary: "#15803d",
      primaryHover: "#166534",
      secondary: "#f0fdf4",
      background: "#fafaf9"
    },
    typography: {
      fontFamily: "'Outfit', 'Inter', sans-serif"
    },
    layout: {
      headerStyle: "standard",
      footerStyle: "standard",
      homepageLayout: "grid"
    },
    branding: {
      logo: "",
      favicon: "",
      borderRadius: "12px"
    }
  },
  minimal: {
    theme: "minimal",
    colors: {
      primary: "#0f172a",
      primaryHover: "#1e293b",
      secondary: "#f1f5f9",
      background: "#ffffff"
    },
    typography: {
      fontFamily: "'Inter', sans-serif"
    },
    layout: {
      headerStyle: "minimal",
      footerStyle: "simple",
      homepageLayout: "classic"
    },
    branding: {
      logo: "",
      favicon: "",
      borderRadius: "0px"
    }
  }
};

const FONT_OPTIONS = [
  { name: "Serif Uy Nghiêm (Government)", value: "'Times New Roman', Times, serif" },
  { name: "Sans-Serif Hiện Đại (Inter)", value: "'Inter', sans-serif" },
  { name: "Trẻ Trung (Outfit)", value: "'Outfit', 'Inter', sans-serif" },
  { name: "Tối Giản Hướng Công Nghệ", value: "'Roboto Mono', monospace" }
];

const RADIUS_OPTIONS = [
  { name: "Không bo góc (0px)", value: "0px" },
  { name: "Bo góc nhỏ (4px)", value: "4px" },
  { name: "Bo góc trung bình (8px)", value: "8px" },
  { name: "Bo góc tròn (12px)", value: "12px" },
  { name: "Bo góc lớn (16px)", value: "16px" }
];

export function AppearanceClient() {
  const [activeTab, setActiveTab] = useState<string>("theme");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active Simulated Page Mode for Live Preview
  const [previewPage, setPreviewPage] = useState<"home" | "post" | "category" | "static">("home");

  // Core Theme State
  const [config, setConfig] = useState<ThemeAppearanceConfig>(THEME_PRESETS.government);

  // Fetch configs
  const { data: dbConfigs, isLoading, refetch } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get("/portal-configs");
        return Array.isArray(res?.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching configs", error);
        return [];
      }
    }
  });

  // Load configuration from database
  useEffect(() => {
    if (dbConfigs && dbConfigs.length > 0) {
      const found = dbConfigs.find((c: any) => c.code === "theme_appearance");
      if (found && found.description) {
        try {
          const parsed = JSON.parse(found.description);
          if (parsed && typeof parsed === "object") {
            setConfig(parsed);
          }
        } catch (e) {
          console.error("Failed to parse theme appearance config from DB", e);
        }
      }
    }
  }, [dbConfigs]);

  // Image Upload Hook for Logo
  const {
    isUploading: isUploadingLogo,
    previewUrl: previewLogoUrl,
    handleImageUpload: handleLogoUpload,
    removeImage: removeLogoImage
  } = useImageUpload({
    onSuccess: (fileId) => {
      const url = `/api/v1/admin/media/download/${fileId}`;
      setConfig(prev => ({
        ...prev,
        branding: { ...prev.branding, logo: url }
      }));
      toast.success("Tải logo thành công!");
    },
    onRemove: () => {
      setConfig(prev => ({
        ...prev,
        branding: { ...prev.branding, logo: "" }
      }));
    }
  });

  // Image Upload Hook for Favicon
  const {
    isUploading: isUploadingFavicon,
    previewUrl: previewFaviconUrl,
    handleImageUpload: handleFaviconUpload,
    removeImage: removeFaviconImage
  } = useImageUpload({
    onSuccess: (fileId) => {
      const url = `/api/v1/admin/media/download/${fileId}`;
      setConfig(prev => ({
        ...prev,
        branding: { ...prev.branding, favicon: url }
      }));
      toast.success("Tải favicon thành công!");
    },
    onRemove: () => {
      setConfig(prev => ({
        ...prev,
        branding: { ...prev.branding, favicon: "" }
      }));
    }
  });

  const applyPreset = (presetKey: keyof typeof THEME_PRESETS) => {
    setConfig(THEME_PRESETS[presetKey]);
    toast.success(`Đã áp dụng Preset: ${presetKey.toUpperCase()}`);
  };

  const handleColorChange = (key: keyof typeof config.colors, value: string) => {
    setConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  const handleLayoutChange = (key: keyof typeof config.layout, value: string) => {
    setConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: value }
    }));
  };

  const handleBrandingChange = (key: keyof typeof config.branding, value: string) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, [key]: value }
    }));
  };

  const handleTypographyChange = (key: keyof typeof config.typography, value: string) => {
    setConfig(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existing = dbConfigs?.find((c: any) => c.code === "theme_appearance");

      const payload = {
        code: "theme_appearance",
        name: config.theme,
        description: JSON.stringify(config)
      };

      if (existing) {
        await apiClient.put(`/portal-configs/${existing.id}`, payload);
      } else {
        await apiClient.post("/portal-configs", payload);
      }

      toast.success("Lưu cấu hình giao diện thành công!");
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Lưu cấu hình thất bại, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 select-none">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Đang tải cấu hình giao diện...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-1 select-none animate-fade-in">
      {/* =======================================================================
          LEFT PANEL: CONTROLS
          ======================================================================= */}
      <div className="w-full lg:w-5/12 flex flex-col gap-6">
        <Card className="shadow-lg border-slate-200/80">
          <CardHeader className="bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Cấu hình Giao diện</CardTitle>
                  <CardDescription className="text-xs">Quản lý presets màu sắc, typography và bố cục</CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Lưu Giao diện
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 bg-slate-100 p-1 rounded-lg h-10 mb-6">
                <TabsTrigger value="theme" className="text-xs font-semibold">Presets</TabsTrigger>
                <TabsTrigger value="colors" className="text-xs font-semibold">Màu sắc</TabsTrigger>
                <TabsTrigger value="layout" className="text-xs font-semibold">Bố cục</TabsTrigger>
                <TabsTrigger value="branding" className="text-xs font-semibold">Thương hiệu</TabsTrigger>
              </TabsList>

              {/* TAB 1: PRESETS */}
              <TabsContent value="theme" className="space-y-4 animate-fade-in">
                <div className="bg-rose-50/40 border border-rose-100 rounded-lg p-3 flex gap-2">
                  <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-900 leading-normal">
                    Chọn nhanh một trong các chủ đề mẫu bên dưới để áp dụng nhanh bộ quy chuẩn màu sắc, font chữ và phong cách hiển thị. Bạn có thể tự do tùy chỉnh sau khi chọn.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(THEME_PRESETS).map((key) => {
                    const preset = THEME_PRESETS[key];
                    const isSelected = config.theme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => applyPreset(key as any)}
                        className={`flex flex-col text-left p-4 rounded-xl border transition-all ${isSelected
                          ? "border-rose-500 bg-rose-50/20 ring-1 ring-rose-400"
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                          }`}
                      >
                        <span className="text-xs font-bold capitalize mb-2 flex items-center justify-between">
                          {key === "government" ? "1. Government Standard" : key === "news" ? "2. Editorial News" : key === "education" ? "3. Academic Education" : "4. Clean Minimalist"}
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-600 fill-rose-50" />}
                        </span>
                        <div className="flex gap-1.5 mb-2">
                          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: preset.colors.background }} />
                        </div>
                        <span className="text-[10px] text-slate-500 leading-tight">
                          {key === "government"
                            ? "Đỏ vàng trang trọng, truyền thống, font chữ Serif uy nghiêm."
                            : key === "news"
                              ? "Xanh trắng hiện đại, thông tin trực quan, dễ đọc, giãn rộng."
                              : key === "education"
                                ? "Xanh lục tri thức, bo góc cong mềm mại thân thiện."
                                : "Đen xám tối giản, sắc sảo, thích hợp hiển thị đa phương tiện phẳng."}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 2: COLORS & TYPOGRAPHY */}
              <TabsContent value="colors" className="space-y-5 animate-fade-in">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-rose-500" />
                    Phối màu trực quan
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Màu chủ đạo (Primary)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.colors.primary}
                          onChange={(e) => handleColorChange("primary", e.target.value)}
                          className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer shrink-0"
                        />
                        <Input
                          type="text"
                          value={config.colors.primary}
                          onChange={(e) => handleColorChange("primary", e.target.value)}
                          className="text-xs font-mono h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Màu rê chuột (Primary Hover)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.colors.primaryHover}
                          onChange={(e) => handleColorChange("primaryHover", e.target.value)}
                          className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer shrink-0"
                        />
                        <Input
                          type="text"
                          value={config.colors.primaryHover}
                          onChange={(e) => handleColorChange("primaryHover", e.target.value)}
                          className="text-xs font-mono h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Màu phụ trợ (Secondary)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.colors.secondary}
                          onChange={(e) => handleColorChange("secondary", e.target.value)}
                          className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer shrink-0"
                        />
                        <Input
                          type="text"
                          value={config.colors.secondary}
                          onChange={(e) => handleColorChange("secondary", e.target.value)}
                          className="text-xs font-mono h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Màu nền trang (Background)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.colors.background}
                          onChange={(e) => handleColorChange("background", e.target.value)}
                          className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer shrink-0"
                        />
                        <Input
                          type="text"
                          value={config.colors.background}
                          onChange={(e) => handleColorChange("background", e.target.value)}
                          className="text-xs font-mono h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-3">
                  <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-rose-500" />
                    Kiểu chữ chính (Typography)
                  </h4>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">Font chữ Cổng Thông Tin</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {FONT_OPTIONS.map((f) => {
                        const isSelected = config.typography.fontFamily === f.value;
                        return (
                          <button
                            key={f.name}
                            onClick={() => handleTypographyChange("fontFamily", f.value)}
                            className={`flex items-center justify-between p-3 rounded-lg border text-xs text-left ${isSelected
                              ? "border-rose-500 bg-rose-50/10 font-bold"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                              }`}
                          >
                            <span style={{ fontFamily: f.value }}>{f.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: LAYOUT STRUCTURE */}
              <TabsContent value="layout" className="space-y-5 animate-fade-in">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-rose-500" />
                    Kiểu dáng Đầu trang (Header Style)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "standard", name: "Standard", desc: "Logo + Banner Scenery" },
                      { value: "centered", name: "Centered", desc: "Logo căn giữa sang trọng" },
                      { value: "minimal", name: "Minimal", desc: "Tinh gọn, thanh lịch" }
                    ].map(h => {
                      const isSelected = config.layout.headerStyle === h.value;
                      return (
                        <button
                          key={h.value}
                          onClick={() => handleLayoutChange("headerStyle", h.value as any)}
                          className={`flex flex-col text-left p-3 rounded-lg border text-xs transition-all ${isSelected
                            ? "border-rose-500 bg-rose-50/20 font-bold ring-1 ring-rose-400"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                          <span className="font-bold mb-1 capitalize">{h.name}</span>
                          <span className="text-[9px] text-slate-500 leading-tight">{h.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-rose-500" />
                    Bố cục Trang chủ (Homepage Layout)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "grid", name: "Lưới Standard", desc: "Các hộp hành chính cân đối" },
                      { value: "classic", name: "Classic Feed", desc: "Một cột tin lớn bên cạnh danh mục" },
                      { value: "magazine", name: "Magazine", desc: "Báo chí, ảnh nổi bật lớn hàng đầu" }
                    ].map(h => {
                      const isSelected = config.layout.homepageLayout === h.value;
                      return (
                        <button
                          key={h.value}
                          onClick={() => handleLayoutChange("homepageLayout", h.value as any)}
                          className={`flex flex-col text-left p-3 rounded-lg border text-xs transition-all ${isSelected
                            ? "border-rose-500 bg-rose-50/20 font-bold ring-1 ring-rose-400"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                          <span className="font-bold mb-1 capitalize">{h.name}</span>
                          <span className="text-[9px] text-slate-500 leading-tight">{h.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-rose-500" />
                    Bố cục Chân trang (Footer Style)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "standard", name: "Hành chính", desc: "Thông tin liên hệ bản đồ lớn" },
                      { value: "corporate", name: "Đa Cột", desc: "Nhiều cột sitemap chuyên nghiệp" },
                      { value: "simple", name: "Đơn giản", desc: "Bản quyền tinh gọn tối giản" }
                    ].map(h => {
                      const isSelected = config.layout.footerStyle === h.value;
                      return (
                        <button
                          key={h.value}
                          onClick={() => handleLayoutChange("footerStyle", h.value as any)}
                          className={`flex flex-col text-left p-3 rounded-lg border text-xs transition-all ${isSelected
                            ? "border-rose-500 bg-rose-50/20 font-bold ring-1 ring-rose-400"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                          <span className="font-bold mb-1 capitalize">{h.name}</span>
                          <span className="text-[9px] text-slate-500 leading-tight">{h.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: BRANDING (LOGO/FAVICON/RADIUS) */}
              <TabsContent value="branding" className="space-y-5 animate-fade-in">
                {/* 1. Corner Radius */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-rose-500" />
                    Độ bo góc khối (Border Radius)
                  </Label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {RADIUS_OPTIONS.map((r) => {
                      const isSelected = config.branding.borderRadius === r.value;
                      return (
                        <button
                          key={r.value}
                          onClick={() => handleBrandingChange("borderRadius", r.value)}
                          className={`flex items-center justify-between p-3 rounded-lg border text-xs text-left ${isSelected
                            ? "border-rose-500 bg-rose-50/10 font-bold"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                        >
                          <span>{r.name}</span>
                          <div
                            className="w-12 h-6 border-2 border-slate-700 bg-slate-100"
                            style={{ borderRadius: r.value }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Logo Upload */}
                <div className="space-y-2 pt-3 border-t">
                  <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-rose-500" />
                    Logo Cơ quan (Logo URL)
                  </Label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center bg-slate-50/50 relative">
                    {config.branding.logo ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={config.branding.logo}
                          alt="Logo Preview"
                          className="h-16 object-contain max-w-xs bg-white p-2 border rounded shadow-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={removeLogoImage}
                            className="text-xs font-bold h-8"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Gỡ ảnh
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-3 select-none">
                        <UploadCloud className="w-8 h-8 text-slate-400 animate-pulse" />
                        <span className="text-xs text-slate-500 font-medium">Bấm để đăng tải Logo chính thức</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          disabled={isUploadingLogo}
                        />
                        {isUploadingLogo && (
                          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Favicon Upload */}
                <div className="space-y-2 pt-3 border-t">
                  <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-rose-500" />
                    Biểu tượng tab (Favicon URL)
                  </Label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center bg-slate-50/50 relative">
                    {config.branding.favicon ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={config.branding.favicon}
                          alt="Favicon Preview"
                          className="w-10 h-10 object-contain bg-white p-1 border rounded shadow-sm"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={removeFaviconImage}
                          className="text-xs font-bold h-8"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Gỡ ảnh
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-3 select-none">
                        <UploadCloud className="w-8 h-8 text-slate-400 animate-pulse" />
                        <span className="text-xs text-slate-500 font-medium">Bấm để đăng tải Favicon (.ico / .png)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          disabled={isUploadingFavicon}
                        />
                        {isUploadingFavicon && (
                          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* =======================================================================
          RIGHT PANEL: HIGH-FIDELITY LIVE PREVIEW MOCKUP
          ======================================================================= */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Realtime Preview (Mô phỏng Giao diện Portal)
            </span>
          </div>
          <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-semibold uppercase self-start sm:self-auto">
            Active: {config.theme.toUpperCase()} Preset
          </span>
        </div>

        {/* PAGE SWITCHER TABS */}
        <div className="flex gap-1.5 p-1 bg-slate-100/90 border border-slate-200 rounded-lg overflow-x-auto shrink-0 select-none shadow-sm">
          {[
            { id: "home", label: "Trang chủ", icon: Home },
            { id: "post", label: "Chi tiết bài viết", icon: Info },
            { id: "category", label: "Chuyên mục tin", icon: Layers },
            { id: "static", label: "Giới thiệu tĩnh", icon: Settings2 }
          ].map((p) => {
            const Icon = p.icon;
            const isActive = previewPage === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPreviewPage(p.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-500 animate-pulse" : "text-slate-400"}`} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* 
          PORTAL MOCKUP FRAME
        */}
        <div
          className="w-full border border-slate-300 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col bg-white"
          style={{
            fontFamily: config.typography.fontFamily,
            backgroundColor: config.colors.background
          }}
        >
          {/* Mock Browser Header Bar */}
          <div className="w-full bg-slate-800 px-4 py-2 flex items-center gap-2 select-none">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
            </div>
            <div className="bg-slate-700/80 rounded-md text-[10px] text-slate-300 px-3 py-1 font-mono flex-1 text-center truncate max-w-md mx-auto">
              https://portal.daklak.gov.vn/dang-kang/{previewPage === "home" ? "" : previewPage}
            </div>
          </div>

          {/* 
            1. MOCK TOP BAR
          */}
          <div className="w-full bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex justify-between items-center text-[10px] text-slate-600 font-sans">
            <div>Thứ Hai, 18/05/2026 | Bản dịch: Tiếng Việt</div>
            <div className="flex items-center gap-3">
              <span>Hotline: 0262.3812.345</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold">Đăng nhập</span>
            </div>
          </div>

          {/* 
            2. MOCK HEADER
          */}
          {config.layout.headerStyle === "standard" && (
            <div className="w-full bg-[#fdfbf7] border-b-2 py-3 px-4 flex justify-between items-center" style={{ borderBottomColor: config.colors.primary }}>
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-rose-500/10 rounded-full border">
                  {config.branding.logo ? (
                    <img src={config.branding.logo} alt="Logo" className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-[8px] font-bold text-center leading-none text-slate-600">Vietnam Emblem</span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-serif font-black tracking-widest text-slate-500 uppercase leading-none">
                    TRANG THÔNG TIN ĐIỆN TỬ
                  </span>
                  <h1 className="text-sm sm:text-base font-serif font-black uppercase tracking-wide leading-tight my-0.5" style={{ color: config.colors.primary }}>
                    UBND XÃ DANG KANG
                  </h1>
                  <span className="text-blue-800 text-[8px] font-bold tracking-wider leading-none uppercase">
                    TỈNH ĐẮK LẮK
                  </span>
                </div>
              </div>
              <div className="w-32 h-10 bg-slate-200/60 rounded border border-slate-300/40 hidden sm:block overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-300/40 flex items-center justify-center text-[9px] text-slate-500 font-sans">Scenery Banner</div>
              </div>
            </div>
          )}

          {config.layout.headerStyle === "centered" && (
            <div className="w-full bg-[#fdfbf7] border-b-2 py-4 px-4 flex flex-col items-center gap-2" style={{ borderBottomColor: config.colors.primary }}>
              <div className="shrink-0 w-14 h-14 flex items-center justify-center bg-rose-500/10 rounded-full border">
                {config.branding.logo ? (
                  <img src={config.branding.logo} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <span className="text-[9px] font-bold text-center leading-none text-slate-600">Logo</span>
                )}
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[8px] font-sans font-bold tracking-widest text-slate-500 uppercase">
                  UBND HUYỆN KRÔNG BÔNG - ĐẮK LẮK
                </span>
                <h1 className="text-base sm:text-lg font-serif font-black uppercase tracking-wide leading-none mt-1" style={{ color: config.colors.primary }}>
                  ỦY BAN NHÂN DÂN XÃ DANG KANG
                </h1>
              </div>
            </div>
          )}

          {config.layout.headerStyle === "minimal" && (
            <div className="w-full bg-white border-b py-2.5 px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 rounded border">
                  {config.branding.logo ? (
                    <img src={config.branding.logo} alt="Logo" className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="text-[7px] font-bold text-center text-slate-600">Logo</span>
                  )}
                </div>
                <h1 className="text-xs font-sans font-bold uppercase tracking-wide" style={{ color: config.colors.primary }}>
                  UBND XÃ DANG KANG
                </h1>
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Cổng Tối Giản</div>
            </div>
          )}

          {/* 
            3. MOCK NAVIGATION BAR (INTERACTIVE)
          */}
          <div
            className="w-full text-white px-4 flex items-center h-10 overflow-hidden shadow-sm select-none"
            style={{ backgroundColor: config.colors.primary }}
          >
            <div className="flex gap-4 items-center h-full text-xs font-bold font-sans">
              <span
                onClick={() => setPreviewPage("home")}
                className={`flex items-center justify-center h-full px-2 hover:bg-black/15 cursor-pointer transition-colors ${previewPage === "home" ? "bg-black/10" : ""}`}
                title="Về Trang chủ"
              >
                <Home className="w-3.5 h-3.5" />
              </span>
              <span
                onClick={() => setPreviewPage("home")}
                className={`h-full flex items-center px-1.5 cursor-pointer transition-all border-b-2 ${
                  previewPage === "home" ? "border-amber-300 font-extrabold" : "border-transparent text-white/80 hover:text-white"
                }`}
              >
                TRANG CHỦ
              </span>
              <span
                onClick={() => setPreviewPage("static")}
                className={`h-full flex items-center px-1.5 cursor-pointer transition-all border-b-2 ${
                  previewPage === "static" ? "border-amber-300 font-extrabold" : "border-transparent text-white/80 hover:text-white"
                }`}
              >
                GIỚI THIỆU
              </span>
              <span
                onClick={() => setPreviewPage("category")}
                className={`h-full flex items-center px-1.5 cursor-pointer transition-all border-b-2 ${
                  previewPage === "category" ? "border-amber-300 font-extrabold" : "border-transparent text-white/80 hover:text-white"
                }`}
              >
                TIN TỨC
              </span>
              <span
                onClick={() => setPreviewPage("post")}
                className={`h-full flex items-center px-1.5 cursor-pointer transition-all border-b-2 ${
                  previewPage === "post" ? "border-amber-300 font-extrabold" : "border-transparent text-white/80 hover:text-white"
                }`}
              >
                TIN CHI TIẾT
              </span>
            </div>
          </div>

          {/* =======================================================================
              MOCK PAGE 1: HOME PAGE
              ======================================================================= */}
          {previewPage === "home" && (
            <div className="animate-fade-in flex flex-col w-full">
              {/* Mock Hero Slider */}
              <div className="w-full px-4 pt-4 select-none">
                <div
                  className="w-full aspect-[21/8] bg-slate-800 relative overflow-hidden flex items-end p-4 border border-slate-200"
                  style={{ borderRadius: config.branding.borderRadius }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  {/* Fallback pattern for sceneries */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-950/60 to-amber-900/60 opacity-60 z-0" />

                  <div className="relative z-20 text-left">
                    <span
                      className="px-2 py-0.5 text-[9px] font-bold text-white rounded uppercase inline-block mb-1.5 animate-pulse"
                      style={{ backgroundColor: config.colors.primary }}
                    >
                      Tin Nổi Bật
                    </span>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-yellow-300 font-serif leading-tight">
                      Chào mừng quý khách đến với Trang thông tin điện tử Đảng ủy - HĐND - UBND Xã Dang Kang
                    </h3>
                    <p className="text-[10px] text-white/80 mt-1 line-clamp-1 font-sans">
                      Quyết tâm xây dựng chính quyền số, phát triển nông thôn mới văn minh, giàu đẹp.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Homepage Content Area */}
              <div className="w-full px-4 py-5 flex flex-col md:flex-row gap-4 text-left">
                {/* Main News Flow */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Tabs list mockup */}
                  <div className="w-full border-b flex gap-2 text-xs font-bold font-sans">
                    <span
                      className="pb-1 px-1 border-b-2"
                      style={{
                        borderColor: config.colors.primary,
                        color: config.colors.primary
                      }}
                    >
                      Tin hoạt động
                    </span>
                    <span className="pb-1 px-1 text-slate-400 hover:text-slate-600 cursor-pointer">Kinh tế - Xã hội</span>
                    <span className="pb-1 px-1 text-slate-400 hover:text-slate-600 cursor-pointer">Xây dựng nông thôn mới</span>
                  </div>

                  {config.layout.homepageLayout === "grid" && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: "Hội nghị Ban chấp hành Đảng bộ Xã Dang Kang lần thứ 15 nhiệm kỳ 2020-2025", desc: "Triển khai định hướng nhiệm vụ phát triển nông lâm nghiệp.", date: "18/05/2026" },
                        { title: "Ra quân ngày Chủ nhật xanh chung tay dọn vệ sinh cảnh quan môi trường nông thôn mới", desc: "Thu hút hơn 500 đoàn viên thanh niên tham gia hưởng ứng nhiệt tình.", date: "17/05/2026" }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewPage("post")}
                          className="bg-white border rounded-lg overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                          style={{ borderRadius: config.branding.borderRadius }}
                        >
                          <div className="w-full aspect-[16/10] bg-slate-200 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900/10" />
                            <span className="text-[9px] text-slate-400 font-bold">Hình ảnh tin tức</span>
                          </div>
                          <div className="p-2.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-bold line-clamp-2 text-slate-800 leading-snug group-hover:text-rose-600 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[9px] text-slate-500 line-clamp-2 mt-1 leading-normal font-sans">
                                {item.desc}
                              </p>
                            </div>
                            <div className="flex justify-between items-center border-t pt-1.5 mt-2 text-[8px] text-slate-400 font-sans">
                              <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {item.date}</span>
                              <span className="font-bold uppercase tracking-wider" style={{ color: config.colors.primary }}>Xem tiếp</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {config.layout.homepageLayout === "classic" && (
                    <div className="flex flex-col gap-3">
                      {[
                        { title: "Đoàn giám sát HĐND Huyện làm việc tại xã Dang Kang về chuyên đề chuyển đổi số hành chính công", desc: "Đánh giá cao kết quả chỉ số cải cách hành chính xã trong quý I năm 2026.", date: "18/05/2026" },
                        { title: "Tuyên truyền phổ biến pháp luật phòng chống cháy nổ trong khu dân cư nông thôn mới", desc: "Nâng cao ý thức người dân trong việc sử dụng điện an toàn phòng chống cháy nổ.", date: "17/05/2026" }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewPage("post")}
                          className="bg-white border p-3 flex gap-3 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer group"
                          style={{ borderRadius: config.branding.borderRadius }}
                        >
                          <div className="w-16 h-16 bg-slate-200 rounded shrink-0 relative flex items-center justify-center overflow-hidden border">
                            <span className="text-[8px] text-slate-400 font-bold text-center leading-none">Ảnh</span>
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-bold line-clamp-1 text-slate-800 leading-snug group-hover:text-rose-600 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-normal font-sans">
                                {item.desc}
                              </p>
                            </div>
                            <div className="flex justify-between items-center text-[8px] text-slate-400 mt-1 font-sans">
                              <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {item.date}</span>
                              <span className="font-bold uppercase tracking-wider" style={{ color: config.colors.primary }}>Đọc thêm</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {config.layout.homepageLayout === "magazine" && (
                    <div className="flex flex-col gap-3">
                      {/* Magazine Main Large Post */}
                      <div
                        onClick={() => setPreviewPage("post")}
                        className="w-full bg-white border shadow-sm rounded-lg overflow-hidden flex flex-col cursor-pointer group hover:shadow"
                        style={{ borderRadius: config.branding.borderRadius }}
                      >
                        <div className="w-full aspect-[21/9] bg-slate-200 flex items-center justify-center relative overflow-hidden">
                          <span className="text-[9px] text-slate-400 font-bold">Hình ảnh đại diện bài viết lớn</span>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-rose-600 transition-colors">
                            Đại hội Đại biểu Hội Nông dân Xã Dang Kang khóa X nhiệm kỳ 2026-2031 thành công tốt đẹp
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 font-sans">
                            Đại hội bầu ra ban chấp hành mới gồm 11 đồng chí tiêu biểu đại diện cho tiếng nói nông dân xã...
                          </p>
                          <div className="flex items-center justify-between text-[8px] text-slate-400 mt-2 pt-2 border-t font-sans">
                            <span>18/05/2026 | Hội Nông dân</span>
                            <span className="font-extrabold uppercase tracking-wide" style={{ color: config.colors.primary }}>Xem bài viết</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar widgets */}
                <div className="w-full md:w-48 shrink-0 flex flex-col gap-4">
                  {/* Hotline widget mockup */}
                  <div
                    className="p-3 bg-white border border-slate-200/80 shadow-sm flex flex-col gap-2"
                    style={{ borderRadius: config.branding.borderRadius }}
                  >
                    <h5 className="text-[10px] font-bold text-slate-800 border-b pb-1 flex items-center gap-1 font-sans">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      Đường Dây Nóng
                    </h5>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-rose-600 font-mono tracking-wider">0262.3812.345</span>
                      <span className="text-[8px] text-slate-400 font-sans">Hỗ trợ khẩn cấp 24/7</span>
                    </div>
                  </div>

                  {/* Dịch vụ công liên kết */}
                  <div
                    className="p-3 shadow-sm border text-white flex flex-col gap-2 cursor-pointer hover:opacity-95 transition-all"
                    style={{
                      borderRadius: config.branding.borderRadius,
                      backgroundColor: config.colors.primary
                    }}
                  >
                    <h5 className="text-[10px] font-bold border-b border-white/20 pb-1 flex items-center gap-1 font-sans">
                      <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                      Dịch Vụ Công Một Cửa
                    </h5>
                    <p className="text-[8px] text-white/80 leading-normal font-sans">
                      Tra cứu tiến độ hồ sơ hành chính trực tuyến công khai nhanh chóng.
                    </p>
                    <span className="text-[8px] font-black text-yellow-300 uppercase tracking-wider flex items-center self-end gap-0.5 mt-1">
                      Tra cứu <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================================
              MOCK PAGE 2: POST DETAIL PAGE (TIN CHI TIẾT)
              ======================================================================= */}
          {previewPage === "post" && (
            <div className="w-full px-4 py-4 text-left flex flex-col md:flex-row gap-4 animate-fade-in">
              {/* Left pane: post content */}
              <div className="flex-1 bg-white border border-slate-200/80 p-4 shadow-sm" style={{ borderRadius: config.branding.borderRadius }}>
                {/* Breadcrumbs */}
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1 mb-2">
                  <span className="hover:text-slate-600 cursor-pointer" onClick={() => setPreviewPage("home")}>Trang chủ</span>
                  <span>/</span>
                  <span className="hover:text-slate-600 cursor-pointer" onClick={() => setPreviewPage("category")}>Tin hoạt động</span>
                  <span>/</span>
                  <span className="text-slate-500 font-medium">Chi tiết bài viết</span>
                </div>

                {/* Article Header */}
                <h2 className="text-sm sm:text-base font-serif font-black leading-snug text-slate-900 mb-2">
                  Hội nghị Ban chấp hành Đảng bộ Xã Dang Kang lần thứ 15: Thúc đẩy cơ cấu nông lâm nghiệp bền vững
                </h2>
                
                {/* Metadata */}
                <div className="flex items-center justify-between border-y border-slate-100 py-1.5 my-3 text-[9px] text-slate-500 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 18/05/2026</span>
                    <span>•</span>
                    <span>Tác giả: Ban Biên tập</span>
                    <span>•</span>
                    <span>Lượt xem: 1,425</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer hover:bg-blue-700">Chia sẻ F</span>
                    <span className="bg-sky-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer hover:bg-sky-600">Zalo</span>
                  </div>
                </div>

                {/* Content Paragraphs */}
                <div className="text-[11px] text-slate-700 leading-relaxed font-sans space-y-3">
                  <p className="font-bold">
                    Sáng ngày 18/05, Đảng ủy xã Dang Kang đã tổ chức Hội nghị Ban chấp hành lần thứ 15 nhiệm kỳ 2020-2025. Hội nghị tập trung thảo luận sâu sắc về các giải pháp đẩy mạnh ứng dụng khoa học kỹ thuật và cơ cấu lại ngành nông lâm nghiệp nhằm thích ứng với biến đổi khí hậu.
                  </p>
                  <p>
                    Chủ trì Hội nghị có đồng chí Bí thư Đảng ủy Xã. Tham dự có đầy đủ các đồng chí trong Ban chấp hành Đảng bộ, lãnh đạo HĐND, UBND, Ủy ban MTTQ Việt Nam xã và trưởng các tổ chức đoàn thể chính trị - xã hội.
                  </p>
                  
                  {/* Styled Blockquote */}
                  <blockquote 
                    className="pl-3 border-l-4 my-3 text-slate-800 italic p-2" 
                    style={{ 
                      borderColor: config.colors.primary,
                      backgroundColor: config.colors.secondary
                    }}
                  >
                    "Việc chuyển dịch cơ cấu cây trồng nông nghiệp từ các loại cây ngắn ngày năng suất thấp sang các loại cây ăn quả giá trị cao là chìa khóa giúp người dân xóa đói giảm nghèo bền vững."
                  </blockquote>

                  {/* Mock Image with borderRadius */}
                  <div className="my-3 flex flex-col items-center gap-1.5">
                    <div 
                      className="w-full aspect-[21/9] bg-slate-100 border flex items-center justify-center relative overflow-hidden"
                      style={{ borderRadius: config.branding.borderRadius }}
                    >
                      <span className="text-[9px] text-slate-400 font-bold">Hình ảnh: Lãnh đạo phát biểu ý kiến chỉ đạo tại Hội nghị</span>
                    </div>
                    <span className="text-[9px] text-slate-500 italic">Toàn cảnh hội nghị BCH Đảng bộ Xã Dang Kang sáng 18/05/2026.</span>
                  </div>

                  <p>
                    Hội nghị cũng đã thống nhất thông qua chỉ tiêu phát triển nông thôn mới nâng cao trong giai đoạn kế tiếp, đồng thời tiếp tục đẩy mạnh công tác số hóa dịch vụ hành chính công để tạo điều kiện thuận lợi tối đa cho nhân dân.
                  </p>

                  {/* Table with custom styling */}
                  <div className="my-4 overflow-hidden border rounded" style={{ borderRadius: config.branding.borderRadius }}>
                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="text-white" style={{ backgroundColor: config.colors.primary }}>
                          <th className="p-1.5 text-left font-bold border-r border-white/20">STT</th>
                          <th className="p-1.5 text-left font-bold border-r border-white/20">Nội dung nhiệm vụ chính</th>
                          <th className="p-1.5 text-left font-bold">Tiến độ mục tiêu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr className="bg-slate-50/50">
                          <td className="p-1.5 border-r font-mono">01</td>
                          <td className="p-1.5 border-r font-medium text-slate-700">Hoàn thành quy hoạch nông thôn nâng cao</td>
                          <td className="p-1.5 text-emerald-600 font-bold">Đã đạt 100%</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 border-r font-mono">02</td>
                          <td className="p-1.5 border-r font-medium text-slate-700">Số hóa kết quả TTHC thuộc thẩm quyền xã</td>
                          <td className="p-1.5 text-amber-600 font-bold">Đang triển khai (80%)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tags block */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t">
                  <span className="text-[9px] font-sans text-slate-400 font-bold shrink-0 self-center">Tags:</span>
                  {["Đảng bộ Dang Kang", "Phát triển Nông nghiệp", "Tin hoạt động"].map((t) => (
                    <span 
                      key={t}
                      className="px-2 py-0.5 text-[9px] font-sans font-bold border border-slate-200 hover:border-rose-500 cursor-pointer rounded-full transition-all bg-slate-50 hover:bg-rose-50/10"
                      style={{ 
                        borderRadius: "100px",
                        color: config.colors.primary 
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Citizen Comments Form */}
                <div className="mt-5 pt-4 border-t space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    Ý kiến phản hồi công dân
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Họ và tên..." 
                      className="border border-slate-200 p-1.5 text-[9px] outline-none w-full bg-slate-50 focus:bg-white focus:border-slate-300 transition-colors"
                      style={{ borderRadius: config.branding.borderRadius }} 
                    />
                    <input 
                      type="text" 
                      placeholder="Số điện thoại..." 
                      className="border border-slate-200 p-1.5 text-[9px] outline-none w-full bg-slate-50 focus:bg-white focus:border-slate-300 transition-colors"
                      style={{ borderRadius: config.branding.borderRadius }} 
                    />
                  </div>
                  <textarea 
                    placeholder="Nhập ý kiến đóng góp của bạn..." 
                    rows={2}
                    className="border border-slate-200 p-1.5 text-[9px] outline-none w-full resize-none bg-slate-50 focus:bg-white focus:border-slate-300 transition-colors"
                    style={{ borderRadius: config.branding.borderRadius }}
                  />
                  <Button 
                    size="sm" 
                    className="text-[9px] font-bold h-7 self-start text-white hover:opacity-90"
                    style={{ 
                      backgroundColor: config.colors.primary, 
                      borderRadius: config.branding.borderRadius 
                    }}
                  >
                    Gửi phản hồi đóng góp
                  </Button>
                </div>
              </div>

              {/* Right Sidebar widgets */}
              <div className="w-full md:w-48 shrink-0 flex flex-col gap-4">
                {/* Related Posts Widget */}
                <div className="p-3 bg-white border border-slate-200/80 shadow-sm flex flex-col gap-2.5" style={{ borderRadius: config.branding.borderRadius }}>
                  <h5 className="text-[10px] font-bold text-slate-800 border-b pb-1 flex items-center gap-1 font-sans">
                    <Layers className="w-3 h-3 text-rose-500" />
                    Tin cùng chuyên mục
                  </h5>
                  <div className="flex flex-col gap-2.5 text-slate-700">
                    {[
                      { title: "Ra quân ngày Chủ nhật xanh chung tay dọn vệ sinh cảnh quan", date: "17/05/2026" },
                      { title: "Đoàn giám sát HĐND Huyện làm việc tại xã về Cải cách hành chính", date: "16/05/2026" },
                      { title: "Phát động chiến dịch mùa hè tình nguyện hỗ trợ bà con nghèo", date: "15/05/2026" }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setPreviewPage("post")}
                        className="flex flex-col gap-0.5 cursor-pointer hover:text-rose-600 transition-colors group"
                      >
                        <h6 className="text-[10px] font-bold line-clamp-2 leading-snug group-hover:underline">
                          {item.title}
                        </h6>
                        <span className="text-[8px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Administrative Helpline */}
                <div 
                  className="p-3 bg-white border border-slate-200/80 shadow-sm flex flex-col gap-2"
                  style={{ borderRadius: config.branding.borderRadius }}
                >
                  <h5 className="text-[10px] font-bold text-slate-800 border-b pb-1 flex items-center gap-1 font-sans">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    Đường Dây Nóng
                  </h5>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-rose-600 font-mono tracking-wider">0262.3812.345</span>
                    <span className="text-[8px] text-slate-400 font-sans">Hỗ trợ khẩn cấp 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================================
              MOCK PAGE 3: CATEGORY LIST PAGE (CHUYÊN MỤC TIN TỨC)
              ======================================================================= */}
          {previewPage === "category" && (
            <div className="w-full px-4 py-4 text-left flex flex-col md:flex-row gap-4 animate-fade-in">
              {/* Main List */}
              <div className="flex-1 bg-white border border-slate-200/80 p-4 shadow-sm flex flex-col gap-4" style={{ borderRadius: config.branding.borderRadius }}>
                {/* Breadcrumbs */}
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                  <span className="hover:text-slate-600 cursor-pointer" onClick={() => setPreviewPage("home")}>Trang chủ</span>
                  <span>/</span>
                  <span className="text-slate-500 font-medium">Chuyên mục tin</span>
                </div>

                {/* Category Header */}
                <div className="border-b-2 pb-2 flex items-center justify-between" style={{ borderBottomColor: config.colors.primary }}>
                  <h2 className="text-xs sm:text-sm font-serif font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-rose-600" />
                    Chuyên mục: Tin hoạt động nông thôn mới
                  </h2>
                  <span className="text-[9px] text-slate-500 font-mono font-medium">Có 24 tin bài</span>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-2 text-xs font-sans">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm tin bài..." 
                    className="border border-slate-200 px-2 py-1 text-[9px] flex-1 outline-none focus:border-slate-300"
                    style={{ borderRadius: config.branding.borderRadius }} 
                  />
                  <select 
                    className="border border-slate-200 px-2 py-1 text-[9px] outline-none bg-slate-50 text-slate-600 cursor-pointer"
                    style={{ borderRadius: config.branding.borderRadius }}
                  >
                    <option>Mới nhất</option>
                    <option>Cũ nhất</option>
                  </select>
                </div>

                {/* List items */}
                <div className="flex flex-col gap-3">
                  {[
                    { title: "Hội nghị Ban chấp hành Đảng bộ Xã Dang Kang lần thứ 15 nhiệm kỳ 2020-2025", desc: "Triển khai định hướng nhiệm vụ phát triển nông lâm nghiệp, chuyển dịch cơ cấu cây trồng có giá trị cao.", date: "18/05/2026", cat: "Hoạt động Đảng" },
                    { title: "Ra quân ngày Chủ nhật xanh chung tay dọn vệ sinh cảnh quan môi trường nông thôn mới", desc: "Thu hút hơn 500 đoàn viên thanh niên và đông đảo bà con nhân dân hưởng ứng nhiệt tình làm sạch ngõ xóm.", date: "17/05/2026", cat: "Môi trường" },
                    { title: "Đoàn giám sát HĐND Huyện làm việc tại xã Dang Kang về chuyên đề chuyển đổi số", desc: "Đánh giá cao kết quả chỉ số cải cách hành chính và xây dựng cổng thông tin hiện đại, đồng bộ.", date: "16/05/2026", cat: "Cải cách hành chính" },
                    { title: "Tuyên truyền phổ biến pháp luật phòng chống cháy nổ trong khu dân cư", desc: "Nâng cao ý thức người dân trong việc sử dụng điện an toàn, phòng chống cháy nổ trong mùa hanh khô sắp tới.", date: "15/05/2026", cat: "An ninh - Quốc phòng" }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setPreviewPage("post")}
                      className="p-3 border border-slate-100 rounded-lg hover:shadow hover:border-slate-200 transition-all bg-white flex gap-3 cursor-pointer group"
                      style={{ borderRadius: config.branding.borderRadius }}
                    >
                      <div className="w-20 h-20 bg-slate-50 rounded shrink-0 relative flex items-center justify-center overflow-hidden border border-slate-200/60">
                        <span className="text-[8px] text-slate-400 font-bold text-center leading-none">Ảnh đại diện</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span 
                            className="px-1.5 py-0.5 rounded text-[8px] font-bold font-sans uppercase mb-1 inline-block"
                            style={{ 
                              backgroundColor: config.colors.secondary,
                              color: config.colors.primary 
                            }}
                          >
                            {item.cat}
                          </span>
                          <h4 className="text-[11px] font-bold line-clamp-1 text-slate-800 leading-snug group-hover:text-rose-600 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-normal font-sans">
                            {item.desc}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-[8px] text-slate-400 mt-1 font-sans">
                          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {item.date}</span>
                          <span className="font-bold uppercase tracking-wide" style={{ color: config.colors.primary }}>Xem bài viết</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-1 border-t pt-4 mt-2 text-[9px] font-sans">
                  <span className="px-2 py-1 border rounded text-slate-400 cursor-not-allowed bg-slate-50">Trước</span>
                  <span className="px-2.5 py-1 border rounded text-white font-bold cursor-pointer" style={{ backgroundColor: config.colors.primary }}>1</span>
                  <span className="px-2.5 py-1 border rounded text-slate-600 hover:bg-slate-50 cursor-pointer">2</span>
                  <span className="px-2.5 py-1 border rounded text-slate-600 hover:bg-slate-50 cursor-pointer">3</span>
                  <span className="px-2.5 py-1 border rounded text-slate-400">...</span>
                  <span className="px-2.5 py-1 border rounded text-slate-600 hover:bg-slate-50 cursor-pointer">6</span>
                  <span className="px-2 py-1 border rounded text-slate-600 hover:bg-slate-50 cursor-pointer">Sau</span>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================================
              MOCK PAGE 4: STATIC INTRODUCTION PAGE (GIỚI THIỆU TĨNH)
              ======================================================================= */}
          {previewPage === "static" && (
            <div className="w-full px-4 py-4 text-left flex flex-col md:flex-row gap-4 animate-fade-in">
              {/* Left pane: Static Sidebar menu */}
              <div className="w-full md:w-48 shrink-0 flex flex-col gap-3">
                <div className="bg-white border p-3 flex flex-col gap-2.5 shadow-sm" style={{ borderRadius: config.branding.borderRadius }}>
                  <h5 className="text-[10px] font-bold text-slate-800 border-b pb-1 flex items-center gap-1 font-sans">
                    <Info className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    Giới thiệu
                  </h5>
                  <div className="flex flex-col gap-1 text-[10px] font-sans">
                    {[
                      { id: "geo", name: "Điều kiện tự nhiên", active: true },
                      { id: "hist", name: "Lịch sử phát triển", active: false },
                      { id: "org", name: "Cơ cấu tổ chức bộ máy", active: false },
                      { id: "contact", name: "Thông tin liên hệ công tác", active: false }
                    ].map((sub) => (
                      <span 
                        key={sub.id}
                        className={`p-2 rounded cursor-pointer transition-all font-medium ${sub.active 
                          ? "font-bold text-white shadow-sm" 
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                        style={sub.active ? { backgroundColor: config.colors.primary } : {}}
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Helpline Widget */}
                <div 
                  className="p-3 bg-white border border-slate-200/80 shadow-sm flex flex-col gap-2"
                  style={{ borderRadius: config.branding.borderRadius }}
                >
                  <h5 className="text-[10px] font-bold text-slate-800 border-b pb-1 flex items-center gap-1 font-sans">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    Đường Dây Nóng
                  </h5>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-rose-600 font-mono tracking-wider">0262.3812.345</span>
                    <span className="text-[8px] text-slate-400 font-sans">Hỗ trợ khẩn cấp 24/7</span>
                  </div>
                </div>
              </div>

              {/* Right pane: document details */}
              <div className="flex-1 bg-white border border-slate-200/80 p-4 shadow-sm flex flex-col gap-3" style={{ borderRadius: config.branding.borderRadius }}>
                {/* Breadcrumbs */}
                <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                  <span className="hover:text-slate-600 cursor-pointer" onClick={() => setPreviewPage("home")}>Trang chủ</span>
                  <span>/</span>
                  <span className="hover:text-slate-600 cursor-pointer" onClick={() => setPreviewPage("static")}>Giới thiệu</span>
                  <span>/</span>
                  <span className="text-slate-500 font-medium">Điều kiện tự nhiên</span>
                </div>

                {/* Page Title */}
                <h2 className="text-sm sm:text-base font-serif font-black leading-snug text-slate-900 border-b pb-2">
                  Giới thiệu: Điều kiện Tự nhiên Xã Dang Kang
                </h2>

                {/* Document Body */}
                <div className="text-[11px] text-slate-700 leading-relaxed font-sans space-y-3">
                  <h4 className="text-[12px] font-bold text-slate-800 mt-2 font-serif flex items-center gap-1">
                    1. Vị trí địa lý & Ranh giới hành chính
                  </h4>
                  <p>
                    Dang Kang là một xã thuộc huyện Krông Bông, tỉnh Đắk Lắk. Xã nằm cách trung tâm huyện lỵ khoảng 15 km về hướng Tây Bắc, có vị trí địa lý thuận lợi trong giao lưu văn hóa và phát triển kinh tế vùng:
                  </p>
                  
                  {/* Styled bullet list */}
                  <ul className="list-none pl-1 space-y-1.5 my-3">
                    {[
                      "Phía Đông giáp xã Cư Kty và xã Hòa Sơn.",
                      "Phía Tây giáp xã Dang Kang và ranh giới hành chính Huyện Cư Kuin.",
                      "Phía Nam giáp dãy núi Chư Yang Sin kỳ vĩ.",
                      "Phía Bắc giáp sông Krông Pắc dòng nước mát quanh năm bồi đắp phù sa."
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[10px] font-bold mt-0.5" style={{ color: config.colors.primary }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-[12px] font-bold text-slate-800 mt-4 font-serif">
                    2. Tiềm năng tự nhiên & Phát triển kinh tế
                  </h4>
                  <p>
                    Với tổng diện tích tự nhiên tương đối lớn, đất đai chủ yếu là đất đỏ bazan và đất phù sa ven sông vô cùng màu mỡ, xã Dang Kang có thế mạnh vượt trội trong việc phát triển các mô hình trồng trọt nông nghiệp công nghệ cao kết hợp với chăn nuôi đại gia súc.
                  </p>

                  {/* Informational Callout Box using secondary theme color */}
                  <div 
                    className="p-3 border-l-4 my-4 flex gap-2"
                    style={{ 
                      borderColor: config.colors.primary, 
                      backgroundColor: config.colors.secondary,
                      borderRadius: config.branding.borderRadius 
                    }}
                  >
                    <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.colors.primary }} />
                    <div className="text-[10px] text-slate-800 font-medium leading-relaxed">
                      <strong>Khuyến cáo đầu tư:</strong> Chính quyền xã đang áp dụng cơ chế đặc thù ưu đãi hỗ trợ 100% thủ tục đăng ký kinh doanh và chuyển giao công nghệ cho doanh nghiệp đầu tư vào lĩnh vực chế biến sản phẩm nông lâm nghiệp tại địa phương.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 
            6. MOCK FOOTER
          */}
          {config.layout.footerStyle === "standard" && (
            <div
              className="w-full py-5 px-4 text-white text-left font-sans flex flex-col sm:flex-row justify-between items-start gap-4 border-t"
              style={{
                backgroundColor: config.colors.primary,
                borderColor: config.colors.primaryHover
              }}
            >
              <div className="flex-1 flex flex-col gap-1.5 max-w-md">
                <h4 className="text-[11px] font-black uppercase text-yellow-300 font-serif">
                  ỦY BAN NHÂN DÂN XÃ DANG KANG
                </h4>
                <p className="text-[9px] text-white/90 leading-tight flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-white/70 shrink-0 mt-0.5" />
                  Địa chỉ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk.
                </p>
                <p className="text-[9px] text-white/90 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-white/77 shrink-0" />
                  Hotline: 0262.3812.345 | Fax: 0262.3812.346
                </p>
                <p className="text-[9px] text-white/90 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-white/77 shrink-0" />
                  Email: xadangkang@krongbong.daklak.gov.vn
                </p>
              </div>
              <div className="text-[8px] text-white/70 self-end sm:text-right flex flex-col gap-0.5 shrink-0 font-sans">
                <span>© 2026 Bản quyền thuộc UBND Xã Dang Kang.</span>
                <span>Thiết kế & phát triển: Hệ thống Quản trị CMS.</span>
              </div>
            </div>
          )}

          {config.layout.footerStyle === "corporate" && (
            <div className="w-full bg-[#1e293b] text-slate-300 py-6 px-4 text-[10px] font-sans flex flex-col gap-4 text-left border-t border-slate-700">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-white border-b border-slate-700 pb-1 uppercase text-[9px] tracking-wider" style={{ color: config.colors.primary }}>Thông tin liên hệ</span>
                  <span className="leading-snug">Địa chỉ: Thôn 6, xã Dang Kang</span>
                  <span>Điện thoại: 0262.3812.345</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-white border-b border-slate-700 pb-1 uppercase text-[9px] tracking-wider" style={{ color: config.colors.primary }}>Dịch vụ trực tuyến</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => setPreviewPage("category")}>Thủ tục hành chính</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => setPreviewPage("post")}>Hỏi đáp công dân</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-white border-b border-slate-700 pb-1 uppercase text-[9px] tracking-wider" style={{ color: config.colors.primary }}>Cổng thông tin liên kết</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => setPreviewPage("home")}>UBND Huyện Krông Bông</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => setPreviewPage("home")}>Tỉnh Đắk Lắk</span>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-[8px] text-slate-500">
                <span>© 2026 UBND Xã Dang Kang</span>
                <span>Powered by Government Core CMS</span>
              </div>
            </div>
          )}

          {config.layout.footerStyle === "simple" && (
            <div className="w-full bg-slate-900 text-slate-400 py-4 px-4 text-[9px] text-center font-sans border-t border-slate-800">
              <p className="font-bold text-white">ỦY BAN NHÂN DÂN XÃ DANG KANG</p>
              <p className="mt-1">Địa chỉ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk.</p>
              <p className="text-[8px] text-slate-500 mt-2">© 2026 Bản quyền chính thức. Bảo lưu mọi quyền.</p>
            </div>
          )}

        </div>

        {/* Informative tips */}
        <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-lg text-slate-600 text-[11px] leading-relaxed text-left flex gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-700 mb-0.5">Mẹo tùy chỉnh Giao diện:</span>
            Bạn có thể thử nghiệm các chế độ xem thử bằng bộ chuyển tab (**Trang chủ**, **Chi tiết bài viết**, **Chuyên mục tin**, **Giới thiệu tĩnh**) hoặc click trực tiếp vào thanh Menu điều hướng của website mô phỏng. Sự thay đổi về màu sắc chủ đạo, font chữ và bo góc sẽ được áp dụng ngay lập tức giúp bạn đánh giá tính đồng bộ thiết kế một cách toàn diện nhất trước khi lưu.
          </div>
        </div>
      </div>
    </div>
  );
}
