// features/posts/api.ts

import apiClient from "@/lib/axiosInstance";
import { Post, Category, Banner, PostStatus } from "./types";

export const postsApi = {
  // Posts
  getPosts: (params: any) => apiClient.get("/admin/posts", { params }),
  getPost: (id: string) => apiClient.get(`/admin/posts/${id}`),
  createPost: (data: any) => apiClient.post("/admin/posts", data),
  updatePost: (id: string, data: any) => apiClient.put(`/admin/posts/${id}`, data),
  deletePost: (id: string) => apiClient.delete(`/admin/posts/${id}`),
  reviewPost: (id: string, data: { status: PostStatus; moderationNote?: string }) =>
    apiClient.put(`/admin/posts/${id}/review`, data),

  // Categories
  getCategories: (params?: any) => apiClient.get("/posts/categories", { params }),
  getCategory: (id: string) => apiClient.get(`/posts/categories/${id}`),
  createCategory: (data: any) => apiClient.post("/posts/categories", data),
  updateCategory: (id: string, data: any) => apiClient.put(`/posts/categories/${id}`, data),
  deleteCategory: (id: string) => apiClient.delete(`/posts/categories/${id}`),

  // Banners
  getBanners: (params?: any) => apiClient.get("/admin/banners", { params }),
  getBanner: (id: string) => apiClient.get(`/admin/banners/${id}`),
  createBanner: (data: any) => apiClient.post("/admin/banners", data),
  updateBanner: (id: string, data: any) => apiClient.put(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => apiClient.delete(`/admin/banners/${id}`),
};
