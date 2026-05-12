// features/posts/api.ts

import apiClient from "@/lib/axiosInstance";
import { Post, Category, Banner, PortalMenu, Comment, CitizenQuestion, CitizenFeedback } from "./types";

export const postsApi = {
  // Posts
  getPosts: (params: any) =>
    apiClient.get("/posts", { params }).then((res: any) => ({
      data: res.data,
      meta: res.meta,
    })),
  getPost: (id: string) => apiClient.get(`/posts/${id}`).then((res: any) => res.data),
  createPost: (data: any) => apiClient.post("/posts", data).then((res: any) => res.data),
  updatePost: (id: string, data: any) =>
    apiClient.put(`/posts/${id}`, data).then((res: any) => res.data),
  deletePost: (id: string) => apiClient.delete(`/posts/${id}`).then((res: any) => res.data),
  reviewPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/review`, data).then((res: any) => res.data),
  submitPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/submit`, data).then((res: any) => res.data),
  approvePost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/approve`, data).then((res: any) => res.data),
  rejectPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/reject`, data).then((res: any) => res.data),
  publishPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/publish`, data).then((res: any) => res.data),
  unpublishPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/unpublish`, data).then((res: any) => res.data),
  getPostHistory: (id: string) =>
    apiClient.get(`/posts/${id}/history`).then((res: any) => res.data),

  // Categories
  getCategories: (params?: any) =>
    apiClient.get("/posts/categories", { params }).then((res: any) => ({
      data: res.data,
      meta: res.meta,
    })),
  getCategory: (id: string) =>
    apiClient.get(`/posts/categories/${id}`).then((res: any) => res.data),
  createCategory: (data: any) =>
    apiClient.post("/posts/categories", data).then((res: any) => res.data),
  updateCategory: (id: string, data: any) =>
    apiClient.put(`/posts/categories/${id}`, data).then((res: any) => res.data),
  deleteCategory: (id: string) =>
    apiClient.delete(`/posts/categories/${id}`).then((res: any) => res.data),

  // Banners
  getBanners: (params?: any) =>
    apiClient.get("/banners", { params }).then((res: any) => ({
      data: res.data,
      meta: res.meta,
    })),
  getBanner: (id: string) => apiClient.get(`/banners/${id}`).then((res: any) => res.data),
  createBanner: (data: any) =>
    apiClient.post("/banners", data).then((res: any) => res.data),
  updateBanner: (id: string, data: any) =>
    apiClient.put(`/banners/${id}`, data).then((res: any) => res.data),
  deleteBanner: (id: string) =>
    apiClient.delete(`/banners/${id}`).then((res: any) => res.data),

  // Portal Menus
  getPortalMenus: (params?: any) =>
    apiClient.get("/portal-menus", { params }).then((res: any) => res.data),
  createPortalMenu: (data: any) =>
    apiClient.post("/portal-menus", data).then((res: any) => res.data),
  updatePortalMenu: (id: string, data: any) =>
    apiClient.put(`/portal-menus/${id}`, data).then((res: any) => res.data),
  deletePortalMenu: (id: string) =>
    apiClient.delete(`/portal-menus/${id}`).then((res: any) => res.data),
  getQuickSetupData: () =>
    apiClient.get("/portal-menus/quick-setup").then((res: any) => res.data),

  // Interactions - Comments
  getComments: (params: any) =>
    apiClient.get("/interactions/comments", { params }).then((res: any) => ({
      data: res.data,
      meta: res.meta,
    })),
  updateCommentStatus: (id: string, status: string) =>
    apiClient.put(`/interactions/comments/${id}/status`, { status }).then((res: any) => res.data),
  deleteComment: (id: string) =>
    apiClient.delete(`/interactions/comments/${id}`).then((res: any) => res.data),

  // Interactions - Questions
  getQuestions: (params: any) =>
    apiClient.get("/interactions/questions", { params }).then((res: any) => ({
      data: res.data,
      meta: res.meta,
    })),
  answerQuestion: (id: string, data: any) =>
    apiClient.post(`/interactions/questions/${id}/answer`, data).then((res: any) => res.data),
  getQuestion: (id: string) =>
    apiClient.get(`/interactions/questions/${id}`).then((res: any) => res.data),

  // Interactions - Feedbacks
  getFeedbacks: (params: any) =>
    apiClient.get("/interactions/feedbacks", { params }).then((res: any) => ({
      data: res.data,
      meta: res.meta,
    })),
  updateFeedbackStatus: (id: string, status: string) =>
    apiClient.put(`/interactions/feedbacks/${id}/status`, { status }).then((res: any) => res.data),

  // Tags
  getTags: (params?: any) =>
    apiClient.get("/posts/tags", { params }).then((res: any) => res.data),
  createTag: (data: any) =>
    apiClient.post("/posts/tags", data).then((res: any) => res.data),

  // Translation
  translate: (text: string, targetLang: string) =>
    apiClient.post("/admin/translate", { text, targetLang }).then((res: any) => res.data),

};
