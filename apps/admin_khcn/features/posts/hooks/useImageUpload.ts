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

      // 1. Request presigned URL
      console.log("📤 Requesting upload URL for:", data.originalName);
      const res: any = await apiClient.post("/media/request-upload", {
        originalName: data.originalName,
        mimeType: compressed.type,
        size: compressed.size,
      });

      const uploadInfo = res.data;
      console.log("🔗 Received Upload URL:", uploadInfo.uploadUrl);
      console.log("📄 File ID:", uploadInfo.fileId);

      // 2. Perform direct upload to MinIO/Nginx
      console.log("🚀 Starting physical upload to storage...");
      await axios.put(uploadInfo.uploadUrl, compressed, { 
        headers: { "Content-Type": compressed.type } 
      });
      console.log("✅ Physical upload completed.");

      // 3. Confirm with Media Service
      console.log("🔄 Confirming upload with server...");
      const confirmRes: any = await apiClient.post("/media/confirm-upload", { fileId: uploadInfo.fileId });
      const conf = confirmRes.data;

      console.log("✨ Upload fully confirmed. Download URL:", conf.downloadUrl);
      setPreviewUrl(conf.downloadUrl);
      options?.onSuccess?.(uploadInfo.fileId);
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Status:", error.response.status);
      }
      alert("Lỗi tải ảnh. Xem console để biết chi tiết.");
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, previewUrl, handleImageUpload, removeImage: () => { setPreviewUrl(null); options?.onRemove?.(); } };
};
