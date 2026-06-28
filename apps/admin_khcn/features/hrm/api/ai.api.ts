import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export const aiApi = {
  /**
   * Truy vấn trạng thái của một AI Job đang chạy trong Background.
   * Trả về entity job (đã bóc .data).
   */
  async getAiJobStatus(jobId: string): Promise<any> {
    const res = await apiClient.get(`/ai/jobs/${jobId}`) as any as ApiResponse<any>;
    if (res.success) return res.data;
    throw new Error(res.message || "Lỗi khi truy vấn trạng thái AI Job");
  },

  /**
   * Yêu cầu Backend xử lý một chức năng AI bất kỳ.
   * Backend sẽ trả về jobId.
   */
  async requestAiExecution(action: string, payload: any): Promise<any> {
    const res = await apiClient.post(`/ai/execute`, { action, payload }) as any as ApiResponse<any>;
    if (!res.success) {
      throw new Error(res.message || "Lỗi khi gọi AI");
    }
    // Trả về object chứa jobId
    return res.data;
  },
};

