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

export function usePublicPortalMenus() {
  return useQuery({
    queryKey: ["public-portal-menus"],
    queryFn: async () => {
      const response = await apiClient.get("/public/portal-menus");
      return response;
    },
  });
}
