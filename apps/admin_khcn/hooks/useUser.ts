"use client";

import { useQuery } from "@tanstack/react-query";

const API_BASE = "/api/v1/admin/auth";

export function useUser() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/me`);
      if (!response.ok) {
         if (response.status === 401) return null;
         throw new Error("Failed to fetch user");
      }
      return response.json();
    },
  });

  return { user, isLoading, isError };
}
