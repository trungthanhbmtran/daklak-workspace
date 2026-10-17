/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";

export const aiApi = {
  /**
   * Sinh văn bản bằng AI (trả về jobId)
   */
  async generateText(prompt: string): Promise<any> {
    const res: any = await apiClient.post(`/ai/generate`, { prompt });
    if (res?.success === false) {
      throw new Error(res.message || "Lỗi khi gọi AI sinh văn bản");
    }
    return unwrapData(res);
  },

  /**
   * Truy vấn trạng thái của một AI Job đang chạy trong Background.
   * Trả về entity job.
   */
  async getAiJobStatus(jobId: string): Promise<any> {
    const res: any = await apiClient.get(`/ai/jobs/${jobId}`);
    if (res?.success === false) {
      throw new Error(res.message || "Lỗi khi truy vấn trạng thái AI Job");
    }
    return unwrapData(res);
  },

  /**
   * Yêu cầu Backend xử lý một chức năng AI bất kỳ.
   * Backend sẽ trả về jobId.
   */
  async requestAiExecution(action: string, payload: any): Promise<any> {
    const res: any = await apiClient.post(`/ai/execute`, { action, payload });
    if (res?.success === false) {
      throw new Error(res.message || "Lỗi khi gọi AI");
    }
    return unwrapData(res);
  },
};

