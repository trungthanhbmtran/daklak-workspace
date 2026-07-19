import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useRef } from "react";
import { Text } from "@/components/ui/typography";


interface BannerImageUploadProps {
  form: UseFormReturn<any>;
}

export function BannerImageUpload({ form }: BannerImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (id) => {
      form.setValue("imageUrl", id, { shouldValidate: true, shouldDirty: true });
    },
    onRemove: () => {
      form.setValue("imageUrl", "", { shouldValidate: true, shouldDirty: true });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  });

  const imageUrlValue = form.watch("imageUrl");

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-5 border-b bg-slate-50/80">
        <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-blue-600" /> Ảnh Banner
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        {isUploading ? (
          <div className="aspect-21/9 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : (previewUrl || imageUrlValue) ? (
          <div className="relative group rounded-xl overflow-hidden border shadow-inner">
            <img
              src={previewUrl || (imageUrlValue?.startsWith('http') ? imageUrlValue : `/api/v1/admin/media/download/${imageUrlValue}`)}
              className="w-full aspect-21/9 object-cover"
              alt="Banner"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>Thay đổi</Button>
              <Button type="button" variant="destructive" size="icon" onClick={removeImage}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-21/9 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group"
          >
            <ImagePlus className="h-8 w-8 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
            <Text as="span" className="text-[13px] font-semibold text-slate-500">Tải lên ảnh Banner</Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
