import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";

export function usePublicPosts(query?: Record<string, any>) {
  return useQuery({
    queryKey: ["public-posts", query],
    queryFn: async () => {
      const response = await apiClient.get("/public/posts", { params: query });
      return response;
    },
  });
}

export function usePublicPostBySlug(slug: string) {
  return useQuery({
    queryKey: ["public-post-slug", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/public/posts/slug/${slug}`);
      return response;
    },
    enabled: !!slug,
  });
}

export function usePublicPostById(id: string) {
  return useQuery({
    queryKey: ["public-post-id", id],
    queryFn: async () => {
      const response = await apiClient.get(`/public/posts/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

export function usePublicPortalMenus() {
  return useQuery({
    queryKey: ["public-portal-menus"],
    queryFn: async () => {
      const response = await apiClient.get("/public/portal-menus");
      return response;
    },
  });
}

export function usePublicProcedures(query?: { search?: string; category?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["public-procedures", query],
    queryFn: async () => {
      const response = await apiClient.get("/public/documents/procedures", { params: query });
      return response;
    },
  });
}

export function usePublicDossier(code: string) {
  return useQuery({
    queryKey: ["public-dossier", code],
    queryFn: async () => {
      const response = await apiClient.get(`/public/documents/dossiers/${code}`);
      return response;
    },
    enabled: !!code,
    retry: false,
  });
}
