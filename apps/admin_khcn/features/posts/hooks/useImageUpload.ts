import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import apiClient from "@/lib/axiosInstance";

export const useImageUpload = (options?: { onSuccess?: (id: string) => void; onRemove?: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, fileType: 'image/webp' });
      
      const { data: req } = await apiClient.post("/media/request-upload", {
        originalName: `thumb-${Date.now()}.webp`,
        mimeType: compressed.type,
        size: compressed.size,
      });

      await axios.put(req.uploadUrl, compressed, { headers: { "Content-Type": compressed.type } });
      const { data: conf } = await apiClient.post("/media/confirm-upload", { fileId: req.fileId });

      setPreviewUrl(conf.downloadUrl);
      options?.onSuccess?.(req.fileId);
    } catch (error) {
      alert("Lỗi tải ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, previewUrl, handleImageUpload, removeImage: () => { setPreviewUrl(null); options?.onRemove?.(); } };
};
