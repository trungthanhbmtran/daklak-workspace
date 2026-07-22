"use client";

import React from "react";
import { FileImage, UploadCloud, Loader2, X } from "lucide-react";
import { useThemeConfig } from "./ThemeProvider";
import { useImageUpload } from "../../hooks/useImageUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";


export function BrandingConfig() {
    const { branding, setBranding } = useThemeConfig();

    // 1. Logo Upload Hook
    const {
        isUploading: isUploadingLogo,
        // eslint-disable-next-line unused-imports/no-unused-vars
        previewUrl: previewLogoUrl,
        handleImageUpload: handleLogoUpload,
        removeImage: removeLogoImage
    } = useImageUpload({
        onSuccess: (fileId) => {
            const url = `/api/v1/admin/media/download/${fileId}`;
            setBranding({ logo: url });
            toast.success("Tải logo thành công!");
        },
        onRemove: () => {
            setBranding({ logo: "" });
        }
    });

    // 2. Favicon Upload Hook
    const {
        isUploading: isUploadingFavicon,
        // eslint-disable-next-line unused-imports/no-unused-vars
        previewUrl: previewFaviconUrl,
        handleImageUpload: handleFaviconUpload,
        removeImage: removeFaviconImage
    } = useImageUpload({
        onSuccess: (fileId) => {
            const url = `/api/v1/admin/media/download/${fileId}`;
            setBranding({ favicon: url });
            toast.success("Tải favicon thành công!");
        },
        onRemove: () => {
            setBranding({ favicon: "" });
        }
    });

    return (
        <div className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                    <FileImage className="w-4 h-4 text-primary" />
                    Logo Cơ quan (Logo URL)
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center bg-slate-50/50 dark:bg-slate-800/50 relative">
                    {branding.logo ? (
                        <div className="flex flex-col items-center gap-3">
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={branding.logo}
                                alt="Logo Preview"
                                className="h-16 object-contain max-w-xs bg-card p-2 border border-slate-200 dark:border-slate-700 rounded shadow-sm"
                            />
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    removeLogoImage();
                                    setBranding({ logo: "" }); // Fallback clear
                                }}
                                className="text-xs font-bold h-8"
                            >
                                <X className="w-3.5 h-3.5 mr-1" /> Gỡ bỏ logo
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-3 select-none">
                            <UploadCloud className="w-8 h-8 text-muted-foreground animate-pulse" />
                            <Text as="span" className="text-muted-foreground font-medium">Bấm để tải Logo chính thức lên</Text>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                disabled={isUploadingLogo}
                            />
                            {isUploadingLogo && (
                                <Text as="span" className="text-[10px] text-primary font-bold flex items-center gap-1 mt-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên...
                                </Text>
                            )}
                        </div>
                    )}
                </div>
                <Text className="text-[10px] text-muted-foreground mt-1">Logo hiển thị ở Header của trang chủ (khuyên dùng định dạng PNG trong suốt, chiều cao ~80px).</Text>
            </div>

            {/* Favicon Upload Section */}
            <div className="space-y-2 border-t border-border pt-5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                    <FileImage className="w-4 h-4 text-emerald-500" />
                    Biểu tượng trang (Favicon)
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center bg-slate-50/50 dark:bg-slate-800/50 relative">
                    {branding.favicon ? (
                        <div className="flex flex-col items-center gap-3">
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={branding.favicon}
                                alt="Favicon Preview"
                                className="h-10 w-10 object-contain bg-card p-1 border border-slate-200 dark:border-slate-700 rounded shadow-sm"
                            />
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    removeFaviconImage();
                                    setBranding({ favicon: "" });
                                }}
                                className="text-xs font-bold h-8"
                            >
                                <X className="w-3.5 h-3.5 mr-1" /> Gỡ bỏ favicon
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-2 select-none">
                            <UploadCloud className="w-6 h-6 text-muted-foreground animate-pulse" />
                            <Text as="span" className="text-[11px] text-muted-foreground font-medium">Bấm tải Favicon lên</Text>
                            <input
                                type="file"
                                accept="image/x-icon, image/png, image/jpeg"
                                onChange={handleFaviconUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                disabled={isUploadingFavicon}
                            />
                            {isUploadingFavicon && (
                                <Text as="span" className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Tải lên...
                                </Text>
                            )}
                        </div>
                    )}
                </div>
                <Text className="text-[10px] text-muted-foreground mt-1">Favicon là biểu tượng nhỏ trên tab trình duyệt (Khuyên dùng hình vuông, 32x32px hoặc 64x64px).</Text>
            </div>
        </div>
    );
}
