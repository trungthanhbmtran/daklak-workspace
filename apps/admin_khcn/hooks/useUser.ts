"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";

const API_BASE = "/auth";

export function useUser() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const result: any = await apiClient.get(`${API_BASE}/me`);
        return result; // axiosInstance already unwraps response.data and result.data
      } catch (error: any) {
        if (error.response?.status === 401) return null;
        throw error;
      }
    },
  });

  return { user, isLoading, isError };
}
