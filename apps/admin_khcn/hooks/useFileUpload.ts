import { useState } from "react";
import axios from "axios";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

interface UploadOptions {
  onSuccess?: (fileInfo: any) => void;
  onError?: (error: any) => void;
  onProgress?: (percent: number) => void;
}

export const useFileUpload = (options?: UploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (rawFile: File) => {
    if (!rawFile) return;

    setIsUploading(true);
    setProgress(0);

    try {
      let file = rawFile;
      // Nếu là ảnh (không phải svg), nén ảnh trước khi upload
      if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
        try {
          file = await imageCompression(rawFile, {
            maxSizeMB: 1, // Kích thước tối đa 1MB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "image/webp",
          });
        } catch (error) {
          console.warn("Lỗi nén ảnh, sử dụng ảnh gốc:", error);
        }
      }

      // 1. Request Upload URL and fileId
      const originalName = file.type === "image/webp" 
        ? file.name.replace(/\.[^/.]+$/, ".webp") 
        : file.name;

      const res: any = await apiClient.post("/media/request-upload", {
        originalName,
        mimeType: file.type,
        size: file.size,
      });

      // apiClient returns response.data directly due to interceptor
      const uploadInfo = res.data;
      if (!uploadInfo || !uploadInfo.uploadUrl) {
        throw new Error("Không lấy được link upload từ server");
      }

      // 2. Direct upload to MinIO via PUT
      // Use standard axios to avoid base URL and interceptors of apiClient
      await axios.put(uploadInfo.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
            options?.onProgress?.(percent);
          }
        },
      });

      // 3. Confirm upload
      const confirmRes: any = await apiClient.post("/media/confirm-upload", {
        fileId: uploadInfo.fileId,
      });

      const fileData = confirmRes.data;
      toast.success(`Tải lên thành công: ${file.name}`);
      options?.onSuccess?.(fileData);

      return fileData;
    } catch (error: any) {
      console.error("Upload error:", error);
      const msg = error.response?.data?.message || "Lỗi tải tệp tin";
      toast.error(msg);
      options?.onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
  };
};
