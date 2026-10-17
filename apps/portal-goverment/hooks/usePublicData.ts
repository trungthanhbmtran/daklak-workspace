/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";

export function usePublicPosts(query?: Record<string, any>) {
  return useQuery<any>({
    queryKey: ["public-posts", query],
    queryFn: async () => {
      const response = await apiClient.get("/public/posts", { params: query });
      return response;
    },
    select: (res) => unwrapData(res, []),
  });
}

export function usePublicPostBySlug(slug: string) {
  return useQuery<any>({
    queryKey: ["public-post-slug", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/public/posts/slug/${slug}`);
      return response;
    },
    enabled: !!slug,
    select: (res) => unwrapData(res, null),
  });
}

export function usePublicPostById(id: string) {
  return useQuery<any>({
    queryKey: ["public-post-id", id],
    queryFn: async () => {
      const response = await apiClient.get(`/public/posts/${id}`);
      return response;
    },
    enabled: !!id,
    select: (res) => unwrapData(res, null),
  });
}

export function usePublicPortalMenus() {
  return useQuery<any>({
    queryKey: ["public-portal-menus"],
    queryFn: async () => {
      const response = await apiClient.get("/public/portal-menus");
      return response;
    },
    select: (res) => unwrapData(res, []),
  });
}

export function usePublicProcedures(query?: { search?: string; category?: string; page?: number; limit?: number }) {
  return useQuery<any>({
    queryKey: ["public-procedures", query],
    queryFn: async () => {
      const response = await apiClient.get("/public/documents/procedures", { params: query });
      return response;
    },
    select: (res) => unwrapData(res, []),
  });
}

export function usePublicDossier(code: string) {
  return useQuery<any>({
    queryKey: ["public-dossier", code],
    queryFn: async () => {
      const response = await apiClient.get(`/public/documents/dossiers/${code}`);
      return response;
    },
    enabled: !!code,
    retry: false,
    select: (res) => unwrapData(res, null),
  });
}

export function usePublicDocuments(query?: { page?: number; limit?: number; search?: string; typeId?: string; fieldId?: string; status?: string; transparencyCategory?: string; fiscalYear?: number }) {
  return useQuery<any>({
    queryKey: ["public-documents", query],
    queryFn: async () => {
      const response = await apiClient.get("/public/documents", { params: query });
      return response;
    },
    select: (res) => unwrapData(res, []),
  });
}

export function usePublicDocumentById(id: string) {
  return useQuery<any>({
    queryKey: ["public-document", id],
    queryFn: async () => {
      const response = await apiClient.get(`/public/documents/${id}`);
      return response;
    },
    enabled: !!id,
    select: (res) => unwrapData(res, null),
  });
}
