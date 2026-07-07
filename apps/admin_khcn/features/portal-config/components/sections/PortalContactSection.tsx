"use client";

import React, { useRef } from "react";
import { AddressLicenseCard, CustomLabelsCard, ContactDetailsCard } from "../sub-components/PortalConfigCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, X, Loader2, UploadCloud } from "lucide-react";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import { useContactConfig } from "../hooks/useContactConfig";
import { toast } from "sonner";

export const PortalContactSection = ({ activeLangTab, isCompareMode, languages }: any) => {
  const {
    isLoading,
    isSaving,
    configTranslations,
    updateField,
    handleSave,
    mapUrl,
    setMapUrl,
  } = useContactConfig();

  const activeLangs = languages.length > 0 ? languages : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  const cardProps = (langCode: string) => ({
    langCode,
    activeLangs,
    trans: configTranslations[langCode] || {},
    isCompareMode,
    onUpdate: updateField,
  });

  const mapInputRef = useRef<HTMLInputElement>(null);

  const {
    isUploading: isUploadingMap,
    previewUrl: previewMapUrl,
    handleImageUpload: handleMapUpload,
    removeImage: removeMapImage
  } = useImageUpload({
    onSuccess: (fileId) => {
      setMapUrl(`/api/v1/admin/media/download/${fileId}`);
      toast.success("Tải bản đồ hành chính thành công!");
    },
    onRemove: () => {
      setMapUrl("");
    }
  });

  const activeMap = previewMapUrl || mapUrl;

  const resolveLogoUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    return `/api/v1/admin/media/download/${url}`;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu liên hệ...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {isCompareMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AddressLicenseCard {...cardProps("vi")} />
          <AddressLicenseCard {...cardProps("en")} />
        </div>
      ) : (
        <AddressLicenseCard {...cardProps(activeLangTab)} />
      )}

      {isCompareMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomLabelsCard {...cardProps("vi")} />
          <CustomLabelsCard {...cardProps("en")} />
        </div>
      ) : (
        <CustomLabelsCard {...cardProps(activeLangTab)} />
      )}

      {isCompareMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactDetailsCard {...cardProps("vi")} />
          <ContactDetailsCard {...cardProps("en")} />
        </div>
      ) : (
        <ContactDetailsCard {...cardProps(activeLangTab)} />
      )}

      {isCompareMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomLabelsCard {...cardProps("vi")} />
          <CustomLabelsCard {...cardProps("en")} />
        </div>
      ) : (
        <CustomLabelsCard {...cardProps(activeLangTab)} />
      )}

      <Card className="border border-border shadow-sm rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md bg-card">
        <CardHeader className="bg-muted/30 border-b border-border py-4 px-5">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-black text-foreground uppercase tracking-wider">
              Bản đồ Hành chính Đơn vị
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
              Hình ảnh Bản đồ hành chính
            </Label>
            <div className="flex items-start gap-4">
              <div className="border border-dashed border-border rounded-xl p-4 bg-muted/50 flex flex-col items-center justify-center text-center shrink-0 w-44 h-28 relative overflow-hidden group">
                {activeMap ? (
                  <>
                    <img
                      src={resolveLogoUrl(activeMap)}
                      alt="Administrative Map"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeMapImage()}
                        className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    {isUploadingMap ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-muted-foreground" />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider">Chưa có ảnh</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1 pt-1">
                <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                  Tải lên hình ảnh ranh giới phân vùng hành chính hoặc bản đồ địa giới của đơn vị. Hình ảnh này sẽ hiển thị trực quan trên Trang Liên hệ ở Cổng Dân Cư.
                </p>
                <input
                  type="file"
                  ref={mapInputRef}
                  onChange={handleMapUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingMap}
                    onClick={() => mapInputRef.current?.click()}
                    className="text-[10px] font-black uppercase tracking-wider border-input bg-background hover:bg-muted rounded-lg h-8"
                  >
                    Tải ảnh lên
                  </Button>
                  {activeMap && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMapImage()}
                      className="text-[10px] font-black uppercase tracking-wider rounded-lg h-8"
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
