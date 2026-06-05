"use client";

import { useCallback, useState } from "react";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";

/**
 * Hook để fetch danh sách model từ AI provider.
 * Đây là action call (POST), không phải data query
 * nên dùng useState + useCallback thay vì useMutation.
 */
export function useAiFetchModels() {
  const [fetchedModels, setFetchedModels] = useState<Record<string, string[]>>({});
  const [isFetching, setIsFetching] = useState<Record<string, boolean>>({});

  const fetchModels = useCallback(
    async (providerId: string, providerType: string, apiKey: string) => {
      if (!apiKey) {
        toast.error("Vui lòng nhập API Key trước khi tải danh sách Model!");
        return;
      }

      setIsFetching(prev => ({ ...prev, [providerId]: true }));
      try {
        const res = await apiClient.post("/ai/models", { provider: providerType, apiKey }) as any;
        if (res.success) {
          setFetchedModels(prev => ({ ...prev, [providerId]: res.data }));
          toast.success(`Đã tải ${res.data.length} model từ ${providerType}!`);
        } else {
          toast.error(res.message || "Lỗi tải danh sách Model");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi kết nối đến Backend");
      } finally {
        setIsFetching(prev => ({ ...prev, [providerId]: false }));
      }
    },
    []
  );

  return { fetchedModels, isFetching, fetchModels };
}
