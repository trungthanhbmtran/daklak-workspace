/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import { toast } from "sonner";

export const SYSTEM_CONFIGS_KEYS = {
  all: ["system-configs"] as const,
};

export function useGetSystemConfigs() {
  return useQuery({
    queryKey: SYSTEM_CONFIGS_KEYS.all,
    queryFn: async () => {
      const res = await apiClient.get("/system-configs") as any;
      const data = unwrapData<any[]>(res, []);
      const map: Record<string, string> = {};
      data.forEach((c: any) => {
        map[c.key] = c.value;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      const res = await apiClient.put("/system-configs", { key, value, description }) as any;
      if (!res.success) {
        throw new Error(res.message || "Failed to update config");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_CONFIGS_KEYS.all });
    },
  });
}

export function useUpdateMultipleSystemConfigs() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: async (configs: { key: string; value: string; description?: string }[]) => {
      const promises = configs.map(c => apiClient.put("/system-configs", c));
      await Promise.all(promises);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_CONFIGS_KEYS.all });
    },
  });
}
