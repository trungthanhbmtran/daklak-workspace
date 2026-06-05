// features/posts/api.ts
// Tất cả API calls trả về ApiResponse thẳng từ interceptor axiosInstance.
// Interceptor đã bóc lớp Axios → client nhận { success, data, meta, message }.
// Consumer đọc res.data cho entity, res.meta cho pagination.

import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";
import { Post, Category, Banner, PortalMenu, Comment, CitizenQuestion, CitizenFeedback } from "./types";

export const postsApi = {
  // ─── Posts ────────────────────────────────────────────────
  getPosts: (params: any): Promise<ApiResponse<Post[]>> =>
    apiClient.get("/posts", { params }) as any,

  getPost: (id: string): Promise<ApiResponse<Post>> =>
    apiClient.get(`/posts/${id}`) as any,

  createPost: (data: any): Promise<ApiResponse<Post>> =>
    apiClient.post("/posts", data) as any,

  updatePost: (id: string, data: any): Promise<ApiResponse<Post>> =>
    apiClient.put(`/posts/${id}`, data) as any,

  deletePost: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/posts/${id}`) as any,

  reviewPost: (id: string, data: { note?: string }): Promise<ApiResponse<Post>> =>
    apiClient.post(`/posts/${id}/review`, data) as any,

  submitPost: (id: string, data: { note?: string }): Promise<ApiResponse<Post>> =>
    apiClient.post(`/posts/${id}/submit`, data) as any,

  approvePost: (id: string, data: { note?: string }): Promise<ApiResponse<Post>> =>
    apiClient.post(`/posts/${id}/approve`, data) as any,

  rejectPost: (id: string, data: { note?: string }): Promise<ApiResponse<Post>> =>
    apiClient.post(`/posts/${id}/reject`, data) as any,

  publishPost: (id: string, data: { note?: string }): Promise<ApiResponse<Post>> =>
    apiClient.post(`/posts/${id}/publish`, data) as any,

  unpublishPost: (id: string, data: { note?: string }): Promise<ApiResponse<Post>> =>
    apiClient.post(`/posts/${id}/unpublish`, data) as any,

  getPostHistory: (id: string): Promise<ApiResponse<any[]>> =>
    apiClient.get(`/posts/${id}/history`) as any,

  // ─── Categories ───────────────────────────────────────────
  getCategories: (params?: any): Promise<ApiResponse<Category[]>> =>
    apiClient.get("/posts/categories", { params }) as any,

  getCategory: (id: string): Promise<ApiResponse<Category>> =>
    apiClient.get(`/posts/categories/${id}`) as any,

  createCategory: (data: any): Promise<ApiResponse<Category>> =>
    apiClient.post("/posts/categories", data) as any,

  updateCategory: (id: string, data: any): Promise<ApiResponse<Category>> =>
    apiClient.put(`/posts/categories/${id}`, data) as any,

  deleteCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/posts/categories/${id}`) as any,

  // ─── Banners ──────────────────────────────────────────────
  getBanners: (params?: any): Promise<ApiResponse<Banner[]>> =>
    apiClient.get("/banners", { params }) as any,

  getBanner: (id: string): Promise<ApiResponse<Banner>> =>
    apiClient.get(`/banners/${id}`) as any,

  createBanner: (data: any): Promise<ApiResponse<Banner>> =>
    apiClient.post("/banners", data) as any,

  updateBanner: (id: string, data: any): Promise<ApiResponse<Banner>> =>
    apiClient.put(`/banners/${id}`, data) as any,

  deleteBanner: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/banners/${id}`) as any,

  // ─── Portal Menus ─────────────────────────────────────────
  getPortalMenus: (params?: any): Promise<ApiResponse<PortalMenu[]>> =>
    apiClient.get("/portal-menus", { params }) as any,

  createPortalMenu: (data: any): Promise<ApiResponse<PortalMenu>> =>
    apiClient.post("/portal-menus", data) as any,

  updatePortalMenu: (id: string, data: any): Promise<ApiResponse<PortalMenu>> =>
    apiClient.put(`/portal-menus/${id}`, data) as any,

  deletePortalMenu: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/portal-menus/${id}`) as any,

  getQuickSetupData: (): Promise<ApiResponse<any>> =>
    apiClient.get("/portal-menus/quick-setup") as any,

  // ─── Interactions - Comments ──────────────────────────────
  getComments: (params: any): Promise<ApiResponse<Comment[]>> =>
    apiClient.get("/interactions/comments", { params }) as any,

  updateCommentStatus: (id: string, status: string): Promise<ApiResponse<Comment>> =>
    apiClient.put(`/interactions/comments/${id}/status`, { status }) as any,

  deleteComment: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/interactions/comments/${id}`) as any,

  // ─── Interactions - Questions ─────────────────────────────
  getQuestions: (params: any): Promise<ApiResponse<CitizenQuestion[]>> =>
    apiClient.get("/interactions/questions", { params }) as any,

  answerQuestion: (id: string, data: any): Promise<ApiResponse<CitizenQuestion>> =>
    apiClient.post(`/interactions/questions/${id}/answer`, data) as any,

  getQuestion: (id: string): Promise<ApiResponse<CitizenQuestion>> =>
    apiClient.get(`/interactions/questions/${id}`) as any,

  // ─── Interactions - Feedbacks ─────────────────────────────
  getFeedbacks: (params: any): Promise<ApiResponse<CitizenFeedback[]>> =>
    apiClient.get("/interactions/feedbacks", { params }) as any,

  updateFeedbackStatus: (id: string, status: string): Promise<ApiResponse<CitizenFeedback>> =>
    apiClient.put(`/interactions/feedbacks/${id}/status`, { status }) as any,

  // ─── Tags ─────────────────────────────────────────────────
  getTags: (params?: any): Promise<ApiResponse<any[]>> =>
    apiClient.get("/posts/tags", { params }) as any,

  createTag: (data: any): Promise<ApiResponse<any>> =>
    apiClient.post("/posts/tags", data) as any,

  /**
   * Thống kê bài viết — backend tính sẵn.
   * Thay thế pattern fetch limit:1000 để đếm client-side.
   */
  getPostStats: (params?: { categoryId?: string; authorId?: string }): Promise<ApiResponse<{
    total: number; published: number; draft: number; pending: number;
    reviewing: number; rejected: number; totalViews: number;
  }>> =>
    apiClient.get("/posts/stats", { params }) as any,

  // ─── Translation (with built-in Polling) ──────────────────
  translate: async (text: string, targetLang: string): Promise<any> => {
    // 1. Submit translation job
    const initRes = await apiClient.post("/translate", { text, targetLang }) as any;

    // Check if backend returned the translation directly (non-async fallback)
    if (initRes.data?.translated_text) {
      return initRes.data;
    }

    // 2. Extract jobId from new async format
    const jobId = initRes.data?.jobId;
    if (!jobId) {
      throw new Error("Không thể khởi tạo tiến trình dịch thuật.");
    }

    // 3. Start polling
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const maxRetries = 30;
    let retries = 0;

    while (retries < maxRetries) {
      await delay(2000);
      try {
        const statusRes = await apiClient.get(`/translate/jobs/${jobId}`) as any;
        const jobStatus = statusRes.data;

        if (jobStatus.status === 'COMPLETED') {
          return jobStatus.result || jobStatus.data;
        } else if (jobStatus.status === 'FAILED') {
          throw new Error(jobStatus.error || "Lỗi trong quá trình dịch thuật");
        }
        retries++;
      } catch (err) {
        console.warn("Polling translate error", err);
        retries++;
      }
    }

    throw new Error("Quá thời gian chờ dịch thuật (Timeout).");
  },
};
