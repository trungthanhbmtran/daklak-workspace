import { useState } from 'react';
import axios from 'axios';
// Giả sử Mạnh đang dùng một instance axios có gắn sẵn token cho API nội bộ
import apiClient from "@/lib/axiosInstance"; 

// Hằng số S3: Cắt mỗi cục 5MB
const CHUNK_SIZE = 5 * 1024 * 1024; 

export const useMultipartUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadLargeFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      // BƯỚC 1: Gọi Gateway xin mở phiên Upload
      const { data: initData } = await apiClient.post('/media/init-multipart-upload', {
        originalName: file.name,
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
      // Lưu ý: Dùng axios gốc (không dùng api instance) để tránh việc vô tình gửi kèm Token JWT của Sở lên MinIO gây lỗi CORS/Auth
      const uploadPromises = presignedUrls.map(async (url, index) => {
        const start = index * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end); // Hàm cắt băm file của Javascript

        const response = await axios.put(url, chunk, {
          headers: { 
            // KHÔNG set Content-Type ở đây vì backend lúc tạo Part URL không ép kiểu
          }
        });

        // MinIO trả về một cái tem (ETag) nằm trong Headers
        const eTag = response.headers.etag;

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
