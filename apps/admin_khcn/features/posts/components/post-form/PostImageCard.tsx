import { useRef, useState } from "react";
import { ImagePlus, Maximize2, UploadCloud, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { useFormContext } from "react-hook-form";
import { useImageUpload } from "../../hooks/useImageUpload";

export function PostImageCard() {
  const { getValues, setValue } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFullImage, setShowFullImage] = useState(false);

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (id) => setValue("thumbnail", id, { shouldDirty: true }),
    onRemove: () => setValue("thumbnail", "", { shouldDirty: true })
  });

  const thumbnailUrl = getValues("thumbnail");
  const displayUrl = previewUrl || (thumbnailUrl ? `/api/v1/admin/media/download/${thumbnailUrl}` : '');

  return (
    <>
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-5 border-b bg-muted/80">
          <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-blue-600" /> Ảnh bài viết
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          {isUploading ? (
            <div className="aspect-video border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : displayUrl ? (
            <div className="relative group rounded-xl overflow-hidden border shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} className="w-full aspect-video object-cover" alt="Thumbnail" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <Button type="button" variant="secondary" size="icon" onClick={() => setShowFullImage(true)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="h-4 w-4 mr-2" /> Đổi ảnh
                </Button>
                <Button type="button" variant="destructive" size="icon" onClick={removeImage}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-xl flex flex-col items-center justify-center cursor-pointer group">
              <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-2">
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <Text as="span" className="text-[13px] font-semibold text-muted-foreground">Tải lên ảnh tiêu đề</Text>
            </div>
          )}
        </CardContent>
      </Card>

      {showFullImage && displayUrl && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm" onClick={() => setShowFullImage(false)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayUrl} className="w-full h-auto max-h-[85vh] object-contain rounded-lg border border-white/20" alt="Full" />
            <Button type="button" variant="ghost" size="icon" className="absolute -top-12 right-0 text-white hover:bg-white/10" onClick={() => setShowFullImage(false)}>
              <X className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
