/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";

/**
 * Hook để fetch danh sách model từ AI provider.
 * Đây là action call (POST), không phải data query
 * nên dùng useState + useCallback thay vì useMutation.
 */
import { useMutation } from "@tanstack/react-query";

export interface AiModelInfo {
  id: string;
  name: string;
  contextWindow?: number;
}

export function useAiFetchModels() {
  const [fetchedModels, setFetchedModels] = useState<Record<string, AiModelInfo[]>>({});
  const [isFetchingMap, setIsFetchingMap] = useState<Record<string, boolean>>({});

  const mutation = useMutation({
    mutationFn: async ({ providerType, apiKey, showToast }: { providerId: string; providerType: string; apiKey: string, showToast?: boolean }) => {
      const res = await apiClient.post("/ai/models", { provider: providerType, apiKey }) as any;
      if (!res.success) throw new Error(res.message || "Lỗi tải danh sách Model");
      return { data: res.data, showToast };
    },
    onMutate: (variables) => {
      setIsFetchingMap(prev => ({ ...prev, [variables.providerId]: true }));
    },
    onSuccess: (result, variables) => {
      setFetchedModels(prev => ({ ...prev, [variables.providerId]: result.data }));
      if (result.showToast !== false) {
        toast.success(`Đã tải ${result.data.length} model từ ${variables.providerType}!`);
      }
    },
    onError: (err: any, variables) => {
      toast.error(err.message || "Lỗi kết nối đến Backend");
    },
    onSettled: (_, __, variables) => {
      setIsFetchingMap(prev => ({ ...prev, [variables.providerId]: false }));
    }
  });

  const fetchModels = useCallback(
    (providerId: string, providerType: string, apiKey: string, showToast: boolean = true) => {
      if (!apiKey) {
        if (showToast) toast.error("Vui lòng nhập API Key trước khi tải danh sách Model!");
        return;
      }
      mutation.mutate({ providerId, providerType, apiKey, showToast });
    },
    [mutation]
  );

  return { fetchedModels, isFetching: isFetchingMap, fetchModels };
}
