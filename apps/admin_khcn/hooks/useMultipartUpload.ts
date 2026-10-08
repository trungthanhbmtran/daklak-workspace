import { useState } from 'react';
// Giả sử dùng apiClient cho API nội bộ
import apiClient from "@/lib/axiosInstance";

// Hằng số S3: Cắt mỗi cục 5MB
const CHUNK_SIZE = 5 * 1024 * 1024;

export const useMultipartUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadLargeFile = async (rawFile: File) => {
    if (!rawFile) return;

    setIsUploading(true);
    setProgress(0);

    try {
      let file = rawFile;
      // Nén ảnh nếu là định dạng ảnh, trừ SVG
      if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
        try {
          const imageCompression = (await import("browser-image-compression")).default;
          file = await imageCompression(rawFile, {
            maxSizeMB: 5, // Với multipart upload thường là file lớn, nén với mức giới hạn cao hơn
            maxWidthOrHeight: 2560,
            useWebWorker: true,
            fileType: "image/webp",
          });
        } catch (error) {
          console.warn("Lỗi nén ảnh, sử dụng ảnh gốc:", error);
        }
      }

      const originalName = file.type === "image/webp" 
        ? file.name.replace(/\.[^/.]+$/, ".webp") 
        : file.name;

      // BƯỚC 1: Gọi Gateway xin mở phiên Upload
      const { data: initData } = await apiClient.post('/media/init-multipart-upload', {
        originalName,
        mimeType: file.type,
        size: file.size,
      });

      const { uploadId, fileKey, fileId } = initData;

      // BƯỚC 2: Tính số cục cần cắt và xin Link MinIO
      const partsCount = Math.ceil(file.size / CHUNK_SIZE);
      const { data: urlsData } = await apiClient.post('/media/get-multipart-pre-signed-urls', {
        fileKey,
        uploadId,
        partsCount,
      });

      const presignedUrls: string[] = urlsData.presignedUrls;
      let completedParts = 0;

      // BƯỚC 3: Cắt file và bắn phá song song lên MinIO
      // Dùng fetch (không dùng api instance) để tránh việc vô tình gửi kèm Token JWT lên MinIO gây lỗi CORS/Auth
      const uploadPromises = presignedUrls.map(async (url, index) => {
        const start = index * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const response = await fetch(url, {
          method: 'PUT',
          body: chunk,
        });

        // MinIO trả về một cái tem (ETag) nằm trong Headers
        const eTag = response.headers.get('etag');

        // Cập nhật thanh tiến độ
        completedParts++;
        setProgress(Math.round((completedParts / partsCount) * 100));

        return {
          PartNumber: index + 1,
          ETag: eTag,
        };
      });

      // Chờ cho TẤT CẢ các cục chunk bay lên MinIO thành công
      const uploadedParts = await Promise.all(uploadPromises);

      // BƯỚC 4: Báo cáo với Gateway là "Hàng đã lên đủ, chốt sổ!"
      const { data: completeData } = await apiClient.post('/media/complete-multipart-upload', {
        fileId,
        fileKey,
        uploadId,
        parts: uploadedParts,
      });

      setIsUploading(false);

      // Trả về thông tin file hoàn chỉnh (có kèm downloadUrl)
      return completeData;

    } catch (error) {
      console.error('Lỗi quá trình Multipart Upload:', error);
      setIsUploading(false);
      setProgress(0);
      throw error;
    }
  };

  return { uploadLargeFile, isUploading, progress };
};
