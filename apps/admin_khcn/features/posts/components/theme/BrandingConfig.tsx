"use client";

import React from "react";
import { FileImage, UploadCloud, Loader2, X } from "lucide-react";
import { useThemeConfig } from "./ThemeProvider";
import { useImageUpload } from "../../hooks/useImageUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BrandingConfig() {
    const { branding, setBranding } = useThemeConfig();

    // 1. Logo Upload Hook
    const {
        isUploading: isUploadingLogo,
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
                    <FileImage className="w-4 h-4 text-blue-500" />
                    Logo Cơ quan (Logo URL)
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center bg-slate-50/50 dark:bg-slate-800/50 relative">
                    {branding.logo ? (
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src={branding.logo}
                                alt="Logo Preview"
                                className="h-16 object-contain max-w-xs bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-sm"
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
                            <UploadCloud className="w-8 h-8 text-slate-400 animate-pulse" />
                            <span className="text-xs text-slate-500 font-medium">Bấm để tải Logo chính thức lên</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                disabled={isUploadingLogo}
                            />
                            {isUploadingLogo && (
                                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên...
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Logo hiển thị ở Header của trang chủ (khuyên dùng định dạng PNG trong suốt, chiều cao ~80px).</p>
            </div>

            {/* Favicon Upload Section */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                    <FileImage className="w-4 h-4 text-emerald-500" />
                    Biểu tượng trang (Favicon)
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center bg-slate-50/50 dark:bg-slate-800/50 relative">
                    {branding.favicon ? (
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src={branding.favicon}
                                alt="Favicon Preview"
                                className="h-10 w-10 object-contain bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded shadow-sm"
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
                            <UploadCloud className="w-6 h-6 text-slate-400 animate-pulse" />
                            <span className="text-[11px] text-slate-500 font-medium">Bấm tải Favicon lên</span>
                            <input
                                type="file"
                                accept="image/x-icon, image/png, image/jpeg"
                                onChange={handleFaviconUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                disabled={isUploadingFavicon}
                            />
                            {isUploadingFavicon && (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Tải lên...
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Favicon là biểu tượng nhỏ trên tab trình duyệt (Khuyên dùng hình vuông, 32x32px hoặc 64x64px).</p>
            </div>
        </div>
    );
}
