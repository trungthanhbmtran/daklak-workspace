import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";

export const SYSTEM_CONFIGS_KEYS = {
  all: ["system-configs"] as const,
};

export function useGetSystemConfigs() {
  return useQuery({
    queryKey: SYSTEM_CONFIGS_KEYS.all,
    queryFn: async () => {
      const res = await apiClient.get("/system-configs") as any;
      // res là ApiResponse<config[]> — kiểm tra res.success (không phải res.status)
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

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
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
