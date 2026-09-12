/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";

export const USER_CONFIGS_KEYS = {
  all: ["user-configs"] as const,
};

export function useGetUserConfigs() {
  return useQuery({
    queryKey: USER_CONFIGS_KEYS.all,
    queryFn: async () => {
      const res = await apiClient.get("/user-configs") as any;
      if (res.success && Array.isArray(res.data)) {
        const map: Record<string, string> = {};
        res.data.forEach((c: any) => {
          map[c.key] = c.value;
        });
        return map;
      }
      return {};
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: async ({ key, value }: { key: string; value: string; }) => {
      const res = await apiClient.put("/user-configs", { key, value }) as any;
      if (!res.success) {
        throw new Error(res.message || "Failed to update config");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_CONFIGS_KEYS.all });
    },
  });
}
