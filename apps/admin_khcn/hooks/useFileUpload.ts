import { useState } from "react";
import axios from "axios";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";

interface UploadOptions {
  onSuccess?: (fileInfo: any) => void;
  onError?: (error: any) => void;
  onProgress?: (percent: number) => void;
}

export const useFileUpload = (options?: UploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      console.log("[useFileUpload] 1. Requesting upload URL for:", file.name);
      const res: any = await apiClient.post("/media/request-upload", {
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      console.log("[useFileUpload] Request upload response:", res);
      const uploadInfo = res.data;
      if (!uploadInfo || !uploadInfo.uploadUrl) {
        console.error("[useFileUpload] Missing uploadInfo or uploadUrl in response");
        throw new Error("Không lấy được link upload từ server");
      }

      console.log("[useFileUpload] 2. Direct upload to MinIO via PUT. URL:", uploadInfo.uploadUrl);
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

      console.log("[useFileUpload] 3. Confirming upload for fileId:", uploadInfo.fileId);
      const confirmRes: any = await apiClient.post("/media/confirm-upload", {
        fileId: uploadInfo.fileId,
      });

      console.log("[useFileUpload] Confirm upload response:", confirmRes);
      const fileData = confirmRes.data;
      toast.success(`Tải lên thành công: ${file.name}`);
      options?.onSuccess?.(fileData);
      
      return fileData;
    } catch (error: any) {
      console.error("[useFileUpload] Upload error details:", {
        message: error.message,
        name: error.name,
        code: error.code,
        config: error.config,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : "No response"
      });
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
