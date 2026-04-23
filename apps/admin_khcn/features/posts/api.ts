// features/posts/api.ts

import apiClient from "@/lib/axiosInstance";
import { Post, Category, Banner, PostStatus } from "./types";

/**
 * Helper để bóc tách dữ liệu từ Gateway response.
 * Gateway format: { success: true, data: { data: [...], meta: {...} }, timestamp }
 */
function unwrapData<T>(res: any): T {
  if (res?.data && typeof res.data === "object" && "data" in res.data) {
    return res.data.data as T;
  }
  return (res?.data ?? res) as T;
}

function unwrapMeta(res: any): any {
  return res?.data?.meta || res?.meta;
}

export const postsApi = {
  // Posts
  getPosts: (params: any) =>
    apiClient.get("/posts", { params }).then((res) => ({
      data: unwrapData<Post[]>(res),
      meta: unwrapMeta(res),
    })),
  getPost: (id: string) => apiClient.get(`/posts/${id}`).then((res) => unwrapData<Post>(res)),
  createPost: (data: any) => apiClient.post("/posts", data).then((res) => unwrapData<Post>(res)),
  updatePost: (id: string, data: any) =>
    apiClient.put(`/posts/${id}`, data).then((res) => unwrapData<Post>(res)),
  deletePost: (id: string) => apiClient.delete(`/posts/${id}`).then((res) => unwrapData<any>(res)),
  reviewPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/review`, data).then((res) => unwrapData<any>(res)),
  submitPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/submit`, data).then((res) => unwrapData<any>(res)),
  approvePost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/approve`, data).then((res) => unwrapData<any>(res)),
  rejectPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/reject`, data).then((res) => unwrapData<any>(res)),
  publishPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/publish`, data).then((res) => unwrapData<any>(res)),
  unpublishPost: (id: string, data: { note?: string }) =>
    apiClient.post(`/posts/${id}/unpublish`, data).then((res) => unwrapData<any>(res)),
  getPostHistory: (id: string) =>
    apiClient.get(`/posts/${id}/history`).then((res) => unwrapData<any[]>(res)),


  // Categories
  getCategories: (params?: any) =>
    apiClient.get("/posts/categories", { params }).then((res) => ({
      data: unwrapData<Category[]>(res),
      meta: unwrapMeta(res),
    })),
  getCategory: (id: string) =>
    apiClient.get(`/posts/categories/${id}`).then((res) => unwrapData<Category>(res)),
  createCategory: (data: any) =>
    apiClient.post("/posts/categories", data).then((res) => unwrapData<Category>(res)),
  updateCategory: (id: string, data: any) =>
    apiClient.put(`/posts/categories/${id}`, data).then((res) => unwrapData<Category>(res)),
  deleteCategory: (id: string) =>
    apiClient.delete(`/posts/categories/${id}`).then((res) => unwrapData<any>(res)),

  // Banners
  getBanners: (params?: any) =>
    apiClient.get("/banners", { params }).then((res) => ({
      data: unwrapData<Banner[]>(res),
      meta: unwrapMeta(res),
    })),
  getBanner: (id: string) => apiClient.get(`/banners/${id}`).then((res) => unwrapData<Banner>(res)),
  createBanner: (data: any) =>
    apiClient.post("/banners", data).then((res) => unwrapData<Banner>(res)),
  updateBanner: (id: string, data: any) =>
    apiClient.put(`/banners/${id}`, data).then((res) => unwrapData<Banner>(res)),
  deleteBanner: (id: string) =>
    apiClient.delete(`/banners/${id}`).then((res) => unwrapData<any>(res)),
};
