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
    mutationFn: async ({ providerType, apiKey }: { providerId: string; providerType: string; apiKey: string }) => {
      const res = await apiClient.post("/ai/models", { provider: providerType, apiKey }) as any;
      if (!res.success) throw new Error(res.message || "Lỗi tải danh sách Model");
      return res.data;
    },
    onMutate: (variables) => {
      setIsFetchingMap(prev => ({ ...prev, [variables.providerId]: true }));
    },
    onSuccess: (data, variables) => {
      setFetchedModels(prev => ({ ...prev, [variables.providerId]: data }));
      toast.success(`Đã tải ${data.length} model từ ${variables.providerType}!`);
    },
    onError: (err: any, variables) => {
      toast.error(err.message || "Lỗi kết nối đến Backend");
    },
    onSettled: (_, __, variables) => {
      setIsFetchingMap(prev => ({ ...prev, [variables.providerId]: false }));
    }
  });

  const fetchModels = useCallback(
    (providerId: string, providerType: string, apiKey: string) => {
      if (!apiKey) {
        toast.error("Vui lòng nhập API Key trước khi tải danh sách Model!");
        return;
      }
      mutation.mutate({ providerId, providerType, apiKey });
    },
    [mutation]
  );

  return { fetchedModels, isFetching: isFetchingMap, fetchModels };
}
